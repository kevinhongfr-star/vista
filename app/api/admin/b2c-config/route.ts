import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { DEFAULT_WEIGHTS } from "@/lib/b2c/scoring"

const CONFIG_KEY = "b2c_integration_config"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", CONFIG_KEY)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const config = data?.value ?? {
      api_key: process.env.B2C_INGEST_API_KEY || "",
      webhook_secret: process.env.B2C_WEBHOOK_SECRET || "",
      scoring_weights: DEFAULT_WEIGHTS,
      alert_thresholds: { high_priority: 80, watch: 60, monitor: 40 },
      alert_delivery: { in_app: true, feishu: false, email: false },
    }

    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: existing } = await supabase
      .from("platform_settings")
      .select("id")
      .eq("key", CONFIG_KEY)
      .single()

    const config = {
      scoring_weights: body.scoring_weights || DEFAULT_WEIGHTS,
      alert_thresholds: body.alert_thresholds || { high_priority: 80, watch: 60, monitor: 40 },
      alert_delivery: body.alert_delivery || { in_app: true, feishu: false, email: false },
      dex_ai_portal_url: body.dex_ai_portal_url || "",
      auto_promotion_enabled: body.auto_promotion_enabled || false,
    }

    let result
    if (existing) {
      result = await supabase
        .from("platform_settings")
        .update({ value: config, updated_at: new Date().toISOString() })
        .eq("key", CONFIG_KEY)
        .select()
        .single()
    } else {
      result = await supabase
        .from("platform_settings")
        .insert({
          key: CONFIG_KEY,
          value: config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, config })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
