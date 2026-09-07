// ============================================================
// MindBloom — Memory & Vector Types
// File: src/types/memory.ts
// ============================================================

export interface JournalVector {
  id:           string
  entry_id:     string
  user_id:      string
  content_hash: string        // SHA-256 of content, for dedup
  embedding:    number[]      // 1536-dim vector (text-embedding-3-small)
  content_text: string        // the text that was embedded
  entry_date:   string
  mood_score:   number | null
  mood_category:string | null
  created_at:   string
}

export interface SimilarJournal {
  entry_id:     string
  entry_date:   string
  mood_score:   number | null
  mood_category:string | null
  snippet:      string         // first 120 chars of main_story
  similarity:   number         // cosine similarity 0–1
  main_story:   string | null
}

export interface MemorySearchResult {
  query:           string
  results:         SimilarJournal[]
  total_searched:  number
}

export interface RAGContext {
  relevantMemories: SimilarJournal[]
  totalMemories:    number
}

// ── Embedding status tracking ─────────────────────────────────
export interface EmbeddingStatus {
  total_entries:   number
  embedded_entries:number
  pending:         number
  last_embedded_at:string | null
}
