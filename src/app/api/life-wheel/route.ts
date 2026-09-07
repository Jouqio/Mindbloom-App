// ============================================================
// MindBloom — Life Wheel API Route
// File: src/app/api/life-wheel/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LifeDimension } from '@/types/lifewheel'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { scores, notes } = await request.json()
    if (!scores) return NextResponse.json({ error: 'scores required' }, { status: 400 })

    // Enforce 7-day cooldown
    const { data: latest } = await supabase
      .from('life_wheel_entries')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latest) {
      const daysSince = Math.floor(
        (Date.now() - new Date(latest.created_at).getTime()) / 86400000
      )
      if (daysSince < 7) {
        return NextResponse.json(
          { error: `Life Wheel bisa diisi lagi dalam ${7 - daysSince} hari` },
          { status: 429 }
        )
      }
    }

    const { data, error } = await supabase
      .from('life_wheel_entries')
      .insert({
        user_id: user.id,
        scores,
        notes: notes ?? {},
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/life-wheel]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, count } = await supabase
      .from('life_wheel_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12)

    return NextResponse.json({ data, count })
  } catch (err) {
    console.error('[GET /api/life-wheel]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
