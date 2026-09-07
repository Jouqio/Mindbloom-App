// ============================================================
// MindBloom — Semantic Search Component
// File: src/components/memory/SemanticSearch.tsx
// ============================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, Loader2, X, Clock } from 'lucide-react'
import type { SimilarJournal } from '@/types/memory'
import { MOOD_CONFIG } from '@/types/dashboard'
import type { MoodCategory } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const SEARCH_SUGGESTIONS = [
  'hari ketika aku merasa sangat cemas',
  'momen paling bahagia yang pernah aku rasakan',
  'ketika aku merasa lelah dan kewalahan',
  'hari yang penuh rasa syukur',
  'saat aku menghadapi konflik',
  'ketika aku merasa terinspirasi',
  'momen ketenangan dan kedamaian',
]

export function SemanticSearch() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<SimilarJournal[]>([])
  const [isLoading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 5) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/memory/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 8, min_similarity: 0.50 }),
      })

      if (!res.ok) {
        const { error: errMsg } = await res.json()
        throw new Error(errMsg ?? 'Search failed')
      }

      const { data } = await res.json()
      setResults(data?.results ?? [])
      setSearched(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 600)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setSearched(false)
    setError(null)
  }

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Cari berdasarkan perasaan, situasi, atau kata kunci..."
          aria-label="Cari jurnal secara semantik"
          className={cn(
            'w-full rounded-2xl border border-border bg-background',
            'py-3 pl-11 pr-10 text-sm text-foreground',
            'placeholder:text-muted-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-secondary transition-colors"
            aria-label="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Mencari jurnal yang relevan...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/5 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          ⚠️ {error}
        </div>
      )}

      {/* Suggestions (when empty) */}
      {!query && !searched && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Coba cari:</p>
          <div className="flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); doSearch(s) }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {searched && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0 }}
            className="flex flex-col gap-2.5"
          >
            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-8 text-center">
                <div className="text-3xl" aria-hidden="true">🔍</div>
                <div>
                  <p className="text-sm font-medium text-foreground">Tidak ada jurnal yang cocok</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Coba kata kunci yang berbeda atau lebih spesifik
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {results.length} jurnal ditemukan untuk "{query}"
                </p>
                {results.map((r, i) => {
                  const mood    = r.mood_category as MoodCategory | null
                  const moodCfg = mood ? MOOD_CONFIG[mood] : null
                  const simPct  = Math.round(r.similarity * 100)

                  return (
                    <motion.div
                      key={r.entry_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={`/journal/${r.entry_id}`}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 hover:border-primary/30 hover:bg-primary/[0.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div
                          className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                          style={moodCfg ? { background: moodCfg.bg } : undefined}
                          aria-hidden="true"
                        >
                          {moodCfg?.emoji ?? '📝'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                              <span className="text-xs font-medium text-foreground">
                                {formatDate(r.entry_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {moodCfg && (
                                <span
                                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                  style={{ background: moodCfg.bg, color: moodCfg.color }}
                                >
                                  {moodCfg.label}
                                </span>
                              )}
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {simPct}%
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {r.snippet || 'Tidak ada cerita yang dicatat.'}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
