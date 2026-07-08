"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Calendar,
  Phone,
  Mail,
  ClipboardList,
  FileText,
  Clock,
  Filter,
  Plus,
  ArrowRight,
} from "lucide-react"
import { ACTIVITY_TYPES, type Activity } from "@/lib/types"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { useToasts, Toaster } from "@/components/ui/toast"

interface ActivitiesPageProps {
  activities: Activity[]
}

const ACTIVITY_ICONS: Record<string, typeof Mail> = {
  "Email Sent": Mail,
  "Email Opened": Mail,
  "Email Replied": Mail,
  Call: Phone,
  Meeting: Calendar,
  Note: FileText,
}

export function ActivitiesPage({ activities }: ActivitiesPageProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activityLogOpen, setActivityLogOpen] = useState(false)

  const filteredActivities = activities.filter((activity) => {
    if (filterType !== "all" && activity.activity_type !== filterType) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const contactName = (activity as any).vista_contacts?.name?.toLowerCase() || ""
      const contactCompany = (activity as any).vista_contacts?.company?.toLowerCase() || ""
      const notes = activity.notes?.toLowerCase() || ""
      return (
        contactName.includes(query) ||
        contactCompany.includes(query) ||
        notes.includes(query)
      )
    }
    return true
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Activities</h1>
        <Button onClick={() => setActivityLogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by contact name, company, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px]"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredActivities.length} activities</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => {
                  const IconComponent = ACTIVITY_ICONS[activity.activity_type || ""] || ClipboardList
                  const contactName = (activity as any).vista_contacts?.name || "-"
                  const contactCompany = (activity as any).vista_contacts?.company || "-"
                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(activity.activity_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <IconComponent className="h-3 w-3" />
                          {activity.activity_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {contactName}
                        <p className="text-xs text-muted-foreground">{contactCompany}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px]">
                        {activity.notes || activity.content || "-"}
                      </TableCell>
                      <TableCell>
                        {activity.duration_minutes ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{activity.duration_minutes} min</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.contact_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/contacts/${activity.contact_id}`)}
                          >
                            View
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No activities logged. Click Log Activity to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ActivityLog
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}