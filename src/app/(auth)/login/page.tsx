import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthCard, AuthDivider, AuthFooter } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'
export const metadata: Metadata = { title: 'Masuk', description: 'Masuk ke akun MindBloom kamu.' }
export default function LoginPage() {
  return (
    <>
      <AuthCard title="Selamat datang kembali" subtitle="Lanjutkan perjalanan refleksimu hari ini">
        <Suspense fallback={<div className="h-11 w-full animate-pulse rounded-xl bg-muted" />}>
          <GoogleOAuthButton mode="login" />
        </Suspense>
        <AuthDivider />
        <Suspense fallback={<div className="space-y-4"><div className="h-10 animate-pulse rounded-xl bg-muted" /><div className="h-10 animate-pulse rounded-xl bg-muted" /><div className="h-10 animate-pulse rounded-xl bg-muted" /></div>}>
          <LoginForm />
        </Suspense>
      </AuthCard>
      <AuthFooter question="Belum punya akun?" linkText="Daftar gratis" href="/signup" />
    </>
  )
}
