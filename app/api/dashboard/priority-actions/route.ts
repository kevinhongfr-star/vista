import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { PriorityAction } from "@/lib/types"

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = createServerClient()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Run all 4 queries in PARALLEL
    const [
      { data: contactsToCall },
      { data: followUps },
      { data: newSignals },
      { data: coldContacts },
    ] = await Promise.all([
      // High-value contacts to call
      supabase
        .from("vista_contacts")
        .select("id, name, company, role, vista_composite, last_contact_date, pipeline_stage")
        .gte("vista_composite", 60)
        .or(`last_contact_date.is.null,last_contact_date.lt.${thirtyDaysAgo}`)
        .not("pipeline_stage", "in", "(Closed Won,Closed Lost)")
        .order("vista_composite", { ascending: false })
        .limit(5),
      // Follow-ups (warm tier)
      supabase
        .from("vista_contacts")
        .select("id, name, company, vista_composite, engagement_tier, last_engagement_date")
        .eq("engagement_tier", "Warm")
        .order("last_engagement_date", { ascending: false })
        .limit(5),
      // New signals (last 24h)
      supabase
        .from("signals")
        .select("id, company, signal_type, signal_strength, description, created_at")
        .in("signal_strength", ["High", "Medium-High"])
        .gte("created_at", twentyFourHoursAgo)
        .order("signal_strength", { ascending: false })
        .limit(5),
      // Cold contacts
      supabase
        .from("vista_contacts")
        .select("id, name, company, vista_composite, density_cluster_id, last_contact_date")
        .lt("last_contact_date", sixtyDaysAgo)
        .eq("pipeline_stage", "Prospect")
        .order("vista_composite", { ascending: false })
        .limit(5),
    ])

    const actions: PriorityAction[] = []

    if (contactsToCall) {
      for (const c of contactsToCall) {
        const daysSince = c.last_contact_date
          ? Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / (24 * 60 * 60 * 1000))
          : 999
        actions.push({
          type: "call",
          icon: "Phone",
          title: `Call ${c.name || "Unknown"} (${c.company || "Unknown"})`,
          description: `Score ${c.vista_composite || 0}, no contact ${daysSince}d`,
          contact_id: c.id,
          score: c.vista_composite || 0,
          days_since: daysSince,
          priority: 1,
        })
      }
    }

    if (followUps) {
      for (const c of followUps) {
        actions.push({
          type: "follow_up",
          icon: "Mail",
          title: `Follow up with ${c.name || "Unknown"} (${c.company || "Unknown"})`,
          description: `Opened email, awaiting reply`,
          contact_id: c.id,
          score: c.vista_composite || 0,
          priority: 2,
        })
      }
    }

    if (newSignals) {
      for (const s of newSignals) {
        actions.push({
          type: "signal",
          icon: "Zap",
          title: `Signal: ${s.company || "Unknown"} - ${s.signal_type || "Unknown"}`,
          description: s.description?.substring(0, 60) || "New signal detected",
          signal_id: s.id,
          priority: 3,
        })
      }
    }

    if (coldContacts) {
      for (const c of coldContacts) {
        const daysSince = c.last_contact_date
          ? Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / (24 * 60 * 60 * 1000))
          : 999
        actions.push({
          type: "cold_alert",
          icon: "Bell",
          title: `Cold contact: ${c.name || "Unknown"} (${c.company || "Unknown"})`,
          description: `${daysSince}+ days since contact`,
          contact_id: c.id,
          cluster_id: c.density_cluster_id,
          days_since: daysSince,
          priority: 4,
        })
      }
    }

    actions.sort((a, b) => a.priority - b.priority)

    return NextResponse.json({ actions })
  } catch (error) {
    return NextResponse.json(
      { actions: [], error: String(error) },
      { status: 500 }
    )
  }
}
