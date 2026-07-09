import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { ClusterInsights } from "@/lib/types"

interface AIClusterNarrative {
  narrative: string
  strategy: string
  priority_contacts: string[]
  recommended_program: string
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

    const { data: contacts, error: contactsError } = await supabase
      .from("vista_contacts")
      .select(
        "id, name, company, function, vista_composite, seniority, pipeline_stage, role, industry"
      )
      .eq("density_cluster_id", clusterId)
      .order("vista_composite", { ascending: false })
      .limit(50)

    if (contactsError) {
      return NextResponse.json(
        { success: false, error: contactsError.message },
        { status: 500 }
      )
    }

    const functionCounts: Record<string, number> = {}
    for (const c of contacts || []) {
      const func = c.function || "Unknown"
      functionCounts[func] = (functionCounts[func] || 0) + 1
    }

    const topFunctions = Object.entries(functionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([func, count]) => ({ function: func, count }))

    const scores = (contacts || [])
      .map((c) => c.vista_composite || 0)
      .filter((s) => s > 0)
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0

    const insightsTextParts: string[] = []

    if (topFunctions[0]?.count > 50) {
      insightsTextParts.push(
        `High concentration of ${topFunctions[0].function} professionals`
      )
    }

    const execCount = functionCounts["Executive"] || 0
    const totalCount = cluster.contact_count || contacts?.length || 0
    if (totalCount > 0 && execCount > totalCount * 0.3) {
      insightsTextParts.push(
        `${Math.round((execCount / totalCount) * 100)}% executives`
      )
    }

    if (cluster.industry) {
      insightsTextParts.push(`${cluster.industry} focus`)
    }

    if (cluster.geography) {
      insightsTextParts.push(`Strong ${cluster.geography} presence`)
    }

    const whyThisCluster =
      insightsTextParts.length > 0
        ? insightsTextParts.join(", ")
        : "Concentrated contact group with aligned profiles"

    const advancedStages = [
      "Contacted",
      "Engaged",
      "Meeting Booked",
      "Closed Won",
    ]
    const advancedCount = (contacts || []).filter(
      (c) => c.pipeline_stage && advancedStages.includes(c.pipeline_stage)
    ).length

    const conversionRate =
      totalCount > 0
        ? Math.round((advancedCount / totalCount) * 100)
        : (cluster.conversion_rate || 0)

    const insights: ClusterInsights = {
      cluster_id: clusterId,
      why_this_cluster: whyThisCluster,
      top_functions: topFunctions,
      conversion_rate: conversionRate,
      avg_score: avgScore,
      revenue_potential: cluster.revenue_potential || 0,
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: clusterSignals } = await supabase
      .from("signals")
      .select("id, signal_type, title, content, company, detected_date")
      .gte("detected_date", thirtyDaysAgo.toISOString())
      .order("detected_date", { ascending: false })
      .limit(20)

    const topContactsSummary = (contacts || [])
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        role: c.role,
        function: c.function,
        seniority: c.seniority,
        score: c.vista_composite || 0,
        stage: c.pipeline_stage,
      }))

    const aiPrompt = `You are a market intelligence analyst. Given this density cluster of contacts, generate:
1. A 2-sentence narrative describing who they are as a group
2. Why they cluster together (common signals, industry, geography)
3. Recommended engagement strategy for the cluster as a whole
4. Top 3 priority contacts to engage first and why — return their names only
5. Recommended program/campaign for the cluster

Cluster: ${cluster.cluster_name || cluster.industry || "Unnamed cluster"}
Geography: ${cluster.geography || "N/A"}
Total contacts: ${totalCount}
Average score: ${avgScore}
Top functions: ${topFunctions.map((f) => `${f.function} (${f.count})`).join(", ")}

Top 10 contacts (by score):
${JSON.stringify(topContactsSummary, null, 2)}

Recent cluster signals (30 days):
${JSON.stringify(clusterSignals || [], null, 2)}

Output ONLY valid JSON with this exact structure:
{
  "narrative": "2-sentence narrative describing the cluster as a group",
  "strategy": "Recommended engagement strategy for the cluster",
  "priority_contacts": ["Contact Name 1", "Contact Name 2", "Contact Name 3"],
  "recommended_program": "Executive Brief"
}`

    let aiNarrative: AIClusterNarrative | null = null
    let aiSource: "ai" | "rules" = "rules"

    try {
      aiNarrative = await callDeepSeekJSON<AIClusterNarrative>(aiPrompt, {
        model: "flash",
        temperature: 0.7,
        maxTokens: 1024,
      })
      aiSource = "ai"
    } catch (aiError) {
      aiNarrative = generateFallbackNarrative(
        cluster,
        contacts || [],
        topFunctions,
        avgScore
      )
    }

    return NextResponse.json({
      success: true,
      insights,
      cluster,
      contact_count: totalCount,
      narrative: aiNarrative,
      narrative_source: aiSource,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackNarrative(
  cluster: Record<string, unknown>,
  contacts: Array<Record<string, unknown>>,
  topFunctions: { function: string; count: number }[],
  avgScore: number
): AIClusterNarrative {
  const industry = cluster.industry || "this market segment"
  const totalCount = cluster.contact_count || contacts.length
  const topFunc = topFunctions[0]?.function || "professional"
  const topContactNames = contacts
    .slice(0, 3)
    .map((c) => (c.name as string) || "Unknown")

  const narrative = `This cluster represents ${totalCount} contacts in the ${industry} space, predominantly consisting of ${topFunc.toLowerCase()} professionals. They cluster around shared industry focus and comparable seniority levels, indicating a cohesive target audience with similar business challenges.`

  const strategy = `Focus on thought leadership content tailored to the ${industry} sector. Prioritize executive-level engagement given the seniority distribution. Use a multi-touch approach combining personalized outreach with industry-specific events and roundtables.`

  const recommendedProgram =
    avgScore >= 70 ? "Executive Brief" : "Roundtable Discussion"

  return {
    narrative,
    strategy,
    priority_contacts: topContactNames,
    recommended_program: recommendedProgram,
  }
}
