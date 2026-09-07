// ============================================================
// MindBloom — Subscription Settings Page
// File: src/app/(dashboard)/settings/subscription/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionSettingsClient } from './SubscriptionSettingsClient'

export const metadata: Metadata = {
  title: 'Langganan',
  description: 'Kelola paket langganan dan riwayat pembayaranmu.',
}

export default async function SubscriptionSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <SubscriptionSettingsClient />
}
