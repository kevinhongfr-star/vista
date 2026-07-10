import { createServerClient } from "@/lib/supabase/server"
import { PipelinePage } from "./PipelinePage"

export const dynamic = 'force-dynamic'

export default async function PipelinePageWrapper() {
  const supabase = createServerClient()

  const { data: contacts, error } = await supabase
    .from('vista_contacts')
    .select('id, name, company, pipeline_stage, vista_composite, last_contact_date, role, country, location')

  // Assign default stage "Prospect" to contacts without a pipeline_stage
  const normalizedContacts = (contacts || []).map(c => ({
    ...c,
    pipeline_stage: c.pipeline_stage || 'Prospect',
  }))

  return (
    <PipelinePage contacts={normalizedContacts} />
  )
}
