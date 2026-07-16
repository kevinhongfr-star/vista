import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_content_assets").select("*")

    const contentType = searchParams.get("content_type")
    if (contentType) {
      query.eq("content_type", contentType)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ content: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ content: data || [] })
  } catch (error) {
    return NextResponse.json({ content: [], error: String(error) }, { status: 500 })
  }
}