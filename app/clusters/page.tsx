import { createServerClient } from "@/lib/supabase/server"
import { ClustersPage } from "./ClustersPage"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

export default async function ClustersPageWrapper() {
  const supabase = createServerClient()

  // Fetch density clusters
  const { data: clusters, count } = await supabase
    .from('density_clusters')
    .select('*', { count: 'exact' })
    .order('density_score', { ascending: false })

  return (
    <ClustersPage clusters={clusters || []} totalCount={count || 0} />
  )
}