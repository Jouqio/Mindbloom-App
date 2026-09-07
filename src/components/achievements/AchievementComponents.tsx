// ============================================================
// MindBloom — Achievement Components
// File: src/components/achievements/AchievementComponents.tsx
// Contains: AchievementCard, XPBar, StreakWidget, BadgeGrid
// ============================================================

'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, TrendingUp, Lock } from 'lucide-react'
import {
  RARITY_CONFIG,
  XP_LEVELS,
  getLevelFromXP,
  type AchievementDefinition,
  type UserAchievement,
  type UserXP,
  type StreakData,
} from '@/types/achievement'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// 1. ACHIEVEMENT CARD
// ────────────────────────────────────────────────────────────
interface AchievementCardProps {
  definition: AchievementDefinition
  earned:     boolean
  earnedAt?:  string
  index?:     number
}

export function AchievementCard({
  definition, earned, earnedAt, index = 0,
}: AchievementCardProps) {
  const rarity = RARITY_CONFIG[definition.rarity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        'relative rounded-2xl border p-4 transition-all',
        earned
          ? 'bg-background hover:shadow-md cursor-default'
          : 'bg-secondary/30 opacity-50'
      )}
      style={earned ? { borderColor: rarity.border } : undefined}
    >
      {/* Glow effect for earned */}
      {earned && (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `0 0 20px ${rarity.glow}`,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center',
            'rounded-xl text-2xl transition-transform',
            earned ? 'shadow-sm' : 'grayscale opacity-40'
          )}
          style={earned ? { background: rarity.bg } : { background: '#F1F5F9' }}
          aria-hidden="true"
        >
          {earned ? definition.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn(
              'text-sm font-medium',
              earned ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {definition.name}
            </p>
            {/* Rarity badge */}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium flex-shrink-0"
              style={{ background: rarity.bg, color: rarity.color }}
            >
              {rarity.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {definition.description}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-500">
              +{definition.xp_reward} XP
            </span>
            {earned && earnedAt && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(earnedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. XP PROGRESS BAR
// ────────────────────────────────────────────────────────────
interface XPBarProps {
  xp:        UserXP | null
  className?: string
  compact?:  boolean
}

export function XPBar({ xp, className, compact = false }: XPBarProps) {
  const totalXP     = xp?.total_xp ?? 0
  const { currentLevel, nextLevel, xpInCurrentLevel, xpNeededForNext, progressPct } =
    getLevelFromXP(totalXP)

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-base" aria-hidden="true">{currentLevel.emoji}</span>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: currentLevel.color }}>
              Lv.{currentLevel.level} {currentLevel.title}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {totalXP} XP
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: [0, 0, 0.2, 1], delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: currentLevel.color }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{currentLevel.emoji}</span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Level {currentLevel.level} — {currentLevel.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalXP} XP total
            </p>
          </div>
        </div>
        {nextLevel && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Berikutnya</p>
            <p className="text-xs font-medium" style={{ color: nextLevel.color }}>
              {nextLevel.emoji} Lv.{nextLevel.level}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-1.5 h-2.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`XP Progress: ${progressPct}%`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 1.2, ease: [0, 0, 0.2, 1], delay: 0.3 }}
          className="h-full rounded-full"
          style={{ background: currentLevel.color }}
        />
      </div>

      {/* XP numbers */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{xpInCurrentLevel} XP</span>
        {nextLevel ? (
          <span>{xpNeededForNext - xpInCurrentLevel} XP lagi ke Lv.{nextLevel.level}</span>
        ) : (
          <span>Level maksimum! 🎉</span>
        )}
      </div>

      {/* Level milestones */}
      <div className="mt-3 flex gap-1">
        {XP_LEVELS.map((lvl) => (
          <div
            key={lvl.level}
            className={cn(
              'flex-1 h-1 rounded-full transition-colors',
              lvl.level <= currentLevel.level ? 'opacity-100' : 'opacity-20'
            )}
            style={{ background: lvl.color }}
            title={`Lv.${lvl.level} ${lvl.title}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 3. STREAK WIDGET
// ────────────────────────────────────────────────────────────
interface StreakWidgetProps {
  streak:    StreakData | null
  compact?:  boolean
  className?:string
}

export function StreakWidget({ streak, compact = false, className }: StreakWidgetProps) {
  const current = streak?.current_streak ?? 0
  const longest = streak?.longest_streak ?? 0
  const total   = streak?.total_entries  ?? 0

  const getStreakEmoji = (days: number) => {
    if (days === 0) return '💤'
    if (days < 3)  return '🔥'
    if (days < 7)  return '🔥'
    if (days < 14) return '⚡'
    if (days < 30) return '💪'
    if (days < 60) return '🌟'
    return '👑'
  }

  const getStreakColor = (days: number) => {
    if (days === 0) return '#888780'
    if (days < 7)  return '#EF9F27'
    if (days < 30) return '#D85A30'
    return '#E24B4A'
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Flame
          className="h-4 w-4"
          style={{ color: getStreakColor(current) }}
          aria-hidden="true"
        />
        <span
          className="text-sm font-medium"
          style={{ color: getStreakColor(current) }}
          aria-label={`${current} hari streak`}
        >
          {current}
        </span>
        <span className="text-xs text-muted-foreground">hari</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-amber-500" aria-hidden="true" />
        <h3 className="text-sm font-medium text-foreground">Streak Harian</h3>
      </div>

      {/* Main streak number */}
      <div className="mb-4 flex items-end gap-2">
        <motion.span
          key={current}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          className="text-4xl font-medium leading-none"
          style={{ color: getStreakColor(current) }}
          aria-live="polite"
        >
          {current}
        </motion.span>
        <span className="mb-1 text-sm text-muted-foreground">
          {current === 1 ? 'hari berturut' : 'hari berturut-turut'}
        </span>
        <span className="mb-1 ml-auto text-2xl" aria-hidden="true">
          {getStreakEmoji(current)}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Streak terpanjang</p>
          <p className="text-lg font-medium text-foreground">{longest}</p>
          <p className="text-[10px] text-muted-foreground">hari</p>
        </div>
        <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Total jurnal</p>
          <p className="text-lg font-medium text-foreground">{total}</p>
          <p className="text-[10px] text-muted-foreground">ditulis</p>
        </div>
      </div>

      {/* Next milestone */}
      {current > 0 && (
        <div className="mt-3">
          <NextStreakMilestone current={current} />
        </div>
      )}
    </div>
  )
}

function NextStreakMilestone({ current }: { current: number }) {
  const milestones = [3, 7, 14, 30, 60, 90]
  const next = milestones.find((m) => m > current)
  if (!next) return null

  const pct = Math.round((current / next) * 100)

  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
        <span>Menuju streak {next} hari</span>
        <span>{next - current} hari lagi</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
          className="h-full rounded-full bg-amber-500"
        />
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 4. BADGE GRID (mini overview)
// ────────────────────────────────────────────────────────────
interface BadgeGridProps {
  earned:    UserAchievement[]
  total:     number
  className?:string
}

export function BadgeGrid({ earned, total, className }: BadgeGridProps) {
  const earnedCount = earned.length
  const pct         = total > 0 ? Math.round((earnedCount / total) * 100) : 0

  return (
    <div className={cn('rounded-2xl border border-border bg-background p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Badge</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {earnedCount}/{total} terbuka
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
          className="h-full rounded-full bg-amber-500"
        />
      </div>

      {/* Badge icons */}
      <div className="flex flex-wrap gap-2">
        {earned.slice(0, 8).map((a) => {
          const rarity = RARITY_CONFIG[a.definition.rarity]
          return (
            <motion.div
              key={a.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              title={a.definition.name}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
              style={{ background: rarity.bg, boxShadow: `0 0 8px ${rarity.glow}` }}
              aria-label={a.definition.name}
            >
              {a.definition.icon}
            </motion.div>
          )
        })}
        {earnedCount === 0 && (
          <p className="text-xs text-muted-foreground py-1">
            Selesaikan jurnal pertama untuk mendapat badge! 🌱
          </p>
        )}
        {earnedCount > 8 && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-medium text-muted-foreground">
            +{earnedCount - 8}
          </div>
        )}
      </div>
    </div>
  )
}
