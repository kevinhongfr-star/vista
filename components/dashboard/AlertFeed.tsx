"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, TrendingUp, Clock, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { VistaContact } from "@/lib/types"

interface AlertFeedProps {
  staleContacts: VistaContact[]
  thresholdCrossings: VistaContact[]
  newSignals: VistaContact[]
}

export function AlertFeed({ staleContacts, thresholdCrossings, newSignals }: AlertFeedProps) {
  const alerts = [
    {
      type: "decay",
      icon: <Clock className="h-4 w-4" />,
      label: "Stale Contacts",
      count: staleContacts.length,
      color: "text-warning",
      bgColor: "bg-warning/10",
      items: staleContacts.slice(0, 5),
    },
    {
      type: "threshold",
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Threshold Crossings",
      count: thresholdCrossings.length,
      color: "text-success",
      bgColor: "bg-success/10",
      items: thresholdCrossings.slice(0, 5),
    },
    {
      type: "signal",
      icon: <Bell className="h-4 w-4" />,
      label: "New Signals",
      count: newSignals.length,
      color: "text-info",
      bgColor: "bg-info/10",
      items: newSignals.slice(0, 5),
    },
  ]

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.type} className="space-y-2">
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", alert.bgColor)}>
            <span className={alert.color}>{alert.icon}</span>
            <span className="font-medium text-sm">{alert.label}</span>
            <Badge variant="secondary" className="ml-auto">{alert.count}</Badge>
          </div>
          
          {alert.items.length > 0 && (
            <div className="ml-4 space-y-1">
              {alert.items.map((contact) => (
                <div 
                  key={contact.id} 
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <span className="font-medium">{contact.name || "Unknown"}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{contact.company || "-"}</span>
                  {alert.type === "decay" && (
                    <span className="text-warning ml-auto">
                      {contact.last_engagement_date ? 
                        `${Math.floor((Date.now() - new Date(contact.last_engagement_date).getTime()) / (1000 * 60 * 60 * 24))}d ago` : 
                        "Never"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {alert.count > 5 && (
            <div className="text-xs text-muted-foreground ml-4">
              +{alert.count - 5} more
            </div>
          )}
        </div>
      ))}
    </div>
  )
}