import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const period = searchParams.get("period") || "30d"

    const { data: progressions, error } = await supabase
      .from("vista_tier_progressions")
      .select("*")
      .order("progression_date", { ascending: false })

    if (error) {
      return NextResponse.json({ progressions: [], error: error.message }, { status: 500 })
    }

    const progressionMap: Record<string, { from_tier: number; to_tier: number; count: number; days: number[] }> = {}

    for (const p of progressions || []) {
      const key = `${p.from_tier}->${p.to_tier}`
      if (!progressionMap[key]) {
        progressionMap[key] = { from_tier: p.from_tier, to_tier: p.to_tier, count: 0, days: [] }
      }
      progressionMap[key].count++
      if (p.days_in_previous_tier) {
        progressionMap[key].days.push(p.days_in_previous_tier)
      }
    }

    const result = Object.values(progressionMap).map((p) => ({
      from_tier: p.from_tier,
      to_tier: p.to_tier,
      count: p.count,
      avg_days: p.days.length > 0
        ? Math.round(p.days.reduce((sum, d) => sum + d, 0) / p.days.length)
        : 0,
    }))

    return NextResponse.json({ progressions: result, period })
  } catch (error) {
    return NextResponse.json({ progressions: [], error: String(error) }, { status: 500 })
  }
}