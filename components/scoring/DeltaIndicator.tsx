"use client"

import { cn } from "@/lib/utils"
import { getDeltaIndicator } from "@/lib/utils"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface DeltaIndicatorProps {
  delta: string | null | undefined
  showText?: boolean
}

export function DeltaIndicator({ delta, showText = true }: DeltaIndicatorProps) {
  const { icon, color } = getDeltaIndicator(delta)

  const getIcon = () => {
    if (icon === '↑') return <ArrowUp className="h-3 w-3" />
    if (icon === '↓') return <ArrowDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  return (
    <div className="flex items-center gap-1">
      <span className={cn("flex items-center", color)}>
        {getIcon()}
      </span>
      {showText && delta && (
        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
          {delta}
        </span>
      )}
    </div>
  )
}