// ============================================================
// MindBloom — Emotion Chart Components (Recharts)
// File: src/components/analytics/EmotionChart.tsx
// ============================================================

'use client'

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'
import type { EmotionFrequency } from '@/types/analytics'
import { cn } from '@/lib/utils'

// ── Custom tooltip ────────────────────────────────────────────
function EmotionTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload as EmotionFrequency
  return (
    <div className="rounded-xl border border-border bg-background p-2.5 text-xs shadow-lg">
      <p className="font-medium capitalize text-foreground">{d.emotion}</p>
      <p className="text-muted-foreground">{d.count} kali muncul</p>
      <p className="text-[10px] capitalize" style={{ color: d.color }}>
        {d.category === 'positive' ? 'Positif' : d.category === 'negative' ? 'Berat' : 'Netral'}
      </p>
    </div>
  )
}

interface EmotionChartProps {
  emotions:  EmotionFrequency[]
  className?:string
}

export function EmotionBarChart({ emotions, className }: EmotionChartProps) {
  if (emotions.length === 0) {
    return (
      <div className={cn('flex items-center justify-center rounded-2xl border border-border bg-background py-12', className)}>
        <p className="text-sm text-muted-foreground">Belum ada data emosi</p>
      </div>
    )
  }

  // Take top 8 for readability
  const chartData = emotions.slice(0, 8)

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-4 text-sm font-medium text-foreground">Emosi yang Paling Sering Dirasakan</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="emotion"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip content={<EmotionTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Emotion category breakdown ────────────────────────────────
export function EmotionCategoryBreakdown({ emotions, className }: EmotionChartProps) {
  const positiveTotal = emotions
    .filter((e) => e.category === 'positive')
    .reduce((s, e) => s + e.count, 0)
  const negativeTotal = emotions
    .filter((e) => e.category === 'negative')
    .reduce((s, e) => s + e.count, 0)
  const neutralTotal = emotions
    .filter((e) => e.category === 'neutral')
    .reduce((s, e) => s + e.count, 0)
  const grand = positiveTotal + negativeTotal + neutralTotal || 1

  const cats = [
    { label: 'Positif',  count: positiveTotal, color: '#1D9E75', bg: '#E1F5EE', emoji: '✨' },
    { label: 'Berat',    count: negativeTotal, color: '#7F77DD', bg: '#EEEDFE', emoji: '💭' },
    { label: 'Netral',   count: neutralTotal,  color: '#888780', bg: '#F1EFE8', emoji: '😐' },
  ]

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <p className="mb-3 text-sm font-medium text-foreground">Distribusi Emosi</p>
      <div className="flex flex-col gap-3">
        {cats.map((c) => {
          const pct = Math.round((c.count / grand) * 100)
          return (
            <div key={c.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.label}
                </span>
                <span className="text-muted-foreground font-mono">
                  {c.count}× ({pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: c.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Insight text */}
      <div className="mt-3 rounded-xl px-3 py-2 text-xs text-muted-foreground"
        style={{ background: cats[0].bg }}>
        {positiveTotal > negativeTotal
          ? <span style={{ color: cats[0].color }}>
              Emosi positif mendominasi — kamu sedang dalam kondisi yang baik! 🌱
            </span>
          : positiveTotal === negativeTotal
          ? <span>Emosi positif dan berat seimbang — kamu navigasi dengan baik.</span>
          : <span style={{ color: cats[1].color }}>
              Emosi berat sedang mendominasi — luangkan waktu untuk merawat dirimu. 💛
            </span>
        }
      </div>
    </div>
  )
}
