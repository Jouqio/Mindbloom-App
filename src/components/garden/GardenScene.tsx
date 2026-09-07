// ============================================================
// MindBloom — Garden Scene Component
// File: src/components/garden/GardenScene.tsx
// ============================================================

'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlantSVG } from './PlantSVGs'
import {
  BotanicalLeaf,
  BotanicalBlossom,
  MindfulSpark,
  SunOrb,
  MoonCrescent,
  DriftingCloud,
  LevelSproutIcon,
  GardenLevelIcon,
} from '@/components/ui/BotanicalIcons'
import { GROUND_LAYERS, GARDEN_LEVELS, type GardenPlant, type GardenLevel, type SeasonTheme } from '@/types/garden'
import { cn } from '@/lib/utils'

interface GardenSceneProps {
  plants:      GardenPlant[]
  level:       GardenLevel
  season:      SeasonTheme
  newPlantId?: string | null
  onPlantClick?: (plant: GardenPlant) => void
}

// ── Floating particle (firefly/leaf depending on season) ──────
function FloatingParticle({ season, index }: { season: SeasonTheme; index: number }) {
  const isLeaf = season === 'autumn'
  const isSummer = season === 'summer'
  const startX = 10 + (index * 17) % 80
  const duration = 8 + (index % 4) * 2

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${startX}%`, top: '10%' }}
      animate={{
        y: [0, 200, 0],
        x: [0, 15, -10, 0],
        opacity: [0, 0.7, 0.7, 0],
        rotate: isLeaf ? [0, 180, 360] : 0,
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay: index * 1.5 }}
      aria-hidden="true"
    >
      {isLeaf ? (
        <BotanicalLeaf size={16} className="text-amber-700/60 dark:text-amber-400/60" />
      ) : isSummer ? (
        <MindfulSpark size={14} className="text-amber-300/80 dark:text-amber-200/80" />
      ) : (
        <BotanicalBlossom size={16} className="text-rose-400/70 dark:text-rose-300/70" />
      )}
    </motion.div>
  )
}

// ── Sun / Moon in sky ──────────────────────────────────────────
function SkyOrnament({ level }: { level: GardenLevel }) {
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour >= 19

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute right-6 top-4"
      aria-hidden="true"
    >
      {isNight ? (
        <MoonCrescent size={22} className="text-amber-100/90 dark:text-amber-200/90 drop-shadow-sm" />
      ) : (
        <SunOrb size={24} className="text-amber-400 dark:text-amber-300 drop-shadow-sm" />
      )}
    </motion.div>
  )
}

// ── Single plant slot in the grid ──────────────────────────────
function PlantSlot({
  plant, index, isNew, onClick,
}: {
  plant:   GardenPlant
  index:   number
  isNew:   boolean
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={isNew ? { scale: 0, opacity: 0, y: 20 } : { opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        duration: isNew ? 0.7 : 0.4,
        delay:    isNew ? 0.1 : index * 0.04,
        ease:     [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center justify-center rounded-xl p-1 transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{
        position: 'absolute',
        left: `${plant.position_x}%`,
        bottom: `${plant.position_y}%`,
        transform: 'translate(-50%, 50%)',
      }}
      aria-label={`Tanaman dari ${plant.entry_date ?? 'jurnal'} — ${plant.plant_type}`}
    >
      <PlantSVG
        type={plant.plant_type}
        stage={plant.stage}
        isNew={isNew}
        isRare={plant.is_rare}
        size={isNew ? 56 : 48}
      />
    </motion.button>
  )
}

// ── Main Garden Scene ────────────────────────────────────────
export function GardenScene({
  plants, level, season, newPlantId, onPlantClick,
}: GardenSceneProps) {
  const ground = GROUND_LAYERS[level]
  const levelCfg = GARDEN_LEVELS[level]

  // Generate consistent particle count by level richness
  const particleCount = level === 'forest' ? 8 : level === 'tree' ? 6 : level === 'plant' ? 4 : 2

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-border',
        'aspect-[4/3] md:aspect-[16/9]'
      )}
      role="img"
      aria-label={`Taman emosional level ${levelCfg.label} dengan ${plants.length} tanaman`}
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${ground.sky[0]} 0%, ${ground.sky[1]} 65%)`,
        }}
      />

      {/* Sky ornament */}
      <SkyOrnament level={level} />

      {/* Floating particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <FloatingParticle key={i} season={season} index={i} />
      ))}

      {/* Clouds (decorative hand-drawn SVG vector marks) */}
      <motion.div
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-8 top-6 opacity-60 text-white drop-shadow-sm pointer-events-none"
        aria-hidden="true"
      >
        <DriftingCloud size={40} />
      </motion.div>
      <motion.div
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute left-1/2 top-3 opacity-40 text-white drop-shadow-sm pointer-events-none"
        aria-hidden="true"
      >
        <DriftingCloud size={30} />
      </motion.div>

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%]"
        style={{
          background: ground.grass
            ? `linear-gradient(to bottom, ${ground.grass} 0%, ${ground.ground[0]} 25%, ${ground.ground[1]} 100%)`
            : `linear-gradient(to bottom, ${ground.ground[0]} 0%, ${ground.ground[1]} 100%)`,
        }}
      />

      {/* Grass texture dots (decorative) */}
      {ground.grass && Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1.5 w-0.5 rounded-full opacity-50"
          style={{
            background: '#16A34A',
            left: `${(i * 6.3) % 100}%`,
            bottom: `${33 + (i % 3) * 1.5}%`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Plants container — relative positioning area */}
      <div className="absolute inset-x-0 bottom-0 h-[60%]">
        <AnimatePresence>
          {plants.map((plant, i) => (
            <PlantSlot
              key={plant.id}
              plant={plant}
              index={i}
              isNew={plant.id === newPlantId}
              onClick={() => onPlantClick?.(plant)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state overlay */}
      {plants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-border/60 bg-background/80 dark:bg-card/80 backdrop-blur-md px-5 py-4 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LevelSproutIcon size={18} />
            </div>
            <p className="text-sm font-medium text-foreground">
              Taman masih menanti benih
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tulis jurnal pertamamu untuk menumbuhkan tunas pertama
            </p>
          </div>
        </div>
      )}

      {/* Level badge — bottom right */}
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 dark:bg-card/85 backdrop-blur-md px-2.5 py-1 text-foreground shadow-sm">
        <GardenLevelIcon level={level} size={14} className="text-primary" />
        <span className="text-[11px] font-medium tracking-wide">Level {levelCfg.label}</span>
      </div>
    </div>
  )
}
