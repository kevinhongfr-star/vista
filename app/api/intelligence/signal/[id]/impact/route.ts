import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { SignalImpactAnalysis, VistaContact } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const signalId = params.id

    // Get signal details
    const { data: signal, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", signalId)
      .single()

    if (signalError) {
      return NextResponse.json({ success: false, error: signalError.message }, { status: 404 })
    }

    // Find affected contacts
    // 1. Contacts whose company matches signal company
    // 2. Contacts whose IDs are in signal.contact_ids array
    let affectedContacts: VistaContact[] = []

    if (signal.contact_ids && signal.contact_ids.length > 0) {
      const { data: directContacts } = await supabase
        .from("vista_contacts")
        .select("id, name, company, function, vista_composite, pipeline_stage")
        .in("id", signal.contact_ids)
      
      affectedContacts = (directContacts || []) as VistaContact[]
    }

    // Also search by company name
    if (signal.company) {
      const { data: companyContacts } = await supabase
        .from("vista_contacts")
        .select("id, name, company, function, vista_composite, pipeline_stage")
        .ilike("company", signal.company)
      
      // Merge and deduplicate
      const companyIds = new Set(affectedContacts.map(c => c.id))
      for (const c of (companyContacts || [])) {
        if (!companyIds.has(c.id)) {
          affectedContacts.push(c as VistaContact)
        }
      }
    }

    // Sort by score
    affectedContacts.sort((a, b) => (b.vista_composite || 0) - (a.vista_composite || 0))

    // Get top 3 priority
    const top3Priority = affectedContacts.slice(0, 3)

    // Count by function
    const countByFunction: Record<string, number> = {}
    for (const c of affectedContacts) {
      const func = c.function || "Unknown"
      countByFunction[func] = (countByFunction[func] || 0) + 1
    }

    // Determine recommended campaign type based on signal type
    let recommendedCampaignType = "Email"
    switch (signal.signal_type) {
      case "funding":
        recommendedCampaignType = "Executive Brief"
        break
      case "leadership_change":
      case "executive_departure":
        recommendedCampaignType = "LinkedIn Message"
        break
      case "market_expansion":
        recommendedCampaignType = "Webinar Invite"
        break
      default:
        recommendedCampaignType = "Email"
    }

    const impact: SignalImpactAnalysis = {
      signal_id: signalId,
      affected_contacts: affectedContacts,
      top_3_priority: top3Priority,
      affected_count_by_function: countByFunction,
      recommended_campaign_type: recommendedCampaignType,
    }

    return NextResponse.json({ impact })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}