"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentStatusBar } from "@/components/layout/AgentStatusBar"
import { KPICard } from "@/components/dashboard/KPICard"
import { PipelineSummary } from "@/components/dashboard/PipelineSummary"
import { Top7Ranking } from "@/components/dashboard/Top7Ranking"
import { AlertFeed } from "@/components/dashboard/AlertFeed"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { Users, Mail, Clock, Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { DashboardKPIs, PipelineSummaryView, Top7View, VistaContact } from "@/lib/types"

interface DashboardProps {
  kpis: DashboardKPIs
  pipelineData: PipelineSummaryView[]
  top7Data: Top7View[]
  staleContacts: VistaContact[]
  thresholdCrossings: VistaContact[]
  recentScores: VistaContact[]
}

export function Dashboard({
  kpis,
  pipelineData,
  top7Data,
  staleContacts,
  thresholdCrossings,
  recentScores,
}: DashboardProps) {
  const handleTriggerLens = async () => {
    // TODO: Implement LENS scoring trigger
    console.log('Triggering LENS scoring...')
  }

  const handleTriggerMaria = async () => {
    // TODO: Implement MARIA draft generation
    console.log('Triggering MARIA drafts...')
  }

  const handleTriggerProbe = async () => {
    // TODO: Implement PROBE refresh
    console.log('Triggering PROBE refresh...')
  }

  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <AgentStatusBar />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Hot Contacts"
          value={kpis.totalHot}
          subtitle="Engagement tier: Hot or Committed"
          icon={<Users className="h-5 w-5" />}
          color="success"
        />
        <KPICard
          title="New Signals"
          value={kpis.newSignals}
          subtitle="Last 7 days"
          icon={<Activity className="h-5 w-5" />}
          color="info"
        />
        <KPICard
          title="Drafts Pending"
          value={kpis.draftsPending}
          subtitle="Awaiting approval"
          icon={<Mail className="h-5 w-5" />}
          color="warning"
        />
        <KPICard
          title="Stale Contacts"
          value={kpis.staleContacts}
          subtitle="30+ days no engagement"
          icon={<Clock className="h-5 w-5" />}
          color="error"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pipeline + Top 7 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pipeline Summary</span>
                <Button variant="ghost" size="sm" className="h-8">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineData.length > 0 ? (
                <PipelineSummary data={pipelineData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pipeline data available. Run LENS scoring to populate.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top 7 Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Top 7 Contacts This Week</span>
                <span className="text-xs text-muted-foreground">Priority Score ≥ 40</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Top7Ranking data={top7Data} />
            </CardContent>
          </Card>

          {/* Recent Score Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Score Changes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScores.length > 0 ? (
                <div className="space-y-3">
                  {recentScores.map((contact) => (
                    <div 
                      key={contact.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-medium">{contact.name || "Unknown"}</span>
                        <span className="text-muted-foreground ml-2">• {contact.company || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs",
                          contact.score_delta?.includes('+') ? 'text-success' : 
                          contact.score_delta?.includes('-') ? 'text-error' : 
                          'text-muted-foreground'
                        )}>
                          {contact.score_delta || '—'}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {contact.last_score_update ? 
                            new Date(contact.last_score_update).toLocaleDateString() : 
                            '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent score changes.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions + Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions
                onTriggerLens={handleTriggerLens}
                onTriggerMaria={handleTriggerMaria}
                onTriggerProbe={handleTriggerProbe}
              />
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertFeed
                staleContacts={staleContacts}
                thresholdCrossings={thresholdCrossings}
                newSignals={thresholdCrossings}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}