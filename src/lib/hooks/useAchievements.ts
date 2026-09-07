// ============================================================
// MindBloom — useAchievements Hook
// File: src/lib/hooks/useAchievements.ts
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAchievementStore } from '@/store/achievementStore'
import {
  ACHIEVEMENT_DEFINITIONS,
  getLevelFromXP,
  type UserAchievement,
  type StreakData,
} from '@/types/achievement'

export function useAchievements() {
  const store = useAchievementStore()

  // ── Load all data ─────────────────────────────────────────
  const load = useCallback(async () => {
    store.setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [achievementsRes, xpRes, streakRes] = await Promise.all([
        supabase
          .from('user_achievements')
          .select(`
            id, user_id, achievement_id, earned_at, notified,
            achievement_definitions(
              id, slug, name, description, icon, category,
              rarity, condition_type, condition_value, xp_reward,
              is_hidden, sort_order
            )
          `)
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false }),
        supabase
          .from('user_xp')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      if (achievementsRes.data) {
        const mapped: UserAchievement[] = achievementsRes.data
          .filter((a) => a.achievement_definitions)
          .map((a) => ({
            id:             a.id,
            user_id:        a.user_id,
            achievement_id: a.achievement_id,
            earned_at:      a.earned_at,
            notified:       a.notified,
            definition:     a.achievement_definitions as any,
          }))
        store.setAchievements(mapped)
      }

      if (xpRes.data) store.setXP(xpRes.data)

      if (streakRes.data) {
        store.setStreak({
          current_streak:  streakRes.data.current_streak  ?? 0,
          longest_streak:  streakRes.data.longest_streak  ?? 0,
          total_entries:   streakRes.data.total_entries   ?? 0,
          last_entry_date: streakRes.data.last_entry_date ?? null,
        })
      }
    } catch (err) {
      console.error('[useAchievements] load error:', err)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  useEffect(() => {
    load()
    // Realtime: refresh when streaks or user_achievements change
    const supabase = createClient()
    const channel = supabase
      .channel('achievements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_achievements' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_xp' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  // ── Check and award achievements ──────────────────────────
  const checkAchievements = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get current state
    const [streakRes, xpRes, entriesRes, gratitudeRes] = await Promise.all([
      supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_xp').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('journal_entries')
        .select('id, completion_pct', { count: 'exact' })
        .eq('user_id', user.id).eq('is_draft', false),
      supabase.from('gratitude_items')
        .select('entry_id', { count: 'exact' })
        .eq('user_id', user.id),
    ])

    const streak      = streakRes.data
    const xp          = xpRes.data
    const totalEntries = entriesRes.count ?? 0
    const totalGrat   = gratitudeRes.count ?? 0
    const { currentLevel } = getLevelFromXP(xp?.total_xp ?? 0)

    // Get already-earned slugs
    const { data: earned } = await supabase
      .from('user_achievements')
      .select('achievement_definitions(slug)')
      .eq('user_id', user.id)

    const earnedSlugs = new Set(
      (earned ?? []).map((e: any) => e.achievement_definitions?.slug).filter(Boolean)
    )

    // Check each definition
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (earnedSlugs.has(def.slug)) continue

      let shouldAward = false
      switch (def.condition_type) {
        case 'streak_days':
          shouldAward = (streak?.current_streak ?? 0) >= def.condition_value
          break
        case 'total_entries':
          shouldAward = totalEntries >= def.condition_value
          break
        case 'gratitude_entry':
          shouldAward = totalEntries >= 1
          break
        case 'gratitude_items':
          shouldAward = totalGrat >= def.condition_value
          break
        case 'completion_pct':
          shouldAward = entriesRes.data?.some(
            (e: any) => (e.completion_pct ?? 0) >= def.condition_value
          ) ?? false
          break
        case 'xp_level':
          shouldAward = currentLevel.level >= def.condition_value
          break
      }

      if (shouldAward) {
        await awardAchievement(user.id, def.slug)
      }
    }

    await load()
  }, [load])

  return {
    achievements:  store.achievements,
    xp:            store.xp,
    streak:        store.streak,
    pendingUnlock: store.pendingUnlock,
    isLoading:     store.isLoading,
    clearPending:  store.clearPending,
    checkAchievements,
    refetch:       load,
  }
}

// ── Award achievement (server call) ──────────────────────────
async function awardAchievement(userId: string, slug: string): Promise<void> {
  try {
    await fetch('/api/achievements/award', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug }),
    })
  } catch (err) {
    console.error('[awardAchievement] error:', err)
  }
}
