import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_cross_sell_rules").select("*").eq("is_active", true)

    const sourceServiceName = searchParams.get("source_service_name")
    if (sourceServiceName) {
      query.eq("source_service_name", sourceServiceName)
    }

    const { data, error } = await query.order("priority", { ascending: false })

    if (error) {
      return NextResponse.json({ rules: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rules: data || [] })
  } catch (error) {
    return NextResponse.json({ rules: [], error: String(error) }, { status: 500 })
  }
}