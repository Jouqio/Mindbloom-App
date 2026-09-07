// ============================================================
// MindBloom — Journal New Page
// File: src/app/(dashboard)/journal/new/page.tsx
// ============================================================

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JournalForm } from '@/components/journal/JournalForm'

export const metadata: Metadata = {
  title: 'Tulis Jurnal',
  description: 'Refleksikan harimu dalam 15 langkah yang bermakna.',
}

export default async function NewJournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if already wrote today — allow editing
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('journal_entries')
    .select('id, is_draft, completion_pct')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .maybeSingle()

  // If today's journal exists and is complete (not draft), show option
  // But still allow editing by going to the form
  return <JournalForm />
}
