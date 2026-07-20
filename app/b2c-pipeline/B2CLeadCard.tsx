"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Star, Building2, TrendingUp } from "lucide-react"

interface B2CLeadCardProps {
  lead: {
    id: string
    name: string | null
    title: string | null
    company: string | null
    b2b_potential_score: number | null
    current_tier: string | null
    total_spend_cny: number | null
    pipeline_stage: string | null
  }
  onClick?: () => void
}

export function B2CLeadCard({ lead, onClick }: B2CLeadCardProps) {
  const score = lead.b2b_potential_score || 0
  const scoreColor =
    score >= 80 ? "bg-red-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-green-500" : "bg-gray-400"

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-accent-fuchsia"
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="font-semibold text-sm truncate">{lead.name || "Unknown"}</div>
          <Badge className={`${scoreColor} text-white text-xs`}>{score}</Badge>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          <span className="truncate">
            {lead.title || "N/A"} @ {lead.company || "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3 w-3" />
          <span className="capitalize">{lead.current_tier || "free"}</span>
          {lead.total_spend_cny ? (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              ¥{lead.total_spend_cny}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
