// ============================================================
// MindBloom — Habit Form Modal
// File: src/components/habits/HabitFormModal.tsx
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import {
  HABIT_CATEGORIES, HABIT_EMOJI_PRESETS, HABIT_COLOR_PRESETS,
  FREQUENCY_LABELS, WEEKDAY_LABELS,
  type HabitCategory, type HabitFrequency, type HabitWithTodayLog,
} from '@/types/habit'
import { cn } from '@/lib/utils'

interface HabitFormModalProps {
  isOpen:      boolean
  editingHabit:HabitWithTodayLog | null
  onClose:     () => void
  onSubmit:    (data: {
    name: string; emoji: string; category: HabitCategory
    frequency: HabitFrequency; custom_days: number[] | null
    target_count: number; unit: string | null; color: string
  }) => Promise<void>
}

export function HabitFormModal({ isOpen, editingHabit, onClose, onSubmit }: HabitFormModalProps) {
  const [name, setName]           = useState('')
  const [emoji, setEmoji]         = useState('💪')
  const [category, setCategory]   = useState<HabitCategory>('health')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [customDays, setCustomDays] = useState<number[]>([1,2,3,4,5])
  const [targetCount, setTargetCount] = useState(1)
  const [unit, setUnit]           = useState('')
  const [color, setColor]         = useState(HABIT_COLOR_PRESETS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Populate form when editing
  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name)
      setEmoji(editingHabit.emoji)
      setCategory(editingHabit.category)
      setFrequency(editingHabit.frequency)
      setCustomDays(editingHabit.custom_days ?? [1,2,3,4,5])
      setTargetCount(editingHabit.target_count)
      setUnit(editingHabit.unit ?? '')
      setColor(editingHabit.color)
    } else {
      setName(''); setEmoji('💪'); setCategory('health')
      setFrequency('daily'); setCustomDays([1,2,3,4,5])
      setTargetCount(1); setUnit(''); setColor(HABIT_COLOR_PRESETS[0])
    }
    setError(null)
  }, [editingHabit, isOpen])

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Nama habit wajib diisi'); return }
    if (frequency === 'custom' && customDays.length === 0) {
      setError('Pilih minimal 1 hari'); return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(), emoji, category, frequency,
        custom_days: frequency === 'custom' ? customDays : null,
        target_count: targetCount, unit: unit.trim() || null, color,
      })
      onClose()
    } catch (err) {
      setError('Gagal menyimpan habit. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-border bg-background p-5 md:left-1/2 md:right-auto md:top-1/2 md:bottom-auto md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label={editingHabit ? 'Edit habit' : 'Buat habit baru'}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                {editingHabit ? 'Edit Habit' : 'Habit Baru'}
              </h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors" aria-label="Tutup">
                <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="habit-name" className="mb-1.5 block text-sm font-medium text-foreground">Nama habit</label>
                <input
                  id="habit-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="contoh: Minum air 8 gelas"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  autoFocus
                />
              </div>

              {/* Emoji picker */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Ikon</label>
                <div className="flex flex-wrap gap-1.5">
                  {HABIT_EMOJI_PRESETS.map((e) => (
                    <button key={e} type="button" onClick={() => setEmoji(e)}
                      className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all',
                        emoji === e ? 'bg-primary/15 ring-2 ring-primary/40' : 'bg-secondary hover:bg-secondary/70')}
                      aria-label={`Pilih ikon ${e}`} aria-pressed={emoji === e}
                    >{e}</button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Kategori</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.entries(HABIT_CATEGORIES) as [HabitCategory, typeof HABIT_CATEGORIES[HabitCategory]][]).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setCategory(key)}
                      className={cn('flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all',
                        category === key ? 'border-transparent' : 'border-border')}
                      style={category === key ? { background: cfg.bg } : undefined}
                      aria-pressed={category === key}
                    >
                      <span className="text-base" aria-hidden="true">{cfg.emoji}</span>
                      <span className="text-[10px] font-medium text-foreground">{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Frekuensi</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.entries(FREQUENCY_LABELS) as [HabitFrequency, string][]).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setFrequency(key)}
                      className={cn('rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                        frequency === key ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border text-foreground')}
                      aria-pressed={frequency === key}
                    >{label}</button>
                  ))}
                </div>

                {frequency === 'custom' && (
                  <div className="mt-2 flex gap-1.5">
                    {WEEKDAY_LABELS.map((label, i) => (
                      <button key={i} type="button" onClick={() => toggleCustomDay(i)}
                        className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all',
                          customDays.includes(i) ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground')}
                        aria-pressed={customDays.includes(i)}
                      >{label[0]}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Countable target */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="target-count" className="mb-1.5 block text-sm font-medium text-foreground">Target (opsional)</label>
                  <input
                    id="target-count" type="number" min={1} max={99} value={targetCount}
                    onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="unit" className="mb-1.5 block text-sm font-medium text-foreground">Satuan</label>
                  <input
                    id="unit" type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                    placeholder="gelas, menit..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Warna</label>
                <div className="flex gap-2">
                  {HABIT_COLOR_PRESETS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={cn('h-8 w-8 rounded-full transition-all', color === c && 'ring-2 ring-offset-2 ring-foreground')}
                      style={{ background: c }} aria-label={`Pilih warna ${c}`} aria-pressed={color === c}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background hover:opacity-85 transition-opacity disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {editingHabit ? 'Simpan perubahan' : 'Buat habit'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
