// ============================================================
// MindBloom — Search Client Component
// File: src/app/(dashboard)/search/SearchClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Database, Loader2, CheckCircle2 } from 'lucide-react'
import { SemanticSearch } from '@/components/memory/SemanticSearch'

interface Props {
  totalEntries:    number
  embeddedEntries: number
}

export function SearchClient({ totalEntries, embeddedEntries }: Props) {
  const [isIndexing, setIsIndexing]   = useState(false)
  const [indexDone,  setIndexDone]    = useState(false)
  const [localEmbedded, setLocalEmb] = useState(embeddedEntries)

  const pending  = Math.max(0, totalEntries - localEmbedded)
  const pct      = totalEntries > 0 ? Math.round((localEmbedded / totalEntries) * 100) : 0
  const isReady  = pending === 0 && totalEntries > 0

  const handleIndex = async () => {
    setIsIndexing(true)
    setIndexDone(false)
    try {
      const res = await fetch('/api/memory/embed', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embed_all: true }),
      })
      const { data } = await res.json()
      setLocalEmb((prev) => prev + (data?.embedded ?? 0))
      setIndexDone(true)
    } catch (err) {
      console.error('[handleIndex]', err)
    } finally {
      setIsIndexing(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
          <Search className="h-5 w-5 text-primary" aria-hidden="true" />
          Cari Jurnal
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Cari jurnal masa lalumu berdasarkan perasaan, situasi, atau kata kunci
        </p>
      </motion.div>

      {/* Index status */}
      {totalEntries > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 rounded-2xl border border-border bg-background p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Indeks Jurnal</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isReady && !isIndexing && (
                <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              )}
              <span className={`text-xs font-medium ${isReady ? 'text-green-600' : 'text-muted-foreground'}`}>
                {localEmbedded}/{totalEntries} jurnal terindeks
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-primary"
            />
          </div>

          {pending > 0 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {pending} jurnal belum terindeks. Indeks sekarang untuk mengaktifkan pencarian semantik.
              </p>
              <button
                onClick={handleIndex}
                disabled={isIndexing}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isIndexing
                  ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  : <Database className="h-3 w-3" aria-hidden="true" />
                }
                {isIndexing ? 'Mengindeks...' : 'Indeks sekarang'}
              </button>
            </div>
          )}

          {indexDone && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-green-600"
            >
              ✅ Berhasil mengindeks jurnal terbaru!
            </motion.p>
          )}

          {isReady && !indexDone && (
            <p className="text-xs text-muted-foreground">
              ✅ Semua jurnal sudah terindeks. Pencarian semantik siap digunakan.
            </p>
          )}
        </motion.div>
      )}

      {/* Search interface */}
      {totalEntries === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-10 text-center">
          <div className="text-4xl" aria-hidden="true">📝</div>
          <div>
            <p className="text-sm font-medium text-foreground">Belum ada jurnal</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Tulis beberapa jurnal terlebih dahulu untuk menggunakan pencarian semantik.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {localEmbedded === 0 ? (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4 text-center">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Indeks jurnal dulu untuk mulai mencari
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Klik tombol "Indeks sekarang" di atas untuk mengaktifkan pencarian semantik
              </p>
            </div>
          ) : (
            <SemanticSearch />
          )}
        </motion.div>
      )}
    </main>
  )
}
