// ============================================================
// MindBloom — PDF HTML Builder
// File: src/lib/vault/pdfBuilder.ts
// Generates styled HTML for browser print-to-PDF
// ============================================================

import type { VaultEntry, MonthlyNarrative } from '@/types/vault'
import { MONTH_NAMES_ID } from '@/types/vault'

// ── CSS for print ─────────────────────────────────────────────
const PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Merriweather:ital,wght@0,300;0,400;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a1a1a;
    background: white;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page { max-width: 680px; margin: 0 auto; padding: 40px 48px; }

  /* Cover */
  .cover {
    text-align: center;
    padding: 60px 0 40px;
    border-bottom: 2px solid #E5E3DC;
    margin-bottom: 40px;
  }
  .cover-emoji  { font-size: 60pt; margin-bottom: 16px; }
  .cover-title  { font-family: 'Merriweather', serif; font-size: 24pt; font-weight: 300; color: #1a1a1a; }
  .cover-sub    { font-size: 10pt; color: #888; margin-top: 8px; letter-spacing: 0.08em; text-transform: uppercase; }
  .cover-stats  { display: flex; justify-content: center; gap: 32px; margin-top: 24px; }
  .cover-stat   { text-align: center; }
  .cover-stat-val { font-size: 20pt; font-weight: 600; color: #7F77DD; }
  .cover-stat-lbl { font-size: 8pt; color: #888; margin-top: 2px; }

  /* Narrative */
  .section-title { font-size: 9pt; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7F77DD; margin-bottom: 14px; }
  .narrative-block { margin-bottom: 40px; }
  .narrative-text { font-family: 'Merriweather', serif; font-size: 11pt; font-weight: 300; line-height: 1.9; color: #2a2a2a; }
  .narrative-text p + p { margin-top: 14px; }

  /* Highlights */
  .highlights { margin-bottom: 36px; }
  .highlight-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
  .highlight-dot  { width: 6px; height: 6px; border-radius: 50%; background: #7F77DD; flex-shrink: 0; margin-top: 5px; }
  .highlight-text { font-size: 10.5pt; color: #333; }

  /* Entry */
  .entry { margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid #E5E3DC; }
  .entry:last-child { border-bottom: none; }
  .entry-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .entry-date { font-size: 9pt; font-weight: 600; color: #888; letter-spacing: 0.06em; }
  .entry-mood { font-size: 9pt; font-weight: 500; color: #7F77DD; }
  .entry-field { margin-bottom: 12px; }
  .entry-field-label { font-size: 8pt; font-weight: 600; color: #aaa; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .entry-field-text { font-size: 10.5pt; color: #333; line-height: 1.65; }
  .gratitude-list { list-style: none; }
  .gratitude-list li::before { content: "✓  "; color: #1D9E75; font-weight: 600; }

  .mood-bar-wrap { margin-top: 6px; height: 6px; background: #F0EFEA; border-radius: 3px; }
  .mood-bar { height: 100%; border-radius: 3px; background: linear-gradient(to right, #E24B4A, #EF9F27, #1D9E75); }

  /* Footer */
  .footer { text-align: center; margin-top: 48px; padding-top: 20px; border-top: 1px solid #E5E3DC; }
  .footer-logo { font-size: 16pt; margin-bottom: 6px; }
  .footer-text { font-size: 8pt; color: #bbb; }

  @media print {
    .page { padding: 20px 32px; }
    .cover { padding: 40px 0 30px; }
    @page { margin: 0.6in; }
  }
`

// ── Entry HTML block ──────────────────────────────────────────
function buildEntryHTML(entry: VaultEntry, opts: { mood: boolean; gratitude: boolean; reflections: boolean; prayer: boolean }): string {
  const d       = new Date(entry.entry_date + 'T00:00:00')
  const dateStr = d.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const moodPct = entry.mood_score ? (entry.mood_score / 10) * 100 : 0
  const parts: string[] = []

  if (entry.main_story) {
    parts.push(`
      <div class="entry-field">
        <div class="entry-field-label">Cerita Hari Ini</div>
        <div class="entry-field-text">${entry.main_story.replace(/\n/g, '<br>')}</div>
      </div>`)
  }

  if (entry.happy_moments) {
    parts.push(`
      <div class="entry-field">
        <div class="entry-field-label">Momen Bahagia</div>
        <div class="entry-field-text">${entry.happy_moments.replace(/\n/g, '<br>')}</div>
      </div>`)
  }

  if (opts.gratitude && entry.gratitude_items.length > 0) {
    const items = entry.gratitude_items.filter((g) => g.trim())
    if (items.length > 0) {
      parts.push(`
        <div class="entry-field">
          <div class="entry-field-label">Jurnal Syukur</div>
          <ul class="gratitude-list">
            ${items.map((g) => `<li class="entry-field-text">${g}</li>`).join('')}
          </ul>
        </div>`)
    }
  }

  if (opts.reflections && entry.lessons_learned) {
    parts.push(`
      <div class="entry-field">
        <div class="entry-field-label">Pelajaran</div>
        <div class="entry-field-text">${entry.lessons_learned.replace(/\n/g, '<br>')}</div>
      </div>`)
  }

  if (opts.reflections && entry.self_compassion) {
    parts.push(`
      <div class="entry-field">
        <div class="entry-field-label">Belas Kasih Diri</div>
        <div class="entry-field-text" style="font-style:italic">"${entry.self_compassion.replace(/\n/g, '<br>')}"</div>
      </div>`)
  }

  return `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-date">${dateStr}</div>
        ${opts.mood && entry.mood_score ? `<div class="entry-mood">Mood ${entry.mood_score}/10</div>` : ''}
      </div>
      ${opts.mood && entry.mood_score ? `
        <div class="mood-bar-wrap" style="margin-bottom:14px">
          <div class="mood-bar" style="width:${moodPct}%"></div>
        </div>` : ''}
      ${parts.join('')}
    </div>`
}

// ── Main HTML builder ─────────────────────────────────────────
export function buildPDFHTML(params: {
  entries:   VaultEntry[]
  narrative: MonthlyNarrative | null
  userName:  string | null
  year:      number
  month:     number
  opts:      PDFExportOptions['include']
}): string {
  const { entries, narrative, userName, year, month, opts } = params
  const monthName  = MONTH_NAMES_ID[month - 1]
  const name       = userName ?? 'Pengguna'
  const avgMood    = entries.length > 0
    ? entries.filter((e) => e.mood_score).reduce((s, e) => s + (e.mood_score ?? 0), 0) /
      entries.filter((e) => e.mood_score).length
    : null
  const coverEmoji = avgMood ? (avgMood >= 7 ? '🌟' : avgMood >= 5 ? '🌸' : '🍂') : '📖'

  const coverHTML = `
    <div class="cover">
      <div class="cover-emoji">${coverEmoji}</div>
      <div class="cover-title">${monthName} ${year}</div>
      <div class="cover-sub">Jurnal Refleksi Harian · ${name}</div>
      <div class="cover-stats">
        <div class="cover-stat">
          <div class="cover-stat-val">${entries.length}</div>
          <div class="cover-stat-lbl">Jurnal</div>
        </div>
        ${avgMood ? `<div class="cover-stat">
          <div class="cover-stat-val">${avgMood.toFixed(1)}</div>
          <div class="cover-stat-lbl">Rata-rata Mood</div>
        </div>` : ''}
      </div>
    </div>`

  const narrativeHTML = narrative && opts.narrative ? `
    <div class="narrative-block">
      <div class="section-title">Refleksi Bulan Ini</div>
      <div class="narrative-text">
        ${narrative.narrative.split('\n').map((p) => `<p>${p}</p>`).join('')}
      </div>
    </div>
    ${narrative.highlights.length > 0 ? `
    <div class="highlights">
      <div class="section-title">Sorotan Bulan Ini</div>
      ${narrative.highlights.map((h) => `
        <div class="highlight-item">
          <div class="highlight-dot"></div>
          <div class="highlight-text">${h}</div>
        </div>`).join('')}
    </div>` : ''}` : ''

  const entriesHTML = entries.map((e) => buildEntryHTML(e, opts)).join('')

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jurnal ${monthName} ${year} — ${name}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <div class="page">
    ${coverHTML}
    ${narrativeHTML}
    ${entries.length > 0 ? `
    <div class="section-title" style="margin-bottom:20px">Entri Jurnal</div>
    ${entriesHTML}` : '<p style="color:#888;text-align:center;padding:40px 0">Tidak ada jurnal bulan ini.</p>'}
    <div class="footer">
      <div class="footer-logo">🌱</div>
      <div class="footer-text">Dibuat dengan MindBloom · mindbloom.app</div>
    </div>
  </div>
</body>
</html>`
}

// ── Type re-export ────────────────────────────────────────────
import type { PDFExportOptions } from '@/types/vault'
