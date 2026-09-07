// ============================================================
// MindBloom — Context Assembler
// File: src/lib/coach/contextAssembler.ts
// Fetches user data from Supabase to build AI context
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { CoachContextData } from '@/types/coach'

export async function assembleUserContext(userId: string): Promise<CoachContextData> {
  const supabase = await createClient()

  const [
    profileRes,
    moodsRes,
    journalsRes,
    streakRes,
    emotionsRes,
    habitsRes,
    lifeWheelRes,
  ] = await Promise.all([
    // Profile (name)
    supabase
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', userId)
      .maybeSingle(),

    // Recent moods (last 7 days)
    supabase
      .from('journal_entries')
      .select('entry_date, mood_score, mood_category')
      .eq('user_id', userId)
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .not('mood_score', 'is', null)
      .order('entry_date', { ascending: false })
      .limit(7),

    // Recent journal snippets
    supabase
      .from('journal_entries')
      .select('entry_date, main_story, mood_category')
      .eq('user_id', userId)
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .not('main_story', 'is', null)
      .order('entry_date', { ascending: false })
      .limit(3),

    // Streak
    supabase
      .from('streaks')
      .select('current_streak, total_entries')
      .eq('user_id', userId)
      .maybeSingle(),

    // Top emotions from last 14 days
    supabase
      .from('journal_emotions')
      .select('emotion')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
      .limit(50),

    // Active habits with today's status
    supabase
      .from('habits')
      .select('name, current_streak, habit_logs(completed, log_date)')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('current_streak', { ascending: false })
      .limit(5),

    // Latest Life Wheel entry
    supabase
      .from('life_wheel_entries')
      .select('scores')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // ── Build top emotions (most frequent) ─────────────────────
  const emotionCounts: Record<string, number> = {}
  for (const row of emotionsRes.data ?? []) {
    emotionCounts[row.emotion] = (emotionCounts[row.emotion] ?? 0) + 1
  }
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([e]) => e)

  // ── Build habit summary ────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const habitSummary = (habitsRes.data ?? []).map((h: any) => ({
    name:          h.name,
    streak:        h.current_streak ?? 0,
    completedToday:(h.habit_logs ?? []).some(
      (l: any) => l.log_date === today && l.completed
    ),
  }))

  // ── Build journal snippets (first 80 chars) ────────────────
  const recentJournals = (journalsRes.data ?? []).map((j: any) => ({
    date:    j.entry_date,
    snippet: (j.main_story ?? '').slice(0, 80).trim() + (j.main_story?.length > 80 ? '...' : ''),
    mood:    j.mood_category ?? null,
  }))

  return {
    userName:    profileRes.data?.display_name ?? profileRes.data?.full_name?.split(' ')[0] ?? null,
    recentMoods: (moodsRes.data ?? []).map((m: any) => ({
      date:     m.entry_date,
      score:    m.mood_score,
      category: m.mood_category ?? 'unknown',
    })),
    recentJournals,
    currentStreak:  streakRes.data?.current_streak  ?? 0,
    totalJournals:  streakRes.data?.total_entries    ?? 0,
    topEmotions,
    habitSummary,
    lifeWheelLatest: (lifeWheelRes.data?.scores ?? null) as unknown as Record<string, number> | null,
  }
}
