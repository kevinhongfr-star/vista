import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { EmailTemplate } from "@/lib/types"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_type")

    if (error) {
      // If table doesn't exist, return default templates
      return NextResponse.json({
        templates: [
          {
            id: "default-1",
            template_name: "Executive Brief Invitation",
            template_type: "Executive Brief",
            subject_template: "Exclusive Executive Brief: {program_name}",
            body_template: "Dear {contact_name},\n\nI would like to invite you to our exclusive executive brief on {program_name}.\n\nBest regards,\nKevin Hong",
            variables: ["{contact_name}", "{program_name}"],
          },
          {
            id: "default-2",
            template_name: "Webinar Invitation",
            template_type: "Webinar Invite",
            subject_template: "You're Invited: {webinar_title}",
            body_template: "Dear {contact_name},\n\nJoin us for an exclusive webinar: {webinar_title}\n\nDate: {webinar_date}\n\nBest regards,\nKevin Hong",
            variables: ["{contact_name}", "{webinar_title}", "{webinar_date}"],
          },
          {
            id: "default-3",
            template_name: "Follow-up After Meeting",
            template_type: "Follow-up",
            subject_template: "Following Up: Our Conversation",
            body_template: "Dear {contact_name},\n\nThank you for meeting with me. As discussed...\n\nBest regards,\nKevin Hong",
            variables: ["{contact_name}"],
          },
          {
            id: "default-4",
            template_name: "Re-engagement",
            template_type: "Re-engagement",
            subject_template: "Catching Up",
            body_template: "Dear {contact_name},\n\nIt has been a while since we last connected. I wanted to reach out and...\n\nBest regards,\nKevin Hong",
            variables: ["{contact_name}"],
          },
        ],
      })
    }

    return NextResponse.json({ templates: data || [] })
  } catch (error) {
    return NextResponse.json({ templates: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("email_templates")
      .insert({
        template_name: body.template_name,
        template_type: body.template_type,
        subject_template: body.subject_template,
        body_template: body.body_template,
        variables: body.variables || [],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, template: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}