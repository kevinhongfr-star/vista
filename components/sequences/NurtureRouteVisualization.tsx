"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  GitBranch,
  ArrowRight,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NurtureRoute {
  id: string
  name: string
  description: string
  condition: string
  destination: string
  contact_count: number
  conversion_rate: number
}

interface RouteBranch {
  id: string
  label: string
  condition: string
  contacts: number
  conversionRate: number
  color: string
}

interface NurtureFunnelStep {
  id: string
  label: string
  type: "email" | "linkedin" | "call" | "meeting" | "decision"
  contacts: number
  engagementRate: number
  branches?: RouteBranch[]
}

const sampleRoutes: NurtureRoute[] = [
  {
    id: "r1",
    name: "Engaged → Meeting Booked",
    description: "High-engagement contacts get fast-tracked to meeting",
    condition: "engagement_score > 60 AND signal_score > 40",
    destination: "Executive Brief Sequence",
    contact_count: 47,
    conversion_rate: 32,
  },
  {
    id: "r2",
    name: "Stale → Re-engagement",
    description: "No touch in 30+ days gets re-engagement sequence",
    condition: "days_since_last_touch > 30",
    destination: "Re-engagement Sequence",
    contact_count: 124,
    conversion_rate: 18,
  },
  {
    id: "r3",
    name: "Signal Detected → Priority",
    description: "New signal triggers priority outreach",
    condition: "new_signal = true",
    destination: "Signal Response Sequence",
    contact_count: 23,
    conversion_rate: 45,
  },
  {
    id: "r4",
    name: "Low Score → Nurture",
    description: "Low VISTA score gets long-term nurture",
    condition: "vista_composite < 30",
    destination: "Content Nurture Sequence",
    contact_count: 189,
    conversion_rate: 8,
  },
]

const funnelSteps: NurtureFunnelStep[] = [
  {
    id: "step-1",
    label: "Initial Outreach",
    type: "email",
    contacts: 500,
    engagementRate: 35,
  },
  {
    id: "step-2",
    label: "Engagement Check",
    type: "decision",
    contacts: 175,
    engagementRate: 65,
    branches: [
      { id: "b1", label: "Engaged", condition: "Opened + replied", contacts: 114, conversionRate: 45, color: "bg-success" },
      { id: "b2", label: "Opened Only", condition: "Opened, no reply", contacts: 61, conversionRate: 22, color: "bg-warning" },
    ],
  },
  {
    id: "step-3",
    label: "Follow-up Sequence",
    type: "email",
    contacts: 114,
    engagementRate: 55,
  },
  {
    id: "step-4",
    label: "Response Triage",
    type: "decision",
    contacts: 63,
    engagementRate: 100,
    branches: [
      { id: "b3", label: "Meeting Booked", condition: "Positive response", contacts: 28, conversionRate: 100, color: "bg-success" },
      { id: "b4", label: "Nurture Path", condition: "Not now / later", contacts: 25, conversionRate: 15, color: "bg-info" },
      { id: "b5", label: "Disengaged", condition: "No response", contacts: 10, conversionRate: 0, color: "bg-error" },
    ],
  },
  {
    id: "step-5",
    label: "Meeting Completed",
    type: "meeting",
    contacts: 28,
    engagementRate: 100,
  },
]

export function NurtureRouteVisualization() {
  const [selectedRoute, setSelectedRoute] = useState<string>("all")
  const [view, setView] = useState<"funnel" | "routes">("funnel")

  const getStepIcon = (type: string) => {
    switch (type) {
      case "email": return Mail
      case "linkedin": return MessageSquare
      case "call": return Phone
      case "meeting": return Calendar
      case "decision": return GitBranch
      default: return Mail
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case "email": return "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
      case "linkedin": return "border-sky-400 bg-sky-50 dark:bg-sky-950/30"
      case "call": return "border-green-400 bg-green-50 dark:bg-green-950/30"
      case "meeting": return "border-purple-400 bg-purple-50 dark:bg-purple-950/30"
      case "decision": return "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
      default: return "border-gray-400 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent-fuchsia/10 rounded-lg">
                <GitBranch className="h-6 w-6 text-accent-fuchsia" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nurture Routes</h2>
                <p className="text-sm text-muted-foreground">
                  Visualize contact flow through nurture sequences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant={view === "funnel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("funnel")}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Funnel View
                </Button>
                <Button
                  variant={view === "routes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("routes")}
                >
                  <GitBranch className="h-4 w-4 mr-1" />
                  Routes
                </Button>
              </div>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {sampleRoutes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{sampleRoutes.length}</p>
              <p className="text-xs text-muted-foreground">Active Routes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {sampleRoutes.reduce((sum, r) => sum + r.contact_count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Contacts in Nurture</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {Math.round(sampleRoutes.reduce((sum, r) => sum + r.conversion_rate * r.contact_count, 0) /
                  sampleRoutes.reduce((sum, r) => sum + r.contact_count, 0))}%
              </p>
              <p className="text-xs text-muted-foreground">Avg Conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-fuchsia">
                {funnelSteps[funnelSteps.length - 1].contacts}
              </p>
              <p className="text-xs text-muted-foreground">Meetings Booked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === "funnel" ? (
        /* Funnel View */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nurture Funnel Flow</CardTitle>
            <CardDescription>
              Contact progression through nurture stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative py-8">
              <div className="flex flex-col items-center gap-2">
                {funnelSteps.map((step, index) => {
                  const Icon = getStepIcon(step.type)
                  const widthPercent = Math.max(20, (step.contacts / funnelSteps[0].contacts) * 100)
                  return (
                    <div key={step.id} className="w-full flex flex-col items-center">
                      <div
                        className={cn(
                          "relative flex items-center justify-between px-6 py-4 rounded-lg border-2 transition-all hover:shadow-md",
                          getStepColor(step.type)
                        )}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/80 dark:bg-black/20 rounded-lg">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{step.label}</p>
                            <p className="text-xs text-muted-foreground capitalize">{step.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{step.contacts}</p>
                          <p className="text-xs text-muted-foreground">
                            {step.engagementRate}% engagement
                          </p>
                        </div>
                      </div>

                      {/* Branches for decision steps */}
                      {step.branches && step.branches.length > 0 && (
                        <div className="w-full flex justify-center gap-4 mt-3 mb-3">
                          {step.branches.map((branch) => (
                            <Tooltip key={branch.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "px-4 py-2 rounded-lg text-center cursor-help",
                                    branch.color,
                                    "text-white text-sm min-w-[140px]"
                                  )}
                                >
                                  <p className="font-semibold">{branch.label}</p>
                                  <p className="text-xs opacity-90">{branch.contacts} contacts</p>
                                  <p className="text-xs opacity-80">{branch.conversionRate}% conv.</p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Condition: {branch.condition}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}

                      {/* Arrow connector */}
                      {index < funnelSteps.length - 1 && (
                        <div className="flex flex-col items-center my-1">
                          <ChevronRight className="h-6 w-6 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Routes List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleRoutes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-fuchsia/10 rounded-lg">
                      <GitBranch className="h-5 w-5 text-accent-fuchsia" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{route.name}</h3>
                      <p className="text-xs text-muted-foreground">{route.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {route.contact_count} contacts
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Condition</p>
                    <code className="text-xs font-mono">{route.condition}</code>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Routes to:</span>
                    <Badge variant="secondary">{route.destination}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Conversion Rate</p>
                      <p className={cn(
                        "text-lg font-bold",
                        route.conversion_rate >= 30 ? "text-success" :
                        route.conversion_rate >= 15 ? "text-warning" : "text-muted-foreground"
                      )}>
                        {route.conversion_rate}%
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}