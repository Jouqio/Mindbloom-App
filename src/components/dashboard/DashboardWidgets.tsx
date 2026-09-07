// ============================================================
// MindBloom — Dashboard Widgets (Hallmark Garden Edition)
// File: src/components/dashboard/DashboardWidgets.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  PenLine,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Compass,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useMoodCalendar, useGreeting } from '@/lib/hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'
import {
  MOOD_CONFIG,
  GARDEN_LEVEL_CONFIG,
  type MoodCategory,
  type DashboardData,
} from '@/types/dashboard'
import { cn } from '@/lib/utils'
import {
  MindBloomEmblem,
  StreakSprout,
  MindfulSpark,
  JournalSealCheck,
} from '@/components/ui/BotanicalIcons'

// ── Motion Variant: Hallmark Calm Exponential Ease-Out (Gate 12) ──
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.05,
    },
  }),
}

// ────────────────────────────────────────────────────────────
// 1. GREETING BANNER — Editorial Headline & Botanical Emblem
// ────────────────────────────────────────────────────────────
export function GreetingBanner() {
  const { profile } = useAuthStore()
  const greeting = useGreeting(profile?.display_name ?? profile?.full_name ?? null)

  const todayDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/60 p-6 md:p-7 backdrop-blur-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
            <span>Taman Refleksi • {todayDateStr}</span>
          </div>
          <MindBloomEmblem size={26} className="text-primary flex-shrink-0 opacity-85" />
        </div>

        <div className="mt-1">
          {/* Gate 38a: Serif header must be roman, not italic */}
          <h1 className="font-display text-2xl md:text-3xl font-normal tracking-tight text-foreground">
            {greeting}
          </h1>
          <p className="mt-1.5 text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl">
            Luangkan sejenak waktu untuk menyiram kejernihan batin dan merawat keheningan pikiranmu hari ini.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. QUICK JOURNAL BANNER — Thoughtful Action Prompt
// ────────────────────────────────────────────────────────────
export function QuickJournalBanner({ hasJournalToday }: { hasJournalToday: boolean }) {
  const router = useRouter()

  if (hasJournalToday) {
    return (
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="h-full">
        <div className="flex h-full flex-col justify-between rounded-2xl border border-primary/25 bg-primary/[0.04] p-5 md:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <JournalSealCheck size={22} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Refleksi Selesai
              </p>
              <h2 className="mt-0.5 font-display text-lg font-normal text-foreground">
                Jurnal hari ini telah tersimpan
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Benih kesadaranmu telah tertanam. Ritme kebiasaan tetap terjaga utuh.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <PenLine className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              Perbarui Catatan
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="h-full">
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 md:p-6 transition-colors hover:border-primary/40">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PenLine className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Ruang Hening Hari Ini
            </p>
            <h2 className="mt-0.5 font-display text-lg font-normal text-foreground">
              Buka lembaran jurnal baru
            </h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Tuliskan apa pun yang melintas di pikiranmu dalam 5–10 menit untuk menemukan kejelasan.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground">
            Langkah kecil menuju ketenangan
          </span>
          <button
            onClick={() => router.push('/journal/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2"
            aria-label="Mulai menulis jurnal hari ini"
          >
            <span>Tulis Refleksi</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 3. ASYMMETRIC BENTO TILES: Streak & Mood State (Gate 3 Fix)
// ────────────────────────────────────────────────────────────

export function StreakTile({ data }: { data: DashboardData | null }) {
  const streak       = data?.streak.current_streak  ?? 0
  const totalEntries = data?.streak.total_entries   ?? 0
  const gardenLevel  = data?.garden_level           ?? 'seed'
  const levelInfo    = GARDEN_LEVEL_CONFIG[gardenLevel] ?? { label: 'Benih', emoji: '🌱' }

  return (
    <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="h-full">
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-5">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StreakSprout size={18} className="text-primary" />
              <span className="text-xs font-medium text-foreground tracking-tight">
                Ritme Konsistensi
              </span>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Tahap: {levelInfo.label}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="font-display text-4xl font-medium tracking-tight text-foreground tabular-nums"
              aria-label={`${streak} hari konsisten`}
            >
              {streak}
            </span>
            <span className="text-xs text-muted-foreground">hari berturut-turut</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>Total Catatan</span>
          </div>
          <span className="font-medium text-foreground tabular-nums">
            {totalEntries} refleksi
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function MoodTodayTile({ data }: { data: DashboardData | null }) {
  const moodToday = data?.mood_today

  return (
    <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
      <div className="rounded-2xl border border-border/80 bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground tracking-tight">
            Kondisi Batin Hari Ini
          </span>
          <Compass className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="mt-3">
          {moodToday ? (
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-medium"
                style={{
                  backgroundColor: `${MOOD_CONFIG[moodToday.category]?.color}20`,
                  color: MOOD_CONFIG[moodToday.category]?.color,
                }}
              >
                ●
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {MOOD_CONFIG[moodToday.category]?.label ?? 'Tenang'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Tercatat dalam jurnal hari ini
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Belum dicatat</p>
                <p className="text-[11px] text-muted-foreground">
                  Bagikan suasana batinmu saat menulis jurnal
                </p>
              </div>
              <Link
                href="/journal/new"
                className="text-xs font-medium text-primary hover:underline"
              >
                Catat &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Backward-compatible StatsGrid (renders asymmetric duo, never 3 equal cards)
export function StatsGrid({ data }: { data: DashboardData | null }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-7">
        <StreakTile data={data} />
      </div>
      <div className="md:col-span-5">
        <MoodTodayTile data={data} />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 4. MOOD CALENDAR — Meditative Rhythm Matrix
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

  const dayMap = new Map(days.map((d) => [d.entry_date, d]))
  const firstDay  = new Date(viewYear, viewMonth - 1, 1).getDay()
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
    <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="h-full">
      <div className="flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 md:p-6">
        <div>
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h2 className="text-sm font-medium text-foreground tracking-tight">
                Ritme Batin — {MONTHS[viewMonth - 1]} {viewYear}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 hover:bg-secondary transition-colors"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth || isFutureMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/80 py-0.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={`Kalender ${MONTHS[viewMonth - 1]} ${viewYear}`}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} aria-hidden="true" />
            ))}

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
                  aria-label={`${day} ${MONTHS[viewMonth - 1]}${entry ? `, mood: ${moodCfg?.label}` : ', tidak ada catatan'}`}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-default relative',
                    isToday && !entry && 'ring-1 ring-primary ring-offset-1 bg-primary/10 text-primary font-semibold',
                    !isToday && !entry && !isFuture && 'text-muted-foreground/60 hover:bg-secondary/60',
                    isFuture && 'text-muted-foreground/30',
                    entry && 'cursor-pointer hover:opacity-90',
                  )}
                  style={
                    entry
                      ? {
                          backgroundColor: `${moodCfg?.color}25`,
                          color: moodCfg?.color,
                          border: `1px solid ${moodCfg?.color}40`,
                        }
                      : undefined
                  }
                >
                  {isLoading && !entry ? (
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted" aria-hidden="true" />
                  ) : (
                    <>
                      <span className="text-[11px] tabular-nums">{day}</span>
                      {entry && (
                        <span
                          className="h-1 w-1 rounded-full mt-0.5"
                          style={{ backgroundColor: moodCfg?.color }}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-x-3 gap-y-1.5">
          {(Object.entries(MOOD_CONFIG) as [MoodCategory, typeof MOOD_CONFIG[MoodCategory]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} aria-hidden="true" />
              <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 5. AI INSIGHT CARD — Guided Reflection Coach
// ────────────────────────────────────────────────────────────
export function AIInsightCard() {
  return (
    <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <MindfulSpark size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">Bimbingan Bloom</span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                AI Coach
              </span>
            </div>
            <p className="text-xs md:text-sm text-foreground leading-relaxed">
              Refleksi berkala membantu mengenali pola emosi tersembunyi. Mulailah mencurahkan isi hati untuk mendapatkan rangkuman bijak dari Bloom.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href="/coach"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span>Bincang dengan Coach</span>
          </Link>
          <Link
            href="/garden"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <span>Kunjungi Taman Batin</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 6. SKELETON LOADING — Matches Asymmetric Bento Layout
// ────────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Greeting Banner skeleton */}
      <div className="h-32 rounded-2xl bg-muted/60" />

      {/* Middle row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7 h-44 rounded-2xl bg-muted/60" />
        <div className="md:col-span-5 h-44 rounded-2xl bg-muted/60" />
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7 h-72 rounded-2xl bg-muted/60" />
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="h-28 rounded-2xl bg-muted/60" />
          <div className="h-40 rounded-2xl bg-muted/60" />
        </div>
      </div>
    </div>
  )
}

