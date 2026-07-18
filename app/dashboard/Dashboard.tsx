"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VistaCard, VistaCardHeader, VistaCardTitle, VistaCardContent } from "@/components/ui/VistaCard"
import { Activity, Phone, Mail, Zap, Bell, ArrowRight, Users, Target, Trophy, Sparkles, BarChart3, Clock, ChevronRight } from "lucide-react"
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { CampaignWizard } from "@/components/modals/CampaignWizard"
import { Toaster, useToasts } from "@/components/ui/toast"
import { CountUp } from "@/components/ui/count-up"
import { AISummaryPanel } from "@/components/ui/AISummaryPanel"
import { subscribeToVistaChanges } from "@/lib/supabase/realtime"
import { BulkAssessButton } from "@/components/intelligence/bulk-assess-button"
import { AgentStatusPanel } from "@/components/intelligence/agent-status-panel"
import { AgentOutputFeed } from "@/components/intelligence/agent-output-feed"
import { AgentTriggerButton } from "@/components/intelligence/agent-trigger-button"
import type { PriorityAction, DashboardKPIs, PipelineFunnelStage, RecentActivity, VistaContact, ActivityType } from "@/lib/types"

// Icon map for priority actions (no emojis — brand rule)
const ACTION_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  follow_up: Mail,
  signal: Zap,
  cold_alert: Bell,
}

// Pipeline funnel colors
const FUNNEL_COLORS = ["#C108AB", "#00897B", "#4FC3F7", "#F59E0B", "#2d8a4e"]

// Client-side cache
const CACHE_TTL = 60_000
interface CacheEntry<T> { data: T; timestamp: number }
const cache: Record<string, CacheEntry<unknown>> = {}

async function cachedFetch<T>(url: string): Promise<T> {
  const now = Date.now()
  const cached = cache[url] as CacheEntry<T> | undefined
  if (cached && now - cached.timestamp < CACHE_TTL) return cached.data
  const res = await fetch(url)
  const data = await res.json()
  cache[url] = { data, timestamp: now }
  return data
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function Dashboard() {
  const router = useRouter()
  const { toasts, dismissToast } = useToasts()
  const [loading, setLoading] = useState(true)
  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>([])
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [pipelineFunnel, setPipelineFunnel] = useState<PipelineFunnelStage[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<VistaContact | undefined>()
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | undefined>()
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null)

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    try {
      if (forceRefresh) {
        delete cache["/api/dashboard/priority-actions"]
        delete cache["/api/dashboard/kpis"]
        delete cache["/api/dashboard/pipeline-funnel"]
        delete cache["/api/dashboard/recent-activity"]
      }
      const [actionsData, kpisData, funnelData, activityData] = await Promise.all([
        cachedFetch<{ actions: PriorityAction[] }>("/api/dashboard/priority-actions"),
        cachedFetch<DashboardKPIs>("/api/dashboard/kpis"),
        cachedFetch<{ funnel: PipelineFunnelStage[] }>("/api/dashboard/pipeline-funnel"),
        cachedFetch<{ activities: RecentActivity[] }>("/api/dashboard/recent-activity"),
      ])
      setPriorityActions(actionsData.actions || [])
      setKpis(kpisData)
      setPipelineFunnel(funnelData.funnel || [])
      setRecentActivity(activityData.activities || [])
    } catch (error) {
      // Error handled by failed state below
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000)
    let debounceTimer: NodeJS.Timeout | null = null
    const handleRealtimeChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => fetchDashboardData(), 2000)
    }
    try { realtimeUnsubscribeRef.current = subscribeToVistaChanges(handleRealtimeChange) } catch {}
    return () => {
      clearInterval(interval)
      if (realtimeUnsubscribeRef.current) realtimeUnsubscribeRef.current()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [fetchDashboardData])

  const resolveContact = async (contactId: string): Promise<VistaContact | undefined> => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`)
      if (!res.ok) return undefined
      const data = await res.json()
      return data.contact || data
    } catch { return undefined }
  }

  const handleExecute = async (action: PriorityAction) => {
    if (action.contact_id) {
      const contact = await resolveContact(action.contact_id)
      setSelectedContact(contact)
    }
    switch (action.type) {
      case "call": setSelectedActivityType("Call"); setActivityLogOpen(true); break
      case "follow_up": case "cold_alert": setEmailComposerOpen(true); break
      case "signal": if (action.signal_id) router.push(`/signals/${action.signal_id}`); break
    }
  }

  const handleCallNow = (action: PriorityAction) => { setSelectedActivityType("Call"); setActivityLogOpen(true) }
  const handleSendEmail = async (action: PriorityAction) => {
    if (action.contact_id) { const c = await resolveContact(action.contact_id); setSelectedContact(c) }
    setEmailComposerOpen(true)
  }
  const handleViewSignal = (action: PriorityAction) => { if (action.signal_id) router.push(`/signals/${action.signal_id}`) }
  const handleReEngage = async (action: PriorityAction) => {
    if (action.contact_id) { const c = await resolveContact(action.contact_id); setSelectedContact(c) }
    setEmailComposerOpen(true)
  }

  const getKPIChange = (value: number, delta: number) => {
    const pct = value > 0 ? Math.round((delta / value) * 100) : 0
    if (pct > 0) return `+${pct}%`
    if (pct < 0) return `${pct}%`
    return "0%"
  }
  const getKPIChangeColor = (value: number, delta: number) => {
    const pct = value > 0 ? Math.round((delta / value) * 100) : 0
    if (pct > 0) return "text-success"
    if (pct < 0) return "text-error"
    return "text-muted-foreground"
  }

  const maxFunnelCount = Math.max(...pipelineFunnel.map(s => s.count), 1)

  return (
    <div className="space-y-8">
      {/* ═══ HERO HEADER ═══ */}
      <div className="border-b border-border pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground mb-2">
              {formatDate()}
            </p>
            <h1 className="text-4xl font-bold font-heading text-primary">
              {getGreeting()}, Kevin
            </h1>
            <p className="text-base text-muted-foreground mt-2">
              Here is your BD intelligence overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BulkAssessButton onComplete={() => fetchDashboardData(true)} />
            <Button onClick={() => fetchDashboardData(true)} variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ KPI CARDS — Large, dramatic numbers ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            {/* Total Contacts */}
            <VistaCard 
              borderLeftColor="fuchsia" 
              className="cursor-pointer"
              onClick={() => router.push("/contacts")}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                  Total Contacts
                </p>
                <div className="h-10 w-10 bg-accent/5 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-5xl font-bold font-heading text-primary leading-none mb-2">
                <CountUp end={kpis?.contacts || 0} />
              </p>
              <p className={`text-xs font-medium ${getKPIChangeColor(kpis?.contacts || 0, kpis?.contacts_delta || 0)}`}>
                {getKPIChange(kpis?.contacts || 0, kpis?.contacts_delta || 0)} <span className="text-muted-foreground">vs last week</span>
              </p>
            </VistaCard>

            {/* Active Deals */}
            <VistaCard 
              borderLeftColor="teal" 
              className="cursor-pointer"
              onClick={() => router.push("/pipeline")}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                  Active Deals
                </p>
                <div className="h-10 w-10 bg-teal/5 flex items-center justify-center">
                  <Target className="h-5 w-5 text-teal" />
                </div>
              </div>
              <p className="text-5xl font-bold font-heading text-primary leading-none mb-2">
                <CountUp end={kpis?.active_deals || 0} />
              </p>
              <p className={`text-xs font-medium ${getKPIChangeColor(kpis?.active_deals || 0, kpis?.contacts_delta || 0)}`}>
                {getKPIChange(kpis?.active_deals || 0, kpis?.contacts_delta || 0)} <span className="text-muted-foreground">vs last week</span>
              </p>
            </VistaCard>

            {/* Closed Won */}
            <VistaCard 
              borderLeftColor="success" 
              className="cursor-pointer"
              onClick={() => router.push("/pipeline")}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                  Closed Won
                </p>
                <div className="h-10 w-10 bg-success/5 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-5xl font-bold font-heading text-primary leading-none mb-2">
                <CountUp end={kpis?.closed_won || 0} />
              </p>
              <p className="text-xs font-medium text-muted-foreground">This month</p>
            </VistaCard>

            {/* New Signals */}
            <VistaCard 
              borderLeftColor="ocean" 
              className="cursor-pointer"
              onClick={() => router.push("/signals")}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground">
                  New Signals
                </p>
                <div className="h-10 w-10 bg-ocean/5 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-ocean-deep" />
                </div>
              </div>
              <p className="text-5xl font-bold font-heading text-primary leading-none mb-2">
                <CountUp end={kpis?.signals || 0} />
              </p>
              <p className={`text-xs font-medium ${getKPIChangeColor(kpis?.signals || 0, kpis?.signals_delta || 0)}`}>
                {getKPIChange(kpis?.signals || 0, kpis?.signals_delta || 0)} <span className="text-muted-foreground">vs last week</span>
              </p>
            </VistaCard>
          </>
        )}
      </div>

      {/* ═══ PRIORITY ACTIONS — Card-based, not rows ═══ */}
      <VistaCard borderLeftColor="fuchsia" hoverable={false}>
        <VistaCardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-accent/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <VistaCardTitle className="text-lg">Priority Actions</VistaCardTitle>
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
              {priorityActions.length} today
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </VistaCardHeader>
        <VistaCardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : priorityActions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priorityActions.slice(0, 4).map((action) => {
                const IconComponent = ACTION_ICONS[action.type] || Bell
                return (
                  <div
                    key={`${action.type}-${action.contact_id || action.signal_id || action.priority}`}
                    className="flex items-start gap-4 p-4 bg-bg-warm border border-border hover:border-accent/30 transition-colors cursor-pointer group"
                    onClick={() => handleExecute(action)}
                  >
                    <div className="h-10 w-10 bg-accent/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                      <IconComponent className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-primary mb-1">{action.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No priority actions today.</p>
            </div>
          )}
        </VistaCardContent>
      </VistaCard>

      {/* ═══ AGENT STATUS + ACTIVITY FEED ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentStatusPanel />
        <div className="lg:col-span-2">
          <AgentOutputFeed limit={5} />
        </div>
      </div>

      {/* ═══ BOTTOM ROW: Pipeline Funnel + Recent Activity ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel — Visual horizontal bars */}
        <VistaCard borderLeftColor="teal" hoverable={false}>
          <VistaCardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-teal/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-teal" />
              </div>
              <VistaCardTitle className="text-lg">Pipeline Funnel</VistaCardTitle>
            </div>
          </VistaCardHeader>
          <VistaCardContent>
            {loading ? (
              <div className="space-y-4 py-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {pipelineFunnel.map((stage, i) => (
                  <div
                    key={stage.stage}
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => router.push(`/pipeline?stage=${stage.stage}`)}
                  >
                    <span className="w-24 text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex-shrink-0">
                      {stage.stage}
                    </span>
                    <div className="flex-1 h-8 bg-bg-alt relative overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${(stage.count / maxFunnelCount) * 100}%`,
                          backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-lg font-bold font-heading text-primary">
                      <CountUp end={stage.count} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </VistaCardContent>
        </VistaCard>

        {/* Recent Activity */}
        <VistaCard borderLeftColor="ocean" hoverable={false}>
          <VistaCardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-ocean/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-ocean-deep" />
              </div>
              <VistaCardTitle className="text-lg">Recent Activity</VistaCardTitle>
            </div>
          </VistaCardHeader>
          <VistaCardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-bg-warm cursor-pointer transition-colors"
                  >
                    <div className="h-8 w-8 bg-teal/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="h-4 w-4 text-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {activity.subject || activity.activity_type}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : ""}
                        {activity.contact_name && ` · ${activity.contact_name}`}
                        {activity.contact_company && ` (${activity.contact_company})`}
                      </p>
                    </div>
                    {activity.outcome && (
                      <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-1">
                        {activity.outcome}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </VistaCardContent>
        </VistaCard>
      </div>

      {/* Quick Actions — Bottom */}
      <VistaCard hoverable={false} className="bg-bg-warm">
        <VistaCardHeader>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <VistaCardTitle className="text-lg">Quick Actions</VistaCardTitle>
          </div>
        </VistaCardHeader>
        <VistaCardContent>
          <div className="flex flex-wrap gap-3">
            <AgentTriggerButton agent="LENS" triggerData={{ scope: "decayed" }} label="Rescore Decayed" variant="outline" size="sm" />
            <AgentTriggerButton agent="MARIA" triggerData={{ scope: "all" }} label="Draft Campaigns" variant="outline" size="sm" />
            <AgentTriggerButton agent="PROBE" triggerData={{ type: "at-risk" }} label="Find At-Risk Deals" variant="outline" size="sm" />
            <AgentTriggerButton agent="CARL" triggerData={{ type: "strategic-review" }} label="Strategic Review" variant="outline" size="sm" />
            <BulkAssessButton />
          </div>
        </VistaCardContent>
      </VistaCard>

      {/* Modals */}
      <EmailComposer isOpen={emailComposerOpen} onClose={() => setEmailComposerOpen(false)} prefilledContact={selectedContact} />
      <CampaignWizard isOpen={campaignWizardOpen} onClose={() => setCampaignWizardOpen(false)} contactIds={selectedContact ? [selectedContact.id] : undefined} />
      <ActivityLog isOpen={activityLogOpen} onClose={() => setActivityLogOpen(false)} prefilledContact={selectedContact} prefilledType={selectedActivityType} />
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
