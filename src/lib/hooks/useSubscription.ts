// ============================================================
// MindBloom — useSubscription Hook
// File: src/lib/hooks/useSubscription.ts
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import type { PlanId, BillingCycle } from '@/types/subscription'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: unknown) => void
        onPending?: (result: unknown) => void
        onError?:   (result: unknown) => void
        onClose?:   () => void
      }) => void
    }
  }
}

const MIDTRANS_SNAP_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

// ── Load Snap.js script once ────────────────────────────────────
let snapScriptLoaded = false
function loadSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (snapScriptLoaded || document.getElementById('midtrans-snap')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id  = 'midtrans-snap'
    script.src = MIDTRANS_SNAP_URL
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '')
    script.onload  = () => { snapScriptLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Snap.js'))
    document.body.appendChild(script)
  })
}

export function useSubscription() {
  const store = useSubscriptionStore()

  const load = useCallback(async () => {
    store.setLoading(true)
    try {
      const res = await fetch('/api/payment/status')
      if (!res.ok) throw new Error('Failed to load subscription')
      const { data } = await res.json()
      store.setSubscription(data.subscription)
      store.setEffectivePlan(data.effective_plan)
      store.setTransactions(data.recent_transactions)
    } catch (err) {
      console.error('[useSubscription] load error:', err)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  useEffect(() => { load() }, [load])

  // ── Checkout flow ──────────────────────────────────────────
  const checkout = useCallback(async (
    planId: PlanId,
    billingCycle: BillingCycle
  ): Promise<{ success: boolean; error?: string }> => {
    store.setCheckingOut(true)
    try {
      await loadSnapScript()

      const res = await fetch('/api/payment/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Checkout failed')
      }

      const { data } = await res.json()

      return new Promise((resolve) => {
        window.snap?.pay(data.token, {
          onSuccess: () => {
            load()
            resolve({ success: true })
          },
          onPending: () => {
            load()
            resolve({ success: true })
          },
          onError: () => {
            resolve({ success: false, error: 'Pembayaran gagal. Coba lagi.' })
          },
          onClose: () => {
            resolve({ success: false, error: 'Pembayaran dibatalkan.' })
          },
        })
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      return { success: false, error: msg }
    } finally {
      store.setCheckingOut(false)
    }
  }, [store, load])

  // ── Cancel subscription ────────────────────────────────────
  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/payment/status', { method: 'DELETE' })
      if (!res.ok) throw new Error('Cancel failed')
      const { data } = await res.json()
      await load()
      return { success: true, message: data.message }
    } catch (err) {
      console.error('[cancelSubscription]', err)
      return { success: false }
    }
  }, [load])

  const isTrialing = Boolean(
    store.subscription?.status === 'trialing' &&
    store.subscription.trial_ends_at &&
    new Date(store.subscription.trial_ends_at) > new Date()
  )

  const daysLeftInTrial = isTrialing && store.subscription?.trial_ends_at
    ? Math.ceil((new Date(store.subscription.trial_ends_at).getTime() - Date.now()) / 86400000)
    : 0

  return {
    subscription:  store.subscription,
    effectivePlan: store.effectivePlan,
    transactions:  store.transactions,
    isLoading:     store.isLoading,
    isCheckingOut: store.isCheckingOut,
    isTrialing,
    daysLeftInTrial,
    checkout,
    cancelSubscription,
    refetch: load,
  }
}
