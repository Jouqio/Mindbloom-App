// ============================================================
// MindBloom — Habit Store (Zustand)
// File: src/store/habitStore.ts
// ============================================================

import { create } from 'zustand'
import type { HabitWithTodayLog } from '@/types/habit'

interface HabitStore {
  habits:        HabitWithTodayLog[]
  isLoading:     boolean
  editingHabit:  HabitWithTodayLog | null
  showForm:      boolean

  setHabits:       (h: HabitWithTodayLog[]) => void
  setLoading:      (v: boolean) => void
  setEditingHabit: (h: HabitWithTodayLog | null) => void
  setShowForm:     (v: boolean) => void
  updateHabitLocal:(id: string, updates: Partial<HabitWithTodayLog>) => void
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits:        [],
  isLoading:     false,
  editingHabit:  null,
  showForm:      false,

  setHabits:       (habits)       => set({ habits }),
  setLoading:      (isLoading)    => set({ isLoading }),
  setEditingHabit: (editingHabit) => set({ editingHabit }),
  setShowForm:     (showForm)     => set({ showForm }),

  updateHabitLocal: (id, updates) => set((s) => ({
    habits: s.habits.map((h) => h.id === id ? { ...h, ...updates } : h),
  })),
}))
