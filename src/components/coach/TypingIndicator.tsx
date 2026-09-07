// ============================================================
// MindBloom — Typing Indicator + Suggestion Chips
// File: src/components/coach/TypingIndicator.tsx
// ============================================================

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BLOOM_SUGGESTIONS } from '@/types/coach'

// ── Animated typing dots ───────────────────────────────────────
export function TypingIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2.5"
          role="status"
          aria-label="Bloom sedang mengetik"
        >
          {/* Bloom avatar */}
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm"
            aria-hidden="true"
          >
            🌱
          </div>

          {/* Dots */}
          <div className="flex h-8 items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary/70 px-4">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat:   Infinity,
                  delay:    i * 0.15,
                  ease:     'easeInOut',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Quick suggestion chips ─────────────────────────────────────
export function SuggestionChips({
  onSelect,
  visible,
}: {
  onSelect: (text: string) => void
  visible:  boolean
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: 4  }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap gap-2 px-4 pb-2"
          aria-label="Pertanyaan cepat"
        >
          {BLOOM_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSelect(suggestion)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
