// ============================================================
// MindBloom — Onboarding Page
// File: src/app/(auth)/onboarding/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'

export const metadata: Metadata = {
  title: 'Selamat Datang — MindBloom',
  description: 'Selesaikan setup akunmu dan mulai perjalanan refleksi harian.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If already onboarded, go to dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('id', user.id)
    .single()

  if (profile?.onboarded_at) {
    redirect('/dashboard')
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at 20% 20%, rgba(127,119,221,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(29,158,117,0.05) 0%, transparent 50%)',
      }}
    >
      <OnboardingForm />
    </div>
  )
}
