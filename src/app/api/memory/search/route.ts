// ============================================================
// MindBloom — Semantic Search API Route
// File: src/app/api/memory/search/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchSimilarJournals } from '@/lib/memory/retriever'
import { enforceRateLimit } from '@/lib/ratelimit/guard'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await enforceRateLimit(user.id, 'memory_search')
    if (limited) return limited

    const { query, limit = 5, min_similarity = 0.55, exclude_entry_id } = await request.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'query required' }, { status: 400 })
    }

    const results = await searchSimilarJournals(supabase, user.id, query, {
      limit,
      minSimilarity: min_similarity,
      excludeEntryId: exclude_entry_id,
    })

    return NextResponse.json({ data: { results, query, total: results.length } })
  } catch (err) {
    console.error('[POST /api/memory/search]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
