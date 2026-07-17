import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const period = searchParams.get("period") || "30d"

    const { data: memberships, error: mError } = await supabase
      .from("vista_council_members")
      .select("status, member_type")

    if (mError) {
      return NextResponse.json({ metrics: {}, error: mError.message }, { status: 500 })
    }

    const { data: engagements, error: eError } = await supabase
      .from("vista_contact_service_engagements")
      .select("status, tier_at_engagement, satisfaction_score")

    if (eError) {
      return NextResponse.json({ metrics: {}, error: eError.message }, { status: 500 })
    }

    const activeMemberships = memberships?.filter((m: { status: string }) => m.status === "active").length || 0
    const tierDistribution: Record<string, number> = {}

    for (const m of memberships || []) {
      const tier = m.member_type || "unknown"
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1
    }

    const completedEngagements = engagements?.filter((e: { status: string }) => e.status === "completed").length || 0
    const satisfactionSum = engagements?.filter((e: { status: string }) => e.status === "completed")
      .reduce((sum: number, e: { satisfaction_score: number }) => sum + (e.satisfaction_score || 0), 0) || 0
    const avgSatisfaction = completedEngagements > 0 ? Math.round(satisfactionSum / completedEngagements) : 0

    const metrics = {
      total_memberships: memberships?.length || 0,
      active_memberships: activeMemberships,
      inactive_memberships: memberships?.filter((m: { status: string }) => m.status !== "active").length || 0,
      tier_distribution: tierDistribution,
      total_engagements: engagements?.length || 0,
      completed_engagements: completedEngagements,
      avg_satisfaction_score: avgSatisfaction,
      engagement_completion_rate: engagements?.length > 0
        ? Math.round((completedEngagements / engagements.length) * 100)
        : 0,
    }

    return NextResponse.json({ metrics, period })
  } catch (error) {
    return NextResponse.json({ metrics: {}, error: String(error) }, { status: 500 })
  }
}
