import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const FUNNEL_STAGES = [
  "awareness",
  "engagement",
  "validation",
  "investment",
  "transformation",
  "membership",
  "advocacy",
] as const

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { funnel_stage: newStage } = body

    if (!FUNNEL_STAGES.includes(newStage)) {
      return NextResponse.json({
        success: false,
        error: `Invalid funnel stage. Must be one of: ${FUNNEL_STAGES.join(", ")}`,
      }, { status: 400 })
    }

    const { data: contact, error: contactError } = await supabase
      .from("vista_contacts")
      .select("id, funnel_stage, current_tier")
      .eq("id", params.id)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    const oldStage = contact.funnel_stage || "awareness"

    const { data: updated, error: updateError } = await supabase
      .from("vista_contacts")
      .update({ funnel_stage: newStage })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    if (oldStage !== newStage) {
      await supabase.from("vista_tier_progressions").insert({
        contact_id: params.id,
        from_tier: FUNNEL_STAGES.indexOf(oldStage) + 1,
        to_tier: FUNNEL_STAGES.indexOf(newStage) + 1,
        progression_date: new Date().toISOString().split("T")[0],
      })
    }

    return NextResponse.json({ success: true, contact: updated })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}