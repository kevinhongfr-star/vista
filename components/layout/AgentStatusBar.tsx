"use client"

import { cn } from "@/lib/utils"
import { Activity, Mail, BarChart3, Brain } from "lucide-react"

interface AgentStatus {
  name: string
  icon: React.ReactNode
  status: 'idle' | 'running' | 'error'
  lastRun?: string
}

const agents: AgentStatus[] = [
  { name: 'LENS', icon: <Activity className="h-4 w-4" />, status: 'idle', lastRun: '2 hours ago' },
  { name: 'MARIA', icon: <Mail className="h-4 w-4" />, status: 'idle', lastRun: '5 mins ago' },
  { name: 'PROBE', icon: <BarChart3 className="h-4 w-4" />, status: 'idle', lastRun: '1 hour ago' },
  { name: 'CARL', icon: <Brain className="h-4 w-4" />, status: 'idle', lastRun: '3 hours ago' },
]

const statusColors = {
  idle: 'text-muted-foreground',
  running: 'text-success animate-pulse',
  error: 'text-error',
}

export function AgentStatusBar() {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg">
      <span className="text-xs font-medium text-muted-foreground">Agents:</span>
      {agents.map((agent) => (
        <div key={agent.name} className="flex items-center gap-1.5">
          <span className={cn(statusColors[agent.status])}>
            {agent.icon}
          </span>
          <span className="text-xs font-medium">{agent.name}</span>
          {agent.lastRun && (
            <span className="text-xs text-muted-foreground">{agent.lastRun}</span>
          )}
        </div>
      ))}
    </div>
  )
}