export type UserPlan = 'free' | 'premium' | 'pro'
export interface Profile {
  id: string; email: string; full_name: string | null; display_name: string | null
  avatar_url: string | null; bio: string | null; timezone: string; locale: string
  plan: UserPlan; onboarded_at: string | null; last_active_at: string | null
  is_deleted: boolean; deleted_at: string | null; created_at: string; updated_at: string
}
export interface AuthUser { id: string; email: string; profile: Profile | null }
export type AuthProvider = 'google' | 'email'
