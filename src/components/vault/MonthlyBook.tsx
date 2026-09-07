// ============================================================
// MindBloom — Monthly Book Card Component
// File: src/components/vault/MonthlyBook.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, ChevronDown, Loader2 } from 'lucide-react'
import type { MonthlyNarrative, MonthGridItem } from '@/types/vault'
import { MONTH_NAMES_ID } from '@/types/vault'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// 1. MONTH GRID CARD (compact)
// ────────────────────────────────────────────────────────────
interface MonthCardProps {
  item:        MonthGridItem
  onGenerate:  (year: number, month: number) => Promise<void>
  onExport:    (year: number, month: number) => Promise<void>
  isGenerating:boolean
  isExporting: boolean
}

export function MonthCard({ item, onGenerate, onExport, isGenerating, isExporting }: MonthCardProps) {
  const [expanded, setExpanded] = useState(false)
  const narrative = item.narrative

  const getMoodColor = (avg: number | null) => {
    if (!avg) return '#888780'
    if (avg >= 8) return '#1D9E75'
    if (avg >= 6) return '#EF9F27'
    if (avg >= 4) return '#D85A30'
    return '#E24B4A'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-background overflow-hidden"
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/40 transition-colors focus-visible:outline-none"
        aria-expanded={expanded}
      >
        {/* Cover emoji */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl" aria-hidden="true">
          {item.narrative?.cover_emoji ?? (item.entryCount > 0 ? '📖' : '📭')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{item.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{item.entryCount} jurnal</span>
            {item.avgMood && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs font-medium" style={{ color: getMoodColor(item.avgMood) }}>
                  mood {item.avgMood.toFixed(1)}
                </span>
              </>
            )}
            {narrative?.mood_summary && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs text-muted-foreground truncate">{narrative.mood_summary}</span>
              </>
            )}
          </div>
        </div>

        {/* Status + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.hasNarrative ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              ✨ AI
            </span>
          ) : item.entryCount > 0 ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              Belum di-generate
            </span>
          ) : null}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pt-4 pb-4">
              {narrative ? (
                <>
                  {/* Narrative text */}
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line mb-3">
                    {narrative.narrative.slice(0, 400)}{narrative.narrative.length > 400 ? '...' : ''}
                  </p>

                  {/* Highlights */}
                  {narrative.highlights.length > 0 && (
                    <div className="mb-4">
                      {narrative.highlights.slice(0, 3).map((h, i) => (
                        <div key={i} className="flex items-start gap-2 mb-1.5">
                          <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <p className="text-[11px] text-muted-foreground">{h}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : item.entryCount > 0 ? (
                <p className="mb-4 text-xs text-muted-foreground">
                  Generate narasi AI untuk bulan ini — ringkasan puitis dari {item.entryCount} jurnalmu.
                </p>
              ) : (
                <p className="mb-4 text-xs text-muted-foreground">Tidak ada jurnal di bulan ini.</p>
              )}

              {/* Action buttons */}
              {item.entryCount > 0 && (
                <div className="flex gap-2">
                  {!item.hasNarrative && (
                    <button
                      onClick={() => onGenerate(item.year, item.month)}
                      disabled={isGenerating}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      }
                      {isGenerating ? 'Generating...' : 'Generate Narasi AI'}
                    </button>
                  )}
                  <button
                    onClick={() => onExport(item.year, item.month)}
                    disabled={isExporting}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition-colors',
                      !item.hasNarrative && 'flex-none',
                      item.hasNarrative && 'flex-1'
                    )}
                  >
                    {isExporting
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      : <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    }
                    {isExporting ? 'Menyiapkan...' : 'Export PDF'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
