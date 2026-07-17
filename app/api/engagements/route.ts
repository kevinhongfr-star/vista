import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_contact_service_engagements").select("*, vista_service_catalog(*)")

    const serviceId = searchParams.get("service_id")
    if (serviceId) {
      query.eq("service_id", serviceId)
    }

    const status = searchParams.get("status")
    if (status) {
      query.eq("status", status)
    }

    const { data, error } = await query.order("engagement_date", { ascending: false })

    if (error) {
      return NextResponse.json({ engagements: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagements: data || [] })
  } catch (error) {
    return NextResponse.json({ engagements: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: service, error: serviceError } = await supabase
      .from("vista_service_catalog")
      .select("tier, tier_name")
      .eq("id", body.service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("vista_contact_service_engagements")
      .insert({
        contact_id: body.contact_id,
        service_id: body.service_id,
        engagement_date: body.engagement_date || new Date().toISOString().split("T")[0],
        tier_at_engagement: service.tier,
        price_paid_cny: body.price_paid_cny || 0,
        was_discounted: body.was_discounted || false,
        discount_pct: body.discount_pct || 0,
        status: body.status || "scheduled",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, engagement: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}