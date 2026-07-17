"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Copy, RefreshCw, Settings2 } from "lucide-react"
import { useToasts } from "@/components/ui/toast"

interface B2CIntegrationSettingsProps {
  initialConfig: any
}

export function B2CIntegrationSettings({ initialConfig }: B2CIntegrationSettingsProps) {
  const { addToast } = useToasts()
  const [config, setConfig] = useState({
    api_key: process.env.NEXT_PUBLIC_B2C_INGEST_API_KEY || "",
    webhook_secret: process.env.NEXT_PUBLIC_B2C_WEBHOOK_SECRET || "",
    scoring_weights: initialConfig?.scoring_weights || null,
    alert_thresholds: initialConfig?.alert_thresholds || { high_priority: 80, watch: 60, monitor: 40 },
    alert_delivery: initialConfig?.alert_delivery || { in_app: true, feishu: false, email: false },
    dex_ai_portal_url: initialConfig?.dex_ai_portal_url || "",
    auto_promotion_enabled: initialConfig?.auto_promotion_enabled || false,
  })
  const [saving, setSaving] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    addToast("success", `${label} copied`)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/b2c-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error("Failed to save")
      addToast("success", "Settings saved")
    } catch (e) {
      addToast("error", String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-accent-fuchsia" />
        <h1 className="text-2xl font-bold tracking-tight">DEX AI Integration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">API Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>B2C Ingest API Key</Label>
            <div className="flex gap-2">
              <Input value={config.api_key} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(config.api_key, "API Key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set via B2C_INGEST_API_KEY environment variable on Vercel.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Webhook Secret</Label>
            <div className="flex gap-2">
              <Input value={config.webhook_secret} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(config.webhook_secret, "Webhook Secret")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set via B2C_WEBHOOK_SECRET environment variable on Vercel.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Alert Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>High Priority</Label>
              <Input
                type="number"
                value={config.alert_thresholds.high_priority}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    alert_thresholds: {
                      ...prev.alert_thresholds,
                      high_priority: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Watch</Label>
              <Input
                type="number"
                value={config.alert_thresholds.watch}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    alert_thresholds: {
                      ...prev.alert_thresholds,
                      watch: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Monitor</Label>
              <Input
                type="number"
                value={config.alert_thresholds.monitor}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    alert_thresholds: {
                      ...prev.alert_thresholds,
                      monitor: parseInt(e.target.value),
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Alert Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>In-App Notifications</Label>
            <Switch
              checked={config.alert_delivery.in_app}
              onCheckedChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  alert_delivery: { ...prev.alert_delivery, in_app: v },
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Feishu Notifications</Label>
            <Switch
              checked={config.alert_delivery.feishu}
              onCheckedChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  alert_delivery: { ...prev.alert_delivery, feishu: v },
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={config.alert_delivery.email}
              onCheckedChange={(v) =>
                setConfig((prev) => ({
                  ...prev,
                  alert_delivery: { ...prev.alert_delivery, email: v },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Auto-Promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-promote high-scoring leads</Label>
              <p className="text-xs text-muted-foreground">
                Automatically create B2B contacts when score ≥ 90 + coaching booked
              </p>
            </div>
            <Switch
              checked={config.auto_promotion_enabled}
              onCheckedChange={(v) =>
                setConfig((prev) => ({ ...prev, auto_promotion_enabled: v }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          <RefreshCw className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`} />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
