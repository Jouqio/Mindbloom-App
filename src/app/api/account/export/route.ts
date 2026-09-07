// ============================================================
// MindBloom — Data Export API Route
// File: src/app/api/account/export/route.ts
//
// Returns everything MindBloom knows about the requesting user as a
// single downloadable JSON file. This is what Privacy Policy §5
// promises: "Mengakses dan mengunduh seluruh data jurnalmu kapan saja."
//
// Uses the user's own authenticated client (not the admin client) —
// RLS naturally scopes every query to the requester's own rows, which
// also means this endpoint can never be used to exfiltrate someone
// else's data even if userId were somehow spoofed.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch everything in parallel. Every query is naturally scoped to
    // this user by RLS — no explicit .eq('user_id', ...) could leak
    // another user's row even if this code had a bug, because the
    // database itself enforces the boundary.
    const [
      profile, journalEntries, journalEmotions, gratitudeItems, streaks, userXp,
      userAchievements, gardenPlants, breathingSessions, habits, habitLogs,
      lifeWheelEntries, coachSessions, coachMessages, eiScores, insightCards,
      monthlyNarratives, subscription, transactions,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('journal_entries').select('*').eq('user_id', user.id).order('entry_date'),
      supabase.from('journal_emotions').select('*').eq('user_id', user.id),
      supabase.from('gratitude_items').select('*').eq('user_id', user.id),
      supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_xp').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_achievements').select('*, achievement_definitions(name, description)').eq('user_id', user.id),
      supabase.from('garden_plants').select('*').eq('user_id', user.id),
      supabase.from('breathing_sessions').select('*').eq('user_id', user.id),
      supabase.from('habits').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id),
      supabase.from('life_wheel_entries').select('*').eq('user_id', user.id),
      supabase.from('coach_sessions').select('*').eq('user_id', user.id),
      supabase.from('coach_messages').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('ei_scores').select('*').eq('user_id', user.id),
      supabase.from('insight_cards').select('*').eq('user_id', user.id),
      supabase.from('monthly_narratives').select('*').eq('user_id', user.id),
      supabase.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      // Deliberately exclude midtrans_token from the export — it's an
      // internal payment-gateway credential, not user data, and has no
      // reason to end up in a file the user might share/store insecurely.
      supabase.from('payment_transactions')
        .select('id, plan_id, billing_cycle, amount, status, payment_type, created_at, paid_at')
        .eq('user_id', user.id),
    ])

    const exportData = {
      export_meta: {
        generated_at: new Date().toISOString(),
        format_version: 1,
        user_id: user.id,
        note: 'Ekspor lengkap data MindBloom-mu. Simpan file ini di tempat yang aman.',
      },
      profile:             profile.data,
      journal_entries:     journalEntries.data ?? [],
      journal_emotions:    journalEmotions.data ?? [],
      gratitude_items:     gratitudeItems.data ?? [],
      streak:              streaks.data,
      xp:                  userXp.data,
      achievements:        userAchievements.data ?? [],
      garden_plants:       gardenPlants.data ?? [],
      breathing_sessions:  breathingSessions.data ?? [],
      habits:              habits.data ?? [],
      habit_logs:          habitLogs.data ?? [],
      life_wheel_entries:  lifeWheelEntries.data ?? [],
      coach_sessions:      coachSessions.data ?? [],
      coach_messages:      coachMessages.data ?? [],
      ei_scores:           eiScores.data ?? [],
      insight_cards:       insightCards.data ?? [],
      monthly_narratives:  monthlyNarratives.data ?? [],
      subscription:        subscription.data,
      payment_transactions:transactions.data ?? [],
    }

    const filename = `mindbloom-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type':        'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'no-store',
      },
    })
  } catch (err) {
    console.error('[GET /api/account/export]', err)
    return NextResponse.json({ error: 'Gagal mengekspor data. Coba lagi.' }, { status: 500 })
  }
}
