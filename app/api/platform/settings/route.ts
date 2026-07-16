import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_platform_settings")
      .select("*")
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ settings: {}, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data || {} })
  } catch (error) {
    return NextResponse.json({ settings: {}, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: existing, error: existsError } = await supabase
      .from("vista_platform_settings")
      .select("id")
      .single()

    if (existsError && existsError.code !== "PGRST116") {
      return NextResponse.json({ success: false, error: existsError.message }, { status: 500 })
    }

    if (existing) {
      const { data, error } = await supabase
        .from("vista_platform_settings")
        .update({
          platform_name: body.platform_name,
          current_version: body.current_version,
          status: body.status,
          maintenance_mode: body.maintenance_mode || false,
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, settings: data })
    } else {
      const { data, error } = await supabase
        .from("vista_platform_settings")
        .insert({
          platform_name: body.platform_name || "VISTA Platform",
          current_version: body.current_version || "1.0.0",
          status: body.status || "operational",
          maintenance_mode: body.maintenance_mode || false,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, settings: data })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}