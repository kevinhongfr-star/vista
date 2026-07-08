import { createServerClient } from "@/lib/supabase/server"
import { ConversionsPage } from "./ConversionsPage"

export const dynamic = 'force-dynamic'

export default async function ConversionsPageWrapper() {
  const supabase = createServerClient()

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: assignments } = await supabase
    .from('program_assignments')
    .select('*')
    .order('assigned_date', { ascending: false })

  const { data: campaignActivities } = await supabase
    .from('campaign_activities')
    .select('*')
    .order('activity_date', { ascending: false })
    .limit(500)

  const { data: clusters } = await supabase
    .from('density_clusters')
    .select('cluster_id, industry, geography')
    .order('industry', { ascending: true })

  return (
    <ConversionsPage 
      programs={programs || []}
      assignments={assignments || []}
      campaignActivities={campaignActivities || []}
      clusters={clusters || []}
    />
  )
}
