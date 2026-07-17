import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const period = searchParams.get("period") || "30d"

    const { data: memberships, error } = await supabase
      .from("vista_council_members")
      .select("*, vista_contacts(contact_name, company)")
      .order("membership_date", { ascending: false })

    if (error) {
      return NextResponse.json({ memberships: [], error: error.message }, { status: 500 })
    }

    const result = (memberships || []).map((m: any) => {
      const now = new Date()
      const start = m.membership_date ? new Date(m.membership_date) : now
      const daysUsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...m,
        contact_name: m.vista_contacts?.contact_name,
        company: m.vista_contacts?.company,
        days_used: Math.round(daysUsed),
        days_remaining: null,
        pct_used: null,
      }
    })

    return NextResponse.json({ memberships: result, period })
  } catch (error) {
    return NextResponse.json({ memberships: [], error: String(error) }, { status: 500 })
  }
}
