// ============================================================
// MindBloom — Insights Client (Full Page)
// File: src/app/(dashboard)/insights/InsightsClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, TrendingUp, RefreshCw, Loader2, ChevronDown } from 'lucide-react'
import { InsightCardWidget, EIScoreRadar } from '@/components/insights/InsightCard'
import { PatternCard } from '@/components/insights/PatternCard'
import { useInsights } from '@/lib/hooks/useInsights'
import { detectPatterns } from '@/lib/ei/patternDetector'
import type { InsightCard, EIScore } from '@/types/insight'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  initialInsights: InsightCard[]
  initialEIScore:  EIScore | null
  journalCount:    number
}

type Tab = 'insights' | 'ei' | 'patterns'

export function InsightsClient({ initialInsights, initialEIScore, journalCount }: Props) {
  const {
    insights, eiScore, isLoading, isGenerating, canGenerate,
    daysSinceLast, generateInsights, markSeen,
  } = useInsights()

  const [activeTab, setActiveTab]   = useState<Tab>('insights')
  const [genError, setGenError]     = useState<string | null>(null)
  const [genSuccess, setGenSuccess] = useState(false)

  // Use realtime data, fallback to server
  const displayInsights = insights.length > 0 ? insights : initialInsights
  const displayEI       = eiScore ?? initialEIScore
  const unseenCount     = displayInsights.filter((i) => !i.seen_at).length

  // Run pattern detection client-side (empty for now — needs raw data)
  // In production this would come from the /api/insights/generate response
  const patterns: ReturnType<typeof detectPatterns> = []

  const handleGenerate = async () => {
    setGenError(null)
    const result = await generateInsights()
    if (result.success) {
      setGenSuccess(true)
      setTimeout(() => setGenSuccess(false), 4000)
    } else {
      setGenError(result.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
              <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
              Insight Personal
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Pola emosi, skor EI, dan insight AI dari jurnalmu
            </p>
          </div>
          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating || journalCount < 3}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              canGenerate && !isGenerating && journalCount >= 3
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-60'
            )}
            aria-label="Generate insight baru"
          >
            {isGenerating
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            }
            {isGenerating ? 'Memproses...' : 'Generate'}
          </button>
        </div>

        {/* Status messages */}
        <AnimatePresence>
          {genSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-300">
              ✅ Insight baru berhasil dibuat!
            </motion.div>
          )}
          {genError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 rounded-xl bg-destructive/5 border border-destructive/20 px-3 py-2 text-xs text-destructive">
              ⚠️ {genError}
            </motion.div>
          )}
          {journalCount < 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
              Tulis minimal 3 jurnal untuk mendapatkan insight personal.{' '}
              <Link href="/journal/new" className="text-primary underline-offset-4 hover:underline">Tulis sekarang →</Link>
            </motion.div>
          )}
          {!canGenerate && journalCount >= 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-2 text-xs text-muted-foreground">
              Insight berikutnya tersedia dalam {Math.max(0, 1 - daysSinceLast)} hari
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1.5 rounded-xl bg-secondary/60 p-1" role="tablist">
        {([
          { key: 'insights', label: 'Insight', icon: Sparkles, badge: unseenCount as number | undefined },
          { key: 'ei',       label: 'Skor EI', icon: Brain,     badge: undefined as number | undefined },
          { key: 'patterns', label: 'Pola',    icon: TrendingUp,badge: undefined as number | undefined },
        ] as const).map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key as Tab)}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all',
              activeTab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
            {badge && badge > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── INSIGHTS TAB ──────────────────────────────────── */}
        {activeTab === 'insights' && (
          <motion.div key="insights"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {displayInsights.length > 0 ? (
              displayInsights.map((insight, i) => (
                <InsightCardWidget
                  key={insight.id}
                  insight={insight}
                  index={i}
                  onSeen={markSeen}
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-10 text-center">
                <div className="text-4xl" aria-hidden="true">✨</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Belum ada insight</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                    {journalCount >= 3
                      ? 'Klik "Generate" untuk mendapatkan insight personal dari Bloom AI.'
                      : 'Tulis minimal 3 jurnal terlebih dahulu untuk memulai.'}
                  </p>
                </div>
                {journalCount >= 3 ? (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate Insight
                  </button>
                ) : (
                  <Link href="/journal/new"
                    className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity"
                  >
                    Tulis jurnal
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── EI TAB ────────────────────────────────────────── */}
        {activeTab === 'ei' && (
          <motion.div key="ei"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <EIScoreRadar eiScore={displayEI} />

            {/* EI info */}
            <div className="rounded-2xl border border-border bg-background p-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">Apa itu Emotional Intelligence?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kecerdasan emosional (EI) adalah kemampuan untuk mengenali, memahami, mengelola, dan menggunakan emosi secara efektif — baik emosi diri sendiri maupun orang lain. MindBloom menghitung skor EI-mu dari pola jurnal harianmu dalam 7 dimensi.
              </p>
              <div className="mt-3 rounded-xl bg-secondary/50 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">
                  💡 Skor EI dihitung ulang setiap minggu berdasarkan jurnal 7 hari terakhir. Semakin detail jurnalmu, semakin akurat skornya.
                </p>
              </div>
            </div>

            {!displayEI && journalCount >= 3 && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Hitung skor EI-ku
              </button>
            )}
          </motion.div>
        )}

        {/* ── PATTERNS TAB ──────────────────────────────────── */}
        {activeTab === 'patterns' && (
          <motion.div key="patterns"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {patterns.length > 0 ? (
              patterns.map((p, i) => (
                <PatternCard key={p.type} pattern={p} index={i} />
              ))
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-10 text-center">
                <div className="text-4xl" aria-hidden="true">🔍</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Pola akan muncul seiring waktu</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                    MindBloom butuh minimal 7 jurnal untuk mendeteksi pola mood, stres, dan habitmu.
                  </p>
                </div>
                <div className="w-full rounded-xl bg-secondary/50 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground mb-1">Pola yang akan dideteksi:</p>
                  <p>📅 Hari mana moodmu paling rendah</p>
                  <p>😤 Sumber stres yang berulang</p>
                  <p>🙏 Konsistensi praktik syukur</p>
                  <p>⚡ Hubungan energi dan mood</p>
                  <p>🎯 Habit yang meningkatkan moodmu</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
