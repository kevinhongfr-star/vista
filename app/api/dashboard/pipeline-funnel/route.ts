import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PIPELINE_STAGES } from "@/lib/types"
import type { PipelineFunnelStage } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all contacts with pipeline stage
    const { data: contacts } = await supabase
      .from("vista_contacts")
      .select("pipeline_stage")

    // Count by stage
    const stageCounts: Record<string, number> = {}
    const total = contacts?.length || 0

    for (const stage of PIPELINE_STAGES) {
      stageCounts[stage] = contacts?.filter(c => c.pipeline_stage === stage).length || 0
    }

    // Build funnel with percentages
    const funnel: PipelineFunnelStage[] = PIPELINE_STAGES.map(stage => ({
      stage,
      count: stageCounts[stage] || 0,
      percentage: total > 0 ? Math.round((stageCounts[stage] / total) * 100) : 0,
    }))

    return NextResponse.json({ funnel, total })
  } catch (error) {
    return NextResponse.json(
      { funnel: [], total: 0, error: String(error) },
      { status: 500 }
    )
  }
}