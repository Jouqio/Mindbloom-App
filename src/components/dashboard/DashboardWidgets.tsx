// ============================================================
// MindBloom — Dashboard Widgets
// File: src/components/dashboard/DashboardWidgets.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Flame, PenLine, TrendingUp, Sparkles,
  ChevronLeft, ChevronRight, Target,
} from 'lucide-react'
import { useDashboard, useMoodCalendar, useGreeting } from '@/lib/hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'
import { MOOD_CONFIG, type MoodCategory, type DashboardData } from '@/types/dashboard'
import { cn } from '@/lib/utils'

// ── Shared animation variants ─────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 12, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.06 },
  }),
}

// ────────────────────────────────────────────────────────────
// 1. GREETING BANNER
// ────────────────────────────────────────────────────────────
export function GreetingBanner() {
  const { profile }  = useAuthStore()
  const greeting     = useGreeting(profile?.display_name ?? profile?.full_name ?? null)
  const hasJournalToday = false // will come from useDashboard

  return (
    <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-foreground">{greeting} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasJournalToday
              ? 'Jurnal harianmu sudah tersimpan. Kerja bagus!'
              : 'Bagaimana harimu? Yuk tulis jurnal hari ini.'}
          </p>
        </div>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl" aria-hidden="true">
          🌱
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. QUICK JOURNAL BANNER
// ────────────────────────────────────────────────────────────
export function QuickJournalBanner({ hasJournalToday }: { hasJournalToday: boolean }) {
  const router = useRouter()

  if (hasJournalToday) {
    return (
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-950/20 px-4 py-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <span className="text-sm" aria-hidden="true">✅</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Jurnal hari ini sudah selesai</p>
            <p className="text-xs text-green-600 dark:text-green-400">Kamu konsisten! Streak terjaga.</p>
          </div>
          <Link href="/journal/new"
            className="rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-green-900/30 px-2.5 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 hover:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Edit
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
      <motion.button
        onClick={() => router.push('/journal/new')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex w-full items-center gap-4 rounded-2xl border border-border bg-background px-4 py-4 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Mulai menulis jurnal hari ini"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <PenLine className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Tulis jurnal hari ini</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Refleksikan harimu dalam 5–10 menit</p>
        </div>
        <div className="flex-shrink-0 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background">
          Mulai
        </div>
      </motion.button>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 3. STATS GRID (Streak + Level + Mood)
// ────────────────────────────────────────────────────────────
export function StatsGrid({ data }: { data: DashboardData | null }) {
  const streak      = data?.streak.current_streak  ?? 0
  const totalEntries= data?.streak.total_entries   ?? 0
  const level       = data?.xp.current_level       ?? 1
  const xpProgress  = data
    ? Math.round((data.xp.total_xp % (data.xp.xp_to_next || 100)) / (data.xp.xp_to_next || 100) * 100)
    : 0
  const moodToday   = data?.mood_today

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Streak */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">Streak</span>
        </div>
        <p className="text-2xl font-medium text-foreground" aria-label={`${streak} hari streak`}>
          {streak}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">hari berturut</p>
      </motion.div>

      {/* Total journals */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">Total</span>
        </div>
        <p className="text-2xl font-medium text-foreground" aria-label={`${totalEntries} total jurnal`}>
          {totalEntries}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">jurnal ditulis</p>
      </motion.div>

      {/* Mood today */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">Mood</span>
        </div>
        {moodToday ? (
          <>
            <p className="text-2xl font-medium" aria-label={`Mood hari ini: ${MOOD_CONFIG[moodToday.category]?.label}`}>
              {MOOD_CONFIG[moodToday.category]?.emoji ?? '😊'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {MOOD_CONFIG[moodToday.category]?.label ?? 'Baik'}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-medium text-muted-foreground/40">—</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Belum dicatat</p>
          </>
        )}
      </motion.div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 4. MOOD CALENDAR
// ────────────────────────────────────────────────────────────
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS   = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

export function MoodCalendar() {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1) // 1-based

  const { days, isLoading } = useMoodCalendar(viewYear, viewMonth)

  // Build day map for O(1) lookup
  const dayMap = new Map(days.map((d) => [d.entry_date, d]))

  // Calculate calendar grid
  const firstDay  = new Date(viewYear, viewMonth - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1
    if (isCurrentMonth) return
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1) }
    else setViewMonth((m) => m + 1)
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1
  const isFutureMonth  = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth() + 1)

  return (
    <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
      className="rounded-2xl border border-border bg-background p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">
          Kalender Mood — {MONTHS[viewMonth - 1]} {viewYear}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth || isFutureMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`Kalender ${MONTHS[viewMonth - 1]} ${viewYear}`}>
        {/* Empty cells for first week offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} aria-hidden="true" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day  = i + 1
          const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const entry = dayMap.get(dateStr)
          const isToday = dateStr === today.toISOString().split('T')[0]
          const isFuture = new Date(dateStr) > today

          const moodCfg = entry ? MOOD_CONFIG[entry.mood_category as MoodCategory] : null

          return (
            <div
              key={day}
              role="gridcell"
              aria-label={`${day} ${MONTHS[viewMonth - 1]}${entry ? `, mood: ${moodCfg?.label}` : ', tidak ada jurnal'}`}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium transition-all cursor-default',
                isToday && !entry && 'ring-1 ring-primary ring-offset-1 bg-primary text-primary-foreground',
                !isToday && !entry && !isFuture && 'text-muted-foreground/50 hover:bg-secondary/50',
                isFuture && 'text-muted-foreground/30',
                entry && !isToday && 'hover:opacity-80 cursor-pointer',
              )}
              style={
                entry && !isToday
                  ? { background: moodCfg?.bg, color: moodCfg?.color }
                  : undefined
              }
            >
              {isLoading && !entry ? (
                <div className="h-3 w-3 animate-pulse rounded-full bg-muted" aria-hidden="true" />
              ) : (
                day
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {(Object.entries(MOOD_CONFIG) as [MoodCategory, typeof MOOD_CONFIG[MoodCategory]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm flex-shrink-0" style={{ background: cfg.color }} aria-hidden="true" />
            <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 5. AI INSIGHT CARD
// ────────────────────────────────────────────────────────────
export function AIInsightCard() {
  return (
    <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm" aria-hidden="true">
            ✨
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-medium text-primary">Insight Hari Ini</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Bloom</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Mulai tulis jurnal pertamamu untuk mendapatkan insight personal dari Bloom AI.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href="/journal/new"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Tulis jurnal
          </Link>
          <Link href="/coach"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Chat dengan Bloom
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 6. SKELETON LOADING
// ────────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-6 w-48 rounded-lg bg-muted mb-2" />
          <div className="h-4 w-64 rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-muted flex-shrink-0" />
      </div>
      <div className="h-[72px] rounded-2xl bg-muted" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-muted" />
      <div className="h-28 rounded-2xl bg-muted" />
    </div>
  )
}
