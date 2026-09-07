// ============================================================
// MindBloom — Insights Page (Server)
// File: src/app/(dashboard)/insights/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InsightsClient } from './InsightsClient'

export const metadata: Metadata = {
  title: 'Insight Personal',
  description: 'Pola emosi, skor EI, dan insight AI dari perjalanan jurnalmu.',
}

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date().toISOString()

  const [insightsRes, eiRes, journalCountRes] = await Promise.all([
    supabase
      .from('insight_cards')
      .select('*')
      .eq('user_id', user.id)
      .gte('valid_until', now)
      .order('priority', { ascending: true })
      .order('generated_at', { ascending: false })
      .limit(10),
    supabase
      .from('ei_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_draft', false),
  ])

  return (
    <InsightsClient
      initialInsights={(insightsRes.data ?? []) as unknown as import('@/types/insight').InsightCard[]}
      initialEIScore={eiRes.data as unknown as import('@/types/insight').EIScore | null}
      journalCount={journalCountRes.count ?? 0}
    />
  )
}
