// ============================================================
// MindBloom — Midtrans Webhook Handler
// File: src/app/api/payment/webhook/route.ts
//
// Configure this URL in Midtrans Dashboard:
// Settings → Configuration → Payment Notification URL
// https://yourapp.com/api/payment/webhook
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySignature } from '@/lib/payment/midtransClient'
import { TRIAL_DAYS } from '@/types/subscription'

// Use service role for webhook (no user session available)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      order_id, status_code, gross_amount, signature_key,
      transaction_status, payment_type, transaction_id,
      fraud_status,
    } = body

    // ── 1. Verify signature (CRITICAL for security) ──────────
    const isValid = verifySignature(
      order_id, status_code, gross_amount,
      process.env.MIDTRANS_SERVER_KEY!, signature_key
    )

    if (!isValid) {
      console.error('[Webhook] Invalid signature for order:', order_id)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // ── 2. Find the transaction ────────────────────────────
    const { data: transaction, error: txFindError } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('midtrans_order_id', order_id)
      .single()

    if (txFindError || !transaction) {
      console.error('[Webhook] Transaction not found:', order_id)
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // ── 3. Map Midtrans status to our status ────────────────
    let newStatus = transaction.status
    let shouldActivateSubscription = false

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newStatus = 'settlement'
        shouldActivateSubscription = true
      } else if (fraud_status === 'challenge') {
        newStatus = 'pending'
      }
    } else if (transaction_status === 'settlement') {
      newStatus = 'settlement'
      shouldActivateSubscription = true
    } else if (transaction_status === 'pending') {
      newStatus = 'pending'
    } else if (transaction_status === 'deny') {
      newStatus = 'deny'
    } else if (transaction_status === 'cancel') {
      newStatus = 'cancel'
    } else if (transaction_status === 'expire') {
      newStatus = 'expire'
    } else if (transaction_status === 'failure') {
      newStatus = 'failure'
    }

    // ── 4. Update transaction record ────────────────────────
    await supabaseAdmin
      .from('payment_transactions')
      .update({
        status:       newStatus,
        payment_type: payment_type ?? null,
        paid_at:      shouldActivateSubscription ? new Date().toISOString() : null,
      })
      .eq('id', transaction.id)

    // ── 5. Activate subscription if payment successful ─────
    if (shouldActivateSubscription) {
      const now = new Date()
      const periodEnd = new Date(now)

      if (transaction.billing_cycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }

      // Check if this is user's first-ever subscription (trial eligibility)
      const { data: existingSub } = await supabaseAdmin
        .from('user_subscriptions')
        .select('id, trial_ends_at')
        .eq('user_id', transaction.user_id)
        .maybeSingle()

      const isFirstSubscription = !existingSub?.trial_ends_at
      const trialEndsAt = isFirstSubscription
        ? new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString()
        : existingSub?.trial_ends_at ?? null

      await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id:            transaction.user_id,
          plan_id:            transaction.plan_id,
          status:             isFirstSubscription ? 'trialing' : 'active',
          billing_cycle:      transaction.billing_cycle,
          trial_ends_at:      trialEndsAt,
          current_period_end: periodEnd.toISOString(),
          canceled_at:        null,
          updated_at:         now.toISOString(),
        }, { onConflict: 'user_id' })

      // Update profile plan for quick access
      await supabaseAdmin
        .from('profiles')
        .update({ plan: transaction.plan_id, updated_at: now.toISOString() })
        .eq('id', transaction.user_id)

      console.log(`[Webhook] Subscription activated: user=${transaction.user_id} plan=${transaction.plan_id}`)
    }

    // ── 6. Handle expired/failed → downgrade if needed ──────
    if (['expire', 'cancel', 'deny', 'failure'].includes(newStatus)) {
      console.log(`[Webhook] Payment ${newStatus} for order:`, order_id)
      // Note: we don't immediately downgrade here — subscription
      // remains active until current_period_end naturally expires
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/payment/webhook]', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
