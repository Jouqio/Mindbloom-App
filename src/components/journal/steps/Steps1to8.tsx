// ============================================================
// MindBloom — Journal Steps 1–8
// File: src/components/journal/steps/Steps1to8.tsx
// ============================================================

'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MoodSlider, EmotionPicker, EnergyBattery } from '../JournalInputs'
import type { JournalDraft, MoodCategory } from '@/types/journal'
import { cn } from '@/lib/utils'

// ── Shared textarea style ─────────────────────────────────────
const textareaClass = cn(
  'w-full resize-none rounded-2xl border border-border bg-background',
  'px-4 py-3.5 text-sm text-foreground leading-relaxed',
  'placeholder:text-muted-foreground',
  'transition-colors focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
  'hover:border-border/80'
)

// Word count helper
function WordCount({ text, min }: { text: string; min?: number }) {
  const count = text.trim().split(/\s+/).filter(Boolean).length
  const meetsMin = !min || count >= min
  return (
    <p className={cn('mt-1.5 text-right text-xs transition-colors',
      meetsMin ? 'text-muted-foreground' : 'text-amber-500')}>
      {count} kata{min && !meetsMin ? ` (minimal ${min})` : ''}
    </p>
  )
}

// ── Step props interface ──────────────────────────────────────
interface StepProps {
  draft:     JournalDraft
  onChange:  (fields: Partial<JournalDraft>) => void
}

// ────────────────────────────────────────────────────────────
// STEP 1 — DATE & CONTEXT
// ────────────────────────────────────────────────────────────
export function Step1Date({ draft, onChange }: StepProps) {
  const today    = new Date()
  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  const months   = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  const dayName  = dayNames[today.getDay()]
  const dateStr  = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
  const timeStr  = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const hour = today.getHours()
  const greeting = hour < 5 ? 'Masih malam ya' : hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'
  const contextMsg = hour < 5  ? 'Semoga kamu baik-baik saja ya.' :
    hour < 11 ? 'Pagi yang baik untuk memulai refleksi.' :
    hour < 15 ? 'Waktu yang pas untuk merefleksi pagi harimu.' :
    hour < 18 ? 'Sore yang tenang untuk merenungkan harimu.' :
               'Malam adalah waktu terbaik untuk merefleksi harimu.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 py-4 text-center"
    >
      <div className="text-6xl" aria-hidden="true">📅</div>

      <div>
        <h2 className="text-2xl font-medium text-foreground">{dayName}</h2>
        <p className="mt-1 text-muted-foreground">{dateStr}</p>
        <p className="text-sm text-muted-foreground">{timeStr} WIB</p>
      </div>

      <div className="max-w-sm rounded-2xl border border-border bg-secondary/40 px-5 py-4">
        <p className="text-sm font-medium text-foreground">{greeting}! 🌱</p>
        <p className="mt-1 text-sm text-muted-foreground">{contextMsg}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Luangkan waktu <strong className="text-foreground">5–10 menit</strong> untuk dirimu sendiri hari ini.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
        <span className="text-sm font-medium text-primary">Siap memulai refleksi?</span>
        <span aria-hidden="true">✨</span>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 2 — MOOD SLIDER
// ────────────────────────────────────────────────────────────
export function Step2Mood({ draft, onChange }: StepProps) {
  return (
    <MoodSlider
      value={draft.mood_score}
      onChange={(score, category) => onChange({ mood_score: score, mood_category: category })}
    />
  )
}

// ────────────────────────────────────────────────────────────
// STEP 3 — EMOTION PICKER
// ────────────────────────────────────────────────────────────
export function Step3Emotions({ draft, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-2">
      {draft.emotions.length === 0 && (
        <p className="rounded-xl bg-secondary/60 px-4 py-3 text-center text-sm text-muted-foreground">
          Pilih semua emosi yang kamu rasakan — tidak ada yang benar atau salah 💙
        </p>
      )}
      <EmotionPicker
        selected={draft.emotions}
        onChange={(emotions) => onChange({ emotions })}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 4 — ENERGY BATTERY
// ────────────────────────────────────────────────────────────
export function Step4Energy({ draft, onChange }: StepProps) {
  return (
    <EnergyBattery
      value={draft.energy_score}
      onChange={(energy_score) => onChange({ energy_score })}
    />
  )
}

// ────────────────────────────────────────────────────────────
// STEP 5 — MAIN STORY
// ────────────────────────────────────────────────────────────
export function Step5Story({ draft, onChange }: StepProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-focus
  useEffect(() => {
    ref.current?.focus()
  }, [])

  // Auto-resize
  const autoResize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-secondary/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          💡 Tulis secara bebas — tidak perlu rapi atau sempurna. Ini ruangmu.
        </p>
      </div>
      <textarea
        ref={ref}
        rows={6}
        value={draft.main_story}
        onChange={(e) => {
          onChange({ main_story: e.target.value })
          autoResize()
        }}
        placeholder="Hari ini aku..."
        aria-label="Cerita utama hari ini"
        className={cn(textareaClass, 'min-h-[160px]')}
        style={{ overflow: 'hidden' }}
      />
      <WordCount text={draft.main_story} min={10} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 6 — RECURRING THOUGHTS
// ────────────────────────────────────────────────────────────
export function Step6Thoughts({ draft, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-secondary/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          💭 Pikiran mana yang terus berputar di kepalamu? Menulis bisa membantumu melepaskannya.
        </p>
      </div>
      <textarea
        rows={5}
        value={draft.recurring_thoughts}
        onChange={(e) => onChange({ recurring_thoughts: e.target.value })}
        placeholder="Yang terus ada di pikiranku adalah..."
        aria-label="Pikiran yang berulang"
        className={cn(textareaClass, 'min-h-[140px]')}
      />
      <WordCount text={draft.recurring_thoughts} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 7 — STRESS SOURCE + INTENSITY
// ────────────────────────────────────────────────────────────
export function Step7Stress({ draft, onChange }: StepProps) {
  const intensity = draft.stress_intensity ?? 0

  const getIntensityConfig = (v: number) => {
    if (v <= 2) return { label: 'Tidak ada', color: '#1D9E75', bg: '#E1F5EE' }
    if (v <= 4) return { label: 'Ringan',    color: '#EF9F27', bg: '#FAEEDA' }
    if (v <= 6) return { label: 'Sedang',    color: '#D85A30', bg: '#FAECE7' }
    if (v <= 8) return { label: 'Berat',     color: '#E24B4A', bg: '#FCEBEB' }
    return             { label: 'Sangat berat', color: '#991B1B', bg: '#FEE2E2' }
  }

  const cfg = getIntensityConfig(intensity)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="stress-source" className="mb-1.5 block text-sm font-medium text-foreground">
          Apa sumber stresmu hari ini?
        </label>
        <textarea
          id="stress-source"
          rows={4}
          value={draft.stress_source}
          onChange={(e) => onChange({ stress_source: e.target.value })}
          placeholder="Hal yang paling menekanku adalah... (atau tulis 'tidak ada' jika tidak ada)"
          aria-label="Sumber stres hari ini"
          className={cn(textareaClass, 'min-h-[110px]')}
        />
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">
          Seberapa intens stresnya?
        </label>
        <div className="flex flex-col items-center gap-3">
          {/* Intensity label */}
          <motion.div
            key={cfg.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ background: cfg.bg, color: cfg.color }}
            aria-live="polite"
          >
            {intensity} / 10 — {cfg.label}
          </motion.div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={intensity}
            onChange={(e) => onChange({ stress_intensity: parseInt(e.target.value) })}
            aria-label="Intensitas stres 0 sampai 10"
            aria-valuenow={intensity}
            aria-valuetext={`${intensity} - ${cfg.label}`}
            className="w-full max-w-xs"
          />
          <div className="flex w-full max-w-xs justify-between text-[10px] text-muted-foreground">
            <span>0 — Tidak ada</span>
            <span>10 — Sangat berat</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 8 — HAPPY MOMENTS
// ────────────────────────────────────────────────────────────
export function Step8Happy({ draft, onChange }: StepProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          🌟 Bahkan di hari yang berat, selalu ada hal kecil yang bisa membuat tersenyum.
          Temukan itu!
        </p>
      </div>
      <textarea
        ref={ref}
        rows={5}
        value={draft.happy_moments}
        onChange={(e) => onChange({ happy_moments: e.target.value })}
        placeholder="Hal kecil yang membuatku tersenyum hari ini adalah..."
        aria-label="Momen bahagia hari ini"
        className={cn(textareaClass, 'min-h-[140px]')}
      />
      <WordCount text={draft.happy_moments} min={3} />
    </div>
  )
}
