import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ClusterDetail } from "./ClusterDetail"
import type { DensityCluster, VistaContact, StrategicNote } from "@/lib/types"

export const dynamic = 'force-dynamic'

interface ClusterPageProps {
  params: {
    id: string
  }
}

export default async function ClusterPage({ params }: ClusterPageProps) {
  const supabase = createServerClient()

  const { data: cluster, error: clusterError } = await supabase
    .from('density_clusters')
    .select('*')
    .eq('cluster_id', params.id)
    .single()

  if (clusterError || !cluster) {
    notFound()
  }

  const { data: contacts } = await supabase
    .from('vista_contacts')
    .select('*')
    .eq('density_cluster_id', params.id)
    .order('priority_score', { ascending: false })

  const { data: notes } = await supabase
    .from('strategic_notes')
    .select('*')
    .eq('cluster_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const contactsTyped = (contacts || []) as VistaContact[]
  const notesTyped = (notes || []) as StrategicNote[]

  const avgScore = contactsTyped.length > 0
    ? contactsTyped.reduce((sum, c) => sum + (c.priority_score || 0), 0) / contactsTyped.length
    : 0

  const avgPipelineReadiness = contactsTyped.length > 0
    ? contactsTyped.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / contactsTyped.length
    : 0

  const activeSignals = contactsTyped.reduce((count, c) => {
    return count + ((c.signal_score || 0) > 0 ? 1 : 0)
  }, 0)

  return (
    <ClusterDetail
      cluster={cluster as DensityCluster}
      contacts={contactsTyped}
      notes={notesTyped}
      avgScore={avgScore}
      avgPipelineReadiness={avgPipelineReadiness}
      activeSignals={activeSignals}
    />
  )
}
