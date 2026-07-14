"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Percent,
  Eye,
  Reply,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StepPerformance {
  step: number
  label: string
  type: string
  sent: number
  opened: number
  replied: number
  booked: number
  openRate: number
  replyRate: number
  bookingRate: number
}

interface SequencePerformance {
  id: string
  name: string
  type: string
  totalContacts: number
  activeContacts: number
  completedContacts: number
  totalTouches: number
  openRate: number
  replyRate: number
  bookingRate: number
  conversionRate: number
  avgTimeToBook: string
  bestPerformingStep: number
  worstPerformingStep: number
  steps: StepPerformance[]
  weeklyData: { week: string; contacts: number; conversions: number }[]
}

const samplePerformance: SequencePerformance = {
  id: "seq-1",
  name: "Executive Brief Outreach",
  type: "Executive Brief",
  totalContacts: 150,
  activeContacts: 47,
  completedContacts: 103,
  totalTouches: 523,
  openRate: 68,
  replyRate: 24,
  bookingRate: 15,
  conversionRate: 19,
  avgTimeToBook: "8.5 days",
  bestPerformingStep: 3,
  worstPerformingStep: 5,
  steps: [
    { step: 1, label: "Initial Email", type: "email", sent: 150, opened: 102, replied: 28, booked: 5, openRate: 68, replyRate: 18.7, bookingRate: 3.3 },
    { step: 2, label: "LinkedIn Touch", type: "linkedin", sent: 130, opened: 91, replied: 22, booked: 4, openRate: 70, replyRate: 16.9, bookingRate: 3.1 },
    { step: 3, label: "Follow-up Email", type: "email", sent: 110, opened: 78, replied: 26, booked: 9, openRate: 71, replyRate: 23.6, bookingRate: 8.2 },
    { step: 4, label: "Value Add Email", type: "email", sent: 85, opened: 54, replied: 18, booked: 4, openRate: 63.5, replyRate: 21.2, bookingRate: 4.7 },
    { step: 5, label: "Break-up Email", type: "email", sent: 65, opened: 32, replied: 7, booked: 2, openRate: 49.2, replyRate: 10.8, bookingRate: 3.1 },
  ],
  weeklyData: [
    { week: "W1", contacts: 40, conversions: 3 },
    { week: "W2", contacts: 55, conversions: 6 },
    { week: "W3", contacts: 30, conversions: 8 },
    { week: "W4", contacts: 25, conversions: 5 },
    { week: "W5", contacts: 20, conversions: 3 },
    { week: "W6", contacts: 15, conversions: 2 },
  ],
}

const allSequences = [
  { id: "seq-1", name: "Executive Brief Outreach", type: "Executive Brief", performance: samplePerformance },
  { id: "seq-2", name: "Webinar Invitation Sequence", type: "Webinar Outreach", performance: { ...samplePerformance, id: "seq-2", name: "Webinar Invitation", openRate: 55, replyRate: 12, bookingRate: 8, conversionRate: 10 } },
  { id: "seq-3", name: "Re-engagement Campaign", type: "Re-engagement", performance: { ...samplePerformance, id: "seq-3", name: "Re-engagement", openRate: 42, replyRate: 15, bookingRate: 6, conversionRate: 7 } },
]

export function SequencePerformanceAnalytics() {
  const [selectedSequenceId, setSelectedSequenceId] = useState("seq-1")
  const [timeRange, setTimeRange] = useState("30d")

  const performance = allSequences.find((s) => s.id === selectedSequenceId)?.performance || samplePerformance

  const maxConversion = Math.max(...performance.steps.map((s) => s.bookingRate))

  const getTrendIcon = (rate: number, threshold: number) => {
    if (rate >= threshold) return <ArrowUpRight className="h-4 w-4 text-success" />
    if (rate < threshold * 0.7) return <ArrowDownRight className="h-4 w-4 text-error" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent-fuchsia/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-accent-fuchsia" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sequence Performance</h2>
                <p className="text-sm text-muted-foreground">
                  Analytics for outreach sequences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSequenceId} onValueChange={setSelectedSequenceId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select sequence" />
                </SelectTrigger>
                <SelectContent>
                  {allSequences.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <KpiCard
              label="Open Rate"
              value={`${performance.openRate}%`}
              trend={performance.openRate >= 60 ? "up" : "down"}
              icon={<Eye className="h-5 w-5" />}
              color="blue"
            />
            <KpiCard
              label="Reply Rate"
              value={`${performance.replyRate}%`}
              trend={performance.replyRate >= 20 ? "up" : "neutral"}
              icon={<Reply className="h-5 w-5" />}
              color="green"
            />
            <KpiCard
              label="Booking Rate"
              value={`${performance.bookingRate}%`}
              trend={performance.bookingRate >= 10 ? "up" : "down"}
              icon={<Calendar className="h-5 w-5" />}
              color="purple"
            />
            <KpiCard
              label="Avg Time to Book"
              value={performance.avgTimeToBook}
              trend="neutral"
              icon={<Clock className="h-5 w-5" />}
              color="amber"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step-by-Step Performance</CardTitle>
          <CardDescription>
            Engagement and conversion rates by sequence step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.steps.map((step) => (
              <div key={step.step} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-fuchsia/10 flex items-center justify-center text-sm font-bold text-accent-fuchsia">
                      {step.step}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.label}</p>
                      <Badge variant="outline" className="text-xs mt-0.5 capitalize">
                        {step.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold">{step.sent}</p>
                      <p className="text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{step.opened}</p>
                      <p className="text-xs text-muted-foreground">Opened</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{step.replied}</p>
                      <p className="text-xs text-muted-foreground">Replied</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">{step.booked}</p>
                      <p className="text-xs text-muted-foreground">Booked</p>
                    </div>
                  </div>
                </div>

                {/* Bar visualization */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Open Rate</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${step.openRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">{step.openRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Reply Rate</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${step.replyRate * 2}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">{step.replyRate}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Booking Rate</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          step.bookingRate >= 5 ? "bg-success" : "bg-warning"
                        )}
                        style={{ width: `${step.bookingRate * 4}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">{step.bookingRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend + Best/Worst */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weekly Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly Conversion Trend</CardTitle>
            <CardDescription>Contacts added and conversions by week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {performance.weeklyData.map((week) => {
                const maxContacts = Math.max(...performance.weeklyData.map((w) => w.contacts))
                const heightContacts = (week.contacts / maxContacts) * 100
                const heightConversions = (week.conversions / Math.max(...performance.weeklyData.map((w) => w.conversions))) * 100
                return (
                  <Tooltip key={week.week}>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end gap-0.5 h-28">
                          <div
                            className="flex-1 bg-blue-400 rounded-t-sm transition-all hover:bg-blue-500"
                            style={{ height: `${heightContacts}%` }}
                          />
                          <div
                            className="flex-1 bg-success rounded-t-sm transition-all hover:bg-green-600"
                            style={{ height: `${heightConversions}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{week.week}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Contacts: {week.contacts}</p>
                      <p>Conversions: {week.conversions}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-sm" />
                <span className="text-xs text-muted-foreground">Contacts Added</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-sm" />
                <span className="text-xs text-muted-foreground">Conversions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best & Worst Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">Best Performing</span>
              </div>
              <p className="text-sm font-medium">
                Step {performance.bestPerformingStep}: {performance.steps[performance.bestPerformingStep - 1]?.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {performance.steps[performance.bestPerformingStep - 1]?.bookingRate}% booking rate
              </p>
            </div>

            <div className="p-3 bg-error/5 border border-error/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-error" />
                <span className="text-sm font-semibold text-error">Drop-off Point</span>
              </div>
              <p className="text-sm font-medium">
                Step {performance.worstPerformingStep}: {performance.steps[performance.worstPerformingStep - 1]?.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {performance.steps[performance.worstPerformingStep - 1]?.bookingRate}% booking rate
              </p>
            </div>

            <div className="p-3 bg-accent-fuchsia/5 border border-accent-fuchsia/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-accent-fuchsia" />
                <span className="text-sm font-semibold text-accent-fuchsia">Overall</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Contacts</p>
                  <p className="font-semibold">{performance.totalContacts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-semibold">{performance.completedContacts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Touches</p>
                  <p className="font-semibold">{performance.totalTouches}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Conv. Rate</p>
                  <p className="font-semibold">{performance.conversionRate}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  trend,
  icon,
  color,
}: {
  label: string
  value: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "amber"
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }

  const trendIcon = trend === "up" ? (
    <ArrowUpRight className="h-4 w-4 text-success" />
  ) : trend === "down" ? (
    <ArrowDownRight className="h-4 w-4 text-error" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground" />
  )

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          {icon}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs">
              {trendIcon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {trend === "up" ? "Above benchmark" : trend === "down" ? "Below benchmark" : "On par"}
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-2xl font-bold mt-3">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}