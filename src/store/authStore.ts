import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/auth'
interface AuthState {
  user: User | null; session: Session | null; profile: Profile | null
  isLoading: boolean; isInitialized: boolean
  setUser: (u: User | null) => void; setSession: (s: Session | null) => void
  setProfile: (p: Profile | null) => void; setLoading: (v: boolean) => void
  setInitialized: (v: boolean) => void; clearAuth: () => void
  updateProfile: (u: Partial<Profile>) => void
}
export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    user: null, session: null, profile: null, isLoading: true, isInitialized: false,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialized: (isInitialized) => set({ isInitialized }),
    clearAuth: () => set({ user: null, session: null, profile: null, isLoading: false }),
    updateProfile: (updates) => set((s) => ({ profile: s.profile ? { ...s.profile, ...updates } : null })),
  }), {
    name: 'mindbloom-auth',
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({ profile: s.profile, isInitialized: s.isInitialized }),
  })
)
