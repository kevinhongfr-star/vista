import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { PipelineStage, UpdatePipelineStageRequest, StuckContact } from "@/lib/types"

export async function PUT(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.contactId
    const body: UpdatePipelineStageRequest = await request.json()

    // Get current stage
    const { data: contact } = await supabase
      .from("vista_contacts")
      .select("pipeline_stage, name, company")
      .eq("id", contactId)
      .single()

    const oldStage = contact?.pipeline_stage || "Prospect"
    const newStage = body.new_stage

    // Update contact pipeline stage
    const { error: updateError } = await supabase
      .from("vista_contacts")
      .update({
        pipeline_stage: newStage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contactId)

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Log to pipeline history
    await supabase.from("pipeline_history").insert({
      contact_id: contactId,
      from_stage: oldStage,
      to_stage: newStage,
      changed_by: "Kevin",
      reason: body.reason || "Manual update",
    })

    return NextResponse.json({
      success: true,
      contact: {
        id: contactId,
        name: contact?.name,
        company: contact?.company,
        pipeline_stage: newStage,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()

    // Find stuck contacts (in Contacted or Engaged for 30+ days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: stuckContacts, error } = await supabase
      .from("vista_contacts")
      .select("id, name, company, pipeline_stage, last_contact_date, vista_composite")
      .in("pipeline_stage", ["Contacted", "Engaged"])
      .lt("last_contact_date", thirtyDaysAgo)
      .order("vista_composite", { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const stuck: StuckContact[] = (stuckContacts || []).map(c => ({
      contact_id: c.id,
      name: c.name,
      company: c.company,
      pipeline_stage: c.pipeline_stage as PipelineStage,
      days_in_stage: c.last_contact_date
        ? Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / (24 * 60 * 60 * 1000))
        : 999,
      last_contact_date: c.last_contact_date,
    }))

    return NextResponse.json({
      stuck_contacts: stuck,
      total: stuck.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}