// ============================================================
// MindBloom — Journal API Route
// File: src/app/api/journals/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      entry_date, mood_score, mood_category, energy_score,
      main_story, recurring_thoughts, stress_source, stress_intensity,
      happy_moments, gratitude_items, lessons_learned,
      did_well, improve_on, do_differently, self_compassion,
      tomorrow_intention, prayer_hope,
      is_draft, draft_step, written_duration_sec,
      emotions, affirmations,
    } = body

    // Calculate word count
    const allText = [
      main_story, recurring_thoughts, stress_source,
      happy_moments, lessons_learned, did_well,
      improve_on, do_differently, self_compassion,
      tomorrow_intention, prayer_hope,
    ].filter(Boolean).join(' ')
    const word_count = allText.split(/\s+/).filter(Boolean).length

    // Calculate completion percentage
    const checks = [
      !!mood_score,
      Array.isArray(emotions) && emotions.length > 0,
      energy_score !== null,
      (main_story?.trim().length ?? 0) > 20,
      (happy_moments?.trim().length ?? 0) > 0,
      Array.isArray(gratitude_items) && gratitude_items.filter((g: string) => g.trim()).length >= 3,
      (did_well?.trim().length ?? 0) > 0,
      (improve_on?.trim().length ?? 0) > 0,
      (self_compassion?.trim().length ?? 0) > 0,
    ]
    const completion_pct = Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    )

    // Upsert journal entry (one per user per date)
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .upsert(
        {
          user_id:            user.id,
          entry_date:         entry_date ?? new Date().toISOString().split('T')[0],
          mood_score:         mood_score ?? null,
          energy_score:       energy_score ?? null,
          main_story:         main_story ?? null,
          recurring_thoughts: recurring_thoughts ?? null,
          stress_source:      stress_source ?? null,
          stress_intensity:   stress_intensity ?? null,
          happy_moments:      happy_moments ?? null,
          lessons_learned:    lessons_learned ?? null,
          did_well:           did_well ?? null,
          improve_on:         improve_on ?? null,
          do_differently:     do_differently ?? null,
          self_compassion:    self_compassion ?? null,
          tomorrow_intention: tomorrow_intention ?? null,
          prayer_hope:        prayer_hope ?? null,
          word_count,
          completion_pct,
          is_draft:           is_draft ?? true,
          draft_step:         draft_step ?? 1,
          device_platform:    'web',
          written_duration_sec: written_duration_sec ?? null,
          updated_at:         new Date().toISOString(),
        },
        {
          onConflict: 'user_id,entry_date',
          ignoreDuplicates: false,
        }
      )
      .select('id')
      .single()

    if (entryError) {
      console.error('[POST /api/journals] entry error:', entryError)
      return NextResponse.json({ error: entryError.message }, { status: 500 })
    }

    const entryId = entry.id

    // Upsert emotions
    if (Array.isArray(emotions) && emotions.length > 0) {
      await supabase
        .from('journal_emotions')
        .delete()
        .eq('entry_id', entryId)

      const emotionRows = emotions.map((emotion: string) => ({
        entry_id: entryId,
        user_id:  user.id,
        emotion,
        category: 'general',
        valence:  'neutral',
      }))

      await supabase.from('journal_emotions').insert(emotionRows)
    }

    // Upsert gratitude items
    if (Array.isArray(gratitude_items)) {
      const validGratitude = gratitude_items
        .map((text: string, i: number) => ({ text: text.trim(), sort_order: i }))
        .filter((g) => g.text.length > 0)

      if (validGratitude.length > 0) {
        await supabase
          .from('gratitude_items')
          .delete()
          .eq('entry_id', entryId)

        await supabase.from('gratitude_items').insert(
          validGratitude.map((g) => ({
            entry_id: entryId,
            user_id:  user.id,
            text:     g.text,
            sort_order: g.sort_order,
          }))
        )
      }
    }

    return NextResponse.json(
      { data: { id: entryId, completion_pct, word_count } },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/journals] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '20'), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0')
    const month  = searchParams.get('month')
    const year   = searchParams.get('year')

    let query = supabase
      .from('journal_entries')
      .select(`
        id, entry_date, mood_score, mood_category, energy_score,
        word_count, completion_pct, is_draft, created_at,
        journal_emotions(emotion, category, valence),
        gratitude_items(text, sort_order)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .eq('is_draft', false)
      .order('entry_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (month && year) {
      const paddedMonth = month.padStart(2, '0')
      const nextMonth = String(parseInt(month) + 1).padStart(2, '0')
      query = query
        .gte('entry_date', `${year}-${paddedMonth}-01`)
        .lt('entry_date', `${year}-${nextMonth}-01`)
    }

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, count, limit, offset })
  } catch (err) {
    console.error('[GET /api/journals] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
