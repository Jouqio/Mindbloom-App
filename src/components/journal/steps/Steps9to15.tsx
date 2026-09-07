// ============================================================
// MindBloom — Journal Steps 9–15
// File: src/components/journal/steps/Steps9to15.tsx
// ============================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { GratitudeList } from '../JournalInputs'
import { AFFIRMATION_PRESETS, type JournalDraft } from '@/types/journal'
import { cn } from '@/lib/utils'

// ── Shared textarea style ─────────────────────────────────────
const textareaClass = cn(
  'w-full resize-none rounded-2xl border border-border bg-background',
  'px-4 py-3.5 text-sm text-foreground leading-relaxed',
  'placeholder:text-muted-foreground transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
  'hover:border-border/80'
)

function WordCount({ text, min }: { text: string; min?: number }) {
  const count    = text.trim().split(/\s+/).filter(Boolean).length
  const meetsMin = !min || count >= min
  return (
    <p className={cn('mt-1.5 text-right text-xs', meetsMin ? 'text-muted-foreground' : 'text-amber-500')}>
      {count} kata{min && !meetsMin ? ` (minimal ${min})` : ''}
    </p>
  )
}

interface StepProps {
  draft:    JournalDraft
  onChange: (fields: Partial<JournalDraft>) => void
}

// ────────────────────────────────────────────────────────────
// STEP 9 — GRATITUDE
// ────────────────────────────────────────────────────────────
export function Step9Gratitude({ draft, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-4 py-3">
        <p className="text-xs text-green-700 dark:text-green-300">
          🙏 Penelitian menunjukkan bahwa menulis 3 hal syukur setiap hari meningkatkan
          kebahagiaan secara signifikan. Mulai dari hal yang paling kecil sekalipun.
        </p>
      </div>
      <GratitudeList
        items={draft.gratitude_items}
        onChange={(items) => onChange({ gratitude_items: items })}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 10 — LESSONS LEARNED
// ────────────────────────────────────────────────────────────
export function Step10Lessons({ draft, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-secondary/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          💡 Pelajaran tidak harus besar. Bahkan menyadari &quot;aku perlu tidur lebih awal&quot; adalah pelajaran yang berarti.
        </p>
      </div>
      <textarea
        rows={5}
        value={draft.lessons_learned}
        onChange={(e) => onChange({ lessons_learned: e.target.value })}
        placeholder="Pelajaran kecil yang aku sadari hari ini adalah..."
        aria-label="Pelajaran hari ini"
        className={cn(textareaClass, 'min-h-[140px]')}
      />
      <WordCount text={draft.lessons_learned} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 11 — SELF REFLECTION (3 questions)
// ────────────────────────────────────────────────────────────
export function Step11Reflection({ draft, onChange }: StepProps) {
  const questions: Array<{
    field: keyof Pick<JournalDraft, 'did_well' | 'improve_on' | 'do_differently'>
    label:  string
    placeholder: string
    emoji:  string
    color:  string
  }> = [
    {
      field:       'did_well',
      label:       'Yang sudah aku lakukan dengan baik',
      placeholder: 'Hari ini aku berhasil...',
      emoji:       '✅',
      color:       'text-green-600',
    },
    {
      field:       'improve_on',
      label:       'Yang bisa aku tingkatkan',
      placeholder: 'Aku bisa lebih baik dalam hal...',
      emoji:       '📈',
      color:       'text-amber-600',
    },
    {
      field:       'do_differently',
      label:       'Yang akan aku lakukan berbeda',
      placeholder: 'Besok aku akan mencoba...',
      emoji:       '🔄',
      color:       'text-blue-600',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q) => (
        <div key={q.field}>
          <label
            htmlFor={q.field}
            className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <span aria-hidden="true">{q.emoji}</span>
            <span className={q.color}>{q.label}</span>
          </label>
          <textarea
            id={q.field}
            rows={3}
            value={draft[q.field]}
            onChange={(e) => onChange({ [q.field]: e.target.value })}
            placeholder={q.placeholder}
            aria-label={q.label}
            className={cn(textareaClass, 'min-h-[88px]')}
          />
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 12 — SELF COMPASSION
// ────────────────────────────────────────────────────────────
export function Step12Compassion({ draft, onChange }: StepProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Prompt card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] px-5 py-4">
        <p className="mb-2 text-sm font-medium text-foreground">Bayangkan ini:</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sahabat terbaikmu mengalami apa yang kamu alami hari ini — perasaan yang
          sama, tantangan yang sama, kegagalan yang sama.
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">
          Apa yang akan kamu katakan kepadanya?
        </p>
        <p className="mt-1 text-xs text-primary">
          Sekarang, katakan hal yang sama kepada dirimu sendiri. 💛
        </p>
      </div>

      <textarea
        ref={ref}
        rows={5}
        value={draft.self_compassion}
        onChange={(e) => onChange({ self_compassion: e.target.value })}
        placeholder="Hey, kamu sudah berusaha keras hari ini. Aku bangga dengan..."
        aria-label="Pesan belas kasih untuk diri sendiri"
        className={cn(textareaClass, 'min-h-[140px]')}
      />
      <WordCount text={draft.self_compassion} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 13 — TOMORROW'S INTENTION
// ────────────────────────────────────────────────────────────
export function Step13Intention({ draft, onChange }: StepProps) {
  const presets = [
    'Tetap hadir dan fokus pada saat ini',
    'Menjaga energiku dengan istirahat yang cukup',
    'Bersikap baik kepada diri sendiri dan orang lain',
    'Menyelesaikan satu hal penting hari ini',
    'Merayakan progres kecil yang aku buat',
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-secondary/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          🌅 Ini bukan to-do list — ini tentang <strong className="text-foreground">energi dan niat</strong> yang
          ingin kamu bawa ke hari esok.
        </p>
      </div>

      {/* Preset intentions */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Pilih cepat atau tulis sendiri:</p>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange({ tomorrow_intention: preset })}
            className={cn(
              'rounded-xl border px-4 py-2.5 text-left text-sm transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              draft.tomorrow_intention === preset
                ? 'border-primary/50 bg-primary/5 text-primary'
                : 'border-border text-foreground hover:border-primary/30 hover:bg-secondary/60'
            )}
          >
            {draft.tomorrow_intention === preset && (
              <Check className="mr-2 inline h-3.5 w-3.5 text-primary" aria-hidden="true" />
            )}
            {preset}
          </button>
        ))}
      </div>

      {/* Custom intention */}
      <textarea
        rows={3}
        value={draft.tomorrow_intention}
        onChange={(e) => onChange({ tomorrow_intention: e.target.value })}
        placeholder="Atau tulis niatmu sendiri..."
        aria-label="Niat untuk besok"
        className={cn(textareaClass, 'min-h-[88px]')}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 14 — AFFIRMATIONS
// ────────────────────────────────────────────────────────────
export function Step14Affirmations({ draft, onChange }: StepProps) {
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const toggleAffirmation = (text: string) => {
    const next = draft.affirmations.includes(text)
      ? draft.affirmations.filter((a) => a !== text)
      : [...draft.affirmations, text]
    onChange({ affirmations: next })
  }

  const addCustom = () => {
    if (customText.trim()) {
      onChange({ affirmations: [...draft.affirmations, customText.trim()] })
      setCustomText('')
      setShowCustom(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-secondary/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          ✨ Pilih satu atau lebih afirmasi yang paling terasa relevan hari ini.
          Baca pelan-pelan saat kamu memilih.
        </p>
      </div>

      {/* Preset affirmations */}
      <div className="flex flex-col gap-2" role="group" aria-label="Pilih afirmasi">
        {AFFIRMATION_PRESETS.map((affirmation) => {
          const isSelected = draft.affirmations.includes(affirmation)
          return (
            <motion.button
              key={affirmation}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleAffirmation(affirmation)}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-primary/50 bg-primary/5 text-foreground'
                  : 'border-border text-foreground hover:border-primary/30 hover:bg-secondary/50'
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className={cn(
                  'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-colors',
                  isSelected ? 'bg-primary' : 'border border-border bg-background'
                )}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" aria-hidden="true" />}
                </div>
                <span>{affirmation}</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Custom affirmation */}
      <AnimatePresence>
        {showCustom ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            className="flex flex-col gap-2"
          >
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCustom() } }}
              placeholder="Tulis afirmasimu sendiri..."
              autoFocus
              aria-label="Afirmasi custom"
              className={cn(textareaClass, 'min-h-[72px]')}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className="flex-1 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={addCustom}
                disabled={!customText.trim()}
                className="flex-1 rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-85 disabled:opacity-40 transition-opacity"
              >
                Tambahkan
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tulis afirmasi sendiri
          </button>
        )}
      </AnimatePresence>

      {/* Selected count */}
      {draft.affirmations.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {draft.affirmations.length} afirmasi dipilih
        </p>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// STEP 15 — PRAYER & HOPE
// ────────────────────────────────────────────────────────────
export function Step15Prayer({ draft, onChange }: StepProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Ambient message */}
      <div className="rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/[0.04] to-transparent px-5 py-5 text-center">
        <div className="mb-3 text-4xl" aria-hidden="true">🌙</div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ini adalah ruang paling pribadi di seluruh jurnal ini.
          Tulis doa, harapan, atau apapun yang ada di hatimu.
        </p>
        <p className="mt-2 text-xs text-primary/70">
          Tidak ada yang benar atau salah. Hanya kamu dan kata-katamu.
        </p>
      </div>

      <textarea
        ref={ref}
        rows={7}
        value={draft.prayer_hope}
        onChange={(e) => onChange({ prayer_hope: e.target.value })}
        placeholder="Ya Tuhan, hari ini aku bersyukur untuk...

Aku berharap...

Doaku adalah..."
        aria-label="Doa dan harapan"
        className={cn(textareaClass, 'min-h-[200px]')}
      />

      {/* Closing message */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-secondary/50 px-4 py-3 text-center"
      >
        <p className="text-xs text-muted-foreground">
          Setelah ini, jurnalmu akan tersimpan dan Bloom akan mempersiapkan insight untukmu. 🌱
        </p>
      </motion.div>
    </div>
  )
}
