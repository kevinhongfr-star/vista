import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_discount_rules")
      .select("*")

    if (error) {
      return NextResponse.json({ rules: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rules: data || [] })
  } catch (error) {
    return NextResponse.json({ rules: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { service_id, requested_discount_pct, contact_id } = body

  try {
    const supabase = createServerClient()

    const { data: service, error: serviceError } = await supabase
      .from("vista_service_catalog")
      .select("tier, is_discountable")
      .eq("id", service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({
        success: false,
        error: "Service not found",
      }, { status: 404 })
    }

    if (!service.is_discountable) {
      return NextResponse.json({
        allowed: false,
        max_allowed_pct: 0,
        frame_as: "",
        reason: "This service is not eligible for discounts",
      })
    }

    const { data: rules, error: rulesError } = await supabase
      .from("vista_discount_rules")
      .select("*")
      .eq("applicable_tier", service.tier)

    if (rulesError) {
      return NextResponse.json({ rules: [], error: rulesError.message }, { status: 500 })
    }

    const neverOverrideRule = rules?.find((r) => r.never_override === true)
    if (neverOverrideRule) {
      return NextResponse.json({
        allowed: false,
        max_allowed_pct: 0,
        frame_as: neverOverrideRule.frame_as || "",
        reason: `Discount not allowed for ${neverOverrideRule.rule_name}`,
      })
    }

    const maxDiscountRule = rules?.reduce((max, rule) => 
      rule.max_discount_pct > (max?.max_discount_pct || 0) ? rule : max
    , null)

    const maxAllowed = maxDiscountRule?.max_discount_pct || 0
    const allowed = requested_discount_pct <= maxAllowed

    return NextResponse.json({
      allowed,
      max_allowed_pct: maxAllowed,
      frame_as: maxDiscountRule?.frame_as || "",
      reason: allowed ? "" : `Maximum discount allowed is ${maxAllowed}%`,
    })
  } catch (error) {
    return NextResponse.json({
      allowed: false,
      max_allowed_pct: 0,
      frame_as: "",
      reason: String(error),
    }, { status: 500 })
  }
}