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
