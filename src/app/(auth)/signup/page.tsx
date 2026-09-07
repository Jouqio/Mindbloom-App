import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthCard, AuthDivider, AuthFooter } from '@/components/auth/AuthCard'
import { SignupForm } from '@/components/auth/SignupForm'
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'
export const metadata: Metadata = { title: 'Daftar', description: 'Buat akun MindBloom gratis.' }
export default function SignupPage() {
  return (
    <>
      <AuthCard title="Mulai perjalananmu" subtitle="Gratis selamanya · Tidak perlu kartu kredit">
        <Suspense fallback={<div className="h-11 w-full animate-pulse rounded-xl bg-muted" />}>
          <GoogleOAuthButton mode="signup" />
        </Suspense>
        <AuthDivider />
        <Suspense fallback={<div className="space-y-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />)}</div>}>
          <SignupForm />
        </Suspense>
      </AuthCard>
      <AuthFooter question="Sudah punya akun?" linkText="Masuk" href="/login" />
    </>
  )
}
