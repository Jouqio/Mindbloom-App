// ============================================================
// MindBloom — Generate Insights API Route
// File: src/app/api/insights/generate/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInsightCards } from '@/lib/ei/insightGenerator'
import { detectPatterns } from '@/lib/ei/patternDetector'
import { enforceRateLimit } from '@/lib/ratelimit/guard'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await enforceRateLimit(user.id, 'insights_generate')
    if (limited) return limited

    // ── 1. Fetch raw data in parallel ──────────────────────
    const sevenDaysAgo  = new Date(Date.now() - 7  * 86400000).toISOString().split('T')[0]
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]
    const prevWeekStart = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]
    const prevWeekEnd   = sevenDaysAgo

    const [
      profileRes, moodRes, prevMoodRes, emotionsRes,
      gratitudeRes, streakRes, journalCountRes,
    ] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
      supabase.from('journal_entries')
        .select('entry_date,mood_score,energy_score,stress_intensity,stress_source')
        .eq('user_id', user.id).eq('is_draft', false)
        .gte('entry_date', sevenDaysAgo).order('entry_date', { ascending: false }),
      supabase.from('journal_entries')
        .select('mood_score')
        .eq('user_id', user.id).eq('is_draft', false)
        .gte('entry_date', prevWeekStart).lt('entry_date', prevWeekEnd),
      supabase.from('journal_emotions')
        .select('emotion').eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString()),
      supabase.from('gratitude_items')
        .select('entry_id')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      supabase.from('streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
      supabase.from('journal_entries')
        .select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_draft', false),
    ])

    // Habit logs with nested habit name — isolated from the Promise.all above.
    // NOTE: this nested embedded select (habits(name)) can't be resolved from
    // our hand-written Database type since we don't model FK Relationships
    // by hand (see types/database.ts). Cast to the shape we actually consume;
    // the query itself is correct, this is a compile-time-only workaround.
    interface HabitLogWithHabitRow {
      habit_id:  string
      completed: boolean
      log_date:  string
      habits:    { name: string } | null
    }
    const habitWithMoodRes = await supabase
      .from('habit_logs')
      .select('habit_id, completed, log_date, habits(name)')
      .eq('user_id', user.id)
      .gte('log_date', fourteenDaysAgo) as unknown as { data: HabitLogWithHabitRow[] | null }

    // ── 2. Calculate weekly mood averages ──────────────────
    const moodData  = moodRes.data ?? []
    const weekMoodAvg = moodData.length > 0
      ? moodData.reduce((s, d) => s + (d.mood_score ?? 5), 0) / moodData.length
      : 5

    const prevMoodData = prevMoodRes.data ?? []
    const prevWeekMoodAvg = prevMoodData.length > 0
      ? prevMoodData.reduce((s, d) => s + (d.mood_score ?? 5), 0) / prevMoodData.length
      : null

    // ── 3. Top emotions ────────────────────────────────────
    const emotionCounts: Record<string, number> = {}
    for (const row of emotionsRes.data ?? []) {
      emotionCounts[row.emotion] = (emotionCounts[row.emotion] ?? 0) + 1
    }
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([e]) => e)

    // ── 4. Gratitude counts per entry ─────────────────────
    const gratitudeCounts: Record<string, number> = {}
    for (const row of gratitudeRes.data ?? []) {
      gratitudeCounts[row.entry_id] = (gratitudeCounts[row.entry_id] ?? 0) + 1
    }
    const gratitudeByDate = Object.entries(gratitudeCounts).map(([entryId, count]) => ({
      date:  entryId, // entry_id as proxy for date
      count,
    }))

    // ── 5. Habit + mood data ───────────────────────────────
    const habitWithMoodData = await buildHabitMoodData(supabase, user.id, habitWithMoodRes.data ?? [], fourteenDaysAgo)

    // ── 6. Detect patterns ─────────────────────────────────
    const patternsInput = moodData.map((d: any) => ({
      entry_date:       d.entry_date,
      mood_score:       d.mood_score ?? 5,
      energy_score:     d.energy_score ?? null,
      stress_intensity: d.stress_intensity ?? null,
      stress_source:    d.stress_source ?? null,
      emotions:         [] as string[],
    }))
    // Attach emotions to mood data (simplified — attach top emotions globally)
    const patterns = detectPatterns(patternsInput, gratitudeByDate, habitWithMoodData)

    // ── 7. Get latest EI score ─────────────────────────────
    const { data: eiRow } = await supabase
      .from('ei_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // ── 8. Generate AI insight cards ──────────────────────
    const cards = await generateInsightCards({
      userName:        profileRes.data?.display_name ?? null,
      weekMoodAvg,
      prevWeekMoodAvg,
      topEmotions,
      eiScore:         (eiRow ?? null) as unknown as import('@/types/insight').EIScore | null,
      patterns,
      journalCount:    journalCountRes.count ?? 0,
      currentStreak:   streakRes.data?.current_streak ?? 0,
    })

    // ── 9. Save to database ───────────────────────────────
    const validUntil = new Date(Date.now() + 24 * 3600000).toISOString()

    if (cards.length > 0) {
      await supabase.from('insight_cards').insert(
        cards.map((c) => ({
          ...c,
          user_id:      user.id,
          generated_at: new Date().toISOString(),
          valid_until:  validUntil,
          seen_at:      null,
        }))
      )
    }

    return NextResponse.json({
      data: { cards_generated: cards.length, patterns_found: patterns.length },
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/insights/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function buildHabitMoodData(supabase: any, userId: string, logs: any[], since: string) {
  const { data: journals } = await supabase
    .from('journal_entries')
    .select('entry_date, mood_score')
    .eq('user_id', userId)
    .gte('entry_date', since)

  const moodByDate = new Map<string, number | null>(
    (journals ?? []).map((j: any) => [j.entry_date as string, (j.mood_score ?? null) as number | null])
  )

  return logs.map((l: any) => ({
    habit_name:  (l.habits?.name ?? 'Unknown') as string,
    completed:   l.completed as boolean,
    log_date:    l.log_date as string,
    mood_score:  moodByDate.get(l.log_date) ?? null,
  }))
}
