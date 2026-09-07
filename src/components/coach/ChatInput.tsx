// ============================================================
// MindBloom — Chat Input Component
// File: src/components/coach/ChatInput.tsx
// ============================================================

'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, RefreshCw } from 'lucide-react'
import { useCoach } from '@/lib/hooks/useCoach'
import { BLOOM_TONE_LABELS, type BloomTone } from '@/types/coach'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onClear?: () => void
}

export function ChatInput({ onClear }: ChatInputProps) {
  const { inputDraft, isStreaming, tone, sendMessage, setInputDraft, setTone } = useCoach()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [])

  useEffect(() => {
    autoResize()
  }, [inputDraft, autoResize])

  const handleSubmit = useCallback(() => {
    const text = inputDraft.trim()
    if (!text || isStreaming) return
    sendMessage(text)
  }, [inputDraft, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border/60 bg-background/90 backdrop-blur-sm">
      {/* Tone selector */}
      <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-1">
        {(Object.entries(BLOOM_TONE_LABELS) as [BloomTone, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTone(key)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              tone === key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-pressed={tone === key}
          >
            {label}
          </button>
        ))}

        {/* Clear / new session */}
        <button
          onClick={onClear}
          className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Mulai percakapan baru"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Baru
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2.5 px-4 pb-4 pt-1">
        <div className="flex-1 rounded-2xl border border-border bg-background overflow-hidden transition-colors focus-within:border-primary/50">
          <textarea
            ref={textareaRef}
            value={inputDraft}
            onChange={(e) => { setInputDraft(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ceritakan sesuatu kepada Bloom..."
            rows={1}
            aria-label="Pesan untuk Bloom"
            className={cn(
              'w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground',
              'placeholder:text-muted-foreground focus-visible:outline-none',
              'max-h-[140px] scrollbar-thin',
              isStreaming && 'opacity-50'
            )}
          />
        </div>

        {/* Send button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!inputDraft.trim() || isStreaming}
          whileTap={!inputDraft.trim() || isStreaming ? {} : { scale: 0.9 }}
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            inputDraft.trim() && !isStreaming
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          )}
          aria-label="Kirim pesan"
        >
          {isStreaming
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            : <Send className="h-4 w-4 ml-0.5" aria-hidden="true" />
          }
        </motion.button>
      </div>

      {/* Keyboard hint */}
      <p className="hidden pb-1 text-center text-[10px] text-muted-foreground/50 md:block">
        Enter untuk kirim · Shift+Enter untuk baris baru
      </p>
    </div>
  )
}
