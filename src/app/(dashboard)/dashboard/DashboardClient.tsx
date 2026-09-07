// ============================================================
// MindBloom — Dashboard Client Component (Hallmark Garden Edition)
// File: src/app/(dashboard)/dashboard/DashboardClient.tsx
// ============================================================

'use client'

import { useDashboard } from '@/lib/hooks/useDashboard'
import {
  GreetingBanner,
  QuickJournalBanner,
  StreakTile,
  MoodTodayTile,
  MoodCalendar,
  AIInsightCard,
  DashboardSkeleton,
} from '@/components/dashboard/DashboardWidgets'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function DashboardClient() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 pb-28 md:px-8 md:pb-14">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/80 bg-card p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-lg font-normal text-foreground">Gagal memuat dashboard</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 rounded-lg border border-border/80 bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  const hasJournalToday = !!data?.mood_today

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-28 md:px-8 md:pb-14">
      {/* Asymmetric Bento Grid (Editorial Garden Macrostructure) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Row 1: Greeting Headline & Emblem (Full Width) */}
        <div className="col-span-12">
          <GreetingBanner />
        </div>

        {/* Row 2: Daily Reflection CTA (Span 7) & Consistency Pulse (Span 5) */}
        <div className="col-span-12 md:col-span-7">
          <QuickJournalBanner hasJournalToday={hasJournalToday} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <StreakTile data={data} />
        </div>

        {/* Row 3: Monthly Rhythm Matrix (Span 7) & Coaching Stack (Span 5) */}
        <div className="col-span-12 md:col-span-7">
          <MoodCalendar />
        </div>
        <div className="col-span-12 md:col-span-5 flex flex-col gap-5">
          <MoodTodayTile data={data} />
          <AIInsightCard />
        </div>
      </div>
    </main>
  )
}

