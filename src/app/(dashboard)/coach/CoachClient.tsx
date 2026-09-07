// ============================================================
// MindBloom — Coach Client Component (Full Chat UI)
// File: src/app/(dashboard)/coach/CoachClient.tsx
// ============================================================

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ChevronDown, History } from 'lucide-react'
import { ChatMessage } from '@/components/coach/ChatMessage'
import { ChatInput } from '@/components/coach/ChatInput'
import { TypingIndicator, SuggestionChips } from '@/components/coach/TypingIndicator'
import { useCoach } from '@/lib/hooks/useCoach'
import { cn } from '@/lib/utils'

interface Props {
  greeting:       string
  recentSessions: Array<{
    id: string; title: string | null; message_count: number; created_at: string
  }>
}

export function CoachClient({ greeting, recentSessions }: Props) {
  const {
    messages, isStreaming, sendMessage, addGreeting, clearSession, setInputDraft,
  } = useCoach()

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [showHistory,   setShowHistory]   = useState(false)
  const [autoScrolled,  setAutoScrolled]  = useState(false)

  // Inject greeting once on mount (if no messages yet)
  useEffect(() => {
    if (!autoScrolled) {
      addGreeting(greeting)
      setAutoScrolled(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    const el = messagesEndRef.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isStreaming])

  // Show scroll-to-bottom button when scrolled up
  const handleScroll = () => {
    const el = messagesAreaRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleClear = () => {
    clearSession()
    setTimeout(() => addGreeting(greeting), 50)
  }

  const showSuggestions = messages.length <= 1 && !isStreaming

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-base" aria-hidden="true">
            🌱
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Bloom</p>
            <p className="text-[10px] text-muted-foreground">AI Reflection Coach · {isStreaming ? 'mengetik...' : 'online'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Riwayat percakapan"
          aria-expanded={showHistory}
        >
          <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 z-30 bg-background/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-14 z-40 w-72 overflow-y-auto border-l border-border bg-background p-4 shadow-xl"
              role="dialog"
              aria-label="Riwayat percakapan"
            >
              <p className="mb-3 text-sm font-medium text-foreground">Riwayat</p>
              {recentSessions.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {recentSessions.map((s) => (
                    <button key={s.id}
                      onClick={() => setShowHistory(false)}
                      className="rounded-xl border border-border p-3 text-left hover:bg-secondary transition-colors"
                    >
                      <p className="text-xs font-medium text-foreground truncate">{s.title ?? 'Sesi tanpa judul'}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {s.message_count} pesan ·{' '}
                        {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada riwayat percakapan.</p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div
        ref={messagesAreaRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-4 py-4"
        role="list"
        aria-label="Percakapan dengan Bloom"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {/* Context disclaimer — first load */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 rounded-xl bg-secondary/50 px-3 py-2 text-center"
            >
              <p className="text-[10px] text-muted-foreground">
                Bloom menggunakan data jurnalmu untuk memberikan insight yang personal. Percakapan tersimpan hanya untukmu. 🔒
              </p>
            </motion.div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLast={i === messages.length - 1}
            />
          ))}

          {/* Typing indicator (only when no streaming content yet) */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <TypingIndicator visible />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="mx-auto w-full max-w-2xl">
        <SuggestionChips
          visible={showSuggestions}
          onSelect={(text) => {
            setInputDraft(text)
            sendMessage(text)
          }}
        />

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: 8 }}
              onClick={scrollToBottom}
              className="absolute bottom-28 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-md hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Gulir ke bawah"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat input */}
        <ChatInput onClear={handleClear} />
      </div>
    </div>
  )
}
