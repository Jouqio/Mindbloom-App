// ============================================================
// MindBloom — useJournal Hook (auto-save)
// File: src/lib/hooks/useJournal.ts
// ============================================================

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useJournalStore } from '@/store/journalStore'
import type { JournalDraft } from '@/types/journal'

const AUTO_SAVE_DELAY = 3000 // 3 seconds debounce

export function useJournal() {
  const router  = useRouter()
  const store   = useJournalStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Initialize start time on mount
  useEffect(() => {
    if (!store.startedAt) {
      store.resetJournal()
    }
    startTimeRef.current = Date.now()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-save draft ───────────────────────────────────────
  const saveDraft = useCallback(
    async (fields: Partial<JournalDraft>, stepNum: number) => {
      store.updateDraft(fields)

      // Debounce auto-save
      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(async () => {
        store.setSaving(true)
        store.setSaveError(null)

        try {
          const draft = useJournalStore.getState().draft

          const res = await fetch('/api/journals', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...draft,
              is_draft:   true,
              draft_step: stepNum,
              written_duration_sec: Math.floor((Date.now() - startTimeRef.current) / 1000),
            }),
          })

          if (!res.ok) {
            const json = await res.json()
            throw new Error(json.error ?? 'Save failed')
          }

          const { data } = await res.json()
          if (data?.id) store.setEntryId(data.id)
          store.setLastSaved(new Date().toISOString())
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal menyimpan'
          store.setSaveError(msg)
        } finally {
          store.setSaving(false)
        }
      }, AUTO_SAVE_DELAY)
    },
    [store]
  )

  // ── Submit final journal ──────────────────────────────────
  const submitJournal = useCallback(async () => {
    store.setSubmitting(true)
    store.setSaveError(null)

    // Cancel any pending auto-save
    if (timerRef.current) clearTimeout(timerRef.current)

    try {
      const draft = useJournalStore.getState().draft

      const res = await fetch('/api/journals', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          is_draft: false,
          draft_step: null,
          written_duration_sec: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Submit failed')
      }

      const { data } = await res.json()
      if (data?.id) store.setEntryId(data.id)
      store.setLastSaved(new Date().toISOString())

      return { success: true, entryId: data?.id as string }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan jurnal'
      store.setSaveError(msg)
      return { success: false, entryId: null }
    } finally {
      store.setSubmitting(false)
    }
  }, [store])

  // ── Navigation helpers ────────────────────────────────────
  const goNext = useCallback(() => {
    store.nextStep()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [store])

  const goPrev = useCallback(() => {
    store.prevStep()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [store])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return {
    draft:        store.draft,
    currentStep:  store.currentStep,
    direction:    store.direction,
    entryId:      store.entryId,
    isSaving:     store.isSaving,
    isSubmitting: store.isSubmitting,
    lastSavedAt:  store.lastSavedAt,
    saveError:    store.saveError,
    completionPct:store.completionPct(),
    saveDraft,
    submitJournal,
    goNext,
    goPrev,
    setStep:      store.setStep,
    resetJournal: store.resetJournal,
    updateDraft:  store.updateDraft,
  }
}
