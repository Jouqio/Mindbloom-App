// ============================================================
// MindBloom — Search Page
// File: src/app/(dashboard)/search/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SearchClient } from './SearchClient'

export const metadata: Metadata = {
  title: 'Cari Jurnal',
  description: 'Cari jurnal masa lalumu berdasarkan perasaan dan situasi.',
}

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check embedding status
  const [totalRes, embeddedRes] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_draft', false),
    supabase
      .from('journal_vectors')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  return (
    <SearchClient
      totalEntries={totalRes.count ?? 0}
      embeddedEntries={embeddedRes.count ?? 0}
    />
  )
}
