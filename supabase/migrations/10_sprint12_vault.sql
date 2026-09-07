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
