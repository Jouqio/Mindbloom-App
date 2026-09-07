// ============================================================
// MindBloom — Breathing Pattern Selector & Session Summary
// File: src/components/breathing/BreathingControls.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Info } from 'lucide-react'
import { useBreathing } from '@/lib/hooks/useBreathing'
import { BREATHING_PATTERNS, BREATHING_PATTERN_IDS, type BreathPatternId } from '@/types/breathing'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// Pattern Selector
// ────────────────────────────────────────────────────────────
export function BreathingPatternSelector() {
  const { patternId, isRunning, changePattern } = useBreathing()
  const [expandedInfo, setExpandedInfo] = useState<BreathPatternId | null>(null)

  return (
    <div className="flex flex-col gap-2.5">
      {BREATHING_PATTERN_IDS.map((id) => {
        const p = BREATHING_PATTERNS[id]
        const isSelected = patternId === id
        const isExpanded = expandedInfo === id

        return (
          <motion.div
            key={id}
            layout
            className={cn(
              'rounded-2xl border transition-all overflow-hidden',
              isSelected ? 'border-primary/50 bg-primary/[0.03]' : 'border-border bg-background'
            )}
          >
            <button
              onClick={() => !isRunning && changePattern(id)}
              disabled={isRunning}
              className={cn(
                'flex w-full items-center gap-3 p-3.5 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isRunning && !isSelected && 'opacity-40 cursor-not-allowed'
              )}
              aria-pressed={isSelected}
            >
              <span className="text-2xl flex-shrink-0" aria-hidden="true">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {p.subtitle}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{p.description}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setExpandedInfo(isExpanded ? null : id) }}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full hover:bg-secondary transition-colors"
                aria-label="Info detail"
                aria-expanded={isExpanded}
              >
                <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>
              {isSelected && (
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-white" aria-hidden="true" />
                </div>
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{   height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border/60"
                >
                  <div className="p-3.5 pt-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Manfaat:</strong> {p.benefit}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Session Summary (shown after stopping)
// ────────────────────────────────────────────────────────────
export function BreathingSessionSummary({
  cycles, durationSec, onClose,
}: {
  cycles:      number
  durationSec: number
  onClose:     () => void
}) {
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{   opacity: 0, scale: 0.95, y: 10 }}
      className="rounded-2xl border border-border bg-background p-5 text-center"
    >
      <div className="mb-3 text-3xl" aria-hidden="true">✨</div>
      <h3 className="text-base font-medium text-foreground">Sesi selesai</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Kamu meluangkan waktu untuk dirimu sendiri. Itu berarti.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
          <p className="text-lg font-medium text-foreground">{cycles}</p>
          <p className="text-[10px] text-muted-foreground">siklus selesai</p>
        </div>
        <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
          <p className="text-lg font-medium text-foreground">
            {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
          </p>
          <p className="text-[10px] text-muted-foreground">durasi</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity"
      >
        Selesai
      </button>
    </motion.div>
  )
}
