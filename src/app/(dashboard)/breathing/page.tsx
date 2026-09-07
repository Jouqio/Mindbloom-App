// ============================================================
// MindBloom — Breathing Page (Ruang Tenang)
// File: src/app/(dashboard)/breathing/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BreathingClient } from './BreathingClient'

export const metadata: Metadata = {
  title: 'Ruang Tenang',
  description: 'Latihan pernapasan dan suasana suara untuk menenangkan pikiran.',
}

export default async function BreathingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recentSessions } = await supabase
    .from('breathing_sessions')
    .select('id, pattern_id, cycles_completed, duration_sec, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalSessions } = await supabase
    .from('breathing_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <BreathingClient
      recentSessions={recentSessions ?? []}
      totalSessions={totalSessions ?? 0}
    />
  )
}
