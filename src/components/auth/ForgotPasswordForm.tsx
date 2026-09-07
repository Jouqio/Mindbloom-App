'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' },
  })
  const onSubmit = async (data: ForgotPasswordSchema) => {
    setServerError(null)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
    })
    // Always show success — prevents email enumeration
    setSentToEmail(data.email)
    setIsEmailSent(true)
  }
  if (isEmailSent) {
    return (
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.3 }}
        className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <CheckCircle2 className="h-7 w-7 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-medium">Email terkirim!</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Jika <span className="font-medium text-foreground">{sentToEmail}</span> terdaftar, kamu akan menerima link reset password. Cek folder Spam jika tidak ada. Link berlaku 60 menit.
          </p>
        </div>
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Kembali ke halaman masuk
        </Link>
      </motion.div>
    )
  }
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
      <div className="mb-5">
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
        <input id="email" type="email" autoComplete="email" placeholder="nama@email.com" aria-invalid={!!errors.email} {...register('email')}
          className={cn('w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/60',
            errors.email ? 'border-destructive' : 'border-border hover:border-border/80')} />
        {errors.email && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive" role="alert"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{errors.email.message}</p>}
      </div>
      <motion.button type="submit" disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Mengirim...' : 'Kirim link reset'}
      </motion.button>
      <div className="mt-5 text-center">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Kembali ke halaman masuk
        </Link>
      </div>
    </form>
  )
}
