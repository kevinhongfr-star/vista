"use client"

import { cn } from "@/lib/utils"
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
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { Calendar, Plus, Users, DollarSign, CheckCircle, X, Loader2, Target, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useToasts, Toaster } from "@/components/ui/toast"
import { PROGRAM_TYPES, PROGRAM_STATUSES } from "@/lib/types"
import type { Program, ProgramAssignment, ProgramType, ProgramStatus } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ProgramsPageProps {
  programs: Program[]
  assignments: ProgramAssignment[]
  totalCount: number
  contacts?: { id: string; name: string | null; company: string | null }[]
  clusters?: { cluster_id: string; industry: string; geography: string }[]
}

interface CreateProgramForm {
  name: string
  type: ProgramType | string
  target_cluster: string
  description: string
  status: ProgramStatus | string
}

interface AssignContactForm {
  contact_id: string
  program_id: string
}

export function ProgramsPage({ programs: initialPrograms, assignments: initialAssignments, totalCount, contacts = [], clusters = [] }: ProgramsPageProps) {
  const { toasts, addToast, dismissToast } = useToasts()
  const [programs, setPrograms] = useState<Program[]>(initialPrograms)
  const [assignments, setAssignments] = useState<ProgramAssignment[]>(initialAssignments)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  const [formData, setFormData] = useState<CreateProgramForm>({
    name: '',
    type: PROGRAM_TYPES[0],
    target_cluster: '',
    description: '',
    status: PROGRAM_STATUSES[0],
  })

  const [assignData, setAssignData] = useState<AssignContactForm>({
    contact_id: '',
    program_id: '',
  })

  const statusColors: Record<string, string> = {
    Active: "bg-success text-white",
    Completed: "bg-info text-white",
    Inviting: "bg-warning text-white",
    Planned: "bg-muted",
    Cancelled: "bg-destructive text-white",
  }

  const tierColors: Record<string, string> = {
    Free: "bg-info/10 text-info",
    Paid: "bg-accent-fuchsia/10 text-accent-fuchsia",
  }

  const activePrograms = programs.filter(p => p.status === 'Active').length
  const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrolled_count || 0), 0)
  const totalRevenue = programs.reduce((sum, p) => sum + (p.revenue_actual || 0), 0)

  const getAssignedCount = (programId: string) => {
    return assignments.filter(a => a.program_id === programId).length
  }

  const getCompletionRate = (programId: string) => {
    const programAssignments = assignments.filter(a => a.program_id === programId)
    if (programAssignments.length === 0) return 0
    const completed = programAssignments.filter(a => a.status === 'Completed' || a.status === 'Meeting Booked').length
    return Math.round((completed / programAssignments.length) * 100)
  }

  const handleCreateProgram = async () => {
    if (!formData.name.trim()) {
      addToast('error', 'Program name is required')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create program')
      }

      setPrograms(prev => [result.program, ...prev])
      setShowCreateModal(false)
      setFormData({
        name: '',
        type: PROGRAM_TYPES[0],
        target_cluster: '',
        description: '',
        status: PROGRAM_STATUSES[0],
      })
      addToast('success', 'Program created successfully')
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Failed to create program')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAssignContact = async () => {
    if (!assignData.contact_id || !assignData.program_id) {
      addToast('error', 'Both contact and program are required')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch('/api/programs/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign contact')
      }

      setAssignments(prev => [result.assignment, ...prev])
      setShowAssignModal(false)
      setAssignData({ contact_id: '', program_id: '' })
      addToast('success', 'Contact assigned to program successfully')
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Failed to assign contact')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{totalCount} programs</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setShowAssignModal(true)} variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Assign Contact
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assign a contact to a program</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new BD program</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of programs currently active</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <div className="text-2xl font-bold">{activePrograms}</div>
                <div className="text-sm text-muted-foreground">Active Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg bg-info/10">
                    <Users className="h-6 w-6 text-info" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total contacts enrolled across all programs</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <div className="text-2xl font-bold">{totalEnrolled}</div>
                <div className="text-sm text-muted-foreground">Total Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg bg-accent-fuchsia/10">
                    <DollarSign className="h-6 w-6 text-accent-fuchsia" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Actual revenue earned from programs</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Revenue Actual</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Target className="h-6 w-6 text-warning" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of contact-to-program assignments</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <div className="text-sm text-muted-foreground">Total Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Cluster</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.program_id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        {program.name}
                        {program.description && (
                          <div className="text-xs text-muted-foreground mt-1">{program.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[program.status || 'Planned']}>
                        {program.status || 'Planned'}
                      </Badge>
                    </TableCell>
                    <TableCell>{program.cluster_id || '-'}</TableCell>
                    <TableCell>
                      <span className="font-medium">{getAssignedCount(program.program_id)}</span>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-success"
                                style={{ width: `${getCompletionRate(program.program_id)}%` }}
                              />
                            </div>
                            <span className="text-sm">{getCompletionRate(program.program_id)}%</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of assignments completed or meeting booked</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <span className="font-medium">{program.enrolled_count || 0}</span>
                            {program.capacity && (
                              <span className="text-muted-foreground">/{program.capacity}</span>
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{program.capacity ? `Enrolled ${program.enrolled_count || 0} of ${program.capacity} capacity` : `Enrolled: ${program.enrolled_count || 0} (no capacity set)`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {program.revenue_actual ? `$${program.revenue_actual.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No programs found. Create a program to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell>{assignment.contact_id}</TableCell>
                    <TableCell>{assignment.program_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                    <TableCell>
                      {assignment.revenue_attributed ? `$${assignment.revenue_attributed.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No assignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Program</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  placeholder="Enter program name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Program Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_cluster">Target Cluster</Label>
                <Select value={formData.target_cluster} onValueChange={(value) => setFormData(prev => ({ ...prev, target_cluster: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target cluster (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusters.map((cluster) => (
                      <SelectItem key={cluster.cluster_id} value={cluster.cluster_id}>
                        {cluster.industry} - {cluster.geography}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter program description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateProgram} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Program'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Contact Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assign Contact to Program</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowAssignModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assign-contact">Contact</Label>
                <Select value={assignData.contact_id} onValueChange={(value) => setAssignData(prev => ({ ...prev, contact_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name || contact.id} {contact.company ? `- ${contact.company}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-program">Program</Label>
                <Select value={assignData.program_id} onValueChange={(value) => setAssignData(prev => ({ ...prev, program_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.program_id} value={program.program_id}>
                        {program.name} ({program.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAssignContact} disabled={isAssigning}>
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Contact'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
