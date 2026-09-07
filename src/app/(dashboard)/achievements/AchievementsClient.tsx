// ============================================================
// MindBloom — Achievements Client Component
// File: src/app/(dashboard)/achievements/AchievementsClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Star, Filter } from 'lucide-react'
import {
  AchievementCard,
  XPBar,
  StreakWidget,
  BadgeGrid,
} from '@/components/achievements/AchievementComponents'
import { AchievementUnlock } from '@/components/achievements/AchievementUnlock'
import { useAchievements } from '@/lib/hooks/useAchievements'
import {
  RARITY_CONFIG,
  type AchievementDefinition,
  type UserAchievement,
  type UserXP,
  type StreakData,
  type AchievementCategory,
} from '@/types/achievement'
import { cn } from '@/lib/utils'

interface Props {
  initialAchievements: any[]
  initialXP:           any
  initialStreak:       any
  allDefinitions:      any[]
}

const CATEGORIES: Array<{ key: AchievementCategory | 'all'; label: string; emoji: string }> = [
  { key: 'all',         label: 'Semua',       emoji: '🏆' },
  { key: 'streak',      label: 'Streak',      emoji: '🔥' },
  { key: 'reflection',  label: 'Refleksi',    emoji: '📝' },
  { key: 'gratitude',   label: 'Syukur',      emoji: '🙏' },
  { key: 'consistency', label: 'Konsistensi', emoji: '💪' },
  { key: 'growth',      label: 'Pertumbuhan', emoji: '🌱' },
  { key: 'emotional',   label: 'Emosional',   emoji: '💛' },
]

export function AchievementsClient({
  initialAchievements, initialXP, initialStreak, allDefinitions,
}: Props) {
  const { achievements, xp, streak, pendingUnlock, clearPending } = useAchievements()
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all')
  const [showOnlyEarned, setShowOnlyEarned] = useState(false)

  // Use realtime data from hook, fallback to server-fetched initial
  const earnedList: UserAchievement[] = achievements.length > 0
    ? achievements
    : initialAchievements.map((a: any) => ({
        id:             a.id,
        user_id:        '',
        achievement_id: a.achievement_id,
        earned_at:      a.earned_at,
        notified:       a.notified,
        definition:     a.achievement_definitions,
      }))

  const currentXP: UserXP | null   = xp    ?? initialXP
  const currentStreak: StreakData | null = streak ?? (initialStreak ? {
    current_streak:  initialStreak.current_streak  ?? 0,
    longest_streak:  initialStreak.longest_streak  ?? 0,
    total_entries:   initialStreak.total_entries   ?? 0,
    last_entry_date: initialStreak.last_entry_date ?? null,
  } : null)

  const earnedIds = new Set(earnedList.map((a) => a.achievement_id))

  // Filter definitions
  const filteredDefs = allDefinitions.filter((def: AchievementDefinition) => {
    if (def.is_hidden && !earnedIds.has(def.id)) return false
    if (activeCategory !== 'all' && def.category !== activeCategory) return false
    if (showOnlyEarned && !earnedIds.has(def.id)) return false
    return true
  })

  const earnedCount = earnedList.length
  const totalDefs   = allDefinitions.filter((d: AchievementDefinition) => !d.is_hidden).length

  return (
    <>
      {/* Achievement unlock overlay */}
      <AchievementUnlock achievement={pendingUnlock} onClose={clearPending} />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
            <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
            Achievement & Streak
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {earnedCount} dari {totalDefs} achievement terbuka
          </p>
        </motion.div>

        {/* Top stats grid */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StreakWidget streak={currentStreak} />
          <XPBar xp={currentXP} />
        </div>

        {/* Badge overview */}
        <div className="mb-5">
          <BadgeGrid earned={earnedList} total={totalDefs} />
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
            role="tablist" aria-label="Filter kategori achievement">
            {CATEGORIES.map(({ key, label, emoji }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeCategory === key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                  'whitespace-nowrap transition-all flex-shrink-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeCategory === key
                    ? 'bg-foreground text-background'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Earned filter toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filteredDefs.length} achievement ditampilkan
            </span>
            <button
              onClick={() => setShowOnlyEarned((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                showOnlyEarned
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <Filter className="h-3 w-3" aria-hidden="true" />
              {showOnlyEarned ? 'Sudah terbuka' : 'Semua'}
            </button>
          </div>
        </div>

        {/* Achievement list */}
        {filteredDefs.length > 0 ? (
          <div className="flex flex-col gap-3" role="list" aria-label="Daftar achievement">
            {filteredDefs.map((def: AchievementDefinition, i: number) => {
              const userAch = earnedList.find((a) => a.achievement_id === def.id)
              return (
                <div key={def.id} role="listitem">
                  <AchievementCard
                    definition={def}
                    earned={!!userAch}
                    earnedAt={userAch?.earned_at}
                    index={i}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-10 text-center">
            <span className="text-4xl" aria-hidden="true">🔍</span>
            <div>
              <p className="text-sm font-medium text-foreground">Tidak ada achievement</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {showOnlyEarned
                  ? 'Kamu belum memiliki achievement di kategori ini.'
                  : 'Tidak ada achievement di kategori ini.'}
              </p>
            </div>
            {showOnlyEarned && (
              <button
                onClick={() => setShowOnlyEarned(false)}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Tampilkan semua achievement
              </button>
            )}
          </div>
        )}

        {/* Hidden achievements hint */}
        {!showOnlyEarned && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center text-xs text-muted-foreground"
          >
            🔒 Beberapa achievement tersembunyi — selesaikan lebih banyak jurnal untuk menemukannya!
          </motion.p>
        )}
      </main>
    </>
  )
}
