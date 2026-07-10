"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, Zap, Search, Circle } from "lucide-react"
import { AgentTriggerButton } from "@/components/intelligence/agent-trigger-button"
import type { AgentName, AgentStatus as AgentStatusType } from "@/lib/types"

const AGENT_CONFIG: Array<{
  name: AgentName
  icon: React.ReactNode
  description: string
  defaultTrigger: Record<string, unknown>
}> = [
  {
    name: "LENS",
    icon: <Target className="h-4 w-4" />,
    description: "Contact scoring agent",
    defaultTrigger: { scope: "decayed" },
  },
  {
    name: "MARIA",
    icon: <Zap className="h-4 w-4" />,
    description: "Campaign drafting agent",
    defaultTrigger: { scope: "all" },
  },
  {
    name: "PROBE",
    icon: <Search className="h-4 w-4" />,
    description: "Pipeline analysis agent",
    defaultTrigger: { type: "refresh" },
  },
  {
    name: "CARL",
    icon: <Brain className="h-4 w-4" />,
    description: "Strategic analysis agent",
    defaultTrigger: { type: "strategic-review" },
  },
]

function getStatusFromTimestamp(lastOutputAt?: string): "online" | "idle" | "offline" {
  if (!lastOutputAt) return "offline"

  const diff = Date.now() - new Date(lastOutputAt).getTime()
  const THIRTY_MINUTES = 30 * 60 * 1000
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

  if (diff < THIRTY_MINUTES) return "online"
  if (diff < TWENTY_FOUR_HOURS) return "idle"
  return "offline"
}

const STATUS_COLORS = {
  online: "text-success fill-success",
  idle: "text-warning fill-warning",
  offline: "text-muted-foreground fill-muted-foreground",
}

export function AgentStatusPanel() {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusType[]>(() =>
    AGENT_CONFIG.map((config) => ({
      agent: config.name,
      status: "offline" as const,
    }))
  )

  useEffect(() => {
    // Fetch latest output time for each agent
    const fetchStatuses = async () => {
      const statuses = await Promise.all(
        AGENT_CONFIG.map(async (config) => {
          try {
            const res = await fetch(`/api/agents/${config.name}/outputs?limit=1`)
            const data = await res.json()
            const lastOutput = data.outputs?.[0]

            return {
              agent: config.name,
              status: getStatusFromTimestamp(lastOutput?.created_at),
              last_output_at: lastOutput?.created_at,
              last_output_summary: lastOutput?.raw_message?.slice(0, 50),
            }
          } catch {
            return {
              agent: config.name,
              status: "offline" as const,
            }
          }
        })
      )

      setAgentStatuses(statuses)
    }

    fetchStatuses()
    const interval = setInterval(fetchStatuses, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {AGENT_CONFIG.map((config) => {
            const status = agentStatuses.find((s) => s.agent === config.name)
            const statusColor = STATUS_COLORS[status?.status || "offline"]

            return (
              <div
                key={config.name}
                className="border rounded-none p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Circle className={`h-2 w-2 ${statusColor}`} />
                    <span className="font-medium text-sm">{config.name}</span>
                  </div>
                  {status?.last_output_at && (
                    <span className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - new Date(status.last_output_at).getTime()) / 60000)}m
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
                <AgentTriggerButton
                  agent={config.name}
                  triggerData={config.defaultTrigger as Record<string, unknown>}
                  label="Trigger"
                  variant="outline"
                  size="sm"
                  showIcon={false}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}