// ============================================================
// MindBloom — Achievement Award API Route
// File: src/app/api/achievements/award/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ACHIEVEMENT_DEFINITIONS, getLevelFromXP } from '@/types/achievement'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    // Find definition
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === slug)
    if (!def) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })

    // Get or create definition row
    const { data: defRow } = await supabase
      .from('achievement_definitions')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!defRow) {
      return NextResponse.json({ error: 'Definition not seeded' }, { status: 404 })
    }

    // Check not already earned
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', defRow.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ data: { already_earned: true } })
    }

    // Award achievement
    const { data: awarded, error: awardError } = await supabase
      .from('user_achievements')
      .insert({
        user_id:        user.id,
        achievement_id: defRow.id,
        earned_at:      new Date().toISOString(),
        notified:       false,
        context:        {},
      })
      .select('id')
      .single()

    if (awardError) throw awardError

    // Award XP
    const { data: xpRow } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', user.id)
      .maybeSingle()

    const currentXP  = xpRow?.total_xp ?? 0
    const newTotalXP = currentXP + def.xp_reward
    const { currentLevel, nextLevel, progressPct } = getLevelFromXP(newTotalXP)

    await supabase
      .from('user_xp')
      .upsert({
        user_id:       user.id,
        total_xp:      newTotalXP,
        current_level: currentLevel.level,
        xp_to_next:    nextLevel
          ? nextLevel.xp_needed - currentLevel.xp_needed
          : 100,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id' })

    return NextResponse.json({
      data: {
        awarded:          true,
        achievement_id:   awarded.id,
        xp_earned:        def.xp_reward,
        new_total_xp:     newTotalXP,
        level:            currentLevel.level,
        level_up:         currentLevel.level > getLevelFromXP(currentXP).currentLevel.level,
      },
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/achievements/award]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
