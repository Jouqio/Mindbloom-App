'use client'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types/auth'
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setUser, setSession, setProfile, setLoading, setInitialized, clearAuth } = useAuthStore()
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).eq('is_deleted', false).single()
    if (error) { console.error('[AuthProvider] fetchProfile:', error.message); return null }
    return data as Profile
  }, [])
  const handleAuthChange = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    setSession(session); setUser(session?.user ?? null)
    if (session?.user) { const profile = await fetchProfile(session.user.id); setProfile(profile) } else { setProfile(null) }
    setLoading(false); setInitialized(true)
    if (event === 'SIGNED_IN') { router.refresh() }
    else if (event === 'SIGNED_OUT') { clearAuth(); router.push('/login'); router.refresh() }
    else if (event === 'USER_UPDATED' && session?.user) { const p = await fetchProfile(session.user.id); setProfile(p) }
    else if (event === 'PASSWORD_RECOVERY') { router.push('/reset-password') }
  }, [router, setUser, setSession, setProfile, setLoading, setInitialized, clearAuth, fetchProfile])
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null)
      if (session?.user) { const p = await fetchProfile(session.user.id); setProfile(p) }
      setLoading(false); setInitialized(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
    return () => { subscription.unsubscribe() }
  }, [handleAuthChange, fetchProfile, setUser, setSession, setProfile, setLoading, setInitialized])
  return <>{children}</>
}
