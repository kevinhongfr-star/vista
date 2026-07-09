import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"

interface ExecutiveBrief {
  brief: string
  priorities: string[]
  risks: string[]
  opportunities: string[]
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1)

    const [
      { count: activeContactsCount },
      { data: newSignals },
      { data: topMovers },
    ] = await Promise.all([
      supabase
        .from("vista_contacts")
        .select("*", { count: "exact", head: true })
        .neq("status", "Archived"),
      supabase
        .from("signals")
        .select("id, signal_type, title, company, detected_date, insights")
        .gte("detected_date", twentyFourHoursAgo.toISOString())
        .order("detected_date", { ascending: false })
        .limit(10),
      supabase
        .from("vista_contacts")
        .select("id, name, company, vista_composite, score_delta, last_score_update")
        .not("score_delta", "is", null)
        .gte("last_score_update", twentyFourHoursAgo.toISOString())
        .order("vista_composite", { ascending: false })
        .limit(10),
    ])

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { count: staleCount } = await supabase
      .from("vista_contacts")
      .select("*", { count: "exact", head: true })
      .or(
        `last_touch_date.lt.${thirtyDaysAgo.toISOString()},last_touch_date.is.null,last_engagement_date.lt.${thirtyDaysAgo.toISOString()},last_engagement_date.is.null`
      )
      .neq("pipeline_stage", "Closed Won")
      .neq("pipeline_stage", "Closed Lost")

    const { data: pipelineChanges } = await supabase
      .from("pipeline_history")
      .select("id, contact_id, from_stage, to_stage, changed_at")
      .gte("changed_at", twentyFourHoursAgo.toISOString())
      .order("changed_at", { ascending: false })
      .limit(10)

    const pipelineContactIds = pipelineChanges?.map((p) => p.contact_id) || []
    let pipelineChangeDetails: Array<{
      name: string | null
      company: string | null
      from_stage: string
      to_stage: string
    }> = []
    if (pipelineContactIds.length > 0) {
      const { data: pipelineContacts } = await supabase
        .from("vista_contacts")
        .select("id, name, company")
        .in("id", pipelineContactIds)
      const contactMap = new Map(
        (pipelineContacts || []).map((c) => [c.id, c])
      )
      pipelineChangeDetails = pipelineChanges?.map((p) => ({
        name: contactMap.get(p.contact_id)?.name || null,
        company: contactMap.get(p.contact_id)?.company || null,
        from_stage: p.from_stage,
        to_stage: p.to_stage,
      })) || []
    }

    const topMoverDetails = (topMovers || []).map((c) => ({
      name: c.name,
      company: c.company,
      score: c.vista_composite,
      delta: c.score_delta,
    }))

    const dashboardData = {
      active_contacts: activeContactsCount || 0,
      new_signals_24h: newSignals?.length || 0,
      new_signals_detail: newSignals || [],
      pipeline_changes_24h: pipelineChangeDetails.length,
      pipeline_changes_detail: pipelineChangeDetails,
      top_movers: topMoverDetails,
      stale_contacts: staleCount || 0,
    }

    const prompt = `You are a chief of staff preparing a morning brief for the BD director. Based on today's data, generate:
1. Top 3 priorities for today (with rationale)
2. Key changes since yesterday (new signals, score changes, pipeline movement)
3. Risks or warnings (stale contacts, declining scores, missed follow-ups)
4. Opportunities (hot signals, cluster momentum, upcoming windows)

Keep it under 200 words. Use bullet points. Be specific — name people and companies.

Current data:
- Active contacts: ${dashboardData.active_contacts}
- New signals (24h): ${dashboardData.new_signals_24h}
- Pipeline changes (24h): ${dashboardData.pipeline_changes_24h}
- Top movers (score delta):
${JSON.stringify(dashboardData.top_movers.slice(0, 5), null, 2)}
- Stale contacts (>30 days): ${dashboardData.stale_contacts}
- Recent signals:
${JSON.stringify(dashboardData.new_signals_detail.slice(0, 5), null, 2)}
- Pipeline changes:
${JSON.stringify(dashboardData.pipeline_changes_detail.slice(0, 5), null, 2)}

Output ONLY valid JSON with this exact structure:
{
  "brief": "200-word executive summary of today's BD landscape...",
  "priorities": [
    "Priority 1: ... (rationale)",
    "Priority 2: ... (rationale)",
    "Priority 3: ... (rationale)"
  ],
  "risks": [
    "Risk 1: ...",
    "Risk 2: ..."
  ],
  "opportunities": [
    "Opportunity 1: ...",
    "Opportunity 2: ..."
  ]
}`

    let brief: ExecutiveBrief
    let source: "ai" | "rules" = "rules"

    try {
      brief = await callDeepSeekJSON<ExecutiveBrief>(prompt, {
        model: "flash",
        temperature: 0.7,
        maxTokens: 1500,
      })
      source = "ai"
    } catch (aiError) {
      brief = generateFallbackBrief(dashboardData)
    }

    return NextResponse.json({
      success: true,
      brief,
      source,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackBrief(data: {
  active_contacts: number
  new_signals_24h: number
  stale_contacts: number
  top_movers: Array<{ name: string | null; company: string | null; score: number | null; delta: string | null }>
  pipeline_changes_24h: number
}): ExecutiveBrief {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const brief = `Good morning. Here's your BD brief for ${today}. You have ${data.active_contacts} active contacts in your pipeline with ${data.new_signals_24h} new signals detected in the last 24 hours. ${data.stale_contacts} contacts haven't been touched in over 30 days and may need re-engagement. Focus on high-priority outreach and follow-ups today.`

  const priorities: string[] = [
    `Follow up on ${data.new_signals_24h} new signals — strike while the iron is hot`,
    `Review ${data.stale_contacts} stale contacts and plan re-engagement strategy`,
    `Push top-priority deals forward in the pipeline`,
  ]

  const risks: string[] = [
    `${data.stale_contacts} contacts stale (>30 days without contact) — at risk of disengagement`,
    `Potential deal slippage — review pipeline stage durations`,
  ]

  const opportunities: string[] = [
    `${data.new_signals_24h} new signals detected — timely outreach windows open`,
    data.top_movers.length > 0
      ? `${data.top_movers.length} contacts showing score momentum — capitalize on rising engagement`
      : "Monitor for emerging opportunities in top clusters",
  ]

  return {
    brief,
    priorities,
    risks,
    opportunities,
  }
}
