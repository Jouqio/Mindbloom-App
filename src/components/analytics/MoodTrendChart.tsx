// ============================================================
// MindBloom — Mood Trend Chart (Recharts)
// File: src/components/analytics/MoodTrendChart.tsx
// ============================================================

'use client'

import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend, Bar,
} from 'recharts'
import type { MoodDataPoint } from '@/types/analytics'
import { CHART_COLORS } from '@/types/analytics'
import { cn } from '@/lib/utils'

// ── Custom tooltip ────────────────────────────────────────────
function MoodTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

interface MoodTrendChartProps {
  data:         MoodDataPoint[]
  showEnergy?:  boolean
  showStress?:  boolean
  className?:   string
}

export function MoodTrendChart({
  data, showEnergy = true, showStress = false, className,
}: MoodTrendChartProps) {
  const hasData = data.some((d) => d.mood !== null)

  if (!hasData) {
    return (
      <div className={cn('flex items-center justify-center rounded-2xl border border-border bg-background py-16', className)}>
        <p className="text-sm text-muted-foreground">Tulis lebih banyak jurnal untuk melihat tren mood</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-4 text-sm font-medium text-foreground">Tren Mood & Energi</p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip content={<MoodTooltip />} />

          {/* Average reference line */}
          {data.some((d) => d.mood !== null) && (
            <ReferenceLine
              y={Math.round(
                data.filter((d) => d.mood !== null).reduce((s, d) => s + d.mood!, 0) /
                data.filter((d) => d.mood !== null).length * 10
              ) / 10}
              stroke={CHART_COLORS.reference}
              strokeDasharray="4 3"
              strokeWidth={1.5}
            />
          )}

          {/* Mood area + line */}
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS.mood} stopOpacity={0.15} />
              <stop offset="95%" stopColor={CHART_COLORS.mood} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="mood"
            name="Mood"
            fill="url(#moodGradient)"
            stroke={CHART_COLORS.mood}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS.mood }}
            connectNulls
          />

          {/* Energy line */}
          {showEnergy && (
            <Line
              type="monotone"
              dataKey="energy"
              name="Energi (×10)"
              stroke={CHART_COLORS.energy}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              strokeDasharray="5 3"
              connectNulls
            />
          )}

          {/* Stress bars */}
          {showStress && (
            <Bar
              dataKey="stress"
              name="Stres"
              fill={CHART_COLORS.stress}
              opacity={0.3}
              radius={[2, 2, 0, 0]}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Summary stats row ─────────────────────────────────────────
interface SummaryStatsProps {
  avgMood:      number | null
  avgEnergy:    number | null
  totalEntries: number
  streak:       number
  period:       string
}

export function SummaryStats({ avgMood, avgEnergy, totalEntries, streak, period }: SummaryStatsProps) {
  const stats = [
    {
      label: 'Rata-rata mood',
      value: avgMood !== null ? `${avgMood}/10` : '—',
      emoji: '💭',
      color: '#7F77DD',
    },
    {
      label: 'Rata-rata energi',
      value: avgEnergy !== null ? `${avgEnergy}%` : '—',
      emoji: '⚡',
      color: '#EF9F27',
    },
    {
      label: `Jurnal (${period})`,
      value: String(totalEntries),
      emoji: '📝',
      color: '#1D9E75',
    },
    {
      label: 'Streak saat ini',
      value: `${streak} hari`,
      emoji: '🔥',
      color: '#D85A30',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-background p-4 text-center">
          <div className="mb-1 text-xl" aria-hidden="true">{s.emoji}</div>
          <p className="text-lg font-medium text-foreground" style={{ color: s.color }}>{s.value}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
