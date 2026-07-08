import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all contacts with pipeline stage and contact dates
    const { data: contacts, error } = await supabase
      .from("vista_contacts")
      .select("id, name, company, pipeline_stage, last_contact_date, vista_composite")

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Find stuck contacts (same stage 30+ days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const stuckContacts = (contacts || [])
      .filter(c => 
        c.pipeline_stage && 
        ["Contacted", "Engaged", "Meeting Booked"].includes(c.pipeline_stage) &&
        c.last_contact_date && 
        new Date(c.last_contact_date) < thirtyDaysAgo
      )
      .map(c => ({
        contact_id: c.id,
        name: c.name,
        company: c.company,
        pipeline_stage: c.pipeline_stage,
        days_in_stage: Math.floor((Date.now() - new Date(c.last_contact_date!).getTime()) / (24 * 60 * 60 * 1000)),
        score: c.vista_composite,
      }))
      .sort((a, b) => b.days_in_stage - a.days_in_stage)
      .slice(0, 10)

    // Calculate stage conversion rates
    const stageCounts: Record<string, number> = {}
    for (const stage of PIPELINE_STAGES) {
      stageCounts[stage] = contacts?.filter(c => c.pipeline_stage === stage).length || 0
    }

    const conversionRates: Record<string, number> = {}
    
    // Prospect to Contacted
    conversionRates.prospect_to_contacted = stageCounts["Prospect"] > 0 
      ? Math.round((stageCounts["Contacted"] / (stageCounts["Prospect"] + stageCounts["Contacted"])) * 100)
      : 0
    
    // Contacted to Engaged
    conversionRates.contacted_to_engaged = stageCounts["Contacted"] > 0
      ? Math.round((stageCounts["Engaged"] / stageCounts["Contacted"]) * 100)
      : 0
    
    // Engaged to Meeting
    conversionRates.engaged_to_meeting = stageCounts["Engaged"] > 0
      ? Math.round((stageCounts["Meeting Booked"] / stageCounts["Engaged"]) * 100)
      : 0
    
    // Meeting to Closed Won
    conversionRates.meeting_to_closed = stageCounts["Meeting Booked"] > 0
      ? Math.round((stageCounts["Closed Won"] / stageCounts["Meeting Booked"]) * 100)
      : 0

    // Overall conversion rate
    const totalProspects = stageCounts["Prospect"] || 0
    const totalClosedWon = stageCounts["Closed Won"] || 0
    conversionRates.overall = totalProspects > 0 
      ? Math.round((totalClosedWon / contacts?.length!) * 100)
      : 0

    // Find contacts ready to advance
    const readyToAdvance = (contacts || [])
      .filter(c => c.pipeline_stage && c.vista_composite >= 70)
      .filter(c => {
        // Meeting Booked → Proposal Sent
        if (c.pipeline_stage === "Meeting Booked") return true
        // Engaged → Meeting Booked if high score
        if (c.pipeline_stage === "Engaged" && c.vista_composite >= 80) return true
        return false
      })
      .slice(0, 5)

    return NextResponse.json({
      stuck_contacts: stuckContacts,
      conversion_rates: conversionRates,
      ready_to_advance: readyToAdvance,
      stage_counts: stageCounts,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}