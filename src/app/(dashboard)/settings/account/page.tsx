// ============================================================
// MindBloom — Account Settings Page
// File: src/app/(dashboard)/settings/account/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSettingsClient } from './AccountSettingsClient'

export const metadata: Metadata = {
  title: 'Akun & Data',
  description: 'Ekspor data pribadimu atau hapus akun secara permanen.',
}

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const { count: journalCount } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_draft', false)

  return (
    <AccountSettingsClient
      email={profile?.email ?? user.email ?? ''}
      displayName={profile?.display_name ?? null}
      memberSince={profile?.created_at ?? user.created_at}
      journalCount={journalCount ?? 0}
    />
  )
}
