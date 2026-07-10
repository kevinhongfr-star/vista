import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { RecentActivity } from "@/lib/types"

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: activities } = await supabase
      .from("campaign_activities")
      .select(`
        id,
        activity_type,
        activity_date,
        sent_date,
        body,
        outcome,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    const recentActivity: RecentActivity[] = (activities || []).map(a => ({
      id: a.id,
      activity_type: (a.activity_type || "Email Sent") as "Email Sent",
      activity_date: a.created_at || a.sent_date || a.activity_date || new Date().toISOString(),
      subject: a.activity_type || "Campaign activity",
      contact_name: null,
      contact_company: null,
      outcome: a.outcome || null,
    }))

    return NextResponse.json({ activities: recentActivity })
  } catch (error) {
    return NextResponse.json(
      { activities: [], error: String(error) },
      { status: 500 }
    )
  }
}
