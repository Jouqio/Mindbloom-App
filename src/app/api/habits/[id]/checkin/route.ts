// ============================================================
// MindBloom — Habit Check-in API Route
// File: src/app/api/habits/[id]/checkin/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { count } = body
    const today = new Date().toISOString().split('T')[0]
    const { id: habitId } = await params

    // Verify ownership
    const { data: habit } = await supabase
      .from('habits')
      .select('id, target_count, current_streak, longest_streak, total_completions')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single()

    if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 })

    // Check existing log
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('id, completed')
      .eq('habit_id', habitId)
      .eq('log_date', today)
      .maybeSingle()

    let completed: boolean
    let logId: string

    if (existing) {
      // Toggle
      completed = !existing.completed
      const { data: updated, error } = await supabase
        .from('habit_logs')
        .update({
          completed,
          count: completed ? (count ?? habit.target_count) : 0,
        })
        .eq('id', existing.id)
        .select('id')
        .single()
      if (error) throw error
      logId = updated.id
    } else {
      // Create
      completed = true
      const { data: created, error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id:  habitId,
          user_id:   user.id,
          log_date:  today,
          completed: true,
          count:     count ?? habit.target_count,
          note:      null,
        })
        .select('id')
        .single()
      if (error) throw error
      logId = created.id
    }

    // Update streak on the habit itself
    if (completed) {
      const newStreak = habit.current_streak + 1
      await supabase
        .from('habits')
        .update({
          current_streak:    newStreak,
          longest_streak:    Math.max(habit.longest_streak, newStreak),
          total_completions: habit.total_completions + 1,
          updated_at:        new Date().toISOString(),
        })
        .eq('id', habitId)
    } else {
      await supabase
        .from('habits')
        .update({
          current_streak: Math.max(0, habit.current_streak - 1),
          updated_at:     new Date().toISOString(),
        })
        .eq('id', habitId)
    }

    return NextResponse.json({ data: { log_id: logId, completed } }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/habits/[id]/checkin]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
