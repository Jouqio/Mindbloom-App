// ============================================================
// MindBloom — Life Wheel Page
// File: src/app/(dashboard)/life-wheel/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LifeWheelClient } from './LifeWheelClient'

export const metadata: Metadata = {
  title: 'Life Wheel',
  description: 'Evaluasi keseimbangan hidupmu dalam 8 dimensi.',
}

export default async function LifeWheelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('life_wheel_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(12)

  return <LifeWheelClient initialEntries={(entries ?? []) as unknown as import('@/types/lifewheel').LifeWheelEntry[]} />
}
