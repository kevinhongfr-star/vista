import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { ContactRecommendation } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.id

    // Get contact details
    const { data: contact, error } = await supabase
      .from("vista_contacts")
      .select(`
        id, name, company, vista_composite, pipeline_stage, last_contact_date,
        density_cluster_id, function, seniority, industry, engagement_tier,
        vista_v, vista_i, vista_s, vista_t, vista_a
      `)
      .eq("id", contactId)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    // Compute recommended action
    const rationale: string[] = []
    let recommendedAction = ""
    let priorityScore = contact.vista_composite || 0

    // Value-based recommendations
    if (contact.vista_v >= 25) {
      rationale.push("High-value company tier")
    }
    
    // Function-based recommendations
    if (contact.function === "Executive" || contact.seniority === "C-Level") {
      rationale.push("C-suite executive")
      recommendedAction = "Send Executive Brief invitation"
    } else if (contact.function === "Technology") {
      rationale.push("Technology leader")
      recommendedAction = "Invite to technical webinar or roundtable"
    }
    
    // Engagement-based recommendations
    if (contact.engagement_tier === "Hot") {
      rationale.push("Hot engagement tier")
      recommendedAction = "Schedule meeting or call immediately"
    } else if (contact.engagement_tier === "Warm") {
      rationale.push("Warm engagement tier")
      recommendedAction = "Send follow-up email"
    } else if (contact.engagement_tier === "Cold") {
      rationale.push("Cold engagement tier - needs re-engagement")
      recommendedAction = "Re-engagement email or LinkedIn message"
    }
    
    // Pipeline stage recommendations
    if (contact.pipeline_stage === "Meeting Booked") {
      rationale.push("Meeting booked - awaiting follow-up")
      recommendedAction = "Send meeting prep materials or agenda"
    } else if (contact.pipeline_stage === "Engaged" && contact.vista_composite >= 80) {
      rationale.push("High score in Engaged stage")
      recommendedAction = "Request meeting or call"
    }
    
    // Decay-based recommendations
    if (contact.last_contact_date) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(contact.last_contact_date).getTime()) / (24 * 60 * 60 * 1000)
      )
      if (daysSinceContact > 30) {
        rationale.push(`${daysSinceContact}+ days since last contact`)
        recommendedAction = "Re-engagement outreach needed"
        priorityScore += 5 // Boost priority for stale contacts
      }
    } else {
      rationale.push("Never contacted")
      recommendedAction = "Initial outreach required"
      priorityScore += 10
    }
    
    // Cluster-based recommendations
    if (contact.density_cluster_id) {
      const { data: cluster } = await supabase
        .from("density_clusters")
        .select("industry, recommended_programs")
        .eq("cluster_id", contact.density_cluster_id)
        .single()
      
      if (cluster && cluster.recommended_programs && cluster.recommended_programs.length > 0) {
        rationale.push(`In ${cluster.industry || "unknown"} cluster with recommended programs`)
        if (!recommendedAction) {
          recommendedAction = `Invite to ${cluster.recommended_programs[0]}`
        }
      }
    }

    // Default recommendation if none set
    if (!recommendedAction) {
      recommendedAction = "Review profile and determine outreach strategy"
    }

    const recommendation: ContactRecommendation = {
      contact_id: contactId,
      recommended_action: recommendedAction,
      rationale,
      priority_score: priorityScore,
    }

    return NextResponse.json({ recommendation })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}