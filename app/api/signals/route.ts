import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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
