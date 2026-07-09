"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Clock, Phone, Mail, FileText, Calendar } from "lucide-react"
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
import type { ActivityType, ACTIVITY_TYPES, VistaContact } from "@/lib/types"

interface ActivityLogProps {
  isOpen: boolean
  onClose: () => void
  prefilledContact?: VistaContact
  prefilledType?: ActivityType
}

const ACTIVITY_ITEMS = [
  { value: "Email Sent", label: "Email Sent", icon: Mail },
  { value: "Email Opened", label: "Email Opened", icon: Mail },
  { value: "Email Replied", label: "Email Replied", icon: Mail },
  { value: "Call", label: "Call", icon: Phone },
  { value: "Meeting", label: "Meeting", icon: Calendar },
  { value: "Note", label: "Note", icon: FileText },
  { value: "Webinar Invite", label: "Webinar Invite", icon: Calendar },
  { value: "Podcast Invite", label: "Podcast Invite", icon: Calendar },
  { value: "Newsletter Invite", label: "Newsletter Invite", icon: Calendar },
  { value: "Event Invite", label: "Event Invite", icon: Calendar },
  { value: "LinkedIn Message", label: "LinkedIn Message", icon: Mail },
]

export function ActivityLog({ isOpen, onClose, prefilledContact, prefilledType }: ActivityLogProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [isLogging, setIsLogging] = useState(false)
  const [activityType, setActivityType] = useState(prefilledType || "")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [subject, setSubject] = useState("")
  const [notes, setNotes] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [contacts, setContacts] = useState<VistaContact[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      return
    }
    if (prefilledContact) {
      setContacts([prefilledContact])
    } else {
      fetch("/api/contacts?limit=50")
        .then(res => res.json())
        .then(data => setContacts(data.contacts || []))
    }
  }, [isOpen, prefilledContact])

  const resetForm = () => {
    setActivityType(prefilledType || "")
    setDate(new Date().toISOString().split("T")[0])
    setSubject("")
    setNotes("")
    setDurationMinutes("")
    setIsLogging(false)
  }

  const handleLog = async () => {
    // Validation
    const newErrors: Record<string, string> = {}
    if (!activityType) newErrors.activityType = "Activity type is required"
    if (!prefilledContact?.id) newErrors.contact = "Contact is required"
    if ((activityType === "Call" || activityType === "Meeting") && !durationMinutes) {
      newErrors.duration = "Duration is required for calls and meetings"
    }
    if ((activityType === "Call" || activityType === "Meeting") && durationMinutes) {
      const duration = parseInt(durationMinutes)
      if (isNaN(duration) || duration <= 0) {
        newErrors.duration = "Duration must be a positive number"
      }
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      addToast("error", "Please fix the highlighted fields")
      return
    }

    setIsLogging(true)

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: prefilledContact!.id,
          activity_type: activityType,
          activity_date: `${date}T09:00:00`,
          subject: subject || activityType,
          content: notes,
          notes,
          duration_minutes: activityType === "Call" || activityType === "Meeting" 
            ? parseInt(durationMinutes) || 30 
            : undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        addToast("success", `Activity logged: ${activityType}`)
        onClose()
        router.refresh()
      } else {
        addToast("error", `Failed to log activity: ${data.error}`)
      }
    } catch (error) {
      addToast("error", `Failed to log activity: ${String(error)}`)
    } finally {
      setIsLogging(false)
    }
  }

  const requiresDuration = activityType === "Call" || activityType === "Meeting"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-modal">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-fuchsia/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Log Activity</h2>
              {prefilledContact && (
                <p className="text-sm text-muted-foreground">
                  For {prefilledContact.name} ({prefilledContact.company})
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type</Label>
            <Select value={activityType} onValueChange={(value) => {
              setActivityType(value)
              if (errors.activityType) setErrors(prev => ({ ...prev, activityType: "" }))
            }}>
              <SelectTrigger className={cn(errors.activityType && "border-error")}>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_ITEMS.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityType && (
              <p className="text-xs text-error">{errors.activityType}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject or summary"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter details about the activity..."
              className="min-h-[100px]"
            />
          </div>

          {/* Duration (for Call/Meeting) */}
          {requiresDuration && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(e.target.value)
                  if (errors.duration) setErrors(prev => ({ ...prev, duration: "" }))
                }}
                placeholder="30"
                min="1"
                max="480"
                className={cn(errors.duration && "border-error focus-visible:ring-error")}
              />
              {errors.duration && (
                <p className="text-xs text-error">{errors.duration}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLog} disabled={isLogging}>
            {isLogging ? "Logging..." : "Log Activity"}
          </Button>
        </div>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}