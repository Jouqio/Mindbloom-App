// ============================================================
// MindBloom — useLifeWheel Hook
// File: src/lib/hooks/useLifeWheel.ts
// ============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LifeWheelEntry, LifeDimension } from '@/types/lifewheel'

export function useLifeWheel() {
  const [entries, setEntries]       = useState<LifeWheelEntry[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [isSaving, setIsSaving]     = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('life_wheel_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12) // last 12 entries (e.g. monthly for a year)

      setEntries((data ?? []) as unknown as LifeWheelEntry[])
    } catch (err) {
      console.error('[useLifeWheel] load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveEntry = useCallback(async (
    scores: Record<LifeDimension, number>,
    notes:  Partial<Record<LifeDimension, string>>
  ) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/life-wheel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ scores, notes }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan')
      await load()
      return { success: true }
    } catch (err) {
      console.error('[saveEntry]', err)
      return { success: false }
    } finally {
      setIsSaving(false)
    }
  }, [load])

  const latest   = entries[0]   ?? null
  const previous = entries[1]   ?? null

  // Can create new entry only once per 7 days (encourage periodic reflection)
  const daysSinceLastEntry = latest
    ? Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 86400000)
    : Infinity
  const canCreateNew = daysSinceLastEntry >= 7

  return {
    entries, latest, previous, isLoading, isSaving,
    canCreateNew, daysSinceLastEntry,
    saveEntry, refetch: load,
  }
}
