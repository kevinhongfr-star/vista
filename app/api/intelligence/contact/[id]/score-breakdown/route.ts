import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { ScoreBreakdown, ContactRecommendation } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.id

    // Get contact with all score components
    const { data: contact, error } = await supabase
      .from("vista_contacts")
      .select(`
        id, name, company, vista_composite, vista_v, vista_i, vista_s, vista_t, vista_a,
        stain_score, cluster_score, signal_score, engagement_score, priority_score,
        last_contact_date, last_email_sent_date, last_email_opened_date, last_meeting_date,
        density_cluster_id, function, seniority, industry,
        score_breakdown
      `)
      .eq("id", contactId)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    // If score_breakdown exists, use it
    if (contact.score_breakdown) {
      return NextResponse.json({ breakdown: contact.score_breakdown as ScoreBreakdown })
    }

    // Otherwise compute breakdown from component scores
    const breakdown: ScoreBreakdown = {
      value_score: contact.vista_v || contact.stain_score || 0,
      function_score: contact.vista_i || 0,
      engagement_score: contact.vista_a || contact.engagement_score || 0,
      decay_penalty: computeDecayPenalty(contact.last_contact_date),
      cluster_score: contact.cluster_score || 0,
      total: contact.vista_composite || 0,
    }

    return NextResponse.json({ breakdown })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

function computeDecayPenalty(lastContactDate: string | null): number {
  if (!lastContactDate) return -10
  
  const daysSinceContact = Math.floor(
    (Date.now() - new Date(lastContactDate).getTime()) / (24 * 60 * 60 * 1000)
  )
  
  if (daysSinceContact > 60) return -10
  if (daysSinceContact > 30) return -5
  return 0
}