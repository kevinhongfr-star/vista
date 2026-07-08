"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Activity,
  Mail,
  RefreshCw,
  BarChart3,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type AgentAction = "lens" | "maria" | "probe" | "carl"

interface QuickActionsProps {
  onTrigger: (agent: AgentAction) => void
  loadingAgent: AgentAction | null
}

export function QuickActions({
  onTrigger,
  loadingAgent,
}: QuickActionsProps) {
  const actions: {
    agent: AgentAction
    label: string
    description: string
    icon: React.ReactNode
    color: string
  }[] = [
    {
      agent: "lens",
      label: "Run LENS Scoring",
      description: "Recalculate all contact scores",
      icon: <Activity className="h-5 w-5" />,
      color: "bg-tier-warm/10 hover:bg-tier-warm/20 text-tier-warm",
    },
    {
      agent: "maria",
      label: "Generate MARIA Drafts",
      description: "Draft outreach for hot contacts",
      icon: <Mail className="h-5 w-5" />,
      color: "bg-tier-engaged/10 hover:bg-tier-engaged/20 text-tier-engaged",
    },
    {
      agent: "probe",
      label: "Refresh PROBE Pipeline",
      description: "Update pipeline & encirclement data",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold",
    },
    {
      agent: "carl",
      label: "Request CARL Analysis",
      description: "Review strategic notes & score deltas",
      icon: <Brain className="h-5 w-5" />,
      color: "bg-primary-navy/10 hover:bg-primary-navy/20 text-primary-navy",
    },
  ]

  return (
    <div className="grid gap-3">
      {actions.map((action) => {
        const isLoading = loadingAgent === action.agent
        return (
          <Button
            key={action.agent}
            variant="ghost"
            className={cn(
              "flex items-start gap-3 h-auto py-3 px-4",
              action.color
            )}
            onClick={() => onTrigger(action.agent)}
            disabled={loadingAgent !== null}
          >
            <div className="mt-0.5">{action.icon}</div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{action.label}</span>
              <span className="text-xs opacity-80">{action.description}</span>
            </div>
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin ml-auto" />
            )}
          </Button>
        )
      })}
    </div>
  )
}
