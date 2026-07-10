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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
  ExternalLink, Linkedin,
  Edit3,
  Target,
  Lightbulb,
  Play,
} from "lucide-react"
import type { VistaContact, Signal, CampaignContact, StrategicNote } from "@/lib/types"
import type { Activity as ActivityType } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { CampaignWizard } from "@/components/modals/CampaignWizard"
import { Toaster, useToasts } from "@/components/ui/toast"
import { LinkedInLink } from "@/components/ui/LinkedInLink"
import { TierBadge } from "@/components/scoring/TierBadge"

interface ContactDetailProps {
  contact: VistaContact
}

type TabType = "overview" | "engagement" | "signals" | "campaigns" | "notes"

function getNextBestAction(contact: VistaContact) {
  const score = contact.priority_score || contact.vista_composite || 0;
  const stage = contact.pipeline_stage || 'Prospect';
  const daysSinceActivity = contact.last_engagement_date || contact.last_contact_date || contact.last_touch_date
    ? Math.floor((Date.now() - new Date(contact.last_engagement_date || contact.last_contact_date || contact.last_touch_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (score >= 70 && ['Prospect', 'Engaged', 'Contacted'].includes(stage)) {
    return {
      title: 'Schedule Discovery Call',
      description: `This contact has a high priority score (${score}) and is in early stage. Recent signal activity indicates strong timing.`,
      action: 'call',
      reason: 'High score + early stage + recent signals',
      icon: Phone,
      color: 'bg-accent-5 border-accent/20 text-primary',
    };
  }

  if (stage === 'Meeting Booked' && daysSinceActivity > 14) {
    return {
      title: 'Send Follow-Up Email',
      description: `Last activity was ${daysSinceActivity} days ago. Re-engage to keep momentum before the meeting.`,
      action: 'email',
      reason: 'Stale meeting — needs re-engagement',
      icon: Mail,
      color: 'bg-warning/5 border-warning/20 text-primary',
    };
  }

  if (stage === 'Proposal Sent') {
    return {
      title: 'Schedule Follow-Up on Proposal',
      description: `Proposal sent. Follow up within 3-5 days to address questions and move toward close.`,
      action: 'call',
      reason: 'Proposal stage — needs follow-up',
      icon: Phone,
      color: 'bg-ocean/5 border-ocean/20 text-primary',
    };
  }

  if (score < 50 && daysSinceActivity > 30) {
    return {
      title: 'Add to Nurture Campaign',
      description: `Low engagement score (${score}) and no activity in ${daysSinceActivity} days. Move to automated nurture track.`,
      action: 'campaign',
      reason: 'Low score + stale — needs nurturing',
      icon: Mail,
      color: 'bg-bg-alt border-border text-primary',
    };
  }

  if (stage === 'Negotiation') {
    return {
      title: 'Confirm Closing Steps',
      description: `In negotiation phase. Confirm next steps and identify any remaining obstacles to close.`,
      action: 'call',
      reason: 'Negotiation stage — needs confirmation',
      icon: Phone,
      color: 'bg-teal/5 border-teal/20 text-primary',
    };
  }

  return {
    title: 'Log Recent Activity',
    description: `No clear next action identified. Log any recent interactions to keep the record current.`,
    action: 'log',
    reason: 'No clear signal — manual review needed',
    icon: Calendar,
    color: 'bg-blueGrey/5 border-blueGrey/20 text-primary',
  };
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false)
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
  const nextAction = getNextBestAction(contact)
  const ActionIcon = nextAction.icon

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
    <div className="space-y-6 animate-page-enter">
      {/* Rich Contact Header — Greenhouse-style sticky */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-border -mx-6 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Back */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/contacts">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Back to contacts</p></TooltipContent>
          </Tooltip>

          {/* Avatar */}
          <div className="h-12 w-12 flex items-center justify-center bg-accent-fuchsia/10 text-accent-fuchsia font-bold text-lg border border-accent-fuchsia/20">
            {(contact.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold truncate">{contact.name || "Unknown Contact"}</h1>
              {contact.profile_url && (
                <a href={contact.profile_url} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:underline">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              {contact.role && <span>{contact.role}</span>}
              {contact.company && <span>@ {contact.company}</span>}
              {contact.seniority && <span className="text-xs px-1.5 py-0.5 bg-muted capitalize">{contact.seniority.replace("_", " ")}</span>}
            </div>
          </div>

          {/* VISTA Mini-Scores */}
          <div className="hidden md:flex items-center gap-1.5">
            {[
              { label: "V", value: contact.vista_v, color: "bg-violet-500" },
              { label: "I", value: contact.vista_i, color: "bg-ocean" },
              { label: "S", value: contact.vista_s, color: "bg-teal" },
              { label: "T", value: contact.vista_t, color: "bg-accent-fuchsia" },
              { label: "A", value: contact.vista_a, color: "bg-success" },
            ].map(({ label, value, color }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 ${color}/10 flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${getScoreColor((value || 0) * 100)}`}>{value != null ? Math.round(value * 100) : "-"}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>{label === "V" ? "Value" : label === "I" ? "Influence" : label === "S" ? "Strategic" : label === "T" ? "Timing" : "Access"}: {value != null ? Math.round(value * 100) : "N/A"}</p></TooltipContent>
              </Tooltip>
            ))}
            <div className="ml-2 text-center border-l border-border pl-2">
              <p className={`text-xl font-bold leading-none ${getScoreColor(score)}`}>{score}</p>
              <p className="text-[9px] text-muted-foreground">Score</p>
            </div>
          </div>

          {/* Pipeline Stage */}
          <div className="hidden lg:block">
            <span className={`px-2 py-1 text-xs font-medium border ${
              contact.pipeline_stage === "Closed Won" ? "bg-success/10 text-success border-success/30" :
              contact.pipeline_stage === "Closed Lost" ? "bg-error/10 text-error border-error/30" :
              contact.pipeline_stage === "Proposal Sent" ? "bg-accent-10 text-accent-hover border-accent/30" :
              contact.pipeline_stage === "Meeting Booked" ? "bg-teal/10 text-teal border-teal/30" :
              contact.pipeline_stage === "Engaged" ? "bg-ocean/10 text-ocean-deep border-ocean/30" :
              "bg-blueGrey/10 text-slate border-blueGrey/30"
            }`}>
              {contact.pipeline_stage || "Prospect"}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setEmailComposerOpen(true)} className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white h-8">
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Email
            </Button>
            <Button size="sm" variant="outline" onClick={() => setActivityLogOpen(true)} className="h-8">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Log
            </Button>
            {nextStage && (
              <Select value="" onValueChange={handleAdvanceStage}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Advance →" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={nextStage}>→ {nextStage}</SelectItem>
                  {stages.slice(currentStageIndex + 2).map((stage) => (
                    <SelectItem key={stage} value={stage}>→ {stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Contact meta row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
          {contact.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>}
          {contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>}
          {contact.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.location}{contact.country ? `, ${contact.country}` : ""}</span>}
          {contact.industry && <span className="px-1.5 py-0.5 bg-muted">{contact.industry}</span>}
          {contact.engagement_tier && <TierBadge tier={contact.engagement_tier} />}
          {daysSinceLastContact !== null && (
            <span className={daysSinceLastContact > 30 ? "text-warning" : ""}>
              Last contact: {daysSinceLastContact}d ago
            </span>
          )}
        </div>
      </div>

      {/* Next Best Action */}
      <Card className={`border-2 ${nextAction.color} mb-6`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Next Best Action
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">{nextAction.title}</h3>
              <p className="text-sm opacity-90">{nextAction.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                <Lightbulb className="h-3 w-3" />
                <span>Why: {nextAction.reason}</span>
              </div>
            </div>
            <ActionIcon className="h-8 w-8 opacity-20" />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
                  onClick={() => {
                    if (nextAction.action === 'email') {
                      setEmailComposerOpen(true)
                    } else if (nextAction.action === 'campaign') {
                      setCampaignWizardOpen(true)
                    } else if (nextAction.action === 'call') {
                      setActivityLogOpen(true)
                    } else if (nextAction.action === 'log') {
                      setActivityLogOpen(true)
                    }
                  }}
                >
                  <Play className="h-4 w-4" />
                  Execute Action
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Execute the recommended next action</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">
                  Dismiss
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dismiss this recommendation</p>
              </TooltipContent>
            </Tooltip>
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
                <div className="p-4 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground mb-1">Pipeline Stage</p>
                  <Badge>{contact.pipeline_stage || "Prospect"}</Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground mb-1">Last Contact</p>
                  <p className="font-medium">
                    {daysSinceLastContact !== null
                      ? `${daysSinceLastContact} days ago`
                      : "Never"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground mb-1">Cluster</p>
                  <p className="font-medium">
                    {contact.density_cluster_id ? "Assigned" : "Unassigned"}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground mb-1">Function</p>
                  <p className="font-medium">{contact.function || "-"}</p>
                </div>
              </div>

              <div className="p-4 bg-warning/5 border border-warning/20 rounded-none">
                <h4 className="font-medium text-amber-800 mb-2">Score Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between cursor-help">
                        <span className="text-muted-foreground">Value Score</span>
                        <span>{Math.round((contact.vista_v || 0) * 30 / 100)}/30 (High-value target)</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>V — Value component: how valuable this contact is as a target</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between cursor-help">
                        <span className="text-muted-foreground">Function Score</span>
                        <span>{Math.round((contact.vista_i || 0) * 20 / 100)}/20 ({contact.function || "Unknown"} = decision maker)</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>I — Identity/Function component: decision-making authority</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between cursor-help">
                        <span className="text-muted-foreground">Engagement Score</span>
                        <span>{Math.round((contact.vista_s || 0) * 30 / 100)}/30 (Moderate engagement)</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>S — Signal/Engagement component: level of recent engagement</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between cursor-help">
                        <span className="text-muted-foreground">Cluster Fit Score</span>
                        <span>{Math.round((contact.vista_t || 0) * 20 / 100)}/20</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>T — Timing/Tier component: cluster fit and timing alignment</p>
                    </TooltipContent>
                  </Tooltip>
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

              <div className="p-4 bg-accent-5 border border-accent/20 rounded-none">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setActivityLogOpen(true)} variant="outline" size="sm">
                    Log Activity
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Log a new activity for this contact</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-none"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                            <Activity className="h-4 w-4 text-green-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{activity.activity_type}</p>
                        </TooltipContent>
                      </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => setActivityLogOpen(true)} variant="outline" size="sm" className="mt-4">
                        Log Activity
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Log a new activity for this contact</p>
                    </TooltipContent>
                  </Tooltip>
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
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-none"
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
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-none"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-8 w-8 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-purple-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Campaign #{campaign.campaign_id}</p>
                        </TooltipContent>
                      </Tooltip>
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
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-none"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="h-8 w-8 rounded-full bg-accent-10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-amber-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{note.note_type} note</p>
                        </TooltipContent>
                      </Tooltip>
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

      {/* Campaign Wizard Modal */}
      <CampaignWizard
        isOpen={campaignWizardOpen}
        onClose={() => setCampaignWizardOpen(false)}
        contactIds={[contact.id]}
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