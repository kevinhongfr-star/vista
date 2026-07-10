"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, AlertTriangle, Users, Target, Zap, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AISummaryPanelProps {
  /** Page context — determines what kind of analysis to show */
  context: "contacts" | "pipeline" | "campaigns" | "clusters" | "activities" | "signals" | "dashboard"
  /** Raw data to analyze — page-specific shape */
  data: any
  className?: string
}

interface InsightItem {
  icon: React.ReactNode
  label: string
  value: string
  severity: "info" | "warning" | "success" | "accent"
}

/**
 * Reusable AI Summary Panel — shows data-driven insights for any page.
 * Analyzes the provided data and surfaces key patterns, risks, and recommendations.
 * Similar to the Signals page summary, but context-aware for each page.
 */
export function AISummaryPanel({ context, data, className }: AISummaryPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [generating, setGenerating] = useState(false)

  const insights = generateInsights(context, data)

  const handleRefresh = () => {
    setGenerating(true)
    // Simulate a brief regeneration for UX
    setTimeout(() => setGenerating(false), 600)
  }

  if (!insights.length) return null

  const severityStyles: Record<string, string> = {
    info: "bg-ocean/5 border-ocean/20 text-ocean-deep",
    warning: "bg-warning/5 border-warning/20 text-amber-800",
    success: "bg-teal/5 border-teal/20 text-teal",
    accent: "bg-accent-5 border-accent/20 text-accent-hover",
  }

  return (
    <div className={cn("border border-border bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-5 border border-accent/20">
            <Sparkles className="h-3.5 w-3.5 text-accent-fuchsia" />
            <span className="text-xs font-semibold text-accent-fuchsia uppercase tracking-wider">AI Insights</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {insights.length} findings
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleRefresh() }}
            className="p-1 hover:bg-muted transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className={cn("h-3 w-3 text-muted-foreground", generating && "animate-spin")} />
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Insights Grid */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((insight, i) => (
            <div key={i} className={cn("flex items-start gap-2 p-3 border", severityStyles[insight.severity])}>
              <div className="mt-0.5 shrink-0">{insight.icon}</div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{insight.label}</p>
                <p className="text-sm font-medium mt-0.5">{insight.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function generateInsights(context: string, data: any): InsightItem[] {
  if (!data) return []

  switch (context) {
    case "contacts":
      return generateContactInsights(data)
    case "pipeline":
      return generatePipelineInsights(data)
    case "campaigns":
      return generateCampaignInsights(data)
    case "clusters":
      return generateClusterInsights(data)
    case "activities":
      return generateActivityInsights(data)
    case "dashboard":
      return generateDashboardInsights(data)
    default:
      return []
  }
}

function generateContactInsights(contacts: any[]): InsightItem[] {
  if (!contacts?.length) return []
  const insights: InsightItem[] = []
  const total = contacts.length

  // High-value contacts
  const highValue = contacts.filter(c => (c.priority_score || 0) >= 70)
  if (highValue.length > 0) {
    insights.push({
      icon: <Target className="h-3.5 w-3.5" />,
      label: "High Priority",
      value: `${highValue.length} contacts scored 70+ — immediate action candidates`,
      severity: "accent",
    })
  }

  // Stale contacts
  const stale = contacts.filter(c => {
    const lastDate = c.last_engagement_date || c.last_contact_date || c.last_touch_date
    if (!lastDate) return true
    const days = (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    return days > 30
  })
  if (stale.length > 0) {
    insights.push({
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: "Stale Contacts",
      value: `${stale.length} contacts untouched for 30+ days — re-engage or archive`,
      severity: "warning",
    })
  }

  // Hot tier count
  const hot = contacts.filter(c => c.engagement_tier === "Hot" || c.engagement_tier === "Committed")
  insights.push({
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    label: "Engagement Distribution",
    value: `${hot.length} Hot/Committed, ${total - hot.length} Warm/Cold — ${Math.round(hot.length / total * 100)}% activation rate`,
    severity: hot.length / total > 0.3 ? "success" : "info",
  })

  // Top companies
  const companyCount = new Set(contacts.map(c => c.company).filter(Boolean)).size
  const topCompanies = contacts.reduce((acc: Record<string, number>, c) => {
    if (c.company) acc[c.company] = (acc[c.company] || 0) + 1
    return acc
  }, {})
  const topCompany = Object.entries(topCompanies).sort((a, b) => b[1] - a[1])[0]
  if (topCompany) {
    insights.push({
      icon: <Users className="h-3.5 w-3.5" />,
      label: "Company Density",
      value: `${companyCount} companies represented. Top: ${topCompany[0]} (${topCompany[1]} contacts)`,
      severity: "info",
    })
  }

  // Pipeline stage distribution
  const stageCounts = contacts.reduce((acc: Record<string, number>, c) => {
    const stage = c.pipeline_stage || "Prospect"
    acc[stage] = (acc[stage] || 0) + 1
    return acc
  }, {})
  const engagedCount = (stageCounts["Engaged"] || 0) + (stageCounts["Meeting Booked"] || 0) + (stageCounts["Proposal Sent"] || 0) + (stageCounts["Negotiation"] || 0)
  insights.push({
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "Pipeline Health",
    value: `${engagedCount} actively engaged (${Math.round(engagedCount / total * 100)}%), ${stageCounts["Prospect"] || 0} still prospecting`,
    severity: engagedCount / total > 0.4 ? "success" : "warning",
  })

  return insights.slice(0, 6)
}

function generatePipelineInsights(contacts: any[]): InsightItem[] {
  if (!contacts?.length) return []
  const insights: InsightItem[] = []

  const stages = contacts.reduce((acc: Record<string, number>, c) => {
    const stage = c.pipeline_stage || "Prospect"
    acc[stage] = (acc[stage] || 0) + 1
    return acc
  }, {})

  const total = contacts.length

  // Stale deals
  const staleDeals = contacts.filter(c => {
    const lastDate = c.last_engagement_date || c.last_contact_date || c.last_touch_date
    if (!lastDate) return false
    const days = (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    return days > 14 && !["Closed Won", "Closed Lost"].includes(c.pipeline_stage || "")
  })
  if (staleDeals.length > 0) {
    insights.push({
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: "Stale Deals",
      value: `${staleDeals.length} contacts inactive for 14+ days — follow up needed`,
      severity: "warning",
    })
  }

  // Stage distribution
  const topStage = Object.entries(stages).sort((a, b) => b[1] - a[1])[0]
  insights.push({
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    label: "Pipeline Distribution",
    value: `Largest stage: ${topStage?.[0]} (${topStage?.[1]} contacts, ${Math.round((topStage?.[1] || 0) / total * 100)}%)`,
    severity: "info",
  })

  // Conversion signal
  const closedWon = stages["Closed Won"] || 0
  const closedLost = stages["Closed Lost"] || 0
  if (closedWon + closedLost > 0) {
    const winRate = Math.round(closedWon / (closedWon + closedLost) * 100)
    insights.push({
      icon: <Target className="h-3.5 w-3.5" />,
      label: "Win Rate",
      value: `${winRate}% (${closedWon}W / ${closedLost}L) from ${closedWon + closedLost} closed`,
      severity: winRate >= 50 ? "success" : "warning",
    })
  }

  // Active pipeline count
  const activeCount = total - (stages["Closed Won"] || 0) - (stages["Closed Lost"] || 0)
  insights.push({
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "Active Pipeline",
    value: `${activeCount} contacts in active stages`,
    severity: "accent",
  })

  return insights.slice(0, 6)
}

function generateCampaignInsights(data: any): InsightItem[] {
  const insights: InsightItem[] = []
  const { campaigns, activities } = data || {}

  if (campaigns?.length) {
    const activeCampaigns = campaigns.filter((c: any) => c.status === "active" || c.status === "sent")
    insights.push({
      icon: <Zap className="h-3.5 w-3.5" />,
      label: "Campaign Activity",
      value: `${activeCampaigns.length} active campaigns out of ${campaigns.length} total`,
      severity: "info",
    })
  }

  if (activities?.length) {
    const recentActivities = activities.filter((a: any) => {
      const created = new Date(a.created_at || Date.now()).getTime()
      return (Date.now() - created) < 7 * 24 * 60 * 60 * 1000
    })
    insights.push({
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: "This Week",
      value: `${recentActivities.length} activities in the last 7 days`,
      severity: recentActivities.length > 5 ? "success" : "warning",
    })
  }

  return insights.length ? insights : [{
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Campaign Overview",
    value: "No campaign data available yet",
    severity: "info",
  }]
}

function generateClusterInsights(clusters: any[]): InsightItem[] {
  if (!clusters?.length) return []
  const insights: InsightItem[] = []

  const totalContacts = clusters.reduce((sum, c) => sum + (c.contact_count || 0), 0)
  insights.push({
    icon: <Users className="h-3.5 w-3.5" />,
    label: "Cluster Coverage",
    value: `${clusters.length} clusters with ${totalContacts} total contacts`,
    severity: "info",
  })

  const largest = clusters.reduce((max, c) => (c.contact_count || 0) > (max.contact_count || 0) ? c : max, clusters[0])
  if (largest) {
    insights.push({
      icon: <Target className="h-3.5 w-3.5" />,
      label: "Largest Cluster",
      value: `${largest.name || "Cluster"} with ${largest.contact_count || 0} contacts`,
      severity: "accent",
    })
  }

  return insights.slice(0, 6)
}

function generateActivityInsights(activities: any[]): InsightItem[] {
  if (!activities?.length) return []
  const insights: InsightItem[] = []

  const thisWeek = activities.filter(a => {
    const created = new Date(a.created_at || Date.now()).getTime()
    return (Date.now() - created) < 7 * 24 * 60 * 60 * 1000
  })
  insights.push({
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    label: "This Week",
    value: `${thisWeek.length} activities logged in the last 7 days`,
    severity: thisWeek.length > 10 ? "success" : thisWeek.length > 0 ? "info" : "warning",
  })

  const typeCounts = activities.reduce((acc: Record<string, number>, a) => {
    const type = a.activity_type || "Other"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
  if (topType) {
    insights.push({
      icon: <Zap className="h-3.5 w-3.5" />,
      label: "Top Activity Type",
      value: `${topType[0]} (${topType[1]} activities)`,
      severity: "info",
    })
  }

  return insights.slice(0, 6)
}

function generateDashboardInsights(data: any): InsightItem[] {
  const insights: InsightItem[] = []
  const { totalContacts, activeCampaigns, recentSignals, pipelineStages } = data || {}

  if (totalContacts) {
    insights.push({
      icon: <Users className="h-3.5 w-3.5" />,
      label: "Contact Base",
      value: `${totalContacts} contacts managed`,
      severity: "info",
    })
  }

  if (recentSignals?.length) {
    insights.push({
      icon: <Zap className="h-3.5 w-3.5" />,
      label: "Recent Signals",
      value: `${recentSignals.length} new signals detected recently`,
      severity: "accent",
    })
  }

  if (activeCampaigns !== undefined) {
    insights.push({
      icon: <Target className="h-3.5 w-3.5" />,
      label: "Campaigns",
      value: `${activeCampaigns} active campaigns running`,
      severity: "info",
    })
  }

  return insights.length ? insights : [{
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Dashboard",
    value: "Welcome to VISTA — your strategic contact intelligence platform",
    severity: "accent",
  }]
}
