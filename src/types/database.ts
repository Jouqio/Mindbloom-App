// ============================================================
// MindBloom — Supabase Database Types
// File: src/types/database.ts
//
// Hand-written to match supabase/00_COMBINED_ALL_MIGRATIONS.sql.
// Once your schema is live in a real Supabase project, prefer
// regenerating this automatically:
//
//   npm run supabase:types
//
// which runs `npx supabase gen types typescript --local` and is
// guaranteed to match your actual live schema exactly. Until then,
// this file is kept in sync by hand with the migration files in
// supabase/migrations/.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Helper: every table gets Insert = optional Row, Update = optional Row.
// This isn't as strict as generated types (which mark server-defaulted
// columns like `id`/`created_at` as optional and required columns as
// required), but it compiles cleanly and matches how this codebase
// calls .insert()/.update() (partial payloads relying on DB defaults).
//
// IMPORTANT: `Relationships` is required by @supabase/postgrest-js's
// `GenericTable` type. Without it, the Database generic fails to
// structurally match `GenericSchema`, and every query result silently
// collapses to `never` — which is exactly the bug that caused ~130
// "Property 'x' does not exist on type 'never'" errors across this
// codebase before this fix. We don't model actual foreign keys here
// (not needed for our nested `.select('a, b(c)')` usage — those few
// call sites use an explicit local cast instead, see contextAssembler.ts
// for an example), so an empty tuple is enough to satisfy the
// structural check.
type Table<Row> = {
  Row:    Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      // ── Sprint 1 ──────────────────────────────────────────
      profiles: Table<{
        id: string; email: string; full_name: string | null; display_name: string | null
        avatar_url: string | null; bio: string | null; timezone: string; locale: string
        plan: 'free' | 'premium' | 'pro'; onboarded_at: string | null; last_active_at: string | null
        is_deleted: boolean; deleted_at: string | null; created_at: string; updated_at: string
      }>
      user_preferences: Table<{
        id: string; user_id: string; notif_reminder_time: string | null
        notif_enabled: boolean; theme: string; created_at: string; updated_at: string
      }>

      // ── Sprint 3 — Journal ────────────────────────────────
      journal_entries: Table<{
        id: string; user_id: string; entry_date: string; device_platform: string | null
        mood_score: number | null; mood_category: string | null; energy_score: number | null
        main_story: string | null; recurring_thoughts: string | null
        stress_source: string | null; stress_intensity: number | null
        happy_moments: string | null; lessons_learned: string | null
        did_well: string | null; improve_on: string | null; do_differently: string | null
        self_compassion: string | null; tomorrow_intention: string | null; prayer_hope: string | null
        word_count: number; completion_pct: number; is_draft: boolean; draft_step: number | null
        is_deleted: boolean; deleted_at: string | null; written_duration_sec: number | null
        created_at: string; updated_at: string
      }>
      journal_emotions: Table<{
        id: string; entry_id: string; user_id: string; emotion: string
        category: string; valence: string; color_hex: string | null; icon: string | null
        created_at: string
      }>
      gratitude_items: Table<{
        id: string; entry_id: string; user_id: string; text: string
        sort_order: number; created_at: string
      }>
      streaks: Table<{
        id: string; user_id: string; current_streak: number; longest_streak: number
        total_entries: number; last_entry_date: string | null; streak_started_at: string | null
        updated_at: string
      }>
      user_xp: Table<{
        id: string; user_id: string; total_xp: number; current_level: number
        xp_to_next: number; updated_at: string
      }>

      // ── Sprint 4 — Achievements ───────────────────────────
      achievement_definitions: Table<{
        id: string; slug: string; name: string; description: string; icon: string
        category: string; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
        condition_type: string; condition_value: number | null; condition_meta: Json
        xp_reward: number; is_hidden: boolean; sort_order: number; created_at: string
      }>
      user_achievements: Table<{
        id: string; user_id: string; achievement_id: string; earned_at: string
        context: Json; notified: boolean
      }>

      // ── Sprint 5 — Garden ─────────────────────────────────
      garden_plants: Table<{
        id: string; user_id: string; entry_id: string | null; plant_type: string; stage: string
        mood_score: number | null; mood_category: string | null
        position_x: number; position_y: number; is_rare: boolean
        planted_at: string; bloomed_at: string | null; entry_date: string | null; note: string | null
      }>

      // ── Sprint 6 — Breathing / Soundscape ─────────────────
      breathing_sessions: Table<{
        id: string; user_id: string; pattern_id: string
        cycles_completed: number; duration_sec: number; created_at: string
      }>
      soundscape_presets: Table<{
        id: string; user_id: string; name: string; mix: Json; created_at: string
      }>

      // ── Sprint 7 — Habits / Life Wheel ─────────────────────
      habits: Table<{
        id: string; user_id: string; name: string; emoji: string; category: string
        frequency: string; custom_days: number[] | null; target_count: number; unit: string | null
        color: string; is_archived: boolean; current_streak: number; longest_streak: number
        total_completions: number; created_at: string; updated_at: string
      }>
      habit_logs: Table<{
        id: string; habit_id: string; user_id: string; log_date: string
        completed: boolean; count: number; note: string | null; created_at: string
      }>
      life_wheel_entries: Table<{
        id: string; user_id: string; scores: Json; notes: Json; created_at: string
      }>

      // ── Sprint 8 — AI Coach ────────────────────────────────
      coach_sessions: Table<{
        id: string; user_id: string; title: string | null; message_count: number
        created_at: string; updated_at: string
      }>
      coach_messages: Table<{
        id: string; session_id: string; user_id: string
        role: 'user' | 'assistant' | 'system'; content: string; tokens: number | null
        created_at: string
      }>

      // ── Sprint 9 — Insights / EI ───────────────────────────
      ei_scores: Table<{
        id: string; user_id: string; scores: Json; overall: number
        week_start: string; entry_count: number; created_at: string
      }>
      insight_cards: Table<{
        id: string; user_id: string; category: string; title: string; body: string; emoji: string
        stat_value: string | null; stat_label: string | null
        action_label: string | null; action_url: string | null
        priority: 'high' | 'medium' | 'low'; seen_at: string | null
        generated_at: string; valid_until: string
      }>

      // ── Sprint 10 — Memory / RAG ───────────────────────────
      journal_vectors: Table<{
        id: string; entry_id: string; user_id: string; content_hash: string
        embedding: number[] | string; content_text: string; entry_date: string | null
        mood_score: number | null; mood_category: string | null
        created_at: string; updated_at: string
      }>
      embedding_queue: Table<{
        id: string; entry_id: string; user_id: string; queued_at: string
        status: 'pending' | 'done' | 'error'
      }>

      // ── Sprint 12 — Memory Vault ───────────────────────────
      monthly_narratives: Table<{
        id: string; user_id: string; year: number; month: number; month_label: string
        narrative: string; highlights: Json; mood_summary: string | null
        top_emotions: Json; avg_mood: number | null; entry_count: number; word_count: number
        cover_emoji: string; generated_at: string; is_generating: boolean
      }>

      // ── Sprint 14 — Payment / Subscription ────────────────
      user_subscriptions: Table<{
        id: string; user_id: string; plan_id: 'free' | 'premium' | 'pro'
        status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
        billing_cycle: 'monthly' | 'yearly' | null
        trial_ends_at: string | null; current_period_end: string | null; canceled_at: string | null
        midtrans_subscription_id: string | null; created_at: string; updated_at: string
      }>
      payment_transactions: Table<{
        id: string; user_id: string; plan_id: 'free' | 'premium' | 'pro'
        billing_cycle: 'monthly' | 'yearly'; amount: number
        status: 'pending' | 'settlement' | 'expire' | 'cancel' | 'deny' | 'failure'
        midtrans_order_id: string; midtrans_token: string | null; payment_type: string | null
        created_at: string; paid_at: string | null
      }>

      // ── Rate limiting ──────────────────────────────────────
      rate_limit_counters: Table<{
        id: string; user_id: string; bucket_key: string; window_start: string
        request_count: number; updated_at: string
      }>
    }
    Views: Record<string, never>
    Functions: {
      search_journal_memories: {
        Args: {
          p_user_id: string
          p_query_embedding: number[] | string
          p_match_count?: number
          p_min_similarity?: number
          p_exclude_entry?: string | null
        }
        Returns: {
          entry_id: string; entry_date: string; mood_score: number | null
          mood_category: string | null; main_story: string | null; similarity: number
        }[]
      }
      get_month_summary: {
        Args: { p_user_id: string; p_year: number; p_month: number }
        Returns: { entry_count: number; avg_mood: number | null; total_words: number }[]
      }
      check_achievements_after_journal: { Args: { p_user_id: string }; Returns: void }
      cleanup_expired_insights: { Args: Record<string, never>; Returns: void }
      downgrade_expired_subscriptions: { Args: Record<string, never>; Returns: void }
      increment_rate_limit: {
        Args: { p_user_id: string; p_bucket_key: string; p_window_start: string }
        Returns: number
      }
      cleanup_rate_limit_counters: { Args: Record<string, never>; Returns: void }
    }
    Enums: {
      user_plan: 'free' | 'premium' | 'pro'
    }
  }
}
