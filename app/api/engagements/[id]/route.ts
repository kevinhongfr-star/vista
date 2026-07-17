import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_contact_service_engagements")
      .update({
        status: body.status,
        satisfaction_score: body.satisfaction_score,
        notes: body.notes,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, engagement: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}