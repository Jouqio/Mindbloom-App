// ============================================================
// MindBloom — Life Wheel Radar Chart
// File: src/components/lifewheel/LifeWheelChart.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LIFE_DIMENSIONS_ORDER, LIFE_DIMENSION_CONFIG, calculateOverallBalance,
  type LifeDimension, type LifeWheelEntry,
} from '@/types/lifewheel'
import { cn } from '@/lib/utils'

// ── Radar chart math ──────────────────────────────────────────
const CENTER = 140
const MAX_R  = 110
const TOTAL  = LIFE_DIMENSIONS_ORDER.length

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function scoreToPoints(scores: Record<LifeDimension, number>): string {
  return LIFE_DIMENSIONS_ORDER.map((dim, i) => {
    const angle = (360 / TOTAL) * i
    const r = ((scores[dim] ?? 0) / 10) * MAX_R
    const { x, y } = polarToXY(angle, r)
    return `${x},${y}`
  }).join(' ')
}

// ────────────────────────────────────────────────────────────
// Radar SVG
// ────────────────────────────────────────────────────────────
interface RadarSVGProps {
  scores:      Record<LifeDimension, number>
  prevScores?: Record<LifeDimension, number> | null
  interactive?:boolean
  onScoreChange?: (dim: LifeDimension, val: number) => void
}

export function LifeWheelRadar({ scores, prevScores, interactive, onScoreChange }: RadarSVGProps) {
  const [hoveredDim, setHoveredDim] = useState<LifeDimension | null>(null)

  const gridLevels = [2, 4, 6, 8, 10]

  return (
    <svg
      viewBox="0 0 280 280"
      className="w-full max-w-[320px] mx-auto"
      role="img"
      aria-label="Life Wheel radar chart"
    >
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <circle
          key={level}
          cx={CENTER} cy={CENTER}
          r={(level / 10) * MAX_R}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Grid spokes */}
      {LIFE_DIMENSIONS_ORDER.map((_, i) => {
        const angle = (360 / TOTAL) * i
        const outer = polarToXY(angle, MAX_R)
        return (
          <line key={i}
            x1={CENTER} y1={CENTER}
            x2={outer.x} y2={outer.y}
            stroke="currentColor" strokeOpacity={0.10} strokeWidth={1}
          />
        )
      })}

      {/* Previous scores polygon (ghost) */}
      {prevScores && (
        <polygon
          points={scoreToPoints(prevScores)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.20}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {/* Current scores polygon */}
      <motion.polygon
        points={scoreToPoints(scores)}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Dimension labels + score dots */}
      {LIFE_DIMENSIONS_ORDER.map((dim, i) => {
        const angle   = (360 / TOTAL) * i
        const dotPos  = polarToXY(angle, ((scores[dim] ?? 0) / 10) * MAX_R)
        const labelR  = MAX_R + 22
        const labelPos = polarToXY(angle, labelR)
        const cfg     = LIFE_DIMENSION_CONFIG[dim]
        const isHovered = hoveredDim === dim

        return (
          <g key={dim}>
            {/* Score dot */}
            <motion.circle
              cx={dotPos.x} cy={dotPos.y}
              r={isHovered ? 6 : 4}
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth={2}
              animate={{ r: isHovered ? 6 : 4 }}
              transition={{ duration: 0.15 }}
            />

            {/* Label */}
            <text
              x={labelPos.x}
              y={labelPos.y + 4}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              fillOpacity={0.65}
              className="select-none"
            >
              {cfg.emoji} {cfg.shortLabel}
            </text>

            {/* Score label on dot */}
            {isHovered && (
              <text
                x={dotPos.x}
                y={dotPos.y - 9}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="hsl(var(--primary))"
              >
                {scores[dim]}
              </text>
            )}

            {/* Interactive hit area */}
            {interactive && (
              <circle
                cx={polarToXY(angle, MAX_R / 2).x}
                cy={polarToXY(angle, MAX_R / 2).y}
                r={MAX_R / 2}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDim(dim)}
                onMouseLeave={() => setHoveredDim(null)}
              />
            )}
          </g>
        )
      })}

      {/* Center score */}
      <text x={CENTER} y={CENTER + 4}
        textAnchor="middle" fontSize="14" fontWeight="600"
        fill="hsl(var(--foreground))"
      >
        {(Object.values(scores).reduce((a, b) => a + b, 0) / TOTAL).toFixed(1)}
      </text>
      <text x={CENTER} y={CENTER + 16}
        textAnchor="middle" fontSize="7" fill="currentColor" fillOpacity={0.5}
      >
        avg
      </text>
    </svg>
  )
}

// ────────────────────────────────────────────────────────────
// Score Sliders for all 8 dimensions
// ────────────────────────────────────────────────────────────
export function LifeWheelScoreSliders({
  scores, onChange,
}: {
  scores:   Record<LifeDimension, number>
  onChange: (dim: LifeDimension, val: number) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {LIFE_DIMENSIONS_ORDER.map((dim) => {
        const cfg = LIFE_DIMENSION_CONFIG[dim]
        const val = scores[dim] ?? 5

        return (
          <div key={dim}>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor={`slider-${dim}`}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <span aria-hidden="true">{cfg.emoji}</span>
                {cfg.label}
              </label>
              <motion.span
                key={val}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-sm font-medium"
                style={{ color: cfg.color }}
                aria-live="polite"
              >
                {val}/10
              </motion.span>
            </div>
            <input
              id={`slider-${dim}`}
              type="range"
              min={1}
              max={10}
              value={val}
              onChange={(e) => onChange(dim, parseInt(e.target.value))}
              aria-label={`${cfg.label}: ${val} dari 10`}
              aria-valuenow={val}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${cfg.color} 0%, ${cfg.color} ${(val - 1) / 9 * 100}%, rgba(0,0,0,0.08) ${(val - 1) / 9 * 100}%, rgba(0,0,0,0.08) 100%)`,
              }}
            />
            <p className="mt-0.5 text-[10px] text-muted-foreground italic">
              {cfg.questions[Math.floor(Math.random() * cfg.questions.length)]}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Balance analysis card
// ────────────────────────────────────────────────────────────
export function LifeWheelAnalysis({ entry }: { entry: LifeWheelEntry }) {
  const analysis = calculateOverallBalance(entry.scores)
  const lowestCfg  = LIFE_DIMENSION_CONFIG[analysis.lowest]
  const highestCfg = LIFE_DIMENSION_CONFIG[analysis.highest]

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Analisis Keseimbangan</h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="rounded-xl bg-secondary/60 px-3 py-2.5 text-center">
          <p className="text-lg font-medium text-foreground">{analysis.average}</p>
          <p className="text-[10px] text-muted-foreground">Rata-rata</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: lowestCfg.color + '15' }}>
          <p className="text-base" aria-hidden="true">{lowestCfg.emoji}</p>
          <p className="text-[10px] font-medium" style={{ color: lowestCfg.color }}>{lowestCfg.shortLabel}</p>
          <p className="text-[10px] text-muted-foreground">Terendah</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: highestCfg.color + '15' }}>
          <p className="text-base" aria-hidden="true">{highestCfg.emoji}</p>
          <p className="text-[10px] font-medium" style={{ color: highestCfg.color }}>{highestCfg.shortLabel}</p>
          <p className="text-[10px] text-muted-foreground">Tertinggi</p>
        </div>
      </div>
      <div className="rounded-xl bg-secondary/40 px-3 py-2.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Fokus berikutnya:</strong> Area{' '}
          <span style={{ color: lowestCfg.color }}>{lowestCfg.label}</span> membutuhkan
          perhatian lebih. Bahkan langkah kecil setiap hari akan membuat perbedaan besar.
        </p>
      </div>
    </div>
  )
}
