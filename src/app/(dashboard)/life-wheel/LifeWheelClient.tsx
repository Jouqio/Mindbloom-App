// ============================================================
// MindBloom — Life Wheel Client Component
// File: src/app/(dashboard)/life-wheel/LifeWheelClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { LifeWheelRadar, LifeWheelScoreSliders, LifeWheelAnalysis } from '@/components/lifewheel/LifeWheelChart'
import { useLifeWheel } from '@/lib/hooks/useLifeWheel'
import {
  LIFE_DIMENSIONS_ORDER, INITIAL_SCORES,
  type LifeDimension, type LifeWheelEntry,
} from '@/types/lifewheel'

interface Props { initialEntries: LifeWheelEntry[] }

export function LifeWheelClient({ initialEntries }: Props) {
  const { entries, latest, previous, isLoading, isSaving, canCreateNew, daysSinceLastEntry, saveEntry } = useLifeWheel()
  const [mode, setMode] = useState<'view' | 'fill'>('view')
  const [scores, setScores] = useState({ ...INITIAL_SCORES })
  const [saved, setSaved] = useState(false)

  const displayEntries = entries.length > 0 ? entries : initialEntries
  const displayLatest  = latest ?? initialEntries[0] ?? null
  const displayPrev    = previous ?? initialEntries[1] ?? null

  const handleScoreChange = (dim: LifeDimension, val: number) => {
    setScores((prev) => ({ ...prev, [dim]: val }))
  }

  const handleSave = async () => {
    const result = await saveEntry(scores, {})
    if (result.success) {
      setSaved(true)
      setMode('view')
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const startFill = () => {
    // Pre-fill from latest if exists
    if (displayLatest) setScores({ ...displayLatest.scores })
    else setScores({ ...INITIAL_SCORES })
    setMode('fill')
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-xl font-medium text-foreground">🎡 Life Wheel</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Evaluasi keseimbangan hidupmu dalam 8 dimensi
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── VIEW MODE ─────────────────────────────────────────── */}
        {mode === 'view' && (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-5">

            {saved && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300">
                ✅ Life Wheel tersimpan!
              </motion.div>
            )}

            {/* Radar chart */}
            {displayLatest ? (
              <>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Terakhir diisi</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(displayLatest.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    {displayPrev && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        Garis putus = entri sebelumnya
                      </span>
                    )}
                  </div>
                  <LifeWheelRadar
                    scores={displayLatest.scores}
                    prevScores={displayPrev?.scores ?? null}
                  />
                </div>

                <LifeWheelAnalysis entry={displayLatest} />

                {/* Dimension score detail */}
                <div className="rounded-2xl border border-border bg-background p-4">
                  <h3 className="mb-3 text-sm font-medium text-foreground">Skor per Dimensi</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {LIFE_DIMENSIONS_ORDER.map((dim) => {
                      const score = displayLatest.scores[dim] ?? 0
                      const prevScore = displayPrev?.scores[dim] ?? null
                      const diff = prevScore !== null ? score - prevScore : null
                      return (
                        <div key={dim} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-2.5 py-2">
                          <div className="h-7 w-1 rounded-full" style={{
                            background: `hsl(var(--primary) / ${score / 10})`
                          }} aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {score}/10
                            </p>
                            {diff !== null && (
                              <p className={`text-[10px] font-medium ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                {diff > 0 ? `+${diff}` : diff < 0 ? diff : '='}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={startFill}
                    disabled={!canCreateNew}
                    className="flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    {canCreateNew
                      ? 'Isi Life Wheel Baru'
                      : `Tersedia lagi dalam ${7 - daysSinceLastEntry} hari`}
                  </button>
                  {!canCreateNew && (
                    <p className="text-center text-xs text-muted-foreground">
                      Life Wheel dirancang untuk diisi setiap minggu agar refleksimu lebih bermakna
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* First time */
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-10 text-center">
                <div className="text-5xl" aria-hidden="true">🎡</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Mulai evaluasi hidupmu</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                    Life Wheel membantu kamu memahami area mana dalam hidupmu yang perlu lebih banyak perhatian.
                  </p>
                </div>
                <button
                  onClick={startFill}
                  className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity"
                >
                  Mulai sekarang
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── FILL MODE ─────────────────────────────────────────── */}
        {mode === 'fill' && (
          <motion.div key="fill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-5">
            {/* Live radar preview */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="mb-3 text-sm font-medium text-foreground text-center">Pratinjau</p>
              <LifeWheelRadar scores={scores} />
            </div>

            {/* Score sliders */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="mb-4 text-sm font-medium text-foreground">
                Nilai setiap dimensi (1 = sangat buruk, 10 = luar biasa)
              </h2>
              <LifeWheelScoreSliders scores={scores} onChange={handleScoreChange} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setMode('view')}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Simpan Life Wheel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
