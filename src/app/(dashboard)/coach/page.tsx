// ============================================================
// MindBloom — AI Coach Page
// File: src/app/(dashboard)/coach/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { assembleUserContext } from '@/lib/coach/contextAssembler'
import { buildBloomGreeting } from '@/lib/coach/bloomPersona'
import { CoachClient } from './CoachClient'

export const metadata: Metadata = {
  title: 'AI Coach — Bloom',
  description: 'Bicara dengan Bloom, AI Reflection Coach yang empatik dan tidak menghakimi.',
}

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Assemble context on the server for the initial greeting
  const ctx = await assembleUserContext(user.id)
  const greeting = buildBloomGreeting(ctx)

  // Fetch recent sessions for history sidebar
  const { data: sessions } = await supabase
    .from('coach_sessions')
    .select('id, title, message_count, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  return (
    <CoachClient
      greeting={greeting}
      recentSessions={sessions ?? []}
    />
  )
}
