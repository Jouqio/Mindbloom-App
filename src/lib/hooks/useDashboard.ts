// ============================================================
// MindBloom — Dashboard Hooks
// File: src/lib/hooks/useDashboard.ts
// ============================================================

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DashboardData, MoodCalendarDay } from '@/types/dashboard'

// ── useDashboard ──────────────────────────────────────────────
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      // Fetch in parallel
      const [streakRes, todayRes, xpRes] = await Promise.all([
        supabase
          .from('streaks')
          .select('current_streak, longest_streak, total_entries')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('journal_entries')
          .select('mood_score, mood_category')
          .eq('user_id', user.id)
          .eq('entry_date', new Date().toISOString().split('T')[0])
          .eq('is_draft', false)
          .maybeSingle(),
        supabase
          .from('user_xp')
          .select('total_xp, current_level, xp_to_next')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      setData({
        streak: {
          current_streak: streakRes.data?.current_streak ?? 0,
          longest_streak: streakRes.data?.longest_streak ?? 0,
          total_entries:  streakRes.data?.total_entries  ?? 0,
        },
        mood_today: todayRes.data
          ? {
              score:    todayRes.data.mood_score    ?? 5,
              category: (todayRes.data.mood_category as any) ?? 'calm',
            }
          : null,
        xp: {
          total_xp:    xpRes.data?.total_xp    ?? 0,
          current_level: xpRes.data?.current_level ?? 1,
          xp_to_next:  xpRes.data?.xp_to_next  ?? 100,
        },
        garden_level:       'seed',
        weekly_avg_mood:    null,
        unread_insights:    0,
        pending_achievements: 0,
      })
    } catch (err) {
      setError('Gagal memuat data dashboard.')
      console.error('[useDashboard]', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    // Realtime: refresh when journal_entries change
    const supabase = createClient()
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        () => load()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { data, isLoading, error, refetch: load }
}

// ── useMoodCalendar ───────────────────────────────────────────
export function useMoodCalendar(year: number, month: number) {
  const [days, setDays] = useState<MoodCalendarDay[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endDate   = new Date(year, month, 0).toISOString().split('T')[0] // last day

        const { data } = await supabase
          .from('journal_entries')
          .select('entry_date, mood_score, mood_category')
          .eq('user_id', user.id)
          .eq('is_draft', false)
          .eq('is_deleted', false)
          .gte('entry_date', startDate)
          .lte('entry_date', endDate)
          .order('entry_date')

        setDays(
          (data ?? []).map((d) => ({
            entry_date:   d.entry_date,
            mood_score:   d.mood_score   ?? 5,
            mood_category:(d.mood_category as any) ?? 'calm',
            has_journal:  true,
          }))
        )
      } catch (err) {
        console.error('[useMoodCalendar]', err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [year, month])

  return { days, isLoading }
}

// ── useGreeting ───────────────────────────────────────────────
export function useGreeting(name: string | null): string {
  const hour = new Date().getHours()

  const timeGreeting =
    hour < 5  ? 'Masih terjaga'     :
    hour < 11 ? 'Selamat pagi'      :
    hour < 15 ? 'Selamat siang'     :
    hour < 18 ? 'Selamat sore'      :
                'Selamat malam'

  const displayName = name?.split(' ')[0] ?? 'Kamu'
  return `${timeGreeting}, ${displayName}`
}
