import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data, error } = await supabase
      .from("vista_b2c_events")
      .select("*")
      .eq("b2c_lead_id", id)
      .order("event_timestamp", { ascending: false })

    if (error) {
      return NextResponse.json(
        { events: [], error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ events: data || [] })
  } catch (error) {
    return NextResponse.json(
      { events: [], error: String(error) },
      { status: 500 }
    )
  }
}
