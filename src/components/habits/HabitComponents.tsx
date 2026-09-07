// ============================================================
// MindBloom — Habit Components
// File: src/components/habits/HabitComponents.tsx
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, MoreVertical, Edit2, Archive } from 'lucide-react'
import { useState } from 'react'
import {
  HABIT_CATEGORIES, FREQUENCY_LABELS, isExpectedDay,
  type HabitWithTodayLog, type HabitCategory,
} from '@/types/habit'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// 1. HABIT CARD
// ────────────────────────────────────────────────────────────
interface HabitCardProps {
  habit:    HabitWithTodayLog
  onCheckIn:(id: string) => void
  onEdit:   (h: HabitWithTodayLog) => void
  onArchive:(id: string) => void
  index?:   number
}

export function HabitCard({ habit, onCheckIn, onEdit, onArchive, index = 0 }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const cat = HABIT_CATEGORIES[habit.category]
  const isDone = habit.today_log?.completed ?? false
  const expectedToday = isExpectedDay(habit.frequency, habit.custom_days)
  const isCountable = habit.target_count > 1
  const currentCount = habit.today_log?.count ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        'relative rounded-2xl border p-4 transition-all',
        !expectedToday && 'opacity-50',
        isDone ? 'border-transparent' : 'border-border bg-background'
      )}
      style={isDone ? { background: cat.bg, borderColor: habit.color + '40' } : undefined}
    >
      <div className="flex items-center gap-3">
        {/* Check button */}
        <motion.button
          onClick={() => expectedToday && onCheckIn(habit.id)}
          disabled={!expectedToday}
          whileTap={expectedToday ? { scale: 0.9 } : {}}
          className={cn(
            'relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !expectedToday && 'cursor-not-allowed'
          )}
          style={{
            background: isDone ? habit.color : cat.bg,
          }}
          aria-label={`${isDone ? 'Batalkan' : 'Selesaikan'} ${habit.name}`}
          aria-pressed={isDone}
        >
          <AnimatePresence mode="wait">
            {isDone ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Check className="h-6 w-6 text-white" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.span key="emoji" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                {habit.emoji}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium truncate', isDone ? 'text-foreground' : 'text-foreground')}>
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {habit.current_streak > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-amber-500">
                <Flame className="h-3 w-3" aria-hidden="true" />
                {habit.current_streak}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {!expectedToday ? 'Tidak terjadwal hari ini' : FREQUENCY_LABELS[habit.frequency]}
            </span>
          </div>
        </div>

        {/* Countable progress (e.g. "5/8 gelas") */}
        {isCountable && expectedToday && (
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-medium text-foreground">
              {currentCount}/{habit.target_count}
            </p>
            <p className="text-[10px] text-muted-foreground">{habit.unit}</p>
          </div>
        )}

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Menu habit"
            aria-expanded={showMenu}
          >
            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1,    y: 0  }}
                  exit={{   opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-background shadow-md"
                  role="menu"
                >
                  <button
                    onClick={() => { onEdit(habit); setShowMenu(false) }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="h-3 w-3" aria-hidden="true" /> Edit
                  </button>
                  <button
                    onClick={() => { onArchive(habit.id); setShowMenu(false) }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Archive className="h-3 w-3" aria-hidden="true" /> Arsipkan
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. CATEGORY FILTER
// ────────────────────────────────────────────────────────────
export function CategoryFilter({
  active, onChange,
}: {
  active:   HabitCategory | 'all'
  onChange: (c: HabitCategory | 'all') => void
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
      <button
        role="tab"
        aria-selected={active === 'all'}
        onClick={() => onChange('all')}
        className={cn(
          'flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
          active === 'all' ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
        )}
      >
        Semua
      </button>
      {(Object.entries(HABIT_CATEGORIES) as [HabitCategory, typeof HABIT_CATEGORIES[HabitCategory]][]).map(([key, cfg]) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={cn(
            'flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            active === key ? 'text-white' : 'bg-secondary text-muted-foreground'
          )}
          style={active === key ? { background: cfg.color } : undefined}
        >
          <span aria-hidden="true">{cfg.emoji}</span>
          {cfg.label}
        </button>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 3. DAILY PROGRESS SUMMARY
// ────────────────────────────────────────────────────────────
export function HabitProgressSummary({ habits }: { habits: HabitWithTodayLog[] }) {
  const expectedToday = habits.filter((h) => isExpectedDay(h.frequency, h.custom_days))
  const completed     = expectedToday.filter((h) => h.today_log?.completed)
  const pct = expectedToday.length > 0
    ? Math.round((completed.length / expectedToday.length) * 100)
    : 0

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Progress Hari Ini</p>
          <p className="text-xs text-muted-foreground">
            {completed.length} dari {expectedToday.length} habit selesai
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-medium text-primary">{pct}%</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  )
}
