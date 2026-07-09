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
import { 
  Mail, 
  Check, 
  X, 
  Edit, 
  Filter, 
  Send, 
  Eye, 
  MessageSquare, 
  Calendar,
  Loader2,
  CheckSquare,
  Square
} from "lucide-react"
import type { CampaignActivity } from "@/lib/types"
import { useState } from "react"
import { useToasts, Toaster } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

interface CampaignsPageProps {
  activities: CampaignActivity[]
  drafts: CampaignActivity[]
  totalCount: number
}

export function CampaignsPage({ activities, drafts, totalCount }: CampaignsPageProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === drafts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(drafts.map(d => d.id)))
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    setLoadingId(id)
    try {
      const response = await fetch(`/api/campaigns/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_status: status }),
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", `Campaign ${status.toLowerCase()} successfully`)
        router.refresh()
      } else {
        addToast("error", data.error || "Failed to update status")
      }
    } catch (error) {
      addToast("error", "Failed to update status")
    } finally {
      setLoadingId(null)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return

    setBulkLoading(true)
    try {
      const response = await fetch("/api/campaigns/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      const data = await response.json()

      if (data.success) {
        addToast("success", `Approved ${data.updated_count} campaigns successfully`)
        setSelectedIds(new Set())
        router.refresh()
      } else {
        addToast("error", data.error || "Failed to bulk approve")
      }
    } catch (error) {
      addToast("error", "Failed to bulk approve")
    } finally {
      setBulkLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string | null | undefined) => {
    switch (status) {
      case "Drafted":
        return "bg-tier-cold"
      case "Approved":
        return "bg-info"
      case "Sent":
        return "bg-muted"
      case "Opened":
        return "bg-warning text-white"
      case "Replied":
        return "bg-info text-white"
      case "Meeting Booked":
        return "bg-success text-white"
      case "Rejected":
        return "bg-error text-white"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Badge variant="secondary">{totalCount} total activities</Badge>
      </div>

      {drafts.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-warning" />
                Draft Queue ({drafts.length} pending approval)
              </CardTitle>
              {selectedIds.size > 0 && (
                <Button 
                  onClick={handleBulkApprove} 
                  disabled={bulkLoading}
                  className="gap-2"
                >
                  {bulkLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Bulk Approve ({selectedIds.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <button
                      onClick={toggleSelectAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {selectedIds.size === drafts.length && drafts.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Angle</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell>
                      <button
                        onClick={() => toggleSelect(draft.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {selectedIds.has(draft.id) ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{draft.campaign_type || draft.activity_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{draft.conversation_angle || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {truncateText(draft.body || "", 80)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success"
                          title="Approve"
                          onClick={() => handleStatusUpdate(draft.id, "Approved")}
                          disabled={loadingId === draft.id}
                        >
                          {loadingId === draft.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-info"
                          title="Edit"
                          disabled={loadingId === draft.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-error"
                          title="Reject"
                          onClick={() => handleStatusUpdate(draft.id, "Rejected")}
                          disabled={loadingId === draft.id}
                        >
                          {loadingId === draft.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-success"
                          title="Send Now"
                          onClick={() => handleStatusUpdate(draft.id, "Sent")}
                          disabled={loadingId === draft.id}
                        >
                          {loadingId === draft.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
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
                <div className="relative h-8 bg-muted rounded overflow-hidden">
                  <div 
                    className={cn("absolute top-0 left-0 h-full rounded-r", step.color)}
                    style={{ width: `${(step.count / maxCount) * 100}%` }}
                  />
                  {index > 0 && funnelSteps[index - 1].count > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white z-10">
                      {((step.count / funnelSteps[index - 1].count) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                        className={cn(getStatusBadgeClass(activity.activity_status))}
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

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
