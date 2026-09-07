// ============================================================
// MindBloom — Insight Store (Zustand)
// File: src/store/insightStore.ts
// ============================================================

import { create } from 'zustand'
import type { InsightCard, EIScore, DetectedPattern } from '@/types/insight'

interface InsightStore {
  insights:     InsightCard[]
  eiScore:      EIScore | null
  patterns:     DetectedPattern[]
  isLoading:    boolean
  isGenerating: boolean
  lastGenAt:    string | null

  setInsights:     (v: InsightCard[]) => void
  setEIScore:      (v: EIScore | null) => void
  setPatterns:     (v: DetectedPattern[]) => void
  setLoading:      (v: boolean) => void
  setGenerating:   (v: boolean) => void
  setLastGenAt:    (v: string | null) => void
  markSeen:        (id: string) => void
}

export const useInsightStore = create<InsightStore>((set) => ({
  insights:     [],
  eiScore:      null,
  patterns:     [],
  isLoading:    false,
  isGenerating: false,
  lastGenAt:    null,

  setInsights:   (insights)   => set({ insights }),
  setEIScore:    (eiScore)    => set({ eiScore }),
  setPatterns:   (patterns)   => set({ patterns }),
  setLoading:    (isLoading)  => set({ isLoading }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setLastGenAt:  (lastGenAt)  => set({ lastGenAt }),

  markSeen: (id) => set((s) => ({
    insights: s.insights.map((i) =>
      i.id === id ? { ...i, seen_at: new Date().toISOString() } : i
    ),
  })),
}))


// ============================================================
// MindBloom — useInsights Hook
// File: src/lib/hooks/useInsights.ts
// ============================================================
