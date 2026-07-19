import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import type { SendEmailRequest } from "@/lib/types"

// Initialize Resend — requires RESEND_API_KEY env var
const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Get contacts with email addresses
    const { data: contacts, error: fetchError } = await supabase
      .from("vista_contacts")
      .select("id, name, company, email, pipeline_stage")
      .in("id", body.contact_ids)

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch contacts: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!contacts?.length) {
      return NextResponse.json({ success: false, error: "No contacts found" }, { status: 400 })
    }

    // Filter contacts with valid emails
    const contactsWithEmail = contacts.filter((c) => c.email && c.email.includes("@"))
    if (!contactsWithEmail.length) {
      return NextResponse.json(
        { success: false, error: "No contacts with valid email addresses" },
        { status: 400 }
      )
    }

    // Send emails via Resend
    const results = []
    let sentCount = 0
    let failedCount = 0

    for (const contact of contactsWithEmail) {
      // Replace template variables
      const personalizedBody = body.body
        .replace(/{contact_name}/gi, contact.name || "there")
        .replace(/{company_name}/gi, contact.company || "your company")

      const personalizedSubject = body.subject
        .replace(/{contact_name}/gi, contact.name || "there")
        .replace(/{company_name}/gi, contact.company || "your company")

      try {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || "VISTA <noreply@vista-azure-delta-theta.vercel.app>",
          to: [contact.email],
          subject: personalizedSubject,
          html: personalizedBody.replace(/\n/g, "<br>"),
        })

        if (emailError) {
          failedCount++
          results.push({
            contact_id: contact.id,
            contact_name: contact.name,
            status: "failed",
            error: emailError.message,
          })
        } else {
          sentCount++
          results.push({
            contact_id: contact.id,
            contact_name: contact.name,
            status: "sent",
            email_id: emailData?.id,
          })

          // Update contact: last email sent date
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
      } catch (err) {
        failedCount++
        results.push({
          contact_id: contact.id,
          contact_name: contact.name,
          status: "failed",
          error: String(err),
        })
      }
    }

    // Log activity for each successfully sent email
    const activityInserts = results
      .filter((r) => r.status === "sent")
      .map((r) => ({
        contact_id: r.contact_id,
        campaign_id: body.campaign_id || null,
        activity_type: "Email Sent",
        activity_date: new Date().toISOString(),
        subject: body.subject,
        content: body.body,
        created_by: "Kevin",
      }))

    if (activityInserts.length > 0) {
      await supabase.from("activities").insert(activityInserts)
    }

    return NextResponse.json({
      success: true,
      emails_sent: sentCount,
      emails_failed: failedCount,
      results,
    })
  } catch (error) {
    console.error("[email/send] Error:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
