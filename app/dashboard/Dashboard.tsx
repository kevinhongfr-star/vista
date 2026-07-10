"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, Phone, Mail, Zap, Bell, ArrowRight, Users, Target, Trophy, Play } from "lucide-react"
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

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)

    let debounceTimer: NodeJS.Timeout | null = null
    const handleRealtimeChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        fetchDashboardData()
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
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [actionsRes, kpisRes, funnelRes, activityRes] = await Promise.all([
        fetch("/api/dashboard/priority-actions"),
        fetch("/api/dashboard/kpis"),
        fetch("/api/dashboard/pipeline-funnel"),
        fetch("/api/dashboard/recent-activity"),
      ])

      const [actionsData, kpisData, funnelData, activityData] = await Promise.all([
        actionsRes.json(),
        kpisRes.json(),
        funnelRes.json(),
        activityRes.json(),
      ])

      setPriorityActions(actionsData.actions || [])
      setKpis(kpisData)
      setPipelineFunnel(funnelData.funnel || [])
      setRecentActivity(activityData.activities || [])
    } catch (error) {
      addToast("error", "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const resolveContact = async (contactId: string): Promise<VistaContact | undefined> => {
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Kevin. Here&#39;s your daily BD intelligence overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkAssessButton onComplete={fetchDashboardData} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={fetchDashboardData} variant="outline">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow card-hover" onClick={() => router.push("/contacts")}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Contacts</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={kpis?.contacts || 0} />
                        </p>
                        <p className={`text-xs mt-2 ${getKPIChangeColor(kpis?.contacts || 0, kpis?.contacts_delta || 0)}`}>
                          {getKPIChange(kpis?.contacts || 0, kpis?.contacts_delta || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View all contacts in your database</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/pipeline")}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Active Deals</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={kpis?.active_deals || 0} />
                        </p>
                        <p className={`text-xs mt-2 ${getKPIChangeColor(kpis?.active_deals || 0, kpis?.contacts_delta || 0)}`}>
                          {getKPIChange(kpis?.active_deals || 0, kpis?.contacts_delta || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View your active pipeline deals</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/pipeline")}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Closed Won</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={kpis?.closed_won || 0} />
                        </p>
                        <p className={`text-xs mt-2 text-success`}>
                          This Month
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Closed deals this month</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/signals")}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">New Signals</p>
                        <p className="text-3xl font-bold">
                          <CountUp end={kpis?.signals || 0} />
                        </p>
                        <p className={`text-xs mt-2 ${getKPIChangeColor(kpis?.signals || 0, kpis?.signals_delta || 0)}`}>
                          {getKPIChange(kpis?.signals || 0, kpis?.signals_delta || 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>New company signals this week</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Agent Status + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentStatusPanel />
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-fuchsia-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <AgentTriggerButton
                  agent="LENS"
                  triggerData={{ scope: "decayed" }}
                  label="Score Decayed"
                  variant="outline"
                  size="sm"
                />
                <AgentTriggerButton
                  agent="MARIA"
                  triggerData={{ scope: "all" }}
                  label="Draft Campaigns"
                  variant="outline"
                  size="sm"
                />
                <AgentTriggerButton
                  agent="PROBE"
                  triggerData={{ type: "at-risk" }}
                  label="Find At-Risk"
                  variant="outline"
                  size="sm"
                />
                <AgentTriggerButton
                  agent="CARL"
                  triggerData={{ type: "strategic-review" }}
                  label="Strategic Review"
                  variant="outline"
                  size="sm"
                />
                <BulkAssessButton />
              </div>
            </CardContent>
          </Card>
          <AgentOutputFeed limit={5} />
        </div>
      </div>

      {/* Priority Actions */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
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
            <div className="space-y-4">
              {priorityActions.slice(0, 4).map((action) => (
                <div
                  key={`${action.type}-${action.contact_id || action.signal_id || action.priority}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleExecute(action)}
                      className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute
                    </Button>
                    {action.type === "call" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCallNow(action)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call Now
                      </Button>
                    )}
                    {action.type === "follow_up" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSendEmail(action)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Send Email
                      </Button>
                    )}
                    {action.type === "signal" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleViewSignal(action)}
                      >
                        View <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                    {action.type === "cold_alert" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleReEngage(action)}
                        className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
                      >
                        Re-engage
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 h-4 bg-muted rounded" />
                    <div className="flex-1 h-4 bg-muted rounded" />
                    <div className="w-12 h-4 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {pipelineFunnel.map((stage, i) => (
                  <div
                    key={stage.stage}
                    className="flex items-center gap-4 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors"
                    onClick={() => router.push(`/pipeline?stage=${stage.stage}`)}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="w-28 text-sm font-medium">{stage.stage}</span>
                    <div className="flex-1">
                      <ProgressBar value={stage.percentage} animated={false} barClassName="bg-gradient-to-r from-accent-fuchsia to-purple-500" />
                    </div>
                    <span className="w-16 text-right font-bold"><CountUp end={stage.count} /></span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
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
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.subject || activity.activity_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.activity_date
                          ? new Date(activity.activity_date).toLocaleDateString()
                          : ""}
                        {activity.contact_name && ` • ${activity.contact_name}`}
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