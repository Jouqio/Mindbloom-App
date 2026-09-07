'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginSchema } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' },
  })
  const onSubmit = async (data: LoginSchema) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (error) {
      if (error.message.includes('Invalid login credentials')) setServerError('Email atau password salah.')
      else if (error.message.includes('Email not confirmed')) setServerError('Email belum diverifikasi. Cek kotak masukmu.')
      else if (error.message.includes('Too many requests')) setServerError('Terlalu banyak percobaan. Coba lagi nanti.')
      else setServerError('Terjadi kesalahan. Silakan coba lagi.')
      return
    }
    setIsSuccess(true)
    router.push(redirectTo)
    router.refresh()
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div key="err" initial={{ opacity:0, y:-8, height:0 }} animate={{ opacity:1, y:0, height:'auto' }} exit={{ opacity:0, y:-8, height:0 }} transition={{ duration:0.2 }}
            className="mb-4 flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive" role="alert" aria-live="assertive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
        <input id="email" type="email" autoComplete="email" placeholder="nama@email.com"
          aria-invalid={!!errors.email} {...register('email')}
          className={cn('w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
            errors.email ? 'border-destructive' : 'border-border hover:border-border/80')} />
        {errors.email && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive" role="alert"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.email.message}</p>}
      </div>
      {/* Password */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-4">Lupa password?</Link>
        </div>
        <div className="relative">
          <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan password"
            aria-invalid={!!errors.password} {...register('password')}
            className={cn('w-full rounded-xl border bg-background py-2.5 pl-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
              errors.password ? 'border-destructive' : 'border-border hover:border-border/80')} />
          <button type="button" onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive" role="alert"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.password.message}</p>}
      </div>
      <motion.button type="submit" disabled={isSubmitting || isSuccess}
        whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {(isSubmitting || isSuccess) && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSuccess ? 'Berhasil masuk...' : isSubmitting ? 'Memverifikasi...' : 'Masuk'}
      </motion.button>
    </form>
  )
}
