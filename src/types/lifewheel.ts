// ============================================================
// MindBloom — Life Wheel Types
// File: src/types/lifewheel.ts
// ============================================================

export type LifeDimension =
  | 'physical_health'
  | 'mental_health'
  | 'career'
  | 'finance'
  | 'relationships'
  | 'personal_growth'
  | 'recreation'
  | 'spirituality'

export const LIFE_DIMENSIONS_ORDER: LifeDimension[] = [
  'physical_health', 'mental_health', 'career', 'finance',
  'relationships', 'personal_growth', 'recreation', 'spirituality',
]

export interface LifeDimensionConfig {
  id:          LifeDimension
  label:       string
  shortLabel:  string
  emoji:       string
  color:       string
  description: string
  questions:   string[]
}

export const LIFE_DIMENSION_CONFIG: Record<LifeDimension, LifeDimensionConfig> = {
  physical_health: {
    id: 'physical_health', label: 'Kesehatan Fisik', shortLabel: 'Fisik',
    emoji: '💪', color: '#1D9E75',
    description: 'Kondisi tubuh, energi, dan kebugaran',
    questions: ['Apakah aku cukup tidur?', 'Apakah aku rutin bergerak/olahraga?', 'Apakah pola makanku sehat?'],
  },
  mental_health: {
    id: 'mental_health', label: 'Kesehatan Mental', shortLabel: 'Mental',
    emoji: '🧠', color: '#7F77DD',
    description: 'Ketenangan pikiran dan kestabilan emosi',
    questions: ['Apakah aku merasa tenang akhir-akhir ini?', 'Bagaimana aku mengelola stres?', 'Apakah aku punya ruang untuk diriku sendiri?'],
  },
  career: {
    id: 'career', label: 'Karier & Pekerjaan', shortLabel: 'Karier',
    emoji: '💼', color: '#378ADD',
    description: 'Kepuasan dan pertumbuhan dalam pekerjaan',
    questions: ['Apakah aku puas dengan pekerjaanku?', 'Apakah aku berkembang secara profesional?', 'Apakah aku punya tujuan karier yang jelas?'],
  },
  finance: {
    id: 'finance', label: 'Keuangan', shortLabel: 'Keuangan',
    emoji: '💰', color: '#EF9F27',
    description: 'Stabilitas dan kenyamanan finansial',
    questions: ['Apakah aku merasa aman secara finansial?', 'Apakah aku mengelola pengeluaran dengan baik?', 'Apakah aku punya tabungan untuk masa depan?'],
  },
  relationships: {
    id: 'relationships', label: 'Hubungan & Keluarga', shortLabel: 'Hubungan',
    emoji: '❤️', color: '#D4537E',
    description: 'Kualitas hubungan dengan orang terdekat',
    questions: ['Apakah aku merasa terhubung dengan orang-orang terdekat?', 'Apakah aku meluangkan waktu untuk keluarga/teman?', 'Apakah hubunganku sehat dan saling mendukung?'],
  },
  personal_growth: {
    id: 'personal_growth', label: 'Pertumbuhan Diri', shortLabel: 'Pertumbuhan',
    emoji: '🌱', color: '#0F6E56',
    description: 'Pembelajaran dan perkembangan diri',
    questions: ['Apakah aku belajar hal baru?', 'Apakah aku berkembang menjadi versi diri yang lebih baik?', 'Apakah aku punya tujuan jangka panjang?'],
  },
  recreation: {
    id: 'recreation', label: 'Rekreasi & Hobi', shortLabel: 'Rekreasi',
    emoji: '🎨', color: '#D85A30',
    description: 'Kesenangan, hobi, dan waktu santai',
    questions: ['Apakah aku punya waktu untuk hobi?', 'Apakah aku bersenang-senang akhir-akhir ini?', 'Apakah aku punya keseimbangan kerja dan istirahat?'],
  },
  spirituality: {
    id: 'spirituality', label: 'Spiritualitas', shortLabel: 'Spiritual',
    emoji: '🙏', color: '#534AB7',
    description: 'Makna hidup dan koneksi spiritual',
    questions: ['Apakah aku merasa hidupku punya makna?', 'Apakah aku terhubung dengan nilai-nilai yang aku yakini?', 'Apakah aku punya momen refleksi atau ibadah?'],
  },
}

export interface LifeWheelEntry {
  id:         string
  user_id:    string
  scores:     Record<LifeDimension, number>  // 1–10
  notes:      Partial<Record<LifeDimension, string>>
  created_at: string
}

export const INITIAL_SCORES: Record<LifeDimension, number> = LIFE_DIMENSIONS_ORDER.reduce(
  (acc, dim) => ({ ...acc, [dim]: 5 }),
  {} as Record<LifeDimension, number>
)

export function calculateOverallBalance(scores: Record<LifeDimension, number>): {
  average: number
  lowest:  LifeDimension
  highest: LifeDimension
  variance: number
} {
  const values = Object.values(scores)
  const average = values.reduce((a, b) => a + b, 0) / values.length

  const entries = Object.entries(scores) as [LifeDimension, number][]
  const sorted = [...entries].sort((a, b) => a[1] - b[1])
  const lowest  = sorted[0][0]
  const highest = sorted[sorted.length - 1][0]

  const variance = values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length

  return { average: Math.round(average * 10) / 10, lowest, highest, variance: Math.round(variance * 10) / 10 }
}
