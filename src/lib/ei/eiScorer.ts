// ============================================================
// MindBloom — Emotional Intelligence Scorer
// File: src/lib/ei/eiScorer.ts
// Calculates 7-dim EI scores from journal entries heuristically
// ============================================================

import type { EIDimension, EIScore } from '@/types/insight'
import { EI_DIMENSIONS } from '@/types/insight'

interface JournalEntry {
  mood_score:        number | null
  energy_score:      number | null
  emotions:          string[]
  self_compassion:   string | null
  stress_source:     string | null
  stress_intensity:  number | null
  did_well:          string | null
  improve_on:        string | null
  do_differently:    string | null
  tomorrow_intention:string | null
  happy_moments:     string | null
  recurring_thoughts:string | null
  main_story:        string | null
  lessons_learned:   string | null
  prayer_hope:       string | null
  gratitude_items:   string[]
  completion_pct:    number
}

// ── Word count helper ─────────────────────────────────────────
function wc(text: string | null): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── Clamp to 1–10 ─────────────────────────────────────────────
function clamp(v: number, min = 1, max = 10): number {
  return Math.min(max, Math.max(min, Math.round(v * 10) / 10))
}

// ── Per-dimension scorers ─────────────────────────────────────

function scoreSelfAwareness(e: JournalEntry): number {
  let score = 5
  // More emotions identified = higher self-awareness
  score += Math.min(2, e.emotions.length * 0.4)
  // Self-compassion depth
  score += Math.min(1.5, wc(e.self_compassion) / 25)
  // Mood score present = user checked in
  if (e.mood_score !== null) score += 0.5
  // High completion = deep reflection
  score += (e.completion_pct / 100) * 1
  return clamp(score)
}

function scoreSelfRegulation(e: JournalEntry): number {
  let score = 5
  // Lower stress intensity = better regulation (inverse)
  if (e.stress_intensity !== null) {
    score += (10 - e.stress_intensity) * 0.2
  }
  // Wrote "do differently" = planning ahead
  if (wc(e.do_differently) > 5) score += 1
  // Wrote "improve on" = self-regulation goal
  if (wc(e.improve_on) > 5) score += 0.5
  // Has negative emotions but also positive = balancing
  const negativeEmotions = e.emotions.filter((em) =>
    ['cemas', 'stres', 'frustrasi', 'sedih', 'marah', 'kecewa', 'overthinking'].includes(em.toLowerCase())
  )
  const positiveEmotions = e.emotions.filter((em) =>
    ['senang', 'bersyukur', 'tenang', 'terinspirasi', 'semangat', 'bangga', 'damai'].includes(em.toLowerCase())
  )
  if (negativeEmotions.length > 0 && positiveEmotions.length > 0) score += 0.5
  return clamp(score)
}

function scoreMotivation(e: JournalEntry): number {
  let score = 5
  // High energy = high motivation
  if (e.energy_score !== null) score += (e.energy_score / 100) * 2
  // Has tomorrow intention = forward-looking
  if (wc(e.tomorrow_intention) > 3) score += 1
  // "Did well" = positive achievement recognition
  if (wc(e.did_well) > 5) score += 0.5
  // High mood = motivated state
  if (e.mood_score !== null) score += (e.mood_score - 5) * 0.1
  return clamp(score)
}

function scoreEmpathy(e: JournalEntry): number {
  let score = 5
  // Self-compassion = empathy for self (proxy for general empathy)
  score += Math.min(1.5, wc(e.self_compassion) / 30)
  // Happy moments that mention others
  const othersKeywords = ['teman', 'keluarga', 'dia', 'mereka', 'bersama', 'orang', 'siapa']
  const mentionsOthers = othersKeywords.some((kw) =>
    (e.happy_moments ?? '').toLowerCase().includes(kw) ||
    (e.main_story ?? '').toLowerCase().includes(kw)
  )
  if (mentionsOthers) score += 1.5
  // Gratitude items (caring about what you received = empathy awareness)
  score += Math.min(1, e.gratitude_items.length * 0.2)
  return clamp(score)
}

function scoreSocialSkills(e: JournalEntry): number {
  let score = 5
  // Happy moments mention social interaction
  const socialKeywords = ['ngobrol', 'ketemu', 'bersama', 'teman', 'keluarga', 'bantuan', 'cerita']
  const hasSocialContent = socialKeywords.some((kw) =>
    (e.happy_moments ?? '').toLowerCase().includes(kw) ||
    (e.main_story ?? '').toLowerCase().includes(kw)
  )
  if (hasSocialContent) score += 2
  // Stress from social issues = awareness (still scores)
  const socialStress = socialKeywords.some((kw) =>
    (e.stress_source ?? '').toLowerCase().includes(kw)
  )
  if (socialStress) score += 0.5
  return clamp(score)
}

function scoreResilience(e: JournalEntry): number {
  let score = 5
  // Stress present but still completed journal = resilient
  if ((e.stress_intensity ?? 0) > 5 && e.completion_pct > 60) score += 1.5
  // Lessons learned = resilience learning
  score += Math.min(1.5, wc(e.lessons_learned) / 20)
  // Low mood but still journaling = resilient behavior
  if ((e.mood_score ?? 5) <= 4 && e.completion_pct > 50) score += 1
  // "Do differently" = resilience planning
  if (wc(e.do_differently) > 5) score += 0.5
  return clamp(score)
}

function scoreMindfulness(e: JournalEntry): number {
  let score = 5
  // Prayer/hope = present/spiritual awareness
  score += Math.min(1.5, wc(e.prayer_hope) / 20)
  // Gratitude items = present-moment appreciation
  score += Math.min(1.5, e.gratitude_items.filter((g) => g.trim().length > 0).length * 0.4)
  // Self-compassion = mindful self-awareness
  score += Math.min(1, wc(e.self_compassion) / 40)
  // Low recurring thoughts = less rumination (mindful)
  if (wc(e.recurring_thoughts) < 10) score += 0.5
  return clamp(score)
}

// ── Main scorer ───────────────────────────────────────────────
export function scoreEIFromJournal(entry: JournalEntry): Record<EIDimension, number> {
  return {
    self_awareness:  scoreSelfAwareness(entry),
    self_regulation: scoreSelfRegulation(entry),
    motivation:      scoreMotivation(entry),
    empathy:         scoreEmpathy(entry),
    social_skills:   scoreSocialSkills(entry),
    resilience:      scoreResilience(entry),
    mindfulness:     scoreMindfulness(entry),
  }
}

// ── Average across multiple entries ──────────────────────────
export function averageEIScores(
  entries: Record<EIDimension, number>[]
): Record<EIDimension, number> {
  if (entries.length === 0) {
    return EI_DIMENSIONS.reduce(
      (acc, dim) => ({ ...acc, [dim]: 5 }),
      {} as Record<EIDimension, number>
    )
  }

  return EI_DIMENSIONS.reduce((acc, dim) => {
    const avg = entries.reduce((s, e) => s + (e[dim] ?? 5), 0) / entries.length
    return { ...acc, [dim]: clamp(avg) }
  }, {} as Record<EIDimension, number>)
}

// ── Overall EI score ──────────────────────────────────────────
export function calculateOverallEI(scores: Record<EIDimension, number>): number {
  const values = Object.values(scores)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round(avg * 10) / 10
}
