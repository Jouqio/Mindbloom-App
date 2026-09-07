// ============================================================
// MindBloom — Chat Message Component
// File: src/components/coach/ChatMessage.tsx
// ============================================================

'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/coach'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  isLast?: boolean
}

// ── Simple markdown-lite renderer ────────────────────────────
function renderContent(text: string): React.ReactNode {
  // Split by double newline for paragraphs
  const paragraphs = text.split(/\n\n+/)

  return paragraphs.map((para, pi) => {
    // Bold: **text**
    const parts = para.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      // Handle single newlines within paragraph
      const lines = part.split('\n')
      return lines.map((line, li) => (
        <span key={`${i}-${li}`}>
          {line}
          {li < lines.length - 1 && <br />}
        </span>
      ))
    })

    return (
      <p key={pi} className={cn('leading-relaxed', pi > 0 && 'mt-2')}>
        {rendered}
      </p>
    )
  })
}

// ── Bloom avatar ──────────────────────────────────────────────
function BloomAvatar() {
  return (
    <div
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm"
      aria-hidden="true"
    >
      🌱
    </div>
  )
}

// ── Main message component ────────────────────────────────────
export const ChatMessage = memo(function ChatMessage({
  message, isLast,
}: ChatMessageProps) {
  const isUser      = message.role === 'user'
  const isStreaming = message.status === 'streaming'
  const isError     = message.status === 'error'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
        role="listitem"
        aria-label={`Kamu: ${message.content}`}
      >
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm text-background">
          {renderContent(message.content)}
        </div>
      </motion.div>
    )
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2.5"
      role="listitem"
      aria-label={`Bloom: ${message.content}`}
      aria-live={isLast ? 'polite' : undefined}
    >
      <BloomAvatar />

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'inline-block max-w-full rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm',
            isError
              ? 'border border-destructive/30 bg-destructive/5 text-destructive'
              : 'bg-secondary/70 text-foreground'
          )}
        >
          {isError ? (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {message.content}
            </span>
          ) : (
            renderContent(message.content)
          )}

          {/* Streaming cursor */}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="ml-0.5 inline-block h-3.5 w-0.5 bg-primary align-middle"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </motion.div>
  )
})
