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
      <div className="mx-auto max-w-5xl px-4 py-8 pb-28 md:px-8 md:pb-14">
        <DashboardSkeleton />
      </div>
    }>
      <DashboardClient />
    </Suspense>
  )
}
