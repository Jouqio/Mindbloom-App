// ============================================================
// MindBloom — Breathing Client (Ruang Tenang full page)
// File: src/app/(dashboard)/breathing/BreathingClient.tsx
// ============================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Music2, History } from 'lucide-react'
import { BreathingCircle } from '@/components/breathing/BreathingCircle'
import { BreathingPatternSelector, BreathingSessionSummary } from '@/components/breathing/BreathingControls'
import { SoundscapeMixer } from '@/components/soundscape/SoundscapeMixer'
import { useBreathing } from '@/lib/hooks/useBreathing'
import { BREATHING_PATTERNS } from '@/types/breathing'
import { cn } from '@/lib/utils'

interface Props {
  recentSessions: any[]
  totalSessions:  number
}

type Tab = 'breathe' | 'sounds'

export function BreathingClient({ recentSessions, totalSessions }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('breathe')
  const [showSummary, setShowSummary] = useState(false)
  const [lastSession, setLastSession] = useState<{ cycles: number; duration: number } | null>(null)

  const { isRunning, cyclesCompleted, patternId, sessionStartedAt, stop } = useBreathing()
  const wasRunningRef = useRef(false)

  // Detect when session stops (was running, now not) → show summary + save
  useEffect(() => {
    if (wasRunningRef.current && !isRunning && sessionStartedAt) {
      const duration = Math.floor((Date.now() - sessionStartedAt) / 1000)
      if (cyclesCompleted > 0 || duration > 10) {
        setLastSession({ cycles: cyclesCompleted, duration })
        setShowSummary(true)
        void saveBreathingSession(patternId, cyclesCompleted, duration)
      }
    }
    wasRunningRef.current = isRunning
  }, [isRunning, cyclesCompleted, sessionStartedAt, patternId])

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
          <Wind className="h-5 w-5 text-blue-500" aria-hidden="true" />
          Ruang Tenang
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Bernapas dan dengarkan suara yang menenangkan
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1.5 rounded-xl bg-secondary/60 p-1" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'breathe'}
          onClick={() => setActiveTab('breathe')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all',
            activeTab === 'breathe' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
          )}
        >
          <Wind className="h-3.5 w-3.5" aria-hidden="true" />
          Bernapas
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'sounds'}
          onClick={() => setActiveTab('sounds')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all',
            activeTab === 'sounds' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
          )}
        >
          <Music2 className="h-3.5 w-3.5" aria-hidden="true" />
          Suara
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showSummary && lastSession ? (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BreathingSessionSummary
              cycles={lastSession.cycles}
              durationSec={lastSession.duration}
              onClose={() => setShowSummary(false)}
            />
          </motion.div>
        ) : activeTab === 'breathe' ? (
          <motion.div
            key="breathe"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{   opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Breathing circle card */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <BreathingCircle />
            </div>

            {/* Pattern selector */}
            <div>
              <h2 className="mb-2.5 text-sm font-medium text-foreground">Pilih Teknik</h2>
              <BreathingPatternSelector />
            </div>

            {/* Stats */}
            {totalSessions > 0 && (
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <h3 className="text-sm font-medium text-foreground">Riwayat Latihan</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Total {totalSessions} sesi telah kamu selesaikan
                </p>
                <div className="flex flex-col gap-2">
                  {recentSessions.slice(0, 3).map((s: any) => {
                    const p = BREATHING_PATTERNS[s.pattern_id as keyof typeof BREATHING_PATTERNS]
                    return (
                      <div key={s.id} className="flex items-center gap-2.5 rounded-lg bg-secondary/40 px-3 py-2">
                        <span className="text-base" aria-hidden="true">{p?.emoji ?? '🫁'}</span>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">{p?.name ?? s.pattern_id}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.cycles_completed} siklus · {Math.floor(s.duration_sec / 60)}m {s.duration_sec % 60}s
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="sounds"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{   opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SoundscapeMixer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

// ── Save session to database ──────────────────────────────────
async function saveBreathingSession(
  patternId: string,
  cycles:    number,
  durationSec: number
): Promise<void> {
  try {
    await fetch('/api/breathing/session', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern_id: patternId, cycles_completed: cycles, duration_sec: durationSec }),
    })
  } catch (err) {
    console.error('[saveBreathingSession]', err)
  }
}
