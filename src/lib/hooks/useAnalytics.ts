// ============================================================
// MindBloom — useAnalytics Hook
// File: src/lib/hooks/useAnalytics.ts
// ============================================================

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AnalyticsData } from '@/types/analytics'

export function useAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [isLoading, setLoad]  = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoad(true)
    setError(null)
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const { data: payload } = await res.json()
      setData(payload)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat analitik')
    } finally {
      setLoad(false)
    }
  }, [period])

  useEffect(() => { load() }, [load])

  return { data, isLoading, error, refetch: load }
}
