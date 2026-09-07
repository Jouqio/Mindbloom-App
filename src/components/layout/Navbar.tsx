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
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { MindBloomEmblem, StreakSprout } from '@/components/ui/BotanicalIcons'

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
      {/* Desktop Navbar — N9 Edge-aligned minimal */}
      <header className="sticky top-0 z-50 hidden border-b border-border/60 bg-background/85 backdrop-blur-md md:block">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
          {/* Brand Mark */}
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 rounded-lg py-1 transition-opacity hover:opacity-85"
            aria-label="MindBloom Beranda"
          >
            <MindBloomEmblem size={22} className="text-primary transition-transform group-hover:scale-105" />
            <span className="font-display text-base font-medium tracking-tight text-foreground">
              MindBloom
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1" aria-label="Navigasi utama">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium tracking-normal transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Botanical Streak Indicator */}
            <div
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground"
              title="Konsistensi refleksi harian"
            >
              <StreakSprout size={15} className="text-primary" />
              <span className="tabular-nums" aria-label={`Streak ${profile?.plan ?? 0} hari`}>
                {profile?.plan ?? 0}
              </span>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                aria-label="Menu pengguna"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
                  {initials}
                </div>
                <span className="max-w-[100px] truncate text-xs font-medium text-foreground">
                  {displayName}
                </span>
                <ChevronDown
                  className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      role="menu"
                      aria-label="Menu pengguna"
                      className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover shadow-sm"
                    >
                      {/* User info */}
                      <div className="border-b border-border/60 px-3 py-2.5">
                        <p className="text-xs font-medium text-foreground">{displayName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          href="/settings"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                          <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                          Pengaturan
                        </Link>
                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
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
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MindBloomEmblem size={20} className="text-primary" />
            <span className="font-display text-sm font-medium tracking-tight text-foreground">
              MindBloom
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-1 text-xs font-medium text-foreground">
              <StreakSprout size={14} className="text-primary" />
              <span className="tabular-nums">{profile?.plan ?? 0}</span>
            </div>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-border/60 bg-background px-3 py-3"
            >
              <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname.startsWith(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                      {label}
                    </Link>
                  )
                })}
                <div className="my-1 border-t border-border/60" />
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  Pengaturan
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden"
        aria-label="Navigasi bawah"
      >
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

