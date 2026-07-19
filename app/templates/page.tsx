import { createServerClient } from "@/lib/supabase/server"
import { TemplatesPage } from "./TemplatesPage"
import type { EmailTemplate } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function TemplatesPageWrapper() {
  const supabase = createServerClient()

  // Use the correct outreach templates table (not the legacy email_templates)
  const { data: templates, error } = await supabase
    .from('vista_outreach_templates')
    .select('*')
    .eq('is_active', true)
    .order('bucket')
    .order('touch_number')

  // Map vista_outreach_templates schema to EmailTemplate interface
  const mappedTemplates: EmailTemplate[] = (templates || []).map((t: any) => ({
    id: t.id,
    template_name: t.name,
    template_type: t.bucket || 'General',
    subject_template: t.subject_line || '',
    body_template: t.body_template || '',
    variables: t.variables || [],
    created_at: t.created_at,
    updated_at: t.updated_at,
  }))

  return (
    <TemplatesPage templates={mappedTemplates} />
  )
}
