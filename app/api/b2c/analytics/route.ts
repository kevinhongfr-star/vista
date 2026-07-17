import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"

    let days = 30
    if (period === "7d") days = 7
    if (period === "90d") days = 90
    if (period === "1y") days = 365

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data: leads, error: leadsError } = await supabase
      .from("vista_b2c_leads")
      .select("*")

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 })
    }

    const { data: conversions, error: convError } = await supabase
      .from("vista_b2c_conversions")
      .select("*")
      .gte("converted_at", since)

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    const allLeads = leads || []
    const totalLeads = allLeads.length
    const flagged = allLeads.filter((l) => l.b2b_score_label === "high_priority").length
    const watch = allLeads.filter((l) => l.b2b_score_label === "watch").length
    const monitor = allLeads.filter((l) => l.b2b_score_label === "monitor").length
    const low = allLeads.filter((l) => l.b2b_score_label === "low").length

    const promoted = allLeads.filter((l) => l.pipeline_stage === "promoted").length
    const conversionRate = flagged > 0 ? Math.round((promoted / flagged) * 100) : 0

    const avgScore = totalLeads > 0
      ? Math.round(allLeads.reduce((sum, l) => sum + (l.b2b_potential_score || 0), 0) / totalLeads)
      : 0

    const stageCounts: Record<string, number> = {}
    for (const l of allLeads) {
      const stage = l.pipeline_stage || "b2c_user"
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    }

    const scoreDistribution = {
      "0-39": low,
      "40-59": monitor,
      "60-79": watch,
      "80-100": flagged,
    }

    const allConversions = conversions || []
    const avgTimeToConvert = allConversions.length > 0
      ? Math.round(
          allConversions.reduce((sum, c) => sum + (c.b2c_days_as_user || 0), 0) /
            allConversions.length
        )
      : 0

    const totalB2CSpend = allConversions.reduce(
      (sum, c) => sum + (c.b2c_total_spend_cny || 0),
      0
    )

    return NextResponse.json({
      period,
      total_leads: totalLeads,
      flagged,
      watch,
      monitor,
      low,
      promoted,
      conversion_rate: conversionRate,
      avg_score: avgScore,
      stage_counts: stageCounts,
      score_distribution: scoreDistribution,
      total_conversions: allConversions.length,
      avg_time_to_convert_days: avgTimeToConvert,
      total_b2c_spend_from_converters: totalB2CSpend,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
