// ============================================================
// MindBloom — Garden Info Components
// File: src/components/garden/GardenInfo.tsx
// Contains: LevelProgress, PlantDetailModal, GardenStats
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Sparkles } from 'lucide-react'
import Link from 'next/link'
import {
  GARDEN_LEVELS,
  PLANT_CONFIG,
  type GardenLevel,
  type GardenPlant,
  type GardenState,
} from '@/types/garden'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// 1. LEVEL PROGRESS WIDGET
// ────────────────────────────────────────────────────────────
const LEVEL_ORDER: GardenLevel[] = ['seed', 'sprout', 'plant', 'tree', 'forest']

export function LevelProgress({ state, totalJournals }: {
  state:         GardenState | null
  totalJournals: number
}) {
  const currentLevel = state?.level ?? 'seed'
  const currentIdx   = LEVEL_ORDER.indexOf(currentLevel)
  const nextLevel    = LEVEL_ORDER[currentIdx + 1]
  const nextCfg      = nextLevel ? GARDEN_LEVELS[nextLevel] : null
  const currentCfg   = GARDEN_LEVELS[currentLevel]

  const progressPct = nextCfg
    ? Math.min(100, Math.round(
        ((totalJournals - currentCfg.minJournals) /
        (nextCfg.minJournals - currentCfg.minJournals)) * 100
      ))
    : 100

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{currentCfg.emoji}</span>
          <div>
            <p className="text-sm font-medium text-foreground">Level {currentCfg.label}</p>
            <p className="text-xs text-muted-foreground">{totalJournals} jurnal ditulis</p>
          </div>
        </div>
        {nextCfg && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Berikutnya</p>
            <p className="text-xs font-medium text-foreground">
              {nextCfg.emoji} {nextCfg.label}
            </p>
          </div>
        )}
      </div>

      {nextCfg ? (
        <>
          <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {nextCfg.minJournals - totalJournals} jurnal lagi menuju level {nextCfg.label}
          </p>
        </>
      ) : (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          🎉 Level maksimum tercapai! Tamanmu adalah hutan yang rimbun.
        </p>
      )}

      {/* Level path mini */}
      <div className="mt-3 flex items-center justify-between">
        {LEVEL_ORDER.map((lvl, i) => (
          <div key={lvl} className="flex items-center">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-sm transition-all',
                i <= currentIdx ? 'bg-primary/15' : 'bg-secondary opacity-40'
              )}
              title={GARDEN_LEVELS[lvl].label}
            >
              {GARDEN_LEVELS[lvl].emoji}
            </div>
            {i < LEVEL_ORDER.length - 1 && (
              <div className={cn(
                'h-0.5 w-4 md:w-8',
                i < currentIdx ? 'bg-primary/40' : 'bg-secondary'
              )} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. PLANT DETAIL MODAL
// ────────────────────────────────────────────────────────────
export function PlantDetailModal({
  plant, onClose,
}: {
  plant:   GardenPlant | null
  onClose: () => void
}) {
  if (!plant) return null
  const cfg = PLANT_CONFIG[plant.plant_type]

  return (
    <AnimatePresence>
      {plant && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            role="presentation"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 8  }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Detail tanaman ${cfg.label}`}
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-lg"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary transition-colors"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>

              {/* Big plant icon */}
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl"
                style={{ background: cfg.color + '15' }}>
                <span className="text-5xl" aria-hidden="true">{cfg.emoji}</span>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-lg font-medium text-foreground">{cfg.label}</h2>
                {plant.is_rare && (
                  <span className="flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                    Langka
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{cfg.description}</p>

              {plant.entry_date && (
                <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">
                    Ditanam {new Date(plant.entry_date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {plant.entry_id && (
                <Link
                  href={`/journal/${plant.entry_id}`}
                  className="mt-4 block w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Baca jurnal hari itu
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ────────────────────────────────────────────────────────────
// 3. GARDEN STATS
// ────────────────────────────────────────────────────────────
export function GardenStats({ state }: { state: GardenState | null }) {
  const stats = [
    { label: 'Total tanaman', value: state?.total_plants   ?? 0, emoji: '🌿' },
    { label: 'Mekar penuh',   value: state?.bloomed_plants ?? 0, emoji: '🌸' },
    { label: 'Tanaman langka',value: state?.rare_plants    ?? 0, emoji: '✨' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="rounded-2xl border border-border bg-background p-3 text-center"
        >
          <p className="text-xl" aria-hidden="true">{s.emoji}</p>
          <p className="mt-1 text-lg font-medium text-foreground">{s.value}</p>
          <p className="text-[10px] text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 4. PLANT LEGEND
// ────────────────────────────────────────────────────────────
export function PlantLegend() {
  const commonPlants = Object.entries(PLANT_CONFIG).filter(([, cfg]) => !cfg.isRare)
  const rarePlants   = Object.entries(PLANT_CONFIG).filter(([, cfg]) => cfg.isRare)

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <h3 className="mb-3 text-sm font-medium text-foreground">Jenis Tanaman</h3>
      <div className="flex flex-col gap-2">
        {commonPlants.map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2.5">
            <span className="text-base" aria-hidden="true">{cfg.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{cfg.label}</p>
              <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Tanaman Langka
        </p>
        <div className="flex flex-col gap-2">
          {rarePlants.map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2.5">
              <span className="text-base" aria-hidden="true">{cfg.emoji}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">{cfg.label}</p>
                <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
