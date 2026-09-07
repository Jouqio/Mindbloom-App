import { describe, it, expect } from 'vitest'
import { PLAN_LIMITS, getPlanLimits, getEffectivePlan } from './featureGate'

function fakeSupabase(subscriptionRow: Record<string, unknown> | null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: subscriptionRow }),
        }),
      }),
    }),
  }
}

describe('PLAN_LIMITS config integrity', () => {
  it('defines limits for all 3 plans', () => {
    expect(Object.keys(PLAN_LIMITS).sort()).toEqual(['free', 'premium', 'pro'])
  })

  it('never gives the free tier a BETTER limit than premium for any numeric field', () => {
    const free = PLAN_LIMITS.free
    const premium = PLAN_LIMITS.premium
    for (const key of Object.keys(free) as (keyof typeof free)[]) {
      const freeVal = free[key]
      const premVal = premium[key]
      if (typeof freeVal === 'number' && typeof premVal === 'number') {
        const freeEffective = freeVal === -1 ? Infinity : freeVal
        const premEffective = premVal === -1 ? Infinity : premVal
        expect(freeEffective).toBeLessThanOrEqual(premEffective)
      }
    }
  })

  it('never gives premium a BETTER limit than pro for any numeric field', () => {
    const premium = PLAN_LIMITS.premium
    const pro = PLAN_LIMITS.pro
    for (const key of Object.keys(premium) as (keyof typeof premium)[]) {
      const premVal = premium[key]
      const proVal = pro[key]
      if (typeof premVal === 'number' && typeof proVal === 'number') {
        const premEffective = premVal === -1 ? Infinity : premVal
        const proEffective = proVal === -1 ? Infinity : proVal
        expect(premEffective).toBeLessThanOrEqual(proEffective)
      }
    }
  })

  it('only pro has priority support', () => {
    expect(PLAN_LIMITS.free.hasPrioritySupport).toBe(false)
    expect(PLAN_LIMITS.premium.hasPrioritySupport).toBe(false)
    expect(PLAN_LIMITS.pro.hasPrioritySupport).toBe(true)
  })

  it('free tier does not get EI score, memory search, or memory vault', () => {
    expect(PLAN_LIMITS.free.hasEIScore).toBe(false)
    expect(PLAN_LIMITS.free.hasMemorySearch).toBe(false)
    expect(PLAN_LIMITS.free.hasMemoryVault).toBe(false)
  })
})

describe('getPlanLimits', () => {
  it('returns free limits for an unrecognized/invalid plan id (safe fallback)', () => {
    // @ts-expect-error — deliberately passing an invalid plan to test the fallback
    const limits = getPlanLimits('not-a-real-plan')
    expect(limits).toEqual(PLAN_LIMITS.free)
  })

  it('returns the exact matching config for each real plan', () => {
    expect(getPlanLimits('free')).toEqual(PLAN_LIMITS.free)
    expect(getPlanLimits('premium')).toEqual(PLAN_LIMITS.premium)
    expect(getPlanLimits('pro')).toEqual(PLAN_LIMITS.pro)
  })
})

describe('getEffectivePlan', () => {
  it('returns "free" when the user has no subscription row at all', async () => {
    expect(await getEffectivePlan(fakeSupabase(null), 'user-1')).toBe('free')
  })

  it('returns the paid plan while an active trial has NOT yet ended', async () => {
    const tomorrow = new Date(Date.now() + 24 * 3600_000).toISOString()
    const sub = { plan_id: 'premium', status: 'trialing', trial_ends_at: tomorrow, current_period_end: null }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('premium')
  })

  it('downgrades to "free" the instant a trial has ended, even if status is stale as "trialing"', async () => {
    const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString()
    const sub = { plan_id: 'premium', status: 'trialing', trial_ends_at: yesterday, current_period_end: null }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('free')
  })

  it('returns the paid plan while an active paid subscription has NOT yet reached its period end', async () => {
    const nextMonth = new Date(Date.now() + 30 * 24 * 3600_000).toISOString()
    const sub = { plan_id: 'pro', status: 'active', trial_ends_at: null, current_period_end: nextMonth }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('pro')
  })

  it('downgrades to "free" once an active subscription is past its period end (payment lapsed)', async () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 3600_000).toISOString()
    const sub = { plan_id: 'pro', status: 'active', trial_ends_at: null, current_period_end: lastMonth }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('free')
  })

  it('keeps the paid plan active for a canceled subscription until its period actually ends', async () => {
    const nextMonth = new Date(Date.now() + 30 * 24 * 3600_000).toISOString()
    const sub = { plan_id: 'premium', status: 'canceled', trial_ends_at: null, current_period_end: nextMonth }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('premium')
  })

  it('drops a canceled subscription to "free" once its period has actually ended', async () => {
    const lastMonth = new Date(Date.now() - 24 * 3600_000).toISOString()
    const sub = { plan_id: 'premium', status: 'canceled', trial_ends_at: null, current_period_end: lastMonth }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('free')
  })

  it('returns "free" for a past_due subscription (payment failed)', async () => {
    const nextMonth = new Date(Date.now() + 30 * 24 * 3600_000).toISOString()
    const sub = { plan_id: 'pro', status: 'past_due', trial_ends_at: null, current_period_end: nextMonth }
    expect(await getEffectivePlan(fakeSupabase(sub), 'user-1')).toBe('free')
  })
})
