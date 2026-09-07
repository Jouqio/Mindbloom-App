import { describe, it, expect } from 'vitest'
import { scoreEIFromJournal, averageEIScores, calculateOverallEI } from './eiScorer'
import { EI_DIMENSIONS } from '@/types/insight'

function makeEntry(overrides: Partial<Parameters<typeof scoreEIFromJournal>[0]> = {}) {
  return {
    mood_score: null, energy_score: null, emotions: [] as string[],
    self_compassion: null, stress_source: null, stress_intensity: null,
    did_well: null, improve_on: null, do_differently: null,
    tomorrow_intention: null, happy_moments: null, recurring_thoughts: null,
    main_story: null, lessons_learned: null, prayer_hope: null,
    gratitude_items: [] as string[], completion_pct: 0,
    ...overrides,
  }
}

describe('scoreEIFromJournal', () => {
  it('returns a score for every one of the 7 EI dimensions', () => {
    const scores = scoreEIFromJournal(makeEntry())
    for (const dim of EI_DIMENSIONS) {
      expect(scores).toHaveProperty(dim)
      expect(typeof scores[dim]).toBe('number')
    }
  })

  it('never returns a score outside the 1–10 range, even for an empty entry', () => {
    const scores = scoreEIFromJournal(makeEntry())
    for (const dim of EI_DIMENSIONS) {
      expect(scores[dim]).toBeGreaterThanOrEqual(1)
      expect(scores[dim]).toBeLessThanOrEqual(10)
    }
  })

  it('never returns a score above 10 even when every signal is maxed out', () => {
    const scores = scoreEIFromJournal(makeEntry({
      mood_score: 10, energy_score: 100,
      emotions: ['senang', 'bersyukur', 'tenang', 'terinspirasi', 'semangat', 'bangga', 'damai', 'cinta'],
      self_compassion: 'a'.repeat(500), stress_intensity: 10, stress_source: 'a'.repeat(200),
      did_well: 'a'.repeat(200), improve_on: 'a'.repeat(200), do_differently: 'a'.repeat(200),
      tomorrow_intention: 'a'.repeat(200),
      happy_moments: 'aku bersama teman dan keluarga hari ini, sangat menyenangkan',
      main_story: 'aku bersama teman dan keluarga hari ini',
      lessons_learned: 'a'.repeat(200), prayer_hope: 'a'.repeat(200),
      gratitude_items: ['satu', 'dua', 'tiga', 'empat', 'lima'], completion_pct: 100,
    }))
    for (const dim of EI_DIMENSIONS) {
      expect(scores[dim]).toBeLessThanOrEqual(10)
    }
  })

  it('scores self_awareness higher when more emotions are identified', () => {
    const few  = scoreEIFromJournal(makeEntry({ emotions: ['senang'] }))
    const many = scoreEIFromJournal(makeEntry({ emotions: ['senang', 'cemas', 'lelah', 'bersyukur'] }))
    expect(many.self_awareness).toBeGreaterThan(few.self_awareness)
  })

  it('scores self_regulation lower when stress intensity is high', () => {
    const calm  = scoreEIFromJournal(makeEntry({ stress_intensity: 1 }))
    const tense = scoreEIFromJournal(makeEntry({ stress_intensity: 10 }))
    expect(calm.self_regulation).toBeGreaterThan(tense.self_regulation)
  })

  it('scores motivation higher with higher energy', () => {
    const low  = scoreEIFromJournal(makeEntry({ energy_score: 10 }))
    const high = scoreEIFromJournal(makeEntry({ energy_score: 90 }))
    expect(high.motivation).toBeGreaterThan(low.motivation)
  })

  it('scores mindfulness higher with more gratitude items', () => {
    const none = scoreEIFromJournal(makeEntry({ gratitude_items: [] }))
    const some = scoreEIFromJournal(makeEntry({ gratitude_items: ['a', 'b', 'c'] }))
    expect(some.mindfulness).toBeGreaterThan(none.mindfulness)
  })

  it('scores resilience higher when stressed but still completed the journal', () => {
    const gaveUp   = scoreEIFromJournal(makeEntry({ stress_intensity: 8, completion_pct: 20 }))
    const pushedOn = scoreEIFromJournal(makeEntry({ stress_intensity: 8, completion_pct: 90 }))
    expect(pushedOn.resilience).toBeGreaterThan(gaveUp.resilience)
  })
})

describe('averageEIScores', () => {
  it('returns a neutral (5) baseline for every dimension when given no entries', () => {
    const avg = averageEIScores([])
    for (const dim of EI_DIMENSIONS) {
      expect(avg[dim]).toBe(5)
    }
  })

  it('averages correctly across multiple entries', () => {
    const a = { self_awareness: 4, self_regulation: 4, motivation: 4, empathy: 4, social_skills: 4, resilience: 4, mindfulness: 4 }
    const b = { self_awareness: 8, self_regulation: 8, motivation: 8, empathy: 8, social_skills: 8, resilience: 8, mindfulness: 8 }
    const avg = averageEIScores([a, b])
    expect(avg.self_awareness).toBe(6)
  })

  it('never returns a value below 1 or above 10 regardless of input', () => {
    const avg = averageEIScores([
      { self_awareness: 1, self_regulation: 1, motivation: 1, empathy: 1, social_skills: 1, resilience: 1, mindfulness: 1 },
    ])
    for (const dim of EI_DIMENSIONS) {
      expect(avg[dim]).toBeGreaterThanOrEqual(1)
      expect(avg[dim]).toBeLessThanOrEqual(10)
    }
  })
})

describe('calculateOverallEI', () => {
  it('returns the plain average of all 7 dimensions', () => {
    const scores = {
      self_awareness: 10, self_regulation: 10, motivation: 10, empathy: 10,
      social_skills: 10, resilience: 10, mindfulness: 10,
    }
    expect(calculateOverallEI(scores)).toBe(10)
  })

  it('rounds to 1 decimal place', () => {
    const scores = {
      self_awareness: 5, self_regulation: 5, motivation: 5, empathy: 5,
      social_skills: 5, resilience: 6, mindfulness: 5,
    }
    expect(calculateOverallEI(scores)).toBe(5.1)
  })
})
