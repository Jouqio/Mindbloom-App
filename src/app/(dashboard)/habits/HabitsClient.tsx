// ============================================================
// MindBloom — Habits Client Component
// File: src/app/(dashboard)/habits/HabitsClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target } from 'lucide-react'
import { HabitCard, CategoryFilter, HabitProgressSummary } from '@/components/habits/HabitComponents'
import { HabitFormModal } from '@/components/habits/HabitFormModal'
import { useHabits } from '@/lib/hooks/useHabits'
import { isExpectedDay, type HabitWithTodayLog, type HabitCategory } from '@/types/habit'

interface Props { initialHabits: any[] }

export function HabitsClient({ initialHabits }: Props) {
  const {
    habits, isLoading, editingHabit, showForm,
    setEditingHabit, setShowForm,
    createHabit, updateHabit, archiveHabit, toggleCheckIn,
  } = useHabits()

  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all')

  // Use realtime data, fallback to server initial
  const displayHabits: HabitWithTodayLog[] = habits.length > 0 ? habits : initialHabits

  const filtered = displayHabits.filter((h) =>
    categoryFilter === 'all' || h.category === categoryFilter
  )

  const todayHabits   = filtered.filter((h) => isExpectedDay(h.frequency, h.custom_days))
  const skippedHabits = filtered.filter((h) => !isExpectedDay(h.frequency, h.custom_days))

  const handleSubmit = async (data: Parameters<typeof createHabit>[0]) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data)
    } else {
      await createHabit(data)
    }
  }

  return (
    <>
      <HabitFormModal
        isOpen={showForm}
        editingHabit={editingHabit}
        onClose={() => { setShowForm(false); setEditingHabit(null) }}
        onSubmit={handleSubmit}
      />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
              <Target className="h-5 w-5 text-primary" aria-hidden="true" />
              Habit Tracker
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {displayHabits.length} habit aktif
            </p>
          </div>
          <button
            onClick={() => { setEditingHabit(null); setShowForm(true) }}
            className="flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Habit baru
          </button>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Daily progress summary */}
          {displayHabits.length > 0 && (
            <HabitProgressSummary habits={displayHabits} />
          )}

          {/* Category filter */}
          {displayHabits.length > 0 && (
            <CategoryFilter active={categoryFilter} onChange={setCategoryFilter} />
          )}

          {/* Today's habits */}
          {todayHabits.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hari ini
              </p>
              <div className="flex flex-col gap-2.5">
                {todayHabits.map((habit, i) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    index={i}
                    onCheckIn={toggleCheckIn}
                    onEdit={(h) => { setEditingHabit(h); setShowForm(true) }}
                    onArchive={archiveHabit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Not scheduled today */}
          {skippedHabits.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tidak terjadwal hari ini
              </p>
              <div className="flex flex-col gap-2.5">
                {skippedHabits.map((habit, i) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    index={i}
                    onCheckIn={toggleCheckIn}
                    onEdit={(h) => { setEditingHabit(h); setShowForm(true) }}
                    onArchive={archiveHabit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {displayHabits.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-12 text-center">
              <div className="text-5xl" aria-hidden="true">🎯</div>
              <div>
                <p className="text-sm font-medium text-foreground">Belum ada habit</p>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                  Mulai bangun kebiasaan positif setiap hari. Bahkan langkah kecil pun berarti.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Buat habit pertama
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
