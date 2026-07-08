import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const signalType = searchParams.get("signal_type")
    const signalStrength = searchParams.get("signal_strength")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("signals")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`company.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (signalType) {
      query = query.eq("signal_type", signalType)
    }
    if (signalStrength) {
      query = query.eq("signal_strength", signalStrength)
    }
    if (status) {
      query = query.eq("status", status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      signals: data || [],
      total: count || 0,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}