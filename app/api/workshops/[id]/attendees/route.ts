import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_workshop_attendees")
      .select("*, contacts(contact_name, company)")
      .eq("workshop_id", params.id)

    if (error) {
      return NextResponse.json({ attendees: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ attendees: data || [] })
  } catch (error) {
    return NextResponse.json({ attendees: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { contact_id } = body

    const { data: workshop, error: workshopError } = await supabase
      .from("vista_workshops")
      .select("max_attendees, tier_access")
      .eq("id", params.id)
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json({ success: false, error: "Workshop not found" }, { status: 404 })
    }

    const { data: existing, error: countError } = await supabase
      .from("vista_workshop_attendees")
      .select("id")
      .eq("workshop_id", params.id)

    if (!countError && existing && existing.length >= (workshop.max_attendees || 20)) {
      return NextResponse.json({ success: false, error: "Workshop is full" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("vista_workshop_attendees")
      .insert({
        workshop_id: params.id,
        contact_id: contact_id,
        registration_date: new Date().toISOString().split("T")[0],
        attendance_status: "registered",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, attendee: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}