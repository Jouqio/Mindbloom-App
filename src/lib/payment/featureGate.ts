// ============================================================
// MindBloom — Feature Gating Utility
// File: src/lib/payment/featureGate.ts
// Central place to check plan limits across the app
// ============================================================

import type { PlanId } from '@/types/subscription'

export interface PlanLimits {
  maxHabits:          number   // -1 = unlimited
  maxCoachMessagesDay:number
  aiModel:            'gpt-4o-mini' | 'gpt-4o'
  hasEIScore:         boolean
  hasMemorySearch:    boolean
  hasMemoryVault:     boolean
  memoryVaultPerMonth:number   // -1 = unlimited
  hasFullAnalytics:   boolean
  hasPDFExport:       boolean
  lifeWheelPerMonth:  number   // -1 = unlimited
  hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    maxHabits:           3,
    maxCoachMessagesDay: 10,
    aiModel:             'gpt-4o-mini',
    hasEIScore:          false,
    hasMemorySearch:     false,
    hasMemoryVault:      false,
    memoryVaultPerMonth: 0,
    hasFullAnalytics:    false,
    hasPDFExport:        false,
    lifeWheelPerMonth:   1,
    hasPrioritySupport:  false,
  },
  premium: {
    maxHabits:           -1,
    maxCoachMessagesDay: -1,
    aiModel:             'gpt-4o',
    hasEIScore:          true,
    hasMemorySearch:     true,
    hasMemoryVault:      true,
    memoryVaultPerMonth: 1,
    hasFullAnalytics:    true,
    hasPDFExport:        true,
    lifeWheelPerMonth:   -1,
    hasPrioritySupport:  false,
  },
  pro: {
    maxHabits:           -1,
    maxCoachMessagesDay: -1,
    aiModel:             'gpt-4o',
    hasEIScore:          true,
    hasMemorySearch:     true,
    hasMemoryVault:      true,
    memoryVaultPerMonth: -1,
    hasFullAnalytics:    true,
    hasPDFExport:        true,
    lifeWheelPerMonth:   -1,
    hasPrioritySupport:  true,
  },
}

export function getPlanLimits(planId: PlanId): PlanLimits {
  return PLAN_LIMITS[planId] ?? PLAN_LIMITS.free
}

// ── Server-side check: can user perform action? ────────────────
export async function checkFeatureAccess(
  supabase: any,
  userId:   string,
  feature:  keyof PlanLimits
): Promise<{ allowed: boolean; limit: number | boolean | string; current?: number }> {
  // Delegate to the single source of truth for "what plan does this user
  // actually have right now" — this used to be a separate, looser inline
  // re-implementation that had drifted out of sync with getEffectivePlan():
  // it never checked current_period_end for active subscriptions, and it
  // treated canceled-but-not-yet-expired subscriptions as free immediately.
  const effectivePlan = await getEffectivePlan(supabase, userId)

  const limits = getPlanLimits(effectivePlan)
  const limitValue = limits[feature]

  if (typeof limitValue === 'boolean') {
    return { allowed: limitValue, limit: limitValue }
  }

  if (typeof limitValue === 'number') {
    if (limitValue === -1) return { allowed: true, limit: -1 } // unlimited

    // Check current usage based on feature type
    let current = 0
    if (feature === 'maxHabits') {
      const { count } = await supabase
        .from('habits')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_archived', false)
      current = count ?? 0
    } else if (feature === 'maxCoachMessagesDay') {
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('coach_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', `${today}T00:00:00`)
      current = count ?? 0
    } else if (feature === 'lifeWheelPerMonth') {
      const monthStart = new Date()
      monthStart.setDate(1)
      const { count } = await supabase
        .from('life_wheel_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString())
      current = count ?? 0
    } else if (feature === 'memoryVaultPerMonth') {
      const now = new Date()
      const { count } = await supabase
        .from('monthly_narratives')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('year', now.getFullYear())
        .eq('month', now.getMonth() + 1)
      current = count ?? 0
    }

    return { allowed: current < limitValue, limit: limitValue, current }
  }

  return { allowed: true, limit: limitValue }
}

// ── Get effective plan for a user (handles trial logic) ────────
export async function getEffectivePlan(supabase: any, userId: string): Promise<PlanId> {
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status, trial_ends_at, current_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sub) return 'free'

  const now = new Date()

  // Active trial
  if (sub.status === 'trialing' && sub.trial_ends_at && new Date(sub.trial_ends_at) > now) {
    return sub.plan_id
  }

  // Active OR canceled-but-not-yet-expired paid subscription. A canceled
  // subscription must keep working until its current period actually
  // ends — matching the promise shown to users when they cancel (see
  // SubscriptionSettingsClient: "aktif hingga akhir periode saat ini").
  if ((sub.status === 'active' || sub.status === 'canceled') &&
      sub.current_period_end && new Date(sub.current_period_end) > now) {
    return sub.plan_id
  }

  return 'free'
}
