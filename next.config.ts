// ============================================================
// MindBloom — Next.js Configuration
// File: next.config.ts
// ============================================================

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
    ],
  },

  // Typed routes (stable as of Next.js 15.5, no longer under `experimental`)
  typedRoutes: false,

  // Headers for security
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'

    // Content-Security-Policy, scoped to exactly what MindBloom needs:
    // - Supabase (API + storage for avatars/images)
    // - Midtrans Snap.js (loaded dynamically for checkout — see
    //   useSubscription.ts's loadSnapScript()) needs script-src AND
    //   frame-src, since Snap renders its payment UI in an iframe
    // - Google avatar images (OAuth login) + Google Fonts
    // - OpenAI is called server-side only (API routes), never from the
    //   browser, so it deliberately does NOT need to be in connect-src
    //
    // NOTE on 'unsafe-inline' in script-src: this is a documented,
    // pragmatic compromise, not an oversight. A fully nonce-based CSP
    // (stricter, no 'unsafe-inline') is the recommended next step, but
    // needs live browser testing against real Midtrans Snap.js and
    // Next.js hydration to verify nothing silently breaks — not safely
    // verifiable in an offline environment. Tighten this once you can
    // test against a real deployed instance.
    const cspDirectives = [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://app.midtrans.com https://app.sandbox.midtrans.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.midtrans.com https://app.sandbox.midtrans.com`,
      `frame-src https://app.midtrans.com https://app.sandbox.midtrans.com`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`,
    ]

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
          // 2 years, includeSubDomains — standard for HSTS preload list
          // eligibility. Only sent in production: forcing HTTPS on
          // localhost during development breaks `next dev`.
          ...(isDev ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }]),
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
