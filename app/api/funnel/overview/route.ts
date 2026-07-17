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

    const { data: progressions, error: progError } = await supabase
      .from("vista_tier_progressions")
      .select("from_tier, created_at, updated_at")

    if (progError) {
      return NextResponse.json({ stages: [], error: progError.message }, { status: 500 })
    }

    const tierDaysMap: Record<number, { totalDays: number; count: number }> = {}
    for (const p of progressions || []) {
      const fromTier = p.from_tier
      if (fromTier && p.created_at && p.updated_at) {
        const start = new Date(p.created_at)
        const end = new Date(p.updated_at)
        const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        if (!tierDaysMap[fromTier]) {
          tierDaysMap[fromTier] = { totalDays: 0, count: 0 }
        }
        tierDaysMap[fromTier].totalDays += days
        tierDaysMap[fromTier].count += 1
      }
    }

    const stages = FUNNEL_STAGES.map((stage, index) => {
      const tier = index + 1
      const tierData = tierDaysMap[tier]
      const avgDays = tierData && tierData.count > 0
        ? Math.round(tierData.totalDays / tierData.count)
        : null
      return {
        name: stage,
        count: stageCounts[stage] || 0,
        pct_of_total: total > 0 ? Math.round((stageCounts[stage] / total) * 100) : 0,
        avg_days_in_stage: avgDays,
      }
    })

    return NextResponse.json({ stages })
  } catch (error) {
    return NextResponse.json({ stages: [], error: String(error) }, { status: 500 })
  }
}
