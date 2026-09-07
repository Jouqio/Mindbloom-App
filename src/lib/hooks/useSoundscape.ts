// ============================================================
// MindBloom — useSoundscape Hook
// File: src/lib/hooks/useSoundscape.ts
// ============================================================

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSoundscapeStore } from '@/store/soundscapeStore'
import { getSoundEngine } from '@/lib/audio/soundEngine'
import { SOUND_IDS, type SoundId } from '@/types/soundscape'

export function useSoundscape() {
  const store  = useSoundscapeStore()
  const engine = useRef(getSoundEngine())

  // ── Sync engine with store state on mount + changes ────────
  useEffect(() => {
    SOUND_IDS.forEach((id) => {
      const soundState = store.mix[id]
      const isEngineplaying = engine.current.isPlaying(id)

      if (soundState.isActive && !isEngineplaying && store.isPlaying) {
        engine.current.play(id, soundState.volume)
      } else if (!soundState.isActive && isEngineplaying) {
        engine.current.stop(id)
      } else if (soundState.isActive && isEngineplaying) {
        engine.current.setVolume(id, soundState.volume)
      }
    })
  }, [store.mix, store.isPlaying])

  // Master volume sync
  useEffect(() => {
    engine.current.setMasterVolume(store.masterVolume)
  }, [store.masterVolume])

  // ── Pause audio context when tab hidden (battery save) ─────
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) engine.current.suspend()
      else if (store.isPlaying) engine.current.resume()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [store.isPlaying])

  // ── Sleep timer countdown ───────────────────────────────────
  useEffect(() => {
    if (!store.timerEndAt) return

    const interval = setInterval(() => {
      if (Date.now() >= (store.timerEndAt ?? 0)) {
        handleStopAll()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.timerEndAt])

  // ── Public actions ───────────────────────────────────────────
  const handlePlayPause = useCallback(async () => {
    if (!store.isPlaying) {
      await engine.current.unlock() // requires user gesture — this IS the gesture
      store.setPlaying(true)
    } else {
      store.setPlaying(false)
      SOUND_IDS.forEach((id) => engine.current.stop(id))
    }
  }, [store])

  const handleToggleSound = useCallback(async (id: SoundId) => {
    await engine.current.unlock()
    const wasActive = store.mix[id].isActive
    store.toggleSound(id)

    // If this is the first sound being activated, also start playing
    if (!wasActive && !store.isPlaying) {
      store.setPlaying(true)
    }

    // If turning off and it was the only one active, stop playing state
    const activeCount = SOUND_IDS.filter((sid) =>
      sid === id ? !wasActive : store.mix[sid].isActive
    ).length
    if (activeCount === 0) {
      store.setPlaying(false)
    }
  }, [store])

  const handleVolumeChange = useCallback((id: SoundId, volume: number) => {
    store.setVolume(id, volume)
  }, [store])

  const handleApplyPreset = useCallback(async (mix: Partial<Record<SoundId, number>>) => {
    await engine.current.unlock()
    // Stop currently playing sounds not in new mix
    SOUND_IDS.forEach((id) => {
      if (!(id in mix)) engine.current.stop(id)
    })
    store.applyPreset(mix)
    store.setPlaying(true)
  }, [store])

  const handleStopAll = useCallback(() => {
    SOUND_IDS.forEach((id) => engine.current.stop(id))
    store.stopAllSounds()
  }, [store])

  // Cleanup on unmount (component, not app — engine is singleton)
  useEffect(() => {
    return () => {
      // Don't destroy engine here — user might navigate away and back
      // Engine persists for the session
    }
  }, [])

  return {
    mix:           store.mix,
    masterVolume:  store.masterVolume,
    isPlaying:     store.isPlaying,
    timerMinutes:  store.timerMinutes,
    timerEndAt:    store.timerEndAt,
    playPause:     handlePlayPause,
    toggleSound:   handleToggleSound,
    setVolume:     handleVolumeChange,
    setMasterVolume: store.setMasterVolume,
    applyPreset:   handleApplyPreset,
    setTimer:      store.setTimer,
    clearTimer:    store.clearTimer,
    stopAll:       handleStopAll,
  }
}
