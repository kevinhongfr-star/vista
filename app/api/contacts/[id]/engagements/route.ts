import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_contact_service_engagements")
      .select("*, vista_service_catalog(*)")
      .eq("contact_id", params.id)
      .order("engagement_date", { ascending: false })

    if (error) {
      return NextResponse.json({ engagements: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ engagements: data || [] })
  } catch (error) {
    return NextResponse.json({ engagements: [], error: String(error) }, { status: 500 })
  }
}