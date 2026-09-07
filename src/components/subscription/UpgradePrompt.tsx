// ============================================================
// MindBloom — Upgrade Prompt Component
// File: src/components/subscription/UpgradePrompt.tsx
// Shown when a free user hits a plan limit
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Sparkles, Lock } from 'lucide-react'
import { PLAN_DEFINITIONS } from '@/types/subscription'

interface UpgradePromptProps {
  isOpen:      boolean
  onClose:     () => void
  feature:     string
  description: string
}

export function UpgradePrompt({ isOpen, onClose, feature, description }: UpgradePromptProps) {
  const premium = PLAN_DEFINITIONS.premium

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 8  }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Upgrade untuk ${feature}`}
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-xl"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary transition-colors"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </button>

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Lock className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>

              <h2 className="text-lg font-medium text-foreground">{feature}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>

              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">Upgrade ke {premium.name}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coba gratis 7 hari — batalkan kapan saja
                </p>
              </div>

              <Link
                href="/pricing"
                className="mt-4 block w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Lihat Paket Premium
              </Link>
              <button
                onClick={onClose}
                className="mt-2 w-full rounded-xl px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Nanti saja
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Inline usage limit badge (e.g. "3/3 habit used") ──────────
export function UsageLimitBadge({
  current, limit, label,
}: {
  current: number
  limit:   number  // -1 = unlimited
  label:   string
}) {
  if (limit === -1) return null

  const isAtLimit = current >= limit
  const pct = Math.min(100, (current / limit) * 100)

  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-2.5 py-1.5">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">{label}</span>
          <span className={`text-[10px] font-medium ${isAtLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {current}/{limit}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
