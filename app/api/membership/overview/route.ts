import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const period = searchParams.get("period") || "30d"

    const { data: memberships, error } = await supabase
      .from("vista_memberships")
      .select("*, contacts(contact_name, company)")
      .order("membership_start_date", { ascending: false })

    if (error) {
      return NextResponse.json({ memberships: [], error: error.message }, { status: 500 })
    }

    const result = (memberships || []).map((m) => {
      const now = new Date()
      const start = new Date(m.membership_start_date)
      const end = new Date(m.membership_end_date)
      const daysTotal = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const daysUsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...m,
        days_used: Math.round(daysUsed),
        days_remaining: Math.round(daysRemaining),
        pct_used: Math.round((daysUsed / daysTotal) * 100),
      }
    })

    return NextResponse.json({ memberships: result, period })
  } catch (error) {
    return NextResponse.json({ memberships: [], error: String(error) }, { status: 500 })
  }
}