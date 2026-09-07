// ============================================================
// MindBloom — Journal Store (Zustand)
// File: src/store/journalStore.ts
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { INITIAL_DRAFT, TOTAL_STEPS, type JournalDraft } from '@/types/journal'

interface JournalStore {
  // State
  currentStep:   number
  direction:     1 | -1
  draft:         JournalDraft
  entryId:       string | null
  isSaving:      boolean
  isSubmitting:  boolean
  lastSavedAt:   string | null
  saveError:     string | null
  startedAt:     string | null

  // Navigation
  setStep:       (step: number) => void
  nextStep:      () => void
  prevStep:      () => void

  // Draft
  updateDraft:   (fields: Partial<JournalDraft>) => void
  setEntryId:    (id: string) => void
  resetJournal:  () => void

  // Save state
  setSaving:     (v: boolean) => void
  setSubmitting: (v: boolean) => void
  setLastSaved:  (ts: string | null) => void
  setSaveError:  (err: string | null) => void

  // Computed
  completionPct: () => number
}

function calcCompletion(draft: JournalDraft): number {
  const checks: boolean[] = [
    !!draft.mood_score,
    draft.emotions.length > 0,
    draft.energy_score !== null,
    draft.main_story.trim().length > 20,
    draft.happy_moments.trim().length > 0,
    draft.gratitude_items.filter(g => g.trim().length > 0).length >= 3,
    draft.did_well.trim().length > 0,
    draft.improve_on.trim().length > 0,
    draft.self_compassion.trim().length > 0,
  ]
  const filled  = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      currentStep:  1,
      direction:    1,
      draft:        { ...INITIAL_DRAFT },
      entryId:      null,
      isSaving:     false,
      isSubmitting: false,
      lastSavedAt:  null,
      saveError:    null,
      startedAt:    null,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => set((s) => ({
        direction:   1,
        currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS),
      })),

      prevStep: () => set((s) => ({
        direction:   -1,
        currentStep: Math.max(s.currentStep - 1, 1),
      })),

      updateDraft: (fields) => set((s) => ({
        draft:     { ...s.draft, ...fields },
        saveError: null,
      })),

      setEntryId: (id) => set({ entryId: id }),

      resetJournal: () => set({
        currentStep:  1,
        direction:    1,
        draft:        {
          ...INITIAL_DRAFT,
          entry_date: new Date().toISOString().split('T')[0],
        },
        entryId:      null,
        isSaving:     false,
        isSubmitting: false,
        lastSavedAt:  null,
        saveError:    null,
        startedAt:    new Date().toISOString(),
      }),

      setSaving:     (v) => set({ isSaving: v }),
      setSubmitting: (v) => set({ isSubmitting: v }),
      setLastSaved:  (ts) => set({ lastSavedAt: ts }),
      setSaveError:  (err) => set({ saveError: err }),

      completionPct: () => calcCompletion(get().draft),
    }),
    {
      name: 'mindbloom-journal-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currentStep: s.currentStep,
        draft:       s.draft,
        entryId:     s.entryId,
        startedAt:   s.startedAt,
      }),
    }
  )
)
