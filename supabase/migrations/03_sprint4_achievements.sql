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
