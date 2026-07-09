"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { subscribeToVistaChanges } from "@/lib/supabase/realtime"

interface RealtimeRefresherProps {
  refreshContacts?: boolean
  refreshSignals?: boolean
  refreshClusters?: boolean
  debounceMs?: number
}

export function RealtimeRefresher({
  refreshContacts = false,
  refreshSignals = false,
  refreshClusters = false,
  debounceMs = 1500,
}: RealtimeRefresherProps) {
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const scheduleRefresh = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        router.refresh()
      }, debounceMs)
    }

    const unsubscribe = subscribeToVistaChanges(
      refreshContacts ? scheduleRefresh : undefined,
      refreshSignals ? scheduleRefresh : undefined,
      refreshClusters ? scheduleRefresh : undefined
    )

    return () => {
      unsubscribe()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [refreshContacts, refreshSignals, refreshClusters, debounceMs, router])

  return null
}
