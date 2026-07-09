"use client"

import { createBrowserClient } from "./client"

export interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: Record<string, unknown> | null
  old: Record<string, unknown> | null
  table: string
  schema: string
}

export function subscribeToVistaChanges(
  onContactChange?: (payload: RealtimePayload) => void,
  onSignalChange?: (payload: RealtimePayload) => void,
  onClusterChange?: (payload: RealtimePayload) => void
): () => void {
  const supabase = createBrowserClient()

  const channel = supabase
    .channel("vista_changes")

  if (onContactChange) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vista_contacts" },
      (payload) => onContactChange(payload as unknown as RealtimePayload)
    )
  }

  if (onSignalChange) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "signals" },
      (payload) => onSignalChange(payload as unknown as RealtimePayload)
    )
  }

  if (onClusterChange) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "density_clusters" },
      (payload) => onClusterChange(payload as unknown as RealtimePayload)
    )
  }

  channel.subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
