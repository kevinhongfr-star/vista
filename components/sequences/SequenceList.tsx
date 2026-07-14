"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster, useToasts } from "@/components/ui/toast"
import {
  ListOrdered,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Edit3,
  Trash2,
  Users,
  BarChart3,
  Clock,
  Copy,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { OutreachSequence } from "./SequenceBuilder"
import { SequenceBuilder } from "./SequenceBuilder"

interface SequenceListProps {
  onSelectSequence?: (sequence: OutreachSequence) => void
}

const SAMPLE_SEQUENCES: OutreachSequence[] = [
  {
    id: "seq-1",
    name: "Executive Brief Outreach",
    description: "5-touch sequence for executive brief invitations",
    type: "Executive Brief",
    status: "Active",
    steps: [],
    total_contacts: 47,
    active_contacts: 23,
    completion_rate: 68,
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
  },
  {
    id: "seq-2",
    name: "Webinar Invitation Sequence",
    description: "Multi-channel webinar promotion sequence",
    type: "Webinar Outreach",
    status: "Active",
    steps: [],
    total_contacts: 120,
    active_contacts: 56,
    completion_rate: 45,
    created_at: "2026-06-20T00:00:00Z",
    updated_at: "2026-07-08T00:00:00Z",
  },
  {
    id: "seq-3",
    name: "Re-engagement Campaign",
    description: "Re-engage stale contacts with personalized touch",
    type: "Re-engagement",
    status: "Paused",
    steps: [],
    total_contacts: 85,
    active_contacts: 0,
    completion_rate: 32,
    created_at: "2026-05-10T00:00:00Z",
    updated_at: "2026-06-30T00:00:00Z",
  },
  {
    id: "seq-4",
    name: "Nurture: Digital Transformation",
    description: "Long-term nurture for digital transformation leads",
    type: "Nurture",
    status: "Active",
    steps: [],
    total_contacts: 200,
    active_contacts: 180,
    completion_rate: 25,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-07-12T00:00:00Z",
  },
  {
    id: "seq-5",
    name: "Post-Meeting Follow-up",
    description: "Automated follow-up after discovery call",
    type: "Custom",
    status: "Active",
    steps: [],
    total_contacts: 35,
    active_contacts: 15,
    completion_rate: 80,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-13T00:00:00Z",
  },
]

export function SequenceList({ onSelectSequence }: SequenceListProps) {
  const [sequences, setSequences] = useState<OutreachSequence[]>(SAMPLE_SEQUENCES)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingSequence, setEditingSequence] = useState<OutreachSequence | undefined>(undefined)
  const { toasts, addToast, dismissToast } = useToasts()

  const filtered = sequences.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false
    if (filterType !== "all" && s.type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
      )
    }
    return true
  })

  const openNewSequence = () => {
    setEditingSequence(undefined)
    setIsBuilderOpen(true)
  }

  const openEditSequence = (sequence: OutreachSequence) => {
    setEditingSequence(sequence)
    setIsBuilderOpen(true)
  }

  const handleSave = (sequence: OutreachSequence) => {
    if (editingSequence) {
      setSequences(sequences.map((s) => (s.id === sequence.id ? sequence : s)))
    } else {
      setSequences([sequence, ...sequences])
    }
    setIsBuilderOpen(false)
    setEditingSequence(undefined)
  }

  const handleToggleStatus = (sequence: OutreachSequence) => {
    const newStatus = sequence.status === "Active" ? "Paused" : "Active"
    setSequences(
      sequences.map((s) =>
        s.id === sequence.id ? { ...s, status: newStatus as any } : s
      )
    )
    addToast("success", `Sequence ${newStatus.toLowerCase()}`)
  }

  const handleDuplicate = (sequence: OutreachSequence) => {
    const newSeq: OutreachSequence = {
      ...sequence,
      id: `seq-${Date.now()}`,
      name: `${sequence.name} (Copy)`,
      status: "Draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setSequences([newSeq, ...sequences])
    addToast("success", "Sequence duplicated")
  }

  const handleDelete = (sequence: OutreachSequence) => {
    if (!confirm(`Delete sequence "${sequence.name}"?`)) return
    setSequences(sequences.filter((s) => s.id !== sequence.id))
    addToast("success", "Sequence deleted")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success/10 text-success"
      case "Paused": return "bg-warning/10 text-warning"
      case "Draft": return "bg-muted text-muted-foreground"
      case "Archived": return "bg-gray-100 text-gray-500"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const sequenceTypes = Array.from(new Set(sequences.map((s) => s.type)))

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent-fuchsia/10 rounded-lg">
                <ListOrdered className="h-6 w-6 text-accent-fuchsia" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Outreach Sequences</h2>
                <p className="text-sm text-muted-foreground">
                  Multi-touch outreach sequences for campaigns
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="grid grid-cols-3 gap-4 mr-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{sequences.length}</p>
                  <p className="text-xs text-muted-foreground">Sequences</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {sequences.filter((s) => s.status === "Active").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-fuchsia">
                    {sequences.reduce((sum, s) => sum + (s.active_contacts || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Contacts</p>
                </div>
              </div>
              <Button onClick={openNewSequence}>
                <Plus className="h-4 w-4 mr-2" />
                New Sequence
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sequences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>Filter by status</TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>Filter by type</TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {sequenceTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filtered.length} sequences</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sequences Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sequence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Contacts</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Completion</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((sequence) => (
                  <TableRow
                    key={sequence.id}
                    className="group cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectSequence?.(sequence)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{sequence.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {sequence.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {sequence.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", getStatusColor(sequence.status))}>
                        {sequence.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{sequence.total_contacts || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "text-sm font-medium",
                        sequence.active_contacts && sequence.active_contacts > 0 ? "text-success" : ""
                      )}>
                        {sequence.active_contacts || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-fuchsia rounded-full"
                            style={{ width: `${sequence.completion_rate || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {sequence.completion_rate || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sequence.updated_at
                        ? new Date(sequence.updated_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(sequence)}
                            >
                              {sequence.status === "Active" ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {sequence.status === "Active" ? "Pause" : "Activate"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditSequence(sequence)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(sequence)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(sequence)}
                              className="text-error hover:text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <ListOrdered className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No sequences found</p>
                    <p className="text-sm mt-1">
                      Create your first outreach sequence
                    </p>
                    <Button className="mt-4" onClick={openNewSequence}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Sequence
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sequence Builder Dialog */}
      <Dialog
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSequence ? "Edit Sequence" : "New Sequence"}
            </DialogTitle>
          </DialogHeader>
          <SequenceBuilder
            initialSequence={editingSequence}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}