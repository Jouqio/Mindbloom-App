// ============================================================
// MindBloom — Memory Embed API Route
// File: src/app/api/memory/embed/route.ts
// Creates embeddings for journal entries and stores in pgvector
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildEmbeddableText,
  createEmbedding,
  createEmbeddingsBatch,
  hashContent,
} from '@/lib/memory/embedder'
import { enforceRateLimit } from '@/lib/ratelimit/guard'

// ── POST: embed a specific journal entry ──────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await enforceRateLimit(user.id, 'memory_embed')
    if (limited) return limited

    const body = await request.json()
    const { entry_id, embed_all = false } = body

    if (embed_all) {
      return await embedAllPending(supabase, user.id)
    }

    if (!entry_id) {
      return NextResponse.json({ error: 'entry_id required' }, { status: 400 })
    }

    return await embedSingleEntry(supabase, user.id, entry_id)
  } catch (err) {
    console.error('[POST /api/memory/embed]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET: check embedding status ───────────────────────────────
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [totalRes, embeddedRes, lastRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_draft', false),
      supabase
        .from('journal_vectors')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('journal_vectors')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    const total    = totalRes.count ?? 0
    const embedded = embeddedRes.count ?? 0

    return NextResponse.json({
      data: {
        total_entries:    total,
        embedded_entries: embedded,
        pending:          Math.max(0, total - embedded),
        last_embedded_at: lastRes.data?.created_at ?? null,
      },
    })
  } catch (err) {
    console.error('[GET /api/memory/embed]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Embed single entry ────────────────────────────────────────
async function embedSingleEntry(supabase: any, userId: string, entryId: string) {
  // Fetch journal entry with related data
  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select(`
      id, entry_date, mood_score, mood_category,
      main_story, happy_moments, self_compassion,
      lessons_learned, stress_source, recurring_thoughts,
      tomorrow_intention, prayer_hope,
      journal_emotions(emotion)
    `)
    .eq('id', entryId)
    .eq('user_id', userId)
    .eq('is_draft', false)
    .single()

  if (fetchError || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  const emotions = (entry.journal_emotions ?? []).map((e: any) => e.emotion)
  const contentText = buildEmbeddableText({
    ...entry,
    emotions,
  })

  if (!contentText.trim()) {
    return NextResponse.json({ data: { skipped: true, reason: 'empty content' } })
  }

  const contentHash = await hashContent(contentText)

  // Check if already embedded with same content
  const { data: existing } = await supabase
    .from('journal_vectors')
    .select('id, content_hash')
    .eq('entry_id', entryId)
    .maybeSingle()

  if (existing?.content_hash === contentHash) {
    return NextResponse.json({ data: { skipped: true, reason: 'already up to date' } })
  }

  // Create embedding
  const embedding = await createEmbedding(contentText)

  // Upsert to journal_vectors
  const { data: saved, error: saveError } = await supabase
    .from('journal_vectors')
    .upsert(
      {
        entry_id:     entryId,
        user_id:      userId,
        content_hash: contentHash,
        embedding:    JSON.stringify(embedding),
        content_text: contentText.slice(0, 2000),
        entry_date:   entry.entry_date,
        mood_score:   entry.mood_score ?? null,
        mood_category:entry.mood_category ?? null,
      },
      { onConflict: 'entry_id' }
    )
    .select('id')
    .single()

  if (saveError) throw saveError

  return NextResponse.json({ data: { embedded: true, id: saved.id } }, { status: 201 })
}

// ── Embed all pending entries ─────────────────────────────────
async function embedAllPending(supabase: any, userId: string) {
  // Get all finalized entries without embeddings
  const { data: entries } = await supabase
    .from('journal_entries')
    .select(`
      id, entry_date, mood_score, mood_category,
      main_story, happy_moments, self_compassion,
      lessons_learned, stress_source, recurring_thoughts,
      tomorrow_intention, prayer_hope,
      journal_emotions(emotion)
    `)
    .eq('user_id', userId)
    .eq('is_draft', false)
    .eq('is_deleted', false)
    .order('entry_date', { ascending: false })
    .limit(50)  // Batch limit for safety

  if (!entries || entries.length === 0) {
    return NextResponse.json({ data: { embedded: 0, message: 'No entries to embed' } })
  }

  // Get existing embeddings
  const { data: existing } = await supabase
    .from('journal_vectors')
    .select('entry_id, content_hash')
    .eq('user_id', userId)

  const existingMap = new Map((existing ?? []).map((e: any) => [e.entry_id, e.content_hash]))

  // Build text + hash for every entry first (hashContent is async — Web Crypto API)
  const entriesWithHash = await Promise.all(
    entries.map(async (e: any) => {
      const emotions = (e.journal_emotions ?? []).map((em: any) => em.emotion)
      const text = buildEmbeddableText({ ...e, emotions })
      const hash = await hashContent(text)
      return { entry: e, text, hash }
    })
  )

  // Filter to entries that need embedding
  const toEmbed = entriesWithHash
    .filter(({ entry, text, hash }) => existingMap.get(entry.id) !== hash && text.trim().length > 20)
    .slice(0, 20)  // Max 20 per batch call

  if (toEmbed.length === 0) {
    return NextResponse.json({ data: { embedded: 0, message: 'All up to date' } })
  }

  // Batch embed
  const texts = toEmbed.map(({ text }) => text)
  const embeddings = await createEmbeddingsBatch(texts)

  // Upsert all
  const rows = toEmbed.map(({ entry: e, text, hash }, i: number) => ({
    entry_id:     e.id,
    user_id:      userId,
    content_hash: hash,
    embedding:    JSON.stringify(embeddings[i]),
    content_text: text.slice(0, 2000),
    entry_date:   e.entry_date,
    mood_score:   e.mood_score ?? null,
    mood_category:e.mood_category ?? null,
  }))

  const { error } = await supabase
    .from('journal_vectors')
    .upsert(rows, { onConflict: 'entry_id' })

  if (error) throw error

  return NextResponse.json({ data: { embedded: toEmbed.length } }, { status: 201 })
}
