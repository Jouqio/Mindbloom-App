// ============================================================
// MindBloom — Garden Types & Definitions
// File: src/types/garden.ts
// ============================================================

export type GardenLevel = 'seed' | 'sprout' | 'plant' | 'tree' | 'forest'

export type PlantType =
  | 'sunflower'   // happy / excited
  | 'lotus'       // calm / peaceful
  | 'rose'        // gratitude / love
  | 'fern'        // anxious (resilient)
  | 'willow'      // tired / emotional
  | 'cactus'      // stressed (transforms)
  | 'bamboo'      // consistent (streak)
  | 'sakura'      // rare — milestone achievement
  | 'lavender'    // self-compassion
  | 'bonsai'      // wisdom — high level

export type PlantStage = 'seed' | 'sprout' | 'growing' | 'bloom' | 'full'

export type SeasonTheme = 'spring' | 'summer' | 'autumn'

export interface GardenPlant {
  id:           string
  user_id:      string
  entry_id:     string | null
  plant_type:   PlantType
  stage:        PlantStage
  mood_score:   number
  mood_category:string
  position_x:   number  // 0–100 percent
  position_y:   number  // 0–100 percent
  is_rare:      boolean
  planted_at:   string
  bloomed_at:   string | null
  entry_date:   string | null
  note:         string | null
}

export interface GardenState {
  level:         GardenLevel
  total_plants:  number
  bloomed_plants:number
  rare_plants:   number
  last_grown_at: string | null
  season:        SeasonTheme
}

// ── Level config ──────────────────────────────────────────────
export const GARDEN_LEVELS: Record<GardenLevel, {
  label:        string
  emoji:        string
  minJournals:  number
  maxPlants:    number
  description:  string
  bgGradient:   string
}> = {
  seed: {
    label: 'Benih',
    emoji: '🌰',
    minJournals: 0,
    maxPlants: 1,
    description: 'Perjalananmu baru saja dimulai. Tanam benih pertamamu.',
    bgGradient: 'from-amber-50 to-green-50 dark:from-amber-950/20 dark:to-green-950/20',
  },
  sprout: {
    label: 'Tunas',
    emoji: '🌱',
    minJournals: 3,
    maxPlants: 4,
    description: 'Tunasmu mulai bermunculan. Konsistensi adalah kunci.',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
  },
  plant: {
    label: 'Tanaman',
    emoji: '🪴',
    minJournals: 7,
    maxPlants: 9,
    description: 'Tamanmu mulai tumbuh dan berbunga. Kamu berkembang!',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
  },
  tree: {
    label: 'Pohon',
    emoji: '🌳',
    minJournals: 20,
    maxPlants: 16,
    description: 'Pohon-pohon kuat berdiri di tamanmu. Pertumbuhanmu nyata.',
    bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20',
  },
  forest: {
    label: 'Hutan',
    emoji: '🌲',
    minJournals: 50,
    maxPlants: 30,
    description: 'Hutanmu rimbun dan penuh kehidupan. Sebuah karya luar biasa!',
    bgGradient: 'from-cyan-50 to-green-100 dark:from-cyan-950/20 dark:to-green-950/30',
  },
}

export function getGardenLevel(totalJournals: number): GardenLevel {
  if (totalJournals >= 50) return 'forest'
  if (totalJournals >= 20) return 'tree'
  if (totalJournals >= 7)  return 'plant'
  if (totalJournals >= 3)  return 'sprout'
  return 'seed'
}

// ── Plant type mapping from mood ─────────────────────────────
export const MOOD_TO_PLANT: Record<string, PlantType> = {
  happy:     'sunflower',
  excited:   'sunflower',
  calm:      'lotus',
  grateful:  'rose',
  anxious:   'fern',
  stressed:  'cactus',
  tired:     'willow',
  emotional: 'lavender',
}

export const PLANT_CONFIG: Record<PlantType, {
  label:       string
  emoji:       string
  description: string
  color:       string
  isRare:      boolean
}> = {
  sunflower: { label:'Bunga Matahari', emoji:'🌻', description:'Tumbuh dari hari-hari penuh kebahagiaan',    color:'#EF9F27', isRare:false },
  lotus:     { label:'Teratai',        emoji:'🪷', description:'Mekar indah dari ketenangan hatimu',         color:'#D4537E', isRare:false },
  rose:      { label:'Mawar',          emoji:'🌹', description:'Ungkapan syukur dan kasih yang tulus',       color:'#E24B4A', isRare:false },
  fern:      { label:'Pakis',          emoji:'🌿', description:'Tangguh melewati kecemasan, tetap bertahan', color:'#1D9E75', isRare:false },
  willow:    { label:'Willow',         emoji:'🌾', description:'Lentur menghadapi kelelahan, terus bergerak',color:'#888780', isRare:false },
  cactus:    { label:'Kaktus',         emoji:'🌵', description:'Bertahan di padang stress tanpa menyerah',   color:'#639922', isRare:false },
  bamboo:    { label:'Bambu',          emoji:'🎋', description:'Kuat dan konsisten, tumbuh setiap hari',     color:'#1D9E75', isRare:false },
  sakura:    { label:'Sakura',         emoji:'🌸', description:'Bunga langka — hadiah pencapaian luar biasa',color:'#D4537E', isRare:true  },
  lavender:  { label:'Lavender',       emoji:'💜', description:'Mekar dari belas kasih kepada diri sendiri', color:'#7F77DD', isRare:false },
  bonsai:    { label:'Bonsai',         emoji:'🎍', description:'Pohon kebijaksanaan — buah dari level tinggi',color:'#0F6E56',isRare:true  },
}

// ── Ground layers ─────────────────────────────────────────────
export const GROUND_LAYERS = {
  seed: {
    sky:    ['#FEF9C3','#FEF3C7'],
    ground: ['#D97706','#A16207'],
    grass:  null,
  },
  sprout: {
    sky:    ['#ECFDF5','#D1FAE5'],
    ground: ['#6B7280','#4B5563'],
    grass:  '#86EFAC',
  },
  plant: {
    sky:    ['#E0F2FE','#BAE6FD'],
    ground: ['#525252','#404040'],
    grass:  '#4ADE80',
  },
  tree: {
    sky:    ['#CFFAFE','#A5F3FC'],
    ground: ['#374151','#1F2937'],
    grass:  '#22C55E',
  },
  forest: {
    sky:    ['#B7F0AD','#86EFAC'],
    ground: ['#1C1917','#0C0A09'],
    grass:  '#16A34A',
  },
}
