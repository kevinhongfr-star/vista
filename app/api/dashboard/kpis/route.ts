import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get total contacts count
    const { count: contactsCount } = await supabase
      .from("vista_contacts")
      .select("*", { count: "exact", head: true })

    // Get contacts created in last 7 days for delta
    const { count: contactsWeek } = await supabase
      .from("vista_contacts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get signals count
    const { count: signalsCount } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })

    // Get signals created in last 7 days
    const { count: signalsWeek } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get clusters count
    const { count: clustersCount } = await supabase
      .from("density_clusters")
      .select("*", { count: "exact", head: true })

    // Get campaigns count
    const { count: campaignsCount } = await supabase
      .from("campaign_activities")
      .select("*", { count: "exact", head: true })

    // Get campaigns in Draft status
    const { count: campaignsDraft } = await supabase
      .from("campaign_activities")
      .select("*", { count: "exact", head: true })
      .eq("activity_status", "Drafted")

    return NextResponse.json({
      contacts: contactsCount || 0,
      contacts_delta: contactsWeek || 0,
      signals: signalsCount || 0,
      signals_delta: signalsWeek || 0,
      clusters: clustersCount || 0,
      campaigns: campaignsCount || 0,
      campaigns_draft: campaignsDraft || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { contacts: 0, signals: 0, clusters: 0, campaigns: 0, campaigns_draft: 0, error: String(error) },
      { status: 500 }
    )
  }
}