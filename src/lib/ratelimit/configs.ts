// ============================================================
// MindBloom — Rate Limit Configs
// File: src/lib/ratelimit/configs.ts
//
// One named config per endpoint we want to protect. Tune the
// numbers here — everything else just references these by name.
// ============================================================

import type { RateLimitConfig } from './rateLimiter'

export const RATE_LIMITS = {
  // Bloom AI Coach — the highest-cost endpoint (GPT-4o + RAG search
  // + full context assembly on every message). Free-tier limit also
  // enforced separately in featureGate.ts (10 msgs/day) — this limit
  // exists to stop rapid-fire abuse/loops within a short window,
  // which the daily counter alone wouldn't catch.
  coach_chat: {
    key: 'coach_chat', limit: 15, windowSec: 60,       // 15 messages / minute
  },

  // Insight generation — calls GPT-4o-mini + does ~8 parallel Supabase
  // queries. Already capped to once/day by canGenerate in the UI, but
  // that's client-side only; enforce it server-side too.
  insights_generate: {
    key: 'insights_generate', limit: 3, windowSec: 3600,   // 3 / hour
  },
  ei_score: {
    key: 'ei_score', limit: 3, windowSec: 3600,            // 3 / hour
  },

  // Memory embedding — batches up to 20 OpenAI embedding calls per
  // request. Cheap per-call, but still worth throttling bulk re-embeds.
  memory_embed: {
    key: 'memory_embed', limit: 10, windowSec: 3600,       // 10 / hour
  },
  // Semantic search — one embedding call per search. Generous limit,
  // just to stop a runaway frontend loop from hammering OpenAI.
  memory_search: {
    key: 'memory_search', limit: 30, windowSec: 60,        // 30 / minute
  },

  // Memory Vault narrative generation — GPT-4o-mini, already gated to
  // once/24h per month server-side in the route itself; this is a
  // secondary guard against retries/loops.
  vault_generate: {
    key: 'vault_generate', limit: 5, windowSec: 3600,      // 5 / hour
  },

  // Payment checkout — not AI-costly, but creates a Midtrans
  // transaction + DB row per call. Cheap to abuse-proof anyway.
  payment_checkout: {
    key: 'payment_checkout', limit: 10, windowSec: 3600,   // 10 / hour
  },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitName = keyof typeof RATE_LIMITS
