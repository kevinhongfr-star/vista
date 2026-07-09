"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Send, Mail } from "lucide-react"
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
  const [templateType, setTemplateType] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal">
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