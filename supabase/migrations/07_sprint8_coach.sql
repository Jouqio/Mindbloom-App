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
