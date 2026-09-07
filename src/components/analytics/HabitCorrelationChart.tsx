// ============================================================
// MindBloom — Habit Correlation Chart
// File: src/components/analytics/HabitCorrelationChart.tsx
// ============================================================

'use client'

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine,
} from 'recharts'
import type { HabitPerformance } from '@/types/analytics'
import { cn } from '@/lib/utils'

function HabitTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload as HabitPerformance
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-xs shadow-lg">
      <p className="font-medium text-foreground">
        {d.emoji} {d.habit_name}
      </p>
      <p className="mt-1 text-muted-foreground">
        Selesai: {d.completed_days} dari {d.total_days} hari ({d.completion_pct}%)
      </p>
      {d.mood_boost !== null && (
        <p className={d.mood_boost >= 0 ? 'text-green-600' : 'text-red-400'}>
          Efek mood: {d.mood_boost >= 0 ? '+' : ''}{d.mood_boost} poin
        </p>
      )}
    </div>
  )
}

interface HabitChartProps {
  habits:    HabitPerformance[]
  className?:string
}

// ── Completion rate bar chart ─────────────────────────────────
export function HabitCompletionChart({ habits, className }: HabitChartProps) {
  if (habits.length === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-2xl border border-border bg-background py-12', className)}>
        <p className="text-sm text-muted-foreground">Tambahkan habit untuk melihat analitik</p>
      </div>
    )
  }

  const top8 = habits.slice(0, 8)

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-4 text-sm font-medium text-foreground">Konsistensi Habit</p>
      <ResponsiveContainer width="100%" height={Math.max(160, top8.length * 36)}>
        <BarChart
          data={top8}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="habit_name"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={80}
            tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v}
          />
          <Tooltip content={<HabitTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <ReferenceLine x={70} stroke="rgba(29,158,117,0.3)" strokeDasharray="3 3" />
          <Bar dataKey="completion_pct" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {top8.map((h, i) => (
              <Cell key={i} fill={h.color} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Mood boost per habit ──────────────────────────────────────
export function HabitMoodBoostChart({ habits, className }: HabitChartProps) {
  const withBoost = habits
    .filter((h) => h.mood_boost !== null && h.completed_days >= 3)
    .sort((a, b) => (b.mood_boost ?? 0) - (a.mood_boost ?? 0))
    .slice(0, 6)

  if (withBoost.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
        <p className="mb-2 text-sm font-medium text-foreground">Efek Habit pada Mood</p>
        <p className="text-xs text-muted-foreground">
          Butuh minimal 3 check-in per habit untuk menghitung korelasi mood.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-1 text-sm font-medium text-foreground">Efek Habit pada Mood</p>
      <p className="mb-4 text-xs text-muted-foreground">
        Selisih rata-rata mood saat habit selesai vs terlewat
      </p>
      <div className="flex flex-col gap-3">
        {withBoost.map((h) => {
          const boost = h.mood_boost ?? 0
          const isPos = boost >= 0
          return (
            <div key={h.habit_id} className="flex items-center gap-3">
              <span className="text-base flex-shrink-0" aria-hidden="true">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{h.habit_name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.abs(boost) * 20)}%`,
                        background: isPos ? '#1D9E75' : '#E24B4A',
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium flex-shrink-0 font-mono"
                    style={{ color: isPos ? '#1D9E75' : '#E24B4A' }}
                  >
                    {isPos ? '+' : ''}{boost}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ============================================================
// MindBloom — Calendar Heatmap
// File: src/components/analytics/CalendarHeatmap.tsx
// ============================================================

import { motion } from 'framer-motion'
import type { MonthlyHeatmapDay } from '@/types/analytics'

function getMoodColor(score: number | null, hasEntry: boolean): string {
  if (!hasEntry) return 'transparent'
  if (score === null) return 'rgba(127,119,221,0.15)'
  if (score >= 8)  return '#1D9E75'
  if (score >= 6)  return '#4ADE80'
  if (score >= 4)  return '#EF9F27'
  if (score >= 2)  return '#D85A30'
  return '#E24B4A'
}

interface CalendarHeatmapProps {
  data:      MonthlyHeatmapDay[]
  className?:string
}

export function CalendarHeatmap({ data, className }: CalendarHeatmapProps) {
  const weekdays = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

  // Group into weeks
  const firstDate = data[0] ? new Date(data[0].date + 'T00:00:00') : new Date()
  const firstDow  = firstDate.getDay()

  const cells: (MonthlyHeatmapDay | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...data,
  ]

  const weeks: (MonthlyHeatmapDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-3 text-sm font-medium text-foreground">Kalender Aktivitas</p>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[9px] text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Week rows */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} />
              const color    = getMoodColor(day.mood_score, day.has_entry)
              const label    = new Date(day.date + 'T00:00:00').toLocaleDateString('id-ID', {
                day:'numeric', month:'short',
              })
              const isToday  = day.date === new Date().toISOString().split('T')[0]

              return (
                <motion.div
                  key={day.date}
                  title={day.has_entry
                    ? `${label}: mood ${day.mood_score ?? 'N/A'}/10`
                    : `${label}: tidak ada jurnal`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.005 }}
                  className={cn(
                    'aspect-square rounded-md border',
                    isToday ? 'border-primary' : 'border-transparent',
                    !day.has_entry && 'bg-secondary/40',
                  )}
                  style={day.has_entry ? { background: color } : undefined}
                  aria-label={day.has_entry ? `${label}: mood ${day.mood_score ?? 'ada jurnal'}` : label}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Mood:</span>
        {[
          { color: '#E24B4A', label: '1-2' },
          { color: '#D85A30', label: '3-4' },
          { color: '#EF9F27', label: '5-6' },
          { color: '#4ADE80', label: '7-8' },
          { color: '#1D9E75', label: '9-10' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
            <span className="text-[9px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// (cn helper imported from @/lib/utils at top of file — no local redeclaration needed)
