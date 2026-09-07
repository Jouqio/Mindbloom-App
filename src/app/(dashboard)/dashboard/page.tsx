// ============================================================
// MindBloom — Dashboard Page (Full)
// File: src/app/(dashboard)/dashboard/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardClient } from './DashboardClient'
import { DashboardSkeleton } from '@/components/dashboard/DashboardWidgets'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Pantau perjalanan refleksi harianmu di MindBloom.',
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <DashboardSkeleton />
      </div>
    }>
      <DashboardClient />
    </Suspense>
  )
}
