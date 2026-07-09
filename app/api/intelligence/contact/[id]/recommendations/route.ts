import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { ContactRecommendation } from "@/lib/types"

interface AIRecommendation {
  action: string
  why: string
  impact: string
  urgency: string
  channels: string[]
}

interface AIRecommendationsResponse {
  recommendations: AIRecommendation[]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.id

    const { data: contact, error: contactError } = await supabase
      .from("vista_contacts")
      .select(`
        id, name, company, role, vista_composite, pipeline_stage, last_touch_date,
        last_engagement_date, density_cluster_id, function, seniority, industry,
        engagement_tier, vista_v, vista_i, vista_s, vista_t, vista_a,
        touch_count, stain_score, signal_score, cluster_score, engagement_score,
        priority_score, bd_pathway, bd_priority, encirclement_level
      `)
      .eq("id", contactId)
      .single()

    if (contactError) {
      return NextResponse.json(
        { success: false, error: contactError.message },
        { status: 404 }
      )
    }

    let clusterContext: Record<string, unknown> | null = null
    if (contact.density_cluster_id) {
      const { data: cluster } = await supabase
        .from("density_clusters")
        .select("cluster_id, industry, geography, contact_count, recommended_programs, signal_types, cluster_name, recommended_program")
        .eq("cluster_id", contact.density_cluster_id)
        .single()
      if (cluster) {
        clusterContext = cluster
      }
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: recentSignals } = await supabase
      .from("signals")
      .select("id, signal_type, title, content, detected_date, signal_strength, insights, company")
      .or(`contact_ids.cs.{${contactId}}`)
      .gte("detected_date", thirtyDaysAgo.toISOString())
      .order("detected_date", { ascending: false })
      .limit(10)

    const contactData = {
      id: contact.id,
      name: contact.name,
      role: contact.role,
      company: contact.company,
      industry: contact.industry,
      function: contact.function,
      seniority: contact.seniority,
      engagement_tier: contact.engagement_tier,
      pipeline_stage: contact.pipeline_stage,
      bd_pathway: contact.bd_pathway,
      encirclement_level: contact.encirclement_level,
      vista_scores: {
        v: contact.vista_v || 0,
        i: contact.vista_i || 0,
        s: contact.vista_s || 0,
        t: contact.vista_t || 0,
        a: contact.vista_a || 0,
        composite: contact.vista_composite || 0,
      },
      last_touch_date: contact.last_touch_date,
      last_engagement_date: contact.last_engagement_date,
      touch_count: contact.touch_count || 0,
      stain_score: contact.stain_score || 0,
      signal_score: contact.signal_score || 0,
      cluster_score: contact.cluster_score || 0,
      engagement_score: contact.engagement_score || 0,
      priority_score: contact.priority_score || 0,
    }

    const prompt = `You are a BD strategy advisor. Given this contact's full profile, recommend the top 3 actions in priority order. For each action, explain WHY and estimate impact.

Contact data:
${JSON.stringify(contactData, null, 2)}

Recent signals (last 30 days):
${JSON.stringify(recentSignals || [], null, 2)}

Cluster context:
${JSON.stringify(clusterContext || "No cluster assigned", null, 2)}

Output ONLY valid JSON with this exact structure:
{
  "recommendations": [
    {
      "action": "Schedule discovery call",
      "why": "Their company just raised Series B — budget approval window is open",
      "impact": "High — 70% probability of meeting booked within 2 weeks",
      "urgency": "This week",
      "channels": ["email", "linkedin"]
    }
  ]
}

Return exactly 3 recommendations in priority order (highest first). Be specific and actionable.`

    try {
      const aiResult = await callDeepSeekJSON<AIRecommendationsResponse>(prompt, {
        model: "flash",
        temperature: 0.7,
        maxTokens: 1024,
      })

      const topRec = aiResult.recommendations[0]
      const rationale = aiResult.recommendations.map((r) => r.why)
      const priorityScore = computePriorityScore(contact, aiResult.recommendations)

      const recommendation: ContactRecommendation = {
        contact_id: contactId,
        recommended_action: topRec?.action || "Review profile and determine outreach strategy",
        rationale,
        priority_score: priorityScore,
        ai_recommendations: aiResult.recommendations,
      }

      return NextResponse.json({
        success: true,
        recommendation,
        source: "ai",
      })
    } catch (aiError) {
      const fallbackRecommendation = generateFallbackRecommendation(
        contact,
        clusterContext
      )
      return NextResponse.json({
        success: true,
        recommendation: fallbackRecommendation,
        source: "rules",
        note: "AI unavailable — using rules engine fallback",
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function computePriorityScore(
  contact: Record<string, unknown>,
  recommendations: AIRecommendation[]
): number {
  const baseScore = (contact.vista_composite as number) || 0
  const urgencyBoost = recommendations.some((r) =>
    r.urgency.toLowerCase().includes("this week") ||
    r.urgency.toLowerCase().includes("immediate")
  )
    ? 10
    : 0
  return Math.min(100, baseScore + urgencyBoost)
}

function generateFallbackRecommendation(
  contact: Record<string, unknown>,
  clusterContext: Record<string, unknown> | null
): ContactRecommendation {
  const rationale: string[] = []
  let recommendedAction = ""
  let priorityScore = (contact.vista_composite as number) || 0

  if ((contact.vista_v as number) >= 25) {
    rationale.push("High-value company tier")
  }

  if (
    contact.function === "Executive" ||
    contact.seniority === "C-Level"
  ) {
    rationale.push("C-suite executive")
    recommendedAction = "Send Executive Brief invitation"
  } else if (contact.function === "Technology") {
    rationale.push("Technology leader")
    recommendedAction = "Invite to technical webinar or roundtable"
  }

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

  if (contact.pipeline_stage === "Meeting Booked") {
    rationale.push("Meeting booked - awaiting follow-up")
    recommendedAction = "Send meeting prep materials or agenda"
  } else if (
    contact.pipeline_stage === "Engaged" &&
    (contact.vista_composite as number) >= 80
  ) {
    rationale.push("High score in Engaged stage")
    recommendedAction = "Request meeting or call"
  }

  const lastTouchDate = contact.last_touch_date || contact.last_engagement_date
  if (lastTouchDate) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lastTouchDate as string).getTime()) /
        (24 * 60 * 60 * 1000)
    )
    if (daysSinceContact > 30) {
      rationale.push(`${daysSinceContact}+ days since last contact`)
      recommendedAction = "Re-engagement outreach needed"
      priorityScore += 5
    }
  } else {
    rationale.push("Never contacted")
    recommendedAction = "Initial outreach required"
    priorityScore += 10
  }

  if (clusterContext && clusterContext.recommended_programs) {
    const programs = clusterContext.recommended_programs as string[]
    if (programs.length > 0) {
      rationale.push(
        `In ${clusterContext.industry || "unknown"} cluster with recommended programs`
      )
      if (!recommendedAction) {
        recommendedAction = `Invite to ${programs[0]}`
      }
    }
  }

  if (!recommendedAction) {
    recommendedAction = "Review profile and determine outreach strategy"
  }

  return {
    contact_id: contact.id as string,
    recommended_action: recommendedAction,
    rationale,
    priority_score: priorityScore,
  }
}
