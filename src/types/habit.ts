// ============================================================
// MindBloom — Habit Tracker Types
// File: src/types/habit.ts
// ============================================================

export type HabitCategory =
  | 'health'
  | 'mindfulness'
  | 'productivity'
  | 'social'
  | 'learning'
  | 'creativity'

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom'

export interface Habit {
  id:                string
  user_id:           string
  name:              string
  emoji:             string
  category:          HabitCategory
  frequency:         HabitFrequency
  custom_days:       number[] | null  // 0=Minggu ... 6=Sabtu
  target_count:      number           // 1 for simple check, >1 for countable (e.g. 8 gelas air)
  unit:              string | null    // "gelas", "menit", "halaman"
  color:             string
  is_archived:       boolean
  current_streak:    number
  longest_streak:    number
  total_completions: number
  created_at:        string
}

export interface HabitLog {
  id:          string
  habit_id:    string
  user_id:     string
  log_date:    string
  completed:   boolean
  count:       number
  note:        string | null
  created_at:  string
}

export interface HabitWithTodayLog extends Habit {
  today_log: HabitLog | null
}

// ── Category config ────────────────────────────────────────────
export const HABIT_CATEGORIES: Record<HabitCategory, {
  label: string
  emoji: string
  color: string
  bg:    string
}> = {
  health:       { label: 'Kesehatan',    emoji: '💪', color: '#1D9E75', bg: '#E1F5EE' },
  mindfulness:  { label: 'Mindfulness',  emoji: '🧘', color: '#7F77DD', bg: '#EEEDFE' },
  productivity: { label: 'Produktivitas',emoji: '🎯', color: '#378ADD', bg: '#E6F1FB' },
  social:       { label: 'Sosial',       emoji: '🤝', color: '#D4537E', bg: '#FBEAF0' },
  learning:     { label: 'Belajar',      emoji: '📚', color: '#EF9F27', bg: '#FAEEDA' },
  creativity:   { label: 'Kreativitas',  emoji: '🎨', color: '#D85A30', bg: '#FAECE7' },
}

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily:    'Setiap hari',
  weekdays: 'Hari kerja (Sen-Jum)',
  weekends: 'Akhir pekan (Sab-Min)',
  custom:   'Hari tertentu',
}

export const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// ── Emoji presets for habit creation ──────────────────────────
export const HABIT_EMOJI_PRESETS = [
  '💪','🏃','🧘','💧','🥗','😴','📖','✍️','🎨','🎵',
  '🌱','☀️','🧹','💰','📱','🚭','🍎','🦷','🛏️','🤝',
  '📞','🙏','🌿','⏰','🎯','💻','🚶','🧠','❤️','🌟',
]

export const HABIT_COLOR_PRESETS = [
  '#7F77DD', '#1D9E75', '#378ADD', '#EF9F27',
  '#D85A30', '#D4537E', '#E24B4A', '#888780',
]

// ── Helper: check if today is expected for this habit ─────────
export function isExpectedDay(frequency: HabitFrequency, customDays: number[] | null, date = new Date()): boolean {
  const dayOfWeek = date.getDay() // 0=Sunday
  switch (frequency) {
    case 'daily':    return true
    case 'weekdays': return dayOfWeek >= 1 && dayOfWeek <= 5
    case 'weekends': return dayOfWeek === 0 || dayOfWeek === 6
    case 'custom':   return customDays?.includes(dayOfWeek) ?? false
    default:         return true
  }
}
