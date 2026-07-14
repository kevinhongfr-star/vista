"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster, useToasts } from "@/components/ui/toast"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  Mail,
  MessageSquare,
  GitBranch,
  Loader2,
  Eye,
  X,
  Check,
  Archive,
  Users,
  BarChart3,
  Activity,
  Route,
} from "lucide-react"
import type { EmailTemplate } from "@/lib/types"
import { EMAIL_TEMPLATE_TYPES } from "@/lib/types"
import { cn } from "@/lib/utils"
import { OutreachDashboard } from "@/components/outreach/OutreachDashboard"
import { OutreachActivityFeed } from "@/components/outreach/OutreachActivityFeed"
import { SequenceList } from "@/components/sequences/SequenceList"
import { NurtureRouteVisualization } from "@/components/sequences/NurtureRouteVisualization"
import { SequencePerformanceAnalytics } from "@/components/sequences/SequencePerformanceAnalytics"

interface TemplatesPageProps {
  templates: EmailTemplate[]
}

const TEMPLATE_TYPE_ICONS: Record<string, typeof Mail> = {
  "Executive Brief": FileText,
  "Roundtable": Users,
  "Workshop": Users,
  "Webinar Invite": Mail,
  "Advisory": FileText,
  "Podcast": MessageSquare,
  "Newsletter": Mail,
  "Offsite": Users,
  "Follow-up": Mail,
  "Re-engagement": GitBranch,
  "Custom": FileText,
}

export function TemplatesPage({ templates: initialTemplates }: TemplatesPageProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toasts, addToast, dismissToast } = useToasts()

  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState("")
  const [formSubject, setFormSubject] = useState("")
  const [formBody, setFormBody] = useState("")

  const filteredTemplates = templates.filter((t) => {
    if (filterType !== "all" && t.template_type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        t.template_name.toLowerCase().includes(q) ||
        t.subject_template.toLowerCase().includes(q) ||
        t.template_type.toLowerCase().includes(q)
      )
    }
    return true
  })

  const openCreate = () => {
    setFormName("")
    setFormType("")
    setFormSubject("")
    setFormBody("")
    setIsCreateOpen(true)
  }

  const openEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormName(template.template_name)
    setFormType(template.template_type)
    setFormSubject(template.subject_template)
    setFormBody(template.body_template)
    setIsEditOpen(true)
  }

  const openPreview = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formType || !formSubject.trim() || !formBody.trim()) {
      addToast("error", "All fields are required")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: formName,
          template_type: formType,
          subject_template: formSubject,
          body_template: formBody,
          variables: extractVariables(formBody + " " + formSubject),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setTemplates([data.template, ...templates])
        addToast("success", "Template created successfully")
        setIsCreateOpen(false)
      } else {
        addToast("error", data.error || "Failed to create template")
      }
    } catch {
      addToast("error", "Failed to create template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return
    if (!formName.trim() || !formType || !formSubject.trim() || !formBody.trim()) {
      addToast("error", "All fields are required")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: formName,
          template_type: formType,
          subject_template: formSubject,
          body_template: formBody,
          variables: extractVariables(formBody + " " + formSubject),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setTemplates(templates.map((t) => t.id === selectedTemplate.id ? data.template : t))
        addToast("success", "Template updated successfully")
        setIsEditOpen(false)
      } else {
        addToast("error", data.error || "Failed to update template")
      }
    } catch {
      addToast("error", "Failed to update template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Delete template "${template.template_name}"?`)) return
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setTemplates(templates.filter((t) => t.id !== template.id))
        addToast("success", "Template deleted")
      } else {
        addToast("error", data.error || "Failed to delete template")
      }
    } catch {
      addToast("error", "Failed to delete template")
    }
  }

  const handleClone = async (template: EmailTemplate) => {
    const newName = `${template.template_name} (Copy)`
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: newName,
          template_type: template.template_type,
          subject_template: template.subject_template,
          body_template: template.body_template,
          variables: template.variables,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setTemplates([data.template, ...templates])
        addToast("success", "Template cloned")
      } else {
        addToast("error", data.error || "Failed to clone template")
      }
    } catch {
      addToast("error", "Failed to clone template")
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Executive Brief": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      "Webinar Invite": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "Follow-up": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "Re-engagement": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      "Podcast Invite": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      "Newsletter Invite": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      "Event Invite": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      "Custom": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    }
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const TypeIcon = (type: string) => {
    const Icon = TEMPLATE_TYPE_ICONS[type] || FileText
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage outreach templates and sequences
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a new email template</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="outreach" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Outreach Tracking
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="sequences" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Sequences
          </TabsTrigger>
          <TabsTrigger value="nurture" className="gap-2">
            <Route className="h-4 w-4" />
            Nurture Routes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
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
                    <SelectValue placeholder="Template Type" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by template type</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EMAIL_TEMPLATE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredTemplates.length} templates</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", getTypeColor(template.template_type))}>
                          {TypeIcon(template.template_type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{template.template_name}</p>
                          {template.created_at && (
                            <p className="text-xs text-muted-foreground">
                              Updated {new Date(template.updated_at || template.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {template.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">
                      {template.subject_template}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(template.variables || []).slice(0, 3).map((v) => (
                          <code key={v} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {v}
                          </code>
                        ))}
                        {(template.variables || []).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{(template.variables || []).length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPreview(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Preview</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleClone(template)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Clone</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(template)}
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
                              onClick={() => handleDelete(template)}
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No templates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="outreach">
          <OutreachDashboard />
        </TabsContent>

        <TabsContent value="activity">
          <OutreachActivityFeed />
        </TabsContent>

        <TabsContent value="sequences">
          <SequenceList />
        </TabsContent>

        <TabsContent value="nurture">
          <NurtureRouteVisualization />
        </TabsContent>

        <TabsContent value="analytics">
          <SequencePerformanceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Executive Brief Invitation"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Template Type *</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Template *</Label>
              <Input
                id="subject"
                placeholder="Subject line (use {variables} for personalization)"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body Template *</Label>
              <Textarea
                id="body"
                placeholder="Email body (use {variables} for personalization)"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={10}
                className="resize-none font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Detected Variables</Label>
              <div className="flex flex-wrap gap-1.5">
                {extractVariables(formBody + " " + formSubject).length > 0 ? (
                  extractVariables(formBody + " " + formSubject).map((v) => (
                    <code key={v} className="text-xs bg-muted px-2 py-1 rounded">
                      {v}
                    </code>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Use {"{variable_name}"} syntax for personalization
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name *</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Template Type *</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject Template *</Label>
              <Input
                id="edit-subject"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-body">Body Template *</Label>
              <Textarea
                id="edit-body"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={10}
                className="resize-none font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Detected Variables</Label>
              <div className="flex flex-wrap gap-1.5">
                {extractVariables(formBody + " " + formSubject).length > 0 ? (
                  extractVariables(formBody + " " + formSubject).map((v) => (
                    <code key={v} className="text-xs bg-muted px-2 py-1 rounded">
                      {v}
                    </code>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No variables detected</span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.template_name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {selectedTemplate?.template_type}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">SUBJECT</span>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedTemplate?.subject_template}
                  </p>
                </div>
                <div className="border-t pt-2 mt-2">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedTemplate?.body_template}
                  </pre>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Variables</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(selectedTemplate?.variables || []).map((v) => (
                  <code key={v} className="text-xs bg-muted px-2 py-1 rounded">
                    {v}
                  </code>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  if (selectedTemplate) openEdit(selectedTemplate)
                  setIsPreviewOpen(false)
                }}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\{[^}]+\}/g) || []
  return Array.from(new Set(matches))
}