// ============================================================
// MindBloom — Soundscape Mixer Component
// File: src/components/soundscape/SoundscapeMixer.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Timer, X, Volume2 } from 'lucide-react'
import { useSoundscape } from '@/lib/hooks/useSoundscape'
import {
  SOUND_DEFINITIONS, SOUND_IDS, SOUND_PRESETS, TIMER_OPTIONS,
  type SoundId,
} from '@/types/soundscape'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// Individual sound card with toggle + volume slider
// ────────────────────────────────────────────────────────────
function SoundCard({ id }: { id: SoundId }) {
  const { mix, toggleSound, setVolume } = useSoundscape()
  const def   = SOUND_DEFINITIONS[id]
  const state = mix[id]

  return (
    <motion.div
      layout
      className={cn(
        'rounded-2xl border p-3.5 transition-all',
        state.isActive
          ? 'border-transparent shadow-sm'
          : 'border-border bg-background'
      )}
      style={state.isActive ? { background: def.bg, borderColor: def.color + '40' } : undefined}
    >
      <button
        onClick={() => toggleSound(id)}
        className="flex w-full items-center gap-3 text-left focus-visible:outline-none"
        aria-pressed={state.isActive}
        aria-label={`${state.isActive ? 'Matikan' : 'Nyalakan'} ${def.label}`}
      >
        <div
          className={cn(
            'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-transform',
            state.isActive && 'scale-105'
          )}
          style={{ background: state.isActive ? def.color + '20' : 'var(--color-background-secondary, #F4F3EF)' }}
          aria-hidden="true"
        >
          {def.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: state.isActive ? def.color : undefined }}>
            {def.label}
          </p>
          <p className="text-xs text-muted-foreground truncate">{def.description}</p>
        </div>
        {/* Toggle switch */}
        <div
          className={cn(
            'relative h-6 w-10 flex-shrink-0 rounded-full transition-colors',
            state.isActive ? '' : 'bg-secondary'
          )}
          style={state.isActive ? { background: def.color } : undefined}
        >
          <motion.div
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
            animate={{ left: state.isActive ? 18 : 2 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </button>

      {/* Volume slider — only when active */}
      <AnimatePresence>
        {state.isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{   height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: def.color }} aria-hidden="true" />
              <input
                type="range"
                min={0}
                max={100}
                value={state.volume}
                onChange={(e) => setVolume(id, parseInt(e.target.value))}
                aria-label={`Volume ${def.label}`}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${def.color} 0%, ${def.color} ${state.volume}%, rgba(0,0,0,0.08) ${state.volume}%, rgba(0,0,0,0.08) 100%)`,
                }}
              />
              <span className="w-8 text-right text-[10px] font-mono text-muted-foreground flex-shrink-0">
                {state.volume}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// Timer selector dropdown
// ────────────────────────────────────────────────────────────
function TimerControl() {
  const { timerMinutes, timerEndAt, setTimer, clearTimer } = useSoundscape()
  const [showOptions, setShowOptions] = useState(false)
  const [remaining, setRemaining] = useState<string | null>(null)

  // Update countdown display
  useState(() => {
    if (!timerEndAt) { setRemaining(null); return }
    const interval = setInterval(() => {
      const diff = Math.max(0, timerEndAt - Date.now())
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setRemaining(diff > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : null)
    }, 1000)
    return () => clearInterval(interval)
  })

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          timerMinutes > 0
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary text-muted-foreground hover:text-foreground'
        )}
        aria-expanded={showOptions}
        aria-label="Atur timer tidur"
      >
        <Timer className="h-3 w-3" aria-hidden="true" />
        {remaining ?? 'Timer'}
        {timerMinutes > 0 && (
          <span
            onClick={(e) => { e.stopPropagation(); clearTimer() }}
            className="ml-1 hover:opacity-70"
            role="button"
            aria-label="Batalkan timer"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {showOptions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-background shadow-md"
              role="menu"
            >
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  role="menuitem"
                  onClick={() => { setTimer(opt.minutes); setShowOptions(false) }}
                  className="flex w-full items-center px-3 py-2 text-left text-xs text-foreground hover:bg-secondary transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Preset chips
// ────────────────────────────────────────────────────────────
function PresetChips() {
  const { applyPreset } = useSoundscape()

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {SOUND_PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => applyPreset(preset.mix)}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">{preset.emoji}</span>
          {preset.label}
        </button>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main Mixer Component
// ────────────────────────────────────────────────────────────
export function SoundscapeMixer({ compact = false }: { compact?: boolean }) {
  const { isPlaying, playPause, masterVolume, setMasterVolume, stopAll, mix } = useSoundscape()
  const activeCount = SOUND_IDS.filter((id) => mix[id].isActive).length

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      {/* Header with master controls */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Soundscape</h3>
          <p className="text-xs text-muted-foreground">
            {activeCount > 0 ? `${activeCount} suara aktif` : 'Pilih suara untuk mulai'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimerControl />
          <motion.button
            onClick={playPause}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isPlaying ? 'bg-foreground text-background' : 'bg-primary text-white'
            )}
            aria-label={isPlaying ? 'Hentikan semua suara' : 'Mulai memutar'}
            disabled={activeCount === 0}
          >
            {isPlaying
              ? <Pause className="h-4 w-4" aria-hidden="true" />
              : <Play  className="h-4 w-4 ml-0.5" aria-hidden="true" />}
          </motion.button>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <PresetChips />
      </div>

      {/* Master volume */}
      {activeCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
          <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-muted-foreground flex-shrink-0">Master</span>
          <input
            type="range"
            min={0}
            max={100}
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseInt(e.target.value))}
            aria-label="Volume master"
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7F77DD 0%, #7F77DD ${masterVolume}%, rgba(0,0,0,0.08) ${masterVolume}%, rgba(0,0,0,0.08) 100%)`,
            }}
          />
          <span className="w-8 text-right text-[10px] font-mono text-muted-foreground flex-shrink-0">
            {masterVolume}%
          </span>
        </div>
      )}

      {/* Sound grid */}
      <div className={cn('grid gap-2.5', compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
        {SOUND_IDS.map((id) => (
          <SoundCard key={id} id={id} />
        ))}
      </div>

      {/* Stop all */}
      {activeCount > 0 && (
        <button
          onClick={stopAll}
          className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Hentikan semua suara
        </button>
      )}
    </div>
  )
}
