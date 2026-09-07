// ============================================================
// MindBloom — Analytics Page
// File: src/app/(dashboard)/analytics/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsClient } from './AnalyticsClient'

export const metadata: Metadata = {
  title: 'Analitik',
  description: 'Tren mood, energi, emosi, dan performa habit dari perjalanan jurnalmu.',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_draft', false)

  return <AnalyticsClient totalEntries={count ?? 0} />
}
