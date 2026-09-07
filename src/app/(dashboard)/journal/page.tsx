// ============================================================
// MindBloom — Journal List Page
// File: src/app/(dashboard)/journal/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PenLine, BookOpen, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MOOD_CONFIG } from '@/types/dashboard'
import type { MoodCategory } from '@/types/dashboard'

export const metadata: Metadata = {
  title: 'Jurnal',
  description: 'Semua catatan refleksi harianmu di MindBloom.',
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: entries } = await supabase
    .from('journal_entries')
    .select(`
      id, entry_date, mood_score, mood_category,
      word_count, completion_pct, main_story, is_draft
    `)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('entry_date', { ascending: false })
    .limit(30)

  const hasJournalToday = entries?.some(
    (e) => e.entry_date === today && !e.is_draft
  )

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  const getSnippet = (text: string | null, maxLen = 100) => {
    if (!text) return 'Tidak ada cerita yang ditulis.'
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-foreground">Jurnal Harian</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {entries?.length ?? 0} jurnal tersimpan
          </p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PenLine className="h-4 w-4" aria-hidden="true" />
          {hasJournalToday ? 'Edit hari ini' : 'Tulis hari ini'}
        </Link>
      </div>

      {/* Today banner if not yet written */}
      {!hasJournalToday && (
        <Link href="/journal/new" className="mb-5 block">
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 py-4 hover:bg-primary/[0.06] transition-colors">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <PenLine className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Belum ada jurnal hari ini</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
          </div>
        </Link>
      )}

      {/* Entries list */}
      {entries && entries.length > 0 ? (
        <div className="flex flex-col gap-3" role="list" aria-label="Daftar jurnal">
          {entries.map((entry) => {
            const mood    = entry.mood_category as MoodCategory | null
            const moodCfg = mood ? MOOD_CONFIG[mood] : null
            const isToday = entry.entry_date === today

            return (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                role="listitem"
                className="block rounded-2xl border border-border bg-background p-4 transition-all hover:border-border/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Date + badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {isToday ? '📅 Hari ini' : formatDate(entry.entry_date)}
                      </span>
                      {entry.is_draft && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                      {moodCfg && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: moodCfg.bg, color: moodCfg.color }}
                        >
                          {moodCfg.emoji} {moodCfg.label}
                        </span>
                      )}
                    </div>

                    {/* Snippet */}
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                      {getSnippet(entry.main_story)}
                    </p>
                  </div>

                  {/* Mood score */}
                  {entry.mood_score && (
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <span className="text-lg leading-none">
                        {moodCfg?.emoji ?? '😐'}
                      </span>
                      <span className="text-xs font-medium mt-0.5"
                        style={{ color: moodCfg?.color ?? 'inherit' }}>
                        {entry.mood_score}/10
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: word count + completion */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${entry.completion_pct ?? 0}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {entry.completion_pct ?? 0}% · {entry.word_count ?? 0} kata
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Belum ada jurnal</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
              Mulai perjalanan refleksimu dengan menulis jurnal pertama hari ini.
              Hanya butuh 5–10 menit.
            </p>
          </div>
          <Link
            href="/journal/new"
            className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            Tulis jurnal pertama
          </Link>
        </div>
      )}
    </main>
  )
}
