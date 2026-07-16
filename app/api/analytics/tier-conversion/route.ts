import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: progressions, error } = await supabase
      .from("vista_tier_progressions")
      .select("from_tier, to_tier")

    if (error) {
      return NextResponse.json({ conversions: [], error: error.message }, { status: 500 })
    }

    const tierCounts: Record<number, number> = {}
    const transitionCounts: Record<string, number> = {}

    for (const p of progressions || []) {
      tierCounts[p.from_tier] = (tierCounts[p.from_tier] || 0) + 1
      const key = `${p.from_tier}->${p.to_tier}`
      transitionCounts[key] = (transitionCounts[key] || 0) + 1
    }

    const conversions: { from_tier: number; to_tier: number; count: number; conversion_rate: number }[] = []

    for (const key of Object.keys(transitionCounts)) {
      const [fromStr, toStr] = key.split("->")
      const from = parseInt(fromStr, 10)
      const to = parseInt(toStr, 10)
      const count = transitionCounts[key]
      const total = tierCounts[from] || 0
      const rate = total > 0 ? Math.round((count / total) * 100) : 0

      conversions.push({ from_tier: from, to_tier: to, count, conversion_rate: rate })
    }

    return NextResponse.json({ conversions })
  } catch (error) {
    return NextResponse.json({ conversions: [], error: String(error) }, { status: 500 })
  }
}