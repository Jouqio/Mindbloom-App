// ============================================================
// MindBloom — Navbar Component
// File: src/components/layout/Navbar.tsx
// ============================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Flower2,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface NavItem {
  href:  string
  label: string
  icon:  React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Beranda',   icon: LayoutDashboard },
  { href: '/journal',   label: 'Jurnal',    icon: BookOpen        },
  { href: '/garden',    label: 'Taman',     icon: Flower2         },
  { href: '/coach',     label: 'AI Coach',  icon: MessageCircle   },
  { href: '/analytics', label: 'Analitik',  icon: BarChart3       },
]

export function Navbar() {
  const pathname     = usePathname()
  const router       = useRouter()
  const { profile }  = useAuthStore()
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const displayName = profile?.display_name ?? profile?.full_name ?? 'Kamu'
  const initials    = displayName.slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 hidden border-b border-border/60 md:block"
        style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
            <span className="text-xl" aria-hidden="true">🌱</span>
            <span className="text-sm font-medium text-foreground">MindBloom</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1" aria-label="Navigasi utama">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-secondary font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Streak badge */}
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium">
              <Flame className="h-3 w-3 text-amber-500" aria-hidden="true" />
              <span aria-label={`Streak ${profile?.plan ?? 0} hari`}>0</span>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Menu pengguna"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                  {initials}
                </div>
                <span className="max-w-[100px] truncate text-xs font-medium">{displayName}</span>
                <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />

                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{   opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                      role="menu"
                      aria-label="Menu pengguna"
                      className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-background shadow-md"
                    >
                      {/* User info */}
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="text-xs font-medium text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{profile?.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link href="/settings"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:bg-secondary"
                        >
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          Pengaturan
                        </Link>
                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:bg-destructive/10 disabled:opacity-50"
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          {isLoggingOut ? 'Keluar...' : 'Keluar'}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <header className="sticky top-0 z-50 md:hidden border-b border-border/60"
        style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🌱</span>
            <span className="text-sm font-medium">MindBloom</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-1 text-xs font-medium">
              <Flame className="h-3 w-3 text-amber-500" aria-hidden="true" />
              <span>0</span>
            </div>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen
                ? <X className="h-4 w-4" aria-hidden="true" />
                : <Menu className="h-4 w-4" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border bg-background"
            >
              <nav className="flex flex-col gap-1 p-3" aria-label="Navigasi mobile">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname.startsWith(href)
                  return (
                    <Link key={href} href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'bg-secondary font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </Link>
                  )
                })}
                <div className="my-1 border-t border-border" />
                <Link href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Pengaturan
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 md:hidden"
        style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        aria-label="Navigasi bawah">
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
