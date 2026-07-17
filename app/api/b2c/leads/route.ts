import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const stage = searchParams.get("stage")
    const label = searchParams.get("label")
    const search = searchParams.get("search")
    const minScore = searchParams.get("min_score")
    const maxScore = searchParams.get("max_score")
    const tier = searchParams.get("tier")
    const industry = searchParams.get("industry")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("vista_b2c_leads")
      .select("*", { count: "exact" })
      .order("b2b_potential_score", { ascending: false })
      .range(offset, offset + limit - 1)

    if (stage) {
      query = query.eq("pipeline_stage", stage)
    }
    if (label) {
      query = query.eq("b2b_score_label", label)
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
      )
    }
    if (minScore) {
      query = query.gte("b2b_potential_score", parseInt(minScore))
    }
    if (maxScore) {
      query = query.lte("b2b_potential_score", parseInt(maxScore))
    }
    if (tier) {
      query = query.eq("current_tier", tier)
    }
    if (industry) {
      query = query.ilike("industry", `%${industry}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { leads: [], error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      leads: data || [],
      total: count || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { leads: [], error: String(error) },
      { status: 500 }
    )
  }
}
