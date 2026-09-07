// ============================================================
// MindBloom — Pattern Card Component
// File: src/components/insights/PatternCard.tsx
// ============================================================

'use client'

import { motion } from 'framer-motion'
import type { DetectedPattern } from '@/types/insight'

interface PatternCardProps {
  pattern: DetectedPattern
  index?:  number
}

export function PatternCard({ pattern, index = 0 }: PatternCardProps) {
  const confidencePct = Math.round(pattern.confidence * 100)

  const confColor =
    pattern.confidence >= 0.75 ? '#1D9E75' :
    pattern.confidence >= 0.5  ? '#EF9F27' : '#888780'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="rounded-2xl border border-border bg-background p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-xl" aria-hidden="true">
          {pattern.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{pattern.title}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>

          <div className="mt-3 flex items-center gap-3">
            {/* Confidence bar */}
            <div className="flex flex-1 items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                Keyakinan
              </span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePct}%` }}
                  transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay: index * 0.07 + 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: confColor }}
                />
              </div>
              <span className="text-[10px] font-medium flex-shrink-0" style={{ color: confColor }}>
                {confidencePct}%
              </span>
            </div>

            {/* Data points badge */}
            <span className="flex-shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              {pattern.dataPoints} data
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
