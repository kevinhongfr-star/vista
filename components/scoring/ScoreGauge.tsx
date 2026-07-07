"use client"

import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  score: number
  maxScore?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  label?: string
}

export function ScoreGauge({
  score,
  maxScore = 100,
  size = "md",
  showLabel = true,
  label = "Score",
}: ScoreGaugeProps) {
  const percentage = Math.min(Math.max(score / maxScore, 0), 1)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - percentage * circumference

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    if (score >= 40) return "text-info"
    return "text-muted-foreground"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "#22c55e"
    if (score >= 60) return "#eab308"
    if (score >= 40) return "#3b82f6"
    return "#94a3b8"
  }

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
      <svg
        viewBox="0 0 100 100"
        className="absolute transform -rotate-90"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getStrokeColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn("font-bold", textSizeClasses[size], getScoreColor(score))}>
          {Math.round(score)}
        </span>
        {showLabel && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  )
}