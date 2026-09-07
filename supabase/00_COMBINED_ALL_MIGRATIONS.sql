-- ============================================================
-- MindBloom — COMBINED MIGRATION (Sprint 1 → 14 + Rate Limiting)
-- All CREATE POLICY statements are idempotent (safe to re-run)
-- Generated: Tue Jul 14 04:02:54 UTC 2026
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- FILE: 01_sprint1_auth.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 1 SQL Migration
-- File: supabase/migrations/01_sprint1_auth.sql
-- Base tables: profiles, auto-create trigger on signup
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── profiles ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  timezone        TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  locale          TEXT NOT NULL DEFAULT 'id',
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium','pro')),
  onboarded_at    TIMESTAMPTZ,
  last_active_at  TIMESTAMPTZ,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── user_preferences (referenced by onboarding flow, Sprint 2) ─
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  notif_reminder_time  TEXT        DEFAULT '21:00',
  notif_enabled        BOOLEAN     NOT NULL DEFAULT TRUE,
  theme                TEXT        NOT NULL DEFAULT 'system',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Auto-create profile on signup ──────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles','user_preferences');


-- ═══════════════════════════════════════════════════════════
-- FILE: 02_sprint3_journal.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 3 SQL Migration
-- File: supabase/migrations/sprint3_journal_tables.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions (skip if already run in Sprint 1) ─────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ── Enum types ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE mood_category_enum AS ENUM (
    'happy','calm','excited','anxious','stressed','emotional','tired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE device_platform_enum AS ENUM ('web','ios','android');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── journal_entries ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date           DATE        NOT NULL,
  device_platform      TEXT        DEFAULT 'web',

  -- Mood & Energy
  mood_score           SMALLINT    CHECK (mood_score BETWEEN 1 AND 10),
  mood_category        TEXT,
  energy_score         SMALLINT    CHECK (energy_score BETWEEN 0 AND 100),

  -- Journal content
  main_story           TEXT,
  main_story_tsv       TSVECTOR    GENERATED ALWAYS AS (
                         to_tsvector('indonesian', coalesce(main_story,''))
                       ) STORED,
  recurring_thoughts   TEXT,
  stress_source        TEXT,
  stress_intensity     SMALLINT    CHECK (stress_intensity BETWEEN 0 AND 10),
  happy_moments        TEXT,
  lessons_learned      TEXT,
  did_well             TEXT,
  improve_on           TEXT,
  do_differently       TEXT,
  self_compassion      TEXT,
  tomorrow_intention   TEXT,
  prayer_hope          TEXT,

  -- Metadata
  word_count           INTEGER     NOT NULL DEFAULT 0,
  completion_pct       SMALLINT    NOT NULL DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
  is_draft             BOOLEAN     NOT NULL DEFAULT TRUE,
  draft_step           SMALLINT    CHECK (draft_step BETWEEN 1 AND 15),
  is_deleted           BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at           TIMESTAMPTZ,
  written_duration_sec INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One entry per user per date
  CONSTRAINT journal_entries_user_date_unique UNIQUE (user_id, entry_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
  ON public.journal_entries (user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_draft
  ON public.journal_entries (user_id, is_draft)
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_journal_entries_tsv
  ON public.journal_entries USING GIN (main_story_tsv);

-- RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own journal entries" ON public.journal_entries;
CREATE POLICY "Users can manage own journal entries"
  ON public.journal_entries
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── journal_emotions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_emotions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID        NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emotion     TEXT        NOT NULL,
  category    TEXT        NOT NULL DEFAULT 'general',
  valence     TEXT        NOT NULL DEFAULT 'neutral',
  color_hex   TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_emotions_entry
  ON public.journal_emotions (entry_id);

ALTER TABLE public.journal_emotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own journal emotions" ON public.journal_emotions;
CREATE POLICY "Users can manage own journal emotions"
  ON public.journal_emotions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── gratitude_items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gratitude_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID        NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gratitude_items_entry
  ON public.gratitude_items (entry_id, sort_order);

ALTER TABLE public.gratitude_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own gratitude items" ON public.gratitude_items;
CREATE POLICY "Users can manage own gratitude items"
  ON public.gratitude_items
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── streaks ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.streaks (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak   INTEGER     NOT NULL DEFAULT 0,
  longest_streak   INTEGER     NOT NULL DEFAULT 0,
  total_entries    INTEGER     NOT NULL DEFAULT 0,
  last_entry_date  DATE,
  streak_started_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streak" ON public.streaks;
CREATE POLICY "Users can view own streak"
  ON public.streaks FOR SELECT USING (auth.uid() = user_id);

-- ── Trigger: update streak on journal save ────────────────────
CREATE OR REPLACE FUNCTION public.update_streak_on_journal_save()
RETURNS TRIGGER AS $$
DECLARE
  v_yesterday     DATE := CURRENT_DATE - INTERVAL '1 day';
  v_streak_rec    RECORD;
BEGIN
  -- Only update streak when finalizing (is_draft: TRUE → FALSE)
  IF NEW.is_draft = FALSE AND (OLD.is_draft = TRUE OR OLD IS NULL) THEN

    SELECT * INTO v_streak_rec
    FROM public.streaks
    WHERE user_id = NEW.user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO public.streaks (user_id, current_streak, longest_streak, total_entries, last_entry_date, streak_started_at)
      VALUES (NEW.user_id, 1, 1, 1, NEW.entry_date, NOW());
    ELSE
      IF v_streak_rec.last_entry_date = v_yesterday THEN
        -- Continue streak
        UPDATE public.streaks SET
          current_streak   = current_streak + 1,
          longest_streak   = GREATEST(longest_streak, current_streak + 1),
          total_entries    = total_entries + 1,
          last_entry_date  = NEW.entry_date,
          updated_at       = NOW()
        WHERE user_id = NEW.user_id;
      ELSIF v_streak_rec.last_entry_date < v_yesterday THEN
        -- Streak broken — restart
        UPDATE public.streaks SET
          current_streak   = 1,
          total_entries    = total_entries + 1,
          last_entry_date  = NEW.entry_date,
          streak_started_at = NOW(),
          updated_at       = NOW()
        WHERE user_id = NEW.user_id;
      ELSIF v_streak_rec.last_entry_date = NEW.entry_date THEN
        -- Same day re-submit — just update total if needed
        UPDATE public.streaks SET
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSE
        -- First entry ever
        UPDATE public.streaks SET
          current_streak   = 1,
          longest_streak   = GREATEST(longest_streak, 1),
          total_entries    = total_entries + 1,
          last_entry_date  = NEW.entry_date,
          streak_started_at = NOW(),
          updated_at       = NOW()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_streak ON public.journal_entries;
CREATE TRIGGER trg_update_streak
  AFTER INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_journal_save();

-- ── user_xp (needed for dashboard) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.user_xp (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp      INTEGER     NOT NULL DEFAULT 0,
  current_level INTEGER     NOT NULL DEFAULT 1,
  xp_to_next    INTEGER     NOT NULL DEFAULT 100,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own XP" ON public.user_xp;
CREATE POLICY "Users can view own XP"
  ON public.user_xp FOR SELECT USING (auth.uid() = user_id);

-- ── Trigger: award XP on journal save ────────────────────────
CREATE OR REPLACE FUNCTION public.award_journal_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_draft = FALSE AND (OLD.is_draft = TRUE OR OLD IS NULL) THEN
    INSERT INTO public.user_xp (user_id, total_xp, current_level, xp_to_next)
    VALUES (NEW.user_id, 10, 1, 100)
    ON CONFLICT (user_id) DO UPDATE SET
      total_xp   = user_xp.total_xp + 10,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_award_journal_xp ON public.journal_entries;
CREATE TRIGGER trg_award_journal_xp
  AFTER INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.award_journal_xp();

-- ── Verify setup ──────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'journal_entries', 'journal_emotions',
    'gratitude_items', 'streaks', 'user_xp'
  )
ORDER BY tablename;


-- ═══════════════════════════════════════════════════════════
-- FILE: 03_sprint4_achievements.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 4 SQL Migration
-- File: supabase/sprint4_achievements.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── achievement_definitions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,
  name             TEXT        NOT NULL,
  description      TEXT        NOT NULL,
  icon             TEXT        NOT NULL DEFAULT '🏆',
  category         TEXT        NOT NULL,
  rarity           TEXT        NOT NULL DEFAULT 'common'
                               CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  condition_type   TEXT        NOT NULL,
  condition_value  INTEGER,
  condition_meta   JSONB       DEFAULT '{}',
  xp_reward        INTEGER     NOT NULL DEFAULT 10,
  is_hidden        BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Achievement definitions are public readable" ON public.achievement_definitions;
CREATE POLICY "Achievement definitions are public readable"
  ON public.achievement_definitions FOR SELECT USING (TRUE);

-- ── user_achievements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id   UUID        NOT NULL REFERENCES public.achievement_definitions(id),
  earned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context          JSONB       DEFAULT '{}',
  notified         BOOLEAN     NOT NULL DEFAULT FALSE,

  CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user
  ON public.user_achievements (user_id, earned_at DESC);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Server can insert achievements" ON public.user_achievements;
CREATE POLICY "Server can insert achievements"
  ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update notified flag" ON public.user_achievements;
CREATE POLICY "Users can update notified flag"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── user_xp (update if exists from Sprint 3) ─────────────────
CREATE TABLE IF NOT EXISTS public.user_xp (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp      INTEGER     NOT NULL DEFAULT 0,
  current_level INTEGER     NOT NULL DEFAULT 1,
  xp_to_next    INTEGER     NOT NULL DEFAULT 100,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own XP" ON public.user_xp;
CREATE POLICY "Users can view own XP"
  ON public.user_xp FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own XP" ON public.user_xp;
CREATE POLICY "Users can update own XP"
  ON public.user_xp FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Seed achievement definitions ──────────────────────────────
INSERT INTO public.achievement_definitions
  (slug, name, description, icon, category, rarity,
   condition_type, condition_value, xp_reward, is_hidden, sort_order)
VALUES
  -- Streak
  ('streak_3',        'Mulai Bergerak',      'Tulis jurnal 3 hari berturut-turut',
   '🔥','streak','common',   'streak_days',   3,   30, FALSE, 1),
  ('streak_7',        'Seminggu Konsisten',  'Tulis jurnal 7 hari berturut-turut',
   '🔥','streak','common',   'streak_days',   7,   70, FALSE, 2),
  ('streak_14',       'Dua Minggu Kuat',     'Tulis jurnal 14 hari berturut-turut',
   '💪','streak','uncommon', 'streak_days',   14, 140, FALSE, 3),
  ('streak_30',       'Sebulan Penuh',       'Tulis jurnal 30 hari berturut-turut',
   '🌟','streak','rare',     'streak_days',   30, 300, FALSE, 4),
  ('streak_60',       'Dua Bulan Juara',     'Tulis jurnal 60 hari berturut-turut',
   '👑','streak','epic',     'streak_days',   60, 600, FALSE, 5),
  ('streak_90',       'Identitas Baru',      'Tulis jurnal 90 hari berturut-turut',
   '🏆','streak','legendary','streak_days',   90, 900, FALSE, 6),
  -- Entries
  ('entries_1',       'Langkah Pertama',     'Tulis jurnal pertamamu',
   '🌱','reflection','common',  'total_entries', 1,   10, FALSE, 7),
  ('entries_10',      'Pembuat Kebiasaan',   'Tulis 10 jurnal',
   '📝','reflection','common',  'total_entries', 10,  50, FALSE, 8),
  ('entries_25',      'Penulis Serius',      'Tulis 25 jurnal',
   '✍️','reflection','uncommon','total_entries', 25, 125, FALSE, 9),
  ('entries_50',      'Pertumbuhan Nyata',   'Tulis 50 jurnal',
   '🌳','reflection','rare',    'total_entries', 50, 250, FALSE, 10),
  ('entries_100',     'Penjaga Pikiran',     'Tulis 100 jurnal',
   '💎','reflection','epic',    'total_entries',100, 500, FALSE, 11),
  -- Gratitude
  ('gratitude_first', 'Hatiku Bersyukur',   'Tulis jurnal syukur pertama',
   '🙏','gratitude','common',   'gratitude_entry', 1,  15, FALSE, 12),
  ('gratitude_5_items','Dermawan Syukur',   'Tulis 5 hal syukur dalam satu jurnal',
   '💛','gratitude','uncommon', 'gratitude_items', 5,  40, FALSE, 13),
  -- Completion
  ('perfect_journal', 'Refleksi Mendalam',  'Selesaikan jurnal dengan 90%+ kelengkapan',
   '⭐','consistency','uncommon','completion_pct', 90, 50, FALSE, 14),
  -- Growth
  ('level_5',         'Setengah Jalan',     'Capai level 5',
   '🎯','growth','rare',     'xp_level', 5,  100, FALSE, 15),
  ('level_10',        'Guru Refleksi',      'Capai level 10 — puncak perjalanan',
   '🎓','growth','legendary','xp_level', 10, 500, TRUE,  16)
ON CONFLICT (slug) DO NOTHING;

-- ── Function: check and award achievements after journal save ─
CREATE OR REPLACE FUNCTION public.check_achievements_after_journal(
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_streak       RECORD;
  v_xp           RECORD;
  v_entry_count  INTEGER;
  v_grat_count   INTEGER;
  v_max_complet  INTEGER;
  v_def          RECORD;
  v_already      BOOLEAN;
  v_xp_reward    INTEGER := 0;
BEGIN
  -- Get current state
  SELECT * INTO v_streak FROM public.streaks WHERE user_id = p_user_id;
  SELECT * INTO v_xp     FROM public.user_xp   WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_entry_count
  FROM public.journal_entries
  WHERE user_id = p_user_id AND is_draft = FALSE AND is_deleted = FALSE;

  SELECT COUNT(*) INTO v_grat_count
  FROM public.gratitude_items gi
  JOIN public.journal_entries je ON je.id = gi.entry_id
  WHERE je.user_id = p_user_id;

  SELECT COALESCE(MAX(completion_pct), 0) INTO v_max_complet
  FROM public.journal_entries
  WHERE user_id = p_user_id AND is_draft = FALSE;

  -- Loop through all definitions
  FOR v_def IN
    SELECT * FROM public.achievement_definitions ORDER BY sort_order
  LOOP
    -- Check if already earned
    SELECT EXISTS(
      SELECT 1 FROM public.user_achievements
      WHERE user_id = p_user_id AND achievement_id = v_def.id
    ) INTO v_already;

    IF v_already THEN CONTINUE; END IF;

    -- Check condition
    CASE v_def.condition_type
      WHEN 'streak_days' THEN
        IF COALESCE(v_streak.current_streak, 0) >= v_def.condition_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, notified)
          VALUES (p_user_id, v_def.id, FALSE)
          ON CONFLICT DO NOTHING;
          v_xp_reward := v_xp_reward + v_def.xp_reward;
        END IF;

      WHEN 'total_entries' THEN
        IF v_entry_count >= v_def.condition_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, notified)
          VALUES (p_user_id, v_def.id, FALSE)
          ON CONFLICT DO NOTHING;
          v_xp_reward := v_xp_reward + v_def.xp_reward;
        END IF;

      WHEN 'gratitude_entry' THEN
        IF v_entry_count >= 1 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, notified)
          VALUES (p_user_id, v_def.id, FALSE)
          ON CONFLICT DO NOTHING;
          v_xp_reward := v_xp_reward + v_def.xp_reward;
        END IF;

      WHEN 'gratitude_items' THEN
        IF v_grat_count >= v_def.condition_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, notified)
          VALUES (p_user_id, v_def.id, FALSE)
          ON CONFLICT DO NOTHING;
          v_xp_reward := v_xp_reward + v_def.xp_reward;
        END IF;

      WHEN 'completion_pct' THEN
        IF v_max_complet >= v_def.condition_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, notified)
          VALUES (p_user_id, v_def.id, FALSE)
          ON CONFLICT DO NOTHING;
          v_xp_reward := v_xp_reward + v_def.xp_reward;
        END IF;

      ELSE NULL;
    END CASE;
  END LOOP;

  -- Award accumulated XP
  IF v_xp_reward > 0 THEN
    INSERT INTO public.user_xp (user_id, total_xp, current_level, xp_to_next)
    VALUES (p_user_id, v_xp_reward, 1, 100)
    ON CONFLICT (user_id) DO UPDATE SET
      total_xp   = user_xp.total_xp + v_xp_reward,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger: call check_achievements after journal finalized ──
CREATE OR REPLACE FUNCTION public.trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_draft = FALSE AND (OLD IS NULL OR OLD.is_draft = TRUE) THEN
    PERFORM public.check_achievements_after_journal(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_achievements ON public.journal_entries;
CREATE TRIGGER trg_check_achievements
  AFTER INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.trigger_check_achievements();

-- ── Verify ────────────────────────────────────────────────────
SELECT slug, name, rarity, xp_reward
FROM public.achievement_definitions
ORDER BY sort_order;


-- ═══════════════════════════════════════════════════════════
-- FILE: 04_sprint5_garden.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 5 SQL Migration
-- File: supabase/sprint5_garden.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── garden_plants ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.garden_plants (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_id       UUID        REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  plant_type     TEXT        NOT NULL DEFAULT 'fern',
  stage          TEXT        NOT NULL DEFAULT 'sprout'
                             CHECK (stage IN ('seed','sprout','growing','bloom','full')),
  mood_score     SMALLINT,
  mood_category  TEXT,
  position_x     NUMERIC(5,2) NOT NULL DEFAULT 50,
  position_y     NUMERIC(5,2) NOT NULL DEFAULT 20,
  is_rare        BOOLEAN     NOT NULL DEFAULT FALSE,
  planted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bloomed_at     TIMESTAMPTZ,
  entry_date     DATE,
  note           TEXT,

  CONSTRAINT garden_plants_entry_unique UNIQUE (entry_id)
);

CREATE INDEX IF NOT EXISTS idx_garden_plants_user
  ON public.garden_plants (user_id, planted_at);

ALTER TABLE public.garden_plants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own garden plants" ON public.garden_plants;
CREATE POLICY "Users can manage own garden plants"
  ON public.garden_plants
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Function: auto-grow plant on journal finalize ─────────────
CREATE OR REPLACE FUNCTION public.grow_plant_from_journal()
RETURNS TRIGGER AS $$
DECLARE
  v_streak       INTEGER;
  v_total        INTEGER;
  v_plant_type   TEXT;
  v_is_rare      BOOLEAN := FALSE;
  v_stage        TEXT;
  v_pos_x        NUMERIC;
  v_pos_y        NUMERIC;
  v_mood_map     JSONB := '{
    "happy":"sunflower","excited":"sunflower","calm":"lotus",
    "anxious":"fern","stressed":"cactus","tired":"willow","emotional":"lavender"
  }'::JSONB;
BEGIN
  -- Only run when finalizing draft → final
  IF NEW.is_draft = FALSE AND (OLD IS NULL OR OLD.is_draft = TRUE) THEN

    -- Skip if plant already exists for this entry
    IF EXISTS (SELECT 1 FROM public.garden_plants WHERE entry_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- Get streak
    SELECT current_streak INTO v_streak
    FROM public.streaks WHERE user_id = NEW.user_id;
    v_streak := COALESCE(v_streak, 0);

    -- Get total entries
    SELECT COUNT(*) INTO v_total
    FROM public.journal_entries
    WHERE user_id = NEW.user_id AND is_draft = FALSE AND is_deleted = FALSE;

    -- Determine plant type
    IF v_streak > 0 AND v_streak % 7 = 0 THEN
      v_plant_type := 'bamboo';
    ELSIF COALESCE(NEW.completion_pct, 0) >= 95 THEN
      v_plant_type := 'lavender';
      IF random() < 0.15 THEN
        v_plant_type := 'bonsai';
        v_is_rare := TRUE;
      END IF;
    ELSIF NEW.mood_category IS NOT NULL AND v_mood_map ? NEW.mood_category THEN
      v_plant_type := v_mood_map ->> NEW.mood_category;
    ELSE
      v_plant_type := 'fern';
    END IF;

    -- Rare sakura on every 10th entry (40% chance)
    IF v_total > 0 AND v_total % 10 = 0 AND random() < 0.4 THEN
      v_plant_type := 'sakura';
      v_is_rare := TRUE;
    END IF;

    -- Determine stage from mood score
    v_stage := CASE
      WHEN NEW.mood_score IS NULL THEN 'sprout'
      WHEN NEW.mood_score >= 8 THEN 'full'
      WHEN NEW.mood_score >= 6 THEN 'bloom'
      WHEN NEW.mood_score >= 4 THEN 'growing'
      ELSE 'sprout'
    END;

    -- Random position
    v_pos_x := 10 + random() * 80;
    v_pos_y := 5  + random() * 35;

    INSERT INTO public.garden_plants (
      user_id, entry_id, plant_type, stage,
      mood_score, mood_category, position_x, position_y,
      is_rare, planted_at, bloomed_at, entry_date
    ) VALUES (
      NEW.user_id, NEW.id, v_plant_type, v_stage,
      NEW.mood_score, NEW.mood_category, v_pos_x, v_pos_y,
      v_is_rare, NOW(),
      CASE WHEN v_stage IN ('bloom','full') THEN NOW() ELSE NULL END,
      NEW.entry_date
    )
    ON CONFLICT (entry_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_grow_plant ON public.journal_entries;
CREATE TRIGGER trg_grow_plant
  AFTER INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.grow_plant_from_journal();

-- ── Verify ────────────────────────────────────────────────────
SELECT
  schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'garden_plants';


-- ═══════════════════════════════════════════════════════════
-- FILE: 05_sprint6_breathing_soundscape.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 6 SQL Migration
-- File: supabase/sprint6_breathing_soundscape.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── breathing_sessions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.breathing_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_id       TEXT        NOT NULL DEFAULT 'box'
                               CHECK (pattern_id IN ('box','calm478','coherent','energize')),
  cycles_completed INTEGER     NOT NULL DEFAULT 0,
  duration_sec     INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user
  ON public.breathing_sessions (user_id, created_at DESC);

ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own breathing sessions" ON public.breathing_sessions;
CREATE POLICY "Users can manage own breathing sessions"
  ON public.breathing_sessions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── soundscape_presets (optional — user custom presets) ──────
CREATE TABLE IF NOT EXISTS public.soundscape_presets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  mix         JSONB       NOT NULL DEFAULT '{}',  -- { "rain": 60, "wind": 30 }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.soundscape_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own soundscape presets" ON public.soundscape_presets;
CREATE POLICY "Users can manage own soundscape presets"
  ON public.soundscape_presets
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('breathing_sessions', 'soundscape_presets');


-- ═══════════════════════════════════════════════════════════
-- FILE: 06_sprint7_habits_lifewheel.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 7 SQL Migration
-- File: supabase/sprint7_habits_lifewheel.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── habits ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habits (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name               TEXT        NOT NULL,
  emoji              TEXT        NOT NULL DEFAULT '💪',
  category           TEXT        NOT NULL DEFAULT 'health'
                                 CHECK (category IN ('health','mindfulness','productivity','social','learning','creativity')),
  frequency          TEXT        NOT NULL DEFAULT 'daily'
                                 CHECK (frequency IN ('daily','weekdays','weekends','custom')),
  custom_days        INTEGER[],
  target_count       INTEGER     NOT NULL DEFAULT 1,
  unit               TEXT,
  color              TEXT        NOT NULL DEFAULT '#7F77DD',
  is_archived        BOOLEAN     NOT NULL DEFAULT FALSE,
  current_streak     INTEGER     NOT NULL DEFAULT 0,
  longest_streak     INTEGER     NOT NULL DEFAULT 0,
  total_completions  INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user
  ON public.habits (user_id, is_archived, created_at);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;
CREATE POLICY "Users can manage own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── habit_logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID        NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date    DATE        NOT NULL,
  completed   BOOLEAN     NOT NULL DEFAULT FALSE,
  count       INTEGER     NOT NULL DEFAULT 1,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT habit_logs_unique UNIQUE (habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date
  ON public.habit_logs (user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit
  ON public.habit_logs (habit_id, log_date DESC);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own habit logs" ON public.habit_logs;
CREATE POLICY "Users can manage own habit logs"
  ON public.habit_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── life_wheel_entries ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.life_wheel_entries (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scores     JSONB       NOT NULL DEFAULT '{}',
  notes      JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_wheel_user
  ON public.life_wheel_entries (user_id, created_at DESC);

ALTER TABLE public.life_wheel_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own life wheel entries" ON public.life_wheel_entries;
CREATE POLICY "Users can manage own life wheel entries"
  ON public.life_wheel_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Trigger: auto-update habit updated_at ────────────────────
CREATE OR REPLACE FUNCTION public.update_habit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_habits_updated_at ON public.habits;
CREATE TRIGGER trg_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_habit_updated_at();

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('habits', 'habit_logs', 'life_wheel_entries');


-- ═══════════════════════════════════════════════════════════
-- FILE: 07_sprint8_coach.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 8 SQL Migration
-- File: supabase/sprint8_coach.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── coach_sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coach_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT,
  message_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_sessions_user
  ON public.coach_sessions (user_id, updated_at DESC);

ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own coach sessions" ON public.coach_sessions;
CREATE POLICY "Users can manage own coach sessions"
  ON public.coach_sessions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── coach_messages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID        NOT NULL REFERENCES public.coach_sessions(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user','assistant','system')),
  content    TEXT        NOT NULL,
  tokens     INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_messages_session
  ON public.coach_messages (session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_coach_messages_user
  ON public.coach_messages (user_id, created_at DESC);

ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own coach messages" ON public.coach_messages;
CREATE POLICY "Users can manage own coach messages"
  ON public.coach_messages FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Auto-update session updated_at ───────────────────────────
CREATE OR REPLACE FUNCTION public.update_coach_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coach_sessions
  SET updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_coach_session_updated ON public.coach_messages;
CREATE TRIGGER trg_coach_session_updated
  AFTER INSERT ON public.coach_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_coach_session_timestamp();

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('coach_sessions','coach_messages');


-- ═══════════════════════════════════════════════════════════
-- FILE: 08_sprint9_insights.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 9 SQL Migration
-- File: supabase/sprint9_insights.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── ei_scores ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ei_scores (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scores       JSONB       NOT NULL DEFAULT '{}',
  overall      NUMERIC(4,2) NOT NULL DEFAULT 5.0,
  week_start   DATE        NOT NULL,
  entry_count  INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ei_scores_user_week_unique UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_ei_scores_user
  ON public.ei_scores (user_id, created_at DESC);

ALTER TABLE public.ei_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own EI scores" ON public.ei_scores;
CREATE POLICY "Users can manage own EI scores"
  ON public.ei_scores FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── insight_cards ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insight_cards (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category      TEXT        NOT NULL DEFAULT 'weekly_summary',
  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL,
  emoji         TEXT        NOT NULL DEFAULT '✨',
  stat_value    TEXT,
  stat_label    TEXT,
  action_label  TEXT,
  action_url    TEXT,
  priority      TEXT        NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('high','medium','low')),
  seen_at       TIMESTAMPTZ,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_insight_cards_user_valid
  ON public.insight_cards (user_id, valid_until DESC, priority);

CREATE INDEX IF NOT EXISTS idx_insight_cards_unseen
  ON public.insight_cards (user_id, seen_at)
  WHERE seen_at IS NULL;

ALTER TABLE public.insight_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own insight cards" ON public.insight_cards;
CREATE POLICY "Users can manage own insight cards"
  ON public.insight_cards FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Cleanup: auto-delete expired insight cards (optional) ──────
CREATE OR REPLACE FUNCTION public.cleanup_expired_insights()
RETURNS void AS $$
BEGIN
  DELETE FROM public.insight_cards
  WHERE valid_until < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule via pg_cron if available (optional):
-- SELECT cron.schedule('cleanup-insights', '0 3 * * *', 'SELECT public.cleanup_expired_insights()');

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ei_scores','insight_cards');


-- ═══════════════════════════════════════════════════════════
-- FILE: 09_sprint10_memory.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 10 SQL Migration
-- File: supabase/sprint10_memory.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable pgvector (if not already) ─────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── journal_vectors ───────────────────────────────────────────
-- Stores semantic embeddings for each journal entry
CREATE TABLE IF NOT EXISTS public.journal_vectors (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      UUID        NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_hash  TEXT        NOT NULL,            -- SHA-256 for dedup
  embedding     vector(1536) NOT NULL,           -- text-embedding-3-small output
  content_text  TEXT        NOT NULL,            -- embedded text (truncated)
  entry_date    DATE,
  mood_score    SMALLINT,
  mood_category TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT journal_vectors_entry_unique UNIQUE (entry_id)
);

-- Standard index for user filtering
CREATE INDEX IF NOT EXISTS idx_journal_vectors_user
  ON public.journal_vectors (user_id);

-- pgvector index (IVFFlat — fast approximate nearest neighbor)
-- lists = sqrt(total_rows) — use 10 as safe default for small datasets
-- Recreate with more lists as data grows (100 lists for 10K+ rows)
CREATE INDEX IF NOT EXISTS idx_journal_vectors_embedding
  ON public.journal_vectors
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

ALTER TABLE public.journal_vectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own journal vectors" ON public.journal_vectors;
CREATE POLICY "Users can manage own journal vectors"
  ON public.journal_vectors FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Semantic search RPC function ─────────────────────────────
-- Called by retriever.ts → supabase.rpc('search_journal_memories', ...)
CREATE OR REPLACE FUNCTION public.search_journal_memories(
  p_user_id        UUID,
  p_query_embedding vector(1536),
  p_match_count     INT     DEFAULT 5,
  p_min_similarity  FLOAT   DEFAULT 0.55,
  p_exclude_entry   UUID    DEFAULT NULL
)
RETURNS TABLE (
  entry_id      UUID,
  entry_date    DATE,
  mood_score    SMALLINT,
  mood_category TEXT,
  main_story    TEXT,
  similarity    FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    je.id                             AS entry_id,
    je.entry_date                     AS entry_date,
    je.mood_score                     AS mood_score,
    je.mood_category                  AS mood_category,
    je.main_story                     AS main_story,
    1 - (jv.embedding <=> p_query_embedding) AS similarity
  FROM public.journal_vectors jv
  JOIN public.journal_entries je ON je.id = jv.entry_id
  WHERE
    jv.user_id = p_user_id
    AND je.is_deleted = FALSE
    AND je.is_draft   = FALSE
    AND (p_exclude_entry IS NULL OR jv.entry_id != p_exclude_entry)
    AND 1 - (jv.embedding <=> p_query_embedding) >= p_min_similarity
  ORDER BY jv.embedding <=> p_query_embedding  -- cosine distance ASC = similarity DESC
  LIMIT p_match_count;
END;
$$;

-- ── Auto-embed trigger (optional) ────────────────────────────
-- Marks entries as needing re-embedding when updated
-- (actual embedding is done via API call, not in DB)
CREATE TABLE IF NOT EXISTS public.embedding_queue (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID        NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  queued_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status     TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','error')),

  CONSTRAINT embedding_queue_entry_unique UNIQUE (entry_id)
);

ALTER TABLE public.embedding_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own embedding queue" ON public.embedding_queue;
CREATE POLICY "Users can view own embedding queue"
  ON public.embedding_queue FOR SELECT USING (auth.uid() = user_id);

-- Trigger: auto-queue journal entries for embedding when finalized
CREATE OR REPLACE FUNCTION public.queue_for_embedding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_draft = FALSE AND (OLD IS NULL OR OLD.is_draft = TRUE) THEN
    INSERT INTO public.embedding_queue (entry_id, user_id)
    VALUES (NEW.id, NEW.user_id)
    ON CONFLICT (entry_id) DO UPDATE SET
      status    = 'pending',
      queued_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_queue_embedding ON public.journal_entries;
CREATE TRIGGER trg_queue_embedding
  AFTER INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.queue_for_embedding();

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('journal_vectors','embedding_queue');

-- Test the function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'search_journal_memories';


-- ═══════════════════════════════════════════════════════════
-- FILE: 10_sprint12_vault.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 12 SQL Migration
-- File: supabase/sprint12_vault.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── monthly_narratives ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.monthly_narratives (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year          INTEGER     NOT NULL,
  month         INTEGER     NOT NULL CHECK (month BETWEEN 1 AND 12),
  month_label   TEXT        NOT NULL,
  narrative     TEXT        NOT NULL,
  highlights    JSONB       NOT NULL DEFAULT '[]',
  mood_summary  TEXT,
  top_emotions  JSONB       NOT NULL DEFAULT '[]',
  avg_mood      NUMERIC(4,2),
  entry_count   INTEGER     NOT NULL DEFAULT 0,
  word_count    INTEGER     NOT NULL DEFAULT 0,
  cover_emoji   TEXT        NOT NULL DEFAULT '📖',
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_generating BOOLEAN     NOT NULL DEFAULT FALSE,

  CONSTRAINT monthly_narratives_user_month_unique UNIQUE (user_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_narratives_user
  ON public.monthly_narratives (user_id, year DESC, month DESC);

ALTER TABLE public.monthly_narratives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own monthly narratives" ON public.monthly_narratives;
CREATE POLICY "Users can manage own monthly narratives"
  ON public.monthly_narratives FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Helper: get month summary for a user ─────────────────────
CREATE OR REPLACE FUNCTION public.get_month_summary(
  p_user_id UUID,
  p_year    INTEGER,
  p_month   INTEGER
)
RETURNS TABLE (
  entry_count  BIGINT,
  avg_mood     NUMERIC,
  total_words  BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start DATE := make_date(p_year, p_month, 1);
  v_end   DATE := (make_date(p_year, p_month, 1) + INTERVAL '1 month - 1 day')::DATE;
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT                        AS entry_count,
    ROUND(AVG(mood_score)::NUMERIC, 2)     AS avg_mood,
    COALESCE(SUM(word_count), 0)::BIGINT   AS total_words
  FROM public.journal_entries
  WHERE
    user_id    = p_user_id
    AND is_draft   = FALSE
    AND is_deleted = FALSE
    AND entry_date BETWEEN v_start AND v_end;
END;
$$;

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'monthly_narratives';

SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_month_summary';


-- ═══════════════════════════════════════════════════════════
-- FILE: 11_sprint14_payment.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Sprint 14 SQL Migration (FINAL SPRINT)
-- File: supabase/sprint14_payment.sql
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── user_subscriptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id             TEXT        NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free','premium','pro')),
  status              TEXT        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active','trialing','past_due','canceled','expired')),
  billing_cycle       TEXT        CHECK (billing_cycle IN ('monthly','yearly')),
  trial_ends_at       TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  midtrans_subscription_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON public.user_subscriptions (user_id, status);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role (webhook) needs full access — handled via service_role key bypass of RLS

-- ── payment_transactions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id            TEXT        NOT NULL CHECK (plan_id IN ('free','premium','pro')),
  billing_cycle      TEXT        NOT NULL CHECK (billing_cycle IN ('monthly','yearly')),
  amount             INTEGER     NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','settlement','expire','cancel','deny','failure')),
  midtrans_order_id  TEXT        NOT NULL UNIQUE,
  midtrans_token     TEXT,
  payment_type       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user
  ON public.payment_transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order
  ON public.payment_transactions (midtrans_order_id);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.payment_transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Add plan column to profiles (if not exists from Sprint 1) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free','premium','pro'));

-- ── Auto-downgrade expired subscriptions (run daily via cron) ──
CREATE OR REPLACE FUNCTION public.downgrade_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Downgrade subscriptions past their period end
  UPDATE public.user_subscriptions
  SET
    status  = 'expired',
    plan_id = 'free',
    updated_at = NOW()
  WHERE
    status IN ('active', 'canceled')
    AND current_period_end IS NOT NULL
    AND current_period_end < NOW();

  -- Sync profiles.plan for expired subscriptions
  UPDATE public.profiles p
  SET plan = 'free', updated_at = NOW()
  FROM public.user_subscriptions s
  WHERE
    p.id = s.user_id
    AND s.status = 'expired'
    AND p.plan != 'free';

  -- Downgrade expired trials that never converted to paid
  UPDATE public.user_subscriptions
  SET
    status  = 'expired',
    plan_id = 'free',
    updated_at = NOW()
  WHERE
    status = 'trialing'
    AND trial_ends_at < NOW();

  UPDATE public.profiles p
  SET plan = 'free', updated_at = NOW()
  FROM public.user_subscriptions s
  WHERE
    p.id = s.user_id
    AND s.status = 'expired'
    AND s.plan_id = 'free'
    AND p.plan != 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule via pg_cron (if extension available):
-- SELECT cron.schedule('downgrade-expired-subs', '0 1 * * *', 'SELECT public.downgrade_expired_subscriptions()');

-- ── Trigger: keep profiles.plan in sync on subscription changes ─
CREATE OR REPLACE FUNCTION public.sync_profile_plan()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('active', 'trialing') THEN
    UPDATE public.profiles SET plan = NEW.plan_id, updated_at = NOW() WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('expired', 'canceled') AND
        (NEW.current_period_end IS NULL OR NEW.current_period_end < NOW()) THEN
    UPDATE public.profiles SET plan = 'free', updated_at = NOW() WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_plan ON public.user_subscriptions;
CREATE TRIGGER trg_sync_profile_plan
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan();

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_subscriptions','payment_transactions');

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'plan';


-- ═══════════════════════════════════════════════════════════
-- FILE: 12_ratelimit.sql
-- ═══════════════════════════════════════════════════════════
-- ============================================================
-- MindBloom — Rate Limiting Migration
-- File: supabase/migrations/12_ratelimit.sql
-- ============================================================

-- ── rate_limit_counters ───────────────────────────────────────
-- One row per (user, bucket, window). Old windows just accumulate
-- until cleaned up — see cleanup function below.
CREATE TABLE IF NOT EXISTS public.rate_limit_counters (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bucket_key    TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  request_count INTEGER     NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT rate_limit_counters_unique UNIQUE (user_id, bucket_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON public.rate_limit_counters (user_id, bucket_key, window_start DESC);

-- Speeds up the cleanup job's WHERE clause
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start
  ON public.rate_limit_counters (window_start);

ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- No end-user policies on purpose: only the service-role client
-- (used server-side in rateLimiter.ts) touches this table. Regular
-- users have zero access, which is what we want — this isn't user
-- data, it's an internal abuse-prevention mechanism.

-- ── Atomic increment-and-read RPC ──────────────────────────────
-- Does the upsert + increment + read in a single round trip, and
-- SECURITY DEFINER means it runs with the function owner's
-- privileges (bypassing the deliberately-policy-less RLS above)
-- without needing to expose the service role key logic in SQL.
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_user_id      UUID,
  p_bucket_key   TEXT,
  p_window_start TIMESTAMPTZ
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.rate_limit_counters (user_id, bucket_key, window_start, request_count)
  VALUES (p_user_id, p_bucket_key, p_window_start, 1)
  ON CONFLICT (user_id, bucket_key, window_start)
  DO UPDATE SET
    request_count = public.rate_limit_counters.request_count + 1,
    updated_at    = NOW()
  RETURNING request_count INTO v_count;

  RETURN v_count;
END;
$$;

-- ── Cleanup job: delete counters older than 24h ────────────────
-- Keeps the table small. Call this on a schedule (see note below).
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limit_counters
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$;

-- Schedule via pg_cron if available (optional, table stays small
-- either way since windows are at most 1 hour in our configs):
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT public.cleanup_rate_limit_counters()');

-- ── Verify ────────────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'rate_limit_counters';

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('increment_rate_limit', 'cleanup_rate_limit_counters');

