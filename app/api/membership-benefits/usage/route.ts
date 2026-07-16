import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const contactId = searchParams.get("contact_id")

    const query = supabase.from("vista_membership_benefit_usage").select("*, vista_membership_benefits(benefit_name)")

    if (contactId) {
      query.eq("contact_id", contactId)
    }

    const { data, error } = await query.order("used_date", { ascending: false })

    if (error) {
      return NextResponse.json({ usage: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ usage: data || [] })
  } catch (error) {
    return NextResponse.json({ usage: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: benefit, error: bError } = await supabase
      .from("vista_membership_benefits")
      .select("id, tier, max_uses_per_period")
      .eq("id", body.benefit_id)
      .single()

    if (bError || !benefit) {
      return NextResponse.json({ success: false, error: "Benefit not found" }, { status: 404 })
    }

    const { data: existingUsage, error: uError } = await supabase
      .from("vista_membership_benefit_usage")
      .select("id")
      .eq("contact_id", body.contact_id)
      .eq("benefit_id", body.benefit_id)

    if (!uError && existingUsage && existingUsage.length >= (benefit.max_uses_per_period || 1)) {
      return NextResponse.json({ success: false, error: "Max uses exceeded for this period" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("vista_membership_benefit_usage")
      .insert({
        contact_id: body.contact_id,
        benefit_id: body.benefit_id,
        used_date: body.used_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, usage: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}