import { createServerClient } from "@/lib/supabase/server"
import { Dashboard } from "./Dashboard"
import type { VistaContact, PipelineSummaryView, Top7View } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return (
        <div className="p-8 bg-red-50 rounded-xl border border-red-200">
          <h2 className="text-lg font-bold text-red-800 mb-2">Configuration Error</h2>
          <p className="text-sm text-red-600">
            SUPABASE_URL: {supabaseUrl ? '✓ set' : '✗ MISSING'}
          </p>
          <p className="text-sm text-red-600">
            SUPABASE_SERVICE_ROLE_KEY: {supabaseKey ? '✓ set' : '✗ MISSING'}
          </p>
        </div>
      )
    }

    const supabase = createServerClient()

    // Fetch KPI data with individual error handling
    let hotContacts, drafts, staleContactsResult, recentSignals
    let pipelineData: PipelineSummaryView[] = []
    let top7Data: Top7View[] = []
    let thresholdCrossings: VistaContact[] = []
    let recentScores: VistaContact[] = []

    try {
      const [hotRes, draftsRes, staleRes, signalsRes] = await Promise.all([
        supabase.from('vista_contacts').select('id', { count: 'exact', head: true })
          .in('engagement_tier', ['Hot', 'Committed']),
        supabase.from('campaign_activities').select('id', { count: 'exact', head: true })
          .eq('activity_status', 'Drafted'),
        supabase.from('vista_contacts').select('*', { count: 'exact', head: false })
          .eq('decay_flag', true).order('priority_score', { ascending: false }).limit(20),
        supabase.from('signals').select('id', { count: 'exact', head: true })
          .gte('detected_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      ])
      
      if (hotRes.error) console.error('hotContacts error:', hotRes.error.message)
      if (draftsRes.error) console.error('drafts error:', draftsRes.error.message)
      if (staleRes.error) console.error('stale error:', staleRes.error.message)
      if (signalsRes.error) console.error('signals error:', signalsRes.error.message)

      hotContacts = hotRes
      drafts = draftsRes
      staleContactsResult = staleRes
      recentSignals = signalsRes
    } catch (e: any) {
      console.error('KPI fetch error:', e.message)
      hotContacts = { count: 0, data: null }
      drafts = { count: 0, data: null }
      staleContactsResult = { count: 0, data: [] }
      recentSignals = { count: 0, data: null }
    }

    try {
      const { data: pData, error: pError } = await supabase.from('v_pipeline_summary').select('*')
      if (pError) console.error('pipeline error:', pError.message)
      else pipelineData = (pData || []) as PipelineSummaryView[]
    } catch (e: any) { console.error('pipeline fetch error:', e.message) }

    try {
      const { data: tData, error: tError } = await supabase.from('v_top_7').select('*')
      if (tError) console.error('top7 error:', tError.message)
      else top7Data = (tData || []) as Top7View[]
    } catch (e: any) { console.error('top7 fetch error:', e.message) }

    try {
      const { data: tcData, error: tcError } = await supabase
        .from('vista_contacts').select('*')
        .not('score_delta', 'is', null)
        .order('last_score_update', { ascending: false }).limit(10)
      if (tcError) console.error('threshold error:', tcError.message)
      else thresholdCrossings = (tcData || []) as VistaContact[]
    } catch (e: any) { console.error('threshold fetch error:', e.message) }

    try {
      const { data: rsData, error: rsError } = await supabase
        .from('vista_contacts').select('*')
        .not('score_delta', 'is', null)
        .order('last_score_update', { ascending: false }).limit(10)
      if (rsError) console.error('scores error:', rsError.message)
      else recentScores = (rsData || []) as VistaContact[]
    } catch (e: any) { console.error('scores fetch error:', e.message) }

    const kpis = {
      totalHot: hotContacts?.count || 0,
      draftsPending: drafts?.count || 0,
      staleContacts: staleContactsResult?.count || 0,
      newSignals: recentSignals?.count || 0,
    }

    return (
      <Dashboard
        kpis={kpis}
        pipelineData={pipelineData}
        top7Data={top7Data}
        staleContacts={(staleContactsResult?.data || []) as VistaContact[]}
        thresholdCrossings={thresholdCrossings}
        recentScores={recentScores}
      />
    )
  } catch (error: any) {
    console.error('Dashboard page error:', error)
    return (
      <div className="p-8 bg-red-50 rounded-xl border border-red-200 max-w-2xl mx-auto mt-8">
        <h2 className="text-lg font-bold text-red-800 mb-2">Dashboard Error</h2>
        <p className="text-sm text-red-600 mb-2">{error.message}</p>
        <pre className="text-xs text-red-500 bg-white p-3 rounded border overflow-auto max-h-96">
          {error.stack}
        </pre>
      </div>
    )
  }
}
