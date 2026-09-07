// ============================================================
// MindBloom — Pricing Page
// File: src/app/(dashboard)/pricing/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PricingClient } from './PricingClient'

export const metadata: Metadata = {
  title: 'Paket Harga',
  description: 'Pilih paket yang sesuai dengan kebutuhan refleksimu.',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <PricingClient />
}
