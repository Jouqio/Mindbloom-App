// ============================================================
// MindBloom — useGarden Hook
// File: src/lib/hooks/useGarden.ts
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGardenStore } from '@/store/gardenStore'
import {
  getGardenLevel,
  MOOD_TO_PLANT,
  GARDEN_LEVELS,
  type GardenPlant,
  type GardenState,
  type PlantType,
} from '@/types/garden'

export function useGarden() {
  const store = useGardenStore()

  const load = useCallback(async () => {
    store.setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [plantsRes, countRes] = await Promise.all([
        supabase
          .from('garden_plants')
          .select('*')
          .eq('user_id', user.id)
          .order('planted_at', { ascending: true }),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_draft', false)
          .eq('is_deleted', false),
      ])

      const plants   = (plantsRes.data ?? []) as GardenPlant[]
      const total    = countRes.count ?? 0
      const level    = getGardenLevel(total)
      const levelCfg = GARDEN_LEVELS[level]

      const gardenState: GardenState = {
        level,
        total_plants:   plants.length,
        bloomed_plants: plants.filter((p) => p.stage === 'bloom' || p.stage === 'full').length,
        rare_plants:    plants.filter((p) => p.is_rare).length,
        last_grown_at:  plants[plants.length - 1]?.planted_at ?? null,
        season:         getSeason(),
      }

      store.setPlants(plants)
      store.setState(gardenState)
    } catch (err) {
      console.error('[useGarden] load error:', err)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  useEffect(() => {
    load()

    const supabase = createClient()
    const channel = supabase
      .channel('garden-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'garden_plants'
      }, (payload) => {
        store.addPlant(payload.new as GardenPlant)
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'garden_plants'
      }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load, store])

  return {
    plants:          store.plants,
    state:           store.state,
    selectedPlant:   store.selectedPlant,
    isLoading:       store.isLoading,
    newPlantId:      store.newPlantId,
    setSelectedPlant:store.setSelectedPlant,
    clearNewPlant:   () => store.setNewPlantId(null),
    refetch:         load,
  }
}

// ── Helper: get current season ────────────────────────────────
function getSeason(): 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5)  return 'spring'
  if (month >= 6 && month <= 8)  return 'summer'
  return 'autumn'
}

// ── Helper: determine plant type from journal data ────────────
export function getPlantTypeFromJournal(
  moodCategory: string | null,
  streak: number,
  completionPct: number
): PlantType {
  // Bamboo for high streak
  if (streak >= 7) return 'bamboo'
  // Lavender for high self-compassion (completion >= 90)
  if (completionPct >= 90) return 'lavender'
  // Map from mood category
  if (moodCategory && MOOD_TO_PLANT[moodCategory]) {
    return MOOD_TO_PLANT[moodCategory]
  }
  return 'fern'
}
