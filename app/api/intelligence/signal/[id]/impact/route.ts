import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { SignalImpactAnalysis, VistaContact } from "@/lib/types"

interface AISignalImpact {
  plain_english: string
  market_context: string
  most_affected: string[]
  recommended_actions: { contact: string; action: string; channel: string; timing: string }[]
  campaign_angle: string
  time_sensitivity: string
  opportunity_score: number
  risk_factors: string[]
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
          "id, name, company, function, vista_composite, pipeline_stage, role, seniority, industry, email"
        )
        .in("id", signal.contact_ids)

      affectedContacts = (directContacts || []) as unknown as VistaContact[]
    }

    if (signal.company) {
      const { data: companyContacts } = await supabase
        .from("vista_contacts")
        .select(
          "id, name, company, function, vista_composite, pipeline_stage, role, seniority, industry, email"
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
      lastActivity: "unknown",
    }))

    const aiPrompt = `You are a senior BD strategist at a luxury/fashion industry consulting firm (LYC Partners). You analyze market signals and produce actionable intelligence for business development.

Given this signal and the contacts it affects, produce a strategic BD assessment:

## Signal
Type: ${signal.signal_type}
Title: ${signal.title}
Content: ${signal.content || "No detailed content available"}
Company: ${signal.company || "Multiple companies"}
Strength: ${signal.signal_strength || "Unknown"}
Detected: ${signal.detected_date || "Recently"}
Additional insights: ${signal.insights || "None"}

## Affected Contacts (top 10 by VISTA score)
${JSON.stringify(topContactsSummary, null, 2)}

Total affected contacts: ${affectedContacts.length}
Contacts by function: ${JSON.stringify(countByFunction)}

## Your Assessment Must Include:

1. **plain_english** (2-3 sentences): What happened and WHY IT MATTERS for our BD pipeline. Be specific — not generic. E.g. "Kering's eyewear division is restructuring after losing the Cartier license. This creates a window to pitch our market entry expertise to the new leadership team before they settle into their roles."

2. **market_context** (2-3 sentences): The broader market context. What industry trend does this signal represent? What are competitors likely doing? What's the strategic implication?

3. **most_affected** (top 3 contact names): Who in our database is most directly affected by this signal and why.

4. **recommended_actions**: For each of the top 3 contacts, provide:
   - contact: Name
   - action: A SPECIFIC, PERSONALIZED action (not generic "reach out"). E.g. "Send a congratulatory note on the new role and propose a 30-min intro call to discuss how LYC can support the eyewear division's new strategic direction"
   - channel: Best channel (email/linkedin/phone) based on their seniority and function
   - timing: When to act (e.g. "Within 48 hours", "This week", "Before Q3")

5. **campaign_angle**: A specific campaign theme/angle that connects this signal to our service offering. E.g. "Leadership Transition Support: Offer market intelligence briefings to newly appointed leaders who need to quickly understand the competitive landscape."

6. **time_sensitivity**: How urgent is this? "48 hours" / "1 week" / "2 weeks" / "This month"

7. **opportunity_score** (1-100): How valuable is this opportunity?

8. **risk_factors**: 2-3 things that could go wrong or reasons this might not convert.

Output ONLY valid JSON with this exact structure:
{
  "plain_english": "...",
  "market_context": "...",
  "most_affected": ["Name 1", "Name 2", "Name 3"],
  "recommended_actions": [
    {"contact": "Name 1", "action": "Specific action", "channel": "email", "timing": "48 hours"},
    {"contact": "Name 2", "action": "Specific action", "channel": "linkedin", "timing": "1 week"},
    {"contact": "Name 3", "action": "Specific action", "channel": "email", "timing": "2 weeks"}
  ],
  "campaign_angle": "...",
  "time_sensitivity": "...",
  "opportunity_score": 75,
  "risk_factors": ["Risk 1", "Risk 2"]
}`

    let aiAnalysis: AISignalImpact | null = null
    let aiSource: "ai" | "rules" = "rules"

    try {
      aiAnalysis = await callDeepSeekJSON<AISignalImpact>(aiPrompt, {
        model: "flash",
        temperature: 0.7,
        maxTokens: 2048,
      })
      aiSource = "ai"
    } catch (aiError) {
      console.error("DeepSeek signal analysis failed:", aiError)
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
    console.error("Signal impact route error:", error)
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

  const plainEnglish = `A ${signal.signal_type || "market"} signal was detected${signal.company ? ` for ${signal.company}` : ""}: ${signal.title || "Notable market activity identified."}. This represents a potential BD opportunity that should be evaluated for outreach timing and relevance.`

  const marketContext = `This signal type (${signal.signal_type}) typically indicates shifts in the competitive landscape that create windows for strategic engagement. Monitor for follow-up developments.`

  const mostAffected = top3.map((c) => c.name || "Unknown")

  const recommendedActions = top3.map((c) => ({
    contact: c.name || "Unknown",
    action: `Prepare a targeted ${recommendedCampaignType.toLowerCase()} referencing the ${signal.signal_type || "market development"} and proposing a discussion on strategic implications for ${c.company || "their organization"}.`,
    channel: c.seniority === "C-Level" || c.seniority === "VP" ? "linkedin" : "email",
    timing: signal.signal_strength === "High" ? "48 hours" : "1 week",
  }))

  const timeSensitivity =
    signal.signal_strength === "High"
      ? "48 hours"
      : signal.signal_strength === "Medium-High"
      ? "1 week"
      : "2 weeks"

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
    market_context: marketContext,
    most_affected: mostAffected,
    recommended_actions: recommendedActions,
    campaign_angle: `${signal.signal_type || "Market"}-driven outreach leveraging current events`,
    time_sensitivity: timeSensitivity,
    opportunity_score: opportunityScore,
    risk_factors: [
      "Signal may be premature — verify with additional sources before outreach",
      "Contact may not be the decision-maker for this opportunity",
    ],
  }
}
