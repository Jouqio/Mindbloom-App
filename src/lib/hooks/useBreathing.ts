// ============================================================
// MindBloom — useBreathing Hook
// File: src/lib/hooks/useBreathing.ts
// ============================================================

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useBreathingStore } from '@/store/breathingStore'
import { BREATHING_PATTERNS, BREATH_SEQUENCE, type BreathPhase } from '@/types/breathing'

export function useBreathing() {
  const store = useBreathingStore()
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const sequenceIdxRef = useRef(0)

  const pattern = BREATHING_PATTERNS[store.patternId]

  const getPhaseDuration = useCallback((phase: BreathPhase): number => {
    switch (phase) {
      case 'inhale':  return pattern.phases.inhale
      case 'holdIn':  return pattern.phases.holdIn
      case 'exhale':  return pattern.phases.exhale
      case 'holdOut': return pattern.phases.holdOut
      default:        return 0
    }
  }, [pattern])

  // Build active sequence — skip phases with 0 duration (e.g. coherent has no holds)
  const getActiveSequence = useCallback((): BreathPhase[] => {
    return BREATH_SEQUENCE.filter((p) => getPhaseDuration(p) > 0)
  }, [getPhaseDuration])

  const clearTimers = useCallback(() => {
    if (phaseTimerRef.current) { clearTimeout(phaseTimerRef.current); phaseTimerRef.current = null }
    if (countdownRef.current)  { clearInterval(countdownRef.current); countdownRef.current = null }
  }, [])

  const runPhase = useCallback((phase: BreathPhase) => {
    const duration = getPhaseDuration(phase)
    store.setPhase(phase)
    store.setCountdown(duration)

    clearTimers()

    // Countdown ticker
    countdownRef.current = setInterval(() => {
      const current = useBreathingStore.getState().countdown
      if (current <= 1) {
        if (countdownRef.current) clearInterval(countdownRef.current)
      } else {
        store.setCountdown(current - 1)
      }
    }, 1000)

    // Move to next phase after duration
    phaseTimerRef.current = setTimeout(() => {
      const sequence = getActiveSequence()
      sequenceIdxRef.current = (sequenceIdxRef.current + 1) % sequence.length

      // Completed a full cycle
      if (sequenceIdxRef.current === 0) {
        store.incrementCycle()
      }

      if (useBreathingStore.getState().isRunning) {
        runPhase(sequence[sequenceIdxRef.current])
      }
    }, duration * 1000)
  }, [getPhaseDuration, getActiveSequence, clearTimers, store])

  const start = useCallback(() => {
    sequenceIdxRef.current = 0
    store.startSession()
    const sequence = getActiveSequence()
    runPhase(sequence[0])
  }, [store, getActiveSequence, runPhase])

  const stop = useCallback(() => {
    clearTimers()
    store.resetSession()
    sequenceIdxRef.current = 0
  }, [clearTimers, store])

  const changePattern = useCallback((patternId: typeof store.patternId) => {
    stop()
    store.setPattern(patternId)
  }, [stop, store])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  return {
    pattern,
    patternId:       store.patternId,
    phase:           store.phase,
    isRunning:       store.isRunning,
    cyclesCompleted: store.cyclesCompleted,
    countdown:       store.countdown,
    sessionStartedAt:store.sessionStartedAt,
    start,
    stop,
    changePattern,
  }
}
