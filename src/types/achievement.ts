// ============================================================
// MindBloom — Achievement & XP Types
// File: src/types/achievement.ts
// ============================================================

export type AchievementCategory =
  | 'streak'
  | 'reflection'
  | 'gratitude'
  | 'consistency'
  | 'growth'
  | 'emotional'

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'

export interface AchievementDefinition {
  id:               string
  slug:             string
  name:             string
  description:      string
  icon:             string
  category:         AchievementCategory
  rarity:           AchievementRarity
  condition_type:   string
  condition_value:  number
  xp_reward:        number
  is_hidden:        boolean
  sort_order:       number
}

export interface UserAchievement {
  id:             string
  user_id:        string
  achievement_id: string
  earned_at:      string
  notified:       boolean
  definition:     AchievementDefinition
}

export interface UserXP {
  id:            string
  user_id:       string
  total_xp:      number
  current_level: number
  xp_to_next:    number
  updated_at:    string
}

export interface StreakData {
  current_streak:  number
  longest_streak:  number
  total_entries:   number
  last_entry_date: string | null
}

// ── XP Level System ───────────────────────────────────────────
export const XP_LEVELS: Array<{
  level:     number
  title:     string
  emoji:     string
  xp_needed: number
  color:     string
}> = [
  { level:  1, title: 'Pemula',          emoji: '🌱', xp_needed: 0,    color: '#888780' },
  { level:  2, title: 'Penjelajah',      emoji: '🌿', xp_needed: 100,  color: '#1D9E75' },
  { level:  3, title: 'Pemikir',         emoji: '🍃', xp_needed: 250,  color: '#1D9E75' },
  { level:  4, title: 'Reflector',       emoji: '🌱', xp_needed: 450,  color: '#378ADD' },
  { level:  5, title: 'Penyelam',        emoji: '💧', xp_needed: 700,  color: '#378ADD' },
  { level:  6, title: 'Pengamat',        emoji: '🔭', xp_needed: 1000, color: '#7F77DD' },
  { level:  7, title: 'Penulis',         emoji: '✍️', xp_needed: 1400, color: '#7F77DD' },
  { level:  8, title: 'Filsuf',          emoji: '🧘', xp_needed: 1900, color: '#D4537E' },
  { level:  9, title: 'Bijaksana',       emoji: '🦉', xp_needed: 2500, color: '#D4537E' },
  { level: 10, title: 'Guru Refleksi',   emoji: '🏆', xp_needed: 3200, color: '#EF9F27' },
]

export function getLevelFromXP(totalXP: number) {
  let currentLevel = XP_LEVELS[0]
  for (const lvl of XP_LEVELS) {
    if (totalXP >= lvl.xp_needed) currentLevel = lvl
    else break
  }
  const nextLevel = XP_LEVELS.find((l) => l.level === currentLevel.level + 1)
  const xpInCurrentLevel = totalXP - currentLevel.xp_needed
  const xpNeededForNext  = nextLevel
    ? nextLevel.xp_needed - currentLevel.xp_needed
    : 100
  const progressPct = nextLevel
    ? Math.round((xpInCurrentLevel / xpNeededForNext) * 100)
    : 100

  return { currentLevel, nextLevel, xpInCurrentLevel, xpNeededForNext, progressPct }
}

// ── Achievement Definitions (seed data) ──────────────────────
export const ACHIEVEMENT_DEFINITIONS: Omit<AchievementDefinition, 'id'>[] = [
  // Streak achievements
  {
    slug: 'streak_3',     name: 'Mulai Bergerak',     description: 'Tulis jurnal 3 hari berturut-turut',
    icon: '🔥', category: 'streak',      rarity: 'common',    condition_type: 'streak_days', condition_value: 3,
    xp_reward: 30,  is_hidden: false, sort_order: 1,
  },
  {
    slug: 'streak_7',     name: 'Seminggu Konsisten',  description: 'Tulis jurnal 7 hari berturut-turut',
    icon: '🔥', category: 'streak',      rarity: 'common',    condition_type: 'streak_days', condition_value: 7,
    xp_reward: 70,  is_hidden: false, sort_order: 2,
  },
  {
    slug: 'streak_14',    name: 'Dua Minggu Kuat',     description: 'Tulis jurnal 14 hari berturut-turut',
    icon: '💪', category: 'streak',      rarity: 'uncommon',  condition_type: 'streak_days', condition_value: 14,
    xp_reward: 140, is_hidden: false, sort_order: 3,
  },
  {
    slug: 'streak_30',    name: 'Sebulan Penuh',       description: 'Tulis jurnal 30 hari berturut-turut',
    icon: '🌟', category: 'streak',      rarity: 'rare',      condition_type: 'streak_days', condition_value: 30,
    xp_reward: 300, is_hidden: false, sort_order: 4,
  },
  {
    slug: 'streak_60',    name: 'Dua Bulan Juara',     description: 'Tulis jurnal 60 hari berturut-turut',
    icon: '👑', category: 'streak',      rarity: 'epic',      condition_type: 'streak_days', condition_value: 60,
    xp_reward: 600, is_hidden: false, sort_order: 5,
  },
  {
    slug: 'streak_90',    name: 'Identitas Baru',      description: 'Tulis jurnal 90 hari berturut-turut',
    icon: '🏆', category: 'streak',      rarity: 'legendary', condition_type: 'streak_days', condition_value: 90,
    xp_reward: 900, is_hidden: false, sort_order: 6,
  },
  // Total entries
  {
    slug: 'entries_1',    name: 'Langkah Pertama',     description: 'Tulis jurnal pertamamu',
    icon: '🌱', category: 'reflection',  rarity: 'common',    condition_type: 'total_entries', condition_value: 1,
    xp_reward: 10,  is_hidden: false, sort_order: 7,
  },
  {
    slug: 'entries_10',   name: 'Pembuat Kebiasaan',   description: 'Tulis 10 jurnal',
    icon: '📝', category: 'reflection',  rarity: 'common',    condition_type: 'total_entries', condition_value: 10,
    xp_reward: 50,  is_hidden: false, sort_order: 8,
  },
  {
    slug: 'entries_25',   name: 'Penulis Serius',      description: 'Tulis 25 jurnal',
    icon: '✍️', category: 'reflection',  rarity: 'uncommon',  condition_type: 'total_entries', condition_value: 25,
    xp_reward: 125, is_hidden: false, sort_order: 9,
  },
  {
    slug: 'entries_50',   name: 'Pertumbuhan Nyata',   description: 'Tulis 50 jurnal',
    icon: '🌳', category: 'reflection',  rarity: 'rare',      condition_type: 'total_entries', condition_value: 50,
    xp_reward: 250, is_hidden: false, sort_order: 10,
  },
  {
    slug: 'entries_100',  name: 'Penjaga Pikiran',     description: 'Tulis 100 jurnal',
    icon: '💎', category: 'reflection',  rarity: 'epic',      condition_type: 'total_entries', condition_value: 100,
    xp_reward: 500, is_hidden: false, sort_order: 11,
  },
  // Gratitude
  {
    slug: 'gratitude_first', name: 'Hatiku Bersyukur',  description: 'Tulis jurnal syukur pertama',
    icon: '🙏', category: 'gratitude',   rarity: 'common',    condition_type: 'gratitude_entry', condition_value: 1,
    xp_reward: 15,  is_hidden: false, sort_order: 12,
  },
  {
    slug: 'gratitude_5_items', name: 'Dermawan Syukur', description: 'Tulis 5 hal syukur dalam satu jurnal',
    icon: '💛', category: 'gratitude',   rarity: 'uncommon',  condition_type: 'gratitude_items', condition_value: 5,
    xp_reward: 40,  is_hidden: false, sort_order: 13,
  },
  // Completion
  {
    slug: 'perfect_journal', name: 'Refleksi Mendalam', description: 'Selesaikan jurnal dengan 90%+ kelengkapan',
    icon: '⭐', category: 'consistency', rarity: 'uncommon',  condition_type: 'completion_pct', condition_value: 90,
    xp_reward: 50,  is_hidden: false, sort_order: 14,
  },
  {
    slug: 'level_5',      name: 'Setengah Jalan',      description: 'Capai level 5',
    icon: '🎯', category: 'growth',      rarity: 'rare',      condition_type: 'xp_level', condition_value: 5,
    xp_reward: 100, is_hidden: false, sort_order: 15,
  },
  {
    slug: 'level_10',     name: 'Guru Refleksi',       description: 'Capai level 10 — puncak perjalanan',
    icon: '🎓', category: 'growth',      rarity: 'legendary', condition_type: 'xp_level', condition_value: 10,
    xp_reward: 500, is_hidden: true,  sort_order: 16,
  },
]

// ── Rarity config ─────────────────────────────────────────────
export const RARITY_CONFIG: Record<AchievementRarity, {
  label:  string
  color:  string
  bg:     string
  border: string
  glow:   string
}> = {
  common:    { label:'Umum',    color:'#5F5E5A', bg:'#F1EFE8', border:'#B4B2A9', glow:'rgba(136,135,128,.15)' },
  uncommon:  { label:'Biasa',   color:'#1D9E75', bg:'#E1F5EE', border:'#5DCAA5', glow:'rgba(29,158,117,.20)'  },
  rare:      { label:'Langka',  color:'#378ADD', bg:'#E6F1FB', border:'#85B7EB', glow:'rgba(55,138,221,.25)'  },
  epic:      { label:'Epik',    color:'#7F77DD', bg:'#EEEDFE', border:'#AFA9EC', glow:'rgba(127,119,221,.30)' },
  legendary: { label:'Legenda', color:'#EF9F27', bg:'#FAEEDA', border:'#EF9F27', glow:'rgba(239,159,39,.35)'  },
}
