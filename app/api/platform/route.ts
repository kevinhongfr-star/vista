import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: settings, error: sError } = await supabase
      .from("platform_settings")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (sError && sError.code !== "PGRST116") {
      return NextResponse.json({ platform: {}, error: sError.message }, { status: 500 })
    }

    const { data: catalog, error: cError } = await supabase
      .from("vista_service_catalog")
      .select("tier, tier_name")
      .order("tier")

    if (cError) {
      return NextResponse.json({ platform: {}, error: cError.message }, { status: 500 })
    }

    const tiers = catalog?.reduce((acc: Record<number, string>, s: { tier: number; tier_name: string }) => {
      if (!acc[s.tier]) {
        acc[s.tier] = s.tier_name
      }
      return acc
    }, {}) || {}

    const platform = {
      platform_name: settings?.platform_name || "VISTA Platform",
      current_version: settings?.current_version || "1.0.0",
      status: settings?.status || "operational",
      total_tiers: Object.keys(tiers).length,
      tier_names: tiers,
    }

    return NextResponse.json({ platform })
  } catch (error) {
    return NextResponse.json({ platform: {}, error: String(error) }, { status: 500 })
  }
}
