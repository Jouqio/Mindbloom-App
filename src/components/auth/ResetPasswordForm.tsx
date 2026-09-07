'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordSchema } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
export function ResetPasswordForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirm_password: '' },
  })
  const password = watch('password', '')
  const checks = [
    { met: password.length >= 8, text: 'Minimal 8 karakter' },
    { met: /[A-Z]/.test(password), text: 'Minimal 1 huruf kapital' },
    { met: /[0-9]/.test(password), text: 'Minimal 1 angka' },
  ]
  const onSubmit = async (data: ResetPasswordSchema) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      if (error.message.includes('same password')) setServerError('Password baru tidak boleh sama dengan yang lama.')
      else setServerError('Gagal mengubah password. Link mungkin sudah kedaluwarsa.')
      return
    }
    setIsSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }
  if (isSuccess) {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.3 }}
        className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-medium">Password berhasil diubah!</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Mengalihkan ke dashboard...</p>
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <motion.div initial={{ width:'0%' }} animate={{ width:'100%' }} transition={{ duration:2.5, ease:'linear' }} className="h-full bg-green-500" />
        </div>
      </motion.div>
    )
  }
  const inputClass = (hasError: boolean) => cn(
    'w-full rounded-xl border bg-background py-2.5 pl-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
    hasError ? 'border-destructive' : 'border-border hover:border-border/80'
  )
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div key="err" initial={{ opacity:0, y:-8, height:0 }} animate={{ opacity:1, y:0, height:'auto' }} exit={{ opacity:0, y:-8, height:0 }} transition={{ duration:0.2 }}
            className="mb-4 flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" /><span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-4">
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">Password baru</label>
        <div className="relative">
          <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Minimal 8 karakter"
            aria-invalid={!!errors.password} {...register('password')} className={inputClass(!!errors.password)} />
          <button type="button" onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none rounded"
            aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}>
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            {checks.map(({ met, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <div className={cn('h-3.5 w-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors', met ? 'bg-green-500' : 'bg-muted border border-border')} aria-hidden="true">
                  {met && <svg viewBox="0 0 10 10" className="h-2 w-2 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4"/></svg>}
                </div>
                <span className={cn('text-xs', met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mb-5">
        <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-medium text-foreground">Konfirmasi password baru</label>
        <div className="relative">
          <input id="confirm_password" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi password baru"
            aria-invalid={!!errors.confirm_password} {...register('confirm_password')} className={inputClass(!!errors.confirm_password)} />
          <button type="button" onClick={() => setShowConfirm(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none rounded"
            aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}>
            {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {errors.confirm_password && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive" role="alert"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.confirm_password.message}</p>}
      </div>
      <motion.button type="submit" disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Menyimpan...' : 'Simpan password baru'}
      </motion.button>
    </form>
  )
}
