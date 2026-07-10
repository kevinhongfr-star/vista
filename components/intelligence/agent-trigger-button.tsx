"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToasts } from "@/components/ui/toast"
import { Loader2, Zap, Brain, Target, Search } from "lucide-react"
import type { AgentName, AgentTriggerRequest } from "@/lib/types"

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

const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

interface AgentTriggerButtonProps {
  agent: AgentName
  triggerData: AgentTriggerRequest
  label: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  disabled?: boolean
}

function canTrigger(agent: AgentName): boolean {
  if (typeof window === "undefined") return true
  const lastTrigger = localStorage.getItem(`trigger_${agent}`)
  if (!lastTrigger) return true
  return Date.now() - parseInt(lastTrigger) > COOLDOWN_MS
}

function getCooldownRemaining(agent: AgentName): number {
  if (typeof window === "undefined") return 0
  const lastTrigger = localStorage.getItem(`trigger_${agent}`)
  if (!lastTrigger) return 0
  const remaining = COOLDOWN_MS - (Date.now() - parseInt(lastTrigger))
  return Math.max(0, remaining)
}

export function AgentTriggerButton({
  agent,
  triggerData,
  label,
  variant = "default",
  size = "default",
  showIcon = true,
  disabled = false,
}: AgentTriggerButtonProps) {
  const [loading, setLoading] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const { addToast } = useToasts()

  // Check cooldown on mount and periodically
  useEffect(() => {
    const checkCooldown = () => {
      const remaining = getCooldownRemaining(agent)
      setCooldownRemaining(remaining)
    }

    checkCooldown()
    const interval = setInterval(checkCooldown, 1000)
    return () => clearInterval(interval)
  }, [agent])

  const handleTrigger = async () => {
    if (!canTrigger(agent) || loading || disabled) return

    setLoading(true)

    try {
      const response = await fetch(`/api/trigger/${agent.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(triggerData),
      })

      const result = await response.json()

      if (result.success) {
        // Record trigger time for cooldown
        localStorage.setItem(`trigger_${agent}`, String(Date.now()))
        setCooldownRemaining(COOLDOWN_MS)

        addToast("success", `${agent} Triggered`)
      } else {
        addToast("error", `Failed to trigger ${agent}: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      addToast("error", `Failed to trigger ${agent}: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = disabled || loading || cooldownRemaining > 0

  const cooldownText =
    cooldownRemaining > 0
      ? ` (${Math.ceil(cooldownRemaining / 60000)}m cooldown)`
      : ""

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleTrigger}
      className={showIcon ? "gap-2" : ""}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && (
          <span className={AGENT_COLORS[agent]}>{AGENT_ICONS[agent]}</span>
        )
      )}
      {label}
      {cooldownRemaining > 0 && !loading && (
        <span className="text-xs opacity-70">{cooldownText}</span>
      )}
    </Button>
  )
}