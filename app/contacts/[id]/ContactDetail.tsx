"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Mail,
  Activity,
  TrendingUp,
  Building2,
  Calendar,
  MessageSquare,
  Phone,
  MapPin,
  ExternalLink,
  Edit3,
} from "lucide-react"
import type { VistaContact, Signal, CampaignContact, StrategicNote } from "@/lib/types"
import type { Activity as ActivityType } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { Toaster, useToasts } from "@/components/ui/toast"

interface ContactDetailProps {
  contact: VistaContact
}

type TabType = "overview" | "engagement" | "signals" | "campaigns" | "notes"

export function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [campaigns, setCampaigns] = useState<CampaignContact[]>([])
  const [notes, setNotes] = useState<StrategicNote[]>([])

  useEffect(() => {
    fetchActivities()
    fetchSignals()
    fetchCampaigns()
    fetchNotes()
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/activities?contact_id=${contact.id}`)
      const data = await res.json()
      setActivities(data.activities || [])
    } catch (error) {
      addToast("error", "Failed to load activities")
    }
  }

  const fetchSignals = async () => {
    try {
      const res = await fetch(`/api/signals?contact_id=${contact.id}`)
      const data = await res.json()
      setSignals(data.signals || [])
    } catch (error) {
      addToast("error", "Failed to load signals")
    }
  }

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/campaigns/contacts/${contact.id}`)
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      addToast("error", "Failed to load campaigns")
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/strategic-notes?contact_id=${contact.id}`)
      const data = await res.json()
      setNotes(data.notes || [])
    } catch (error) {
      addToast("error", "Failed to load notes")
    }
  }

  const handleAdvanceStage = async (newStage: string) => {
    try {
      const res = await fetch(`/api/pipeline/${contact.id}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline_stage: newStage }),
      })
      const data = await res.json()
      if (data.success) {
        addToast("success", `Pipeline stage updated: ${contact.pipeline_stage} → ${newStage}`)
        router.refresh()
      } else {
        addToast("error", "Failed to update pipeline stage")
      }
    } catch (error) {
      addToast("error", "Failed to update pipeline stage")
    }
  }

  const stages = [
    "Prospect",
    "Contacted",
    "Engaged",
    "Meeting Booked",
    "Proposal Sent",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ]

  const currentStageIndex = stages.indexOf(contact.pipeline_stage || "Prospect")
  const nextStage = stages[currentStageIndex + 1]

  const score = contact.priority_score || contact.vista_composite || 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-500"
    if (score >= 60) return "text-orange-500"
    if (score >= 40) return "text-blue-500"
    return "text-gray-500"
  }

  const daysSinceLastContact = contact.last_contact_date
    ? Math.floor((Date.now() - new Date(contact.last_contact_date).getTime()) / (24 * 60 * 60 * 1000))
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/contacts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{contact.name || "Unknown Contact"}</h1>
            <p className="text-sm text-muted-foreground">
              {contact.role} @ {contact.company}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Contact Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="flex-1">
                  <Progress value={score} className="h-3" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {contact.email && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                )}
                {contact.location && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.location}</span>
                  </div>
                )}
                {contact.profile_url && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">LinkedIn</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setEmailComposerOpen(true)} className="bg-accent-fuchsia hover:bg-accent-fuchsia/90">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button onClick={() => setActivityLogOpen(true)} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
              {nextStage && (
                <Select value="" onValueChange={handleAdvanceStage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Advance Stage →" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={nextStage}>→ {nextStage}</SelectItem>
                    {stages.slice(currentStageIndex + 2).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        → {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Pipeline Stage</p>
                  <Badge>{contact.pipeline_stage || "Prospect"}</Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Last Contact</p>
                  <p className="font-medium">
                    {daysSinceLastContact !== null
                      ? `${daysSinceLastContact} days ago`
                      : "Never"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Cluster</p>
                  <p className="font-medium">
                    {contact.density_cluster_id ? "Assigned" : "Unassigned"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Function</p>
                  <p className="font-medium">{contact.function || "-"}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Score Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value Score</span>
                    <span>{Math.round((contact.vista_v || 0) * 30 / 100)}/30 (High-value target)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Function Score</span>
                    <span>{Math.round((contact.vista_i || 0) * 20 / 100)}/20 ({contact.function || "Unknown"} = decision maker)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engagement Score</span>
                    <span>{Math.round((contact.vista_s || 0) * 30 / 100)}/30 (Moderate engagement)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cluster Fit Score</span>
                    <span>{Math.round((contact.vista_t || 0) * 20 / 100)}/20</span>
                  </div>
                  {daysSinceLastContact && daysSinceLastContact > 30 && (
                    <div className="flex justify-between text-red-600">
                      <span>Decay Penalty</span>
                      <span>-{Math.min(10, Math.floor(daysSinceLastContact / 10))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{score}/100</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Recommended Action</h4>
                <p className="text-sm text-blue-700">
                  {contact.vista_composite && contact.vista_composite >= 70
                    ? "High-value target. Schedule executive brief on strategy. High fit, prioritize engagement."
                    : contact.vista_composite && contact.vista_composite >= 50
                    ? "Good fit. Consider follow-up or webinar invitation to nurture relationship."
                    : "Lower priority contact. Monitor for signals before engaging further."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="mt-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Engagement Timeline</CardTitle>
              <Button onClick={() => setActivityLogOpen(true)} variant="outline" size="sm">
                Log Activity
              </Button>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.activity_type}</span>
                          {activity.subject && (
                            <span className="text-sm text-muted-foreground">- {activity.subject}</span>
                          )}
                        </div>
                        {activity.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(activity.activity_date).toLocaleDateString()}
                          {activity.duration_minutes && (
                            <span className="ml-2">• {activity.duration_minutes} min</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No engagement activity recorded.</p>
                  <Button onClick={() => setActivityLogOpen(true)} variant="outline" size="sm" className="mt-4">
                    Log Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Signals</CardTitle>
            </CardHeader>
            <CardContent>
              {signals.length > 0 ? (
                <div className="space-y-4">
                  {signals.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      <Badge
                        className={cn(
                          signal.signal_strength === "High" && "bg-red-500",
                          signal.signal_strength === "Medium-High" && "bg-orange-500",
                          signal.signal_strength === "Medium" && "bg-blue-500",
                          signal.signal_strength === "Low" && "bg-gray-500"
                        )}
                      >
                        {signal.signal_strength}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{signal.company}</span>
                          <span className="text-xs text-muted-foreground">
                            - {signal.signal_type}
                          </span>
                        </div>
                        {signal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {signal.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {signal.detected_date ? new Date(signal.detected_date).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <Badge variant="outline">{signal.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No signals detected for this contact.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">Campaign #{campaign.campaign_id}</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Status: {campaign.status || "Invited"}
                        </p>
                        {campaign.sent_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Sent: {new Date(campaign.sent_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>This contact is not part of any campaigns.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.note_id}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{note.note_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {note.created_at ? new Date(note.created_at).toLocaleDateString() : "-"}
                          </span>
                        </div>
                        {note.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {note.description}
                          </p>
                        )}
                      </div>
                      <Badge>{note.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No strategic notes for this contact.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Composer Modal */}
      <EmailComposer
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        prefilledContact={contact}
      />

      {/* Activity Log Modal */}
      <ActivityLog
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
        prefilledContact={contact}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}