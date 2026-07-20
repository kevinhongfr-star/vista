import { createServerClient } from "@/lib/supabase/server"
import { B2CPipelinePage } from "./B2CPipelinePage"

export const dynamic = 'force-dynamic'

export default async function B2CPipelinePageWrapper() {
  const supabase = createServerClient()

  const { data: leads, error } = await supabase
    .from('vista_b2c_leads')
    .select('*')
    .order('b2b_potential_score', { ascending: false })

  return (
    <B2CPipelinePage leads={leads || []} />
  )
}
