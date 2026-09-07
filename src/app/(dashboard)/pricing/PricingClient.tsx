// ============================================================
// MindBloom — Pricing Client Component
// File: src/app/(dashboard)/pricing/PricingClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { PricingCard, BillingToggle } from '@/components/pricing/PricingCard'
import { useSubscription } from '@/lib/hooks/useSubscription'
import type { PlanId, BillingCycle } from '@/types/subscription'

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [processingPlan, setProcessingPlan] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { effectivePlan, isTrialing, checkout, isLoading } = useSubscription()

  const handleSelect = async (planId: PlanId) => {
    if (planId === 'free') return
    setError(null)
    setProcessingPlan(planId)

    const result = await checkout(planId, billingCycle)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } else {
      setError(result.error ?? 'Terjadi kesalahan')
    }
    setProcessingPlan(null)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 pb-24 md:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Trial 7 hari — tanpa risiko
        </div>
        <h1 className="text-2xl font-medium text-foreground md:text-3xl">
          Pilih paket yang sesuai untukmu
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
          Semua paket termasuk fitur inti MindBloom. Upgrade kapan saja untuk mendapatkan
          AI Coach tanpa batas dan insight yang lebih mendalam.
        </p>
      </motion.div>

      {/* Status messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0 }}
            className="mb-6 mx-auto max-w-md rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-4 py-3 text-center text-sm font-medium text-green-700 dark:text-green-300"
          >
            ✅ Pembayaran berhasil! Selamat menikmati fitur premium.
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0 }}
            className="mb-6 mx-auto max-w-md rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 text-center text-sm text-destructive"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing toggle */}
      <div className="mb-8">
        <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {(['free', 'premium', 'pro'] as PlanId[]).map((planId) => (
          <PricingCard
            key={planId}
            planId={planId}
            billingCycle={billingCycle}
            currentPlan={effectivePlan}
            isTrialing={isTrialing ?? false}
            onSelect={handleSelect}
            isProcessing={processingPlan === planId}
          />
        ))}
      </div>

      {/* Trust signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex flex-col items-center gap-3 text-center"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" aria-hidden="true" />
          Pembayaran aman melalui Midtrans — mendukung kartu kredit, GoPay, QRIS, dan transfer bank
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Trial 7 hari berlaku untuk pelanggan baru. Kamu bisa membatalkan kapan saja sebelum
          trial berakhir tanpa dikenakan biaya. Langganan otomatis diperpanjang kecuali dibatalkan.
        </p>
      </motion.div>
    </main>
  )
}
