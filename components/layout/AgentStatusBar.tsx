"use client"

import { cn } from "@/lib/utils"
import { Activity, Mail, BarChart3, Brain } from "lucide-react"
import type { AgentAction } from "@/components/dashboard/QuickActions"

interface AgentStatusBarProps {
  statuses: Record<AgentAction, string>
  activeAgent: AgentAction | null
}

const AGENT_ICONS: Record<AgentAction, React.ReactNode> = {
  lens: <Activity className="h-4 w-4" />,
  maria: <Mail className="h-4 w-4" />,
  probe: <BarChart3 className="h-4 w-4" />,
  carl: <Brain className="h-4 w-4" />,
}

const AGENT_NAMES: Record<AgentAction, string> = {
  lens: "LENS",
  maria: "MARIA",
  probe: "PROBE",
  carl: "CARL",
}

export function AgentStatusBar({
  statuses,
  activeAgent,
}: AgentStatusBarProps) {
  const agents = Object.keys(AGENT_NAMES) as AgentAction[]

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg flex-wrap">
      <span className="text-xs font-medium text-muted-foreground">
        Agents:
      </span>
      {agents.map((agent) => {
        const isActive = activeAgent === agent
        const isDispatched = statuses[agent] !== "Never run"

        return (
          <div key={agent} className="flex items-center gap-1.5">
            <span
              className={cn(
                isActive
                  ? "text-success animate-pulse"
                  : isDispatched
                    ? "text-success"
                    : "text-muted-foreground"
              )}
            >
              {AGENT_ICONS[agent]}
            </span>
            <span className="text-xs font-medium">{AGENT_NAMES[agent]}</span>
            <span
              className={cn(
                "text-xs",
                isActive
                  ? "text-success"
                  : isDispatched
                    ? "text-muted-foreground"
                    : "text-warning"
              )}
            >
              {isActive ? `Sending...` : statuses[agent]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
