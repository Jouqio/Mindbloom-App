// ============================================================
// MindBloom — Monthly Narrative Generator
// File: src/lib/vault/narrativeGenerator.ts
// ============================================================

import OpenAI from 'openai'
import type { VaultEntry } from '@/types/vault'
import { MONTH_NAMES_ID } from '@/types/vault'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface NarrativeInput {
  userName:    string | null
  year:        number
  month:       number
  entries:     VaultEntry[]
  avgMood:     number | null
  topEmotions: string[]
  streak:      number
}

// ── Build prompt ──────────────────────────────────────────────
function buildNarrativePrompt(input: NarrativeInput): string {
  const monthName = MONTH_NAMES_ID[input.month - 1]
  const name      = input.userName ?? 'kamu'

  const storySamples = input.entries
    .filter((e) => e.main_story && e.main_story.length > 30)
    .slice(0, 5)
    .map((e) => {
      const d = new Date(e.entry_date + 'T00:00:00')
      return `[${d.getDate()} ${monthName}] "${e.main_story!.slice(0, 150)}"`
    })
    .join('\n')

  const gratitudeSamples = input.entries
    .flatMap((e) => e.gratitude_items)
    .filter((g) => g.trim().length > 0)
    .slice(0, 6)
    .map((g) => `"${g}"`)
    .join(', ')

  const compassionSamples = input.entries
    .filter((e) => e.self_compassion && e.self_compassion.length > 20)
    .slice(0, 2)
    .map((e) => `"${e.self_compassion!.slice(0, 100)}"`)
    .join('\n')

  return `
Kamu adalah penulis yang membantu membuat "buku kenangan" bulanan dari jurnal harian seseorang.

DATA BULAN ${monthName.toUpperCase()} ${input.year} — ${name}:
- Jumlah jurnal ditulis: ${input.entries.length}
- Rata-rata mood: ${input.avgMood?.toFixed(1) ?? 'tidak ada data'}/10
- Emosi paling sering: ${input.topEmotions.join(', ') || 'tidak ada data'}

CUPLIKAN CERITA:
${storySamples || 'Tidak ada cerita yang cukup panjang.'}

BUTIR SYUKUR BULAN INI:
${gratitudeSamples || 'Tidak ada.'}

PESAN BELAS KASIH DIRI:
${compassionSamples || 'Tidak ada.'}

TUGAS:
Buat 3 bagian dalam format JSON berikut (respons HANYA JSON, tidak ada penjelasan lain):
{
  "narrative": "Narasi prosa 3-4 paragraf yang indah dan bermakna tentang bulan ini. Tulis dalam orang kedua ('kamu'). Gunakan detail spesifik dari cuplikan cerita. Hangat, reflektif, dan menghargai perjalanan ${name}.",
  "highlights": ["highlight 1 — kalimat singkat", "highlight 2", "highlight 3", "highlight 4"],
  "mood_summary": "Frasa pendek 4-6 kata yang menggambarkan bulan ini, misal: 'Bulan penuh keberanian' atau 'Menemukan ketenangan di tengah badai'"
}

ATURAN:
- Bahasa Indonesia yang puitis tapi tidak lebay
- Gunakan detail SPESIFIK dari data (tanggal, emosi, kutipan singkat)
- Narrative harus terasa personal, bukan template
- Highlights harus konkret dan bermakna
- Respons HANYA JSON valid
  `.trim()
}

// ── Main generator ────────────────────────────────────────────
export async function generateMonthlyNarrative(
  input: NarrativeInput
): Promise<{
  narrative:    string
  highlights:   string[]
  mood_summary: string
}> {
  try {
    const completion = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      messages:    [{ role: 'user', content: buildNarrativePrompt(input) }],
      max_tokens:  1000,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)

    return {
      narrative:    parsed.narrative    ?? fallbackNarrative(input),
      highlights:   Array.isArray(parsed.highlights) ? parsed.highlights : [],
      mood_summary: parsed.mood_summary ?? 'Bulan yang penuh cerita',
    }
  } catch (err) {
    console.error('[generateMonthlyNarrative] error:', err)
    return {
      narrative:    fallbackNarrative(input),
      highlights:   [],
      mood_summary: 'Bulan yang penuh cerita',
    }
  }
}

function fallbackNarrative(input: NarrativeInput): string {
  const monthName = MONTH_NAMES_ID[input.month - 1]
  const name      = input.userName ?? 'kamu'
  return `${monthName} ${input.year} adalah bulan yang kamu jalani dengan ${input.entries.length} refleksi tertulis. Rata-rata moodmu bulan ini adalah ${input.avgMood?.toFixed(1) ?? 'tidak tercatat'}/10, dan emosi yang paling sering hadir adalah ${input.topEmotions.slice(0,3).join(', ') || 'beragam perasaan'}. Setiap jurnal yang ${name} tulis adalah bentuk keberanian kecil — untuk jujur, untuk hadir, untuk tumbuh.`
}
