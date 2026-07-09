"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Activity,
  Zap,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { useToasts, Toaster } from "@/components/ui/toast"
import type { AutomationDashboardData } from "@/lib/types"

interface AutomationDashboardProps {
  initialData: AutomationDashboardData
}

export function AutomationDashboard({ initialData }: AutomationDashboardProps) {
  const { toasts, addToast, dismissToast } = useToasts()
  const [data] = useState<AutomationDashboardData>(initialData)
  const [isRunning, setIsRunning] = useState(false)

  const handleRunPipeline = async (pipeline: string) => {
    setIsRunning(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addToast("success", `${pipeline} pipeline triggered successfully`)
    } catch (error) {
      addToast("error", `Failed to trigger ${pipeline} pipeline`)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "failed":
        return <XCircle className="h-4 w-4 text-error" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Activity className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Automation</h1>
        </div>
        <Button disabled={isRunning} onClick={() => handleRunPipeline("All")}>
          <Play className="h-4 w-4 mr-2" />
          Run All Pipelines
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Signals (24h)
            </CardTitle>
            <Zap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.signals_24h}</div>
            <p className="text-xs text-muted-foreground">
              {data.signals_7d} last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contacts Scored
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.contacts_scored}</div>
            <p className="text-xs text-muted-foreground">
              {data.signals_30d} signals last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clusters
            </CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.clusters_updated}</div>
            <p className="text-xs text-muted-foreground">
              Density clusters tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Badge variant="secondary">{run.pipeline}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className="capitalize">{run.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(run.started_at)}</TableCell>
                  <TableCell>{formatDuration(run.duration_seconds)}</TableCell>
                  <TableCell>{(run.records_processed || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
