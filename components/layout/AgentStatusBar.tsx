"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Activity, Mail, BarChart3, Brain, RefreshCw } from "lucide-react"

interface AgentStatus {
  name: string
  icon: React.ReactNode
  status: 'idle' | 'running' | 'error' | 'never-run'
  lastRun?: string
}

export function AgentStatusBar() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { name: 'LENS', icon: <Activity className="h-4 w-4" />, status: 'never-run', lastRun: 'Never' },
    { name: 'MARIA', icon: <Mail className="h-4 w-4" />, status: 'never-run', lastRun: 'Never' },
    { name: 'PROBE', icon: <BarChart3 className="h-4 w-4" />, status: 'never-run', lastRun: 'Never' },
    { name: 'CARL', icon: <Brain className="h-4 w-4" />, status: 'never-run', lastRun: 'Never' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()

        if (data.status === 'ok') {
          // Check if scores have been calculated (post-migration state)
          if (data.pipeline && data.pipeline.length > 0) {
            setAgents(prev => prev.map(a => ({
              ...a,
              status: 'idle',
              lastRun: 'Recently'
            })))
          }
        }
      } catch (e) {
        console.log('Could not fetch agent status')
      } finally {
        setLoading(false)
      }
    }

    fetchAgentStatus()
  }, [])

  const statusColors = {
    idle: 'text-muted-foreground',
    running: 'text-success animate-pulse',
    error: 'text-error',
    'never-run': 'text-warning',
  }

  const statusLabels = {
    idle: 'Ready',
    running: 'Running',
    error: 'Error',
    'never-run': 'Never Run',
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg">
      <span className="text-xs font-medium text-muted-foreground">Agents:</span>
      {agents.map((agent) => (
        <div key={agent.name} className="flex items-center gap-1.5">
          <span className={cn(statusColors[agent.status])}>
            {agent.icon}
          </span>
          <span className="text-xs font-medium">{agent.name}</span>
          <span className={cn("text-xs", statusColors[agent.status])}>
            {statusLabels[agent.status]}
          </span>
        </div>
      ))}
      {loading && (
        <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin ml-auto" />
      )}
    </div>
  )
}