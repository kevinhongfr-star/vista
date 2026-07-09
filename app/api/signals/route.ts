import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const contact_id = searchParams.get("contact_id")
    const company = searchParams.get("company")

    let query = supabase
      .from("signals")
      .select("*", { count: "exact" })
      .order("detected_date", { ascending: false })
      .limit(100)

    if (contact_id) {
      query = query.or(`contact_id.eq.${contact_id},contact_ids.cs.{${contact_id}}`)
    }

    if (company) {
      query = query.ilike("company", `%${company}%`)
    }

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, signals: data || [], totalCount: count || 0 })
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

    const { data, error } = await supabase
      .from("signals")
      .insert({
        company: body.company || null,
        signal_type: body.signal_type || null,
        signal_strength: body.signal_strength || null,
        source: body.source || "manual",
        detected_date: body.detected_date || new Date().toISOString().split("T")[0],
        description: body.description || null,
        source_url: body.source_url || null,
        contact_id: body.contact_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, signal: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
