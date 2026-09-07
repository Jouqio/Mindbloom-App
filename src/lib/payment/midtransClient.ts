// ============================================================
// MindBloom — Midtrans Client
// File: src/lib/payment/midtransClient.ts
// ============================================================

import midtransClient from 'midtrans-client'

const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true'

// ── Snap API instance (for creating payment tokens) ───────────
export const snap = new midtransClient.Snap({
  isProduction: isProd,
  serverKey:    process.env.MIDTRANS_SERVER_KEY!,
  clientKey:    process.env.MIDTRANS_CLIENT_KEY!,
})

// ── Core API instance (for status checks, cancellations) ──────
export const coreApi = new midtransClient.CoreApi({
  isProduction: isProd,
  serverKey:    process.env.MIDTRANS_SERVER_KEY!,
  clientKey:    process.env.MIDTRANS_CLIENT_KEY!,
})

// ── Build unique order ID ──────────────────────────────────────
export function generateOrderId(userId: string, planId: string): string {
  const timestamp = Date.now()
  const shortUserId = userId.slice(0, 8)
  return `MB-${planId.toUpperCase()}-${shortUserId}-${timestamp}`
}

// ── Build Snap transaction parameters ──────────────────────────
interface CreateTransactionParams {
  orderId:       string
  amount:        number
  customerName:  string
  customerEmail: string
  planName:      string
  billingCycle:  'monthly' | 'yearly'
}

export function buildTransactionParams(params: CreateTransactionParams) {
  const { orderId, amount, customerName, customerEmail, planName, billingCycle } = params

  return {
    transaction_details: {
      order_id:     orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerName || 'Pengguna',
      email:      customerEmail,
    },
    item_details: [
      {
        id:       `plan-${planName.toLowerCase()}-${billingCycle}`,
        price:    amount,
        quantity: 1,
        name:     `MindBloom ${planName} (${billingCycle === 'yearly' ? 'Tahunan' : 'Bulanan'})`,
        category: 'Subscription',
      },
    ],
    credit_card: {
      secure: true,
    },
    // Enable common Indonesian payment methods
    enabled_payments: [
      'credit_card', 'gopay', 'shopeepay', 'qris',
      'bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va',
      'indomaret', 'alfamart',
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?status=success`,
    },
  }
}

// ── Verify webhook signature (security) ────────────────────────
export function verifySignature(
  orderId:      string,
  statusCode:   string,
  grossAmount:  string,
  serverKey:    string,
  receivedSignature: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex')

  return expectedSignature === receivedSignature
}
