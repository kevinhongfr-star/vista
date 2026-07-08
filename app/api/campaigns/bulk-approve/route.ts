import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

interface BulkApproveBody {
  ids: string[]
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: BulkApproveBody = await request.json()

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "ids array is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("campaign_activities")
      .update({ activity_status: "Approved" })
      .in("id", body.ids)
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
      activities: data,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
