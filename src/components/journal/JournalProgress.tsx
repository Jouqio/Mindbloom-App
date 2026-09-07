// ============================================================
// MindBloom — Journal Progress Component
// File: src/components/journal/JournalProgress.tsx
// ============================================================

'use client'

import { motion } from 'framer-motion'
import { Check, Cloud, Loader2 } from 'lucide-react'
import { STEP_CONFIGS, TOTAL_STEPS } from '@/types/journal'
import { cn } from '@/lib/utils'

interface JournalProgressProps {
  currentStep:  number
  completionPct:number
  isSaving:     boolean
  lastSavedAt:  string | null
  saveError:    string | null
  onStepClick?: (step: number) => void
}

export function JournalProgress({
  currentStep,
  completionPct,
  isSaving,
  lastSavedAt,
  saveError,
  onStepClick,
}: JournalProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Top bar: step counter + save status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Langkah{' '}
          <span className="text-foreground">{currentStep}</span>
          {' '}dari{' '}
          <span className="text-foreground">{TOTAL_STEPS}</span>
        </span>

        {/* Save indicator */}
        <div className="flex items-center gap-1.5">
          {saveError ? (
            <span className="text-xs text-destructive">⚠️ Gagal simpan</span>
          ) : isSaving ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Menyimpan...
            </span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cloud className="h-3 w-3" aria-hidden="true" />
              Tersimpan
            </span>
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary" role="progressbar"
        aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100}
        aria-label={`${completionPct}% selesai`}>
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${completionPct}%` }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        />
      </div>

      {/* Step dots — hidden on mobile, visible on md+ */}
      <div className="hidden items-center gap-1 md:flex" role="tablist" aria-label="Navigasi langkah">
        {STEP_CONFIGS.map((step) => {
          const isDone    = step.id < currentStep
          const isCurrent = step.id === currentStep

          return (
            <motion.button
              key={step.id}
              role="tab"
              aria-selected={isCurrent}
              aria-label={`${step.title} (Langkah ${step.id})`}
              onClick={() => onStepClick?.(step.id)}
              disabled={step.id > currentStep}
              whileHover={step.id <= currentStep ? { scale: 1.2 } : {}}
              whileTap={step.id <= currentStep ? { scale: 0.95 } : {}}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isDone    && 'bg-primary cursor-pointer',
                isCurrent && 'bg-primary',
                !isDone && !isCurrent && 'bg-secondary cursor-default',
              )}
            />
          )
        })}
      </div>

      {/* Current step label */}
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden="true">
          {STEP_CONFIGS[currentStep - 1]?.emoji}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">
            {STEP_CONFIGS[currentStep - 1]?.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {STEP_CONFIGS[currentStep - 1]?.subtitle}
          </p>
        </div>
        {STEP_CONFIGS[currentStep - 1]?.optional && (
          <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            Opsional
          </span>
        )}
      </div>
    </div>
  )
}
