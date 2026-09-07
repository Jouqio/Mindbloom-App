// ============================================================
// MindBloom — Root App Layout
// File: src/app/layout.tsx
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import { AuthProvider } from '@/components/auth/AuthProvider'
import '@/app/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal'], // Headings are roman — Gate 38a
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — MindBloom',
    default: 'MindBloom — AI Reflection Companion',
  },
  description:
    'Platform journaling harian berbasis AI untuk kesehatan mental. Refleksi, emosi, dan pertumbuhan diri dalam satu aplikasi.',
  keywords: ['journaling', 'kesehatan mental', 'AI', 'refleksi', 'meditasi'],
  authors: [{ name: 'MindBloom Team' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'MindBloom',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9f4' },
    { media: '(prefers-color-scheme: dark)',  color: '#1a211c' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

