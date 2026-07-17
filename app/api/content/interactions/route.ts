import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase
      .from("vista_content_contact_interactions")
      .select("*, vista_content_attribution(content_title, content_type)")

    const contentId = searchParams.get("content_id")
    if (contentId) {
      query.eq("content_id", contentId)
    }

    const contactId = searchParams.get("contact_id")
    if (contactId) {
      query.eq("contact_id", contactId)
    }

    const { data, error } = await query.order("interaction_date", { ascending: false })

    if (error) {
      return NextResponse.json({ interactions: [], error: error.message }, { status: 500 })
    }

    const interactions = (data || []).map((item: any) => ({
      ...item,
      content_title: item.vista_content_attribution?.content_title,
      content_type: item.vista_content_attribution?.content_type,
    }))

    return NextResponse.json({ interactions })
  } catch (error) {
    return NextResponse.json({ interactions: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_content_contact_interactions")
      .insert({
        content_id: body.content_id,
        contact_id: body.contact_id,
        interaction_type: body.interaction_type,
        interaction_date: body.interaction_date || new Date().toISOString(),
        resulted_in_conversation: body.resulted_in_conversation || false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, interaction: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
