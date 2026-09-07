// ============================================================
// MindBloom — Breathing Circle Component
// File: src/components/breathing/BreathingCircle.tsx
// ============================================================

'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useBreathing } from '@/lib/hooks/useBreathing'
import { BREATH_SIZES, BREATH_COLORS, BREATH_LABELS } from '@/types/breathing'

export function BreathingCircle() {
  const { phase, countdown, isRunning, cyclesCompleted, start, stop } = useBreathing()
  const prefersReducedMotion = useReducedMotion()

  const sizes = BREATH_SIZES[phase]
  const color = BREATH_COLORS[phase]
  const label = BREATH_LABELS[phase]

  // Get current phase duration for transition timing
  const transition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 4, ease: [0.45, 0.05, 0.55, 0.95] as [number, number, number, number] }

  const handleToggle = () => {
    if (isRunning) stop()
    else start()
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Rings + Circle */}
      <div className="relative flex items-center justify-center" style={{ height: 280, width: 280 }}>
        {/* Outer ring */}
        <motion.div
          animate={{ width: sizes.ring2, height: sizes.ring2 }}
          transition={transition}
          className="absolute rounded-full border border-border/40"
          style={{ pointerEvents: 'none' }}
          aria-hidden="true"
        />
        {/* Mid ring */}
        <motion.div
          animate={{ width: sizes.ring1, height: sizes.ring1 }}
          transition={transition}
          className="absolute rounded-full border border-border/60"
          style={{ pointerEvents: 'none' }}
          aria-hidden="true"
        />
        {/* Main breathing circle */}
        <motion.button
          onClick={handleToggle}
          animate={{ width: sizes.circle, height: sizes.circle, background: color }}
          transition={transition}
          className="relative flex flex-col items-center justify-center gap-1.5 rounded-full border border-border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
          aria-label={isRunning ? 'Hentikan latihan pernapasan' : 'Mulai latihan pernapasan'}
          aria-describedby="breath-phase-label breath-countdown"
        >
          <span
            id="breath-phase-label"
            className="text-sm font-medium text-foreground/80 px-4 text-center"
            aria-live="polite"
          >
            {label}
          </span>
          {isRunning ? (
            <motion.span
              key={countdown}
              initial={{ scale: 0.85, opacity: 0.6 }}
              animate={{ scale: 1,    opacity: 1 }}
              transition={{ duration: 0.2 }}
              id="breath-countdown"
              className="text-4xl font-medium text-foreground leading-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {countdown}
            </motion.span>
          ) : (
            <span className="text-3xl" aria-hidden="true">🫁</span>
          )}
        </motion.button>
      </div>

      {/* Cycle counter */}
      <div className="text-center">
        {isRunning ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {cyclesCompleted > 0
              ? `${cyclesCompleted} siklus selesai`
              : 'Siklus pertama sedang berjalan...'}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tekan lingkaran untuk mulai bernapas
          </p>
        )}
      </div>
    </div>
  )
}
