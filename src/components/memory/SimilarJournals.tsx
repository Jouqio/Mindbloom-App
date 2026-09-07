// ============================================================
// MindBloom — Similar Journals Component
// File: src/components/memory/SimilarJournals.tsx
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import type { SimilarJournal } from '@/types/memory'
import { MOOD_CONFIG } from '@/types/dashboard'
import type { MoodCategory } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface SimilarJournalsProps {
  entryId:   string
  queryText: string
  className?:string
}

export function SimilarJournals({ entryId, queryText, className }: SimilarJournalsProps) {
  const [results, setResults]   = useState<SimilarJournal[]>([])
  const [isLoading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!queryText.trim() || queryText.length < 20) return

    setLoading(true)
    fetch('/api/memory/search', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query:            queryText.slice(0, 400),
        limit:            4,
        min_similarity:   0.60,
        exclude_entry_id: entryId,
      }),
    })
      .then((r) => r.json())
      .then(({ data }) => {
        setResults(data?.results ?? [])
      })
      .catch((err) => console.error('[SimilarJournals]', err))
      .finally(() => setLoading(false))
  }, [entryId, queryText])

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Mencari jurnal serupa...
      </div>
    )
  }

  if (results.length === 0) return null

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">
            {results.length} jurnal dengan perasaan serupa
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          aria-hidden="true"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-2.5">
              {results.map((r, i) => {
                const mood   = r.mood_category as MoodCategory | null
                const moodCfg = mood ? MOOD_CONFIG[mood] : null
                const simPct  = Math.round(r.similarity * 100)

                return (
                  <motion.div
                    key={r.entry_id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/journal/${r.entry_id}`}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {/* Mood emoji */}
                      <span className="mt-0.5 flex-shrink-0 text-lg" aria-hidden="true">
                        {moodCfg?.emoji ?? '📝'}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">
                            {formatDate(r.entry_date)}
                          </span>
                          <span className="flex-shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {simPct}% mirip
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {r.snippet || 'Tidak ada cerita yang dicatat.'}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
