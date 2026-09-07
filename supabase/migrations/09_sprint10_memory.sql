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
