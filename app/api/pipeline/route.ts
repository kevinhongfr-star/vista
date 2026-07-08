import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PIPELINE_STAGES, type PipelineStage, type PipelineFunnelStage } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all contacts with pipeline stage
    const { data: contacts, error } = await supabase
      .from("vista_contacts")
      .select("id, name, company, pipeline_stage, vista_composite, last_contact_date")

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Group by stage
    const stageGroups: Record<string, typeof contacts> = {}
    for (const stage of PIPELINE_STAGES) {
      stageGroups[stage] = contacts?.filter(c => c.pipeline_stage === stage) || []
    }

    const total = contacts?.length || 0

    // Build funnel
    const funnel: PipelineFunnelStage[] = PIPELINE_STAGES.map(stage => {
      const stageContacts = stageGroups[stage] || []
      return {
        stage,
        count: stageContacts.length,
        percentage: total > 0 ? Math.round((stageContacts.length / total) * 100) : 0,
        contacts: stageContacts.slice(0, 20), // Top 20 per stage for preview
      }
    })

    // Calculate conversion rates between stages
    const conversions: Record<string, number> = {}
    for (let i = 1; i < PIPELINE_STAGES.length; i++) {
      const prevStage = PIPELINE_STAGES[i - 1]
      const currStage = PIPELINE_STAGES[i]
      const prevCount = stageGroups[prevStage]?.length || 0
      const currCount = stageGroups[currStage]?.length || 0
      // Conversion rate from previous stage to current
      const rate = prevCount > 0 ? Math.round((currCount / (prevCount + currCount)) * 100) : 0
      conversions[`${prevStage}_to_${currStage}`] = rate
    }

    return NextResponse.json({
      stages: funnel,
      total,
      conversions,
      stageCounts: PIPELINE_STAGES.map(s => ({ stage: s, count: stageGroups[s]?.length || 0 })),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}