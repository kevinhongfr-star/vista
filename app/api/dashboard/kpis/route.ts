import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PIPELINE_STAGES } from "@/lib/types"

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

    // Active Deals: contacts in pipeline stages excluding Prospect and Closed Won/Lost
    const activeStages = PIPELINE_STAGES.filter(
      (s) => s !== "Prospect" && s !== "Closed Won" && s !== "Closed Lost"
    )
    const { count: activeDealsCount } = await supabase
      .from("vista_contacts")
      .select("*", { count: "exact", head: true })
      .in("pipeline_stage", activeStages)

    // Closed Won this month
    const { count: closedWonCount } = await supabase
      .from("vista_contacts")
      .select("*", { count: "exact", head: true })
      .eq("pipeline_stage", "Closed Won")

    // Get signals count
    const { count: signalsCount } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })

    // Get signals created in last 7 days
    const { count: signalsWeek } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      contacts: contactsCount || 0,
      contacts_delta: contactsWeek || 0,
      active_deals: activeDealsCount || 0,
      closed_won: closedWonCount || 0,
      signals: signalsCount || 0,
      signals_delta: signalsWeek || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { contacts: 0, active_deals: 0, closed_won: 0, signals: 0, signals_delta: 0, error: String(error) },
      { status: 500 }
    )
  }
}