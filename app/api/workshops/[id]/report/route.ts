import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data: attendees, error: attendeeError } = await supabase
      .from("vista_workshop_attendees")
      .select("*, contacts(current_tier)")
      .eq("workshop_id", params.id)

    if (attendeeError) {
      return NextResponse.json({ report: null, error: attendeeError.message }, { status: 500 })
    }

    const totalRegistered = attendees?.length || 0
    const attended = attendees?.filter((a: { attendance_status: string }) => a.attendance_status === "attended").length || 0
    const noShow = attendees?.filter((a: { attendance_status: string }) => a.attendance_status === "no_show").length || 0

    const tierDistribution: Record<string, number> = {}
    for (const a of attendees || []) {
      const tier = a.contacts?.current_tier || "unknown"
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1
    }

    const report = {
      workshop_id: params.id,
      total_registered: totalRegistered,
      attended: attended,
      no_show: noShow,
      attendance_rate: totalRegistered > 0 ? Math.round((attended / totalRegistered) * 100) : 0,
      tier_distribution: tierDistribution,
    }

    return NextResponse.json({ report })
  } catch (error) {
    return NextResponse.json({ report: null, error: String(error) }, { status: 500 })
  }
}