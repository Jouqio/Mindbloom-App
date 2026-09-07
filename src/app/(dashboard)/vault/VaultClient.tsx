// ============================================================
// MindBloom — Vault Client (Full Page)
// File: src/app/(dashboard)/vault/VaultClient.tsx
// ============================================================

'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookHeart, Lock } from 'lucide-react'
import { MonthCard } from '@/components/vault/MonthlyBook'
import type { MonthGridItem, MonthlyNarrative } from '@/types/vault'
import { MONTH_NAMES_ID } from '@/types/vault'

interface Props {
  initialNarratives: MonthlyNarrative[]
  journalEntries:    Array<{ entry_date: string; mood_score: number | null }>
}

export function VaultClient({ initialNarratives, journalEntries }: Props) {
  const [narratives, setNarratives]  = useState<MonthlyNarrative[]>(initialNarratives)
  const [generatingKey, setGenKey]   = useState<string | null>(null)
  const [exportingKey,  setExportKey]= useState<string | null>(null)

  // ── Build month grid from journal history ─────────────────
  const monthGroups: Record<string, { count: number; moods: number[] }> = {}
  for (const e of journalEntries) {
    const d = new Date(e.entry_date + 'T00:00:00')
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!monthGroups[key]) monthGroups[key] = { count: 0, moods: [] }
    monthGroups[key].count++
    if (e.mood_score) monthGroups[key].moods.push(e.mood_score)
  }

  // Include last 12 months (even if empty)
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!monthGroups[key]) monthGroups[key] = { count: 0, moods: [] }
  }

  const narrativeMap = new Map(narratives.map((n) => [`${n.year}-${n.month}`, n]))

  const monthItems: MonthGridItem[] = Object.entries(monthGroups)
    .sort(([a], [b]) => {
      const [ay, am] = a.split('-').map(Number)
      const [by, bm] = b.split('-').map(Number)
      return by !== ay ? by - ay : bm - am
    })
    .map(([key, { count, moods }]) => {
      const [year, month] = key.split('-').map(Number)
      const narrative     = narrativeMap.get(key) ?? null
      const avgMood       = moods.length > 0
        ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10
        : null

      return {
        year, month,
        label:         `${MONTH_NAMES_ID[month - 1]} ${year}`,
        entryCount:    count,
        avgMood,
        hasNarrative:  !!narrative,
        narrative:     narrative ?? undefined,
      }
    })

  // ── Generate narrative ─────────────────────────────────────
  const handleGenerate = useCallback(async (year: number, month: number) => {
    const key = `${year}-${month}`
    setGenKey(key)
    try {
      const res = await fetch('/api/vault/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })
      if (!res.ok) throw new Error('Generation failed')

      // Refetch narratives
      const listRes  = await fetch('/api/vault/generate')
      const { data } = await listRes.json()
      setNarratives(data ?? [])
    } catch (err) {
      console.error('[handleGenerate]', err)
    } finally {
      setGenKey(null)
    }
  }, [])

  // ── Export PDF ──────────────────────────────────────────────
  const handleExport = useCallback(async (year: number, month: number) => {
    const key = `${year}-${month}`
    setExportKey(key)
    try {
      const res = await fetch('/api/vault/pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month,
          type: 'month',
          include: {
            narrative:   true,
            mood:        true,
            emotions:    true,
            gratitude:   true,
            reflections: true,
            prayer:      false,
          },
        }),
      })

      if (!res.ok) throw new Error('PDF generation failed')

      const html  = await res.text()
      const blob  = new Blob([html], { type: 'text/html' })
      const url   = URL.createObjectURL(blob)
      const win   = window.open(url, '_blank')

      // Auto-trigger print dialog after a short delay
      if (win) {
        win.addEventListener('load', () => {
          setTimeout(() => {
            win.print()
            URL.revokeObjectURL(url)
          }, 800)
        })
      }
    } catch (err) {
      console.error('[handleExport]', err)
    } finally {
      setExportKey(null)
    }
  }, [])

  const totalNarratives = narratives.length
  const totalMonths     = monthItems.filter((m) => m.entryCount > 0).length

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
          <BookHeart className="h-5 w-5 text-primary" aria-hidden="true" />
          Memory Vault
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {totalNarratives} narasi dibuat · {totalMonths} bulan perjalanan
        </p>
      </motion.div>

      {/* Privacy notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-5 flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5"
      >
        <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Semua narasi dibuat khusus untukmu dan hanya bisa dilihat olehmu.
        </p>
      </motion.div>

      {/* Month grid */}
      {monthItems.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-12 text-center">
          <div className="text-5xl" aria-hidden="true">📭</div>
          <div>
            <p className="text-sm font-medium text-foreground">Vault masih kosong</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
              Mulai menulis jurnal untuk membangun memory vault-mu yang pertama.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {monthItems.map((item) => (
            <MonthCard
              key={`${item.year}-${item.month}`}
              item={item}
              onGenerate={handleGenerate}
              onExport={handleExport}
              isGenerating={generatingKey === `${item.year}-${item.month}`}
              isExporting={exportingKey === `${item.year}-${item.month}`}
            />
          ))}
        </div>
      )}
    </main>
  )
}
