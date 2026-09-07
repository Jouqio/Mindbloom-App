// ============================================================
// MindBloom — Habits API Route
// File: src/app/api/habits/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, emoji, category, frequency, custom_days, target_count, unit, color } = body

    if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id:      user.id,
        name:         name.trim(),
        emoji:        emoji ?? '💪',
        category:     category ?? 'health',
        frequency:    frequency ?? 'daily',
        custom_days:  custom_days ?? null,
        target_count: target_count ?? 1,
        unit:         unit ?? null,
        color:        color ?? '#7F77DD',
        is_archived:  false,
        current_streak:    0,
        longest_streak:    0,
        total_completions: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/habits]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('archived') === 'true'
    const today = new Date().toISOString().split('T')[0]

    const habitsQuery = supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!includeArchived) habitsQuery.eq('is_archived', false)

    const { data: habits, error: habitsError } = await habitsQuery
    if (habitsError) throw habitsError

    const { data: todayLogs } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)

    const logMap = new Map((todayLogs ?? []).map((l) => [l.habit_id, l]))
    const merged = (habits ?? []).map((h) => ({ ...h, today_log: logMap.get(h.id) ?? null }))

    return NextResponse.json({ data: merged })
  } catch (err) {
    console.error('[GET /api/habits]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
