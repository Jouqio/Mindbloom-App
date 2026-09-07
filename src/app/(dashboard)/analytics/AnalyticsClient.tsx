// ============================================================
// MindBloom — Analytics Client (Full Page)
// File: src/app/(dashboard)/analytics/AnalyticsClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Smile, Target, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { MoodTrendChart, SummaryStats } from '@/components/analytics/MoodTrendChart'
import { EmotionBarChart, EmotionCategoryBreakdown } from '@/components/analytics/EmotionChart'
import { HabitCompletionChart, HabitMoodBoostChart } from '@/components/analytics/HabitCorrelationChart'
import { CalendarHeatmap } from '@/components/analytics/HabitCorrelationChart'
import { WeeklyReview } from '@/components/analytics/WeeklyReview'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { PERIOD_OPTIONS } from '@/types/analytics'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props { totalEntries: number }

type Tab = 'overview' | 'emotions' | 'habits' | 'calendar' | 'weekly'

export function AnalyticsClient({ totalEntries }: Props) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [tab, setTab]       = useState<Tab>('overview')
  const { data, isLoading, error } = useAnalytics(period)

  const TABS: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: 'overview',  label: 'Ringkasan',  icon: TrendingUp  },
    { key: 'emotions',  label: 'Emosi',      icon: Smile       },
    { key: 'habits',    label: 'Habit',      icon: Target      },
    { key: 'calendar',  label: 'Kalender',   icon: Calendar    },
    { key: 'weekly',    label: 'Mingguan',   icon: BarChart3   },
  ]

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          Analitik
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {totalEntries} jurnal · Tren mood, emosi, dan performa habit
        </p>
      </motion.div>

      {/* Minimum data guard */}
      {totalEntries < 5 && (
        <div className="mb-5 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Butuh lebih banyak jurnal
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Tulis minimal 5 jurnal untuk mendapatkan analitik yang bermakna. Saat ini: {totalEntries} jurnal.
          </p>
          <Link href="/journal/new"
            className="mt-2 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors">
            Tulis sekarang →
          </Link>
        </div>
      )}

      {/* Period selector */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1.5 rounded-xl bg-secondary/60 p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                period === opt.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
      </div>

      {/* Tab nav */}
      <div className="mb-5 flex gap-1 overflow-x-auto pb-1 scrollbar-none" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              tab === key
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-3 py-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Skeleton */}
      {isLoading && !data && (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
          </div>
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
      )}

      {/* Content */}
      {data && (
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <SummaryStats
                avgMood={data.avgMood}
                avgEnergy={data.avgEnergy}
                totalEntries={data.totalEntries}
                streak={data.streakCurrent}
                period={period}
              />
              <MoodTrendChart data={data.moodTrend} showEnergy showStress={false} />
            </motion.div>
          )}

          {tab === 'emotions' && (
            <motion.div key="emotions"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <EmotionCategoryBreakdown emotions={data.emotions} />
              <EmotionBarChart emotions={data.emotions} />
            </motion.div>
          )}

          {tab === 'habits' && (
            <motion.div key="habits"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <HabitCompletionChart habits={data.habits} />
              <HabitMoodBoostChart  habits={data.habits} />
            </motion.div>
          )}

          {tab === 'calendar' && (
            <motion.div key="calendar"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
            >
              <CalendarHeatmap data={data.heatmap} />
            </motion.div>
          )}

          {tab === 'weekly' && (
            <motion.div key="weekly"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
            >
              <WeeklyReview summaries={data.weeklySummaries} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  )
}
