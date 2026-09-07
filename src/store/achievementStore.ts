// ============================================================
// MindBloom — Achievement Store (Zustand)
// File: src/store/achievementStore.ts
// ============================================================

import { create } from 'zustand'
import type { UserAchievement, UserXP, StreakData } from '@/types/achievement'

interface AchievementStore {
  // State
  achievements:  UserAchievement[]
  xp:            UserXP | null
  streak:        StreakData | null
  pendingUnlock: UserAchievement | null   // achievement queued for animation
  isLoading:     boolean

  // Actions
  setAchievements:  (a: UserAchievement[]) => void
  setXP:            (xp: UserXP) => void
  setStreak:        (s: StreakData) => void
  addAchievement:   (a: UserAchievement) => void
  setPendingUnlock: (a: UserAchievement | null) => void
  setLoading:       (v: boolean) => void
  clearPending:     () => void
}

export const useAchievementStore = create<AchievementStore>((set) => ({
  achievements:  [],
  xp:            null,
  streak:        null,
  pendingUnlock: null,
  isLoading:     false,

  setAchievements:  (achievements) => set({ achievements }),
  setXP:            (xp)           => set({ xp }),
  setStreak:        (streak)        => set({ streak }),
  setLoading:       (isLoading)     => set({ isLoading }),

  addAchievement: (a) => set((s) => ({
    achievements:  [a, ...s.achievements],
    pendingUnlock: a,
  })),

  setPendingUnlock: (pendingUnlock) => set({ pendingUnlock }),
  clearPending:     ()              => set({ pendingUnlock: null }),
}))
