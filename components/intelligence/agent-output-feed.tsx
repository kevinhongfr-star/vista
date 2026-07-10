"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToasts } from "@/components/ui/toast"
import { Brain, Target, Zap, Search, RefreshCw } from "lucide-react"
import { subscribeToAgentOutputs } from "@/lib/supabase/realtime"
import type { AgentName, AgentOutput } from "@/lib/types"

const AGENT_ICONS: Record<AgentName, React.ReactNode> = {
  LENS: <Target className="h-4 w-4" />,
  MARIA: <Zap className="h-4 w-4" />,
  PROBE: <Search className="h-4 w-4" />,
  CARL: <Brain className="h-4 w-4" />,
}

const AGENT_COLORS: Record<AgentName, string> = {
  LENS: "text-info",
  MARIA: "text-warning",
  PROBE: "text-success",
  CARL: "text-fuchsia-500",
}

interface AgentOutputFeedProps {
  agent?: AgentName
  limit?: number
  showAgent?: boolean
}

export function AgentOutputFeed({ agent, limit = 10, showAgent = true }: AgentOutputFeedProps) {
  const [outputs, setOutputs] = useState<AgentOutput[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToasts()
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null)

  const fetchOutputs = async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit * 2) })
      const url = agent ? `/api/agents/${agent}/outputs?${params}` : `/api/agents/LENS/outputs?${params}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setOutputs(result.outputs || [])
      }
    } catch (error) {
      console.error("Failed to fetch agent outputs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOutputs()

    // Subscribe to realtime updates
    realtimeUnsubscribeRef.current = subscribeToAgentOutputs((payload) => {
      if (payload.new) {
        const newOutput = payload.new as unknown as AgentOutput
        if (!agent || newOutput.agent === agent) {
          setOutputs((prev) => [newOutput, ...prev].slice(0, limit * 2))
          addToast("success", `${newOutput.agent}: New output received`)
        }
      }
    })

    return () => realtimeUnsubscribeRef.current?.()
  }, [agent, limit])

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "just now"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
          Loading agent outputs...
        </CardContent>
      </Card>
    )
  }

  if (outputs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No agent outputs yet. Trigger an agent to see responses here.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {agent && AGENT_ICONS[agent]}
          {agent ? `${agent} Outputs` : "Agent Outputs"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-3">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  {showAgent && (
                    <Badge variant="outline" className={AGENT_COLORS[output.agent]}>
                      <span className="flex items-center gap-1">
                        {AGENT_ICONS[output.agent]}
                        {output.agent}
                      </span>
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(output.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {output.raw_message || "No message content"}
                </p>
                {output.parsed_data && Object.keys(output.parsed_data).length > 1 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Parsed data available
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}