import { createServerClient } from "@/lib/supabase/server"
import { CampaignsPage } from "./CampaignsPage"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

export default async function CampaignsPageWrapper() {
  const supabase = createServerClient()

  // Fetch campaign activities
  const { data: activities, count } = await supabase
    .from('campaign_activities')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch drafts
  const { data: drafts } = await supabase
    .from('campaign_activities')
    .select('*')
    .eq('activity_status', 'Drafted')
    .order('created_at', { ascending: false })

  return (
    <CampaignsPage 
      activities={activities || []} 
      drafts={drafts || []}
      totalCount={count || 0}
    />
  )
}