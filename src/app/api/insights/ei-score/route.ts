// ============================================================
// MindBloom — EI Score API Route
// File: src/app/api/insights/ei-score/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoreEIFromJournal, averageEIScores, calculateOverallEI } from '@/lib/ei/eiScorer'
import { enforceRateLimit } from '@/lib/ratelimit/guard'
import type { EIDimension } from '@/types/insight'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await enforceRateLimit(user.id, 'ei_score')
    if (limited) return limited

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
    const weekStartStr = weekStart.toISOString().split('T')[0]

    // Check if EI already calculated this week
    const { data: existing } = await supabase
      .from('ei_scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStartStr)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ data: { message: 'Already calculated this week', id: existing.id } })
    }

    // Fetch last 7 days of journal entries with all relevant fields
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    const { data: entries } = await supabase
      .from('journal_entries')
      .select(`
        id, mood_score, energy_score, self_compassion,
        stress_source, stress_intensity, did_well, improve_on,
        do_differently, tomorrow_intention, happy_moments,
        recurring_thoughts, main_story, lessons_learned,
        prayer_hope, completion_pct,
        journal_emotions(emotion),
        gratitude_items(text)
      `)
      .eq('user_id', user.id)
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .gte('entry_date', sevenDaysAgo)
      .order('entry_date', { ascending: false })

    if (!entries || entries.length === 0) {
      return NextResponse.json({ data: { message: 'No entries to score' } })
    }

    // Score each entry
    const individualScores = entries.map((e: any) => {
      const journalEntry = {
        mood_score:        e.mood_score,
        energy_score:      e.energy_score,
        emotions:          (e.journal_emotions ?? []).map((em: any) => em.emotion),
        self_compassion:   e.self_compassion,
        stress_source:     e.stress_source,
        stress_intensity:  e.stress_intensity,
        did_well:          e.did_well,
        improve_on:        e.improve_on,
        do_differently:    e.do_differently,
        tomorrow_intention:e.tomorrow_intention,
        happy_moments:     e.happy_moments,
        recurring_thoughts:e.recurring_thoughts,
        main_story:        e.main_story,
        lessons_learned:   e.lessons_learned,
        prayer_hope:       e.prayer_hope,
        gratitude_items:   (e.gratitude_items ?? []).map((g: any) => g.text),
        completion_pct:    e.completion_pct ?? 0,
      }
      return scoreEIFromJournal(journalEntry)
    })

    // Average across all entries this week
    const avgScores = averageEIScores(individualScores)
    const overall   = calculateOverallEI(avgScores)

    // Save to database
    const { data: saved, error } = await supabase
      .from('ei_scores')
      .insert({
        user_id:     user.id,
        scores:      avgScores,
        overall,
        week_start:  weekStartStr,
        entry_count: entries.length,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      data: { id: saved.id, overall, entry_count: entries.length, scores: avgScores },
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/insights/ei-score]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('ei_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12)

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/insights/ei-score]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
