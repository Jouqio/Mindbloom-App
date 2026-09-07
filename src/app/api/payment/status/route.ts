// ============================================================
// MindBloom — Subscription Status API Route
// File: src/app/api/payment/status/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan } from '@/lib/payment/featureGate'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [subRes, effectivePlan, recentTxRes] = await Promise.all([
      supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      getEffectivePlan(supabase, user.id),
      supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    return NextResponse.json({
      data: {
        subscription:   subRes.data,
        effective_plan: effectivePlan,
        recent_transactions: recentTxRes.data ?? [],
      },
    })
  } catch (err) {
    console.error('[GET /api/payment/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Cancel subscription ────────────────────────────────────────
export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status:       'canceled',
        canceled_at:  new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({
      data: { canceled: true, message: 'Langganan akan aktif hingga akhir periode saat ini.' },
    })
  } catch (err) {
    console.error('[DELETE /api/payment/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
