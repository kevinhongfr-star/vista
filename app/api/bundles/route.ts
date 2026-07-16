import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("vista_service_bundles")
      .select("*")
      .eq("status", "active")
      .order("bundle_name")

    if (error) {
      return NextResponse.json({ bundles: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bundles: data || [] })
  } catch (error) {
    return NextResponse.json({ bundles: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { service_ids } = body

    if (!service_ids || service_ids.length === 0) {
      return NextResponse.json({
        individual_total: 0,
        bundle_price: 0,
        savings_pct: 0,
        recommended_bundle: null,
      })
    }

    const supabase = createServerClient()

    const { data: services, error: svcError } = await supabase
      .from("vista_service_catalog")
      .select("id, name, price_min_cny, price_max_cny")
      .in("id", service_ids)

    if (svcError) {
      return NextResponse.json({ success: false, error: svcError.message }, { status: 500 })
    }

    const individualTotal = services?.reduce(
      (sum: number, s: { price_min_cny: number; price_max_cny: number }) =>
        sum + ((s.price_min_cny + s.price_max_cny) / 2),
      0
    ) || 0

    const { data: bundles, error: bundleError } = await supabase
      .from("vista_service_bundles")
      .select("*")
      .eq("status", "active")

    if (bundleError) {
      return NextResponse.json({ success: false, error: bundleError.message }, { status: 500 })
    }

    let bestBundle: { id: string; name: string } | null = null
    let bestSavings = 0
    let bundlePrice = 0

    const serviceIdSet = new Set(service_ids)

    for (const bundle of bundles || []) {
      const bundleServiceNames: string[] = Array.isArray(bundle.component_service_names)
        ? bundle.component_service_names
        : []

      const bundleServicesMatch = bundleServiceNames.length > 0 &&
        service_ids.length === bundleServiceNames.length &&
        service_ids.every((id: string) => bundleServiceNames.includes(id))

      if (bundleServicesMatch) {
        const price = (bundle.bundle_price_min_cny + bundle.bundle_price_max_cny) / 2
        const savings = individualTotal - price
        const savingsPct = individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0

        if (savingsPct > bestSavings) {
          bestSavings = savingsPct
          bestBundle = { id: bundle.id, name: bundle.bundle_name }
          bundlePrice = price
        }
      }
    }

    return NextResponse.json({
      individual_total: Math.round(individualTotal),
      bundle_price: Math.round(bundlePrice),
      savings_pct: bestSavings,
      recommended_bundle: bestBundle,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
