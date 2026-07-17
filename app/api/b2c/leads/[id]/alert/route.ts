import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const body = await request.json()
    const { stage } = body

    if (!stage) {
      return NextResponse.json(
        { success: false, error: "stage is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("vista_b2c_leads")
      .update({
        pipeline_stage: stage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, lead: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
