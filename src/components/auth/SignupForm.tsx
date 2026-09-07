'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupSchema } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-3.5 w-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors', met ? 'bg-green-500 text-white' : 'bg-muted border border-border')} aria-hidden="true">
        {met && <svg viewBox="0 0 10 10" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4"/></svg>}
      </div>
      <span className={cn('text-xs transition-colors', met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>{text}</span>
    </div>
  )
}
export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema), defaultValues: { full_name: '', email: '', password: '', confirm_password: '' },
  })
  const password = watch('password', '')
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const onSubmit = async (data: SignupSchema) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { full_name: data.full_name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    })
    if (error) {
      if (error.message.includes('User already registered')) setServerError('Email sudah terdaftar. Silakan masuk.')
      else setServerError('Terjadi kesalahan saat mendaftar. Coba lagi.')
      return
    }
    setIsEmailSent(true)
  }
  if (isEmailSent) {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.3 }}
        className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-medium">Cek email kamu!</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Kami kirim link verifikasi ke emailmu. Klik link tersebut untuk mengaktifkan akun.</p>
        </div>
        <button type="button" onClick={() => setIsEmailSent(false)} className="text-xs text-primary underline-offset-4 hover:underline">Kembali</button>
      </motion.div>
    )
  }
  const inputClass = (hasError: boolean) => cn(
    'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
    hasError ? 'border-destructive' : 'border-border hover:border-border/80'
  )
  const errMsg = (msg: string | undefined) => msg ? <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive" role="alert"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{msg}</p> : null
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div key="err" initial={{ opacity:0, y:-8, height:0 }} animate={{ opacity:1, y:0, height:'auto' }} exit={{ opacity:0, y:-8, height:0 }} transition={{ duration:0.2 }}
            className="mb-4 flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive" role="alert" aria-live="assertive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" /><span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-4">
        <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-foreground">Nama lengkap</label>
        <input id="full_name" type="text" autoComplete="name" placeholder="Nama lengkapmu" aria-invalid={!!errors.full_name} {...register('full_name')} className={inputClass(!!errors.full_name)} />
        {errMsg(errors.full_name?.message)}
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
        <input id="email" type="email" autoComplete="email" placeholder="nama@email.com" aria-invalid={!!errors.email} {...register('email')} className={inputClass(!!errors.email)} />
        {errMsg(errors.email?.message)}
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Minimal 8 karakter"
            aria-invalid={!!errors.password} {...register('password')}
            className={cn(inputClass(!!errors.password), 'pr-10')} />
          <button type="button" onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none rounded"
            aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}>
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2 space-y-1" aria-label="Persyaratan password">
            <PasswordRule met={hasMinLength} text="Minimal 8 karakter" />
            <PasswordRule met={hasUppercase} text="Minimal 1 huruf kapital" />
            <PasswordRule met={hasNumber} text="Minimal 1 angka" />
          </div>
        )}
      </div>
      <div className="mb-5">
        <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-medium text-foreground">Konfirmasi password</label>
        <div className="relative">
          <input id="confirm_password" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi password"
            aria-invalid={!!errors.confirm_password} {...register('confirm_password')}
            className={cn(inputClass(!!errors.confirm_password), 'pr-10')} />
          <button type="button" onClick={() => setShowConfirm(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none rounded"
            aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}>
            {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {errMsg(errors.confirm_password?.message)}
      </div>
      <motion.button type="submit" disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Mendaftar...' : 'Buat akun'}
      </motion.button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Dengan mendaftar, kamu menyetujui <a href="/terms" className="underline underline-offset-4 hover:text-foreground">Syarat & Ketentuan</a> dan <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">Kebijakan Privasi</a>.
      </p>
    </form>
  )
}
