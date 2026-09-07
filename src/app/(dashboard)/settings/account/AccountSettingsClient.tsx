// ============================================================
// MindBloom — Account Settings Client
// File: src/app/(dashboard)/settings/account/AccountSettingsClient.tsx
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, Trash2, AlertTriangle, Loader2, Calendar, BookOpen, ShieldAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  email:        string
  displayName:  string | null
  memberSince:  string
  journalCount: number
}

const DELETE_CONFIRMATION_PHRASE = 'HAPUS AKUN SAYA'

export function AccountSettingsClient({ email, displayName, memberSince, journalCount }: Props) {
  const router = useRouter()

  // Export state
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Delete state — deliberately multi-step
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) throw new Error('Export failed')

      // Trigger a real file download in the browser.
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const filenameMatch = disposition.match(/filename="([^"]+)"/)
      a.href = url
      a.download = filenameMatch?.[1] ?? 'mindbloom-export.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setExportError('Gagal mengekspor data. Coba lagi.')
      console.error('[AccountSettings] export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    setDeleteStep('deleting')
    setDeleteError(null)
    try {
      const res = await fetch('/api/account/delete', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ confirmation: confirmText }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Gagal menghapus akun')
      }

      // Sign out locally, then redirect — the account and all data
      // are already gone server-side at this point.
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus akun'
      setDeleteError(msg)
      setDeleteStep('confirm')
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const canConfirmDelete = confirmText === DELETE_CONFIRMATION_PHRASE

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:px-6 md:pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-medium text-foreground">Akun &amp; Data</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
      </div>

      {/* Account summary */}
      <div className="mb-5 rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-medium text-foreground mb-3">
          {displayName ?? 'Pengguna MindBloom'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[10px] text-muted-foreground">Bergabung sejak</p>
              <p className="text-xs font-medium text-foreground">{formatDate(memberSince)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[10px] text-muted-foreground">Total jurnal</p>
              <p className="text-xs font-medium text-foreground">{journalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export data */}
      <div className="mb-5 rounded-2xl border border-border bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Ekspor Data</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Unduh seluruh jurnal, habit, achievement, dan riwayat chat dengan Bloom
              dalam satu file JSON. Sesuai hak akses data di{' '}
              <a href="/privacy" className="text-primary underline-offset-4 hover:underline">
                Kebijakan Privasi
              </a>.
            </p>
            {exportError && (
              <p className="mt-2 text-xs text-destructive">{exportError}</p>
            )}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isExporting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                : <Download className="h-3.5 w-3.5" aria-hidden="true" />
              }
              {isExporting ? 'Menyiapkan file...' : 'Unduh data saya'}
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/[0.02] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="h-4.5 w-4.5 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Hapus Akun</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Menghapus akun akan menghapus <strong className="text-foreground">seluruh</strong> data
              secara permanen — jurnal, habit, achievement, taman, riwayat chat, dan langganan
              (langganan aktif akan dibatalkan otomatis). Tindakan ini{' '}
              <strong className="text-foreground">tidak bisa dibatalkan</strong>.
            </p>

            <AnimatePresence mode="wait">
              {deleteStep === 'idle' && (
                <motion.button
                  key="trigger"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setDeleteStep('confirm')}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Hapus akun saya
                </motion.button>
              )}

              {(deleteStep === 'confirm' || deleteStep === 'deleting') && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-xl bg-destructive/5 border border-destructive/20 p-3.5"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-destructive">
                      Sarankan mengunduh data dulu sebelum lanjut — setelah dihapus, tidak ada
                      cara mengembalikannya.
                    </p>
                  </div>

                  <label htmlFor="delete-confirm" className="mb-1.5 block text-xs font-medium text-foreground">
                    Ketik <span className="font-mono text-destructive">{DELETE_CONFIRMATION_PHRASE}</span> untuk melanjutkan
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    disabled={deleteStep === 'deleting'}
                    placeholder={DELETE_CONFIRMATION_PHRASE}
                    className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                    autoComplete="off"
                    autoFocus
                  />

                  {deleteError && (
                    <p className="mt-2 text-xs text-destructive">{deleteError}</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { setDeleteStep('idle'); setConfirmText(''); setDeleteError(null) }}
                      disabled={deleteStep === 'deleting'}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={!canConfirmDelete || deleteStep === 'deleting'}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-white hover:bg-destructive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deleteStep === 'deleting' ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          Hapus permanen
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}
