// ============================================================
// MindBloom — Journal Form Orchestrator
// File: src/components/journal/JournalForm.tsx
// ============================================================

'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useJournal } from '@/lib/hooks/useJournal'
import { JournalProgress } from './JournalProgress'
import {
  Step1Date, Step2Mood, Step3Emotions, Step4Energy,
  Step5Story, Step6Thoughts, Step7Stress, Step8Happy,
} from './steps/Steps1to8'
import {
  Step9Gratitude, Step10Lessons, Step11Reflection,
  Step12Compassion, Step13Intention, Step14Affirmations, Step15Prayer,
} from './steps/Steps9to15'
import { STEP_CONFIGS, TOTAL_STEPS } from '@/types/journal'
import { cn } from '@/lib/utils'

// ── Step component map ────────────────────────────────────────
const STEP_COMPONENTS = [
  Step1Date, Step2Mood, Step3Emotions, Step4Energy,
  Step5Story, Step6Thoughts, Step7Stress, Step8Happy,
  Step9Gratitude, Step10Lessons, Step11Reflection,
  Step12Compassion, Step13Intention, Step14Affirmations, Step15Prayer,
] as const

// ── Animation variants ────────────────────────────────────────
const stepVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0, 0, 0.2, 1] } },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }),
}

// ── Can proceed check ─────────────────────────────────────────
function canProceed(step: number, draft: ReturnType<typeof useJournal>['draft']): boolean {
  switch (step) {
    case 1:  return true
    case 2:  return draft.mood_score !== null
    case 3:  return draft.emotions.length > 0
    case 4:  return draft.energy_score !== null
    case 5:  return draft.main_story.trim().split(/\s+/).filter(Boolean).length >= 10
    case 6:  return true  // optional
    case 7:  return true  // optional
    case 8:  return draft.happy_moments.trim().length > 0
    case 9:  return draft.gratitude_items.filter((g) => g.trim().length > 0).length >= 3
    case 10: return true  // optional
    case 11: return draft.did_well.trim().length > 0 && draft.improve_on.trim().length > 0
    case 12: return draft.self_compassion.trim().length > 0
    case 13: return true  // optional
    case 14: return true  // optional
    case 15: return true  // optional
    default: return true
  }
}

// ────────────────────────────────────────────────────────────
// SAVE SUCCESS OVERLAY
// ────────────────────────────────────────────────────────────
function SaveSuccessOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Jurnal berhasil tersimpan"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1,   opacity: 1, y: 0  }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 text-center shadow-lg"
      >
        {/* Check icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" aria-hidden="true" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium text-foreground"
        >
          Jurnal tersimpan! 🎉
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          Kamu luar biasa hari ini. Bloom sedang mempersiapkan insight personalmu.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 flex items-center justify-center gap-4 rounded-xl bg-secondary/60 px-4 py-3"
        >
          <div className="text-center">
            <p className="text-lg font-medium text-amber-500">🔥</p>
            <p className="text-xs text-muted-foreground mt-0.5">Streak</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-medium text-primary">🌱</p>
            <p className="text-xs text-muted-foreground mt-0.5">Taman tumbuh</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">✨</p>
            <p className="text-xs text-muted-foreground mt-0.5">+XP</p>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 flex flex-col gap-2.5"
        >
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Lihat dashboard
          </button>
          <button
            onClick={() => {
              // Navigate to AI Coach
              window.location.href = '/coach'
            }}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Chat dengan Bloom AI
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// MAIN JOURNAL FORM
// ────────────────────────────────────────────────────────────
export function JournalForm() {
  const router   = useRouter()
  const journal  = useJournal()

  const {
    draft, currentStep, direction, isSaving, isSubmitting,
    lastSavedAt, saveError, completionPct,
    saveDraft, submitJournal, goNext, goPrev, setStep, resetJournal,
  } = journal

  // Save draft on field change
  const handleChange = useCallback(
    (fields: Partial<typeof draft>) => {
      journal.updateDraft(fields)
      // Auto-save after update
      void saveDraft({ ...draft, ...fields }, currentStep)
    },
    [journal, draft, currentStep, saveDraft]
  )

  const isLastStep = currentStep === TOTAL_STEPS
  const canNext    = canProceed(currentStep, draft)
  const StepComponent = STEP_COMPONENTS[currentStep - 1]

  // Handle final submit
  const [justSubmitted, setJustSubmitted] = useState(false)
  const handleSubmit = async () => {
    const result = await submitJournal()
    if (result.success) {
      setJustSubmitted(true)
    }
  }

  // Navigate to dashboard after success
  const handleSuccessClose = () => {
    resetJournal()
    router.push('/dashboard')
    router.refresh()
  }

  // Keyboard shortcut: Ctrl+Enter to proceed
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (canNext && !isSubmitting) {
        isLastStep ? handleSubmit() : goNext()
      }
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentStep > 1) goPrev()
                else router.push('/dashboard')
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-shrink-0"
              aria-label={currentStep > 1 ? 'Langkah sebelumnya' : 'Kembali ke dashboard'}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex-1 min-w-0">
              <JournalProgress
                currentStep={currentStep}
                completionPct={completionPct}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
                saveError={saveError}
                onStepClick={setStep}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepComponent draft={draft} onChange={handleChange} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="sticky bottom-0 border-t border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            {/* Back button (hidden on step 1) */}
            {currentStep > 1 && (
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Langkah sebelumnya"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Kembali
              </button>
            )}

            {/* Next / Submit button */}
            <motion.button
              onClick={isLastStep ? handleSubmit : goNext}
              disabled={!canNext || isSubmitting}
              whileHover={canNext && !isSubmitting ? { scale: 1.01 } : {}}
              whileTap={canNext && !isSubmitting ? { scale: 0.98 } : {}}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5',
                'text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                canNext && !isSubmitting
                  ? isLastStep
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-foreground text-background hover:opacity-85'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label={isLastStep ? 'Simpan jurnal' : 'Langkah berikutnya'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Menyimpan...
                </>
              ) : isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Simpan jurnal
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </motion.button>
          </div>

          {/* Skip optional step hint */}
          {STEP_CONFIGS[currentStep - 1]?.optional && !isLastStep && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center"
            >
              <button
                type="button"
                onClick={goNext}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none"
              >
                Lewati langkah ini
              </button>
            </motion.div>
          )}

          {/* Keyboard hint */}
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60 hidden md:block">
            Tekan{' '}
            <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-mono">
              ⌘ Enter
            </kbd>
            {' '}untuk lanjut
          </p>
        </div>
      </footer>

      {/* Save success overlay */}
      <AnimatePresence>
        {justSubmitted && (
          <SaveSuccessOverlay onClose={handleSuccessClose} />
        )}
      </AnimatePresence>
    </div>
  )
}
