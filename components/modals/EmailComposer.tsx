"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Send, Mail, Sparkles, Loader2, Eye, Save, Copy, Check, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToasts, Toaster } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { EmailTemplate, VistaContact } from "@/lib/types"

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  prefilledContact?: VistaContact
  prefilledContacts?: VistaContact[]
  defaultTemplateId?: string
  onSaveDraft?: (draft: { subject: string; body: string; template_id?: string }) => void
  onSend?: () => void
}

const TEMPLATE_LABELS: Record<string, string> = {
  "Executive Brief": "Executive Brief Invitation",
  "Webinar Invite": "Webinar Invitation",
  "Podcast Invite": "Podcast Guest Invitation",
  "Newsletter": "Newsletter Subscription",
  "Event Invite": "Event Invitation",
  "Follow-up": "Follow-up After Meeting",
  "Re-engagement": "Re-engagement",
  "Custom": "Custom Message",
}

export function EmailComposer({
  isOpen,
  onClose,
  prefilledContact,
  prefilledContacts,
  defaultTemplateId,
  onSaveDraft,
  onSend,
}: EmailComposerProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [templateId, setTemplateId] = useState("")
  const [templateType, setTemplateType] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)
  const [tone, setTone] = useState<"formal" | "warm" | "direct">("warm")
  const [showVariables, setShowVariables] = useState(false)

  const contacts = prefilledContacts || (prefilledContact ? [prefilledContact] : [])
  const primaryContact = contacts[0]
  const toEmails = contacts.map((c) => c.email).filter(Boolean).join(", ")

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      return
    }
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        const tpls = data.templates || []
        setTemplates(tpls)
        if (defaultTemplateId) {
          const tpl = tpls.find((t: EmailTemplate) => t.id === defaultTemplateId)
          if (tpl) {
            setTemplateId(tpl.id)
            setTemplateType(tpl.template_type)
          }
        }
      })
  }, [isOpen, defaultTemplateId])

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setSubject(replaceVariables(template.subject_template))
        setBody(replaceVariables(template.body_template))
      }
    }
  }, [templateId, templates])

  const resetForm = () => {
    setTemplateId("")
    setTemplateType("")
    setSubject("")
    setBody("")
    setIsSending(false)
    setIsGenerating(false)
    setErrors({})
    setPreviewMode(false)
  }

  const replaceVariables = (text: string): string => {
    if (!primaryContact) return text
    return text
      .replace(/{contact_name}/gi, primaryContact.name || "there")
      .replace(/{company_name}/gi, primaryContact.company || "your company")
      .replace(/{company}/gi, primaryContact.company || "your company")
      .replace(/{role}/gi, primaryContact.role || "")
      .replace(/{program_name}/gi, "")
      .replace(/{webinar_title}/gi, "")
      .replace(/{webinar_date}/gi, "")
      .replace(/{podcast_name}/gi, "")
      .replace(/{newsletter_name}/gi, "")
  }

  const detectVariables = (text: string): string[] => {
    const matches = text.match(/\{[^}]+\}/g) || []
    return Array.from(new Set(matches))
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  const charCount = body.length
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  const handleGenerateAIDraft = async () => {
    if (contacts.length === 0) {
      addToast("error", "No recipients selected")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/intelligence/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_ids: contacts.map((c) => c.id),
          template_type: templateType || undefined,
          tone,
          context: `Writing style: ${tone}`,
        }),
      })
      const data = await res.json()
      if (data.success && data.emails && data.emails[0]) {
        setSubject(data.emails[0].subject)
        setBody(data.emails[0].body)
        addToast("success", "AI draft generated — review and edit before sending")
      } else {
        addToast("error", `AI draft failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      addToast("error", `AI draft failed: ${String(error)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!subject.trim() && !body.trim()) {
      addToast("error", "Add some content before saving")
      return
    }
    setIsSaving(true)
    try {
      onSaveDraft?.({
        subject,
        body,
        template_id: templateId || undefined,
      })
      addToast("success", "Draft saved")
    } catch {
      addToast("error", "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      addToast("success", "Copied to clipboard")
    } catch {
      addToast("error", "Failed to copy")
    }
  }

  const handleSend = async () => {
    const newErrors: Record<string, string> = {}
    if (contacts.length === 0) newErrors.recipients = "No recipients selected"
    if (!subject.trim()) newErrors.subject = "Subject is required"
    if (!body.trim()) newErrors.body = "Email body is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      addToast("error", "Please fix the highlighted fields")
      return
    }

    setIsSending(true)

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_ids: contacts.map((c) => c.id),
          template_id: templateId || undefined,
          subject,
          body,
        }),
      })

      const data = await res.json()

      if (data.success) {
        addToast("success", `Email sent to ${data.emails_logged || contacts.length} contact(s)`)
        onSend?.()
        onClose()
        router.refresh()
      } else {
        addToast("error", `Failed to send email: ${data.error}`)
      }
    } catch (error) {
      addToast("error", `Failed to send email: ${String(error)}`)
    } finally {
      setIsSending(false)
    }
  }

  const variables = detectVariables(subject + " " + body)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-modal flex flex-col">
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-fuchsia/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Email Composer</h2>
              <p className="text-sm text-muted-foreground">
                Send to {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30 min-h-[36px]">
              {contacts.length > 0 ? (
                contacts.slice(0, 5).map((c) => (
                  <Badge key={c.id} variant="secondary" className="text-xs gap-1">
                    {c.name}
                    {c.company && <span className="text-muted-foreground">@ {c.company}</span>}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground px-2">No recipients</span>
              )}
              {contacts.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{contacts.length - 5} more
                </Badge>
              )}
            </div>
          </div>

          {/* Template + AI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Start from scratch</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI Tone</Label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="warm">Warm &amp; Friendly</SelectItem>
                  <SelectItem value="direct">Direct &amp; Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI Generate */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAIDraft}
              disabled={isGenerating || contacts.length === 0}
              className="border-accent-fuchsia/30 text-accent-fuchsia hover:bg-accent-fuchsia/10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Draft
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              Personalized draft based on contact data &amp; signals
            </span>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject">Subject</Label>
              <span className="text-xs text-muted-foreground">{subject.length} chars</span>
            </div>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: "" }))
              }}
              placeholder="Enter subject line"
              className={cn(errors.subject && "border-error focus-visible:ring-error")}
            />
            {errors.subject && <p className="text-xs text-error">{errors.subject}</p>}
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Body</Label>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{wordCount} words</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTimeMinutes} min read
                </span>
              </div>
            </div>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value)
                    if (errors.body) setErrors((prev) => ({ ...prev, body: "" }))
                  }}
                  placeholder="Write your email here..."
                  className={cn("min-h-[220px] font-mono text-sm resize-none", errors.body && "border-error focus-visible:ring-error")}
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[220px] p-4 border rounded-md bg-muted/20">
                  <p className="text-lg font-semibold mb-3">{subject || "(No subject)"}</p>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {body || "(No content)"}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            {errors.body && <p className="text-xs text-error">{errors.body}</p>}

            {/* Variables panel */}
            {variables.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVariables(!showVariables)}
                  className="text-xs h-6 px-2 -mt-1"
                >
                  {showVariables ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide variables
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {variables.length} variable{variables.length !== 1 ? "s" : ""} detected
                    </>
                  )}
                </Button>
                {showVariables && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-3 bg-muted/30 rounded-md">
                    {variables.map((v) => (
                      <Tooltip key={v}>
                        <TooltipTrigger asChild>
                          <code className="text-xs bg-background px-2 py-1 rounded border cursor-help">
                            {v}
                          </code>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Will be replaced with contact data</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t bg-muted/30 flex-shrink-0">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyToClipboard}
              disabled={!body && !subject}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving || (!subject && !body)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}