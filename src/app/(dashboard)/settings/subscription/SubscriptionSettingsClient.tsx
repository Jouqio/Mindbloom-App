// ============================================================
// MindBloom — Subscription Settings Client
// File: src/app/(dashboard)/settings/subscription/SubscriptionSettingsClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  CreditCard, Calendar, AlertTriangle, CheckCircle2,
  ExternalLink, Loader2, Clock,
} from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { PLAN_DEFINITIONS, formatIDR } from '@/types/subscription'
import { cn } from '@/lib/utils'

export function SubscriptionSettingsClient() {
  const {
    subscription, effectivePlan, transactions, isLoading,
    isTrialing, daysLeftInTrial, cancelSubscription, refetch,
  } = useSubscription()

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelMessage, setCancelMessage] = useState<string | null>(null)

  const plan = PLAN_DEFINITIONS[effectivePlan]

  const handleCancel = async () => {
    setIsCanceling(true)
    const result = await cancelSubscription()
    if (result.success) {
      setCancelMessage(result.message ?? 'Langganan dibatalkan.')
      setShowCancelConfirm(false)
    }
    setIsCanceling(false)
  }

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  const TRANSACTION_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    settlement: { label: 'Berhasil',   color: '#1D9E75', bg: '#E1F5EE' },
    pending:    { label: 'Menunggu',   color: '#EF9F27', bg: '#FAEEDA' },
    expire:     { label: 'Kadaluarsa', color: '#888780', bg: '#F1EFE8' },
    cancel:     { label: 'Dibatalkan', color: '#888780', bg: '#F1EFE8' },
    deny:       { label: 'Ditolak',    color: '#E24B4A', bg: '#FCEBEB' },
    failure:    { label: 'Gagal',      color: '#E24B4A', bg: '#FCEBEB' },
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-medium text-foreground">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          Langganan
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Kelola paket dan riwayat pembayaranmu
        </p>
      </motion.div>

      {cancelMessage && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          ℹ️ {cancelMessage}
        </motion.div>
      )}

      {/* Current plan card */}
      <div className="mb-5 rounded-2xl border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{ background: plan.color + '15' }}>
              {plan.emoji}
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Paket {plan.name}</p>
              {isTrialing ? (
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Trial — {daysLeftInTrial} hari tersisa
                </p>
              ) : subscription?.status === 'active' ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  Aktif
                </p>
              ) : subscription?.status === 'canceled' ? (
                <p className="text-xs text-amber-600">Dibatalkan — aktif hingga akhir periode</p>
              ) : (
                <p className="text-xs text-muted-foreground">Paket gratis</p>
              )}
            </div>
          </div>
          {effectivePlan !== 'pro' && (
            <Link
              href="/pricing"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* Details */}
        {subscription && effectivePlan !== 'free' && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {isTrialing ? 'Trial berakhir' : 'Perpanjangan berikutnya'}
              </p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {formatDate(isTrialing ? subscription.trial_ends_at : subscription.current_period_end)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Siklus tagihan</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {subscription.billing_cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
              </p>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {effectivePlan !== 'free' && subscription?.status !== 'canceled' && (
          <div className="mt-4 pt-4 border-t border-border">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-xs text-destructive hover:underline focus-visible:outline-none"
              >
                Batalkan langganan
              </button>
            ) : (
              <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-destructive">
                    Langganan akan tetap aktif hingga {formatDate(subscription?.current_period_end ?? null)},
                    lalu otomatis kembali ke paket Free. Yakin ingin membatalkan?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isCanceling}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {isCanceling && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                    Ya, batalkan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Billing history */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">Riwayat Pembayaran</h2>
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background p-8 text-center">
            <p className="text-sm text-muted-foreground">Belum ada riwayat pembayaran</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => {
              const statusCfg = TRANSACTION_STATUS_CONFIG[tx.status] ?? TRANSACTION_STATUS_CONFIG.pending
              const txPlan = PLAN_DEFINITIONS[tx.plan_id]
              return (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl text-base flex-shrink-0"
                    style={{ background: txPlan.color + '15' }}>
                    {txPlan.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {txPlan.name} · {tx.billing_cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-foreground">{formatIDR(tx.amount)}</p>
                    <span
                      className="mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Support link */}
      <div className="mt-6 rounded-xl bg-secondary/50 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          Ada pertanyaan tentang tagihan?{' '}
          <a href="mailto:support@mindbloom.app" className="text-primary underline-offset-4 hover:underline inline-flex items-center gap-1">
            Hubungi kami
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </p>
      </div>
    </main>
  )
}
