// ============================================================
// MindBloom — Habit [id] API Route
// File: src/app/api/habits/[id]/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, emoji, category, frequency, custom_days, target_count, unit, color } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name        !== undefined) updates.name         = name.trim()
    if (emoji       !== undefined) updates.emoji        = emoji
    if (category    !== undefined) updates.category     = category
    if (frequency   !== undefined) updates.frequency    = frequency
    if (custom_days !== undefined) updates.custom_days  = custom_days
    if (target_count!== undefined) updates.target_count = target_count
    if (unit        !== undefined) updates.unit         = unit
    if (color       !== undefined) updates.color        = color

    const { data, error } = await supabase
      .from('habits')
      .update(updates as any)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PATCH /api/habits/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Soft delete — archive
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ data: { archived: true } })
  } catch (err) {
    console.error('[DELETE /api/habits/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
