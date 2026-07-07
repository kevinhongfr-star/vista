"use client"

import { Badge } from "@/components/ui/badge"
import { getEncirclementColor } from "@/lib/utils"

interface EncirclementBadgeProps {
  level: string | null | undefined
  size?: "sm" | "md"
}

export function EncirclementBadge({ level, size = "md" }: EncirclementBadgeProps) {
  const normalizedLevel = level?.toLowerCase() || "scout"
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"

  return (
    <Badge
      variant={normalizedLevel as any}
      className={sizeClasses}
    >
      {level || "Scout"}
    </Badge>
  )
}