// ============================================================
// MindBloom — Bloom AI Persona & System Prompt
// File: src/lib/coach/bloomPersona.ts
// ============================================================

import type { CoachContextData, BloomTone } from '@/types/coach'

// ── Bloom's core identity ─────────────────────────────────────
const BLOOM_IDENTITY = `
Kamu adalah Bloom, AI Reflection Coach dari MindBloom — teman refleksi yang empatik, penuh perhatian, dan tidak pernah menghakimi.

KEPRIBADIAN BLOOM:
- Hangat seperti sahabat terbaik yang selalu ada
- Bijaksana seperti terapis yang berpengalaman, tapi tidak bersikap klinis
- Jujur dan apa adanya, tidak basa-basi atau berlebihan
- Menggunakan bahasa Indonesia yang natural dan tidak kaku
- Sesekali menyisipkan emoji yang relevan (tidak berlebihan)
- Membalas dengan panjang yang sesuai — singkat jika topiknya ringan, mendalam jika emosional

PRINSIP BLOOM:
1. DENGARKAN DULU — Validasi perasaan sebelum memberi saran
2. TIDAK MENGHAKIMI — Apapun yang diceritakan user, Bloom tidak mengkritik
3. BERBASIS DATA — Gunakan data jurnal user untuk insight yang personal
4. MENDORONG AGENSI — Bantu user menemukan jawaban sendiri, bukan dikte
5. SADAR BATAS — Jika ada indikasi krisis mental serius, sarankan profesional
6. PERSONAL — Gunakan nama user dan referensikan hal-hal spesifik dari jurnalnya

YANG TIDAK BOLEH DILAKUKAN:
- Jangan berpura-pura menjadi manusia jika ditanya langsung
- Jangan memberikan diagnosis medis atau psikologis
- Jangan menjanjikan kesembuhan atau perubahan instan
- Jangan terlalu banyak bertanya dalam satu respons (maksimal 1-2 pertanyaan)
- Jangan menggunakan bahasa Inggris kecuali ada istilah teknis yang tidak ada padanannya
`.trim()

// ── Context formatter ─────────────────────────────────────────
function formatContext(ctx: CoachContextData): string {
  const parts: string[] = []

  if (ctx.userName) {
    parts.push(`NAMA USER: ${ctx.userName}`)
  }

  if (ctx.currentStreak > 0 || ctx.totalJournals > 0) {
    parts.push(`STATISTIK JURNAL:
- Streak saat ini: ${ctx.currentStreak} hari berturut-turut
- Total jurnal: ${ctx.totalJournals} jurnal ditulis`)
  }

  if (ctx.recentMoods.length > 0) {
    const moodSummary = ctx.recentMoods
      .slice(0, 7)
      .map((m) => `${m.date}: ${m.category} (${m.score}/10)`)
      .join(', ')
    parts.push(`MOOD 7 HARI TERAKHIR: ${moodSummary}`)
  }

  if (ctx.topEmotions.length > 0) {
    parts.push(`EMOSI YANG SERING MUNCUL: ${ctx.topEmotions.join(', ')}`)
  }

  if (ctx.recentJournals.length > 0) {
    const journalSummary = ctx.recentJournals
      .slice(0, 3)
      .map((j) => `[${j.date}] "${j.snippet}"`)
      .join('\n')
    parts.push(`CUPLIKAN JURNAL TERBARU:\n${journalSummary}`)
  }

  if (ctx.habitSummary.length > 0) {
    const habitText = ctx.habitSummary
      .map((h) => `${h.name}: streak ${h.streak} hari${h.completedToday ? ' ✓ selesai hari ini' : ''}`)
      .join(', ')
    parts.push(`HABIT AKTIF: ${habitText}`)
  }

  if (ctx.lifeWheelLatest) {
    const dims = Object.entries(ctx.lifeWheelLatest)
      .sort((a, b) => a[1] - b[1])
    const lowest  = dims.slice(0, 2).map(([k, v]) => `${k}(${v})`).join(', ')
    const highest = dims.slice(-2).map(([k, v]) => `${k}(${v})`).join(', ')
    parts.push(`LIFE WHEEL: dimensi terendah: ${lowest} | dimensi tertinggi: ${highest}`)
  }

  return parts.length > 0
    ? `\nDATA PERSONAL USER (GUNAKAN UNTUK KONTEKS, JANGAN SEBUT SECARA LANGSUNG KECUALI RELEVAN):\n${parts.join('\n')}`
    : ''
}

// ── Tone modifier ─────────────────────────────────────────────
function getToneModifier(tone: BloomTone): string {
  switch (tone) {
    case 'analytical':
      return '\nGAYA SAAT INI: Lebih analitis dan terstruktur. Gunakan data dan pola untuk insight.'
    case 'coaching':
      return '\nGAYA SAAT INI: Lebih coaching dan action-oriented. Bantu user membuat rencana konkret.'
    default: // warm
      return '\nGAYA SAAT INI: Hangat dan empatik. Prioritaskan validasi emosi.'
  }
}

// ── Main system prompt builder ────────────────────────────────
export function buildBloomSystemPrompt(
  ctx:  CoachContextData,
  tone: BloomTone = 'warm'
): string {
  return [
    BLOOM_IDENTITY,
    getToneModifier(tone),
    formatContext(ctx),
    '\nMulailah respons dengan langsung menjawab — tidak perlu perkenalan ulang jika sudah ada percakapan sebelumnya.',
  ].join('\n')
}

// ── Opening greeting builder ──────────────────────────────────
export function buildBloomGreeting(ctx: CoachContextData): string {
  const name = ctx.userName ?? 'kamu'
  const hour = new Date().getHours()

  const timeGreet =
    hour < 5  ? 'Masih terjaga nih' :
    hour < 11 ? 'Selamat pagi' :
    hour < 15 ? 'Selamat siang' :
    hour < 18 ? 'Selamat sore' :
                'Selamat malam'

  const streakNote = ctx.currentStreak >= 3
    ? ` Streak ${ctx.currentStreak} harimu luar biasa — konsistensimu menginspirasi.`
    : ctx.totalJournals === 0
    ? ' Senang kamu di sini! Aku siap menemani perjalanan refleksimu.'
    : ''

  const moodNote = ctx.recentMoods.length > 0
    ? (() => {
        const avg = ctx.recentMoods.reduce((s, m) => s + m.score, 0) / ctx.recentMoods.length
        if (avg >= 7) return ' Dari jurnalmu, sepertinya kamu sedang dalam kondisi yang cukup baik!'
        if (avg <= 4) return ' Aku lihat beberapa hari terakhir cukup berat untukmu. Aku di sini.'
        return ''
      })()
    : ''

  return `${timeGreet}, ${name}! 🌱${streakNote}${moodNote}\n\nAda yang ingin kamu ceritakan atau refleksikan hari ini?`
}
