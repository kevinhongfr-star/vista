"use client"

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
import { Settings, Bell, Activity, Shield, Database, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Scoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring Configuration</CardTitle>
          <CardDescription>
            Configure LENS scoring weights and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Stain Score Weight</Label>
              <Badge variant="secondary">25% (0–25)</Badge>
            </div>
            <div className="space-y-2">
              <Label>Cluster Score Weight</Label>
              <Badge variant="secondary">25% (0–25)</Badge>
            </div>
            <div className="space-y-2">
              <Label>Signal Score Weight</Label>
              <Badge variant="secondary">25% (0–25)</Badge>
            </div>
            <div className="space-y-2">
              <Label>Engagement Score Weight</Label>
              <Badge variant="secondary">25% (0–25)</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Engagement Tier Thresholds</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="text-center p-2 border rounded">
                <Badge variant="cold" className="mb-2">Cold</Badge>
                <div className="text-xs text-muted-foreground">0–20</div>
              </div>
              <div className="text-center p-2 border rounded">
                <Badge variant="warm" className="mb-2">Warm</Badge>
                <div className="text-xs text-muted-foreground">20–40</div>
              </div>
              <div className="text-center p-2 border rounded">
                <Badge variant="engaged" className="mb-2">Engaged</Badge>
                <div className="text-xs text-muted-foreground">40–60</div>
              </div>
              <div className="text-center p-2 border rounded">
                <Badge variant="hot" className="mb-2">Hot</Badge>
                <div className="text-xs text-muted-foreground">60–80</div>
              </div>
              <div className="text-center p-2 border rounded">
                <Badge variant="committed" className="mb-2">Committed</Badge>
                <div className="text-xs text-muted-foreground">80–100</div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Decay Flag Threshold</Label>
            <Input type="number" defaultValue={30} className="max-w-[200px]" />
            <p className="text-xs text-muted-foreground">
              Contacts with no engagement for this many days will be flagged as stale
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Agent Configuration */}
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
              <Select defaultValue="semi-auto">
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
              <Select defaultValue="draft">
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
            <Label>Scoring Schedule</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="text" defaultValue="Monday 07:00" className="max-w-[200px]" />
              <p className="text-xs text-muted-foreground">
                Weekly full scoring pass
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
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
            <Select defaultValue="enabled">
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
            <Select defaultValue="enabled">
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
            <Select defaultValue="enabled">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
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

          <Button variant="outline">
            Run Schema Migration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}