// ============================================================
// MindBloom — robots.txt (dynamic via Next.js Metadata API)
// File: src/app/robots.ts
// ============================================================

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mindbloom.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/login', '/signup', '/pricing', '/privacy', '/terms'],
        disallow: [
          '/api/',
          '/dashboard',
          '/journal',
          '/habits',
          '/life-wheel',
          '/garden',
          '/breathing',
          '/coach',
          '/insights',
          '/search',
          '/analytics',
          '/vault',
          '/achievements',
          '/settings',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
