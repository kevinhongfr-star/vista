"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart3, Users, TrendingUp, Timer, Target } from "lucide-react"

interface B2CAnalyticsPageProps {
  leads: any[]
  conversions: any[]
}

export function B2CAnalyticsPage({ leads, conversions }: B2CAnalyticsPageProps) {
  const [period, setPeriod] = useState("30d")

  const stats = useMemo(() => {
    let days = 30
    if (period === "7d") days = 7
    if (period === "90d") days = 90
    if (period === "1y") days = 365

    const since = Date.now() - days * 24 * 60 * 60 * 1000
    const periodConversions = conversions.filter(
      (c) => new Date(c.converted_at).getTime() >= since
    )

    const total = leads.length
    const flagged = leads.filter((l) => l.b2b_score_label === "high_priority").length
    const watch = leads.filter((l) => l.b2b_score_label === "watch").length
    const monitor = leads.filter((l) => l.b2b_score_label === "monitor").length
    const low = leads.filter((l) => l.b2b_score_label === "low"). length
    const promoted = leads.filter((l) => l.pipeline_stage === "promoted").length

    const conversionRate = flagged > 0 ? Math.round((promoted / flagged) * 100) : 0

    const avgScore =
      total > 0
        ? Math.round(leads.reduce((sum, l) => sum + (l.b2b_potential_score || 0), 0) / total)
        : 0

    const stageCounts: Record<string, number> = {}
    for (const l of leads) {
      const stage = l.pipeline_stage || "b2c_user"
      stageCounts[stage] = (stageCounts[stage] || 0) + 1
    }

    const avgTimeToConvert =
      periodConversions.length > 0
        ? Math.round(
            periodConversions.reduce((sum, c) => sum + (c.b2c_days_as_user || 0), 0) /
              periodConversions.length
          )
        : 0

    const totalB2CSpend = periodConversions.reduce(
      (sum, c) => sum + (c.b2c_total_spend_cny || 0),
      0
    )

    const b2bDealValue = periodConversions.reduce(
      (sum, c) => sum + (c.first_b2b_deal_value_cny || 0),
      0
    )

    return {
      total,
      flagged,
      watch,
      monitor,
      low,
      promoted,
      conversionRate,
      avgScore,
      stageCounts,
      avgTimeToConvert,
      totalB2CSpend,
      b2bDealValue,
      periodConversions: periodConversions.length,
    }
  }, [leads, conversions, period])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent-fuchsia" />
            B2C Analytics
          </h1>
          <p className="text-muted-foreground">B2C to B2B conversion analytics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.conversionRate}%</div>
            <div className="text-xs text-muted-foreground">
              {stats.promoted} promoted / {stats.flagged} flagged
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg B2B Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Avg Time to Convert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgTimeToConvert}d</div>
            <div className="text-xs text-muted-foreground">
              {stats.periodConversions} conversions this period
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Pipeline Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.stageCounts).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{stage.replace(/_/g, " ")}</span>
                  <span className="font-medium">
                    {count} ({stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>High Priority (80-100)</span>
                <span className="font-medium">{stats.flagged}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Watch (60-79)</span>
                <span className="font-medium">{stats.watch}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Monitor (40-59)</span>
                <span className="font-medium">{stats.monitor}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Low (0-39)</span>
                <span className="font-medium">{stats.low}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              B2C Spend (Converters)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.totalB2CSpend.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              B2B Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.b2bDealValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalB2CSpend > 0
                ? (stats.b2bDealValue / stats.totalB2CSpend).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
