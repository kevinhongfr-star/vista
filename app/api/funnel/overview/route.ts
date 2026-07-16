import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const FUNNEL_STAGES = [
  "awareness",
  "engagement",
  "validation",
  "investment",
  "transformation",
  "membership",
  "advocacy",
] as const

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: contacts, error: contactError } = await supabase
      .from("vista_contacts")
      .select("id, funnel_stage, created_at")

    if (contactError) {
      return NextResponse.json({ stages: [], error: contactError.message }, { status: 500 })
    }

    const stageCounts: Record<string, number> = {}
    FUNNEL_STAGES.forEach((stage) => {
      stageCounts[stage] = 0
    })

    let total = 0
    for (const contact of contacts || []) {
      const stage = contact.funnel_stage || "awareness"
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage]++
        total++
      }
    }

    const stages = FUNNEL_STAGES.map((stage) => ({
      name: stage,
      count: stageCounts[stage] || 0,
      pct_of_total: total > 0 ? Math.round((stageCounts[stage] / total) * 100) : 0,
      avg_days_in_stage: 0,
    }))

    return NextResponse.json({ stages })
  } catch (error) {
    return NextResponse.json({ stages: [], error: String(error) }, { status: 500 })
  }
}