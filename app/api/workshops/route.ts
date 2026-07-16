import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_workshops").select("*")

    const status = searchParams.get("status")
    if (status) {
      query.eq("status", status)
    }

    const { data, error } = await query.order("workshop_date", { ascending: false })

    if (error) {
      return NextResponse.json({ workshops: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ workshops: data || [] })
  } catch (error) {
    return NextResponse.json({ workshops: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_workshops")
      .insert({
        workshop_name: body.workshop_name,
        workshop_date: body.workshop_date,
        workshop_time: body.workshop_time,
        location: body.location,
        max_attendees: body.max_attendees || 20,
        description: body.description || "",
        tier_access: body.tier_access || [],
        status: body.status || "scheduled",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, workshop: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}