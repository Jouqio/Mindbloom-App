import { describe, it, expect } from 'vitest'
import { createHash } from 'crypto'
import { verifySignature, generateOrderId } from './midtransClient'

function computeValidSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string) {
  return createHash('sha512').update(orderId + statusCode + grossAmount + serverKey).digest('hex')
}

describe('verifySignature', () => {
  const orderId     = 'MB-PREMIUM-abc12345-1700000000000'
  const statusCode  = '200'
  const grossAmount = '49000.00'
  const serverKey   = 'SB-Mid-server-test-key-do-not-use-in-prod'

  it('accepts a correctly-computed signature', () => {
    const validSig = computeValidSignature(orderId, statusCode, grossAmount, serverKey)
    expect(verifySignature(orderId, statusCode, grossAmount, serverKey, validSig)).toBe(true)
  })

  it('rejects a signature computed with the wrong server key (forged request)', () => {
    const forgedSig = computeValidSignature(orderId, statusCode, grossAmount, 'attacker-guessed-key')
    expect(verifySignature(orderId, statusCode, grossAmount, serverKey, forgedSig)).toBe(false)
  })

  it('rejects a signature if the order_id was tampered with', () => {
    const validSig = computeValidSignature(orderId, statusCode, grossAmount, serverKey)
    expect(verifySignature('MB-PREMIUM-victim99-1700000000000', statusCode, grossAmount, serverKey, validSig)).toBe(false)
  })

  it('rejects a signature if the amount was tampered with', () => {
    const validSig = computeValidSignature(orderId, statusCode, grossAmount, serverKey)
    expect(verifySignature(orderId, statusCode, '1.00', serverKey, validSig)).toBe(false)
  })

  it('rejects a signature if the status code was tampered with', () => {
    const validSig = computeValidSignature(orderId, statusCode, grossAmount, serverKey)
    expect(verifySignature(orderId, '500', grossAmount, serverKey, validSig)).toBe(false)
  })

  it('rejects an empty signature', () => {
    expect(verifySignature(orderId, statusCode, grossAmount, serverKey, '')).toBe(false)
  })

  it('rejects garbage / non-hex signature input without throwing', () => {
    expect(() =>
      verifySignature(orderId, statusCode, grossAmount, serverKey, 'not-a-real-signature-at-all')
    ).not.toThrow()
    expect(verifySignature(orderId, statusCode, grossAmount, serverKey, 'not-a-real-signature-at-all')).toBe(false)
  })

  it('is case-sensitive (hex digest comparison should not be loosely coerced)', () => {
    const validSig = computeValidSignature(orderId, statusCode, grossAmount, serverKey)
    const upperCased = validSig.toUpperCase()
    if (validSig !== upperCased) {
      expect(verifySignature(orderId, statusCode, grossAmount, serverKey, upperCased)).toBe(false)
    }
  })
})

describe('generateOrderId', () => {
  it('produces an order ID containing the plan name and a portion of the user ID', () => {
    const orderId = generateOrderId('11111111-2222-3333-4444-555555555555', 'premium')
    expect(orderId).toContain('PREMIUM')
    expect(orderId).toContain('11111111')
  })

  it('produces a different order ID each time it is called (timestamp-based uniqueness)', async () => {
    const first = generateOrderId('user-abc', 'pro')
    await new Promise((r) => setTimeout(r, 2))
    const second = generateOrderId('user-abc', 'pro')
    expect(first).not.toBe(second)
  })

  it('never contains spaces or characters Midtrans would reject in an order_id', () => {
    const orderId = generateOrderId('user-abc-123', 'premium')
    expect(orderId).toMatch(/^[A-Za-z0-9-]+$/)
  })
})
