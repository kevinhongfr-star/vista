"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
  MessageSquare,
  Phone,
  Calendar,
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  Edit3,
  Save,
  Copy,
  ChevronRight,
  Loader2,
  ArrowRight,
  Users,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EmailTemplate } from "@/lib/types"

export interface SequenceStep {
  id: string
  type: "email" | "linkedin" | "call" | "meeting" | "task"
  day_offset: number
  title: string
  subject?: string
  body?: string
  template_id?: string
  success_criteria?: string
  notes?: string
}

export interface OutreachSequence {
  id: string
  name: string
  description: string
  type: string
  steps: SequenceStep[]
  status: "Draft" | "Active" | "Paused" | "Archived"
  created_at?: string
  updated_at?: string
  total_contacts?: number
  active_contacts?: number
  completion_rate?: number
}

interface SequenceBuilderProps {
  initialSequence?: OutreachSequence
  templates?: EmailTemplate[]
  onSave?: (sequence: OutreachSequence) => void
}

const STEP_TYPES = [
  { value: "email", label: "Email", icon: Mail, color: "bg-blue-500" },
  { value: "linkedin", label: "LinkedIn", icon: MessageSquare, color: "bg-sky-500" },
  { value: "call", label: "Call", icon: Phone, color: "bg-green-500" },
  { value: "meeting", label: "Meeting", icon: Calendar, color: "bg-purple-500" },
  { value: "task", label: "Task", icon: Clock, color: "bg-amber-500" },
]

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl-1",
    template_name: "Executive Brief Invitation",
    template_type: "Executive Brief",
    subject_template: "Exclusive Executive Brief: {program_name}",
    body_template: "Dear {contact_name},\n\nI would like to invite you to our exclusive executive brief on {program_name}.\n\nBest regards,\nKevin Hong",
    variables: ["{contact_name}", "{program_name}"],
    created_at: null,
    updated_at: null,
  },
  {
    id: "tpl-2",
    template_name: "Follow-up Email",
    template_type: "Follow-up",
    subject_template: "Following Up: {topic}",
    body_template: "Hi {contact_name},\n\nJust following up on our conversation about {topic}.\n\nBest,\nKevin",
    variables: ["{contact_name}", "{topic}"],
    created_at: null,
    updated_at: null,
  },
  {
    id: "tpl-3",
    template_name: "Re-engagement",
    template_type: "Re-engagement",
    subject_template: "Catching Up",
    body_template: "Hi {contact_name},\n\nIt's been a while since we connected...\n\nBest,\nKevin",
    variables: ["{contact_name}"],
    created_at: null,
    updated_at: null,
  },
]

export function SequenceBuilder({
  initialSequence,
  templates: propTemplates,
  onSave,
}: SequenceBuilderProps) {
  const templateList = propTemplates || DEFAULT_TEMPLATES
  const { toasts, addToast, dismissToast } = useToasts()

  const [name, setName] = useState(initialSequence?.name || "")
  const [description, setDescription] = useState(initialSequence?.description || "")
  const [type, setType] = useState(initialSequence?.type || "Custom")
  const [steps, setSteps] = useState<SequenceStep[]>(
    initialSequence?.steps || generateSampleSteps()
  )
  const [status, setStatus] = useState<"Draft" | "Active" | "Paused" | "Archived">(
    (initialSequence?.status as any) || "Draft"
  )
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const addStep = (stepType: string) => {
    const typeInfo = STEP_TYPES.find((t) => t.value === stepType)
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      type: stepType as any,
      day_offset: steps.length > 0 ? steps[steps.length - 1].day_offset + 2 : 0,
      title: typeInfo?.label || "New Step",
      success_criteria: "Response or booking",
    }
    setSteps([...steps, newStep])
  }

  const openEditStep = (step: SequenceStep) => {
    setEditingStep({ ...step })
    setIsEditOpen(true)
  }

  const saveStep = () => {
    if (!editingStep) return
    setSteps(steps.map((s) => (s.id === editingStep.id ? editingStep : s)))
    setIsEditOpen(false)
    setEditingStep(null)
  }

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId))
  }

  const handleDragStart = useCallback(
    (e: React.DragEvent, stepId: string) => {
      setDraggedId(stepId)
      e.dataTransfer.effectAllowed = "move"
    },
    []
  )

  const handleDragOver = useCallback((e: React.DragEvent, stepId: string) => {
    e.preventDefault()
    setDragOverId(stepId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverId(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault()
      if (!draggedId || draggedId === targetId) {
        setDraggedId(null)
        setDragOverId(null)
        return
      }

      const newSteps = [...steps]
      const draggedIndex = newSteps.findIndex((s) => s.id === draggedId)
      const targetIndex = newSteps.findIndex((s) => s.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) return

      const [removed] = newSteps.splice(draggedIndex, 1)
      newSteps.splice(targetIndex, 0, removed)

      // Re-calculate day offsets based on position
      let offset = 0
      const recalculated = newSteps.map((step, i) => {
        const s = { ...step, day_offset: offset }
        offset += i === 0 ? 0 : 2
        return s
      })

      setSteps(recalculated)
      setDraggedId(null)
      setDragOverId(null)
    },
    [draggedId, steps]
  )

  const handleSave = async () => {
    if (!name.trim()) {
      addToast("error", "Sequence name is required")
      return
    }
    if (steps.length === 0) {
      addToast("error", "Add at least one step to the sequence")
      return
    }

    setIsSaving(true)
    try {
      const sequence: OutreachSequence = {
        id: initialSequence?.id || `seq-${Date.now()}`,
        name,
        description,
        type,
        steps,
        status,
        updated_at: new Date().toISOString(),
        created_at: initialSequence?.created_at || new Date().toISOString(),
      }

      // Simulate API call
      await new Promise((r) => setTimeout(r, 500))

      addToast("success", "Sequence saved successfully")
      onSave?.(sequence)
    } catch {
      addToast("error", "Failed to save sequence")
    } finally {
      setIsSaving(false)
    }
  }

  const duplicateStep = (step: SequenceStep) => {
    const newStep: SequenceStep = {
      ...step,
      id: `step-${Date.now()}`,
      day_offset: step.day_offset + 1,
    }
    const index = steps.findIndex((s) => s.id === step.id)
    const newSteps = [...steps]
    newSteps.splice(index + 1, 0, newStep)
    setSteps(newSteps)
  }

  const totalDays = steps.length > 0 ? steps[steps.length - 1].day_offset + 1 : 0

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seq-name">Sequence Name *</Label>
                <Input
                  id="seq-name"
                  placeholder="e.g., Executive Brief Outreach Sequence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seq-desc">Description</Label>
                <Input
                  id="seq-desc"
                  placeholder="Brief description of this sequence"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seq-type">Sequence Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executive Brief">Executive Brief</SelectItem>
                    <SelectItem value="Webinar Outreach">Webinar Outreach</SelectItem>
                    <SelectItem value="Re-engagement">Re-engagement</SelectItem>
                    <SelectItem value="Nurture">Nurture</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seq-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>{steps.length} steps</span>
              <span>•</span>
              <span>{totalDays} days total</span>
            </div>
            <div className="flex-1" />
            <Badge variant="secondary">{status}</Badge>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Sequence
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Sequence Steps</CardTitle>
              <CardDescription>
                Drag steps to reorder. Click to edit.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {STEP_TYPES.map((stepType) => {
                const Icon = stepType.icon
                return (
                  <Tooltip key={stepType.value}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addStep(stepType.value)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <Icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add {stepType.label} step</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {steps.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border" />
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const typeInfo = STEP_TYPES.find((t) => t.value === step.type)
                  const Icon = typeInfo?.icon || Mail
                  return (
                    <div
                      key={step.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, step.id)}
                      onDragOver={(e) => handleDragOver(e, step.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, step.id)}
                      className={cn(
                        "relative flex gap-3 p-3 border rounded-lg bg-background transition-all group",
                        dragOverId === step.id && "border-accent-fuchsia border-2",
                        draggedId === step.id && "opacity-50"
                      )}
                    >
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0",
                            typeInfo?.color || "bg-gray-500"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Day {step.day_offset + 1}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {typeInfo?.label || step.type}
                          </Badge>
                          {step.template_id && (
                            <Badge variant="secondary" className="text-xs">
                              Uses template
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mt-1">{step.title}</p>
                        {step.subject && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Subject: {step.subject}
                          </p>
                        )}
                        {step.success_criteria && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ✓ {step.success_criteria}
                          </p>
                        )}
                      </div>
                      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditStep(step)}
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
                              onClick={() => duplicateStep(step)}
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
                              onClick={() => deleteStep(step.id)}
                              className="text-error hover:text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No steps yet</p>
              <p className="text-sm mt-1">
                Add your first step to build the sequence
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {STEP_TYPES.slice(0, 3).map((stepType) => {
                  const Icon = stepType.icon
                  return (
                    <Button
                      key={stepType.value}
                      variant="outline"
                      onClick={() => addStep(stepType.value)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {stepType.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Step Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Configure this step in the sequence
            </DialogDescription>
          </DialogHeader>

          {editingStep && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Step Type</Label>
                  <Select
                    value={editingStep.type}
                    onValueChange={(v) =>
                      setEditingStep({ ...editingStep, type: v as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step-day">Day Offset</Label>
                  <Input
                    id="step-day"
                    type="number"
                    value={editingStep.day_offset}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        day_offset: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-title">Step Title</Label>
                <Input
                  id="step-title"
                  value={editingStep.title}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, title: e.target.value })
                  }
                />
              </div>

              {(editingStep.type === "email" || editingStep.type === "linkedin") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="step-template">Use Template (Optional)</Label>
                    <Select
                      value={editingStep.template_id || ""}
                      onValueChange={(v) => {
                        const tpl = templateList.find((t) => t.id === v)
                        setEditingStep({
                          ...editingStep,
                          template_id: v || undefined,
                          subject: tpl?.subject_template || editingStep.subject,
                          body: tpl?.body_template || editingStep.body,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Custom message</SelectItem>
                        {templateList.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.template_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editingStep.type === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="step-subject">Subject</Label>
                      <Input
                        id="step-subject"
                        value={editingStep.subject || ""}
                        onChange={(e) =>
                          setEditingStep({ ...editingStep, subject: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="step-body">Message Body</Label>
                    <textarea
                      id="step-body"
                      value={editingStep.body || ""}
                      onChange={(e) =>
                        setEditingStep({ ...editingStep, body: e.target.value })
                      }
                      rows={6}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono text-xs"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="step-criteria">Success Criteria</Label>
                <Input
                  id="step-criteria"
                  placeholder="e.g., Response or meeting booked"
                  value={editingStep.success_criteria || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, success_criteria: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="step-notes">Notes (Internal)</Label>
                <textarea
                  id="step-notes"
                  value={editingStep.notes || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, notes: e.target.value })
                  }
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Internal notes about this step..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                setEditingStep(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveStep}>Save Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function generateSampleSteps(): SequenceStep[] {
  return [
    {
      id: "step-1",
      type: "email",
      day_offset: 0,
      title: "Initial Outreach - Executive Brief Invitation",
      subject: "Exclusive Executive Brief: {program_name}",
      body: "Dear {contact_name},\n\nI would like to invite you to our exclusive executive brief...",
      template_id: "tpl-1",
      success_criteria: "Email opened or reply received",
    },
    {
      id: "step-2",
      type: "linkedin",
      day_offset: 2,
      title: "LinkedIn Connection Request",
      body: "Hi {contact_name}, I'd love to connect on LinkedIn. I've been following your work at {company} and...",
      success_criteria: "Connection accepted",
    },
    {
      id: "step-3",
      type: "email",
      day_offset: 4,
      title: "Follow-up Email",
      subject: "Following Up: Executive Brief",
      body: "Hi {contact_name},\n\nJust following up on my previous email about...",
      template_id: "tpl-2",
      success_criteria: "Reply or meeting booked",
    },
    {
      id: "step-4",
      type: "call",
      day_offset: 7,
      title: "Discovery Call",
      success_criteria: "Call completed or meeting booked",
      notes: "If no response after email + LinkedIn, call directly",
    },
    {
      id: "step-5",
      type: "task",
      day_offset: 10,
      title: "Break-up / Re-evaluate",
      success_criteria: "Decision made on next steps",
      notes: "Review engagement and decide whether to continue or move to nurture",
    },
  ]
}