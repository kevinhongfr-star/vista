import { createServerClient } from "@/lib/supabase/server"
import { TemplatesPage } from "./TemplatesPage"
import type { EmailTemplate } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function TemplatesPageWrapper() {
  const supabase = createServerClient()

  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .order('template_type')
    .order('template_name')

  const defaultTemplates: EmailTemplate[] = [
    {
      id: "default-1",
      template_name: "Executive Brief Invitation",
      template_type: "Executive Brief",
      subject_template: "Exclusive Executive Brief: {program_name}",
      body_template: "Dear {contact_name},\n\nI would like to invite you to our exclusive executive brief on {program_name}.\n\nBest regards,\nKevin Hong",
      variables: ["{contact_name}", "{program_name}"],
      created_at: null,
      updated_at: null,
    },
    {
      id: "default-2",
      template_name: "Webinar Invitation",
      template_type: "Webinar Invite",
      subject_template: "You're Invited: {webinar_title}",
      body_template: "Dear {contact_name},\n\nJoin us for an exclusive webinar: {webinar_title}\n\nDate: {webinar_date}\n\nBest regards,\nKevin Hong",
      variables: ["{contact_name}", "{webinar_title}", "{webinar_date}"],
      created_at: null,
      updated_at: null,
    },
    {
      id: "default-3",
      template_name: "Follow-up After Meeting",
      template_type: "Follow-up",
      subject_template: "Following Up: Our Conversation",
      body_template: "Dear {contact_name},\n\nThank you for meeting with me. As discussed...\n\nBest regards,\nKevin Hong",
      variables: ["{contact_name}"],
      created_at: null,
      updated_at: null,
    },
    {
      id: "default-4",
      template_name: "Re-engagement",
      template_type: "Re-engagement",
      subject_template: "Catching Up",
      body_template: "Dear {contact_name},\n\nIt has been a while since we last connected. I wanted to reach out and...\n\nBest regards,\nKevin Hong",
      variables: ["{contact_name}"],
      created_at: null,
      updated_at: null,
    },
  ]

  const allTemplates = (templates && templates.length > 0)
    ? (templates as EmailTemplate[])
    : defaultTemplates

  return (
    <TemplatesPage templates={allTemplates} />
  )
}