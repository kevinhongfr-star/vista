"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface ScoreBreakdownProps {
  stainScore: number | null | undefined
  clusterScore: number | null | undefined
  signalScore: number | null | undefined
  engagementScore: number | null | undefined
  showLabels?: boolean
}

export function ScoreBreakdown({
  stainScore = 0,
  clusterScore = 0,
  signalScore = 0,
  engagementScore = 0,
  showLabels = true,
}: ScoreBreakdownProps) {
  const scores = [
    { label: "Stain", score: stainScore, max: 25, color: "bg-tier-warm" },
    { label: "Cluster", score: clusterScore, max: 25, color: "bg-tier-engaged" },
    { label: "Signal", score: signalScore, max: 25, color: "bg-warning" },
    { label: "Engagement", score: engagementScore, max: 25, color: "bg-accent-gold" },
  ]

  return (
    <div className="space-y-3">
      {scores.map((item) => (
        <div key={item.label} className="space-y-1">
          {showLabels && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.score || 0}/{item.max}</span>
            </div>
          )}
          <Progress 
            value={(item.score || 0) / item.max * 100} 
            className="h-2"
          />
        </div>
      ))}
    </div>
  )
}