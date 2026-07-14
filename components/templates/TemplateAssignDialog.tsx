"use client"

import { useState } from "react"
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
import { Toaster, useToasts } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Loader2, Mail, Users, Search, Check } from "lucide-react"
import type { EmailTemplate, VistaContact } from "@/lib/types"

interface TemplateAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: EmailTemplate[]
  contacts?: Pick<VistaContact, "id" | "name" | "company" | "role">[]
  mode?: "single" | "bulk"
  defaultContactId?: string
  defaultContactName?: string
  onSuccess?: () => void
}

export function TemplateAssignDialog({
  open,
  onOpenChange,
  templates,
  contacts = [],
  mode = "single",
  defaultContactId,
  defaultContactName,
  onSuccess,
}: TemplateAssignDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    defaultContactId ? [defaultContactId] : []
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toasts, addToast, dismissToast } = useToasts()

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q)
    )
  })

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      addToast("error", "Please select a template")
      return
    }
    if (selectedContacts.length === 0) {
      addToast("error", "Please select at least one contact")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_ids: selectedContacts,
          template_id: selectedTemplate,
        }),
      })
      const data = await response.json()

      if (data.success) {
        addToast("success", `Assigned template to ${data.count} contact${data.count > 1 ? "s" : ""}`)
        onOpenChange(false)
        onSuccess?.()
        setSelectedTemplate("")
        setSelectedContacts(defaultContactId ? [defaultContactId] : [])
      } else {
        addToast("error", data.error || "Failed to assign template")
      }
    } catch {
      addToast("error", "Failed to assign template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  const selectAll = () => {
    setSelectedContacts(filteredContacts.map((c) => c.id))
  }

  const clearAll = () => {
    setSelectedContacts([])
  }

  return (
    <>
      <Toaster toasts={toasts} onDismiss={dismissToast} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Assign Template to Contacts
            </DialogTitle>
            <DialogDescription>
              Start an outreach sequence for selected contacts
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Select Template *</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{t.template_name}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {t.template_type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === "bulk" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Contacts *</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      Select all ({filteredContacts.length})
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => toggleContact(contact.id)}
                        className="flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedContacts.includes(contact.id)
                              ? "bg-accent-fuchsia border-accent-fuchsia"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedContacts.includes(contact.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {contact.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.role} {contact.company ? `@ ${contact.company}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No contacts found
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedContacts.length} contact{selectedContacts.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
              </div>
            )}

            {mode === "single" && defaultContactName && (
              <div className="space-y-2">
                <Label>Contact</Label>
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium">{defaultContactName}</p>
                  <p className="text-xs text-muted-foreground">
                    Will be assigned to selected template
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Start Outreach
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}