'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
interface AuthCardProps { children: React.ReactNode; title: string; subtitle?: string; className?: string }
export function AuthCard({ children, title, subtitle, className }: AuthCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className={cn('w-full rounded-2xl border border-border bg-background p-8 shadow-sm', className)}>
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <span className="text-xl" aria-hidden="true">🌱</span>
        </div>
        <h1 className="text-center text-xl font-medium text-foreground">{title}</h1>
        {subtitle && <p className="text-center text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}
export function AuthDivider({ label = 'atau' }: { label?: string }) {
  return (
    <div className="relative my-5 flex items-center">
      <div className="flex-1 border-t border-border" />
      <span className="mx-3 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}
interface AuthFooterProps { question: string; linkText: string; href: string }
export function AuthFooter({ question, linkText, href }: AuthFooterProps) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {question}{' '}
      <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
        {linkText}
      </Link>
    </p>
  )
}
