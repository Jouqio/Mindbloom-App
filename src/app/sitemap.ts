// ============================================================
// MindBloom — sitemap.xml (dynamic via Next.js Metadata API)
// File: src/app/sitemap.ts
// ============================================================

import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mindbloom.app'
  const now = new Date()

  return [
    { url: `${baseUrl}/login`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${baseUrl}/signup`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'monthly',priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`,   lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
