// ============================================================
// MindBloom — Habits Page
// File: src/app/(dashboard)/habits/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HabitsClient } from './HabitsClient'

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Bangun kebiasaan positif setiap hari.',
}

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [habitsRes, todayLogsRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today),
  ])

  const logMap = new Map((todayLogsRes.data ?? []).map((l) => [l.habit_id, l]))
  const habits = (habitsRes.data ?? []).map((h) => ({
    ...h,
    today_log: logMap.get(h.id) ?? null,
  }))

  return <HabitsClient initialHabits={habits} />
}
