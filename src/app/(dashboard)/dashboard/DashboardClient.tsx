// ============================================================
// MindBloom — Dashboard Client Component
// File: src/app/(dashboard)/dashboard/DashboardClient.tsx
// ============================================================

'use client'

import { useDashboard } from '@/lib/hooks/useDashboard'
import {
  GreetingBanner,
  QuickJournalBanner,
  StatsGrid,
  MoodCalendar,
  AIInsightCard,
  DashboardSkeleton,
} from '@/components/dashboard/DashboardWidgets'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function DashboardClient() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Gagal memuat dashboard</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  const hasJournalToday = !!data?.mood_today

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      <div className="flex flex-col gap-4">
        {/* Greeting */}
        <GreetingBanner />

        {/* Quick journal CTA */}
        <QuickJournalBanner hasJournalToday={hasJournalToday} />

        {/* Stats row */}
        <StatsGrid data={data} />

        {/* AI Insight */}
        <AIInsightCard />

        {/* Mood Calendar */}
        <MoodCalendar />
      </div>
    </main>
  )
}
