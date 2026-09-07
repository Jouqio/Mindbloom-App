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
