import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { RecentActivity } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get recent activities (last 10) joined with contacts
    // Note: activities table may not exist yet, so we'll use campaign_activities as fallback
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

    // Transform to RecentActivity format
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