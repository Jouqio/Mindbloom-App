// ============================================================
// MindBloom — Analytics API Route
// File: src/app/api/analytics/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type {
  AnalyticsData, MoodDataPoint, EmotionFrequency,
  HabitPerformance, MonthlyHeatmapDay, WeeklySummary,
} from '@/types/analytics'

const EMOTION_CATEGORY_MAP: Record<string, 'positive' | 'neutral' | 'negative'> = {
  senang: 'positive', bersyukur: 'positive', tenang: 'positive',
  terinspirasi: 'positive', semangat: 'positive', bangga: 'positive',
  damai: 'positive', cinta: 'positive',
  'biasa saja': 'neutral', bingung: 'neutral', penasaran: 'neutral', lelah: 'neutral',
  sedih: 'negative', frustrasi: 'negative', cemas: 'negative',
  stres: 'negative', overthinking: 'negative', kesepian: 'negative',
  marah: 'negative', kecewa: 'negative',
}

const EMOTION_CHART_COLORS: Record<string, string> = {
  senang:'#1D9E75',bersyukur:'#0F6E56',tenang:'#378ADD',terinspirasi:'#7F77DD',
  semangat:'#EF9F27',bangga:'#4ADE80',damai:'#059669',cinta:'#D4537E',
  'biasa saja':'#888780',bingung:'#B4B2A9',penasaran:'#534AB7',lelah:'#5F5E5A',
  sedih:'#3C3489',frustrasi:'#D85A30',cemas:'#EF9F27',stres:'#E24B4A',
  overthinking:'#D4537E',kesepian:'#888780',marah:'#791F1F',kecewa:'#633806',
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') ?? '30d') as '7d' | '30d' | '90d'
    const days   = period === '7d' ? 7 : period === '30d' ? 30 : 90

    const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]

    // ── Parallel data fetch ────────────────────────────────
    const [
      journalsRes, emotionsRes, habitsRes, habitLogsRes, streakRes,
    ] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('entry_date,mood_score,energy_score,stress_intensity,is_draft')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .eq('is_draft', false)
        .gte('entry_date', since)
        .order('entry_date', { ascending: true }),

      supabase
        .from('journal_emotions')
        .select('emotion, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - days * 86400000).toISOString()),

      supabase
        .from('habits')
        .select('id, name, emoji, color')
        .eq('user_id', user.id)
        .eq('is_archived', false),

      supabase
        .from('habit_logs')
        .select('habit_id, log_date, completed')
        .eq('user_id', user.id)
        .gte('log_date', since),

      supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    const journals  = journalsRes.data  ?? []
    const emotions  = emotionsRes.data  ?? []
    const habits    = habitsRes.data    ?? []
    const habitLogs = habitLogsRes.data ?? []

    // ── 1. Mood trend (daily) ──────────────────────────────
    const moodTrend: MoodDataPoint[] = journals.map((j: any) => {
      const d = new Date(j.entry_date + 'T00:00:00')
      return {
        date:   j.entry_date,
        label:  d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        mood:   j.mood_score ?? null,
        energy: j.energy_score !== null ? Math.round(j.energy_score / 10) : null,
        stress: j.stress_intensity ?? null,
      }
    })

    // ── 2. Emotion frequency ───────────────────────────────
    const emotionCounts: Record<string, number> = {}
    for (const e of emotions) {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] ?? 0) + 1
    }
    const emotionList: EmotionFrequency[] = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([emotion, count]) => ({
        emotion,
        count,
        category: EMOTION_CATEGORY_MAP[emotion.toLowerCase()] ?? 'neutral',
        color:    EMOTION_CHART_COLORS[emotion.toLowerCase()] ?? '#888780',
      }))

    // ── 3. Habit performance with mood correlation ─────────
    const moodByDate = new Map(journals.map((j: any) => [j.entry_date, j.mood_score]))

    const habitPerformance: HabitPerformance[] = habits.map((h: any) => {
      const logs    = habitLogs.filter((l: any) => l.habit_id === h.id)
      const done    = logs.filter((l: any) => l.completed)
      const skipped = logs.filter((l: any) => !l.completed)

      const doneWithMood    = done.map((l: any) => moodByDate.get(l.log_date)).filter((m): m is number => m != null)
      const skippedWithMood = skipped.map((l: any) => moodByDate.get(l.log_date)).filter((m): m is number => m != null)

      const avgDone    = doneWithMood.length > 0 ? doneWithMood.reduce((a, b) => a + b, 0) / doneWithMood.length : null
      const avgSkipped = skippedWithMood.length > 0 ? skippedWithMood.reduce((a, b) => a + b, 0) / skippedWithMood.length : null

      const completedDays = done.length
      const totalDays     = logs.length || days

      return {
        habit_id:          h.id,
        habit_name:        h.name,
        emoji:             h.emoji,
        color:             h.color,
        completed_days:    completedDays,
        total_days:        totalDays,
        completion_pct:    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
        avg_mood_on_done:  avgDone    !== null ? Math.round(avgDone * 10) / 10 : null,
        avg_mood_on_skip:  avgSkipped !== null ? Math.round(avgSkipped * 10) / 10 : null,
        mood_boost:        avgDone !== null && avgSkipped !== null
          ? Math.round((avgDone - avgSkipped) * 10) / 10
          : null,
      }
    }).sort((a, b) => b.completion_pct - a.completion_pct)

    // ── 4. Heatmap (calendar) ─────────────────────────────
    const journalMap = new Map(journals.map((j: any) => [j.entry_date, j]))
    const heatmap: MonthlyHeatmapDay[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d    = new Date(Date.now() - i * 86400000)
      const date = d.toISOString().split('T')[0]
      const j    = journalMap.get(date)
      heatmap.push({
        date,
        mood_score:   j?.mood_score   ?? null,
        has_entry:    !!j,
        energy_score: j?.energy_score ?? null,
      })
    }

    // ── 5. Weekly summaries ────────────────────────────────
    const weeklySummaries: WeeklySummary[] = []
    const weekCount = Math.ceil(days / 7)
    for (let w = 0; w < weekCount; w++) {
      const weekEnd   = new Date(Date.now() - w * 7 * 86400000)
      const weekStart = new Date(weekEnd.getTime() - 6 * 86400000)
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weekEndStr   = weekEnd.toISOString().split('T')[0]

      const weekJournals = journals.filter((j: any) =>
        j.entry_date >= weekStartStr && j.entry_date <= weekEndStr
      )
      if (weekJournals.length === 0) continue

      const moods = weekJournals.map((j: any) => j.mood_score).filter((m: any) => m != null)
      const avgMood = moods.length > 0 ? moods.reduce((a: number, b: number) => a + b, 0) / moods.length : null

      const weekEmotions: Record<string, number> = {}
      emotions
        .filter((e: any) => e.created_at >= weekStart.toISOString() && e.created_at <= weekEnd.toISOString())
        .forEach((e: any) => { weekEmotions[e.emotion] = (weekEmotions[e.emotion] ?? 0) + 1 })
      const topEmotion = Object.entries(weekEmotions).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

      const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

      weeklySummaries.push({
        week_label:       `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`,
        avg_mood:         avgMood !== null ? Math.round(avgMood * 10) / 10 : null,
        entries_written:  weekJournals.length,
        top_emotion:      topEmotion,
        streak_gained:    weekJournals.length,
        habits_completed: habitLogs.filter((l: any) => l.completed && l.log_date >= weekStartStr && l.log_date <= weekEndStr).length,
        total_habits:     habits.length * 7,
      })
    }

    // ── 6. Summary stats ───────────────────────────────────
    const allMoods   = journals.map((j: any) => j.mood_score).filter((m: any) => m != null)
    const allEnergy  = journals.map((j: any) => j.energy_score).filter((e: any) => e != null)
    const avgMood    = allMoods.length  > 0 ? allMoods.reduce((a: number, b: number) => a + b, 0) / allMoods.length   : null
    const avgEnergy  = allEnergy.length > 0 ? allEnergy.reduce((a: number, b: number) => a + b, 0) / allEnergy.length : null

    const result: AnalyticsData = {
      period,
      moodTrend,
      emotions:        emotionList,
      habits:          habitPerformance,
      heatmap,
      weeklySummaries: weeklySummaries.reverse(), // oldest first
      totalEntries:    journals.length,
      avgMood:         avgMood  !== null ? Math.round(avgMood  * 10) / 10 : null,
      avgEnergy:       avgEnergy !== null ? Math.round(avgEnergy * 10) / 10 : null,
      streakCurrent:   streakRes.data?.current_streak ?? 0,
    }

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('[GET /api/analytics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
