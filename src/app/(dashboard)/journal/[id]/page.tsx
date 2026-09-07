// ============================================================
// MindBloom — Journal Detail Page
// File: src/app/(dashboard)/journal/[id]/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PenLine, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MOOD_CONFIG } from '@/types/dashboard'
import type { MoodCategory } from '@/types/dashboard'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Detail Jurnal',
    description: 'Baca ulang refleksi harianmu.',
  }
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .select(`
      *,
      journal_emotions(emotion, category, valence),
      gratitude_items(text, sort_order)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single()

  if (error || !entry) notFound()

  const mood    = entry.mood_category as MoodCategory | null
  const moodCfg = mood ? MOOD_CONFIG[mood] : null

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

  const gratitudeItems = (entry.gratitude_items as unknown as { text: string; sort_order: number }[])
    ?.sort((a, b) => a.sort_order - b.sort_order) ?? []

  const emotions = (entry.journal_emotions as unknown as { emotion: string }[]) ?? []

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/journal"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Kembali ke daftar jurnal"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-base font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {formatDate(entry.entry_date)}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entry.word_count ?? 0} kata · {entry.completion_pct ?? 0}% selesai
            </p>
          </div>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {/* Mood + Energy row */}
        {(entry.mood_score || entry.energy_score) && (
          <div className="grid grid-cols-2 gap-3">
            {entry.mood_score && moodCfg && (
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">{moodCfg.emoji}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: moodCfg.color }}>{moodCfg.label}</p>
                    <p className="text-xs text-muted-foreground">{entry.mood_score}/10</p>
                  </div>
                </div>
              </div>
            )}
            {entry.energy_score !== null && (
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Energi</p>
                <div>
                  <p className="text-xl font-medium text-foreground">{entry.energy_score}%</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary/70"
                      style={{ width: `${entry.energy_score}%` }} aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emotions */}
        {emotions.length > 0 && (
          <Section title="Emosi yang dirasakan" emoji="🎭">
            <div className="flex flex-wrap gap-2">
              {emotions.map((e) => (
                <span key={e.emotion}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                  {e.emotion}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Main story */}
        {entry.main_story && (
          <Section title="Cerita hari ini" emoji="📖">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{entry.main_story}</p>
          </Section>
        )}

        {/* Recurring thoughts */}
        {entry.recurring_thoughts && (
          <Section title="Pikiran yang bermain" emoji="💭">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{entry.recurring_thoughts}</p>
          </Section>
        )}

        {/* Stress */}
        {entry.stress_source && (
          <Section title="Sumber stres" emoji="😤">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{entry.stress_source}</p>
            {entry.stress_intensity !== null && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Intensitas:</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                  {entry.stress_intensity}/10
                </span>
              </div>
            )}
          </Section>
        )}

        {/* Happy moments */}
        {entry.happy_moments && (
          <Section title="Momen bahagia" emoji="😊">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{entry.happy_moments}</p>
          </Section>
        )}

        {/* Gratitude */}
        {gratitudeItems.length > 0 && (
          <Section title="Jurnal syukur" emoji="🙏">
            <ul className="flex flex-col gap-2">
              {gratitudeItems.map((g, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{g.text}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Lessons */}
        {entry.lessons_learned && (
          <Section title="Pelajaran hari ini" emoji="💡">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{entry.lessons_learned}</p>
          </Section>
        )}

        {/* Reflection */}
        {(entry.did_well || entry.improve_on || entry.do_differently) && (
          <Section title="Refleksi diri" emoji="🪞">
            {entry.did_well && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-green-600">✅ Yang sudah baik</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.did_well}</p>
              </div>
            )}
            {entry.improve_on && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-amber-600">📈 Yang bisa ditingkatkan</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.improve_on}</p>
              </div>
            )}
            {entry.do_differently && (
              <div>
                <p className="mb-1 text-xs font-medium text-blue-600">🔄 Yang akan dilakukan berbeda</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.do_differently}</p>
              </div>
            )}
          </Section>
        )}

        {/* Self compassion */}
        {entry.self_compassion && (
          <Section title="Belas kasih diri" emoji="💛">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap italic">
              &ldquo;{entry.self_compassion}&rdquo;
            </p>
          </Section>
        )}

        {/* Intention */}
        {entry.tomorrow_intention && (
          <Section title="Niat besok" emoji="🌅">
            <p className="text-sm leading-relaxed text-foreground">{entry.tomorrow_intention}</p>
          </Section>
        )}

        {/* Prayer */}
        {entry.prayer_hope && (
          <Section title="Doa & harapan" emoji="🌙">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{entry.prayer_hope}</p>
          </Section>
        )}
      </div>
    </main>
  )
}

function Section({
  title, emoji, children,
}: {
  title:    string
  emoji:    string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <span aria-hidden="true">{emoji}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}
