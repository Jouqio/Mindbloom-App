// ============================================================
// MindBloom — Memory Vault Page
// File: src/app/(dashboard)/vault/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VaultClient } from './VaultClient'

export const metadata: Metadata = {
  title: 'Memory Vault',
  description: 'Buku kenangan bulanan dari perjalanan refleksimu.',
}

export default async function VaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [narrativesRes, journalMonthsRes] = await Promise.all([
    supabase
      .from('monthly_narratives')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false }),
    supabase
      .from('journal_entries')
      .select('entry_date, mood_score')
      .eq('user_id', user.id)
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .order('entry_date', { ascending: false }),
  ])

  return (
    <VaultClient
      initialNarratives={(narrativesRes.data ?? []) as unknown as import('@/types/vault').MonthlyNarrative[]}
      journalEntries={journalMonthsRes.data ?? []}
    />
  )
}
