// ============================================================
// MindBloom — Garden Page
// File: src/app/(dashboard)/garden/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GardenClient } from './GardenClient'

export const metadata: Metadata = {
  title: 'Taman Emosional',
  description: 'Taman yang tumbuh dari setiap jurnal yang kamu tulis.',
}

export default async function GardenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [plantsRes, countRes] = await Promise.all([
    supabase
      .from('garden_plants')
      .select('*')
      .eq('user_id', user.id)
      .order('planted_at', { ascending: true }),
    supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_draft', false)
      .eq('is_deleted', false),
  ])

  return (
    <GardenClient
      initialPlants={plantsRes.data ?? []}
      totalJournals={countRes.count ?? 0}
    />
  )
}
