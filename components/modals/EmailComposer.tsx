"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Send, Mail, Sparkles, Loader2, Building2, TrendingUp, Target, Zap, Calendar, ChevronDown, ChevronUp } from "lucide-react"
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
import { useToasts, Toaster } from "@/components/ui/toast"
import type { EmailTemplate, VistaContact } from "@/lib/types"

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  prefilledContact?: VistaContact
  prefilledContacts?: VistaContact[]
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

export function EmailComposer({ isOpen, onClose, prefilledContact, prefilledContacts }: EmailComposerProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [templateType, setTemplateType] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contactSignals, setContactSignals] = useState<{id: string; title: string; signal_type: string; signal_date: string; company?: string}[]>([])
  const [showContext, setShowContext] = useState(true)
  const [contextLoading, setContextLoading] = useState(false)

  // Pre-fill with contact info
  const contacts = prefilledContacts || (prefilledContact ? [prefilledContact] : [])
  const toEmails = contacts.map(c => c.email).filter(Boolean).join(", ")

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      return
    }
    // Load templates
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => {
        setTemplates(data.templates || [])
      })
    // Fetch signals for primary contact
    if (contacts[0]?.company) {
      setContextLoading(true)
      fetch(`/api/signals?company=${encodeURIComponent(contacts[0].company)}&limit=5`)
        .then(r => r.json())
        .then(d => { setContactSignals(d.signals || []) })
        .catch(() => {})
        .finally(() => setContextLoading(false))
    }
  }, [isOpen])

  useEffect(() => {
    if (templateType && templates.length > 0) {
      const template = templates.find(t => t.template_type === templateType)
      if (template) {
        setSubject(replaceVariables(template.subject_template))
        setBody(replaceVariables(template.body_template))
      }
    }
  }, [templateType, templates])

  const resetForm = () => {
    setTemplateType("")
    setSubject("")
    setBody("")
    setIsSending(false)
    setIsGenerating(false)
  }

  const replaceVariables = (text: string): string => {
    const primaryContact = contacts[0]
    if (!primaryContact) return text
    
    return text
      .replace(/{contact_name}/gi, primaryContact.name || "there")
      .replace(/{company_name}/gi, primaryContact.company || "your company")
      .replace(/{company}/gi, primaryContact.company || "your company")
      .replace(/{program_name}/gi, "")
      .replace(/{webinar_title}/gi, "")
      .replace(/{webinar_date}/gi, "")
      .replace(/{podcast_name}/gi, "")
      .replace(/{newsletter_name}/gi, "")
  }

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
          contact_ids: contacts.map(c => c.id),
          template_type: templateType || undefined,
          tone: "warm",
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

  const handleSend = async () => {
    // Validation
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
          contact_ids: contacts.map(c => c.id),
          subject,
          body,
        }),
      })

      const data = await res.json()

      if (data.success) {
        addToast("success", `Email sent to ${data.emails_logged} contact(s)`)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-none shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-fuchsia/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Email Composer</h2>
              <p className="text-sm text-muted-foreground">Send email to {contacts.length} contact(s)</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* To field */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={toEmails}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
            {contacts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contacts.slice(0, 5).map(c => (
                  <span key={c.id} className="text-xs text-muted-foreground">
                    {c.name} ({c.company})
                  </span>
                ))}
                {contacts.length > 5 && (
                  <span className="text-xs text-muted-foreground">+{contacts.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Contact Context Panel */}
          {contacts.length > 0 && showContext && (
            <div className="border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  Context for AI Personalization
                </h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowContext(false)}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
              {contacts.map(c => (
                <div key={c.id} className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Contact:</span>{" "}
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{c.role || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company:</span>{" "}
                    <span className="font-medium flex items-center gap-1"><Building2 className="h-3 w-3" />{c.company || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Industry:</span>{" "}
                    <span className="font-medium">{c.industry || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pipeline:</span>{" "}
                    <span className="font-medium">{c.pipeline_stage || "Prospect"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Score:</span>{" "}
                    <span className="font-medium">{c.priority_score || c.vista_composite || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Contact:</span>{" "}
                    <span className="font-medium">{c.last_contact_date ? new Date(c.last_contact_date).toLocaleDateString() : "Never"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Engagement:</span>{" "}
                    <span className="font-medium">{c.touch_count || 0} touches</span>
                  </div>
                </div>
              ))}
              {/* Company Signals */}
              {contactSignals.length > 0 && (
                <div className="border-t border-border pt-2 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 text-warning" />
                    Company Signals ({contactSignals.length})
                  </p>
                  {contactSignals.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground shrink-0">{s.signal_date ? new Date(s.signal_date).toLocaleDateString() : ""}</span>
                      <span className="font-medium">{s.title}</span>
                      <span className="px-1 py-0.5 bg-accent/10 text-accent text-[10px] ml-auto shrink-0">{s.signal_type}</span>
                    </div>
                  ))}
                </div>
              )}
              {contextLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading signals...
                </div>
              )}
            </div>
          )}
          {contacts.length > 0 && !showContext && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowContext(true)}>
              <ChevronDown className="h-3 w-3 mr-1" /> Show Contact Context
            </Button>
          )}

          {/* Template selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.template_type}>
                    {TEMPLATE_LABELS[t.template_type] || t.template_name}
                  </SelectItem>
                ))}
                {templates.length === 0 && (
                  <SelectItem value="Custom">Custom Message</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* AI Draft Button */}
          <div className="flex items-center gap-2">
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
              AI uses contact profile, pipeline stage, company signals & activity history
            </span>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }))
              }}
              placeholder="Enter subject line"
              className={cn(errors.subject && "border-error focus-visible:ring-error")}
            />
            {errors.subject && (
              <p className="text-xs text-error">{errors.subject}</p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                if (errors.body) setErrors(prev => ({ ...prev, body: "" }))
              }}
              placeholder="Enter email body..."
              className={cn("min-h-[200px]", errors.body && "border-error focus-visible:ring-error")}
            />
            {errors.body && (
              <p className="text-xs text-error">{errors.body}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Available variables:</span>
              <span className="px-2 py-1 bg-muted rounded">{`{contact_name}`}</span>
              <span className="px-2 py-1 bg-muted rounded">{`{company}`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Send className="h-4 w-4 mr-2" />
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

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}