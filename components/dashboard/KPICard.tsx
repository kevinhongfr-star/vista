"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: number | string
  subtitle?: string
  trend?: number
  icon?: React.ReactNode
  color?: "default" | "success" | "warning" | "error" | "info"
}

export function KPICard({ title, value, subtitle, trend, icon, color = "default" }: KPICardProps) {
  const colorClasses = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    info: "text-info",
  }

  const bgClasses = {
    default: "",
    success: "bg-success/5",
    warning: "bg-warning/5",
    error: "bg-error/5",
    info: "bg-info/5",
  }

  const getTrendIcon = () => {
    if (trend === undefined) return null
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-success" />
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-error" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <Card className={cn(bgClasses[color])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <span className={cn(colorClasses[color])}>{icon}</span>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className={cn("text-2xl font-bold", colorClasses[color])}>{value}</div>
          {getTrendIcon()}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}