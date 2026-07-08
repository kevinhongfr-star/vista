"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Settings, 
  Bell, 
  Activity, 
  Shield, 
  Database, 
  RefreshCw,
  Loader2,
  Download,
  Zap
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToasts, Toaster } from "@/components/ui/toast"

interface SettingsData {
  id?: string
  stain_weight: number
  cluster_weight: number
  signal_weight: number
  engagement_weight: number
  cold_threshold: number
  warm_threshold: number
  engaged_threshold: number
  hot_threshold: number
  committed_threshold: number
  decay_flag_days: number
  lens_mode: string
  maria_mode: string
  scoring_schedule: string
  threshold_alerts: string
  decay_alerts: string
  weekly_digest: string
  updated_at?: string | null
}

const DEFAULT_SETTINGS: SettingsData = {
  stain_weight: 25,
  cluster_weight: 25,
  signal_weight: 25,
  engagement_weight: 25,
  cold_threshold: 20,
  warm_threshold: 40,
  engaged_threshold: 60,
  hot_threshold: 80,
  committed_threshold: 100,
  decay_flag_days: 30,
  lens_mode: "semi-auto",
  maria_mode: "draft",
  scoring_schedule: "Monday 07:00",
  threshold_alerts: "enabled",
  decay_alerts: "enabled",
  weekly_digest: "enabled",
}

export default function SettingsPage() {
  const { toasts, addToast, dismissToast } = useToasts()
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS)
  const [scoringLoading, setScoringLoading] = useState(false)
  const [agentLoading, setAgentLoading] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [probeLoading, setProbeLoading] = useState(false)
  const [lensLoading, setLensLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      // Use defaults
    } finally {
      setInitialLoading(false)
    }
  }

  const saveScoringConfig = async () => {
    setScoringLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stain_weight: settings.stain_weight,
          cluster_weight: settings.cluster_weight,
          signal_weight: settings.signal_weight,
          engagement_weight: settings.engagement_weight,
          cold_threshold: settings.cold_threshold,
          warm_threshold: settings.warm_threshold,
          engaged_threshold: settings.engaged_threshold,
          hot_threshold: settings.hot_threshold,
          committed_threshold: settings.committed_threshold,
          decay_flag_days: settings.decay_flag_days,
        }),
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", "Scoring configuration saved successfully")
      } else {
        addToast("error", data.error || "Failed to save scoring configuration")
      }
    } catch (error) {
      addToast("error", "Failed to save scoring configuration")
    } finally {
      setScoringLoading(false)
    }
  }

  const saveAgentConfig = async () => {
    setAgentLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lens_mode: settings.lens_mode,
          maria_mode: settings.maria_mode,
          scoring_schedule: settings.scoring_schedule,
        }),
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", "Agent configuration saved successfully")
      } else {
        addToast("error", data.error || "Failed to save agent configuration")
      }
    } catch (error) {
      addToast("error", "Failed to save agent configuration")
    } finally {
      setAgentLoading(false)
    }
  }

  const saveNotifications = async () => {
    setNotificationsLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threshold_alerts: settings.threshold_alerts,
          decay_alerts: settings.decay_alerts,
          weekly_digest: settings.weekly_digest,
        }),
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", "Notification preferences saved successfully")
      } else {
        addToast("error", data.error || "Failed to save notification preferences")
      }
    } catch (error) {
      addToast("error", "Failed to save notification preferences")
    } finally {
      setNotificationsLoading(false)
    }
  }

  const triggerProbe = async () => {
    setProbeLoading(true)
    try {
      const response = await fetch("/api/trigger/probe", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", "PROBE agent triggered successfully")
      } else {
        addToast("error", data.error || "Failed to trigger PROBE agent")
      }
    } catch (error) {
      addToast("error", "Failed to trigger PROBE agent")
    } finally {
      setProbeLoading(false)
    }
  }

  const triggerLens = async () => {
    setLensLoading(true)
    try {
      const response = await fetch("/api/trigger/lens", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", "LENS agent triggered successfully")
      } else {
        addToast("error", data.error || "Failed to trigger LENS agent")
      }
    } catch (error) {
      addToast("error", "Failed to trigger LENS agent")
    } finally {
      setLensLoading(false)
    }
  }

  const exportContacts = async () => {
    setExportLoading(true)
    try {
      const response = await fetch("/api/contacts/export")
      
      if (!response.ok) {
        const data = await response.json()
        addToast("error", data.error || "Failed to export contacts")
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vista_contacts_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      addToast("success", "Contacts exported successfully")
    } catch (error) {
      addToast("error", "Failed to export contacts")
    } finally {
      setExportLoading(false)
    }
  }

  const handleWeightChange = (field: keyof SettingsData, value: string) => {
    const numValue = parseInt(value) || 0
    setSettings(prev => ({ ...prev, [field]: Math.min(100, Math.max(0, numValue)) }))
  }

  const totalWeight = 
    settings.stain_weight + 
    settings.cluster_weight + 
    settings.signal_weight + 
    settings.engagement_weight

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scoring Configuration</CardTitle>
          <CardDescription>
            Configure LENS scoring weights and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Score Weights</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="stain-weight" className="text-sm">Stain Score Weight</Label>
                <Input
                  id="stain-weight"
                  type="number"
                  value={settings.stain_weight}
                  onChange={(e) => handleWeightChange("stain_weight", e.target.value)}
                  min={0}
                  max={100}
                />
                <Badge variant="secondary">{settings.stain_weight}% (0–{settings.stain_weight})</Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster-weight" className="text-sm">Cluster Score Weight</Label>
                <Input
                  id="cluster-weight"
                  type="number"
                  value={settings.cluster_weight}
                  onChange={(e) => handleWeightChange("cluster_weight", e.target.value)}
                  min={0}
                  max={100}
                />
                <Badge variant="secondary">{settings.cluster_weight}% (0–{settings.cluster_weight})</Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signal-weight" className="text-sm">Signal Score Weight</Label>
                <Input
                  id="signal-weight"
                  type="number"
                  value={settings.signal_weight}
                  onChange={(e) => handleWeightChange("signal_weight", e.target.value)}
                  min={0}
                  max={100}
                />
                <Badge variant="secondary">{settings.signal_weight}% (0–{settings.signal_weight})</Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="engagement-weight" className="text-sm">Engagement Score Weight</Label>
                <Input
                  id="engagement-weight"
                  type="number"
                  value={settings.engagement_weight}
                  onChange={(e) => handleWeightChange("engagement_weight", e.target.value)}
                  min={0}
                  max={100}
                />
                <Badge variant="secondary">{settings.engagement_weight}% (0–{settings.engagement_weight})</Badge>
              </div>
            </div>
            <p className={cn("text-xs mt-2", totalWeight !== 100 ? "text-error" : "text-muted-foreground")}>
              Total: {totalWeight}% {totalWeight !== 100 && "(should equal 100%)"}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Engagement Tier Thresholds</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="text-center p-2 border rounded space-y-2">
                <Badge variant="cold">Cold</Badge>
                <Input
                  type="number"
                  value={settings.cold_threshold}
                  onChange={(e) => handleWeightChange("cold_threshold", e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="text-center p-2 border rounded space-y-2">
                <Badge variant="warm">Warm</Badge>
                <Input
                  type="number"
                  value={settings.warm_threshold}
                  onChange={(e) => handleWeightChange("warm_threshold", e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="text-center p-2 border rounded space-y-2">
                <Badge variant="engaged">Engaged</Badge>
                <Input
                  type="number"
                  value={settings.engaged_threshold}
                  onChange={(e) => handleWeightChange("engaged_threshold", e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="text-center p-2 border rounded space-y-2">
                <Badge variant="hot">Hot</Badge>
                <Input
                  type="number"
                  value={settings.hot_threshold}
                  onChange={(e) => handleWeightChange("hot_threshold", e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="text-center p-2 border rounded space-y-2">
                <Badge variant="committed">Committed</Badge>
                <Input
                  type="number"
                  value={settings.committed_threshold}
                  onChange={(e) => handleWeightChange("committed_threshold", e.target.value)}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label htmlFor="decay-days">Decay Flag Threshold</Label>
            <Input
              id="decay-days"
              type="number"
              value={settings.decay_flag_days}
              onChange={(e) => handleWeightChange("decay_flag_days", e.target.value)}
              className="max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Contacts with no engagement for this many days will be flagged as stale
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveScoringConfig} disabled={scoringLoading} className="gap-2">
              {scoringLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>
            Configure agent execution modes and schedules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <Label>LENS Mode</Label>
              </div>
              <Select
                value={settings.lens_mode}
                onValueChange={(value) => setSettings(prev => ({ ...prev, lens_mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="semi-auto">Semi-Auto (Phase 1)</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Phase 1: Semi-auto mode with manual trigger
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <Label>MARIA Mode</Label>
              </div>
              <Select
                value={settings.maria_mode}
                onValueChange={(value) => setSettings(prev => ({ ...prev, maria_mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft Only (Phase 1)</SelectItem>
                  <SelectItem value="semi-auto">Semi-Auto</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Phase 1: Draft mode, Kevin approves all
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label htmlFor="scoring-schedule">Scoring Schedule</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="scoring-schedule"
                type="text"
                value={settings.scoring_schedule}
                onChange={(e) => setSettings(prev => ({ ...prev, scoring_schedule: e.target.value }))}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Weekly full scoring pass
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveAgentConfig} disabled={agentLoading} className="gap-2">
              {agentLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <Label>Threshold Crossing Alerts</Label>
            </div>
            <Select
              value={settings.threshold_alerts}
              onValueChange={(value) => setSettings(prev => ({ ...prev, threshold_alerts: value }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <Label>Decay Flag Alerts</Label>
            </div>
            <Select
              value={settings.decay_alerts}
              onValueChange={(value) => setSettings(prev => ({ ...prev, decay_alerts: value }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <Label>Weekly Digest</Label>
            </div>
            <Select
              value={settings.weekly_digest}
              onValueChange={(value) => setSettings(prev => ({ ...prev, weekly_digest: value }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={saveNotifications} disabled={notificationsLoading} className="gap-2">
              {notificationsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
          <CardDescription>
            Supabase connection and data status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <Label>Connection</Label>
            </div>
            <Badge variant="secondary">Connected</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <Label>Schema Migration</Label>
            </div>
            <Badge variant="secondary">Pending</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <Label>vista_contacts Records</Label>
            </div>
            <Badge variant="secondary">17,359</Badge>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={triggerProbe} disabled={probeLoading} className="gap-2">
              {probeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Refresh PROBE Data
            </Button>
            <Button variant="outline" onClick={triggerLens} disabled={lensLoading} className="gap-2">
              {lensLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh LENS Scores
            </Button>
            <Button variant="outline" onClick={exportContacts} disabled={exportLoading} className="gap-2">
              {exportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Data (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
