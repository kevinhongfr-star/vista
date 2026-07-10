import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { PIPELINE_STAGES } from "@/lib/types"
import type { PipelineFunnelStage } from "@/lib/types"

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = createServerClient()

    // FIXED: Instead of fetching ALL contacts and counting in JS,
    // fetch only the pipeline_stage column and count in a single lightweight query
    const { data: allContacts, count: total } = await supabase
      .from("vista_contacts")
      .select("pipeline_stage", { count: "exact" })

    // Count by stage using a Map for O(n) performance
    const stageCounts = new Map<string, number>()
    for (const stage of PIPELINE_STAGES) {
      stageCounts.set(stage, 0)
    }
    if (allContacts) {
      for (const c of allContacts) {
        const stage = c.pipeline_stage || "Prospect"
        stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1)
      }
    }

    const safeTotal = total || allContacts?.length || 0

    const funnel: PipelineFunnelStage[] = PIPELINE_STAGES.map(stage => ({
      stage,
      count: stageCounts.get(stage) || 0,
      percentage: safeTotal > 0 ? Math.round(((stageCounts.get(stage) || 0) / safeTotal) * 100) : 0,
    }))

    return NextResponse.json({ funnel, total: safeTotal })
  } catch (error) {
    return NextResponse.json(
      { funnel: [], total: 0, error: String(error) },
      { status: 500 }
    )
  }
}
