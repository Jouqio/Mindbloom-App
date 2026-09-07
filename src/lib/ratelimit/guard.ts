// ============================================================
// MindBloom — Rate Limit Guard
// File: src/lib/ratelimit/guard.ts
//
// Usage in any API route:
//
//   const limited = await enforceRateLimit(user.id, 'coach_chat')
//   if (limited) return limited   // 429 Response, already built
//
// ============================================================

import { NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponseInit } from './rateLimiter'
import { RATE_LIMITS, type RateLimitName } from './configs'

/**
 * Checks the named rate limit for a user.
 * Returns `null` if the request should proceed, or a ready-to-return
 * 429 NextResponse if the limit was exceeded.
 */
export async function enforceRateLimit(
  userId: string,
  limitName: RateLimitName
): Promise<NextResponse | null> {
  const config = RATE_LIMITS[limitName]
  const result = await checkRateLimit(userId, config)

  if (result.allowed) return null

  const resetSeconds = Math.max(1, Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000))

  return NextResponse.json(
    {
      error: `Terlalu banyak permintaan. Coba lagi dalam ${resetSeconds < 60 ? `${resetSeconds} detik` : `${Math.ceil(resetSeconds / 60)} menit`}.`,
      rate_limit: {
        limit:     result.limit,
        remaining: result.remaining,
        reset_at:  result.resetAt,
      },
    },
    rateLimitResponseInit(result)
  )
}
