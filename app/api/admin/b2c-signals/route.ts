import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { DEFAULT_WEIGHTS } from "@/lib/b2c/scoring"

const CONFIG_KEY = "b2c_scoring_weights"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", CONFIG_KEY)
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const weights = data?.value ?? DEFAULT_WEIGHTS

    return NextResponse.json({ success: true, weights })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const weights = body.weights ?? DEFAULT_WEIGHTS

    const { data: existing } = await supabase
      .from("platform_settings")
      .select("id")
      .eq("key", CONFIG_KEY)
      .single()

    let result
    if (existing) {
      result = await supabase
        .from("platform_settings")
        .update({ value: weights, updated_at: new Date().toISOString() })
        .eq("key", CONFIG_KEY)
        .select()
        .single()
    } else {
      result = await supabase
        .from("platform_settings")
        .insert({
          key: CONFIG_KEY,
          value: weights,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, weights })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
