import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

interface UpdateStatusBody {
  activity_status: string
  sent_date?: string
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    const body: UpdateStatusBody = await request.json()

    if (!body.activity_status) {
      return NextResponse.json(
        { success: false, error: "activity_status is required" },
        { status: 400 }
      )
    }

    const updateData: { activity_status: string; sent_date?: string } = {
      activity_status: body.activity_status,
    }

    if (body.activity_status === "Sent" || body.sent_date) {
      updateData.sent_date = body.sent_date || new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("campaign_activities")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, activity: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
