import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const note_type = body.note_type || body.category || null
    const description = body.description || null
    const contact_id = body.contact_id || null
    const author = body.author || null
    const cluster_id = body.cluster_id || null
    const category = body.category || null
    const status = body.status || "Active"

    const { data, error } = await supabase
      .from("strategic_notes")
      .insert({
        note_type,
        description,
        contact_id,
        author,
        cluster_id,
        category,
        status,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, note: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const contact_id = searchParams.get("contact_id")
    const cluster_id = searchParams.get("cluster_id")

    let query = supabase
      .from("strategic_notes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(100)

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (contact_id) {
      query = query.eq("contact_id", contact_id)
    }

    if (cluster_id) {
      query = query.eq("cluster_id", cluster_id)
    }

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, notes: data || [], totalCount: count || 0 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
