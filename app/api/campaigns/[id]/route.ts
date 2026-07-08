import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const campaignId = params.id

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaign_activities")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (campaignError) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 })
    }

    // Get contacts in this campaign
    const { data: contacts, error: contactsError } = await supabase
      .from("campaign_contacts")
      .select(`
        *,
        vista_contacts(id, name, company, vista_composite)
      `)
      .eq("campaign_id", campaignId)
      .order("status")

    if (contactsError) {
      return NextResponse.json({ success: false, error: contactsError.message }, { status: 500 })
    }

    // Compute metrics
    const metrics = {
      invited: contacts?.filter(c => c.status === "Invited").length || 0,
      sent: contacts?.filter(c => c.status === "Email Sent").length || 0,
      opened: contacts?.filter(c => c.status === "Email Opened").length || 0,
      replied: contacts?.filter(c => c.status === "Email Replied").length || 0,
      meetings: contacts?.filter(c => c.status === "Meeting Booked").length || 0,
      converted: contacts?.filter(c => c.status === "Converted").length || 0,
      conversion_rate: 0,
    }

    // Calculate conversion rate
    const totalSent = metrics.sent || contacts?.length || 0
    metrics.conversion_rate = totalSent > 0 
      ? Math.round((metrics.converted / totalSent) * 100) 
      : 0

    return NextResponse.json({
      campaign,
      contacts: contacts || [],
      metrics,
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
    const campaignId = params.id
    const body = await request.json()

    const { data, error } = await supabase
      .from("campaign_activities")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
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
    const campaignId = params.id

    // Delete campaign contacts first
    await supabase.from("campaign_contacts").delete().eq("campaign_id", campaignId)

    // Delete campaign
    const { error } = await supabase
      .from("campaign_activities")
      .delete()
      .eq("id", campaignId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}