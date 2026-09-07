// ============================================================
// MindBloom — Auth Callback Route Handler
// File: src/app/auth/callback/route.ts
// Handles: Google OAuth callback, email verification,
//          password recovery redirect
// ============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code        = searchParams.get('code')
  const type        = searchParams.get('type')       // 'recovery' | undefined
  const redirectTo  = searchParams.get('redirectTo') // post-login destination
  const next        = redirectTo ?? '/dashboard'

  // ── Exchange auth code for session ──────────────────────────
  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[AuthCallback] exchangeCodeForSession error:', error.message)
      const errorUrl = new URL('/login', origin)
      errorUrl.searchParams.set('error', 'auth_callback_failed')
      return NextResponse.redirect(errorUrl)
    }

    // ── Password recovery flow ─────────────────────────────────
    if (type === 'recovery') {
      const url = new URL('/reset-password', origin)
      return NextResponse.redirect(url)
    }

    // ── OAuth or email verification success ────────────────────
    // Check onboarding status
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded_at')
        .eq('id', user.id)
        .single()

      if (profile && !profile.onboarded_at) {
        const url = new URL('/onboarding', origin)
        return NextResponse.redirect(url)
      }
    }

    const url = new URL(next, origin)
    return NextResponse.redirect(url)
  }

  // ── No code — something went wrong ─────────────────────────
  const errorUrl = new URL('/login', origin)
  errorUrl.searchParams.set('error', 'missing_code')
  return NextResponse.redirect(errorUrl)
}
