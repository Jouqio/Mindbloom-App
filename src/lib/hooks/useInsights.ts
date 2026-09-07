// ============================================================
// MindBloom — useInsights Hook
// File: src/lib/hooks/useInsights.ts
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useInsightStore } from '@/store/insightStore'
import type { InsightCard, EIScore, DetectedPattern } from '@/types/insight'

export function useInsights() {
  const store = useInsightStore()

  const load = useCallback(async () => {
    store.setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [insightsRes, eiRes] = await Promise.all([
        supabase
          .from('insight_cards')
          .select('*')
          .eq('user_id', user.id)
          .gte('valid_until', new Date().toISOString())
          .order('priority', { ascending: true }) // high first
          .order('generated_at', { ascending: false })
          .limit(10),
        supabase
          .from('ei_scores')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      store.setInsights((insightsRes.data as InsightCard[]) ?? [])
      store.setEIScore((eiRes.data as EIScore | null) ?? null)
      if (insightsRes.data?.[0]) {
        store.setLastGenAt(insightsRes.data[0].generated_at)
      }
    } catch (err) {
      console.error('[useInsights] load error:', err)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  useEffect(() => { load() }, [load])

  // ── Generate new insights ──────────────────────────────────
  const generateInsights = useCallback(async () => {
    store.setGenerating(true)
    try {
      const [insightRes, eiRes] = await Promise.all([
        fetch('/api/insights/generate', { method: 'POST' }),
        fetch('/api/insights/ei-score',  { method: 'POST' }),
      ])

      if (!insightRes.ok) {
        const { error } = await insightRes.json()
        throw new Error(error ?? 'Failed to generate insights')
      }

      await load()
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal generate insight'
      return { success: false, error: msg }
    } finally {
      store.setGenerating(false)
    }
  }, [store, load])

  // ── Mark insight as seen ──────────────────────────────────
  const markSeen = useCallback(async (id: string) => {
    store.markSeen(id)
    const supabase = createClient()
    await supabase
      .from('insight_cards')
      .update({ seen_at: new Date().toISOString() })
      .eq('id', id)
  }, [store])

  // ── Check if can generate (once per day) ──────────────────
  const daysSinceLast = store.lastGenAt
    ? Math.floor((Date.now() - new Date(store.lastGenAt).getTime()) / 86400000)
    : Infinity
  const canGenerate = daysSinceLast >= 1

  return {
    insights:      store.insights,
    eiScore:       store.eiScore,
    patterns:      store.patterns,
    isLoading:     store.isLoading,
    isGenerating:  store.isGenerating,
    lastGenAt:     store.lastGenAt,
    canGenerate,
    daysSinceLast,
    generateInsights,
    markSeen,
    refetch: load,
  }
}
