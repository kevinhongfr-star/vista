import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_service_catalog")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    return NextResponse.json({ success: true, service: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_service_catalog")
      .update({
        name: body.name,
        category: body.category,
        tier: body.tier,
        tier_name: body.tier_name,
        price_min_cny: body.price_min_cny,
        price_max_cny: body.price_max_cny,
        price_model: body.price_model,
        target_buyer: body.target_buyer,
        is_discountable: body.is_discountable,
        discount_rules: body.discount_rules,
        tier_positioning: body.tier_positioning,
        competitor_anchor: body.competitor_anchor,
      })
      .eq("id", params.id)
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