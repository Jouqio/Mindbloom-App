// ============================================================
// MindBloom — Breathing Store (Zustand)
// File: src/store/breathingStore.ts
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BreathPhase, BreathPatternId } from '@/types/breathing'

interface BreathingStore {
  patternId:       BreathPatternId
  phase:           BreathPhase
  isRunning:       boolean
  cyclesCompleted: number
  sessionStartedAt:number | null
  countdown:       number

  setPattern:       (id: BreathPatternId) => void
  setPhase:         (phase: BreathPhase) => void
  setRunning:       (v: boolean) => void
  incrementCycle:   () => void
  setCountdown:     (n: number) => void
  resetSession:     () => void
  startSession:     () => void
}

export const useBreathingStore = create<BreathingStore>()(
  persist(
    (set) => ({
      patternId:        'box',
      phase:             'idle',
      isRunning:         false,
      cyclesCompleted:   0,
      sessionStartedAt:  null,
      countdown:         4,

      setPattern:     (patternId) => set({ patternId }),
      setPhase:       (phase)     => set({ phase }),
      setRunning:     (isRunning) => set({ isRunning }),
      setCountdown:   (countdown)=> set({ countdown }),

      incrementCycle: () => set((s) => ({ cyclesCompleted: s.cyclesCompleted + 1 })),

      startSession: () => set({
        isRunning:        true,
        cyclesCompleted:  0,
        sessionStartedAt: Date.now(),
      }),

      resetSession: () => set({
        phase:            'idle',
        isRunning:        false,
        cyclesCompleted:  0,
        sessionStartedAt: null,
        countdown:        4,
      }),
    }),
    {
      name: 'mindbloom-breathing',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ patternId: s.patternId }),
    }
  )
)
