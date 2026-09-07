import type { Metadata } from 'next'
const PAGE_MAP: Record<string, {title:string;emoji:string;desc:string;sprint:string}> = {
  garden:    {title:'Taman Emosional',emoji:'🌿',desc:'Taman emosionalmu tumbuh seiring jurnal yang kamu tulis.',sprint:'Sprint 4'},
  coach:     {title:'AI Coach',      emoji:'🤖',desc:'Chat dengan Bloom — AI Reflection Coach yang empatik dan tidak menghakimi.',sprint:'Sprint 8'},
  analytics: {title:'Analitik',      emoji:'📊',desc:'Lihat tren mood, energi, dan pertumbuhanmu dari waktu ke waktu.',sprint:'Sprint 10'},
  settings:  {title:'Pengaturan',    emoji:'⚙️',desc:'Kelola preferensi notifikasi, tampilan, dan akun MindBloom-mu.',sprint:'Sprint 2+'},
}
const cfg = PAGE_MAP['settings'] ?? {title:'settings',emoji:'🌱',desc:'Coming soon.',sprint:'Soon'}
export const metadata: Metadata = { title: cfg.title }
export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <h1 className="text-xl font-medium text-foreground mb-1">{cfg.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">{cfg.desc}</p>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-12 text-center">
        <div className="text-5xl" aria-hidden="true">{cfg.emoji}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{cfg.title}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">Fitur ini akan hadir di {cfg.sprint}</p>
        </div>
      </div>
    </main>
  )
}
