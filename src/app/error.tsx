// ============================================================
// MindBloom — Global Error Boundary
// File: src/app/error.tsx
// Catches unexpected render errors anywhere in the app tree.
// Must be a Client Component — Next.js requirement for error.tsx.
// ============================================================

'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In production, wire this up to an error monitoring service
    // (e.g. Sentry) so you actually find out when this fires.
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-medium text-foreground">Terjadi kesalahan</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Maaf, sesuatu tidak berjalan sebagaimana mestinya. Tim kami akan segera menyelidikinya.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity"
        >
          Coba lagi
        </button>
        <a
          href="/dashboard"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Ke Beranda
        </a>
      </div>
    </main>
  )
}
