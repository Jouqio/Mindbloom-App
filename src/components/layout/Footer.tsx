// ============================================================
// MindBloom — Footer Component (Archetype: Ft6 Letter Close)
// File: src/components/layout/Footer.tsx
// Quiet, thoughtful colophon closing the daily reflection space
// ============================================================

import Link from 'next/link'
import { MindBloomEmblem } from '@/components/ui/BotanicalIcons'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 py-10 px-6 text-center" role="contentinfo">
      <div className="mx-auto max-w-2xl flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-primary/80">
          <MindBloomEmblem size={18} />
          <span className="font-display text-sm tracking-tight text-foreground font-medium">MindBloom</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed font-display italic">
          Setiap refleksi adalah benih yang kamu rawat hari ini.
        </p>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground/70 mt-1">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privasi
          </Link>
          <span aria-hidden="true" className="text-border">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Ketentuan
          </Link>
          <span aria-hidden="true" className="text-border">·</span>
          <span>&copy; {new Date().getFullYear()} MindBloom</span>
        </div>
      </div>
    </footer>
  )
}
