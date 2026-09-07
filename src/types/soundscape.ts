// ============================================================
// MindBloom — Soundscape Types
// File: src/types/soundscape.ts
// ============================================================

export type SoundId = 'rain' | 'ocean' | 'fire' | 'forest' | 'wind' | 'white_noise'

export interface SoundDefinition {
  id:          SoundId
  label:       string
  emoji:       string
  description: string
  color:       string
  bg:          string
}

export const SOUND_DEFINITIONS: Record<SoundId, SoundDefinition> = {
  rain: {
    id: 'rain', label: 'Hujan', emoji: '🌧️',
    description: 'Suara hujan lembut yang menenangkan',
    color: '#378ADD', bg: '#E6F1FB',
  },
  ocean: {
    id: 'ocean', label: 'Ombak Laut', emoji: '🌊',
    description: 'Deburan ombak yang berirama',
    color: '#0C447C', bg: '#E6F1FB',
  },
  fire: {
    id: 'fire', label: 'Api Unggun', emoji: '🔥',
    description: 'Suara kayu terbakar yang hangat',
    color: '#D85A30', bg: '#FAECE7',
  },
  forest: {
    id: 'forest', label: 'Hutan', emoji: '🌲',
    description: 'Suasana hutan dengan kicau burung',
    color: '#1D9E75', bg: '#E1F5EE',
  },
  wind: {
    id: 'wind', label: 'Angin', emoji: '💨',
    description: 'Hembusan angin yang lembut',
    color: '#888780', bg: '#F1EFE8',
  },
  white_noise: {
    id: 'white_noise', label: 'White Noise', emoji: '⚪',
    description: 'Suara putih untuk fokus dan tidur',
    color: '#5F5E5A', bg: '#F1EFE8',
  },
}

export const SOUND_IDS: SoundId[] = ['rain', 'ocean', 'fire', 'forest', 'wind', 'white_noise']

// ── Mixer state per sound ─────────────────────────────────────
export interface SoundMixState {
  id:        SoundId
  isActive:  boolean
  volume:    number // 0–100
}

export const INITIAL_MIX: Record<SoundId, SoundMixState> = SOUND_IDS.reduce(
  (acc, id) => ({ ...acc, [id]: { id, isActive: false, volume: 50 } }),
  {} as Record<SoundId, SoundMixState>
)

// ── Presets ────────────────────────────────────────────────────
export interface SoundPreset {
  id:     string
  label:  string
  emoji:  string
  mix:    Partial<Record<SoundId, number>> // soundId → volume
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'sleep',  label: 'Tidur',    emoji: '😴', mix: { rain: 60, white_noise: 30 } },
  { id: 'focus',  label: 'Fokus',    emoji: '🎯', mix: { forest: 45, wind: 25 } },
  { id: 'relax',  label: 'Rileks',   emoji: '🧘', mix: { ocean: 55, wind: 20 } },
  { id: 'cozy',   label: 'Hangat',   emoji: '☕', mix: { fire: 65, rain: 20 } },
]

// ── Sleep timer options ───────────────────────────────────────
export const TIMER_OPTIONS = [
  { label: '15 menit', minutes: 15 },
  { label: '30 menit', minutes: 30 },
  { label: '45 menit', minutes: 45 },
  { label: '60 menit', minutes: 60 },
  { label: 'Tanpa batas', minutes: 0 },
] as const
