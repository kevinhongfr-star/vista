import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"

interface ContactSummaryResponse {
  summary: string
  confidence: number
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
        stain_score, signal_score, cluster_score, engagement_score, priority_score,
        encirclement_level, bd_pathway, bd_priority
      `)
      .eq("id", contactId)
      .single()

    if (contactError) {
      return NextResponse.json(
        { success: false, error: contactError.message },
        { status: 404 }
      )
    }

    let clusterName = "N/A"
    let clusterSize = 0
    if (contact.density_cluster_id) {
      const { data: cluster } = await supabase
        .from("density_clusters")
        .select("industry, contact_count, cluster_name")
        .eq("cluster_id", contact.density_cluster_id)
        .single()
      if (cluster) {
        clusterName = cluster.cluster_name || cluster.industry || "Unnamed cluster"
        clusterSize = cluster.contact_count || 0
      }
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: recentSignals } = await supabase
      .from("signals")
      .select("id, signal_type, title, content, detected_date, company")
      .or(`contact_ids.cs.{${contactId}}`)
      .gte("detected_date", thirtyDaysAgo.toISOString())
      .order("detected_date", { ascending: false })
      .limit(10)

    const signalSummaries = (recentSignals || [])
      .map((s) => `- ${s.signal_type}: ${s.title || s.content?.slice(0, 80) || "N/A"}`)
      .join("\n") || "No recent signals"

    const composite = contact.vista_composite || 0
    const lastActivity = contact.last_touch_date || contact.last_engagement_date || "Never"

    const prompt = `You are a BD intelligence analyst. Given this contact data, generate a 3-sentence executive summary covering:
1. Who they are and why they matter
2. Current engagement state and momentum
3. Recommended next action with rationale

Contact: ${contact.name || "Unknown"}, ${contact.role || "Unknown role"} at ${contact.company || "Unknown company"}
Industry: ${contact.industry || "Unknown"}
Seniority: ${contact.seniority || "Unknown"}
Function: ${contact.function || "Unknown"}
VISTA Scores: V=${contact.vista_v || 0} I=${contact.vista_i || 0} S=${contact.vista_s || 0} T=${contact.vista_t || 0} A=${contact.vista_a || 0} (Composite: ${composite})
Engagement Tier: ${contact.engagement_tier || "Unknown"}
Pipeline Stage: ${contact.pipeline_stage || "Prospect"}
BD Pathway: ${contact.bd_pathway || "N/A"}
Encirclement Level: ${contact.encirclement_level || "N/A"}
Last Activity: ${lastActivity}
Signals (last 30 days):
${signalSummaries}
Cluster: ${clusterName} (${clusterSize} contacts)

Output ONLY valid JSON with this exact structure:
{
  "summary": "3-sentence executive summary here",
  "confidence": 0.85
}

Confidence should be between 0 and 1, based on how complete the data is.`

    try {
      const result = await callDeepSeekJSON<ContactSummaryResponse>(prompt, {
        model: "flash",
        temperature: 0.7,
        maxTokens: 500,
      })

      return NextResponse.json({
        success: true,
        summary: result.summary,
        confidence: result.confidence,
        source: "ai",
      })
    } catch (aiError) {
      const fallbackSummary = generateFallbackSummary(contact, clusterName)
      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
        confidence: 0.5,
        source: "rules",
        note: "AI unavailable — generated from rules engine",
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackSummary(
  contact: Record<string, unknown>,
  clusterName: string
): string {
  const name = contact.name || "This contact"
  const role = contact.role || "professional"
  const company = contact.company || "their company"
  const composite = (contact.vista_composite as number) || 0
  const stage = contact.pipeline_stage || "Prospect"
  const tier = contact.engagement_tier || "Cold"

  const sentence1 = `${name} is a ${role} at ${company}, operating in the ${clusterName} space with a VISTA composite score of ${composite}.`
  const sentence2 = `Currently in the ${stage} pipeline stage with ${String(tier).toLowerCase()} engagement status.`
  const sentence3 = `Recommended next step: ${composite >= 70 ? "Prioritize outreach with a personalized value proposition" : "Build awareness through content and gradual nurturing"}.`

  return `${sentence1} ${sentence2} ${sentence3}`
}
