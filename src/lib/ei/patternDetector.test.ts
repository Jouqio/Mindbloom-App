import { describe, it, expect } from 'vitest'
import { detectPatterns } from './patternDetector'

function buildDailyMoods(days: number, moodFn: (dayIndex: number, dayOfWeek: number) => number) {
  const entries = []
  for (let i = 0; i < days; i++) {
    const date = new Date(2024, 0, 1 + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    entries.push({
      entry_date: `${year}-${month}-${day}`,
      mood_score: moodFn(i, date.getDay()),
      energy_score: null, stress_intensity: null, stress_source: null,
      emotions: [] as string[],
    })
  }
  return entries
}

describe('detectPatterns — weekday mood dip', () => {
  it('detects a significant, consistent mood dip on a specific weekday', () => {
    const moods = buildDailyMoods(28, (_, dow) => (dow === 1 ? 3 : 8))
    const patterns = detectPatterns(moods, [], [])
    const dip = patterns.find((p) => p.type === 'mood_dip_weekday')
    expect(dip).toBeDefined()
    expect(dip!.title).toContain('Senin')
  })

  it('does NOT flag a dip when mood is roughly uniform across all weekdays', () => {
    const moods = buildDailyMoods(28, () => 7)
    const patterns = detectPatterns(moods, [], [])
    expect(patterns.find((p) => p.type === 'mood_dip_weekday')).toBeUndefined()
  })

  it('requires enough data points before claiming a pattern', () => {
    const moods = buildDailyMoods(5, (_, dow) => (dow === 1 ? 2 : 9))
    const patterns = detectPatterns(moods, [], [])
    expect(patterns.find((p) => p.type === 'mood_dip_weekday')).toBeUndefined()
  })
})

describe('detectPatterns — stress trigger', () => {
  it('detects a recurring keyword across multiple high-stress entries', () => {
    const moods = [
      { entry_date: '2024-01-01', mood_score: 4, energy_score: null, stress_intensity: 8, stress_source: 'pekerjaan menumpuk dan deadline ketat', emotions: [] },
      { entry_date: '2024-01-02', mood_score: 4, energy_score: null, stress_intensity: 7, stress_source: 'pekerjaan yang tidak selesai-selesai', emotions: [] },
      { entry_date: '2024-01-03', mood_score: 5, energy_score: null, stress_intensity: 6, stress_source: 'pekerjaan kantor sangat berat', emotions: [] },
    ]
    const patterns = detectPatterns(moods, [], [])
    const trigger = patterns.find((p) => p.type === 'stress_trigger')
    expect(trigger).toBeDefined()
    expect(trigger!.description.toLowerCase()).toContain('pekerjaan')
  })

  it('does not flag anything when stress sources share no common keyword', () => {
    const moods = [
      { entry_date: '2024-01-01', mood_score: 4, energy_score: null, stress_intensity: 8, stress_source: 'macet parah tadi pagi', emotions: [] },
      { entry_date: '2024-01-02', mood_score: 4, energy_score: null, stress_intensity: 7, stress_source: 'lupa bawa dompet', emotions: [] },
    ]
    const patterns = detectPatterns(moods, [], [])
    expect(patterns.find((p) => p.type === 'stress_trigger')).toBeUndefined()
  })

  it('ignores low-intensity stress entries even if they share keywords', () => {
    const moods = [
      { entry_date: '2024-01-01', mood_score: 7, energy_score: null, stress_intensity: 2, stress_source: 'pekerjaan sedikit menumpuk', emotions: [] },
      { entry_date: '2024-01-02', mood_score: 7, energy_score: null, stress_intensity: 1, stress_source: 'pekerjaan agak banyak', emotions: [] },
    ]
    const patterns = detectPatterns(moods, [], [])
    expect(patterns.find((p) => p.type === 'stress_trigger')).toBeUndefined()
  })
})

describe('detectPatterns — gratitude streak', () => {
  it('detects consistent gratitude practice (>=60% of entries with 3+ items)', () => {
    const moods = buildDailyMoods(10, () => 7)
    const gratitude = Array.from({ length: 10 }, (_, i) => ({ date: `entry-${i}`, count: 3 }))
    const patterns = detectPatterns(moods, gratitude, [])
    expect(patterns.find((p) => p.type === 'gratitude_streak')).toBeDefined()
  })

  it('does not flag gratitude streak when practice is inconsistent', () => {
    const moods = buildDailyMoods(10, () => 7)
    const gratitude = [
      { date: 'entry-0', count: 3 }, { date: 'entry-1', count: 3 },
      { date: 'entry-2', count: 0 }, { date: 'entry-3', count: 0 },
      { date: 'entry-4', count: 0 }, { date: 'entry-5', count: 0 },
      { date: 'entry-6', count: 0 }, { date: 'entry-7', count: 0 },
    ]
    const patterns = detectPatterns(moods, gratitude, [])
    expect(patterns.find((p) => p.type === 'gratitude_streak')).toBeUndefined()
  })
})

describe('detectPatterns — energy/mood correlation', () => {
  it('detects a strong positive correlation between energy and mood', () => {
    const moods = Array.from({ length: 10 }, (_, i) => ({
      entry_date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      mood_score: i + 1, energy_score: (i + 1) * 10,
      stress_intensity: null, stress_source: null, emotions: [],
    }))
    const patterns = detectPatterns(moods, [], [])
    const link = patterns.find((p) => p.type === 'energy_mood_link')
    expect(link).toBeDefined()
    expect(link!.title.toLowerCase()).toContain('berbanding lurus')
  })

  it('does not flag a correlation from random/unrelated data', () => {
    const moods = Array.from({ length: 10 }, (_, i) => ({
      entry_date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      mood_score: [3, 8, 4, 9, 2, 7, 5, 6, 1, 10][i], energy_score: 50,
      stress_intensity: null, stress_source: null, emotions: [],
    }))
    const patterns = detectPatterns(moods, [], [])
    expect(patterns.find((p) => p.type === 'energy_mood_link')).toBeUndefined()
  })
})

describe('detectPatterns — habit mood boost', () => {
  it('detects a habit that correlates with meaningfully better mood', () => {
    const moodByDate: Record<string, number> = {}
    const habitLogs = []
    for (let i = 0; i < 6; i++) {
      const date = `2024-01-${String(i + 1).padStart(2, '0')}`
      const completed = i % 2 === 0
      moodByDate[date] = completed ? 9 : 4
      habitLogs.push({ habit_name: 'Olahraga pagi', completed, log_date: date, mood_score: moodByDate[date] })
    }
    const moods = Object.entries(moodByDate).map(([date, score]) => ({
      entry_date: date, mood_score: score, energy_score: null,
      stress_intensity: null, stress_source: null, emotions: [],
    }))
    const patterns = detectPatterns(moods, [], habitLogs)
    const boost = patterns.find((p) => p.type === 'habit_mood_boost')
    expect(boost).toBeDefined()
    expect(boost!.title).toContain('Olahraga pagi')
  })

  it('does not claim a boost when completing the habit makes no real difference', () => {
    const habitLogs = [
      { habit_name: 'Baca buku', completed: true,  log_date: '2024-01-01', mood_score: 6 },
      { habit_name: 'Baca buku', completed: false, log_date: '2024-01-02', mood_score: 6 },
      { habit_name: 'Baca buku', completed: true,  log_date: '2024-01-03', mood_score: 6 },
      { habit_name: 'Baca buku', completed: false, log_date: '2024-01-04', mood_score: 6 },
    ]
    const patterns = detectPatterns([], [], habitLogs)
    expect(patterns.find((p) => p.type === 'habit_mood_boost')).toBeUndefined()
  })

  it('requires at least 3 data points per side before claiming a boost', () => {
    const habitLogs = [
      { habit_name: 'Meditasi', completed: true,  log_date: '2024-01-01', mood_score: 9 },
      { habit_name: 'Meditasi', completed: true,  log_date: '2024-01-02', mood_score: 9 },
      { habit_name: 'Meditasi', completed: false, log_date: '2024-01-03', mood_score: 3 },
      { habit_name: 'Meditasi', completed: false, log_date: '2024-01-04', mood_score: 3 },
    ]
    const patterns = detectPatterns([], [], habitLogs)
    expect(patterns.find((p) => p.type === 'habit_mood_boost')).toBeUndefined()
  })
})

describe('detectPatterns — sorting', () => {
  it('sorts all detected patterns by confidence, highest first', () => {
    const moods = buildDailyMoods(28, (_, dow) => (dow === 1 ? 2 : 9))
    const gratitude = Array.from({ length: 28 }, (_, i) => ({ date: `e${i}`, count: 3 }))
    const patterns = detectPatterns(moods, gratitude, [])
    expect(patterns.length).toBeGreaterThan(1)
    for (let i = 1; i < patterns.length; i++) {
      expect(patterns[i - 1].confidence).toBeGreaterThanOrEqual(patterns[i].confidence)
    }
  })
})
