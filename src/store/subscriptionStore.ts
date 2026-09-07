// ============================================================
// MindBloom — Subscription Store + Hook
// File: src/store/subscriptionStore.ts + lib/hooks/useSubscription.ts
// ============================================================

import { create } from 'zustand'
import type { UserSubscription, PaymentTransaction, PlanId } from '@/types/subscription'

interface SubscriptionStore {
  subscription:  UserSubscription | null
  effectivePlan: PlanId
  transactions:  PaymentTransaction[]
  isLoading:     boolean
  isCheckingOut: boolean

  setSubscription: (s: UserSubscription | null) => void
  setEffectivePlan:(p: PlanId) => void
  setTransactions: (t: PaymentTransaction[]) => void
  setLoading:      (v: boolean) => void
  setCheckingOut:  (v: boolean) => void
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription:  null,
  effectivePlan: 'free',
  transactions:  [],
  isLoading:     false,
  isCheckingOut: false,

  setSubscription: (subscription)  => set({ subscription }),
  setEffectivePlan:(effectivePlan) => set({ effectivePlan }),
  setTransactions: (transactions)  => set({ transactions }),
  setLoading:      (isLoading)     => set({ isLoading }),
  setCheckingOut:  (isCheckingOut) => set({ isCheckingOut }),
}))
