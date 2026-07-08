import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { PriorityAction } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()
    const actions: PriorityAction[] = []

    // Query 1: High-value contacts to call (score >= 60, no contact 30+ days)
    const { data: contactsToCall } = await supabase
      .from("vista_contacts")
      .select("id, name, company, role, vista_composite, last_contact_date, pipeline_stage")
      .gte("vista_composite", 60)
      .or("last_contact_date.is.null,last_contact_date.lt." + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .not("pipeline_stage", "in", "(Closed Won,Closed Lost)")
      .order("vista_composite", { ascending: false })
      .limit(5)

    if (contactsToCall) {
      for (const c of contactsToCall) {
        const daysSince = c.last_contact_date
          ? Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / (24 * 60 * 60 * 1000))
          : 999
        actions.push({
          type: "call",
          icon: "📞",
          title: `Call ${c.name || "Unknown"} (${c.company || "Unknown"})`,
          description: `Score ${c.vista_composite || 0}, no contact ${daysSince}d`,
          contact_id: c.id,
          score: c.vista_composite || 0,
          days_since: daysSince,
          priority: 1,
        })
      }
    }

    // Query 2: Follow up with contacts who opened emails but didn't reply
    // (This requires email tracking data - simplified version using engagement)
    const { data: followUps } = await supabase
      .from("vista_contacts")
      .select("id, name, company, vista_composite, engagement_tier, last_engagement_date")
      .eq("engagement_tier", "Warm")
      .order("last_engagement_date", { ascending: false })
      .limit(5)

    if (followUps) {
      for (const c of followUps) {
        actions.push({
          type: "follow_up",
          icon: "📧",
          title: `Follow up with ${c.name || "Unknown"} (${c.company || "Unknown"})`,
          description: `Opened email, awaiting reply`,
          contact_id: c.id,
          score: c.vista_composite || 0,
          priority: 2,
        })
      }
    }

    // Query 3: New high-impact signals (last 24 hours)
    const { data: newSignals } = await supabase
      .from("signals")
      .select("id, company, signal_type, signal_strength, description, created_at")
      .in("signal_strength", ["High", "Medium-High"])
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("signal_strength", { ascending: false })
      .limit(5)

    if (newSignals) {
      for (const s of newSignals) {
        actions.push({
          type: "signal",
          icon: "⚡",
          title: `Signal: ${s.company || "Unknown"} - ${s.signal_type || "Unknown"}`,
          description: s.description?.substring(0, 60) || "New signal detected",
          signal_id: s.id,
          priority: 3,
        })
      }
    }

    // Query 4: Cold contacts in priority clusters (60+ days)
    // Simplified - contacts with low engagement in clusters
    const { data: coldContacts } = await supabase
      .from("vista_contacts")
      .select("id, name, company, vista_composite, density_cluster_id, last_contact_date")
      .lt("last_contact_date", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .eq("pipeline_stage", "Prospect")
      .order("vista_composite", { ascending: false })
      .limit(5)

    if (coldContacts) {
      for (const c of coldContacts) {
        const daysSince = c.last_contact_date
          ? Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / (24 * 60 * 60 * 1000))
          : 999
        actions.push({
          type: "cold_alert",
          icon: "🔔",
          title: `Cold contact: ${c.name || "Unknown"} (${c.company || "Unknown"})`,
          description: `${daysSince}+ days since contact`,
          contact_id: c.id,
          cluster_id: c.density_cluster_id,
          days_since: daysSince,
          priority: 4,
        })
      }
    }

    // Sort by priority
    actions.sort((a, b) => a.priority - b.priority)

    return NextResponse.json({ actions })
  } catch (error) {
    return NextResponse.json(
      { actions: [], error: String(error) },
      { status: 500 }
    )
  }
}