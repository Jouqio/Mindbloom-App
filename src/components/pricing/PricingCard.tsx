// ============================================================
// MindBloom — Pricing Components
// File: src/components/pricing/PricingCard.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, X } from 'lucide-react'
import {
  PLAN_DEFINITIONS, PLAN_FEATURES, formatIDR, getYearlySavingsPct,
  isFeatureIncluded, type PlanId, type BillingCycle,
} from '@/types/subscription'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// 1. BILLING CYCLE TOGGLE
// ────────────────────────────────────────────────────────────
export function BillingToggle({
  cycle, onChange,
}: {
  cycle:    BillingCycle
  onChange: (c: BillingCycle) => void
}) {
  const savings = getYearlySavingsPct(PLAN_DEFINITIONS.premium)

  return (
    <div className="flex items-center justify-center gap-3">
      <span className={cn('text-sm font-medium', cycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
        Bulanan
      </span>
      <button
        onClick={() => onChange(cycle === 'monthly' ? 'yearly' : 'monthly')}
        className="relative h-7 w-14 rounded-full bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Ganti siklus tagihan"
        aria-pressed={cycle === 'yearly'}
      >
        <motion.div
          className="absolute top-0.5 h-6 w-6 rounded-full bg-primary shadow-sm"
          animate={{ left: cycle === 'yearly' ? 30 : 2 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </button>
      <span className={cn('text-sm font-medium flex items-center gap-1.5', cycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground')}>
        Tahunan
        <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">
          Hemat {savings}%
        </span>
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// 2. PRICING CARD
// ────────────────────────────────────────────────────────────
interface PricingCardProps {
  planId:       PlanId
  billingCycle: BillingCycle
  currentPlan:  PlanId
  isTrialing:   boolean
  onSelect:     (planId: PlanId) => void
  isProcessing: boolean
}

export function PricingCard({
  planId, billingCycle, currentPlan, isTrialing, onSelect, isProcessing,
}: PricingCardProps) {
  const plan = PLAN_DEFINITIONS[planId]
  const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
  const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly

  const isCurrent = currentPlan === planId
  const isDowngrade = (currentPlan === 'pro' && planId !== 'pro') ||
    (currentPlan === 'premium' && planId === 'free')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex flex-col rounded-3xl border-2 p-6 transition-all',
        plan.popular ? 'border-primary shadow-lg scale-[1.02]' : 'border-border'
      )}
      style={{ background: plan.popular ? 'linear-gradient(180deg, rgba(127,119,221,0.03) 0%, transparent 100%)' : undefined }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-white">
          PALING POPULER
        </div>
      )}

      {/* Header */}
      <div className="mb-4 text-center">
        <div className="mb-2 text-3xl" aria-hidden="true">{plan.emoji}</div>
        <h3 className="text-lg font-medium text-foreground">{plan.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-5 text-center">
        {price === 0 ? (
          <p className="text-3xl font-medium text-foreground">Gratis</p>
        ) : (
          <>
            <p className="text-3xl font-medium text-foreground">
              {formatIDR(monthlyEquivalent)}
              <span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </p>
            {billingCycle === 'yearly' && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatIDR(price)} ditagih per tahun
              </p>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(planId)}
        disabled={isCurrent || isProcessing || planId === 'free'}
        className={cn(
          'mb-5 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isCurrent
            ? 'bg-secondary text-muted-foreground cursor-default'
            : planId === 'free'
            ? 'bg-secondary text-muted-foreground cursor-default'
            : plan.popular
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'bg-foreground text-background hover:opacity-85',
          'disabled:opacity-60'
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isCurrent ? (
          isTrialing ? 'Sedang Trial' : 'Paket Saat Ini'
        ) : (
          plan.cta
        )}
      </button>

      {/* Features */}
      <div className="flex-1 space-y-2.5">
        {PLAN_FEATURES.map((f) => {
          const value = f[planId]
          const included = isFeatureIncluded(value)
          return (
            <div key={f.label} className="flex items-start gap-2">
              {included ? (
                <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" aria-hidden="true" />
              ) : (
                <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40" aria-hidden="true" />
              )}
              <span className={cn('text-xs', included ? 'text-foreground' : 'text-muted-foreground/50')}>
                {f.label}
                {typeof value === 'string' && (
                  <span className="ml-1 font-medium" style={{ color: plan.color }}>
                    ({value})
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
