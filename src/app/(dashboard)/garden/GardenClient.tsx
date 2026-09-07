// ============================================================
// MindBloom — Garden Client Component
// File: src/app/(dashboard)/garden/GardenClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flower2, Info } from 'lucide-react'
import { GardenScene } from '@/components/garden/GardenScene'
import { LevelProgress, PlantDetailModal, GardenStats, PlantLegend } from '@/components/garden/GardenInfo'
import { useGarden } from '@/lib/hooks/useGarden'
import { getGardenLevel } from '@/types/garden'
import type { GardenPlant, GardenState } from '@/types/garden'

interface Props {
  initialPlants: any[]
  totalJournals: number
}

export function GardenClient({ initialPlants, totalJournals }: Props) {
  const { plants, state, selectedPlant, newPlantId, setSelectedPlant, clearNewPlant } = useGarden()
  const [showLegend, setShowLegend] = useState(false)

  // Use realtime data, fallback to server-fetched
  const displayPlants: GardenPlant[] = plants.length > 0 ? plants : initialPlants
  const displayLevel  = state?.level ?? getGardenLevel(totalJournals)
  const displayState: GardenState = state ?? {
    level:          displayLevel,
    total_plants:   displayPlants.length,
    bloomed_plants: displayPlants.filter((p) => p.stage === 'bloom' || p.stage === 'full').length,
    rare_plants:    displayPlants.filter((p) => p.is_rare).length,
    last_grown_at:  null,
    season:         getSeasonNow(),
  }

  return (
    <>
      <PlantDetailModal plant={selectedPlant} onClose={() => setSelectedPlant(null)} />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
              <Flower2 className="h-5 w-5 text-green-500" aria-hidden="true" />
              Taman Emosional
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tumbuh dari setiap refleksi yang kamu tulis
            </p>
          </div>
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Lihat keterangan tanaman"
            aria-expanded={showLegend}
          >
            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Garden visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <GardenScene
              plants={displayPlants}
              level={displayLevel}
              season={displayState.season}
              newPlantId={newPlantId}
              onPlantClick={setSelectedPlant}
            />
          </motion.div>

          {/* New plant notification */}
          {newPlantId && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={clearNewPlant}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-300"
            >
              🌱 Tanaman baru tumbuh dari jurnal terakhirmu!
            </motion.button>
          )}

          {/* Level progress */}
          <LevelProgress state={displayState} totalJournals={totalJournals} />

          {/* Stats */}
          <GardenStats state={displayState} />

          {/* Legend (toggle) */}
          {showLegend && <PlantLegend />}
        </div>
      </main>
    </>
  )
}

function getSeasonNow(): 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  return 'autumn'
}
