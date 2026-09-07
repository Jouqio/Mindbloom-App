// ============================================================
// MindBloom — Garden Client Component (Workbench Macrostructure)
// File: src/app/(dashboard)/garden/GardenClient.tsx
// Theme Garden · Newsreader + Inter · Tier B Hand-built SVGs
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Sparkles } from 'lucide-react'
import { GardenScene } from '@/components/garden/GardenScene'
import {
  LevelProgress,
  PlantDetailModal,
  GardenStats,
  PlantLegend,
} from '@/components/garden/GardenInfo'
import {
  MindBloomEmblem,
  LevelSproutIcon,
} from '@/components/ui/BotanicalIcons'
import { useGarden } from '@/lib/hooks/useGarden'
import { getGardenLevel } from '@/types/garden'
import type { GardenPlant, GardenState } from '@/types/garden'

interface Props {
  initialPlants: any[]
  totalJournals: number
}

export function GardenClient({ initialPlants, totalJournals }: Props) {
  const {
    plants,
    state,
    selectedPlant,
    newPlantId,
    setSelectedPlant,
    clearNewPlant,
  } = useGarden()
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
      {/* Botanical detail modal */}
      <PlantDetailModal plant={selectedPlant} onClose={() => setSelectedPlant(null)} />

      <main className="mx-auto max-w-3xl px-3 sm:px-6 py-6 pb-24 md:pb-12 overflow-x-clip">
        {/* Orientation Header (Workbench Standard) */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-start justify-between gap-4 border-b border-border/40 pb-4"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <MindBloomEmblem size={18} />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
                Taman Emosional
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-sans">
              Setiap catatan refleksi menyuburkan ekosistem botani hatimu secara nyata.
            </p>
          </div>

          {/* Flora catalog toggle button (min 44x44 touch target) */}
          <button
            onClick={() => setShowLegend((v) => !v)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showLegend ? 'Tutup keterangan flora' : 'Buka katalog keterangan flora'}
            aria-expanded={showLegend}
            title="Katalog Flora Emosional"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.header>

        <div className="flex flex-col gap-5">
          {/* Direct Manipulation Workbench Canvas Frame */}
          <motion.section
            aria-label="Kanvas taman interaktif"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-border/80 bg-card/40 p-1.5 shadow-sm"
          >
            <GardenScene
              plants={displayPlants}
              level={displayLevel}
              season={displayState.season}
              newPlantId={newPlantId}
              onPlantClick={setSelectedPlant}
            />
          </motion.section>

          {/* New plant sprout notification bar */}
          <AnimatePresence>
            {newPlantId && (
              <motion.button
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={clearNewPlant}
                className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-primary hover:bg-primary/15 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <LevelSproutIcon size={16} className="text-primary shrink-0" />
                  <span>Tanaman baru telah bersemi dari refleksi terakhirmu!</span>
                </div>
                <span className="text-[11px] text-muted-foreground underline ml-2">Tutup</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Curved Growth Milestone Path */}
          <LevelProgress state={displayState} totalJournals={totalJournals} />

          {/* Asymmetric Stat Cluster */}
          <GardenStats state={displayState} />

          {/* Plant Species Catalog Legend */}
          <AnimatePresence>
            {showLegend && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <PlantLegend />
              </motion.div>
            )}
          </AnimatePresence>
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
