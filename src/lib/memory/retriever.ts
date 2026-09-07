// ============================================================
// MindBloom — Memory Retriever
// File: src/lib/memory/retriever.ts
// Semantic search using pgvector cosine similarity
// ============================================================

import { createEmbedding } from './embedder'
import type { SimilarJournal, RAGContext } from '@/types/memory'

// ── Retrieve similar journals via Supabase RPC ────────────────
export async function searchSimilarJournals(
  supabase:  any,
  userId:    string,
  queryText: string,
  options: {
    limit?:          number
    minSimilarity?:  number
    excludeEntryId?: string
  } = {}
): Promise<SimilarJournal[]> {
  const {
    limit         = 5,
    minSimilarity = 0.6,
    excludeEntryId,
  } = options

  // 1. Embed the query
  const queryEmbedding = await createEmbedding(queryText)

  // 2. Call pgvector similarity search via Supabase RPC
  const { data, error } = await supabase.rpc('search_journal_memories', {
    p_user_id:        userId,
    p_query_embedding:queryEmbedding,
    p_match_count:    limit,
    p_min_similarity: minSimilarity,
    p_exclude_entry:  excludeEntryId ?? null,
  })

  if (error) {
    console.error('[retriever] search error:', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    entry_id:     row.entry_id,
    entry_date:   row.entry_date,
    mood_score:   row.mood_score,
    mood_category:row.mood_category,
    snippet:      (row.main_story ?? '').slice(0, 120),
    similarity:   row.similarity,
    main_story:   row.main_story,
  }))
}

// ── Build RAG context for AI Coach ───────────────────────────
export async function buildRAGContext(
  supabase:       any,
  userId:         string,
  userMessage:    string,
  conversationHistory: string[]
): Promise<RAGContext> {
  // Combine recent message with last 2 user turns for better context
  const contextQuery = [
    userMessage,
    ...conversationHistory.slice(-2),
  ].join(' ')

  const results = await searchSimilarJournals(supabase, userId, contextQuery, {
    limit:        4,
    minSimilarity:0.55,
  })

  // Count total embedded journals
  const { count } = await supabase
    .from('journal_vectors')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    relevantMemories: results,
    totalMemories:    count ?? 0,
  }
}

// ── Format RAG context for system prompt injection ────────────
export function formatRAGContext(ctx: RAGContext): string {
  if (ctx.relevantMemories.length === 0) return ''

  const memories = ctx.relevantMemories
    .map((m, i) => {
      const dateStr = new Date(m.entry_date + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
      const snippet = m.snippet?.trim()
      const similarity = (m.similarity * 100).toFixed(0)

      return `[Jurnal ${dateStr} — relevansi ${similarity}%]: "${snippet}"`
    })
    .join('\n')

  return `\nJURNAL MASA LALU YANG RELEVAN (gunakan sebagai referensi konteks, jangan sebutkan sumbernya secara kaku):\n${memories}`
}
