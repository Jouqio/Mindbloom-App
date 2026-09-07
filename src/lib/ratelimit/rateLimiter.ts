// ============================================================
// MindBloom — Rate Limiter
// File: src/lib/ratelimit/rateLimiter.ts
//
// Fixed-window rate limiting backed by Supabase Postgres.
//
// Why not in-memory or Upstash Redis?
// - In-memory counters don't work correctly on serverless/Vercel:
//   every cold start / instance has its own memory, so a user could
//   get a fresh limit on every request that hits a new instance.
// - Upstash Redis is the "textbook" answer, but it's a new paid
//   service to sign up for and configure. This uses infrastructure
//   you already have (Supabase) so it works the moment you deploy,
//   with zero extra signup.
//
// Trade-off: this does 1-2 extra DB round-trips per rate-limited
// request. For MindBloom's AI endpoints (which already do multiple
// Supabase queries per request), this overhead is negligible. If
// you outgrow this, swapping to @upstash/ratelimit later is a
// drop-in replacement — see the RateLimiter interface below.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface RateLimitResult {
  allowed:    boolean
  limit:      number
  remaining:  number
  resetAt:    string  // ISO timestamp when the window resets
}

export interface RateLimitConfig {
  /** Unique name for this limit bucket, e.g. "coach_chat" */
  key:         string
  /** Max requests allowed within the window */
  limit:       number
  /** Window size in seconds */
  windowSec:   number
}

// Admin client — rate limit checks must work regardless of RLS,
// and run before/alongside the user's own authenticated request.
function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Check and increment a fixed-window rate limit for a given user.
 *
 * Fixed windows are simpler than sliding windows and good enough here:
 * the worst case is a user gets ~2x their limit right at a window
 * boundary, which is an acceptable trade-off for AI cost protection
 * (the goal is "prevent runaway loops / abuse", not billing-precision).
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = getAdminClient()
  const now = new Date()

  // Window bucket: e.g. for a 60s window, this rounds down to the
  // start of the current minute-aligned window.
  const windowStartMs = Math.floor(now.getTime() / (config.windowSec * 1000)) * (config.windowSec * 1000)
  const windowStart = new Date(windowStartMs).toISOString()
  const resetAt = new Date(windowStartMs + config.windowSec * 1000).toISOString()

  // Upsert-and-increment in one round trip via RPC (see migration).
  const { data, error } = await supabase.rpc('increment_rate_limit', {
    p_user_id:     userId,
    p_bucket_key:  config.key,
    p_window_start: windowStart,
  })

  if (error) {
    // Fail OPEN, not closed — a rate-limiter bug should never be the
    // reason a user can't use the app. Log it so we notice, but let
    // the request through.
    console.error('[rateLimiter] check failed, failing open:', error)
    return { allowed: true, limit: config.limit, remaining: config.limit, resetAt }
  }

  const currentCount = data as number
  const allowed = currentCount <= config.limit

  return {
    allowed,
    limit:     config.limit,
    remaining: Math.max(0, config.limit - currentCount),
    resetAt,
  }
}

/** Standard 429 response body + headers for a rate-limited request. */
export function rateLimitResponseInit(result: RateLimitResult): ResponseInit {
  return {
    status: 429,
    headers: {
      'Content-Type':          'application/json',
      'X-RateLimit-Limit':     String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset':     result.resetAt,
      'Retry-After':           String(Math.max(1, Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000))),
    },
  }
}
