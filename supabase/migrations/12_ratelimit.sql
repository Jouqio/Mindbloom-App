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
