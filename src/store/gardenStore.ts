// ============================================================
// MindBloom — Garden Store (Zustand)
// File: src/store/gardenStore.ts
// ============================================================

import { create } from 'zustand'
import type { GardenPlant, GardenState, GardenLevel } from '@/types/garden'

interface GardenStore {
  plants:         GardenPlant[]
  state:          GardenState | null
  selectedPlant:  GardenPlant | null
  isLoading:      boolean
  newPlantId:     string | null   // triggers grow animation

  setPlants:       (p: GardenPlant[]) => void
  setState:        (s: GardenState) => void
  setSelectedPlant:(p: GardenPlant | null) => void
  setLoading:      (v: boolean) => void
  setNewPlantId:   (id: string | null) => void
  addPlant:        (p: GardenPlant) => void
}

export const useGardenStore = create<GardenStore>((set) => ({
  plants:         [],
  state:          null,
  selectedPlant:  null,
  isLoading:      false,
  newPlantId:     null,

  setPlants:       (plants)        => set({ plants }),
  setState:        (state)         => set({ state }),
  setSelectedPlant:(selectedPlant) => set({ selectedPlant }),
  setLoading:      (isLoading)     => set({ isLoading }),
  setNewPlantId:   (newPlantId)    => set({ newPlantId }),

  addPlant: (plant) => set((s) => ({
    plants:     [plant, ...s.plants],
    newPlantId: plant.id,
  })),
}))


// ============================================================
// MindBloom — useGarden Hook
// File: src/lib/hooks/useGarden.ts
// ============================================================

// (Exported separately — see useGarden.ts)
