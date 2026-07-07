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
import { formatDate, truncateText } from "@/lib/utils"
import { Lightbulb, Plus, Calendar, Filter, CheckCircle, Crosshair, Focus, FileText } from "lucide-react"
import type { StrategicNote } from "@/lib/types"

const NOTE_TYPES = ["Decision", "Override", "ICP Adjustment", "Focus Shift", "Review"]

interface StrategyPageProps {
  notes: StrategicNote[]
  totalCount: number
}

export function StrategyPage({ notes, totalCount }: StrategyPageProps) {
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")

  const filteredNotes = notes.filter((note) => {
    if (filterType !== "all" && note.note_type !== filterType) return false
    return true
  })

  const typeIcons: Record<string, React.ReactNode> = {
    Decision: <CheckCircle className="h-4 w-4" />,
    Override: <Crosshair className="h-4 w-4" />,
    "ICP Adjustment": <Focus className="h-4 w-4" />,
    "Focus Shift": <Focus className="h-4 w-4" />,
    Review: <FileText className="h-4 w-4" />,
  }

  const typeColors: Record<string, string> = {
    Decision: "bg-info/10 text-info",
    Override: "bg-warning/10 text-warning",
    "ICP Adjustment": "bg-accent-fuchsia/10 text-accent-fuchsia",
    "Focus Shift": "bg-tier-warm/10 text-tier-warm",
    Review: "bg-muted",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Strategy</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{totalCount} notes</Badge>
          <Button onClick={() => setIsAddingNote(!isAddingNote)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <Card>
          <CardHeader>
            <CardTitle>Add Strategic Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noteType">Note Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact (Optional)</Label>
                <Input id="contact" placeholder="Contact ID or name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Strategic note description" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Save Note</Button>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredNotes.length} notes</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notes Feed */}
      <div className="space-y-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <Card key={note.note_id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg", typeColors[note.note_type || "Review"])}>
                    {typeIcons[note.note_type || "Review"]}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{note.note_type}</Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(note.created_at)}
                      </div>
                    </div>
                    <p className="text-sm">{truncateText(note.description, 200)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {note.author && <span>Author: {note.author}</span>}
                      {note.contact_id && <span>• Contact: {note.contact_id}</span>}
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