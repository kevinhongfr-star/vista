import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import { PIPELINE_STAGES } from "@/lib/types"
import type { PipelineReviewReport, PipelineBottleneck, AtRiskContact, ReportAction } from "@/lib/types"

export const dynamic = "force-dynamic"

interface AIRawReview {
  period?: string
  health_score?: number
  review_markdown?: string
  bottlenecks?: Array<{ stage?: string; count?: number; recommendation?: string }>
  at_risk_contacts?: Array<{ id?: string; name?: string; company?: string; reason?: string }>
  recommended_actions?: Array<{ action?: string; priority?: string; expected_impact?: string }>
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const weeks = parseInt(searchParams.get("weeks") || "4", 10)

    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - weeks * 7)

    // Fetch all contacts with pipeline data
    const { data: contacts, error: contactsError } = await supabase
      .from("vista_contacts")
      .select("id, name, company, pipeline_stage, vista_composite, last_touch_date, engagement_tier, score_delta, updated_at")
      .order("vista_composite", { ascending: false })
      .limit(200)

    if (contactsError) {
      return NextResponse.json(
        { success: false, error: contactsError.message },
        { status: 500 }
      )
    }

    if (!contacts || contacts.length === 0) {
      const emptyReport: PipelineReviewReport = {
        period: `Last ${weeks} weeks`,
        generated_at: new Date().toISOString(),
        health_score: 0,
        review_markdown: `# Pipeline Review — Last ${weeks} weeks\n\nNo contacts in pipeline.\n`,
        bottlenecks: [],
        at_risk_contacts: [],
        recommended_actions: [],
      }
      return NextResponse.json({ success: true, report: emptyReport })
    }

    // Stage distribution
    const stageDist: Record<string, number> = {}
    for (const stage of PIPELINE_STAGES) {
      stageDist[stage] = 0
    }
    for (const c of contacts) {
      if (c.pipeline_stage && stageDist[c.pipeline_stage] !== undefined) {
        stageDist[c.pipeline_stage]++
      }
    }

    // Stale contacts (no activity > 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const staleContacts = contacts.filter((c) => {
      const lastTouch = c.last_touch_date
      if (!lastTouch) return true
      return new Date(lastTouch) < thirtyDaysAgo
    })

    // Top movers (score changes)
    const topMovers = contacts
      .filter((c) => c.score_delta && Math.abs(c.score_delta) > 5)
      .slice(0, 10)
      .map((c) => ({
        name: c.name,
        company: c.company,
        score: c.vista_composite,
        delta: c.score_delta,
      }))

    // At risk contacts (stale + high score)
    const atRisk = staleContacts
      .filter((c) => (c.vista_composite || 0) >= 40)
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        score: c.vista_composite,
        stage: c.pipeline_stage,
      }))

    // Conversion rate estimate (Contacted / Prospect)
    const prospectCount = stageDist["Prospect"] || 0
    const contactedCount = stageDist["Contacted"] || 0
    const engagedCount = stageDist["Engaged"] || 0
    const totalActive = contacts.length
    const conversionRate = prospectCount > 0 ? Math.round((contactedCount / prospectCount) * 100) : 0

    // Bottlenecks: stages with unusually high concentration
    const bottlenecks: PipelineBottleneck[] = []
    const avgStage = totalActive / (PIPELINE_STAGES.length - 2)
    for (const stage of PIPELINE_STAGES) {
      if (stage === "Closed Won" || stage === "Closed Lost") continue
      const count = stageDist[stage] || 0
      if (count > avgStage * 1.5 && count > 2) {
        bottlenecks.push({
          stage,
          count,
          recommendation: `${stage} has ${count} contacts — above average concentration. Consider accelerating outreach or disqualifying stale ones.`,
        })
      }
    }

    // Health score calculation
    let healthScore = 5
    if (totalActive > 50) healthScore += 1
    if (conversionRate > 30) healthScore += 1
    if (staleContacts.length < totalActive * 0.3) healthScore += 1
    if (engagedCount > totalActive * 0.1) healthScore += 1
    if (topMovers.length > 5) healthScore += 1
    healthScore = Math.min(10, Math.max(1, healthScore))

    const pipelineStats = {
      total_contacts: totalActive,
      weeks_lookback: weeks,
      stage_distribution: stageDist,
      conversion_rate_prospect_to_contacted: `${conversionRate}%`,
      stale_contacts_count: staleContacts.length,
      top_movers_count: topMovers.length,
      at_risk_count: atRisk.length,
      health_score: healthScore,
    }

    const prompt = `You are writing a pipeline health review for Kevin Hong, Managing Partner at LYC Partners (executive search firm).

Time period: Last ${weeks} weeks

Pipeline stats:
${JSON.stringify(pipelineStats, null, 2)}

Top movers (score changes):
${JSON.stringify(topMovers.slice(0, 10), null, 2)}

At risk contacts (stale + high score):
${JSON.stringify(atRisk.slice(0, 10), null, 2)}

Write a 400-600 word pipeline review:
1. **Pipeline Health Score** — 1-10 with rationale
2. **Movement Summary** — What moved, what didn't
3. **Bottlenecks** — Where are contacts stuck?
4. **Wins** — Best conversions or score improvements
5. **At Risk** — Contacts losing momentum
6. **Recommended Actions** — Top 3 priorities for next week

Tone: Direct. Action-oriented. No fluff.

Return JSON: {
  "period": "Last ${weeks} weeks",
  "health_score": number,
  "review_markdown": "full markdown text",
  "bottlenecks": [{"stage": "...", "count": number, "recommendation": "..."}],
  "at_risk_contacts": [{"id": "...", "name": "...", "company": "...", "reason": "..."}],
  "recommended_actions": [{"action": "...", "priority": "high|medium|low", "expected_impact": "..."}]
}`

    let report: PipelineReviewReport

    try {
      const result = await callDeepSeekJSON<AIRawReview | { review: AIRawReview } | Record<string, unknown>>(prompt, {
        model: "pro",
        temperature: 0.4,
        maxTokens: 2500,
      })

      let raw: AIRawReview | undefined
      if (result && typeof result === "object") {
        if ("review_markdown" in result) {
          raw = result as AIRawReview
        } else if ("review" in result) {
          const inner = (result as { review: AIRawReview }).review
          if (inner && typeof inner === "object" && "review_markdown" in inner) {
            raw = inner
          }
        }
      }

      if (raw) {
        report = {
          period: raw.period || `Last ${weeks} weeks`,
          generated_at: new Date().toISOString(),
          health_score: raw.health_score || healthScore,
          review_markdown: raw.review_markdown || "",
          bottlenecks: (raw.bottlenecks || []).map((b) => ({
            stage: b.stage || "Unknown",
            count: b.count || 0,
            recommendation: b.recommendation || "",
          })),
          at_risk_contacts: (raw.at_risk_contacts || []).map((c) => ({
            id: c.id,
            name: c.name || "Unknown",
            company: c.company || "Unknown",
            reason: c.reason || "",
          })),
          recommended_actions: (raw.recommended_actions || []).map((a) => ({
            action: a.action || "",
            priority: (a.priority === "high" || a.priority === "medium" || a.priority === "low")
              ? a.priority
              : "medium",
            expected_impact: a.expected_impact || "",
          })),
        }
      } else {
        report = generateFallbackPipelineReview(weeks, pipelineStats, bottlenecks, atRisk)
      }
    } catch (aiError) {
      console.error("AI pipeline review failed:", aiError)
      report = generateFallbackPipelineReview(weeks, pipelineStats, bottlenecks, atRisk)
    }

    try {
      await supabase.from("activities").insert({
        activity_type: "Note",
        activity_date: new Date().toISOString(),
        subject: `Pipeline Review Generated — Health ${report.health_score}/10`,
        content: report.review_markdown,
        notes: `Report type: pipeline-review, period: last ${weeks} weeks, health: ${report.health_score}/10`,
        created_by: "AI",
      })
    } catch (logError) {
      console.error("Failed to log pipeline review:", logError)
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Pipeline review error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackPipelineReview(
  weeks: number,
  stats: Record<string, unknown>,
  bottlenecks: PipelineBottleneck[],
  atRisk: Array<{ id: string; name: string; company: string; score: number | null; stage: string | null }>
): PipelineReviewReport {
  const total = (stats.total_contacts as number) || 0
  const healthScore = (stats.health_score as number) || 5
  const staleCount = (stats.stale_contacts_count as number) || 0

  const stageDist = stats.stage_distribution as Record<string, number>
  const stageText = Object.entries(stageDist)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `- **${k}**: ${v}`)
    .join("\n")

  const atRiskContacts = atRisk.slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    reason: `Stale in ${c.stage || "unknown stage"} with VISTA score ${c.score || "N/A"} — ${staleCount > total * 0.3 ? "high concentration of stale contacts" : "needs re-engagement"}`,
  }))

  const recommendedActions: ReportAction[] = [
    { action: "Re-engage top 5 at-risk high-value contacts", priority: "high", expected_impact: "Recover 2-3 high-potential deals" },
    { action: "Clear bottleneck stages with targeted outreach", priority: "high", expected_impact: "Unblock pipeline flow" },
    { action: "Add 10 new prospects to top of funnel", priority: "medium", expected_impact: "Strengthen pipeline coverage" },
  ]

  const review = `# Pipeline Review — Last ${weeks} weeks

## Pipeline Health Score: ${healthScore}/10

Overall pipeline health is **${healthScore >= 7 ? "strong" : healthScore >= 4 ? "moderate" : "concerning"}** with ${total} active contacts across all stages. The pipeline shows ${bottlenecks.length > 0 ? `${bottlenecks.length} bottleneck(s) that need attention` : "healthy distribution across stages"}.

## Movement Summary

Total active contacts: ${total}
Stale contacts (30+ days no activity): ${staleCount} (${Math.round((staleCount / (total || 1)) * 100)}% of pipeline)

### Stage Distribution
${stageText}

## Bottlenecks

${bottlenecks.length > 0
  ? bottlenecks.map((b) => `- **${b.stage}**: ${b.count} contacts — ${b.recommendation}`).join("\n")
  : "No significant bottlenecks detected. Pipeline is relatively well-distributed."}

## Wins

- ${stats.top_movers_count || 0} contacts with significant score movement (>5 points)
- Conversion rate (Prospect → Contacted): ${stats.conversion_rate_prospect_to_contacted || "N/A"}

## At Risk

${atRisk.length > 0
  ? `${atRisk.length} high-value contacts are stalled and at risk of going cold. These contacts have VISTA scores ≥ 40 but no activity in 30+ days.`
  : "No high-value at-risk contacts detected."}

## Recommended Actions

1. **Re-engage top at-risk contacts** — High priority
2. **Clear pipeline bottlenecks** — High priority
3. **Top of funnel prospecting** — Medium priority`

  return {
    period: `Last ${weeks} weeks`,
    generated_at: new Date().toISOString(),
    health_score: healthScore,
    review_markdown: review,
    bottlenecks,
    at_risk_contacts: atRiskContacts,
    recommended_actions: recommendedActions,
  }
}
