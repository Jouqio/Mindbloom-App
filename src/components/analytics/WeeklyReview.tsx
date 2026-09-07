// ============================================================
// MindBloom — Weekly Review Cards
// File: src/components/analytics/WeeklyReview.tsx
// ============================================================

'use client'

import { motion } from 'framer-motion'
import type { WeeklySummary } from '@/types/analytics'
import { cn } from '@/lib/utils'

interface WeeklyReviewProps {
  summaries: WeeklySummary[]
  className?:string
}

function getMoodEmoji(avg: number | null): string {
  if (avg === null) return '📅'
  if (avg >= 8)  return '😄'
  if (avg >= 6)  return '😊'
  if (avg >= 4)  return '😐'
  if (avg >= 2)  return '😔'
  return '😢'
}

function getMoodColor(avg: number | null): string {
  if (avg === null) return '#888780'
  if (avg >= 8)  return '#1D9E75'
  if (avg >= 6)  return '#4ADE80'
  if (avg >= 4)  return '#EF9F27'
  if (avg >= 2)  return '#D85A30'
  return '#E24B4A'
}

export function WeeklyReview({ summaries, className }: WeeklyReviewProps) {
  if (summaries.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-border bg-background p-6 text-center', className)}>
        <p className="text-sm text-muted-foreground">
          Tulis jurnal secara konsisten untuk melihat review mingguan
        </p>
      </div>
    )
  }

  // Show last 4 weeks
  const shown = summaries.slice(-4).reverse()

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-4 text-sm font-medium text-foreground">Review Mingguan</p>
      <div className="flex flex-col gap-3">
        {shown.map((w, i) => {
          const isLatest     = i === 0
          const habitPct     = w.total_habits > 0
            ? Math.round((w.habits_completed / w.total_habits) * 100)
            : 0
          const moodColor    = getMoodColor(w.avg_mood)
          const moodEmoji    = getMoodEmoji(w.avg_mood)

          return (
            <motion.div
              key={w.week_label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'rounded-xl border p-3.5 transition-all',
                isLatest ? 'border-primary/30 bg-primary/[0.02]' : 'border-border'
              )}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">{w.week_label}</p>
                  {isLatest && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Minggu ini
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl" aria-hidden="true">{moodEmoji}</span>
                  <span className="text-lg font-medium" style={{ color: moodColor }}>
                    {w.avg_mood ?? '—'}
                  </span>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-secondary/50 px-2 py-1.5 text-center">
                  <p className="text-xs font-medium text-foreground">{w.entries_written}</p>
                  <p className="text-[9px] text-muted-foreground">jurnal</p>
                </div>
                <div className="rounded-lg bg-secondary/50 px-2 py-1.5 text-center">
                  <p className="text-xs font-medium text-foreground">{habitPct}%</p>
                  <p className="text-[9px] text-muted-foreground">habit</p>
                </div>
                <div className="rounded-lg bg-secondary/50 px-2 py-1.5 text-center">
                  <p className="text-xs font-medium text-foreground truncate">
                    {w.top_emotion ?? '—'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">emosi</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
