// ============================================================
// MindBloom — Breathing Session API Route
// File: src/app/api/breathing/session/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pattern_id, cycles_completed, duration_sec } = await request.json()

    if (!pattern_id || duration_sec === undefined) {
      return NextResponse.json({ error: 'pattern_id and duration_sec required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('breathing_sessions')
      .insert({
        user_id:          user.id,
        pattern_id,
        cycles_completed: cycles_completed ?? 0,
        duration_sec,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ data: { id: data.id } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/breathing/session]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50)

    const { data, count } = await supabase
      .from('breathing_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return NextResponse.json({ data, count })
  } catch (err) {
    console.error('[GET /api/breathing/session]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
