"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"
import { TrendingUp, Package, Percent, PieChart as PieChartIcon, BarChart3 } from "lucide-react"

const TIER_COLORS = [
  "#64748b",
  "#94a3b8",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
]

export function RevenueDashboard() {
  const [period, setPeriod] = useState("monthly")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/revenue/dashboard?period=${period}`)
        const result = await response.json()
        setData(result)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  const totalRevenue = data?.revenue_by_tier?.reduce(
    (sum: number, t: { total_cny: number }) => sum + t.total_cny,
    0
  ) || 0

  const revenueByTierData = data?.revenue_by_tier?.map((t: { tier: number; tier_name: string; total_cny: number }) => ({
    name: t.tier_name,
    value: t.total_cny,
  })) || []

  const revenueByServiceData = data?.revenue_by_service?.slice(0, 8) || []

  const avgDealData = data?.avg_deal_size_by_tier
    ?.map((d: { tier: number; avg_cny: number }) => ({
      tier: `Tier ${d.tier}`,
      avg: d.avg_cny,
    }))
    .sort((a: { tier: string }, b: { tier: string }) => a.tier.localeCompare(b.tier, undefined, { numeric: true })) || []

  const pipelineData = data?.pipeline_value?.by_status
    ? Object.entries(data.pipeline_value.by_status).map(([status, value]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        value: value as number,
      }))
    : []

  const tierConversionData = data?.tier_conversion
    ?.map((c: { from_tier: number; to_tier: number; count: number; pct: number }) => ({
      name: `T${c.from_tier} → T${c.to_tier}`,
      count: c.count,
      pct: c.pct,
    }))
    .slice(0, 8) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track revenue, conversion, and pipeline performance
          </p>
        </div>
        <Tabs defaultValue={period} onValueChange={setPeriod} className="w-auto">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">¥{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline</p>
                <p className="text-xl font-bold">
                  ¥{(data?.pipeline_value?.total_proposals_cny || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Percent className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bundle Adoption</p>
                <p className="text-xl font-bold">
                  {Math.round((data?.bundle_adoption_rate || 0) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Discount</p>
                <p className="text-xl font-bold">
                  {data?.discount_utilization?.avg_discount_pct || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Revenue by Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/30 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenueByTierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {revenueByTierData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Revenue by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/30 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByServiceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="service_name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="total_cny" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Deal Size by Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/30 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={avgDealData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="tier" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, "Avg Deal"]}
                  />
                  <Bar dataKey="avg" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pipeline by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted/30 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, "Pipeline"]}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tier Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 bg-muted/30 rounded animate-pulse" />
          ) : tierConversionData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              No conversion data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tierConversionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "count") return [value, "Conversions"]
                    return [`${value}%`, "Rate"]
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Conversions" radius={[0, 4, 4, 0]} />
                <Bar dataKey="pct" fill="#f59e0b" name="%" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discount Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-20 bg-muted/30 rounded animate-pulse" />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{data?.discount_utilization?.total_deals || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Discount</p>
                <p className="text-2xl font-bold text-warning">
                  {data?.discount_utilization?.deals_with_discount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Discount</p>
                <p className="text-2xl font-bold text-info">
                  {data?.discount_utilization?.avg_discount_pct || 0}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}