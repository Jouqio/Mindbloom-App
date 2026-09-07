// ============================================================
// MindBloom — Coach Chat API v2 (with RAG Memory)
// File: src/app/api/coach/chat/route.ts (UPDATED FOR SPRINT 10)
//
// CHANGES FROM SPRINT 8:
// - Injects relevant past journal memories into system prompt
// - Uses buildRAGContext() + formatRAGContext() before calling GPT
// ============================================================

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assembleUserContext } from '@/lib/coach/contextAssembler'
import { buildBloomSystemPrompt } from '@/lib/coach/bloomPersona'
import { buildRAGContext, formatRAGContext } from '@/lib/memory/retriever'
import { enforceRateLimit } from '@/lib/ratelimit/guard'
import type { BloomTone } from '@/types/coach'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// NOTE: intentionally NOT using Edge Runtime here. @supabase/supabase-js
// (used inside our server Supabase client) touches process.version
// internally, which Edge Runtime doesn't support, and produces a build
// warning. Node.js runtime (the default) supports streaming responses
// just as well for our use case, so we skip Edge Runtime entirely
// rather than fight this compatibility gap.

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      })
    }

    const limited = await enforceRateLimit(user.id, 'coach_chat')
    if (limited) return limited

    const body = await request.json()
    const { messages, tone = 'warm', sessionId } = body as {
      messages:  Array<{ role: 'user' | 'assistant'; content: string }>
      tone?:     BloomTone
      sessionId: string | null
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── 1. Assemble user context (Sprint 8) ───────────────
    const ctx = await assembleUserContext(user.id)

    // ── 2. Retrieve relevant memories via RAG (Sprint 10) ──
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    const recentUserMsgs = messages
      .filter((m) => m.role === 'user')
      .slice(-3)
      .map((m) => m.content)

    const ragCtx = await buildRAGContext(supabase, user.id, lastUserMsg, recentUserMsgs)
    const ragText = formatRAGContext(ragCtx)

    // ── 3. Build system prompt (base + RAG injection) ──────
    const systemPrompt = buildBloomSystemPrompt(ctx, tone) + ragText

    // ── 4. Call GPT-4o with streaming ─────────────────────
    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-20).map((m) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const stream = await openai.chat.completions.create({
      model:       'gpt-4o',
      messages:    openAIMessages,
      stream:      true,
      max_tokens:  800,
      temperature: 0.75,
    })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent    = ''
        let completionTokens = 0

        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
            }
            if (chunk.usage) completionTokens = chunk.usage.completion_tokens ?? 0
          }

          // Save to database
          await saveCoachMessage(supabase, user.id, sessionId, messages, fullContent)

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, tokens: completionTokens, memories_used: ragCtx.relevantMemories.length })}\n\n`)
          )
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type':      'text/event-stream',
        'Cache-Control':     'no-cache, no-transform',
        'Connection':        'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[POST /api/coach/chat v2]', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function saveCoachMessage(
  supabase: any, userId: string, sessionId: string | null,
  userMessages: Array<{ role: string; content: string }>,
  aiResponse: string
) {
  try {
    let activeSessionId = sessionId

    if (!activeSessionId) {
      const lastUserMsg = [...userMessages].reverse().find((m) => m.role === 'user')
      const { data: session } = await supabase
        .from('coach_sessions')
        .insert({ user_id: userId, title: lastUserMsg?.content.slice(0, 60) ?? 'Sesi baru', message_count: 0 })
        .select('id').single()
      activeSessionId = session?.id ?? null
    }

    if (!activeSessionId) return

    const lastUserMsg = [...userMessages].reverse().find((m) => m.role === 'user')
    if (lastUserMsg) {
      await supabase.from('coach_messages').insert([
        { session_id: activeSessionId, user_id: userId, role: 'user',      content: lastUserMsg.content },
        { session_id: activeSessionId, user_id: userId, role: 'assistant', content: aiResponse },
      ])
      await supabase.from('coach_sessions')
        .update({ message_count: userMessages.length + 1, updated_at: new Date().toISOString() })
        .eq('id', activeSessionId)
    }
  } catch (err) {
    console.error('[saveCoachMessage] non-fatal:', err)
  }
}
