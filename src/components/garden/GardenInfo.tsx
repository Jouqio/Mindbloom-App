// ============================================================
// MindBloom — Garden Info Components
// File: src/components/garden/GardenInfo.tsx
// Contains: LevelProgress (Curved Growth Path), PlantDetailModal,
// GardenStats (Asymmetric Stat Cluster), PlantLegend (Botanical Catalog)
// ============================================================

'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PlantSVG } from './PlantSVGs'
import {
  GardenLevelIcon,
  MindfulSpark,
  BotanicalBlossom,
  LevelPlantIcon,
  LevelSproutIcon,
} from '@/components/ui/BotanicalIcons'
import {
  GARDEN_LEVELS,
  PLANT_CONFIG,
  type GardenLevel,
  type GardenPlant,
  type GardenState,
  type PlantType,
} from '@/types/garden'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// 1. LEVEL PROGRESS — CURVED BOTANICAL GROWTH PATH
// ────────────────────────────────────────────────────────────
const LEVEL_ORDER: GardenLevel[] = ['seed', 'sprout', 'plant', 'tree', 'forest']

export function LevelProgress({
  state,
  totalJournals,
}: {
  state:         GardenState | null
  totalJournals: number
}) {
  const currentLevel = state?.level ?? 'seed'
  const currentIdx   = LEVEL_ORDER.indexOf(currentLevel)
  const nextLevel    = LEVEL_ORDER[currentIdx + 1]
  const nextCfg      = nextLevel ? GARDEN_LEVELS[nextLevel] : null
  const currentCfg   = GARDEN_LEVELS[currentLevel]

  const progressPct = nextCfg
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((totalJournals - currentCfg.minJournals) /
              (nextCfg.minJournals - currentCfg.minJournals)) *
              100
          )
        )
      )
    : 100

  // Total overall journey completion across all 5 levels (0 to 100)
  const overallStepProgress = Math.min(
    100,
    Math.round(((currentIdx + (nextCfg ? progressPct / 100 : 1)) / (LEVEL_ORDER.length - 1)) * 100)
  )

  return (
    <section
      aria-label="Progres pertumbuhan taman"
      className="rounded-2xl border border-border/80 bg-card/70 dark:bg-card/50 p-4 sm:p-5 backdrop-blur-sm shadow-xs"
    >
      {/* Header Info */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <GardenLevelIcon level={currentLevel} size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Tahap Pertumbuhan
              </span>
              <span className="inline-block h-1 w-1 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">
                Level {currentCfg.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {totalJournals} refleksi tertanam dalam ekosistem
            </p>
          </div>
        </div>

        {nextCfg ? (
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground block">
              Menuju Tahap Berikutnya
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <GardenLevelIcon level={nextLevel!} size={13} className="text-primary" />
              {nextCfg.label}
              <span className="text-[10px] text-muted-foreground">
                ({nextCfg.minJournals - totalJournals} lagi)
              </span>
            </span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
            <MindfulSpark size={12} />
            Hutan Rimbun Lestari
          </span>
        )}
      </div>

      {/* Organic Curved Growth Rail */}
      <div className="relative pt-2 pb-1 px-1">
        {/* Curved Vine SVG Track */}
        <div className="relative h-10 w-full overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 40"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Base vine path */}
            <path
              d="M 10 20 Q 100 8, 200 20 T 390 20"
              stroke="currentColor"
              className="text-border/60 dark:text-border/40"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Active filled vine path */}
            <motion.path
              d="M 10 20 Q 100 8, 200 20 T 390 20"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="400"
              initial={{ strokeDashoffset: 400 }}
              animate={{ strokeDashoffset: 400 - (400 * (overallStepProgress / 100)) }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            />
          </svg>
        </div>

        {/* Milestone Nodes positioned over the vine */}
        <div className="absolute inset-x-0 top-1 flex items-center justify-between px-1">
          {LEVEL_ORDER.map((lvl, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent   = idx === currentIdx
            const isLocked    = idx > currentIdx
            const cfg         = GARDEN_LEVELS[lvl]

            return (
              <div
                key={lvl}
                className="flex flex-col items-center group relative cursor-default"
                title={`${cfg.label} (Min. ${cfg.minJournals} jurnal)`}
              >
                <div
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                    isCurrent
                      ? 'bg-background text-primary border-2 border-primary shadow-sm ring-4 ring-primary/15'
                      : isCompleted
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-secondary/70 text-muted-foreground/60 border border-border/60'
                  )}
                >
                  <GardenLevelIcon level={lvl} size={15} />
                  {isCurrent && (
                    <motion.span
                      layoutId="current-level-pulse"
                      className="absolute inset-0 rounded-full border border-primary animate-ping opacity-30"
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                <span
                  className={cn(
                    'mt-1.5 text-[10px] font-medium tracking-tight whitespace-nowrap',
                    isCurrent
                      ? 'text-foreground font-semibold'
                      : isCompleted
                      ? 'text-foreground/80'
                      : 'text-muted-foreground/60'
                  )}
                >
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subtext description */}
      <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <p className="italic">
          {currentCfg.description}
        </p>
        {nextCfg && (
          <span className="font-mono text-[11px] font-medium text-foreground/70 shrink-0 ml-2">
            {progressPct}% ke tahap berikutnya
          </span>
        )}
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// 2. PLANT DETAIL MODAL — ACCESSIBLE BOTANICAL SHEET
// ────────────────────────────────────────────────────────────
export function PlantDetailModal({
  plant,
  onClose,
}: {
  plant:   GardenPlant | null
  onClose: () => void
}) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plant) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Lock body scroll while modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [plant, onClose])

  if (!plant) return null
  const cfg = PLANT_CONFIG[plant.plant_type]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          role="presentation"
        />

        {/* Dialog Content */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="plant-detail-title"
          aria-describedby="plant-detail-desc"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm rounded-2xl border border-border/80 bg-background p-6 shadow-xl z-10"
        >
          {/* Close button with 44px touch area */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup jendela detail tanaman"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Plant SVG Showcase Frame */}
          <div
            className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-2xl border border-border/60"
            style={{ background: `${cfg.color}10` }}
          >
            <PlantSVG
              type={plant.plant_type}
              stage={plant.stage}
              size={84}
              isRare={plant.is_rare}
            />
          </div>

          {/* Botanical Nomenclature & Rarity */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h2
                id="plant-detail-title"
                className="font-display text-xl font-normal text-foreground"
              >
                {cfg.label}
              </h2>
              {plant.is_rare && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  <MindfulSpark size={11} />
                  Spesimen Langka
                </span>
              )}
            </div>

            <p id="plant-detail-desc" className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {cfg.description}
            </p>

            {/* Stage Indicator Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 text-[11px] text-foreground/80">
              <span className="capitalize">Fase: {plant.stage}</span>
            </div>
          </div>

          {/* Planted Date */}
          {plant.entry_date && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-secondary/50 border border-border/40 px-3 py-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Tertanam sejak{' '}
                <time dateTime={plant.entry_date}>
                  {new Date(plant.entry_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </span>
            </div>
          )}

          {/* Journal Reference Link */}
          {plant.entry_id && (
            <Link
              href={`/journal/${plant.entry_id}`}
              className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Buka catatan refleksi hari ini</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ────────────────────────────────────────────────────────────
// 3. GARDEN STATS — ASYMMETRIC STAT CLUSTER
// ────────────────────────────────────────────────────────────
export function GardenStats({ state }: { state: GardenState | null }) {
  const totalPlants   = state?.total_plants   ?? 0
  const bloomedPlants = state?.bloomed_plants ?? 0
  const rarePlants    = state?.rare_plants    ?? 0

  return (
    <section aria-label="Statistik ekosistem taman" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Primary Feature Card: Total Plants */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sm:col-span-1 rounded-2xl border border-primary/25 bg-primary/5 p-4 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Spesimen Tumbuh
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <LevelPlantIcon size={16} />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-display text-3xl font-normal text-foreground leading-none">
            {totalPlants}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Total tanaman hidup dari jurnalmu
          </p>
        </div>
      </motion.div>

      {/* Secondary Metric: Bloomed Plants */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
        className="rounded-2xl border border-border/80 bg-card/70 p-4 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Mekar Penuh
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400">
            <BotanicalBlossom size={15} />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-display text-2xl font-normal text-foreground leading-none">
            {bloomedPlants}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Bunga mekar sempurna
          </p>
        </div>
      </motion.div>

      {/* Secondary Metric: Rare Botanical Finds */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="rounded-2xl border border-border/80 bg-card/70 p-4 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tanaman Langka
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <MindfulSpark size={15} />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-display text-2xl font-normal text-foreground leading-none">
            {rarePlants}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Hadiah konsistensi refleksi
          </p>
        </div>
      </motion.div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────
// 4. PLANT LEGEND — BOTANICAL SPECIES CATALOG
// ────────────────────────────────────────────────────────────
export function PlantLegend() {
  const commonPlants = Object.entries(PLANT_CONFIG).filter(([, cfg]) => !cfg.isRare)
  const rarePlants   = Object.entries(PLANT_CONFIG).filter(([, cfg]) => cfg.isRare)

  return (
    <section
      aria-label="Katalog jenis tanaman"
      className="rounded-2xl border border-border/80 bg-card/60 dark:bg-card/40 p-4 sm:p-5 backdrop-blur-sm"
    >
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="font-display text-base font-normal text-foreground">
          Katalog Flora Emosional
        </h3>
        <span className="text-[11px] text-muted-foreground font-mono">
          10 Spesies Terpetakan
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {commonPlants.map(([key, cfg]) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/50 p-2.5 hover:bg-secondary/40 transition-colors"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50"
              style={{ background: `${cfg.color}12` }}
            >
              <PlantSVG type={key as PlantType} stage="bloom" size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {cfg.label}
              </p>
              <p className="text-[10px] text-muted-foreground line-clamp-1">
                {cfg.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rare plants shelf */}
      <div className="mt-4 pt-3.5 border-t border-border/50">
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <MindfulSpark size={13} />
          <span>Spesimen Langka (Pencapaian Spesial)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {rarePlants.map(([key, cfg]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-2.5 hover:bg-amber-500/10 transition-colors"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/20"
                style={{ background: `${cfg.color}15` }}
              >
                <PlantSVG type={key as PlantType} stage="bloom" size={30} isRare />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {cfg.label}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {cfg.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
