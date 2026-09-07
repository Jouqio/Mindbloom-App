// ============================================================
// MindBloom — AI Insight Generator
// File: src/lib/ei/insightGenerator.ts
// Uses GPT-4o to generate personalized insight cards
// ============================================================

import OpenAI from 'openai'
import type { InsightCard, InsightCategory, EIScore, DetectedPattern } from '@/types/insight'
import { EI_DIMENSION_CONFIG } from '@/types/insight'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface GenerationInput {
  userName:        string | null
  weekMoodAvg:     number
  prevWeekMoodAvg: number | null
  topEmotions:     string[]
  eiScore:         EIScore | null
  patterns:        DetectedPattern[]
  journalCount:    number
  currentStreak:   number
}

// ── Build insight generation prompt ──────────────────────────
function buildInsightPrompt(input: GenerationInput): string {
  const name = input.userName ?? 'pengguna'
  const moodTrend = input.prevWeekMoodAvg !== null
    ? input.weekMoodAvg >= input.prevWeekMoodAvg
      ? `naik dari ${input.prevWeekMoodAvg.toFixed(1)} minggu lalu`
      : `turun dari ${input.prevWeekMoodAvg.toFixed(1)} minggu lalu`
    : null

  const eiSummary = input.eiScore
    ? Object.entries(input.eiScore.scores)
        .sort((a, b) => b[1] - a[1])
        .map(([dim, score]) => `${EI_DIMENSION_CONFIG[dim as keyof typeof EI_DIMENSION_CONFIG]?.label ?? dim}: ${score}`)
        .join(', ')
    : 'belum ada data EI'

  const patternSummary = input.patterns.length > 0
    ? input.patterns.map((p) => `- ${p.title}: ${p.description}`).join('\n')
    : 'Belum ada pola yang terdeteksi.'

  return `
Kamu adalah Bloom, AI insight generator untuk MindBloom. Tugasmu membuat 3 kartu insight personal yang bermakna berdasarkan data berikut.

DATA USER (${name}):
- Rata-rata mood minggu ini: ${input.weekMoodAvg.toFixed(1)}/10 ${moodTrend ? `(${moodTrend})` : ''}
- Emosi paling sering: ${input.topEmotions.join(', ') || 'belum ada'}
- Skor EI: ${eiSummary}
- Total jurnal: ${input.journalCount}
- Streak: ${input.currentStreak} hari

POLA TERDETEKSI:
${patternSummary}

INSTRUKSI:
Buat TEPAT 3 insight cards. Setiap card HARUS dalam format JSON berikut (tidak ada teks lain, hanya JSON array):
[
  {
    "category": "mood_pattern|streak_milestone|emotion_trend|habit_correlation|growth_reflection|stress_pattern|gratitude_highlight|ei_strength|weekly_summary",
    "title": "judul singkat max 8 kata",
    "body": "insight personal 2-3 kalimat, langsung ke poinnya, menggunakan data spesifik di atas",
    "emoji": "satu emoji yang relevan",
    "stat_value": "angka atau persentase (boleh null)",
    "stat_label": "label untuk stat_value (boleh null)",
    "action_label": "teks CTA max 4 kata (boleh null)",
    "action_url": "path URL seperti /journal atau /habits (boleh null)",
    "priority": "high|medium|low"
  }
]

ATURAN:
- Bahasa Indonesia yang natural, hangat, dan tidak menghakimi
- Gunakan nama "${name}" jika perlu di body
- Pastikan body berisi data SPESIFIK dari input (angka mood, nama emosi, dll)
- Jangan membuat insight generik yang bisa berlaku untuk siapa saja
- high priority = insight yang paling actionable dan personal
- Respons HANYA JSON array, tidak ada penjelasan lain
  `.trim()
}

// ── Generate insights via GPT-4o ──────────────────────────────
export async function generateInsightCards(
  input: GenerationInput
): Promise<Omit<InsightCard, 'id' | 'user_id' | 'seen_at' | 'generated_at' | 'valid_until'>[]> {
  try {
    const completion = await openai.chat.completions.create({
      model:       'gpt-4o-mini',  // cheaper model for insight generation
      messages: [
        { role: 'user', content: buildInsightPrompt(input) },
      ],
      max_tokens:  1200,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '[]'

    // Parse — handle both array and wrapped object
    let parsed: any
    try {
      parsed = JSON.parse(raw)
      // Some models wrap in { "insights": [...] }
      if (!Array.isArray(parsed)) {
        parsed = parsed.insights ?? parsed.cards ?? parsed.data ?? []
      }
    } catch {
      console.error('[generateInsightCards] JSON parse error:', raw)
      return getFallbackInsights(input)
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getFallbackInsights(input)
    }

    return parsed.slice(0, 3).map((card: any) => ({
      category:    (card.category as InsightCategory) ?? 'weekly_summary',
      title:       card.title ?? 'Insight Minggu Ini',
      body:        card.body ?? '',
      emoji:       card.emoji ?? '✨',
      stat_value:  card.stat_value ?? null,
      stat_label:  card.stat_label ?? null,
      action_label:card.action_label ?? null,
      action_url:  card.action_url ?? null,
      priority:    (card.priority as 'high' | 'medium' | 'low') ?? 'medium',
    }))
  } catch (err) {
    console.error('[generateInsightCards] error:', err)
    return getFallbackInsights(input)
  }
}

// ── Fallback insights (no AI call) ───────────────────────────
function getFallbackInsights(
  input: GenerationInput
): Omit<InsightCard, 'id' | 'user_id' | 'seen_at' | 'generated_at' | 'valid_until'>[] {
  const name = input.userName ?? 'kamu'
  return [
    {
      category:    'weekly_summary',
      title:       'Ringkasan minggu ini',
      body:        `Rata-rata moodmu minggu ini adalah ${input.weekMoodAvg.toFixed(1)}/10. Kamu telah menulis ${input.journalCount} jurnal total dengan streak ${input.currentStreak} hari. Terus pertahankan!`,
      emoji:       '📊',
      stat_value:  input.weekMoodAvg.toFixed(1),
      stat_label:  'rata-rata mood minggu ini',
      action_label:'Tulis jurnal',
      action_url:  '/journal/new',
      priority:    'medium',
    },
    {
      category:    'growth_reflection',
      title:       'Perjalananmu sejauh ini',
      body:        `${name} sudah menulis ${input.journalCount} jurnal! Setiap tulisan adalah langkah nyata menuju pemahaman diri yang lebih dalam. Streak ${input.currentStreak} hari membuktikan komitmenmu.`,
      emoji:       '🌱',
      stat_value:  String(input.currentStreak),
      stat_label:  'hari streak berturut-turut',
      action_label:null,
      action_url:  null,
      priority:    'low',
    },
    {
      category:    'emotion_trend',
      title:       'Emosi yang paling terasa',
      body:        input.topEmotions.length > 0
        ? `Emosi yang paling sering kamu rasakan: ${input.topEmotions.slice(0, 3).join(', ')}. Mengenali emosi adalah langkah pertama menuju kecerdasan emosional yang lebih tinggi.`
        : 'Mulai tulis lebih banyak jurnal untuk mendapatkan insight tentang pola emosimu.',
      emoji:       '💭',
      stat_value:  null,
      stat_label:  null,
      action_label:'Tulis jurnal',
      action_url:  '/journal/new',
      priority:    'high',
    },
  ]
}
