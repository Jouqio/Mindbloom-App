// ============================================================
// MindBloom — Onboarding Form (3 Steps)
// File: src/components/onboarding/OnboardingForm.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { onboardingSchema, type OnboardingSchema } from '@/lib/validations/auth'
import { JOURNALING_GOAL_OPTIONS, type JournalingGoal } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 3

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0, 0, 0.2, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  }),
}

export function OnboardingForm() {
  const router = useRouter()
  const { profile, updateProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<JournalingGoal[]>([])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      display_name: profile?.full_name?.split(' ')[0] ?? '',
      journaling_goal: undefined,
      reminder_time: '21:00',
    },
  })

  const displayName = watch('display_name')
  const reminderTime = watch('reminder_time')

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const goPrev = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  const toggleGoal = (goal: JournalingGoal) => {
    setSelectedGoals((prev) => {
      const next = prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
      setValue('journaling_goal', next[0] ?? (undefined as any))
      return next
    })
  }

  const onSubmit = async (data: OnboardingSchema) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          onboarded_at: new Date().toISOString(),
          updated_at:   new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Save preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id:            user.id,
          notif_reminder_time: data.reminder_time ?? '21:00',
        }, { onConflict: 'user_id' })

      updateProfile({
        display_name: data.display_name,
        onboarded_at: new Date().toISOString(),
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('[Onboarding]', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Progress dots */}
      <div className="mb-8 flex items-center gap-2" aria-label={`Langkah ${step} dari ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width:      i + 1 === step ? 24 : 8,
              background: i + 1 <= step  ? '#7F77DD' : '#E2E8F0',
            }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="h-2 rounded-full"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Step card */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait" custom={direction}>
            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <motion.div key="step-1" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit" className="p-8">
                <div className="mb-6 text-center">
                  <div className="mb-3 text-4xl" aria-hidden="true">👋</div>
                  <h1 className="text-xl font-medium text-foreground">Hei, aku Bloom!</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Aku akan menemanimu dalam perjalanan refleksi harian. Boleh aku tahu namamu?
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="display_name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Panggil aku...
                  </label>
                  <input
                    id="display_name"
                    type="text"
                    autoComplete="given-name"
                    autoFocus
                    placeholder="Nama panggilanmu"
                    aria-invalid={!!errors.display_name}
                    aria-describedby={errors.display_name ? 'name-error' : undefined}
                    {...register('display_name')}
                    className={cn(
                      'w-full rounded-xl border bg-background px-3.5 py-3 text-base text-foreground',
                      'placeholder:text-muted-foreground transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
                      errors.display_name ? 'border-destructive' : 'border-border hover:border-border/80'
                    )}
                  />
                  {errors.display_name && (
                    <p id="name-error" className="mt-1.5 text-xs text-destructive" role="alert">
                      {errors.display_name.message}
                    </p>
                  )}
                  {displayName && !errors.display_name && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-muted-foreground"
                    >
                      Senang bertemu denganmu, <span className="font-medium text-foreground">{displayName}</span>! 🌱
                    </motion.p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!displayName || !!errors.display_name}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Lanjut <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Goals ── */}
            {step === 2 && (
              <motion.div key="step-2" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit" className="p-8">
                <div className="mb-6 text-center">
                  <div className="mb-3 text-4xl" aria-hidden="true">🎯</div>
                  <h1 className="text-xl font-medium text-foreground">
                    Apa tujuan utamamu?
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Pilih satu atau lebih. Ini membantu Bloom menyesuaikan panduan untukmu.
                  </p>
                </div>

                <div className="mb-6 flex flex-col gap-2.5" role="group" aria-label="Pilih tujuan journaling">
                  {JOURNALING_GOAL_OPTIONS.map((opt) => {
                    const isSelected = selectedGoals.includes(opt.value)
                    return (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleGoal(opt.value)}
                        whileTap={{ scale: 0.98 }}
                        role="checkbox"
                        aria-checked={isSelected}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-border hover:border-border/80 hover:bg-secondary/50'
                        )}
                      >
                        <span className="mt-0.5 flex-shrink-0 text-xl" aria-hidden="true">{opt.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{opt.label}</p>
                            {isSelected && (
                              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                                <Check className="h-2.5 w-2.5 text-white" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                <div className="flex gap-2.5">
                  <button type="button" onClick={goPrev}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali
                  </button>
                  <button type="button" onClick={goNext}
                    disabled={selectedGoals.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Lanjut <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Reminder time ── */}
            {step === 3 && (
              <motion.div key="step-3" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit" className="p-8">
                <div className="mb-6 text-center">
                  <div className="mb-3 text-4xl" aria-hidden="true">🔔</div>
                  <h1 className="text-xl font-medium text-foreground">
                    Kapan aku mengingatkanmu?
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Aku akan kirim pengingat setiap hari jika kamu belum menulis jurnal.
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="reminder_time" className="mb-2 block text-sm font-medium text-foreground">
                    Jam pengingat
                  </label>
                  <input
                    id="reminder_time"
                    type="time"
                    {...register('reminder_time')}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-base text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60"
                  />
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Setiap hari jam <span className="font-medium text-foreground">{reminderTime ?? '21:00'}</span> — bisa diubah kapanpun di Pengaturan
                  </p>
                </div>

                {/* Quick time options */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {['06:00', '12:00', '18:00', '21:00', '22:00'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue('reminder_time', t)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        reminderTime === t
                          ? 'border-primary/60 bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/50'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setValue('reminder_time', undefined)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      !reminderTime
                        ? 'border-primary/60 bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:border-border/80'
                    )}
                  >
                    Lewati
                  </button>
                </div>

                <div className="flex gap-2.5">
                  <button type="button" onClick={goPrev}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {isSubmitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Menyimpan...</>
                      : <>Mulai perjalananku 🌱</>
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Skip option */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {step < TOTAL_STEPS
          ? <button type="button" onClick={() => handleSubmit(onSubmit)()} className="underline underline-offset-4 hover:text-foreground">
              Lewati semua
            </button>
          : null
        }
      </p>
    </div>
  )
}
