import { createServerClient } from "@/lib/supabase/server"
import { AutomationDashboard } from "./AutomationDashboard"
import type { AutomationDashboardData, PipelineRunLog, AutomationConfig } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function AutomationPageWrapper() {
  const supabase = createServerClient()

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { count: signals24h } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .gte('detected_date', twentyFourHoursAgo.toISOString())

  const { count: signals7d } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .gte('detected_date', sevenDaysAgo.toISOString())

  const { count: signals30d } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .gte('detected_date', thirtyDaysAgo.toISOString())

  const { count: contactsScored } = await supabase
    .from('vista_contacts')
    .select('*', { count: 'exact', head: true })
    .not('stain_score', 'is', null)

  const { count: clustersUpdated } = await supabase
    .from('density_clusters')
    .select('*', { count: 'exact', head: true })

  const config: AutomationConfig = {
    frequency: 'daily',
    last_signal_detection: null,
    last_scoring: null,
    last_clustering: null,
    next_scheduled_run: null,
  }

  const recentRuns: PipelineRunLog[] = [
    {
      id: '1',
      pipeline: 'PROBE',
      status: 'success',
      started_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      duration_seconds: 1800,
      records_processed: 234,
      error_message: null,
    },
    {
      id: '2',
      pipeline: 'LENS',
      status: 'success',
      started_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      duration_seconds: 3600,
      records_processed: 1500,
      error_message: null,
    },
    {
      id: '3',
      pipeline: 'CARL',
      status: 'success',
      started_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
      duration_seconds: 3600,
      records_processed: 42,
      error_message: null,
    },
  ]

  const dashboardData: AutomationDashboardData = {
    config,
    signals_24h: signals24h || 0,
    signals_7d: signals7d || 0,
    signals_30d: signals30d || 0,
    contacts_scored: contactsScored || 0,
    clusters_updated: clustersUpdated || 0,
    recent_runs: recentRuns,
  }

  return <AutomationDashboard initialData={dashboardData} />
}
