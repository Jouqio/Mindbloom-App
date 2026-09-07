// ============================================================
// MindBloom — Sprint 2 Types
// File: src/types/dashboard.ts
// ============================================================

export type MoodCategory =
  | 'happy'
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'stressed'
  | 'emotional'
  | 'tired'

export type JournalingGoal =
  | 'reduce_stress'
  | 'self_awareness'
  | 'build_habits'
  | 'mental_health'
  | 'productivity'

export type GardenLevel = 'seed' | 'sprout' | 'plant' | 'tree' | 'forest'

export interface DashboardData {
  streak: {
    current_streak: number
    longest_streak: number
    total_entries: number
  }
  mood_today: {
    score: number
    category: MoodCategory
  } | null
  xp: {
    total_xp: number
    current_level: number
    xp_to_next: number
  }
  garden_level: GardenLevel
  weekly_avg_mood: number | null
  unread_insights: number
  pending_achievements: number
}

export interface MoodCalendarDay {
  entry_date: string
  mood_score: number
  mood_category: MoodCategory
  has_journal: boolean
}

export interface AIInsight {
  id: string
  title: string
  body: string
  category: string
  emoji: string | null
  stat_value: string | null
  stat_label: string | null
  action_label: string | null
  action_url: string | null
  seen_at: string | null
}

export const MOOD_CONFIG: Record<
  MoodCategory,
  { label: string; color: string; bg: string; emoji: string }
> = {
  happy:     { label: 'Bahagia',    color: '#1D9E75', bg: '#E1F5EE', emoji: '😊' },
  calm:      { label: 'Tenang',     color: '#378ADD', bg: '#E6F1FB', emoji: '😌' },
  excited:   { label: 'Semangat',   color: '#EF9F27', bg: '#FAEEDA', emoji: '🤩' },
  anxious:   { label: 'Cemas',      color: '#D85A30', bg: '#FAECE7', emoji: '😟' },
  stressed:  { label: 'Stres',      color: '#E24B4A', bg: '#FCEBEB', emoji: '😰' },
  emotional: { label: 'Emosional',  color: '#7F77DD', bg: '#EEEDFE', emoji: '🥺' },
  tired:     { label: 'Lelah',      color: '#888780', bg: '#F1EFE8', emoji: '😴' },
}

export const GARDEN_LEVEL_CONFIG: Record<
  GardenLevel,
  { label: string; emoji: string; minJournals: number }
> = {
  seed:    { label: 'Benih',    emoji: '🌱', minJournals: 1  },
  sprout:  { label: 'Tunas',   emoji: '🌿', minJournals: 3  },
  plant:   { label: 'Tanaman', emoji: '🪴', minJournals: 7  },
  tree:    { label: 'Pohon',   emoji: '🌳', minJournals: 20 },
  forest:  { label: 'Hutan',   emoji: '🌲', minJournals: 50 },
}

export const JOURNALING_GOAL_OPTIONS: Array<{
  value: JournalingGoal
  label: string
  description: string
  emoji: string
}> = [
  {
    value: 'reduce_stress',
    label: 'Mengurangi stres',
    description: 'Aku ingin mengelola stres dan kecemasanku lebih baik',
    emoji: '🧘',
  },
  {
    value: 'self_awareness',
    label: 'Mengenal diri',
    description: 'Aku ingin memahami emosi dan pola pikirku lebih dalam',
    emoji: '🪞',
  },
  {
    value: 'build_habits',
    label: 'Membangun kebiasaan',
    description: 'Aku ingin konsisten dalam rutinitas dan kebiasaan positif',
    emoji: '⚡',
  },
  {
    value: 'mental_health',
    label: 'Kesehatan mental',
    description: 'Aku ingin menjaga dan meningkatkan kesehatan mentalku',
    emoji: '💛',
  },
  {
    value: 'productivity',
    label: 'Produktivitas',
    description: 'Aku ingin lebih fokus dan produktif setiap hari',
    emoji: '🎯',
  },
]
