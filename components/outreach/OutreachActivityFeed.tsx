"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster, useToasts } from "@/components/ui/toast"
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Filter,
  Search,
  ArrowRight,
  Loader2,
  Check,
  Clock,
  Send,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/types"
import { ACTIVITY_TYPES } from "@/lib/types"

interface OutreachActivityFeedProps {
  activities?: Activity[]
}

export function OutreachActivityFeed({ activities: propActivities }: OutreachActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(propActivities || [])
  const [loading, setLoading] = useState(!propActivities)
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toasts, addToast, dismissToast } = useToasts()

  useEffect(() => {
    if (propActivities && propActivities.length > 0) return
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/activities")
      const data = await response.json()
      if (data.activities) {
        setActivities(data.activities || [])
      } else {
        setActivities(generateSampleActivities())
      }
    } catch {
      setActivities(generateSampleActivities())
    } finally {
      setLoading(false)
    }
  }

  const filtered = activities.filter((a) => {
    if (filterType !== "all" && a.activity_type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        a.subject?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q) ||
        a.activity_type.toLowerCase().includes(q)
      )
    }
    return true
  })

  const getActivityIcon = (type: string) => {
    const icons: Record<string, typeof Mail> = {
      "Email Sent": Mail,
      "Email Opened": Mail,
      "Email Replied": Mail,
      Call: Phone,
      Meeting: Calendar,
      Note: FileText,
      "LinkedIn Message": MessageSquare,
      "Webinar Invite": Send,
      "Podcast Invite": MessageSquare,
      "Newsletter Invite": Send,
      "Event Invite": Send,
    }
    return icons[type] || FileText
  }

  const getActivityColor = (type: string) => {
    if (type.includes("Email")) return "bg-blue-500"
    if (type === "Call") return "bg-green-500"
    if (type === "Meeting") return "bg-purple-500"
    if (type === "Note") return "bg-gray-500"
    if (type.includes("Invite")) return "bg-amber-500"
    return "bg-gray-500"
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const groupByDate = (items: Activity[]) => {
    const groups: Record<string, Activity[]> = {}
    items.forEach((item) => {
      const date = new Date(item.activity_date || item.created_at || "").toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    })
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    )
  }

  const grouped = groupByDate(filtered)

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Activity Type" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>Filter by activity type</TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} activities</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ActivityIcon />
            Outreach Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : grouped.length > 0 ? (
            <div className="space-y-6">
              {grouped.map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-xs text-muted-foreground font-medium px-2">
                      {formatDateLabel(date)}
                    </span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className="relative space-y-0">
                    {items.map((activity, index) => {
                      const Icon = getActivityIcon(activity.activity_type)
                      return (
                        <div
                          key={activity.id}
                          className="flex gap-4 pb-4 last:pb-0"
                        >
                          <div className="relative flex flex-col items-center">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0",
                                getActivityColor(activity.activity_type)
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            {index < items.length - 1 && (
                              <div className="w-px flex-1 bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">
                                  {activity.subject || activity.activity_type}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {activity.activity_type}
                                  {(activity as any).vista_contacts?.name && (
                                    <>
                                      {" • "}
                                      {(activity as any).vista_contacts.name}
                                      {(activity as any).vista_contacts.company && (
                                        <> @ {(activity as any).vista_contacts.company}</>
                                      )}
                                    </>
                                  )}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatTimeAgo(activity.activity_date || activity.created_at || "")}
                              </span>
                            </div>
                            {activity.notes && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {activity.notes}
                              </p>
                            )}
                            {activity.outcome && (
                              <Badge
                                variant="outline"
                                className="text-xs mt-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                {activity.outcome}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No outreach activity found</p>
              <p className="text-sm mt-1">Activity will appear here as you send outreach</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

function ActivityIcon() {
  return <ActivityFeedIcon />
}

function ActivityFeedIcon() {
  return <Users className="h-4 w-4" />
}

function generateSampleActivities(): Activity[] {
  const now = Date.now()
  return [
    {
      id: "act-1",
      contact_id: "c1",
      activity_type: "Email Sent",
      activity_date: new Date(now - 10 * 60 * 1000).toISOString(),
      subject: "Executive Brief Invitation",
      content: "Hi Sarah, I'd like to invite you to our exclusive executive brief...",
      outcome: null,
      notes: "Sent via Executive Brief template",
      duration_minutes: null,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 10 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "act-2",
      contact_id: "c2",
      activity_type: "Email Opened",
      activity_date: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      subject: "Webinar Invitation",
      content: "",
      outcome: null,
      notes: "Opened 3 times",
      duration_minutes: null,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-3",
      contact_id: "c3",
      activity_type: "Call",
      activity_date: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      subject: "Discovery Call",
      content: "",
      outcome: "Meeting Booked",
      notes: "Great conversation. Interested in executive brief program. Meeting scheduled for next Tuesday.",
      duration_minutes: 30,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-4",
      contact_id: "c1",
      activity_type: "Meeting",
      activity_date: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      subject: "Executive Brief - Discovery",
      content: "",
      outcome: "Follow-up Required",
      notes: "Walked through executive brief. Needs to discuss with leadership team.",
      duration_minutes: 45,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-5",
      contact_id: "c4",
      activity_type: "LinkedIn Message",
      activity_date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      subject: "Re-engagement",
      content: "",
      outcome: "Replied",
      notes: "Connected via LinkedIn. Interested in catching up.",
      duration_minutes: null,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-6",
      contact_id: "c5",
      activity_type: "Email Sent",
      activity_date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      subject: "Follow-up After Meeting",
      content: "Hi Jennifer, thanks for taking the time to meet...",
      outcome: null,
      notes: "Follow-up template sent",
      duration_minutes: null,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-7",
      contact_id: "c2",
      activity_type: "Note",
      activity_date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      subject: "Strategic note",
      content: "",
      outcome: null,
      notes: "Michael mentioned they're evaluating vendors for their digital transformation initiative. Timeline: Q3 decision.",
      duration_minutes: null,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-8",
      contact_id: "c3",
      activity_type: "Email Replied",
      activity_date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      subject: "Re: Executive Brief Invitation",
      content: "",
      outcome: "Positive Response",
      notes: "Emily replied positively and requested more details about the program.",
      duration_minutes: null,
      campaign_id: null,
      program_id: null,
      created_by: null,
      created_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}