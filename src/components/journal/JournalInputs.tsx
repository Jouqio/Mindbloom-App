// ============================================================
// MindBloom — Journal Sub-components
// File: src/components/journal/JournalInputs.tsx
// Contains: MoodSlider, EmotionPicker, EnergyBattery, GratitudeList
// ============================================================

'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { EMOTION_OPTIONS, type MoodCategory } from '@/types/journal'
import { cn } from '@/lib/utils'

// ── Mood data ─────────────────────────────────────────────────
const MOOD_EMOJIS  = ['😭','😢','😔','😟','😐','🙂','😊','😄','🤩','😍']
const MOOD_LABELS  = ['Sangat berat','Berat','Kurang baik','Tidak nyaman','Biasa saja','Cukup baik','Baik','Senang','Sangat senang','Luar biasa!']
const MOOD_CATEGORIES: MoodCategory[] = [
  'stressed','stressed','stressed','anxious','tired',
  'calm','happy','happy','excited','happy',
]

// ── 1. MOOD SLIDER ────────────────────────────────────────────
interface MoodSliderProps {
  value:    number | null
  onChange: (score: number, category: MoodCategory) => void
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  const displayVal = value ?? 5
  const idx = displayVal - 1

  const handleChange = (v: number) => {
    onChange(v, MOOD_CATEGORIES[v - 1])
  }

  // Color interpolation: red(1) → yellow(5) → green(10)
  const getColor = (score: number) => {
    if (score <= 3)       return '#E24B4A'
    if (score <= 5)       return '#EF9F27'
    if (score <= 7)       return '#1D9E75'
    return '#059669'
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Big emoji */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayVal}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{   scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-6xl leading-none select-none"
          role="img"
          aria-label={`Mood: ${MOOD_LABELS[idx]}`}
        >
          {MOOD_EMOJIS[idx]}
        </motion.div>
      </AnimatePresence>

      {/* Score badge */}
      <div className="flex items-center gap-2">
        <motion.span
          key={displayVal}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          className="text-3xl font-medium"
          style={{ color: getColor(displayVal) }}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayVal}
        </motion.span>
        <span className="text-sm text-muted-foreground">/ 10</span>
      </div>

      {/* Label */}
      <motion.p
        key={`label-${displayVal}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm font-medium text-foreground"
        aria-live="polite"
      >
        {MOOD_LABELS[idx]}
      </motion.p>

      {/* Slider */}
      <div className="w-full max-w-xs px-2">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={displayVal}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          aria-label="Skala mood 1 sampai 10"
          aria-valuenow={displayVal}
          aria-valuetext={MOOD_LABELS[idx]}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${getColor(displayVal)} 0%, ${getColor(displayVal)} ${(displayVal - 1) / 9 * 100}%, #E2E8F0 ${(displayVal - 1) / 9 * 100}%, #E2E8F0 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>Sangat berat</span>
          <span>Luar biasa!</span>
        </div>
      </div>

      {/* Quick tap row */}
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Pilih cepat mood">
        {MOOD_EMOJIS.map((emoji, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={displayVal === i + 1}
            onClick={() => handleChange(i + 1)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border text-base transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              displayVal === i + 1
                ? 'border-primary/60 bg-primary/10 scale-110'
                : 'border-border bg-background hover:scale-110'
            )}
            aria-label={`Mood ${i + 1}: ${MOOD_LABELS[i]}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 2. EMOTION PICKER ─────────────────────────────────────────
interface EmotionPickerProps {
  selected: string[]
  onChange: (emotions: string[]) => void
}

export function EmotionPicker({ selected, onChange }: EmotionPickerProps) {
  const toggleEmotion = (label: string) => {
    onChange(
      selected.includes(label)
        ? selected.filter((e) => e !== label)
        : [...selected, label]
    )
  }

  const categories = [
    { key: 'positive', label: '✨ Positif' },
    { key: 'neutral',  label: '😐 Netral'  },
    { key: 'negative', label: '💭 Berat'   },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Selected count */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Emosi yang dipilih">
          {selected.map((e) => {
            const opt = EMOTION_OPTIONS.find((o) => o.label === e)
            return (
              <motion.span
                key={e}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{   scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{ color: opt?.color, background: opt?.bg, borderColor: opt?.color + '40' }}
              >
                {e}
                <button
                  type="button"
                  onClick={() => toggleEmotion(e)}
                  aria-label={`Hapus emosi ${e}`}
                  className="rounded-full hover:opacity-70 focus-visible:outline-none"
                >
                  <X className="h-2.5 w-2.5" aria-hidden="true" />
                </button>
              </motion.span>
            )
          })}
        </div>
      )}

      {/* Emotion grid by category */}
      {categories.map(({ key, label }) => {
        const opts = EMOTION_OPTIONS.filter((o) => o.category === key)
        return (
          <div key={key}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
              {opts.map((opt) => {
                const isSelected = selected.includes(opt.label)
                return (
                  <motion.button
                    key={opt.label}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleEmotion(opt.label)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    style={{
                      color:       isSelected ? opt.color  : undefined,
                      background:  isSelected ? opt.bg     : undefined,
                      borderColor: isSelected ? opt.color + '60' : undefined,
                    }}
                  >
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── 3. ENERGY BATTERY ─────────────────────────────────────────
interface EnergyBatteryProps {
  value:    number | null
  onChange: (v: number) => void
}

export function EnergyBattery({ value, onChange }: EnergyBatteryProps) {
  const displayVal = value ?? 50

  const getColor = (v: number) => {
    if (v <= 20) return { bar: '#E24B4A', bg: '#FCEBEB', text: '#791F1F', label: 'Hampir habis' }
    if (v <= 40) return { bar: '#EF9F27', bg: '#FAEEDA', text: '#633806', label: 'Rendah'        }
    if (v <= 60) return { bar: '#EF9F27', bg: '#FAEEDA', text: '#633806', label: 'Cukup'         }
    if (v <= 80) return { bar: '#1D9E75', bg: '#E1F5EE', text: '#085041', label: 'Baik'          }
    return              { bar: '#059669', bg: '#ECFDF5', text: '#064E3B', label: 'Penuh'          }
  }

  const cfg = getColor(displayVal)

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Battery visual */}
      <div className="relative flex flex-col items-center gap-1" aria-hidden="true">
        {/* Terminal */}
        <div className="h-2 w-8 rounded-sm" style={{ background: cfg.bar }} />
        {/* Body */}
        <div className="relative h-36 w-20 overflow-hidden rounded-xl border-2"
          style={{ borderColor: cfg.bar }}>
          {/* Fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-lg"
            animate={{ height: `${displayVal}%`, background: cfg.bar }}
            transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          />
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative z-10 text-xl font-medium" style={{ color: displayVal > 50 ? 'white' : cfg.bar }}>
              {displayVal}%
            </span>
          </div>
        </div>
      </div>

      {/* Label */}
      <motion.div
        key={cfg.label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-full px-4 py-1.5 text-sm font-medium"
        style={{ background: cfg.bg, color: cfg.text }}
        aria-live="polite"
      >
        {cfg.label}
      </motion.div>

      {/* Slider */}
      <div className="w-full max-w-xs px-2">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={displayVal}
          onChange={(e) => onChange(parseInt(e.target.value))}
          aria-label="Level energi 0 sampai 100 persen"
          aria-valuenow={displayVal}
          aria-valuetext={`${displayVal}% - ${cfg.label}`}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${cfg.bar} 0%, ${cfg.bar} ${displayVal}%, #E2E8F0 ${displayVal}%, #E2E8F0 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>0% — kosong</span>
          <span>100% — penuh</span>
        </div>
      </div>

      {/* Quick picks */}
      <div className="flex gap-2">
        {[20, 40, 60, 80, 100].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              displayVal === v
                ? 'border-primary/50 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:bg-secondary'
            )}
          >
            {v}%
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 4. GRATITUDE LIST ─────────────────────────────────────────
interface GratitudeListProps {
  items:    string[]
  onChange: (items: string[]) => void
}

export function GratitudeList({ items, onChange }: GratitudeListProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const update = (idx: number, val: string) => {
    const next = [...items]
    next[idx] = val
    onChange(next)
  }

  const addItem = () => {
    onChange([...items, ''])
    // Focus new input after render
    setTimeout(() => {
      inputRefs.current[items.length]?.focus()
    }, 50)
  }

  const removeItem = (idx: number) => {
    if (items.length <= 3) return // Minimum 3 items
    onChange(items.filter((_, i) => i !== idx))
  }

  const filledCount = items.filter((i) => i.trim().length > 0).length

  return (
    <div className="flex flex-col gap-3">
      {/* Count indicator */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: Math.max(filledCount, 3) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'h-1.5 w-4 rounded-full transition-colors',
                i < filledCount ? 'bg-primary' : 'bg-secondary'
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {filledCount} / minimal 3 item
        </span>
      </div>

      {/* Input list */}
      <div className="flex flex-col gap-2.5" role="list" aria-label="Daftar syukur">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              role="listitem"
              initial={{ opacity: 0, y: -8, height: 0  }}
              animate={{ opacity: 1, y:  0, height: 'auto' }}
              exit={{   opacity: 0, y: -8, height: 0  }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              {/* Bullet number */}
              <div className={cn(
                'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors',
                item.trim().length > 0
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground border border-border'
              )}
                aria-hidden="true"
              >
                {idx + 1}
              </div>

              {/* Input */}
              <input
                ref={(el) => { inputRefs.current[idx] = el }}
                type="text"
                value={item}
                onChange={(e) => update(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (idx === items.length - 1) addItem()
                    else inputRefs.current[idx + 1]?.focus()
                  }
                }}
                placeholder={
                  idx === 0 ? 'Hal pertama yang aku syukuri...' :
                  idx === 1 ? 'Hal kedua yang aku syukuri...' :
                  idx === 2 ? 'Hal ketiga yang aku syukuri...' :
                              `Hal ${idx + 1} yang aku syukuri...`
                }
                aria-label={`Syukur ke-${idx + 1}`}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60"
              />

              {/* Remove button (only if > 3 items) */}
              {items.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label={`Hapus syukur ke-${idx + 1}`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add button */}
      {items.length < 10 && (
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah hal yang disyukuri
        </button>
      )}
    </div>
  )
}
