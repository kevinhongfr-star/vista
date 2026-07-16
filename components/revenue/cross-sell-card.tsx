"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, ArrowRight, Check, TrendingUp } from "lucide-react"

interface CrossSellCardProps {
  contactId: string
}

interface Recommendation {
  rule_id: string
  target_service_name: string
  source_service_name: string
  priority: number
  pitch_script: string
  trigger_delay_days: number
  success_rate: number
  estimated_value_range: { min_cny: number; max_cny: number }
}

export function CrossSellCard({ contactId }: CrossSellCardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [converted, setConverted] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!contactId) return

    const fetchRecs = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/contacts/${contactId}/cross-sell-recommendations`)
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch {
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecs()
  }, [contactId])

  const handleConverted = async (ruleId: string) => {
    try {
      await fetch(`/api/cross-sell-rules/${ruleId}/success`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ converted: true }),
      })
      setConverted((prev) => new Set([...prev, ruleId]))
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No cross-sell recommendations yet
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-success" />
        <h3 className="text-lg font-semibold">Recommended Next Step</h3>
      </div>

      {recommendations.map((rec) => (
        <Card
          key={rec.rule_id}
          className={`p-4 transition-all ${converted.has(rec.rule_id) ? "border-success" : ""}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{rec.target_service_name}</h4>
                <Badge variant="outline" className="text-xs">
                  Priority {rec.priority}
                </Badge>
                {converted.has(rec.rule_id) && (
                  <Badge className="bg-success/20 text-success border-success">
                    <Check className="h-3 w-3 mr-1" /> Converted
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                From: {rec.source_service_name}
                {rec.trigger_delay_days > 0 && ` · After ${rec.trigger_delay_days} days`}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Est. value: </span>
                <span className="font-medium">
                  ¥{rec.estimated_value_range.min_cny.toLocaleString()} — ¥{rec.estimated_value_range.max_cny.toLocaleString()}
                </span>
              </p>
              {rec.success_rate > 0 && (
                <p className="text-xs text-success mt-1">
                  {rec.success_rate}% success rate
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setExpanded(expanded === rec.rule_id ? null : rec.rule_id)}
            >
              {expanded === rec.rule_id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {expanded === rec.rule_id && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Pitch Script</p>
              <p className="text-sm whitespace-pre-wrap italic">{rec.pitch_script}</p>
              {!converted.has(rec.rule_id) && (
                <Button
                  size="sm"
                  className="mt-3 gap-1"
                  onClick={() => handleConverted(rec.rule_id)}
                >
                  <ArrowRight className="h-3 w-3" />
                  Mark as Converted
                </Button>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}