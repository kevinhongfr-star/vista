import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const campaignId = params.id

    // Get campaign
    const { data: campaign } = await supabase
      .from("campaign_activities")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.activity_status !== "Approved") {
      return NextResponse.json({ 
        success: false, 
        error: "Campaign must be approved before sending" 
      }, { status: 400 })
    }

    // Get contacts with status 'Invited'
    const { data: contacts } = await supabase
      .from("campaign_contacts")
      .select(`
        id,
        contact_id,
        vista_contacts!inner(id, name, company, email, pipeline_stage)
      `)
      .eq("campaign_id", campaignId)
      .eq("status", "Invited")

    if (!contacts?.length) {
      return NextResponse.json({ 
        success: false, 
        error: "No contacts with 'Invited' status found" 
      }, { status: 400 })
    }

    const emailsSent = contacts.length

    // For each contact: log activity and update status
    for (const cc of contacts) {
      // Log email activity
      await supabase.from("activities").insert({
        contact_id: cc.contact_id,
        campaign_id: campaignId,
        activity_type: "Email Sent",
        activity_date: new Date().toISOString(),
        subject: campaign.message_subject || "Campaign email",
        content: campaign.message_body || campaign.body,
        created_by: "Kevin",
      })

      // Update campaign_contact status
      await supabase
        .from("campaign_contacts")
        .update({
          status: "Email Sent",
          sent_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", cc.id)

      // Update vista_contact
      type ContactRow = { id: string; name?: string; company?: string; email?: string; pipeline_stage?: string }
      const contactData = (cc.vista_contacts as ContactRow[] | ContactRow)
      const contact = Array.isArray(contactData) ? contactData[0] : contactData
      if (contact && contact.id) {
        const currentStage = contact.pipeline_stage || "Prospect"
        await supabase
          .from("vista_contacts")
          .update({
            last_email_sent_date: new Date().toISOString(),
            last_contact_date: new Date().toISOString(),
            pipeline_stage: currentStage === "Prospect" ? "Contacted" : currentStage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contact.id)

        if (currentStage === "Prospect") {
          await supabase.from("pipeline_history").insert({
            contact_id: contact.id,
            from_stage: "Prospect",
            to_stage: "Contacted",
            changed_by: "Kevin",
            reason: "Campaign email sent",
          })
        }
      }
    }

    // Update campaign status and metrics
    await supabase
      .from("campaign_activities")
      .update({
        activity_status: "Sent",
        sent_date: new Date().toISOString(),
        emails_sent_count: emailsSent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)

    return NextResponse.json({
      success: true,
      emails_sent: emailsSent,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}