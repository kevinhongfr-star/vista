"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, Phone, Mail, Zap, Bell, ArrowRight, Users, Target, Trophy, Play, LucideIcon } from "lucide-react"
import { CardSkeleton, TableSkeleton, Skeleton } from "@/components/ui/skeleton"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { CampaignWizard } from "@/components/modals/CampaignWizard"
import { Toaster, useToasts } from "@/components/ui/toast"
import { CountUp } from "@/components/ui/count-up"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

// Client-side cache — avoids redundant API calls within 60s window
const CACHE_TTL = 60_000 // 60 seconds
interface CacheEntry<T> { data: T; timestamp: number }
const cache: Record<string, CacheEntry<unknown>> = {}

async function cachedFetch<T>(url: string): Promise<T> {
  const now = Date.now()
  const cached = cache[url] as CacheEntry<T> | undefined
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const res = await fetch(url)
  const data = await res.json()
  cache[url] = { data, timestamp: now }
  return data
}

export function Dashboard() {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
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
        // Clear cache on manual refresh
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
      console.error("Failed to fetch dashboard data:", error)
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
      debounceTimer = setTimeout(() => {
        fetchDashboardData(true)
      }, 1000)
    }

    realtimeUnsubscribeRef.current = subscribeToVistaChanges(
      handleRealtimeChange,
      handleRealtimeChange,
      handleRealtimeChange
    )

    return () => {
      clearInterval(interval)
      if (debounceTimer) clearTimeout(debounceTimer)
      realtimeUnsubscribeRef.current?.()
    }
  }, [fetchDashboardData])

  const resolveContact = async (contactId: string) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`)
      const data = await res.json()
      return data.contact || data
    } catch {
      return undefined
    }
  }

  const handleExecute = async (action: PriorityAction) => {
    if (action.contact_id) {
      const contact = await resolveContact(action.contact_id)
      setSelectedContact(contact)
    }

    switch (action.type) {
      case "call":
        setSelectedActivityType("Call")
        setActivityLogOpen(true)
        break
      case "follow_up":
      case "cold_alert":
        setEmailComposerOpen(true)
        break
      case "signal":
        if (action.signal_id) {
          router.push(`/signals/${action.signal_id}`)
        }
        break
    }
  }

  const handleCallNow = (action: PriorityAction) => {
    setSelectedActivityType("Call")
    setActivityLogOpen(true)
  }

  const handleSendEmail = async (action: PriorityAction) => {
    if (action.contact_id) {
      const contact = await resolveContact(action.contact_id)
      setSelectedContact(contact)
    }
    setEmailComposerOpen(true)
  }

  const handleViewSignal = (action: PriorityAction) => {
    if (action.signal_id) {
      router.push(`/signals/${action.signal_id}`)
    }
  }

  const handleReEngage = async (action: PriorityAction) => {
    if (action.contact_id) {
      const contact = await resolveContact(action.contact_id)
      setSelectedContact(contact)
    }
    setEmailComposerOpen(true)
  }

  const getKPIChange = (value: number, delta: number) => {
    const percentage = value > 0 ? Math.round((delta / value) * 100) : 0
    if (percentage > 0) return `+${percentage}% ↑`
    if (percentage < 0) return `${percentage}% ↓`
    return "0% ↔"
  }

  const getKPIChangeColor = (value: number, delta: number) => {
    const percentage = value > 0 ? Math.round((delta / value) * 100) : 0
    if (percentage > 0) return "text-success"
    if (percentage < 0) return "text-error"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Kevin. Here&apos;s your daily BD intelligence overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkAssessButton onComplete={() => fetchDashboardData(true)} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => fetchDashboardData(true)} variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh dashboard data from the server</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* KPI Cards — VistaCard with colored left borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            {/* Total Contacts */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer vista-card vista-card-accent-fuchsia"
                  onClick={() => router.push("/contacts")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">Total Contacts</p>
                        <p className="text-3xl font-bold font-heading">
                          <CountUp end={kpis?.contacts || 0} />
                        </p>
                        <p className={`text-xs mt-2 ${getKPIChangeColor(kpis?.contacts || 0, kpis?.contacts_delta || 0)}`}>
                          {getKPIChange(kpis?.contacts || 0, kpis?.contacts_delta || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-accent-5 flex items-center justify-center">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent><p>View all contacts in your database</p></TooltipContent>
            </Tooltip>

            {/* Active Deals */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer vista-card vista-card-accent-teal"
                  onClick={() => router.push("/pipeline")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">Active Deals</p>
                        <p className="text-3xl font-bold font-heading">
                          <CountUp end={kpis?.active_deals || 0} />
                        </p>
                        <p className={`text-xs mt-2 ${getKPIChangeColor(kpis?.active_deals || 0, kpis?.contacts_delta || 0)}`}>
                          {getKPIChange(kpis?.active_deals || 0, kpis?.contacts_delta || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-teal/10 flex items-center justify-center">
                        <Target className="h-6 w-6 text-teal" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent><p>View your active pipeline deals</p></TooltipContent>
            </Tooltip>

            {/* Closed Won */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer vista-card vista-card-accent-success"
                  onClick={() => router.push("/pipeline")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">Closed Won</p>
                        <p className="text-3xl font-bold font-heading">
                          <CountUp end={kpis?.closed_won || 0} />
                        </p>
                        <p className="text-xs mt-2 text-success">This Month</p>
                      </div>
                      <div className="h-12 w-12 bg-accent-10 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-accent-hover" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent><p>Closed deals this month</p></TooltipContent>
            </Tooltip>

            {/* New Signals */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className="cursor-pointer vista-card vista-card-accent-ocean"
                  onClick={() => router.push("/signals")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">New Signals</p>
                        <p className="text-3xl font-bold font-heading">
                          <CountUp end={kpis?.signals || 0} />
                        </p>
                        <p className={`text-xs mt-2 ${getKPIChangeColor(kpis?.signals || 0, kpis?.signals_delta || 0)}`}>
                          {getKPIChange(kpis?.signals || 0, kpis?.signals_delta || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-ocean/10 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-ocean-deep" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent><p>New company signals this week</p></TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Agent Status + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentStatusPanel />
        <div className="lg:col-span-2 space-y-6">
          <Card className="vista-card vista-card-accent-fuchsia">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Play className="h-5 w-5 text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <AgentTriggerButton agent="LENS" triggerData={{ scope: "decayed" }} label="Score Decayed" variant="outline" size="sm" />
                <AgentTriggerButton agent="MARIA" triggerData={{ scope: "all" }} label="Draft Campaigns" variant="outline" size="sm" />
                <AgentTriggerButton agent="PROBE" triggerData={{ type: "at-risk" }} label="Find At-Risk" variant="outline" size="sm" />
                <AgentTriggerButton agent="CARL" triggerData={{ type: "strategic-review" }} label="Strategic Review" variant="outline" size="sm" />
                <BulkAssessButton />
              </div>
            </CardContent>
          </Card>
          <AgentOutputFeed limit={5} />
        </div>
      </div>

      {/* Priority Actions */}
      <Card className="vista-card">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-heading">
            <Zap className="h-5 w-5 text-accent" />
            Priority Actions (Today)
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : priorityActions.length > 0 ? (
            <div className="space-y-3">
              {priorityActions.slice(0, 4).map((action) => {
                const IconComponent = ACTION_ICONS[action.type] || Bell
                return (
                  <div
                    key={`${action.type}-${action.contact_id || action.signal_id || action.priority}`}
                    className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors border-l-2 border-accent/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-accent-5 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExecute(action)}
                        className="bg-accent hover:bg-accent-hover text-white"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Execute
                      </Button>
                      {action.type === "call" && (
                        <Button size="sm" onClick={() => handleCallNow(action)} className="bg-teal hover:bg-teal/80 text-white">
                          <Phone className="h-4 w-4 mr-1" />
                          Call Now
                        </Button>
                      )}
                      {action.type === "follow_up" && (
                        <Button size="sm" onClick={() => handleSendEmail(action)} className="bg-accent hover:bg-accent-hover text-white">
                          <Mail className="h-4 w-4 mr-1" />
                          Send Email
                        </Button>
                      )}
                      {action.type === "signal" && (
                        <Button size="sm" onClick={() => handleViewSignal(action)}>
                          View <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      {action.type === "cold_alert" && (
                        <Button size="sm" onClick={() => handleReEngage(action)} className="bg-accent hover:bg-accent-hover text-white">
                          Re-engage
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No priority actions today. Great work!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row: Pipeline Funnel + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card className="vista-card vista-card-accent-teal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <TrendingUp className="h-5 w-5 text-teal" />
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 h-4 bg-muted" />
                    <div className="flex-1 h-4 bg-muted" />
                    <div className="w-12 h-4 bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {pipelineFunnel.map((stage, i) => (
                  <div
                    key={stage.stage}
                    className="flex items-center gap-4 cursor-pointer hover:bg-muted/30 p-2 transition-colors"
                    onClick={() => router.push(`/pipeline?stage=${stage.stage}`)}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="w-28 text-xs uppercase tracking-wider font-semibold text-muted-foreground">{stage.stage}</span>
                    <div className="flex-1">
                      <ProgressBar value={stage.percentage} animated={false} barClassName="bg-gradient-to-r from-accent to-accent-hover" />
                    </div>
                    <span className="w-16 text-right font-bold font-heading"><CountUp end={stage.count} /></span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="vista-card vista-card-accent-ocean">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Activity className="h-5 w-5 text-ocean-deep" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={4} />
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="h-8 w-8 bg-teal/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.subject || activity.activity_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString() : ""}
                        {activity.contact_name && ` · ${activity.contact_name}`}
                        {activity.contact_company && ` (${activity.contact_company})`}
                      </p>
                    </div>
                    {activity.outcome && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        {activity.outcome}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Composer Modal */}
      <EmailComposer
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        prefilledContact={selectedContact}
      />

      {/* Campaign Wizard Modal */}
      <CampaignWizard
        isOpen={campaignWizardOpen}
        onClose={() => setCampaignWizardOpen(false)}
        contactIds={selectedContact ? [selectedContact.id] : undefined}
      />

      {/* Activity Log Modal */}
      <ActivityLog
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
        prefilledContact={selectedContact}
        prefilledType={selectedActivityType}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
