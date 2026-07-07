import { createServerClient } from "@/lib/supabase/server"
import { Dashboard } from "./Dashboard"
import type { VistaContact, PipelineSummaryView, Top7View } from "@/lib/types"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Fetch KPI data
  const [hotContacts, drafts, staleContactsResult, recentSignals] = await Promise.all([
    supabase
      .from('vista_contacts')
      .select('id', { count: 'exact', head: true })
      .in('engagement_tier', ['Hot', 'Committed']),
    supabase
      .from('campaign_activities')
      .select('id', { count: 'exact', head: true })
      .eq('activity_status', 'Drafted'),
    supabase
      .from('vista_contacts')
      .select('*')
      .eq('decay_flag', true)
      .order('priority_score', { ascending: false })
      .limit(20),
    supabase
      .from('signals')
      .select('id', { count: 'exact', head: true })
      .gte('detected_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ])

  // Fetch pipeline summary
  const { data: pipelineData } = await supabase
    .from('v_pipeline_summary')
    .select('*')

  // Fetch top 7
  const { data: top7Data } = await supabase
    .from('v_top_7')
    .select('*')

  // Fetch threshold crossings (recent score changes)
  const { data: thresholdCrossings } = await supabase
    .from('vista_contacts')
    .select('*')
    .not('score_delta', 'is', null)
    .order('last_score_update', { ascending: false })
    .limit(10)

  // Fetch recent score updates
  const { data: recentScores } = await supabase
    .from('vista_contacts')
    .select('*')
    .not('score_delta', 'is', null)
    .order('last_score_update', { ascending: false })
    .limit(10)

  const kpis = {
    totalHot: hotContacts.count || 0,
    draftsPending: drafts.count || 0,
    staleContacts: staleContactsResult.count || 0,
    newSignals: recentSignals.count || 0,
  }

  return (
    <Dashboard
      kpis={kpis}
      pipelineData={(pipelineData || []) as PipelineSummaryView[]}
      top7Data={(top7Data || []) as Top7View[]}
      staleContacts={(staleContactsResult.data || []) as VistaContact[]}
      thresholdCrossings={(thresholdCrossings || []) as VistaContact[]}
      recentScores={(recentScores || []) as VistaContact[]}
    />
  )
}