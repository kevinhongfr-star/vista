import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_proposals")
      .select("*, contacts(contact_name, company)")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    return NextResponse.json({ success: true, proposal: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
