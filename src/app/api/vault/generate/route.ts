// ============================================================
// MindBloom — Vault Generate API Route
// File: src/app/api/vault/generate/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMonthlyNarrative } from '@/lib/vault/narrativeGenerator'
import { getCoverEmoji, MONTH_NAMES_ID } from '@/types/vault'
import { enforceRateLimit } from '@/lib/ratelimit/guard'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await enforceRateLimit(user.id, 'vault_generate')
    if (limited) return limited

    const { year, month } = await request.json()

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: 'year and month (1-12) required' }, { status: 400 })
    }

    // Check if already generated
    const { data: existing } = await supabase
      .from('monthly_narratives')
      .select('id, generated_at')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle()

    if (existing) {
      // Allow re-generation after 1 day
      const hoursSince = (Date.now() - new Date(existing.generated_at).getTime()) / 3600000
      if (hoursSince < 24) {
        return NextResponse.json({ data: { id: existing.id, already_exists: true } })
      }
    }

    // ── 1. Fetch month's journal entries ───────────────────
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate   = new Date(year, month, 0).toISOString().split('T')[0]

    interface MonthEntryRow {
      id: string; entry_date: string; mood_score: number | null; mood_category: string | null
      main_story: string | null; happy_moments: string | null; self_compassion: string | null
      lessons_learned: string | null; word_count: number; completion_pct: number
      journal_emotions: Array<{ emotion: string }> | null
      gratitude_items:  Array<{ text: string; sort_order: number }> | null
    }
    const { data: entries } = await supabase
      .from('journal_entries')
      .select(`
        id, entry_date, mood_score, mood_category, main_story,
        happy_moments, self_compassion, lessons_learned, word_count, completion_pct,
        journal_emotions(emotion),
        gratitude_items(text, sort_order)
      `)
      .eq('user_id', user.id)
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true }) as unknown as { data: MonthEntryRow[] | null }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()

    const entryList = entries ?? []
    const allEmotions: Record<string, number> = {}
    for (const e of entryList) {
      for (const em of (e.journal_emotions ?? [])) {
        allEmotions[em.emotion] = (allEmotions[em.emotion] ?? 0) + 1
      }
    }
    const topEmotions = Object.entries(allEmotions)
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([e]) => e)

    const moods   = entryList.map((e: any) => e.mood_score).filter((m: any) => m != null)
    const avgMood = moods.length > 0 ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length : null

    const vaultEntries = entryList.map((e: any) => ({
      id:             e.id,
      entry_date:     e.entry_date,
      mood_score:     e.mood_score,
      mood_category:  e.mood_category,
      main_story:     e.main_story,
      happy_moments:  e.happy_moments,
      self_compassion:e.self_compassion,
      lessons_learned:e.lessons_learned,
      gratitude_items:(e.gratitude_items ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((g: any) => g.text),
      word_count:     e.word_count,
      completion_pct: e.completion_pct,
    }))

    // ── 2. Generate AI narrative ───────────────────────────
    const { narrative, highlights, mood_summary } = await generateMonthlyNarrative({
      userName:    profile?.display_name ?? null,
      year, month,
      entries:     vaultEntries,
      avgMood,
      topEmotions,
      streak:      0,
    })

    // ── 3. Save to database ────────────────────────────────
    const monthLabel   = `${MONTH_NAMES_ID[month - 1]} ${year}`
    const coverEmoji   = getCoverEmoji(avgMood, entryList.length)
    const totalWords   = entryList.reduce((s: number, e: any) => s + (e.word_count ?? 0), 0)

    const { data: saved, error: saveError } = await supabase
      .from('monthly_narratives')
      .upsert(
        {
          user_id:      user.id,
          year, month,
          month_label:  monthLabel,
          narrative,
          highlights,
          mood_summary,
          top_emotions: topEmotions,
          avg_mood:     avgMood ? Math.round(avgMood * 10) / 10 : null,
          entry_count:  entryList.length,
          word_count:   totalWords,
          cover_emoji:  coverEmoji,
          generated_at: new Date().toISOString(),
          is_generating:false,
        },
        { onConflict: 'user_id,year,month' }
      )
      .select('id')
      .single()

    if (saveError) throw saveError

    return NextResponse.json({ data: { id: saved.id, month_label: monthLabel, entry_count: entryList.length } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vault/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('monthly_narratives')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[GET /api/vault/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
