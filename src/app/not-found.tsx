// ============================================================
// MindBloom — 404 Not Found Page
// File: src/app/not-found.tsx
// ============================================================

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl" aria-hidden="true">🌱</div>
      <h1 className="text-2xl font-medium text-foreground">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Sepertinya kamu tersesat di taman yang belum ditanami. Mari kembali ke jalan yang benar.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity"
      >
        Kembali ke Beranda
      </Link>
    </main>
  )
}
