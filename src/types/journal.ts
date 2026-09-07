// ============================================================
// MindBloom — Journal Types
// File: src/types/journal.ts
// ============================================================

export type MoodCategory =
  | 'happy' | 'calm' | 'excited' | 'anxious'
  | 'stressed' | 'emotional' | 'tired'

export type DevicePlatform = 'web' | 'ios' | 'android'

export interface JournalDraft {
  // Step 1
  entry_date:          string
  // Step 2
  mood_score:          number | null
  mood_category:       MoodCategory | null
  // Step 3
  emotions:            string[]
  // Step 4
  energy_score:        number | null
  // Step 5
  main_story:          string
  // Step 6
  recurring_thoughts:  string
  // Step 7
  stress_source:       string
  stress_intensity:    number | null
  // Step 8
  happy_moments:       string
  // Step 9
  gratitude_items:     string[]
  // Step 10
  lessons_learned:     string
  // Step 11
  did_well:            string
  improve_on:          string
  do_differently:      string
  // Step 12
  self_compassion:     string
  // Step 13
  tomorrow_intention:  string
  // Step 14
  affirmations:        string[]
  // Step 15
  prayer_hope:         string
}

export const INITIAL_DRAFT: JournalDraft = {
  entry_date:          new Date().toISOString().split('T')[0],
  mood_score:          null,
  mood_category:       null,
  emotions:            [],
  energy_score:        null,
  main_story:          '',
  recurring_thoughts:  '',
  stress_source:       '',
  stress_intensity:    null,
  happy_moments:       '',
  gratitude_items:     ['', '', ''],
  lessons_learned:     '',
  did_well:            '',
  improve_on:          '',
  do_differently:      '',
  self_compassion:     '',
  tomorrow_intention:  '',
  affirmations:        [],
  prayer_hope:         '',
}

export interface StepConfig {
  id:          number
  title:       string
  subtitle:    string
  emoji:       string
  optional:    boolean
  minWords?:   number
}

export const STEP_CONFIGS: StepConfig[] = [
  { id: 1,  title: 'Hari ini',            subtitle: 'Tanggal dan konteks harianmu',            emoji: '📅', optional: false },
  { id: 2,  title: 'Bagaimana perasaanmu?',subtitle: 'Nilai mood hari ini dari 1 sampai 10',    emoji: '💭', optional: false },
  { id: 3,  title: 'Emosi yang dirasakan',subtitle: 'Pilih semua emosi yang kamu rasakan',     emoji: '🎭', optional: false },
  { id: 4,  title: 'Level energi',         subtitle: 'Seberapa berenergi kamu hari ini?',       emoji: '⚡', optional: false },
  { id: 5,  title: 'Cerita hari ini',      subtitle: 'Apa yang paling berkesan hari ini?',      emoji: '📖', optional: false, minWords: 10 },
  { id: 6,  title: 'Pikiran yang bermain', subtitle: 'Pikiran apa yang paling sering muncul?',  emoji: '💭', optional: true  },
  { id: 7,  title: 'Sumber stres',         subtitle: 'Apa yang paling menekanmu hari ini?',     emoji: '😤', optional: true  },
  { id: 8,  title: 'Momen bahagia',        subtitle: 'Hal kecil yang membuatmu tersenyum',      emoji: '😊', optional: false, minWords: 3 },
  { id: 9,  title: 'Jurnal syukur',        subtitle: 'Minimal 3 hal yang kamu syukuri',         emoji: '🙏', optional: false },
  { id: 10, title: 'Pelajaran hari ini',   subtitle: 'Pelajaran kecil yang tersembunyi',        emoji: '💡', optional: true  },
  { id: 11, title: 'Refleksi diri',        subtitle: 'Evaluasi jujur tentang harimu',           emoji: '🪞', optional: false },
  { id: 12, title: 'Belas kasih diri',     subtitle: 'Perlakukan dirimu seperti sahabat terbaik',emoji: '💛', optional: false },
  { id: 13, title: 'Niat besok',           subtitle: 'Energi apa yang ingin kamu bawa besok?',  emoji: '🌅', optional: true  },
  { id: 14, title: 'Afirmasi',             subtitle: 'Pilih atau tulis afirmasimu',             emoji: '✨', optional: true  },
  { id: 15, title: 'Doa & harapan',        subtitle: 'Ruang paling pribadi — tulis apa saja',   emoji: '🌙', optional: true  },
]

export const TOTAL_STEPS = STEP_CONFIGS.length

// Emotion categories
export const EMOTION_OPTIONS = [
  // Positive
  { label: 'Senang',     category: 'positive', color: '#1D9E75', bg: '#E1F5EE' },
  { label: 'Bersyukur',  category: 'positive', color: '#0F6E56', bg: '#E1F5EE' },
  { label: 'Tenang',     category: 'positive', color: '#185FA5', bg: '#E6F1FB' },
  { label: 'Terinspirasi',category:'positive', color: '#534AB7', bg: '#EEEDFE' },
  { label: 'Semangat',   category: 'positive', color: '#BA7517', bg: '#FAEEDA' },
  { label: 'Bangga',     category: 'positive', color: '#3B6D11', bg: '#EAF3DE' },
  { label: 'Damai',      category: 'positive', color: '#0C447C', bg: '#E6F1FB' },
  { label: 'Cinta',      category: 'positive', color: '#993556', bg: '#FBEAF0' },
  // Neutral
  { label: 'Biasa saja', category: 'neutral',  color: '#5F5E5A', bg: '#F1EFE8' },
  { label: 'Bingung',    category: 'neutral',  color: '#633806', bg: '#FAEEDA' },
  { label: 'Penasaran',  category: 'neutral',  color: '#534AB7', bg: '#EEEDFE' },
  { label: 'Lelah',      category: 'neutral',  color: '#444441', bg: '#F1EFE8' },
  // Negative
  { label: 'Sedih',      category: 'negative', color: '#3C3489', bg: '#EEEDFE' },
  { label: 'Frustrasi',  category: 'negative', color: '#993C1D', bg: '#FAECE7' },
  { label: 'Cemas',      category: 'negative', color: '#854F0B', bg: '#FAEEDA' },
  { label: 'Stres',      category: 'negative', color: '#A32D2D', bg: '#FCEBEB' },
  { label: 'Overthinking',category:'negative', color: '#72243E', bg: '#FBEAF0' },
  { label: 'Kesepian',   category: 'negative', color: '#444441', bg: '#F1EFE8' },
  { label: 'Marah',      category: 'negative', color: '#791F1F', bg: '#FCEBEB' },
  { label: 'Kecewa',     category: 'negative', color: '#633806', bg: '#FAEEDA' },
] as const

// Preset affirmations
export const AFFIRMATION_PRESETS = [
  'Aku cukup. Aku layak. Aku berharga.',
  'Setiap hari adalah kesempatan baru untuk tumbuh.',
  'Aku mampu menghadapi tantangan yang datang.',
  'Perasaanku valid dan aku berhak merasakannya.',
  'Aku sedang melakukan yang terbaik dengan apa yang aku miliki.',
  'Kegagalan adalah bagian dari perjalanan, bukan akhir.',
  'Aku memilih untuk berfokus pada hal yang bisa aku kontrol.',
  'Aku layak mendapat kebahagiaan dan kedamaian.',
  'Setiap langkah kecil yang aku ambil berarti.',
  'Aku percaya pada proses dan perjalananku sendiri.',
]
