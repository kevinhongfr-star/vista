import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { SendEmailRequest } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: SendEmailRequest = await request.json()

    // Validate required fields
    if (!body.contact_ids?.length || !body.subject || !body.body) {
      return NextResponse.json(
        { success: false, error: "contact_ids, subject, and body are required" },
        { status: 400 }
      )
    }

    // Get contacts
    const { data: contacts } = await supabase
      .from("vista_contacts")
      .select("id, name, company, email, pipeline_stage")
      .in("id", body.contact_ids)

    if (!contacts?.length) {
      return NextResponse.json({ success: false, error: "No contacts found" }, { status: 400 })
    }

    // Log activities for each contact
    const activities = []
    for (const contact of contacts) {
      // Replace template variables
      const personalizedBody = body.body
        .replace(/{contact_name}/gi, contact.name || "there")
        .replace(/{company_name}/gi, contact.company || "your company")

      const personalizedSubject = body.subject
        .replace(/{contact_name}/gi, contact.name || "there")
        .replace(/{company_name}/gi, contact.company || "your company")

      // Insert activity
      const { data: activity } = await supabase
        .from("activities")
        .insert({
          contact_id: contact.id,
          campaign_id: body.campaign_id,
          activity_type: "Email Sent",
          activity_date: new Date().toISOString(),
          subject: personalizedSubject,
          content: personalizedBody,
          created_by: "Kevin",
        })
        .select()
        .single()

      activities.push(activity)

      // Update contact
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

      // Log pipeline history if stage changed
      if (currentStage === "Prospect") {
        await supabase.from("pipeline_history").insert({
          contact_id: contact.id,
          from_stage: "Prospect",
          to_stage: "Contacted",
          changed_by: "Kevin",
          reason: "Email sent",
        })
      }
    }

    return NextResponse.json({
      success: true,
      emails_logged: activities.length,
      activities,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}