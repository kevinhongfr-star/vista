import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_service_catalog").select("*")

    const tier = searchParams.get("tier")
    if (tier) {
      query.eq("tier", parseInt(tier, 10))
    }

    const category = searchParams.get("category")
    if (category) {
      query.eq("category", category)
    }

    const isDiscountable = searchParams.get("is_discountable")
    if (isDiscountable !== null) {
      query.eq("is_discountable", isDiscountable === "true")
    }

    const { data, error } = await query.order("tier")

    if (error) {
      return NextResponse.json({ services: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ services: data || [] })
  } catch (error) {
    return NextResponse.json({ services: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_service_catalog")
      .insert({
        name: body.name,
        category: body.category,
        tier: body.tier,
        tier_name: body.tier_name,
        price_min_cny: body.price_min_cny,
        price_max_cny: body.price_max_cny,
        price_model: body.price_model,
        target_buyer: body.target_buyer || [],
        is_discountable: body.is_discountable || false,
        discount_rules: body.discount_rules || [],
        tier_positioning: body.tier_positioning || "",
        competitor_anchor: body.competitor_anchor || "",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, service: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}