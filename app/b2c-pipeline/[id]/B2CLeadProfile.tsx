"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  Building2,
  TrendingUp,
  Linkedin,
  Mail,
  Calendar,
  Trophy,
  MessageSquare,
  ArrowUpRight,
  UserCheck,
} from "lucide-react"
import { useToasts } from "@/components/ui/toast"

interface B2CLeadProfileProps {
  lead: Record<string, any>
  events: any[]
  conversion: any | null
}

export function B2CLeadProfile({ lead, events, conversion }: B2CLeadProfileProps) {
  const router = useRouter()
  const { addToast } = useToasts()
  const [notes, setNotes] = useState(lead.bd_notes || "")
  const [savingNotes, setSavingNotes] = useState(false)
  const [promoting, setPromoting] = useState(false)

  const score = lead.b2b_potential_score || 0
  const scoreColor =
    score >= 80 ? "bg-red-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-green-500" : "bg-gray-400"

  const saveNotes = useCallback(async () => {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/b2c/leads/${lead.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bd_notes: notes }),
      })
      if (!res.ok) throw new Error("Failed to save notes")
      addToast("success", "Notes saved")
    } catch (e) {
      addToast("error", String(e))
    } finally {
      setSavingNotes(false)
    }
  }, [lead.id, notes, addToast])

  const promote = useCallback(async () => {
    setPromoting(true)
    try {
      const res = await fetch(`/api/b2c/leads/${lead.id}/promote`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to promote")
      const data = await res.json()
      addToast("success", data.created_new
        ? `Promoted to B2B: New contact created (${data.matched_via})`
        : `Promoted to B2B: Linked to existing contact (${data.matched_via})`)
      router.refresh()
    } catch (e) {
      addToast("error", String(e))
    } finally {
      setPromoting(false)
    }
  }, [lead.id, addToast, router])

  const history = (lead.b2b_score_history || []) as any[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lead.name || "Unknown"}</h1>
          <div className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building2 className="h-4 w-4" />
            {lead.title || "N/A"} @ {lead.company || "N/A"}
            {lead.company_size ? `(${lead.company_size} employees)` : ""}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={`${scoreColor} text-white`}>Score: {score}</Badge>
            <Badge variant="outline" className="capitalize">
              {lead.b2b_score_label || "low"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {lead.pipeline_stage || "b2c_user"}
            </Badge>
            {lead.linkedin_url && (
              <a
                href={lead.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1 text-sm"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {lead.pipeline_stage !== "promoted" && (
            <Button onClick={promote} disabled={promoting}>
              <UserCheck className="h-4 w-4 mr-2" />
              {promoting ? "Promoting..." : "Promote to B2B"}
            </Button>
          )}
          {conversion && (
            <Button variant="outline" onClick={() => router.push(`/contacts/${conversion.vista_contact_id}`)}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View Contact
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                B2C Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length === 0 ? (
                <div className="text-sm text-muted-foreground">No events yet</div>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-accent-fuchsia" />
                    <div className="flex-1">
                      <div className="font-medium">{evt.event_type}</div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(evt.event_timestamp).toLocaleString()}
                      </div>
                      {evt.score_delta !== 0 && evt.score_delta !== null && (
                        <div className="text-xs">
                          Score: {evt.score_before} → {evt.score_after}{" "}
                          <span className={evt.score_delta > 0 ? "text-green-600" : "text-red-600"}>
                            ({evt.score_delta > 0 ? "+" : ""}
                            {evt.score_delta})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                B2B Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(lead.b2b_score_breakdown || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              {history.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="text-xs font-semibold mb-1">Score History</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {history.slice(-10).map((h: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{new Date(h.date).toLocaleDateString()}</span>
                        <span>
                          {h.score} <span className="text-muted-foreground">({h.label})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* BD Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                BD Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                placeholder="Add internal BD notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Professional Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Professional Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {lead.email || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {lead.industry || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {lead.location || "N/A"}
              </div>
            </CardContent>
          </Card>

          {/* Credit & Spend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Credit & Spend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spend</span>
                <span className="font-medium">¥{lead.total_spend_cny || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Purchased</span>
                <span className="font-medium">{lead.total_credits_purchased || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits Consumed</span>
                <span className="font-medium">{lead.total_credits_consumed || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assessments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4" />
                Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(lead.assessments_completed || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">None completed</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(lead.assessments_completed as string[]).map((a) => (
                    <Badge key={a} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
