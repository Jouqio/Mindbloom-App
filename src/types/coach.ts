// ============================================================
// MindBloom — AI Coach Types
// File: src/types/coach.ts
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error'

export interface ChatMessage {
  id:        string
  role:      MessageRole
  content:   string
  status:    MessageStatus
  createdAt: string
  tokens?:   number
}

export interface CoachSession {
  id:           string
  user_id:      string
  title:        string | null
  message_count:number
  created_at:   string
  updated_at:   string
}

export interface CoachContextData {
  recentMoods:    { date: string; score: number; category: string }[]
  recentJournals: { date: string; snippet: string; mood: string | null }[]
  currentStreak:  number
  totalJournals:  number
  topEmotions:    string[]
  habitSummary:   { name: string; streak: number; completedToday: boolean }[]
  lifeWheelLatest:Record<string, number> | null
  userName:       string | null
}

// ── Quick suggestion prompts ──────────────────────────────────
export const BLOOM_SUGGESTIONS = [
  'Bagaimana mood-ku minggu ini?',
  'Aku merasa cemas akhir-akhir ini',
  'Apa pola yang kamu lihat dari jurnalku?',
  'Bantu aku merencanakan minggu ini',
  'Aku butuh strategi mengatasi stres',
  'Cerita tentang kekuatanku yang kamu temukan',
  'Apa yang perlu aku fokuskan bulan ini?',
  'Bagaimana cara meningkatkan keseimbangan hidupku?',
] as const

// ── Bloom persona tone presets ────────────────────────────────
export const BLOOM_TONE_LABELS = {
  warm:       'Hangat & Empatik',
  analytical: 'Analitis & Jelas',
  coaching:   'Coaching & Motivatif',
} as const

export type BloomTone = keyof typeof BLOOM_TONE_LABELS
