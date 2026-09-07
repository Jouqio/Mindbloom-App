// ============================================================
// MindBloom — useHabits Hook
// File: src/lib/hooks/useHabits.ts
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHabitStore } from '@/store/habitStore'
import type { Habit, HabitWithTodayLog, HabitCategory, HabitFrequency } from '@/types/habit'

export function useHabits() {
  const store = useHabitStore()

  const load = useCallback(async () => {
    store.setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: true })

      const { data: todayLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)

      const logMap = new Map((todayLogs ?? []).map((l) => [l.habit_id, l]))

      const merged: HabitWithTodayLog[] = ((habits ?? []).map((h) => ({
        ...h,
        today_log: logMap.get(h.id) ?? null,
      })) as unknown) as HabitWithTodayLog[]

      store.setHabits(merged)
    } catch (err) {
      console.error('[useHabits] load error:', err)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  useEffect(() => {
    load()
    const supabase = createClient()
    const channel = supabase
      .channel('habits-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  // ── Create habit ──────────────────────────────────────────
  const createHabit = useCallback(async (data: {
    name: string
    emoji: string
    category: HabitCategory
    frequency: HabitFrequency
    custom_days: number[] | null
    target_count: number
    unit: string | null
    color: string
  }) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal membuat habit')
    await load()
  }, [load])

  // ── Update habit ──────────────────────────────────────────
  const updateHabit = useCallback(async (id: string, data: Partial<Habit>) => {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Gagal mengubah habit')
    await load()
  }, [load])

  // ── Archive (soft delete) habit ───────────────────────────
  const archiveHabit = useCallback(async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal menghapus habit')
    await load()
  }, [load])

  // ── Toggle check-in for today ──────────────────────────────
  const toggleCheckIn = useCallback(async (habitId: string, count?: number) => {
    // Optimistic update
    const habit = store.habits.find((h) => h.id === habitId)
    if (!habit) return

    const willComplete = !habit.today_log?.completed
    store.updateHabitLocal(habitId, {
      today_log: {
        id:         habit.today_log?.id ?? 'temp',
        habit_id:   habitId,
        user_id:    habit.user_id,
        log_date:   new Date().toISOString().split('T')[0],
        completed:  willComplete,
        count:      count ?? (willComplete ? habit.target_count : 0),
        note:       null,
        created_at: new Date().toISOString(),
      },
      current_streak: willComplete ? habit.current_streak + 1 : Math.max(0, habit.current_streak - 1),
    })

    try {
      const res = await fetch(`/api/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      if (!res.ok) throw new Error('Gagal check-in')
      await load() // sync with server truth
    } catch (err) {
      console.error('[toggleCheckIn]', err)
      await load() // revert on error
    }
  }, [store, load])

  return {
    habits:         store.habits,
    isLoading:      store.isLoading,
    editingHabit:   store.editingHabit,
    showForm:       store.showForm,
    setEditingHabit:store.setEditingHabit,
    setShowForm:    store.setShowForm,
    createHabit,
    updateHabit,
    archiveHabit,
    toggleCheckIn,
    refetch:        load,
  }
}
