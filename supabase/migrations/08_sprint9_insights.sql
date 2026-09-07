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
