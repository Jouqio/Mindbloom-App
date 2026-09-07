// ============================================================
// MindBloom — Soundscape Store (Zustand)
// File: src/store/soundscapeStore.ts
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { INITIAL_MIX, type SoundId, type SoundMixState } from '@/types/soundscape'

interface SoundscapeStore {
  mix:           Record<SoundId, SoundMixState>
  masterVolume:  number
  isPlaying:     boolean
  timerMinutes:  number       // 0 = no timer
  timerEndAt:    number | null // epoch ms

  toggleSound:   (id: SoundId) => void
  setVolume:     (id: SoundId, volume: number) => void
  setMasterVolume: (v: number) => void
  setPlaying:    (v: boolean) => void
  applyPreset:   (mix: Partial<Record<SoundId, number>>) => void
  setTimer:      (minutes: number) => void
  clearTimer:    () => void
  stopAllSounds: () => void
}

export const useSoundscapeStore = create<SoundscapeStore>()(
  persist(
    (set, get) => ({
      mix:          { ...INITIAL_MIX },
      masterVolume: 70,
      isPlaying:    false,
      timerMinutes: 0,
      timerEndAt:   null,

      toggleSound: (id) => set((s) => ({
        mix: {
          ...s.mix,
          [id]: { ...s.mix[id], isActive: !s.mix[id].isActive },
        },
      })),

      setVolume: (id, volume) => set((s) => ({
        mix: {
          ...s.mix,
          [id]: { ...s.mix[id], volume },
        },
      })),

      setMasterVolume: (masterVolume) => set({ masterVolume }),
      setPlaying:      (isPlaying)    => set({ isPlaying }),

      applyPreset: (presetMix) => set((s) => {
        const newMix = { ...s.mix }
        // Reset all to inactive first
        Object.keys(newMix).forEach((key) => {
          newMix[key as SoundId] = { ...newMix[key as SoundId], isActive: false }
        })
        // Activate preset sounds
        Object.entries(presetMix).forEach(([id, volume]) => {
          newMix[id as SoundId] = { id: id as SoundId, isActive: true, volume: volume ?? 50 }
        })
        return { mix: newMix }
      }),

      setTimer: (minutes) => set({
        timerMinutes: minutes,
        timerEndAt:   minutes > 0 ? Date.now() + minutes * 60 * 1000 : null,
      }),

      clearTimer: () => set({ timerMinutes: 0, timerEndAt: null }),

      stopAllSounds: () => set((s) => {
        const newMix = { ...s.mix }
        Object.keys(newMix).forEach((key) => {
          newMix[key as SoundId] = { ...newMix[key as SoundId], isActive: false }
        })
        return { mix: newMix, isPlaying: false, timerEndAt: null, timerMinutes: 0 }
      }),
    }),
    {
      name: 'mindbloom-soundscape',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mix:          s.mix,
        masterVolume: s.masterVolume,
      }),
    }
  )
)
