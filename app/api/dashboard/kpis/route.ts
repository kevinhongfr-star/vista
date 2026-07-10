import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PIPELINE_STAGES } from "@/lib/types"

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = createServerClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const activeStages = PIPELINE_STAGES.filter(
      (s) => s !== "Prospect" && s !== "Closed Won" && s !== "Closed Lost"
    )

    // Run all 6 queries in PARALLEL instead of sequential
    const [
      { count: contactsCount },
      { count: contactsWeek },
      { count: activeDealsCount },
      { count: closedWonCount },
      { count: signalsCount },
      { count: signalsWeek },
    ] = await Promise.all([
      supabase.from("vista_contacts").select("*", { count: "exact", head: true }),
      supabase.from("vista_contacts").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      supabase.from("vista_contacts").select("*", { count: "exact", head: true }).in("pipeline_stage", activeStages),
      supabase.from("vista_contacts").select("*", { count: "exact", head: true }).eq("pipeline_stage", "Closed Won"),
      supabase.from("signals").select("*", { count: "exact", head: true }),
      supabase.from("signals").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    ])

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
