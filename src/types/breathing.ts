// ============================================================
// MindBloom — Breathing Types
// File: src/types/breathing.ts
// ============================================================

export type BreathPhase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

export type BreathPatternId = 'box' | 'calm478' | 'coherent' | 'energize'

export interface BreathPatternConfig {
  id:          BreathPatternId
  name:        string
  subtitle:    string
  description: string
  benefit:     string
  emoji:       string
  phases: {
    inhale:  number
    holdIn:  number
    exhale:  number
    holdOut: number
  }
}

export const BREATHING_PATTERNS: Record<BreathPatternId, BreathPatternConfig> = {
  box: {
    id: 'box',
    name: 'Box Breathing',
    subtitle: '4-4-4-4',
    description: 'Tarik nafas, tahan, buang nafas, dan tahan lagi — masing-masing 4 detik.',
    benefit: 'Menyeimbangkan sistem saraf dan menenangkan pikiran dengan cepat.',
    emoji: '🟦',
    phases: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  },
  calm478: {
    id: 'calm478',
    name: 'Teknik 4-7-8',
    subtitle: '4-7-8',
    description: 'Tarik nafas 4 detik, tahan 7 detik, buang nafas perlahan 8 detik.',
    benefit: 'Sangat efektif untuk meredakan kecemasan dan membantu tidur.',
    emoji: '🌙',
    phases: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  },
  coherent: {
    id: 'coherent',
    name: 'Coherent Breathing',
    subtitle: '5-5',
    description: 'Tarik nafas dan buang nafas dengan durasi yang sama, tanpa menahan.',
    benefit: 'Meningkatkan variabilitas detak jantung dan ketenangan jangka panjang.',
    emoji: '💧',
    phases: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
  },
  energize: {
    id: 'energize',
    name: 'Energizing Breath',
    subtitle: '6-2',
    description: 'Tarik nafas dalam 6 detik, buang nafas cepat 2 detik.',
    benefit: 'Membantu meningkatkan energi dan kewaspadaan di pagi hari.',
    emoji: '⚡',
    phases: { inhale: 6, holdIn: 0, exhale: 2, holdOut: 0 },
  },
}

export const BREATHING_PATTERN_IDS: BreathPatternId[] = ['box', 'calm478', 'coherent', 'energize']

// ── Visual config per phase ───────────────────────────────────
export const BREATH_SIZES: Record<BreathPhase, { circle: number; ring1: number; ring2: number }> = {
  idle:    { circle: 140, ring1: 180, ring2: 200 },
  inhale:  { circle: 200, ring1: 240, ring2: 270 },
  holdIn:  { circle: 200, ring1: 240, ring2: 270 },
  exhale:  { circle: 120, ring1: 160, ring2: 180 },
  holdOut: { circle: 120, ring1: 160, ring2: 180 },
}

export const BREATH_COLORS: Record<BreathPhase, string> = {
  idle:    'rgba(127, 119, 221, 0.15)',
  inhale:  'rgba(127, 119, 221, 0.24)',
  holdIn:  'rgba(127, 119, 221, 0.24)',
  exhale:  'rgba(29, 158, 117, 0.20)',
  holdOut: 'rgba(29, 158, 117, 0.16)',
}

export const BREATH_LABELS: Record<BreathPhase, string> = {
  idle:    'Tekan untuk mulai',
  inhale:  'Tarik nafas...',
  holdIn:  'Tahan...',
  exhale:  'Buang nafas...',
  holdOut: 'Tahan...',
}

export const BREATH_SEQUENCE: BreathPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut']

// ── Session tracking ──────────────────────────────────────────
export interface BreathingSession {
  id:             string
  user_id:        string
  pattern_id:     BreathPatternId
  cycles_completed: number
  duration_sec:   number
  created_at:     string
}

export const SESSION_LENGTH_OPTIONS = [
  { label: '2 menit',  cycles: null, seconds: 120 },
  { label: '5 menit',  cycles: null, seconds: 300 },
  { label: '10 menit', cycles: null, seconds: 600 },
  { label: 'Bebas',    cycles: null, seconds: 0   },
] as const
