"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Send,
  Filter,
  Search,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { OutreachAssignment } from "@/lib/types"

export function OutreachDashboard() {
  const [assignments, setAssignments] = useState<OutreachAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { toasts, addToast, dismissToast } = useToasts()

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/outreach")
      const data = await response.json()
      if (data.success) {
        setAssignments(data.assignments || [])
      }
    } catch {
      setAssignments(generateSampleAssignments())
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await response.json()
      if (data.success) {
        setAssignments(assignments.map((a) =>
          a.id === id ? { ...a, status: newStatus as any } : a
        ))
        addToast("success", `Status updated to ${newStatus}`)
      } else {
        addToast("error", data.error || "Failed to update status")
      }
    } catch {
      // Optimistic update
      setAssignments(assignments.map((a) =>
        a.id === id ? { ...a, status: newStatus as any } : a
      ))
      addToast("success", `Status updated to ${newStatus}`)
    }
  }

  const filtered = assignments.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        a.contact_name?.toLowerCase().includes(q) ||
        a.contact_company?.toLowerCase().includes(q) ||
        a.template_name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    active: assignments.filter((a) => a.status === "Active").length,
    totalContacts: assignments.length,
    completed: assignments.filter((a) => a.status === "Completed").length,
    totalTouches: assignments.reduce((sum, a) => sum + (a.touches_sent || 0), 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success/10 text-success"
      case "Paused": return "bg-warning/10 text-warning"
      case "Completed": return "bg-info/10 text-info"
      case "Cancelled": return "bg-error/10 text-error"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getProgress = (a: OutreachAssignment) => {
    const total = a.touches_total || 1
    const sent = a.touches_sent || 0
    return Math.round((sent / total) * 100)
  }

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sequences</p>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Play className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contacts in Outreach</p>
                <p className="text-2xl font-bold mt-1">{stats.totalContacts}</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <Users className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-accent-fuchsia/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-accent-fuchsia" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Touches Sent</p>
                <p className="text-2xl font-bold mt-1">{stats.totalTouches}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Send className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by contact, company, or template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>Filter by status</TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} assignments</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Sequences Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Outreach Sequences</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Touch</TableHead>
                  <TableHead>Next Touch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {assignment.contact_name || assignment.contact_id}
                          </p>
                          {assignment.contact_company && (
                            <p className="text-xs text-muted-foreground">
                              {assignment.contact_company}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {assignment.template_name || "Custom"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getStatusColor(assignment.status))}>
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{assignment.touches_sent || 0}/{assignment.touches_total || 1}</span>
                            <span>{getProgress(assignment)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-fuchsia rounded-full transition-all"
                              style={{ width: `${getProgress(assignment)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {assignment.last_touch_date
                          ? new Date(assignment.last_touch_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {assignment.next_touch_date
                          ? new Date(assignment.next_touch_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {assignment.status === "Active" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStatusChange(assignment.id, "Paused")}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Pause</TooltipContent>
                            </Tooltip>
                          ) : assignment.status === "Paused" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStatusChange(assignment.id, "Active")}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Resume</TooltipContent>
                            </Tooltip>
                          ) : null}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(assignment.id, "Cancelled")}
                                className="text-error hover:text-error"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancel</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Send className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No outreach assignments found</p>
                      <p className="text-sm mt-1">Assign a template to contacts to get started</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function generateSampleAssignments(): OutreachAssignment[] {
  return [
    {
      id: "oa-sample-1",
      contact_id: "c1",
      template_id: "t1",
      sequence_id: null,
      status: "Active",
      current_step: 2,
      start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      last_touch_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      next_touch_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      touches_sent: 2,
      touches_total: 5,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      contact_name: "Sarah Chen",
      contact_company: "TechCorp",
      template_name: "Executive Brief Invitation",
    },
    {
      id: "oa-sample-2",
      contact_id: "c2",
      template_id: "t2",
      sequence_id: null,
      status: "Active",
      current_step: 1,
      start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      last_touch_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      next_touch_date: new Date(Date.now() + 4 * 86400000).toISOString(),
      touches_sent: 1,
      touches_total: 4,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      contact_name: "Michael Roberts",
      contact_company: "InnovateLabs",
      template_name: "Webinar Invitation",
    },
    {
      id: "oa-sample-3",
      contact_id: "c3",
      template_id: "t1",
      sequence_id: null,
      status: "Completed",
      current_step: 5,
      start_date: new Date(Date.now() - 21 * 86400000).toISOString(),
      last_touch_date: new Date(Date.now() - 7 * 86400000).toISOString(),
      next_touch_date: null,
      touches_sent: 5,
      touches_total: 5,
      created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      contact_name: "Emily Watson",
      contact_company: "GlobalTech",
      template_name: "Executive Brief Invitation",
    },
    {
      id: "oa-sample-4",
      contact_id: "c4",
      template_id: "t3",
      sequence_id: null,
      status: "Paused",
      current_step: 2,
      start_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      last_touch_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      next_touch_date: null,
      touches_sent: 2,
      touches_total: 3,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      contact_name: "David Kim",
      contact_company: "StartupX",
      template_name: "Follow-up After Meeting",
    },
    {
      id: "oa-sample-5",
      contact_id: "c5",
      template_id: "t4",
      sequence_id: null,
      status: "Active",
      current_step: 3,
      start_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      last_touch_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      next_touch_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      touches_sent: 3,
      touches_total: 4,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      contact_name: "Jennifer Lee",
      contact_company: "DataDriven Co",
      template_name: "Re-engagement",
    },
  ]
}