// ============================================================
// MindBloom — PDF Export API Route
// File: src/app/api/vault/pdf/route.ts
// Returns styled HTML for browser print-to-PDF
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPDFHTML } from '@/lib/vault/pdfBuilder'
import type { VaultEntry, PDFExportOptions } from '@/types/vault'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: PDFExportOptions = await request.json()
    const { year, month, include } = body

    if (!year || !month) {
      return NextResponse.json({ error: 'year and month required' }, { status: 400 })
    }

    // ── Fetch entries ───────────────────────────────────────
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate   = new Date(year, month, 0).toISOString().split('T')[0]

    const [entriesRes, narrativeRes, profileRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select(`
          id, entry_date, mood_score, mood_category, main_story,
          happy_moments, self_compassion, lessons_learned,
          prayer_hope, word_count, completion_pct,
          gratitude_items(text, sort_order)
        `)
        .eq('user_id', user.id)
        .eq('is_draft', false)
        .eq('is_deleted', false)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: true }),

      include.narrative
        ? supabase
            .from('monthly_narratives')
            .select('*')
            .eq('user_id', user.id)
            .eq('year', year)
            .eq('month', month)
            .maybeSingle()
        : Promise.resolve({ data: null }),

      supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', user.id)
        .maybeSingle(),
    ])

    const entries: VaultEntry[] = (entriesRes.data ?? []).map((e: any) => ({
      id:             e.id,
      entry_date:     e.entry_date,
      mood_score:     e.mood_score ?? null,
      mood_category:  e.mood_category ?? null,
      main_story:     e.main_story ?? null,
      happy_moments:  e.happy_moments ?? null,
      self_compassion:e.self_compassion ?? null,
      lessons_learned:e.lessons_learned ?? null,
      gratitude_items:(e.gratitude_items ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((g: any) => g.text),
      word_count:     e.word_count ?? 0,
      completion_pct: e.completion_pct ?? 0,
    }))

    const userName = profileRes.data?.display_name ?? profileRes.data?.full_name?.split(' ')[0] ?? null

    const html = buildPDFHTML({
      entries,
      narrative: (narrativeRes.data ?? null) as unknown as import('@/types/vault').MonthlyNarrative | null,
      userName,
      year,
      month,
      opts: include,
    })

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[POST /api/vault/pdf]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
