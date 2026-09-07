// ============================================================
// MindBloom — Insight & EI Types
// File: src/types/insight.ts
// ============================================================

// ── 7-Dimension Emotional Intelligence ───────────────────────
export type EIDimension =
  | 'self_awareness'     // Kesadaran diri
  | 'self_regulation'    // Regulasi diri
  | 'motivation'         // Motivasi internal
  | 'empathy'            // Empati
  | 'social_skills'      // Keterampilan sosial
  | 'resilience'         // Ketangguhan
  | 'mindfulness'        // Kesadaran saat ini

export const EI_DIMENSION_CONFIG: Record<EIDimension, {
  label:       string
  emoji:       string
  color:       string
  description: string
  journalFields: string[]    // which journal fields map to this dimension
}> = {
  self_awareness: {
    label: 'Kesadaran Diri', emoji: '🪞', color: '#7F77DD',
    description: 'Kemampuan mengenali emosi dan dampaknya',
    journalFields: ['emotions', 'mood_score', 'self_compassion'],
  },
  self_regulation: {
    label: 'Regulasi Diri', emoji: '⚖️', color: '#1D9E75',
    description: 'Kemampuan mengelola emosi dan impuls',
    journalFields: ['stress_intensity', 'do_differently', 'improve_on'],
  },
  motivation: {
    label: 'Motivasi', emoji: '🔥', color: '#EF9F27',
    description: 'Dorongan internal untuk berkembang dan mencapai tujuan',
    journalFields: ['tomorrow_intention', 'did_well', 'energy_score'],
  },
  empathy: {
    label: 'Empati', emoji: '💛', color: '#D4537E',
    description: 'Kemampuan memahami dan merasakan emosi orang lain',
    journalFields: ['self_compassion', 'happy_moments', 'main_story'],
  },
  social_skills: {
    label: 'Keterampilan Sosial', emoji: '🤝', color: '#378ADD',
    description: 'Kemampuan membangun dan menjaga hubungan',
    journalFields: ['happy_moments', 'recurring_thoughts', 'main_story'],
  },
  resilience: {
    label: 'Ketangguhan', emoji: '🌿', color: '#0F6E56',
    description: 'Kemampuan bangkit dari kesulitan dan stres',
    journalFields: ['stress_source', 'stress_intensity', 'lessons_learned'],
  },
  mindfulness: {
    label: 'Mindfulness', emoji: '🧘', color: '#534AB7',
    description: 'Kemampuan hadir dan sadar di saat ini',
    journalFields: ['prayer_hope', 'gratitude_items', 'self_compassion'],
  },
}

export const EI_DIMENSIONS: EIDimension[] = [
  'self_awareness', 'self_regulation', 'motivation',
  'empathy', 'social_skills', 'resilience', 'mindfulness',
]

export interface EIScore {
  id:         string
  user_id:    string
  scores:     Record<EIDimension, number>  // 1–10
  overall:    number
  week_start: string  // ISO date of week's Monday
  entry_count:number
  created_at: string
}

// ── Insight Card ──────────────────────────────────────────────
export type InsightCategory =
  | 'mood_pattern'
  | 'streak_milestone'
  | 'emotion_trend'
  | 'habit_correlation'
  | 'growth_reflection'
  | 'stress_pattern'
  | 'gratitude_highlight'
  | 'ei_strength'
  | 'weekly_summary'

export type InsightPriority = 'high' | 'medium' | 'low'

export interface InsightCard {
  id:          string
  user_id:     string
  category:    InsightCategory
  title:       string
  body:        string
  emoji:       string
  stat_value:  string | null   // e.g. "7.8" or "+12%"
  stat_label:  string | null   // e.g. "rata-rata mood" or "naik dari minggu lalu"
  action_label:string | null   // CTA text
  action_url:  string | null   // CTA link
  priority:    InsightPriority
  seen_at:     string | null
  generated_at:string
  valid_until: string          // expiry for stale insights
}

// ── Detected Pattern ──────────────────────────────────────────
export type PatternType =
  | 'mood_dip_weekday'   // mood tends to drop on certain days
  | 'stress_trigger'     // recurring stress source
  | 'gratitude_streak'   // consistent gratitude practice
  | 'energy_mood_link'   // high energy correlates with mood
  | 'habit_mood_boost'   // specific habit correlates with better mood

export interface DetectedPattern {
  type:        PatternType
  title:       string
  description: string
  emoji:       string
  confidence:  number     // 0–1
  dataPoints:  number     // how many data points support this
}
