import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { ClusterInsights, VistaContact } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const clusterId = params.id

    // Get cluster details
    const { data: cluster, error: clusterError } = await supabase
      .from("density_clusters")
      .select("*")
      .eq("cluster_id", clusterId)
      .single()

    if (clusterError) {
      return NextResponse.json({ success: false, error: clusterError.message }, { status: 404 })
    }

    // Get contacts in this cluster
    const { data: contacts, error: contactsError } = await supabase
      .from("vista_contacts")
      .select("id, name, company, function, vista_composite, seniority, pipeline_stage")
      .eq("density_cluster_id", clusterId)

    if (contactsError) {
      return NextResponse.json({ success: false, error: contactsError.message }, { status: 500 })
    }

    // Compute top functions
    const functionCounts: Record<string, number> = {}
    for (const c of contacts || []) {
      const func = c.function || "Unknown"
      functionCounts[func] = (functionCounts[func] || 0) + 1
    }

    const topFunctions = Object.entries(functionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([func, count]) => ({ function: func, count }))

    // Compute average score
    const scores = (contacts || []).map(c => c.vista_composite || 0).filter(s => s > 0)
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0

    // Generate "why this cluster" text
    const insightsTextParts: string[] = []
    
    if (topFunctions[0]?.count > 50) {
      insightsTextParts.push(`High concentration of ${topFunctions[0].function} professionals`)
    }
    
    const execCount = functionCounts["Executive"] || 0
    const totalCount = contacts?.length || 0
    if (execCount > totalCount * 0.3) {
      insightsTextParts.push(`${Math.round(execCount / totalCount * 100)}% executives`)
    }
    
    if (cluster.industry) {
      insightsTextParts.push(`${cluster.industry} focus`)
    }
    
    if (cluster.geography) {
      insightsTextParts.push(`Strong ${cluster.geography} presence`)
    }

    const whyThisCluster = insightsTextParts.length > 0 
      ? insightsTextParts.join(", ") 
      : "Concentrated contact group with aligned profiles"

    // Compute conversion rate from cluster contacts
    // Count how many have advanced past Prospect stage
    const advancedStages = ["Contacted", "Engaged", "Meeting Booked", "Closed Won"]
    const advancedCount = (contacts || []).filter(c => 
      c.pipeline_stage && advancedStages.includes(c.pipeline_stage)
    ).length
    
    const conversionRate = totalCount > 0 
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

    return NextResponse.json({ insights, cluster, contact_count: totalCount })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}