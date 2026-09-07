// ============================================================
// MindBloom — Reset Password Page
// File: src/app/(auth)/reset-password/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Buat password baru untuk akun MindBloom kamu.',
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Buat password baru"
      subtitle="Password baru harus berbeda dari password sebelumnya"
    >
      <Suspense fallback={
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
