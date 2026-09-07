// ============================================================
// MindBloom — Garden Grow API Route
// File: src/app/api/garden/grow/route.ts
// Triggered after journal save to plant a new plant
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MOOD_TO_PLANT, getGardenLevel, GARDEN_LEVELS, type PlantType } from '@/types/garden'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { entry_id, mood_category, mood_score, completion_pct } = await request.json()

    if (!entry_id) {
      return NextResponse.json({ error: 'entry_id required' }, { status: 400 })
    }

    // Check if plant already exists for this entry (prevent duplicates)
    const { data: existing } = await supabase
      .from('garden_plants')
      .select('id')
      .eq('entry_id', entry_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ data: { already_planted: true, plant_id: existing.id } })
    }

    // Get current streak for bamboo logic
    const { data: streakRow } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .maybeSingle()

    const streak = streakRow?.current_streak ?? 0

    // Get total entries for garden level + rare plant logic
    const { count: totalEntries } = await supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_draft', false)
      .eq('is_deleted', false)

    const total = totalEntries ?? 0
    const level = getGardenLevel(total)
    const levelCfg = GARDEN_LEVELS[level]

    // Determine plant type
    let plantType: PlantType = 'fern'
    let isRare = false

    if (streak > 0 && streak % 7 === 0) {
      plantType = 'bamboo' // Weekly streak milestone
    } else if (completion_pct >= 95) {
      plantType = 'lavender'
      isRare = Math.random() < 0.15 // 15% chance of rare lavender→bonsai swap
      if (isRare) plantType = 'bonsai'
    } else if (mood_category && MOOD_TO_PLANT[mood_category]) {
      plantType = MOOD_TO_PLANT[mood_category]
    }

    // Special rare: every 10th entry has a chance for sakura
    if (total > 0 && total % 10 === 0 && Math.random() < 0.4) {
      plantType = 'sakura'
      isRare = true
    }

    // Determine stage based on mood score (higher mood = more bloomed)
    const stage =
      !mood_score        ? 'sprout' :
      mood_score >= 8    ? 'full'    :
      mood_score >= 6    ? 'bloom'   :
      mood_score >= 4    ? 'growing' :
                            'sprout'

    // Check if garden is at capacity — if so, don't add more (or recycle oldest)
    const { count: plantCount } = await supabase
      .from('garden_plants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((plantCount ?? 0) >= levelCfg.maxPlants) {
      // Garden full for this level — still record but mark as overflow
      // (In production, you might want to expand garden visually or rotate)
    }

    // Random position within garden bounds (avoid edges)
    const position_x = 10 + Math.random() * 80
    const position_y = 5  + Math.random() * 35

    const { data: newPlant, error } = await supabase
      .from('garden_plants')
      .insert({
        user_id:       user.id,
        entry_id,
        plant_type:    plantType,
        stage,
        mood_score:    mood_score ?? 5,
        mood_category: mood_category ?? 'calm',
        position_x,
        position_y,
        is_rare:       isRare,
        planted_at:    new Date().toISOString(),
        bloomed_at:    (stage === 'bloom' || stage === 'full') ? new Date().toISOString() : null,
        entry_date:    new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data: {
        plant:       newPlant,
        garden_level:level,
        is_rare:     isRare,
        plant_type:  plantType,
      },
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/garden/grow]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
