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

    const { data, error } = await query.order("scheduled_date", { ascending: false })

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
        title: body.workshop_name || body.title,
        scheduled_date: body.workshop_date || body.scheduled_date,
        duration_minutes: body.duration_minutes || 180,
        max_capacity: body.max_attendees || body.max_capacity || 20,
        status: body.status || "scheduled",
        workshop_type: body.workshop_type || "general",
        price_cny: body.price_cny || 0,
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
