import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { SignalImpactAnalysis, VistaContact } from "@/lib/types"

interface AISignalImpact {
  plain_english: string
  most_affected: string[]
  recommended_actions: { contact: string; action: string }[]
  time_sensitivity: string
  opportunity_score: number
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const signalId = params.id

    const { data: signal, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", signalId)
      .single()

    if (signalError) {
      return NextResponse.json(
        { success: false, error: signalError.message },
        { status: 404 }
      )
    }

    let affectedContacts: VistaContact[] = []

    if (signal.contact_ids && signal.contact_ids.length > 0) {
      const { data: directContacts } = await supabase
        .from("vista_contacts")
        .select(
          "id, name, company, function, vista_composite, pipeline_stage, role, seniority, industry"
        )
        .in("id", signal.contact_ids)

      affectedContacts = (directContacts || []) as VistaContact[]
    }

    if (signal.company) {
      const { data: companyContacts } = await supabase
        .from("vista_contacts")
        .select(
          "id, name, company, function, vista_composite, pipeline_stage, role, seniority, industry"
        )
        .ilike("company", `%${signal.company}%`)

      const companyIds = new Set(affectedContacts.map((c) => c.id))
      for (const c of companyContacts || []) {
        if (!companyIds.has(c.id)) {
          affectedContacts.push(c as VistaContact)
        }
      }
    }

    affectedContacts.sort(
      (a, b) => (b.vista_composite || 0) - (a.vista_composite || 0)
    )

    const top3Priority = affectedContacts.slice(0, 3)

    const countByFunction: Record<string, number> = {}
    for (const c of affectedContacts) {
      const func = c.function || "Unknown"
      countByFunction[func] = (countByFunction[func] || 0) + 1
    }

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

    const topContactsSummary = affectedContacts.slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      role: c.role,
      function: c.function,
      seniority: c.seniority,
      score: c.vista_composite || 0,
      stage: c.pipeline_stage,
    }))

    const aiPrompt = `You are a signal analyst. Given this signal and the contacts it affects, assess:
1. What this signal means in plain English (1-2 sentences)
2. Which contacts are most affected (top 3 names)
3. Recommended actions for each top contact (specific action per person)
4. Time sensitivity (how long is the window? e.g., "2 weeks", "1 month", "This quarter")
5. Overall opportunity score (1-100)

Signal:
${JSON.stringify(
  {
    type: signal.signal_type,
    title: signal.title,
    content: signal.content,
    company: signal.company,
    strength: signal.signal_strength,
    detected_date: signal.detected_date,
    insights: signal.insights,
  },
  null,
  2
)}

Affected contacts (top 10 by score):
${JSON.stringify(topContactsSummary, null, 2)}

Total affected contacts: ${affectedContacts.length}

Output ONLY valid JSON with this exact structure:
{
  "plain_english": "What this signal means in plain English",
  "most_affected": ["Contact Name 1", "Contact Name 2", "Contact Name 3"],
  "recommended_actions": [
    {"contact": "Contact Name 1", "action": "Specific action to take"},
    {"contact": "Contact Name 2", "action": "Specific action to take"},
    {"contact": "Contact Name 3", "action": "Specific action to take"}
  ],
  "time_sensitivity": "2 weeks",
  "opportunity_score": 75
}`

    let aiAnalysis: AISignalImpact | null = null
    let aiSource: "ai" | "rules" = "rules"

    try {
      aiAnalysis = await callDeepSeekJSON<AISignalImpact>(aiPrompt, {
        model: "flash",
        temperature: 0.7,
        maxTokens: 1024,
      })
      aiSource = "ai"
    } catch (aiError) {
      aiAnalysis = generateFallbackSignalAnalysis(
        signal,
        affectedContacts,
        recommendedCampaignType
      )
    }

    return NextResponse.json({
      success: true,
      impact,
      ai_analysis: aiAnalysis,
      analysis_source: aiSource,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackSignalAnalysis(
  signal: Record<string, unknown>,
  affectedContacts: VistaContact[],
  recommendedCampaignType: string
): AISignalImpact {
  const top3 = affectedContacts.slice(0, 3)

  const plainEnglish = `A ${signal.signal_type || "market"} signal has been detected for ${signal.company || "multiple companies"}: ${signal.title || signal.content || "Notable market activity identified."}`

  const mostAffected = top3.map((c) => c.name || "Unknown")

  const recommendedActions = top3.map((c) => ({
    contact: c.name || "Unknown",
    action: `Reach out regarding ${signal.signal_type || "this development"} — ${recommendedCampaignType} approach recommended.`,
  }))

  const timeSensitivity =
    signal.signal_strength === "High"
      ? "This week"
      : signal.signal_strength === "Medium-High"
      ? "2 weeks"
      : "1 month"

  const opportunityScore =
    signal.signal_strength === "High"
      ? 80
      : signal.signal_strength === "Medium-High"
      ? 65
      : signal.signal_strength === "Medium"
      ? 50
      : 35

  return {
    plain_english: plainEnglish,
    most_affected: mostAffected,
    recommended_actions: recommendedActions,
    time_sensitivity: timeSensitivity,
    opportunity_score: opportunityScore,
  }
}
