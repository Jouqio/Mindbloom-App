// ============================================================
// MindBloom — Pattern Detector
// File: src/lib/ei/patternDetector.ts
// Detects behavioral & emotional patterns from journal data
// ============================================================

import type { DetectedPattern } from '@/types/insight'

interface MoodDataPoint {
  entry_date:   string
  mood_score:   number
  energy_score: number | null
  stress_intensity: number | null
  stress_source:    string | null
  emotions:         string[]
}

interface HabitDataPoint {
  habit_name:  string
  completed:   boolean
  log_date:    string
  mood_score:  number | null
}

// ── Day-of-week mood analysis ─────────────────────────────────
function detectWeekdayMoodDip(data: MoodDataPoint[]): DetectedPattern | null {
  if (data.length < 7) return null

  const byDay: Record<number, number[]> = {}
  for (const d of data) {
    const dayOfWeek = new Date(d.entry_date + 'T00:00:00').getDay()
    if (!byDay[dayOfWeek]) byDay[dayOfWeek] = []
    byDay[dayOfWeek].push(d.mood_score)
  }

  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  const avgByDay = Object.entries(byDay).map(([day, scores]) => ({
    day: parseInt(day),
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    count: scores.length,
  }))

  if (avgByDay.length < 3) return null

  const sorted = [...avgByDay].sort((a, b) => a.avg - b.avg)
  const lowestDay = sorted[0]
  const overallAvg = data.reduce((s, d) => s + d.mood_score, 0) / data.length

  if (lowestDay.count < 2) return null
  const dropPct = ((overallAvg - lowestDay.avg) / overallAvg) * 100

  if (dropPct < 15) return null  // not significant enough

  return {
    type:        'mood_dip_weekday',
    title:       `Mood cenderung turun di hari ${dayNames[lowestDay.day]}`,
    description: `Rata-rata moodmu di hari ${dayNames[lowestDay.day]} (${lowestDay.avg.toFixed(1)}/10) lebih rendah ${dropPct.toFixed(0)}% dari rata-rata harianmu (${overallAvg.toFixed(1)}/10). Pertimbangkan persiapan khusus di hari ini.`,
    emoji:       '📅',
    confidence:  Math.min(0.95, lowestDay.count / 5),
    dataPoints:  lowestDay.count,
  }
}

// ── Recurring stress source ───────────────────────────────────
function detectStressTrigger(data: MoodDataPoint[]): DetectedPattern | null {
  const stressSources = data
    .filter((d) => d.stress_source && d.stress_source.trim().length > 5 && (d.stress_intensity ?? 0) >= 5)
    .map((d) => d.stress_source!.toLowerCase())

  if (stressSources.length < 2) return null

  // Find common keywords across stress sources
  const keywords: Record<string, number> = {}
  const stopWords = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'ada', 'tidak', 'aku', 'saya'])

  for (const source of stressSources) {
    const words = source.split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w))
    for (const word of words) {
      keywords[word] = (keywords[word] ?? 0) + 1
    }
  }

  const topKeyword = Object.entries(keywords)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])[0]

  if (!topKeyword) return null

  return {
    type:       'stress_trigger',
    title:      `Pola stres yang berulang ditemukan`,
    description:`Kata kunci "${topKeyword[0]}" muncul dalam ${topKeyword[1]} catatan stresmu. Ini bisa menjadi area yang perlu strategi khusus untuk dikelola lebih baik.`,
    emoji:      '😤',
    confidence: Math.min(0.9, topKeyword[1] / stressSources.length),
    dataPoints: stressSources.length,
  }
}

// ── Gratitude streak ──────────────────────────────────────────
function detectGratitudePattern(
  data: MoodDataPoint[],
  gratitudeCounts: { date: string; count: number }[]
): DetectedPattern | null {
  const consistentGratitude = gratitudeCounts.filter((g) => g.count >= 3)
  if (consistentGratitude.length < 5) return null

  const pct = Math.round((consistentGratitude.length / gratitudeCounts.length) * 100)
  if (pct < 60) return null

  return {
    type:       'gratitude_streak',
    title:      `Kebiasaan syukur yang konsisten`,
    description:`${pct}% dari jurnalmu memiliki setidaknya 3 hal yang disyukuri. Ini kebiasaan yang terbukti secara ilmiah meningkatkan kebahagiaan — kamu sudah melakukannya dengan baik!`,
    emoji:      '🙏',
    confidence: pct / 100,
    dataPoints: consistentGratitude.length,
  }
}

// ── Energy-mood correlation ───────────────────────────────────
function detectEnergyMoodLink(data: MoodDataPoint[]): DetectedPattern | null {
  const withEnergy = data.filter((d) => d.energy_score !== null && d.mood_score !== null)
  if (withEnergy.length < 7) return null

  // Pearson correlation coefficient
  const n = withEnergy.length
  const xMean = withEnergy.reduce((s, d) => s + d.mood_score, 0) / n
  const yMean = withEnergy.reduce((s, d) => s + d.energy_score!, 0) / n

  let num = 0, denomX = 0, denomY = 0
  for (const d of withEnergy) {
    const dx = d.mood_score - xMean
    const dy = d.energy_score! - yMean
    num    += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const r = Math.abs(denomX * denomY) < 1e-9 ? 0 : num / Math.sqrt(denomX * denomY)

  if (Math.abs(r) < 0.4) return null  // weak correlation

  const direction = r > 0 ? 'berbanding lurus' : 'berbanding terbalik'

  return {
    type:       'energy_mood_link',
    title:      `Energi dan mood-mu ${direction}`,
    description:`Ada korelasi ${(Math.abs(r) * 100).toFixed(0)}% antara level energimu dan mood harianmu. ${r > 0 ? 'Hari-hari dengan energi tinggi cenderung memiliki mood yang lebih baik.' : 'Pola yang menarik — mood-mu justru lebih stabil saat energi lebih rendah.'} Perhatikan pola tidur dan istirahatmu.`,
    emoji:      '⚡',
    confidence: Math.abs(r),
    dataPoints: n,
  }
}

// ── Habit-mood boost ──────────────────────────────────────────
function detectHabitMoodBoost(habitData: HabitDataPoint[]): DetectedPattern | null {
  const habitNames = [...new Set(habitData.map((h) => h.habit_name))]

  for (const habitName of habitNames) {
    const withHabit    = habitData.filter((h) => h.habit_name === habitName && h.completed && h.mood_score !== null)
    const withoutHabit = habitData.filter((h) => h.habit_name === habitName && !h.completed && h.mood_score !== null)

    if (withHabit.length < 3 || withoutHabit.length < 3) continue

    const avgWith    = withHabit.reduce((s, h) => s + h.mood_score!, 0) / withHabit.length
    const avgWithout = withoutHabit.reduce((s, h) => s + h.mood_score!, 0) / withoutHabit.length
    const diff       = avgWith - avgWithout

    if (diff >= 1.0) {
      return {
        type:       'habit_mood_boost',
        title:      `Habit "${habitName}" meningkatkan moodmu`,
        description:`Di hari kamu menyelesaikan "${habitName}", rata-rata moodmu ${avgWith.toFixed(1)}/10 — ${diff.toFixed(1)} poin lebih tinggi dibanding hari kamu melewatkannya (${avgWithout.toFixed(1)}/10). Habit ini benar-benar berpengaruh!`,
        emoji:      '🎯',
        confidence: Math.min(0.95, diff / 3),
        dataPoints: withHabit.length + withoutHabit.length,
      }
    }
  }

  return null
}

// ── Main pattern detection ────────────────────────────────────
export function detectPatterns(
  moodData: MoodDataPoint[],
  gratitudeCounts: { date: string; count: number }[],
  habitData: HabitDataPoint[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  const weekdayDip = detectWeekdayMoodDip(moodData)
  if (weekdayDip) patterns.push(weekdayDip)

  const stressTrigger = detectStressTrigger(moodData)
  if (stressTrigger) patterns.push(stressTrigger)

  const gratitude = detectGratitudePattern(moodData, gratitudeCounts)
  if (gratitude) patterns.push(gratitude)

  const energyMood = detectEnergyMoodLink(moodData)
  if (energyMood) patterns.push(energyMood)

  const habitBoost = detectHabitMoodBoost(habitData)
  if (habitBoost) patterns.push(habitBoost)

  // Sort by confidence descending
  return patterns.sort((a, b) => b.confidence - a.confidence)
}
