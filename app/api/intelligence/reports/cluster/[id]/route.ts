import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { ClusterIntelligenceReport } from "@/lib/types"

export const dynamic = "force-dynamic"

interface AIRawReport {
  cluster_id?: string
  cluster_name?: string
  narrative?: string
  key_players?: Array<{ name?: string; company?: string; reason?: string }>
  recommended_actions?: Array<{ action?: string; priority?: string; timeline?: string }>
  risks?: string[]
  word_count?: number
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const clusterId = params.id

    const { data: cluster, error: clusterError } = await supabase
      .from("density_clusters")
      .select("*")
      .eq("cluster_id", clusterId)
      .single()

    if (clusterError) {
      return NextResponse.json(
        { success: false, error: clusterError.message },
        { status: 404 }
      )
    }

    // Fetch top 10 contacts in this cluster
    const { data: contacts } = await supabase
      .from("vista_contacts")
      .select("id, name, company, role, seniority, function, pipeline_stage, vista_composite, engagement_tier")
      .eq("density_cluster_id", clusterId)
      .order("vista_composite", { ascending: false })
      .limit(10)

    // Fetch recent signals related to this cluster
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: signals } = await supabase
      .from("signals")
      .select("*")
      .gte("detected_date", thirtyDaysAgo.toISOString())
      .order("detected_date", { ascending: false })
      .limit(20)

    // Compute pipeline distribution
    const pipelineDist: Record<string, number> = {}
    for (const c of contacts || []) {
      const stage = c.pipeline_stage || "Unknown"
      pipelineDist[stage] = (pipelineDist[stage] || 0) + 1
    }

    const avgScore = contacts && contacts.length > 0
      ? Math.round(contacts.reduce((sum, c) => sum + (c.vista_composite || 0), 0) / contacts.length)
      : 0

    const clusterStats = {
      contact_count: cluster.contact_count || 0,
      avg_score: avgScore,
      density_score: cluster.density_score || 0,
      revenue_potential: cluster.revenue_potential || 0,
      pipeline_distribution: pipelineDist,
      status: cluster.status || "Watch",
      signal_types: cluster.signal_types || [],
    }

    const topContactsSummary = contacts?.slice(0, 10).map((c) => ({
      name: c.name,
      company: c.company,
      role: c.role,
      seniority: c.seniority,
      stage: c.pipeline_stage,
      vista_score: c.vista_composite,
    })) || []

    const recentSignalsSummary = signals?.slice(0, 5).map((s) => ({
      type: s.signal_type,
      title: s.title,
      strength: s.signal_strength,
      company: s.company,
      date: s.detected_date,
      description: s.description,
    })) || []

    const prompt = `You are writing a cluster intelligence brief for Kevin Hong, Managing Partner at LYC Partners (executive search firm).

Cluster: ${cluster.industry} (${cluster.geography})
Cluster ID: ${clusterId}
Sector: ${cluster.industry}
Geography: ${cluster.geography}

Cluster stats:
${JSON.stringify(clusterStats, null, 2)}

Top 10 contacts:
${JSON.stringify(topContactsSummary, null, 2)}

Recent signals (last 30 days):
${JSON.stringify(recentSignalsSummary, null, 2)}

Write a 500-800 word intelligence brief covering:
1. **Cluster Narrative** — What is this cluster about? Why does it matter now?
2. **Key Players** — Top 3-5 contacts to watch and why
3. **Market Signals** — What's moving in this space (based on recent signals)
4. **Strategic Opportunity** — Where is the white space for LYC Partners?
5. **Recommended Actions** — Top 3 next moves with timeline
6. **Risks** — What could go wrong or be missed

Tone: Board-level briefing. Data-driven. No fluff.

Return JSON: {
  "cluster_id": "${clusterId}",
  "cluster_name": "${cluster.industry} (${cluster.geography})",
  "narrative": "full markdown text covering all 6 sections",
  "key_players": [{"name": "...", "company": "...", "reason": "..."}],
  "recommended_actions": [{"action": "...", "priority": "high|medium|low", "timeline": "..."}],
  "risks": ["..."],
  "word_count": number
}`

    let report: ClusterIntelligenceReport

    try {
      const result = await callDeepSeekJSON<AIRawReport | { report: AIRawReport } | Record<string, unknown>>(prompt, {
        model: "pro",
        temperature: 0.5,
        maxTokens: 3000,
      })

      let raw: AIRawReport | undefined
      if (result && typeof result === "object") {
        if ("narrative" in result) {
          raw = result as AIRawReport
        } else if ("report" in result) {
          const inner = (result as { report: AIRawReport }).report
          if (inner && typeof inner === "object" && "narrative" in inner) {
            raw = inner
          }
        }
      }

      if (raw) {
        report = {
          cluster_id: raw.cluster_id || clusterId,
          cluster_name: raw.cluster_name || `${cluster.industry} (${cluster.geography})`,
          generated_at: new Date().toISOString(),
          narrative: raw.narrative || "",
          key_players: (raw.key_players || []).map((k) => ({
            name: k.name || "Unknown",
            company: k.company || "Unknown",
            reason: k.reason || "",
          })),
          recommended_actions: (raw.recommended_actions || []).map((a) => ({
            action: a.action || "",
            priority: (a.priority === "high" || a.priority === "medium" || a.priority === "low")
              ? a.priority
              : "medium",
            timeline: a.timeline || "",
          })),
          risks: raw.risks || [],
          word_count: raw.word_count || (raw.narrative?.split(/\s+/).length || 0),
        }
      } else {
        report = generateFallbackClusterReport(clusterId, cluster, clusterStats, topContactsSummary)
      }
    } catch (aiError) {
      console.error("AI cluster report failed:", aiError)
      report = generateFallbackClusterReport(clusterId, cluster, clusterStats, topContactsSummary)
    }

    // Log activity
    try {
      await supabase.from("activities").insert({
        activity_type: "Note",
        activity_date: new Date().toISOString(),
        subject: `Cluster Report Generated: ${report.cluster_name}`,
        content: report.narrative,
        notes: `Report type: cluster, ${report.word_count} words, ${report.key_players.length} key players`,
        created_by: "AI",
      })
    } catch (logError) {
      console.error("Failed to log cluster report:", logError)
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Cluster report error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackClusterReport(
  clusterId: string,
  cluster: { industry?: string; geography?: string; status?: string; revenue_potential?: number; density_score?: number; contact_count?: number; signal_types?: string[] | null },
  stats: Record<string, unknown>,
  topContacts: Array<{ name: string; company: string; role?: string; vista_score?: number }>
): ClusterIntelligenceReport {
  const industry = cluster.industry || "Unknown Industry"
  const geography = cluster.geography || "Unknown Region"
  const clusterName = `${industry} (${geography})`

  const keyPlayers = topContacts.slice(0, 5).map((c) => ({
    name: c.name,
    company: c.company,
    reason: `High-priority contact in ${industry} with VISTA score of ${c.vista_score || "N/A"}`,
  }))

  const narrative = `# ${clusterName} — Intelligence Brief

## Cluster Narrative

The ${industry} sector in ${geography} represents a high-density talent cluster with ${stats.contact_count || 0} identified contacts and an average VISTA score of ${stats.avg_score || "N/A"}. The cluster status is ${cluster.status || "Watch"}, indicating ${cluster.status === "Active" ? "active engagement opportunities" : cluster.status === "Emerging" ? "growing potential" : "monitoring phase"}.

This cluster is strategically significant for LYC Partners given the revenue potential of $${(cluster.revenue_potential || 0).toLocaleString()} and a density score of ${cluster.density_score || 0}. The concentration of senior professionals in this space creates multiple touch points for executive search engagements.

## Key Players

The top contacts in this cluster span senior roles across ${industry}. These individuals represent the highest-priority targets based on composite scoring and engagement signals.

## Market Signals

${cluster.signal_types && cluster.signal_types.length > 0
  ? `Active signal types include: ${cluster.signal_types.join(", ")}. These signals suggest movement in the market that could create search opportunities.`
  : "No recent signals detected for this cluster. Continue monitoring for leadership changes, funding events, and strategic shifts."
}

## Strategic Opportunity

The white space for LYC Partners lies in:
1. Building deeper relationships with key players before competitors engage
2. Leveraging cluster density for warm introductions and referrals
3. Positioning as the go-to search partner for ${industry} in ${geography}

## Recommended Actions

1. **Initiate outreach** to top 3 contacts with personalized value propositions
2. **Map organizational structures** to identify additional decision-makers
3. **Develop industry content** tailored to ${industry} pain points

## Risks

- Cluster may be over-represented by a single company, reducing diversification
- Timing could be off if the sector is in a downturn
- Competitors may already have established relationships in this space`

  return {
    cluster_id: clusterId,
    cluster_name: clusterName,
    generated_at: new Date().toISOString(),
    narrative,
    key_players: keyPlayers,
    recommended_actions: [
      { action: "Initiate outreach to top 3 contacts", priority: "high", timeline: "This week" },
      { action: "Map organizational structures", priority: "medium", timeline: "Next 2 weeks" },
      { action: "Develop industry content", priority: "low", timeline: "Next month" },
    ],
    risks: [
      "Single-company concentration risk",
      "Sector timing / market downturn",
      "Competitor saturation",
    ],
    word_count: narrative.split(/\s+/).length,
  }
}
