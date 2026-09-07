// ============================================================
// MindBloom — Achievements Page
// File: src/app/(dashboard)/achievements/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AchievementsClient } from './AchievementsClient'

export const metadata: Metadata = {
  title: 'Achievement & Streak',
  description: 'Lihat streak harianmu, XP, dan semua badge yang kamu kumpulkan.',
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [achievementsRes, xpRes, streakRes, defsRes] = await Promise.all([
    supabase
      .from('user_achievements')
      .select(`id, achievement_id, earned_at, notified,
        achievement_definitions(id,slug,name,description,icon,category,
          rarity,condition_type,condition_value,xp_reward,is_hidden,sort_order)`)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
    supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('achievement_definitions')
      .select('*')
      .order('sort_order'),
  ])

  return (
    <AchievementsClient
      initialAchievements={achievementsRes.data ?? []}
      initialXP={xpRes.data}
      initialStreak={streakRes.data}
      allDefinitions={defsRes.data ?? []}
    />
  )
}
