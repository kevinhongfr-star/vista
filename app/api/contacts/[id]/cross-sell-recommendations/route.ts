import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data: engagements, error: engError } = await supabase
      .from("vista_contact_service_engagements")
      .select("service_id, status")
      .eq("contact_id", params.id)

    if (engError) {
      return NextResponse.json({ recommendations: [], error: engError.message }, { status: 500 })
    }

    const completedServiceIds = engagements
      ?.filter((e: { status: string }) => e.status === "completed")
      .map((e: { service_id: string }) => e.service_id) || []

    const allServiceIds = engagements
      ?.map((e: { service_id: string }) => e.service_id) || []

    if (completedServiceIds.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    const { data: services, error: svcError } = await supabase
      .from("vista_service_catalog")
      .select("id, name, price_min_cny, price_max_cny, tier")
      .in("id", Array.from(new Set([...completedServiceIds, ...allServiceIds])))

    if (svcError) {
      return NextResponse.json({ recommendations: [], error: svcError.message }, { status: 500 })
    }

    const completedServiceNames = services
      ?.filter((s: { id: string }) => completedServiceIds.includes(s.id))
      .map((s: { name: string }) => s.name) || []

    const engagedServiceNames = services
      ?.filter((s: { id: string }) => allServiceIds.includes(s.id))
      .map((s: { name: string }) => s.name) || []

    if (completedServiceNames.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    const { data: rules, error: rulesError } = await supabase
      .from("vista_cross_sell_rules")
      .select("*")
      .in("source_service_name", completedServiceNames)
      .eq("is_active", true)

    if (rulesError) {
      return NextResponse.json({ recommendations: [], error: rulesError.message }, { status: 500 })
    }

    const filteredRules = rules?.filter(
      (r: { target_service_name: string }) =>
        !engagedServiceNames.includes(r.target_service_name)
    ) || []

    filteredRules.sort((a: { priority: number; success_rate: number }, b: { priority: number; success_rate: number }) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return (b.success_rate || 0) - (a.success_rate || 0)
    })

    const topRules = filteredRules.slice(0, 3)

    const recommendations = topRules.map((rule: {
      id: string
      target_service_name: string
      source_service_name: string
      priority: number
      pitch_script: string
      trigger_delay_days: number
      success_rate: number
    }) => {
      const targetService = services?.find((s: { name: string }) => s.name === rule.target_service_name)
      return {
        rule_id: rule.id,
        target_service_name: rule.target_service_name,
        source_service_name: rule.source_service_name,
        priority: rule.priority,
        pitch_script: rule.pitch_script,
        trigger_delay_days: rule.trigger_delay_days,
        success_rate: rule.success_rate || 0,
        estimated_value_range: targetService
          ? {
              min_cny: targetService.price_min_cny || 0,
              max_cny: targetService.price_max_cny || 0,
            }
          : { min_cny: 0, max_cny: 0 },
      }
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    return NextResponse.json({ recommendations: [], error: String(error) }, { status: 500 })
  }
}