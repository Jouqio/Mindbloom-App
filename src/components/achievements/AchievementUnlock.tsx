// ============================================================
// MindBloom — Achievement Unlock Overlay
// File: src/components/achievements/AchievementUnlock.tsx
// ============================================================

'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { RARITY_CONFIG, type UserAchievement } from '@/types/achievement'
import { cn } from '@/lib/utils'

interface AchievementUnlockProps {
  achievement: UserAchievement | null
  onClose:     () => void
}

// ── Confetti engine ───────────────────────────────────────────
function fireConfetti(colors: string[]) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  for (let i = 0; i < 28; i++) {
    setTimeout(() => {
      const el       = document.createElement('div')
      const isCircle = Math.random() > 0.5
      const color    = colors[Math.floor(Math.random() * colors.length)]
      el.style.cssText = [
        'position:fixed',
        `width:${isCircle ? 7 : 8}px`,
        `height:${isCircle ? 7 : 6}px`,
        `border-radius:${isCircle ? '50%' : '2px'}`,
        `background:${color}`,
        'top:-10px',
        `left:${20 + Math.random() * 60}vw`,
        'z-index:10000',
        'pointer-events:none',
        `animation:mbAchConfetti ${1.8 + Math.random() * 1.4}s ease-in forwards`,
        `transform:rotate(${Math.random() * 360}deg)`,
      ].join(';')
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 3500)
    }, i * 45)
  }
}

// Inject keyframe once
if (typeof document !== 'undefined' && !document.getElementById('mb-ach-confetti-style')) {
  const s = document.createElement('style')
  s.id = 'mb-ach-confetti-style'
  s.textContent = `@keyframes mbAchConfetti{0%{transform:translateY(-10px) rotate(0deg);opacity:1}80%{opacity:.8}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`
  document.head.appendChild(s)
}

// ── Ripple ring ───────────────────────────────────────────────
function RippleRing({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0.7 }}
      animate={{ scale: 2.8, opacity: 0 }}
      transition={{ duration: 0.75, ease: [0, 0, 0.2, 1], delay }}
      className="absolute h-20 w-20 rounded-full border-2"
      style={{ borderColor: color, top: '50%', left: '50%',
        marginTop: '-2.5rem', marginLeft: '-2.5rem', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  const rarity = achievement ? RARITY_CONFIG[achievement.definition.rarity] : null

  // Fire confetti when achievement appears
  useEffect(() => {
    if (!achievement || !rarity) return
    const colors = [rarity.color, rarity.border, '#EF9F27', '#7F77DD', '#1D9E75']
    setTimeout(() => fireConfetti(colors), 200)
  }, [achievement, rarity])

  // ESC to close
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <AnimatePresence>
      {achievement && rarity && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-sm px-4"
            onClick={onClose}
            role="presentation"
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.88, y: 16  }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label={`Achievement terbuka: ${achievement.definition.name}`}
          >
            <div
              className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border-2 bg-background p-6 text-center shadow-xl"
              style={{ borderColor: rarity.border,
                boxShadow: `0 0 40px ${rarity.glow}, 0 20px 40px rgba(0,0,0,.12)` }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>

              {/* Rarity label */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-4"
              >
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: rarity.bg, color: rarity.color }}
                >
                  {rarity.label} Achievement
                </span>
              </motion.div>

              {/* Icon with ripples */}
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                <RippleRing delay={0.1} color={rarity.border} />
                <RippleRing delay={0.25} color={rarity.border} />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
                  style={{ background: rarity.bg,
                    boxShadow: `0 8px 24px ${rarity.glow}` }}
                  aria-hidden="true"
                >
                  {achievement.definition.icon}
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  Achievement Terbuka!
                </p>
                <h2 className="text-xl font-medium text-foreground">
                  {achievement.definition.name}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {achievement.definition.description}
                </p>
              </motion.div>

              {/* XP reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{ background: rarity.bg }}
              >
                <span className="text-lg" aria-hidden="true">⭐</span>
                <span className="text-sm font-medium" style={{ color: rarity.color }}>
                  +{achievement.definition.xp_reward} XP diperoleh
                </span>
              </motion.div>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Lanjutkan 🌱
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
