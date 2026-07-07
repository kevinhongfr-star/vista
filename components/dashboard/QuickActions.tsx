"use client"

import { cn } from "@/lib/utils"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Activity, 
  Mail, 
  RefreshCw, 
  BarChart3, 
  AlertCircle,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onTriggerLens?: () => void
  onTriggerMaria?: () => void
  onTriggerProbe?: () => void
  isLoading?: boolean
}

export function QuickActions({ onTriggerLens, onTriggerMaria, onTriggerProbe, isLoading }: QuickActionsProps) {
  const actions = [
    {
      label: "Run LENS Scoring",
      description: "Recalculate all contact scores",
      icon: <Activity className="h-5 w-5" />,
      onClick: onTriggerLens,
      color: "bg-tier-warm/10 hover:bg-tier-warm/20 text-tier-warm",
    },
    {
      label: "Draft Outreach",
      description: "Generate MARIA drafts for hot contacts",
      icon: <Mail className="h-5 w-5" />,
      onClick: onTriggerMaria,
      color: "bg-tier-engaged/10 hover:bg-tier-engaged/20 text-tier-engaged",
    },
    {
      label: "Refresh Pipeline",
      description: "Update PROBE dashboard data",
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: onTriggerProbe,
      color: "bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold",
    },
  ]

  return (
    <div className="grid gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="ghost"
          className={cn("flex items-start gap-3 h-auto py-3 px-4", action.color)}
          onClick={action.onClick}
          disabled={isLoading}
        >
          <div className="mt-0.5">{action.icon}</div>
          <div className="flex flex-col items-start">
            <span className="font-medium">{action.label}</span>
            <span className="text-xs opacity-80">{action.description}</span>
          </div>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin ml-auto" />}
        </Button>
      ))}
    </div>
  )
}