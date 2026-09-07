// ============================================================
// MindBloom — Checkout API Route
// File: src/app/api/payment/checkout/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { snap, generateOrderId, buildTransactionParams } from '@/lib/payment/midtransClient'
import { PLAN_DEFINITIONS, TRIAL_DAYS, type PlanId, type BillingCycle } from '@/types/subscription'
import { enforceRateLimit } from '@/lib/ratelimit/guard'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = await enforceRateLimit(user.id, 'payment_checkout')
    if (limited) return limited

    const { plan_id, billing_cycle } = await request.json() as {
      plan_id: PlanId; billing_cycle: BillingCycle
    }

    if (!plan_id || plan_id === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLAN_DEFINITIONS[plan_id]
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    // Get user profile for customer details
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, full_name, email')
      .eq('id', user.id)
      .single()

    // Check existing subscription — prevent duplicate active trial
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('id, status, trial_ends_at, plan_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const hasUsedTrialBefore = existingSub?.trial_ends_at != null
    const amount = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly

    const orderId = generateOrderId(user.id, plan_id)

    // Create Midtrans Snap transaction
    const transactionParams = buildTransactionParams({
      orderId,
      amount,
      customerName:  profile?.display_name ?? profile?.full_name ?? 'Pengguna MindBloom',
      customerEmail: profile?.email ?? user.email ?? '',
      planName:      plan.name,
      billingCycle:  billing_cycle,
    })

    const transaction = await snap.createTransaction(transactionParams)

    // Save pending transaction to database
    const { error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id:           user.id,
        plan_id,
        billing_cycle,
        amount,
        status:            'pending',
        midtrans_order_id: orderId,
        midtrans_token:    transaction.token,
      })

    if (txError) throw txError

    return NextResponse.json({
      data: {
        token:        transaction.token,
        redirect_url: transaction.redirect_url,
        order_id:     orderId,
        is_trial_eligible: !hasUsedTrialBefore,
      },
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/payment/checkout]', err)
    return NextResponse.json({ error: 'Gagal membuat transaksi. Coba lagi.' }, { status: 500 })
  }
}
