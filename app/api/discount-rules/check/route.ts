import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { service_id, requested_discount_pct, contact_id } = body

  try {
    const supabase = createServerClient()

    const { data: service, error: serviceError } = await supabase
      .from("vista_service_catalog")
      .select("tier, tier_name, is_discountable")
      .eq("id", service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({
        success: false,
        error: "Service not found",
      }, { status: 404 })
    }

    const { data: rules, error: rulesError } = await supabase
      .from("vista_discount_rules")
      .select("*")
      .eq("applicable_tier", service.tier)

    if (rulesError) {
      return NextResponse.json({ rules: [], error: rulesError.message }, { status: 500 })
    }

    if (!service.is_discountable) {
      return NextResponse.json({
        allowed: false,
        max_allowed_pct: 0,
        frame_as: "",
        reason: `Discounts are not allowed for ${service.tier_name} services`,
      })
    }

    const neverOverrideRule = rules?.find((r) => r.never_override === true)
    if (neverOverrideRule) {
      return NextResponse.json({
        allowed: false,
        max_allowed_pct: 0,
        frame_as: neverOverrideRule.frame_as || "",
        reason: `${neverOverrideRule.rule_name}: Discounts are not allowed for ${service.tier_name}`,
      })
    }

    let maxAllowed = 0
    let frameAs = ""
    let reason = ""

    for (const rule of rules || []) {
      let conditionMet = true

      if (rule.condition_type && rule.condition_params) {
        const params = typeof rule.condition_params === "string" 
          ? JSON.parse(rule.condition_params) 
          : rule.condition_params

        switch (rule.condition_type) {
          case "founding_client":
            if (contact_id) {
              const { data: contact, error: contactError } = await supabase
                .from("vista_contacts")
                .select("is_founding_client")
                .eq("id", contact_id)
                .single()

              if (contactError || !contact || !contact.is_founding_client) {
                conditionMet = false
              }
            } else {
              conditionMet = false
            }
            break

          case "minimum_spend":
            if (contact_id) {
              const { data: engagements, error: engError } = await supabase
                .from("vista_contact_service_engagements")
                .select("price_paid_cny")
                .eq("contact_id", contact_id)

              if (!engError && engagements) {
                const totalSpent = engagements.reduce((sum: number, e: { price_paid_cny: number }) => sum + e.price_paid_cny, 0)
                if (totalSpent < (params.minimum_spend || 0)) {
                  conditionMet = false
                }
              } else {
                conditionMet = false
              }
            } else {
              conditionMet = false
            }
            break

          case "tier_progress":
            if (contact_id) {
              const { data: progressions, error: progError } = await supabase
                .from("vista_tier_progressions")
                .select("to_tier")
                .eq("contact_id", contact_id)

              if (!progError && progressions && progressions.length > 0) {
                const highestTier = Math.max(...progressions.map((p: { to_tier: number }) => p.to_tier))
                if (highestTier < (params.minimum_tier || 1)) {
                  conditionMet = false
                }
              }
            }
            break
        }
      }

      if (conditionMet && rule.max_discount_pct > maxAllowed) {
        maxAllowed = rule.max_discount_pct
        frameAs = rule.frame_as || ""
        reason = `${rule.rule_name}: Up to ${rule.max_discount_pct}% discount allowed`
      }
    }

    const allowed = requested_discount_pct <= maxAllowed

    return NextResponse.json({
      allowed,
      max_allowed_pct: maxAllowed,
      frame_as: frameAs,
      reason: allowed ? reason : `Maximum discount allowed is ${maxAllowed}%`,
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