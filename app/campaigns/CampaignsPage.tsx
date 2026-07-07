"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { formatDate, truncateText } from "@/lib/utils"
import { Mail, Check, X, Edit, Filter, Send, Eye, MessageSquare, Calendar } from "lucide-react"
import type { CampaignActivity } from "@/lib/types"

interface CampaignsPageProps {
  activities: CampaignActivity[]
  drafts: CampaignActivity[]
  totalCount: number
}

export function CampaignsPage({ activities, drafts, totalCount }: CampaignsPageProps) {
  // Calculate funnel metrics
  const sentCount = activities.filter(a => a.activity_status === 'Sent' || a.sent_date).length
  const openedCount = activities.filter(a => a.activity_status === 'Opened').length
  const repliedCount = activities.filter(a => a.activity_status === 'Replied').length
  const meetingCount = activities.filter(a => a.activity_status === 'Meeting Booked').length

  const funnelSteps = [
    { label: "Drafted", count: drafts.length, color: "bg-tier-cold" },
    { label: "Sent", count: sentCount, color: "bg-muted" },
    { label: "Opened", count: openedCount, color: "bg-warning" },
    { label: "Replied", count: repliedCount, color: "bg-info" },
    { label: "Meeting", count: meetingCount, color: "bg-success" },
  ]

  const maxCount = Math.max(...funnelSteps.map(s => s.count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Badge variant="secondary">{totalCount} total activities</Badge>
      </div>

      {/* Draft Queue */}
      {drafts.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-warning" />
              Draft Queue ({drafts.length} pending approval)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Angle</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell>
                      <Badge variant="outline">{draft.campaign_type || draft.activity_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{draft.conversation_angle || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {truncateText(draft.body || "", 80)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" title="Approve">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-info" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-error" title="Reject">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Campaign Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelSteps.map((step, index) => (
              <div key={step.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground">{step.count}</span>
                </div>
                <div className="relative h-8 bg-muted rounded">
                  <div 
                    className={cn("absolute top-0 left-0 h-full rounded", step.color)}
                    style={{ width: `${(step.count / maxCount) * 100}%` }}
                  />
                  {index > 0 && funnelSteps[index - 1].count > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {((step.count / funnelSteps[index - 1].count) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Angle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]">Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline">{activity.campaign_type || activity.activity_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          activity.activity_status === "Meeting Booked" && "bg-success text-white",
                          activity.activity_status === "Replied" && "bg-info text-white",
                          activity.activity_status === "Opened" && "bg-warning text-white",
                          activity.activity_status === "Sent" && "bg-muted",
                          activity.activity_status === "Drafted" && "bg-tier-cold"
                        )}
                      >
                        {activity.activity_status || activity.outcome || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{activity.conversation_angle || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(activity.sent_date || activity.activity_date || activity.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.response_date && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.response_date)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No campaign activities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}