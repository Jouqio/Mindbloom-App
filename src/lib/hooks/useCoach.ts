// ============================================================
// MindBloom — useCoach Hook (SSE streaming)
// File: src/lib/hooks/useCoach.ts
// ============================================================

'use client'

import { useCallback } from 'react'
import { useCoachStore } from '@/store/coachStore'
import type { ChatMessage } from '@/types/coach'

function genId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function useCoach() {
  const store = useCoachStore()

  // ── Send a message and stream the response ────────────────
  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || store.isStreaming) return

    // 1. Add user message
    const userMsg: ChatMessage = {
      id:        genId(),
      role:      'user',
      content:   userText.trim(),
      status:    'done',
      createdAt: new Date().toISOString(),
    }
    store.addMessage(userMsg)
    store.setInputDraft('')

    // 2. Add placeholder assistant message
    const assistantId = genId()
    const assistantMsg: ChatMessage = {
      id:        assistantId,
      role:      'assistant',
      content:   '',
      status:    'sending',
      createdAt: new Date().toISOString(),
    }
    store.addMessage(assistantMsg)
    store.setStreaming(true)

    try {
      // 3. Build message history for API (exclude the empty placeholder)
      const history = useCoachStore
        .getState()
        .messages
        .filter((m) => m.id !== assistantId && m.status !== 'error')
        .map((m) => ({ role: m.role, content: m.content }))

      // 4. Call streaming endpoint
      const res = await fetch('/api/coach/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:  history,
          tone:      store.tone,
          sessionId: store.sessionId,
        }),
      })

      if (!res.ok || !res.body) {
        if (res.status === 429) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error ?? 'Terlalu banyak permintaan. Coba lagi sebentar lagi.')
        }
        throw new Error(`HTTP ${res.status}`)
      }

      // 5. Read SSE stream
      store.updateMessage(assistantId, { status: 'streaming' })

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const parsed = JSON.parse(jsonStr)

            if (parsed.delta) {
              accumulated += parsed.delta
              store.updateMessage(assistantId, {
                content: accumulated,
                status:  'streaming',
              })
            }

            if (parsed.done) {
              store.updateMessage(assistantId, {
                status: 'done',
                tokens: parsed.tokens,
              })
            }

            if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      store.updateMessage(assistantId, { status: 'done' })

    } catch (err) {
      console.error('[useCoach] sendMessage error:', err)
      const isRateLimit = err instanceof Error && err.message.includes('Terlalu banyak permintaan')
      store.updateMessage(assistantId, {
        content: isRateLimit
          ? `⏳ ${(err as Error).message}`
          : 'Maaf, terjadi kesalahan. Coba lagi ya. 🙏',
        status:  'error',
      })
    } finally {
      store.setStreaming(false)
    }
  }, [store])

  // ── Add Bloom's greeting as the first message ─────────────
  const addGreeting = useCallback((greeting: string) => {
    if (store.messages.length > 0) return
    store.addMessage({
      id:        genId(),
      role:      'assistant',
      content:   greeting,
      status:    'done',
      createdAt: new Date().toISOString(),
    })
  }, [store])

  return {
    messages:    store.messages,
    sessionId:   store.sessionId,
    isStreaming: store.isStreaming,
    tone:        store.tone,
    inputDraft:  store.inputDraft,
    sendMessage,
    addGreeting,
    setTone:       store.setTone,
    setInputDraft: store.setInputDraft,
    clearSession:  store.clearSession,
  }
}
