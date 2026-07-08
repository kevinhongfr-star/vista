import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { Activity, Signal, StrategicNote, CampaignContact } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.id

    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from("vista_contacts")
      .select("*")
      .eq("id", contactId)
      .single()

    if (contactError) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    // Get activities for this contact
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("contact_id", contactId)
      .order("activity_date", { ascending: false })
      .limit(50)

    // Get signals affecting this contact (by contact_ids array or company match)
    const { data: signalsByContact } = await supabase
      .from("signals")
      .select("*")
      .contains("contact_ids", [contactId])

    const { data: signalsByCompany } = await supabase
      .from("signals")
      .select("*")
      .ilike("company", contact.company || "")

    // Merge signals
    const allSignals = [...(signalsByContact || []), ...(signalsByCompany || [])]
    const uniqueSignals = allSignals.filter((s, i) => 
      allSignals.findIndex(s2 => s2.id === s.id) === i
    )

    // Get campaigns this contact is in
    const { data: campaignContacts } = await supabase
      .from("campaign_contacts")
      .select(`
        *,
        campaign_activities(campaign_name, campaign_type, activity_status)
      `)
      .eq("contact_id", contactId)
      .order("invitation_date", { ascending: false })

    // Get strategic notes linked to this contact
    const { data: notes } = await supabase
      .from("strategic_notes")
      .select("*")
      .contains("linked_contact_ids", [contactId])
      .order("created_at", { ascending: false })
      .limit(20)

    // Get pipeline history
    const { data: pipelineHistory } = await supabase
      .from("pipeline_history")
      .select("*")
      .eq("contact_id", contactId)
      .order("changed_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      contact,
      activities: activities || [],
      signals: uniqueSignals,
      campaigns: campaignContacts || [],
      notes: notes || [],
      pipeline_history: pipelineHistory || [],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.id
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_contacts")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contactId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, contact: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const contactId = params.id

    // Delete related records first (cascade)
    await supabase.from("activities").delete().eq("contact_id", contactId)
    await supabase.from("campaign_contacts").delete().eq("contact_id", contactId)
    await supabase.from("pipeline_history").delete().eq("contact_id", contactId)

    // Delete contact
    const { error } = await supabase.from("vista_contacts").delete().eq("id", contactId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}