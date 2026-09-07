// ============================================================
// MindBloom — Coach Store (Zustand)
// File: src/store/coachStore.ts
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ChatMessage, BloomTone } from '@/types/coach'

interface CoachStore {
  messages:    ChatMessage[]
  sessionId:   string | null
  isStreaming: boolean
  tone:        BloomTone
  inputDraft:  string

  addMessage:    (m: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setStreaming:  (v: boolean) => void
  setSessionId:  (id: string | null) => void
  setTone:       (t: BloomTone) => void
  setInputDraft: (s: string) => void
  clearSession:  () => void
}

export const useCoachStore = create<CoachStore>()(
  persist(
    (set) => ({
      messages:    [],
      sessionId:   null,
      isStreaming: false,
      tone:        'warm',
      inputDraft:  '',

      addMessage: (m) =>
        set((s) => ({ messages: [...s.messages, m] })),

      updateMessage: (id, updates) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      setStreaming:  (isStreaming)  => set({ isStreaming }),
      setSessionId:  (sessionId)   => set({ sessionId }),
      setTone:       (tone)        => set({ tone }),
      setInputDraft: (inputDraft)  => set({ inputDraft }),

      clearSession: () => set({
        messages:    [],
        sessionId:   null,
        isStreaming: false,
        inputDraft:  '',
      }),
    }),
    {
      name: 'mindbloom-coach',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        messages:  s.messages.slice(-40), // keep last 40 msgs
        sessionId: s.sessionId,
        tone:      s.tone,
      }),
    }
  )
)
