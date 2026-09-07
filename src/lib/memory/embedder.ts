// ============================================================
// MindBloom — Journal Embedder
// File: src/lib/memory/embedder.ts
// Creates semantic embeddings for journal entries using OpenAI
// ============================================================

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── Build text to embed from journal entry ────────────────────
export function buildEmbeddableText(entry: {
  main_story?:        string | null
  happy_moments?:     string | null
  self_compassion?:   string | null
  lessons_learned?:   string | null
  stress_source?:     string | null
  recurring_thoughts?:string | null
  tomorrow_intention?:string | null
  prayer_hope?:       string | null
  emotions?:          string[]
  mood_category?:     string | null
  entry_date?:        string
}): string {
  const parts: string[] = []

  if (entry.entry_date) {
    parts.push(`Tanggal: ${entry.entry_date}`)
  }
  if (entry.mood_category) {
    parts.push(`Mood: ${entry.mood_category}`)
  }
  if (entry.emotions && entry.emotions.length > 0) {
    parts.push(`Emosi: ${entry.emotions.join(', ')}`)
  }
  if (entry.main_story?.trim()) {
    parts.push(`Cerita: ${entry.main_story.trim()}`)
  }
  if (entry.happy_moments?.trim()) {
    parts.push(`Momen bahagia: ${entry.happy_moments.trim()}`)
  }
  if (entry.stress_source?.trim()) {
    parts.push(`Stres: ${entry.stress_source.trim()}`)
  }
  if (entry.recurring_thoughts?.trim()) {
    parts.push(`Pikiran berulang: ${entry.recurring_thoughts.trim()}`)
  }
  if (entry.self_compassion?.trim()) {
    parts.push(`Belas kasih diri: ${entry.self_compassion.trim()}`)
  }
  if (entry.lessons_learned?.trim()) {
    parts.push(`Pelajaran: ${entry.lessons_learned.trim()}`)
  }
  if (entry.tomorrow_intention?.trim()) {
    parts.push(`Niat besok: ${entry.tomorrow_intention.trim()}`)
  }
  if (entry.prayer_hope?.trim()) {
    parts.push(`Doa/harapan: ${entry.prayer_hope.trim()}`)
  }

  return parts.join('\n').slice(0, 8000) // max ~8k chars
}

// ── Create content hash for deduplication ────────────────────
// Uses Web Crypto API (available in both Node.js 18+ and Edge Runtime)
// instead of Node's `crypto` module, since this file is imported by
// the coach chat route which runs on Edge Runtime.
export async function hashContent(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

// ── Create embedding (single) ─────────────────────────────────
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',   // 1536 dims, cheap (~$0.00002/1K tokens)
    input: text.slice(0, 8000),
    encoding_format: 'float',
  })
  return response.data[0].embedding
}

// ── Create embeddings in batch (max 20 at once) ───────────────
export async function createEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const BATCH_SIZE = 20
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
      encoding_format: 'float',
    })
    results.push(...response.data.map((d) => d.embedding))

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 100))
    }
  }

  return results
}

// ── Estimate token count (rough) ─────────────────────────────
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
