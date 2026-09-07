// ============================================================
// MindBloom — Analytics Types
// File: src/types/analytics.ts
// ============================================================

// ── Mood trend (time series) ──────────────────────────────────
export interface MoodDataPoint {
  date:     string      // ISO date
  label:    string      // formatted label e.g. "12 Jun"
  mood:     number | null
  energy:   number | null
  stress:   number | null
}

// ── Emotion frequency ─────────────────────────────────────────
export interface EmotionFrequency {
  emotion:   string
  count:     number
  category:  'positive' | 'neutral' | 'negative'
  color:     string
}

// ── Habit performance ─────────────────────────────────────────
export interface HabitPerformance {
  habit_id:      string
  habit_name:    string
  emoji:         string
  color:         string
  completed_days:number
  total_days:    number
  completion_pct:number
  avg_mood_on_done:  number | null
  avg_mood_on_skip:  number | null
  mood_boost:    number | null    // diff = done_mood - skip_mood
}

// ── Weekly summary ────────────────────────────────────────────
export interface WeeklySummary {
  week_label:      string         // e.g. "30 Jun – 6 Jul"
  avg_mood:        number | null
  entries_written: number
  top_emotion:     string | null
  streak_gained:   number
  habits_completed:number
  total_habits:    number
}

// ── Monthly overview ──────────────────────────────────────────
export interface MonthlyHeatmapDay {
  date:        string
  mood_score:  number | null
  has_entry:   boolean
  energy_score:number | null
}

// ── Full analytics payload ────────────────────────────────────
export interface AnalyticsData {
  period:          '7d' | '30d' | '90d'
  moodTrend:       MoodDataPoint[]
  emotions:        EmotionFrequency[]
  habits:          HabitPerformance[]
  heatmap:         MonthlyHeatmapDay[]
  weeklySummaries: WeeklySummary[]
  totalEntries:    number
  avgMood:         number | null
  avgEnergy:       number | null
  streakCurrent:   number
}

// ── Period config ─────────────────────────────────────────────
export const PERIOD_OPTIONS: Array<{
  value: '7d' | '30d' | '90d'
  label: string
  days:  number
}> = [
  { value: '7d',  label: '7 hari',  days: 7  },
  { value: '30d', label: '30 hari', days: 30 },
  { value: '90d', label: '90 hari', days: 90 },
]

// ── Emotion category colors (for charts) ─────────────────────
export const EMOTION_COLORS: Record<'positive' | 'neutral' | 'negative', string[]> = {
  positive: ['#1D9E75','#0F6E56','#4ADE80','#059669','#D4537E','#EF9F27'],
  neutral:  ['#888780','#B4B2A9','#5F5E5A','#EF9F27','#637074'],
  negative: ['#7F77DD','#E24B4A','#D85A30','#534AB7','#991B1B'],
}

// ── Chart color palette ────────────────────────────────────────
export const CHART_COLORS = {
  mood:      '#7F77DD',
  energy:    '#EF9F27',
  stress:    '#E24B4A',
  grid:      'rgba(0,0,0,0.06)',
  reference: 'rgba(127,119,221,0.20)',
}
