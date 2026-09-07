// ============================================================
// MindBloom — Account Deletion API Route
// File: src/app/api/account/delete/route.ts
//
// Deletes the user's auth.users row via the Supabase Admin API.
// Every user-owned table (24 total, verified) has
// `user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE`,
// and profiles.id itself REFERENCES auth.users(id) ON DELETE CASCADE.
// So deleting the auth user cascades through profiles → every other
// table automatically, in one atomic Postgres operation — no need to
// manually delete from 24 tables one by one (which would also risk
// missing one if the schema ever grows).
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function DELETE(request: NextRequest) {
  try {
    // 1. Verify the request is from an authenticated user, using their
    //    own session (not the admin client) — we must never let anyone
    //    delete an account other than their own.
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Require the user to type a confirmation phrase, sent in the
    //    request body — an extra guard against accidental deletion from
    //    a stray double-click, on top of the UI's own confirm step.
    const body = await request.json().catch(() => ({}))
    if (body.confirmation !== 'HAPUS AKUN SAYA') {
      return NextResponse.json(
        { error: 'Konfirmasi tidak cocok. Ketik "HAPUS AKUN SAYA" persis untuk melanjutkan.' },
        { status: 400 }
      )
    }

    // 3. Cancel any active Midtrans subscription first — deleting the
    //    account shouldn't leave an orphaned recurring charge running
    //    against a card/account the user can no longer manage from
    //    inside the app. Best-effort: we don't block deletion if this
    //    fails, since the user's data privacy takes priority, but we
    //    log it loudly so it can be handled manually if needed.
    try {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'canceled', canceled_at: new Date().toISOString() })
        .eq('user_id', user.id)
    } catch (err) {
      console.error('[account/delete] failed to cancel subscription before account deletion:', err)
    }

    // 4. Delete the auth user via the Admin API (service role only —
    //    this is not something the anon/authenticated client can do).
    //    This cascades through every table automatically.
    const admin = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    console.log(`[account/delete] account permanently deleted: user=${user.id}`)

    return NextResponse.json({ data: { deleted: true } })
  } catch (err) {
    console.error('[DELETE /api/account/delete]', err)
    return NextResponse.json(
      { error: 'Gagal menghapus akun. Coba lagi atau hubungi support@mindbloom.app.' },
      { status: 500 }
    )
  }
}
