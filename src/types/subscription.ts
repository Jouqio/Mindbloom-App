// ============================================================
// MindBloom — Subscription & Payment Types
// File: src/types/subscription.ts
// ============================================================

export type PlanId = 'free' | 'premium' | 'pro'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'expired'

export type BillingCycle = 'monthly' | 'yearly'

export interface PlanFeature {
  label:      string
  free:       boolean | string
  premium:    boolean | string
  pro:        boolean | string
}

export interface PlanDefinition {
  id:            PlanId
  name:          string
  tagline:       string
  price_monthly: number   // in IDR
  price_yearly:  number   // in IDR (discounted)
  emoji:         string
  color:         string
  popular:       boolean
  cta:           string
}

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free', name: 'Free', tagline: 'Mulai perjalanan refleksimu',
    price_monthly: 0, price_yearly: 0,
    emoji: '🌱', color: '#888780', popular: false, cta: 'Paket Saat Ini',
  },
  premium: {
    id: 'premium', name: 'Premium', tagline: 'Untuk refleksi yang lebih dalam',
    price_monthly: 49000, price_yearly: 470000, // ~20% discount
    emoji: '✨', color: '#7F77DD', popular: true, cta: 'Mulai Trial 7 Hari',
  },
  pro: {
    id: 'pro', name: 'Pro', tagline: 'Pengalaman lengkap tanpa batas',
    price_monthly: 99000, price_yearly: 950000,
    emoji: '👑', color: '#EF9F27', popular: false, cta: 'Upgrade ke Pro',
  },
}

export const PLAN_FEATURES: PlanFeature[] = [
  { label: 'Jurnal harian 15 langkah',        free: true,        premium: true,        pro: true },
  { label: 'Achievement & Badge',             free: true,        premium: true,        pro: true },
  { label: 'Emotional Garden',                free: true,        premium: true,        pro: true },
  { label: 'Soundscape & Breathing',          free: true,        premium: true,        pro: true },
  { label: 'Habit Tracker',                   free: '3 habit',   premium: 'Unlimited', pro: 'Unlimited' },
  { label: 'Life Wheel',                      free: '1×/bulan',  premium: 'Unlimited', pro: 'Unlimited' },
  { label: 'AI Coach (Bloom)',                free: '10 pesan/hari', premium: 'Unlimited', pro: 'Unlimited' },
  { label: 'AI Model',                        free: 'GPT-4o-mini', premium: 'GPT-4o', pro: 'GPT-4o' },
  { label: 'EI Score & Insight AI',           free: false,       premium: true,        pro: true },
  { label: 'Memory & RAG Search',             free: false,       premium: true,        pro: true },
  { label: 'Analytics Dashboard',             free: 'Basic',     premium: 'Lengkap',   pro: 'Lengkap' },
  { label: 'Memory Vault (Narasi AI)',        free: false,       premium: '1×/bulan',  pro: 'Unlimited' },
  { label: 'Export PDF',                      free: false,       premium: true,        pro: true },
  { label: 'Prioritas Customer Support',      free: false,       premium: false,       pro: true },
  { label: 'Akses Fitur Baru Lebih Awal',     free: false,       premium: false,       pro: true },
]

export interface UserSubscription {
  id:                string
  user_id:           string
  plan_id:           PlanId
  status:            SubscriptionStatus
  billing_cycle:     BillingCycle | null
  trial_ends_at:     string | null
  current_period_end:string | null
  canceled_at:       string | null
  midtrans_subscription_id: string | null
  created_at:        string
}

export interface PaymentTransaction {
  id:              string
  user_id:         string
  plan_id:         PlanId
  billing_cycle:   BillingCycle
  amount:          number
  status:          'pending' | 'settlement' | 'expire' | 'cancel' | 'deny' | 'failure'
  midtrans_order_id: string
  midtrans_token:  string | null
  payment_type:    string | null
  created_at:      string
  paid_at:         string | null
}

// ── Helpers ────────────────────────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount)
}

export function getYearlySavingsPct(plan: PlanDefinition): number {
  if (plan.price_monthly === 0) return 0
  const yearlyIfMonthly = plan.price_monthly * 12
  return Math.round(((yearlyIfMonthly - plan.price_yearly) / yearlyIfMonthly) * 100)
}

export function isFeatureIncluded(value: boolean | string): boolean {
  return value !== false
}

export const TRIAL_DAYS = 7
