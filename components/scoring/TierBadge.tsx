"use client"

import { Badge } from "@/components/ui/badge"
import { getTierColor } from "@/lib/utils"

interface TierBadgeProps {
  tier: string | null | undefined
  size?: "sm" | "md"
}

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const normalizedTier = tier?.toLowerCase() || "cold"
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"

  return (
    <Badge
      variant={normalizedTier as any}
      className={sizeClasses}
    >
      {tier || "Cold"}
    </Badge>
  )
}