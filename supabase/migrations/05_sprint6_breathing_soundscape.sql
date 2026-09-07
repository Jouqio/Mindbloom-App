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
