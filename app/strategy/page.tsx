import { createServerClient } from "@/lib/supabase/server"
import { StrategyPage } from "./StrategyPage"
import type { StrategicNote, VistaContact, DensityCluster } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function StrategyPageWrapper() {
  const supabase = createServerClient()

  const { data: notes, count } = await supabase
    .from('strategic_notes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: contacts } = await supabase
    .from('vista_contacts')
    .select('id, name, company')
    .order('name', { ascending: true })
    .limit(100)

  const { data: clusters } = await supabase
    .from('density_clusters')
    .select('cluster_id, industry, geography')
    .order('industry', { ascending: true })

  return (
    <StrategyPage 
      notes={(notes || []) as StrategicNote[]} 
      totalCount={count || 0}
      contacts={(contacts || []) as Pick<VistaContact, 'id' | 'name' | 'company'>[]}
      clusters={(clusters || []) as Pick<DensityCluster, 'cluster_id' | 'industry' | 'geography'>[]}
    />
  )
}
