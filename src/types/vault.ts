// ============================================================
// MindBloom — Memory Vault Types
// File: src/types/vault.ts
// ============================================================

export interface MonthlyNarrative {
  id:           string
  user_id:      string
  year:         number
  month:        number            // 1–12
  month_label:  string            // e.g. "Juni 2025"
  narrative:    string            // AI-generated narrative prose
  highlights:   string[]          // bullet highlights
  mood_summary: string            // e.g. "Bulan yang penuh dinamika"
  top_emotions: string[]
  avg_mood:     number | null
  entry_count:  number
  word_count:   number
  cover_emoji:  string
  generated_at: string
  is_generating:boolean
}

export interface VaultEntry {
  id:            string
  entry_date:    string
  mood_score:    number | null
  mood_category: string | null
  main_story:    string | null
  happy_moments: string | null
  self_compassion:string | null
  lessons_learned:string | null
  gratitude_items:string[]
  word_count:    number
  completion_pct:number
}

export interface PDFExportOptions {
  type:     'single' | 'month' | 'all'
  entryId?: string
  year?:    number
  month?:   number
  include:  {
    narrative:    boolean
    mood:         boolean
    emotions:     boolean
    gratitude:    boolean
    reflections:  boolean
    prayer:       boolean
  }
}

// ── Month grid item ───────────────────────────────────────────
export interface MonthGridItem {
  year:          number
  month:         number
  label:         string
  entryCount:    number
  avgMood:       number | null
  hasNarrative:  boolean
  narrative?:    MonthlyNarrative
}

// ── Cover emoji per mood average ─────────────────────────────
export function getCoverEmoji(avgMood: number | null, entryCount: number): string {
  if (entryCount === 0) return '📭'
  if (avgMood === null) return '📖'
  if (avgMood >= 8) return '🌟'
  if (avgMood >= 6) return '🌸'
  if (avgMood >= 4) return '🌿'
  if (avgMood >= 2) return '🍂'
  return '🌧️'
}

export const MONTH_NAMES_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
