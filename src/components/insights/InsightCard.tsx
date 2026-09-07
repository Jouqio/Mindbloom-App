// ============================================================
// MindBloom — EI Radar Chart + Insight Card Components
// File: src/components/insights/InsightCard.tsx
// ============================================================

'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Eye } from 'lucide-react'
import Link from 'next/link'
import type { InsightCard as InsightCardType, EIScore } from '@/types/insight'
import { EI_DIMENSION_CONFIG, EI_DIMENSIONS } from '@/types/insight'
import { cn } from '@/lib/utils'

// ── Priority badge ─────────────────────────────────────────────
const PRIORITY_CONFIG = {
  high:   { label: 'Utama',   color: '#D85A30', bg: '#FAECE7' },
  medium: { label: 'Penting', color: '#EF9F27', bg: '#FAEEDA' },
  low:    { label: 'Info',    color: '#888780', bg: '#F1EFE8' },
}

// ────────────────────────────────────────────────────────────
// 1. INSIGHT CARD
// ────────────────────────────────────────────────────────────
interface InsightCardProps {
  insight: InsightCardType
  index?:  number
  onSeen?: (id: string) => void
}

export function InsightCardWidget({ insight, index = 0, onSeen }: InsightCardProps) {
  const priorityCfg = PRIORITY_CONFIG[insight.priority]
  const isSeen = !!insight.seen_at

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isSeen ? 'border-border bg-background/50' : 'border-primary/20 bg-primary/[0.02]'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{insight.emoji}</span>
          <div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: priorityCfg.bg, color: priorityCfg.color }}
            >
              {priorityCfg.label}
            </span>
          </div>
        </div>
        {!isSeen && onSeen && (
          <button
            onClick={() => onSeen(insight.id)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full hover:bg-secondary transition-colors"
            aria-label="Tandai sudah dibaca"
          >
            <Eye className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          </button>
        )}
      </div>

      <h3 className="mb-1.5 text-sm font-medium text-foreground">{insight.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>

      {/* Stat */}
      {insight.stat_value && (
        <div className="mt-3 inline-flex items-baseline gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5">
          <span className="text-lg font-medium text-foreground">{insight.stat_value}</span>
          {insight.stat_label && (
            <span className="text-[10px] text-muted-foreground">{insight.stat_label}</span>
          )}
        </div>
      )}

      {/* CTA */}
      {insight.action_label && insight.action_url && (
        <Link
          href={insight.action_url}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none"
        >
          {insight.action_label}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      )}
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. EI SCORE RADAR
// ────────────────────────────────────────────────────────────
const CENTER = 120
const MAX_R  = 90

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function makePolygon(scores: Record<string, number>): string {
  return EI_DIMENSIONS.map((dim, i) => {
    const angle = (360 / EI_DIMENSIONS.length) * i
    const r = ((scores[dim] ?? 5) / 10) * MAX_R
    const { x, y } = polar(angle, r)
    return `${x},${y}`
  }).join(' ')
}

export function EIScoreRadar({ eiScore }: { eiScore: EIScore | null }) {
  if (!eiScore) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center">
        <div className="text-3xl" aria-hidden="true">🧠</div>
        <div>
          <p className="text-sm font-medium text-foreground">EI Score belum tersedia</p>
          <p className="mt-1 text-xs text-muted-foreground">Generate insight untuk menghitung skor EI-mu</p>
        </div>
      </div>
    )
  }

  const overall = Object.values(eiScore.scores).reduce((a, b) => a + b, 0) / EI_DIMENSIONS.length

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Emotional Intelligence</h3>
          <p className="text-xs text-muted-foreground">Berdasarkan {eiScore.entry_count} jurnal</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-medium text-foreground">{overall.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">skor EI keseluruhan</p>
        </div>
      </div>

      <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[240px]" aria-label="EI Score radar chart">
        {/* Grid circles */}
        {[2,4,6,8,10].map((lvl) => (
          <circle key={lvl} cx={CENTER} cy={CENTER} r={(lvl/10)*MAX_R}
            fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}/>
        ))}
        {/* Spokes */}
        {EI_DIMENSIONS.map((_, i) => {
          const { x, y } = polar((360/EI_DIMENSIONS.length)*i, MAX_R)
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y}
            stroke="currentColor" strokeOpacity={0.10} strokeWidth={1}/>
        })}
        {/* Score polygon */}
        <motion.polygon
          points={makePolygon(eiScore.scores)}
          fill="hsl(var(--primary) / 0.15)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* Labels */}
        {EI_DIMENSIONS.map((dim, i) => {
          const angle   = (360/EI_DIMENSIONS.length)*i
          const labelPos = polar(angle, MAX_R + 18)
          const cfg      = EI_DIMENSION_CONFIG[dim]
          return (
            <text key={dim} x={labelPos.x} y={labelPos.y + 3}
              textAnchor="middle" fontSize="7.5"
              fill="currentColor" fillOpacity={0.65} className="select-none">
              {cfg.emoji} {cfg.label.split(' ')[0]}
            </text>
          )
        })}
      </svg>

      {/* Dimension bars */}
      <div className="mt-3 flex flex-col gap-1.5">
        {EI_DIMENSIONS.map((dim) => {
          const cfg   = EI_DIMENSION_CONFIG[dim]
          const score = eiScore.scores[dim] ?? 5
          return (
            <div key={dim} className="flex items-center gap-2">
              <span className="w-4 text-center text-xs" aria-hidden="true">{cfg.emoji}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score/10)*100}%` }}
                  transition={{ duration: 0.6, ease: [0,0,0.2,1] }}
                  className="h-full rounded-full"
                  style={{ background: cfg.color }}
                />
              </div>
              <span className="w-6 text-right text-[10px] font-medium text-muted-foreground">
                {score.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
