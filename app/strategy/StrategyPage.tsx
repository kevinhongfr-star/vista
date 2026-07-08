"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toaster, useToasts } from "@/components/ui/toast"
import { formatDate, truncateText } from "@/lib/utils"
import { Lightbulb, Plus, Calendar, Filter, CheckCircle, Crosshair, Focus, FileText, Loader2, AlertCircle } from "lucide-react"
import type { StrategicNote, VistaContact, DensityCluster } from "@/lib/types"

const NOTE_CATEGORIES = ["Priority", "Insight", "Action-Item"]
const NOTE_STATUSES = ["Active", "Archived"]

interface StrategyPageProps {
  notes: StrategicNote[]
  totalCount: number
  contacts: Pick<VistaContact, 'id' | 'name' | 'company'>[]
  clusters: Pick<DensityCluster, 'cluster_id' | 'industry' | 'geography'>[]
}

export function StrategyPage({ notes: initialNotes, totalCount, contacts, clusters }: StrategyPageProps) {
  const [notes, setNotes] = useState<StrategicNote[]>(initialNotes)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [formCategory, setFormCategory] = useState<string>("")
  const [formDescription, setFormDescription] = useState<string>("")
  const [formContactId, setFormContactId] = useState<string>("")
  const [formClusterId, setFormClusterId] = useState<string>("")
  const [formAuthor, setFormAuthor] = useState<string>("")
  const [formStatus, setFormStatus] = useState<string>("Active")

  const { toasts, addToast, dismissToast } = useToasts()

  const filteredNotes = notes.filter((note) => {
    if (filterCategory !== "all" && note.category !== filterCategory && note.note_type !== filterCategory) return false
    if (filterStatus !== "all" && note.status !== filterStatus) return false
    return true
  })

  const categoryColors: Record<string, string> = {
    Priority: "bg-error/10 text-error",
    Insight: "bg-info/10 text-info",
    "Action-Item": "bg-warning/10 text-warning",
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    Priority: <AlertCircle className="h-4 w-4" />,
    Insight: <Lightbulb className="h-4 w-4" />,
    "Action-Item": <CheckCircle className="h-4 w-4" />,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formCategory || !formDescription.trim()) {
      addToast("error", "Category and description are required")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/strategic-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formCategory,
          note_type: formCategory,
          description: formDescription,
          contact_id: formContactId || null,
          cluster_id: formClusterId || null,
          author: formAuthor || null,
          status: formStatus,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create note")
      }

      setNotes([data.note, ...notes])
      addToast("success", "Strategic note created successfully")
      
      setFormCategory("")
      setFormDescription("")
      setFormContactId("")
      setFormClusterId("")
      setFormAuthor("")
      setFormStatus("Active")
      setIsAddingNote(false)
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Failed to create note")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Strategy</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{totalCount} notes</Badge>
          <Button onClick={() => setIsAddingNote(!isAddingNote)} disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {isAddingNote && (
        <Card>
          <CardHeader>
            <CardTitle>Create Strategic Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact (Optional)</Label>
                  <Select value={formContactId} onValueChange={setFormContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name || "Unknown"} {contact.company ? `(${contact.company})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cluster">Cluster (Optional)</Label>
                  <Select value={formClusterId} onValueChange={setFormClusterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cluster" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {clusters.map((cluster) => (
                        <SelectItem key={cluster.cluster_id} value={cluster.cluster_id}>
                          {cluster.industry} — {cluster.geography}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="author">Author (Optional)</Label>
                  <Input
                    id="author"
                    placeholder="Author name"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Strategic note description..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Note"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNote(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {NOTE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {NOTE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredNotes.length} notes</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <Card key={note.note_id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg", categoryColors[note.category || note.note_type || "Insight"])}>
                    {categoryIcons[note.category || note.note_type || "Insight"] || <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{note.category || note.note_type || "Note"}</Badge>
                        {note.status && (
                          <Badge variant="secondary" className={cn(
                            note.status === "Active" && "bg-success/10 text-success",
                            note.status === "Archived" && "bg-muted"
                          )}>
                            {note.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(note.created_at)}
                      </div>
                    </div>
                    <p className="text-sm">{truncateText(note.description, 200)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      {note.author && <span>Author: {note.author}</span>}
                      {note.contact_id && <span>• Contact: {note.contact_id}</span>}
                      {note.cluster_id && <span>• Cluster: {note.cluster_id.slice(0, 8)}...</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No strategic notes found. Add a note to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
