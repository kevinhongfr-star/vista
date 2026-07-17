import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_membership_benefits").select("*")

    const tier = searchParams.get("tier")
    if (tier) {
      query.eq("tier_required", parseInt(tier, 10))
    }

    const { data, error } = await query
      .eq("is_active", true)
      .order("tier_required")
      .order("benefit_name")

    if (error) {
      return NextResponse.json({ benefits: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ benefits: data || [] })
  } catch (error) {
    return NextResponse.json({ benefits: [], error: String(error) }, { status: 500 })
  }
}
