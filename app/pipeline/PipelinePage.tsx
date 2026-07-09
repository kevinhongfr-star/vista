"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  GitBranch,
  List,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { PIPELINE_STAGES, type PipelineStage, type VistaContact } from "@/lib/types"
import { useToasts, Toaster } from "@/components/ui/toast"
import { GenerateReportButton } from "@/components/intelligence/generate-report-button"

const STAGE_DESCRIPTIONS: Record<string, string> = {
  Prospect: "Initial lead identified, not yet contacted",
  Contacted: "First outreach made, awaiting response",
  Engaged: "Contact is actively responding to outreach",
  "Meeting Booked": "A meeting has been scheduled or held",
  "Proposal Sent": "A formal proposal has been shared",
  Negotiation: "Actively discussing terms and pricing",
  "Closed Won": "Deal won, customer converted",
  "Closed Lost": "Deal lost or no longer pursuing",
}

interface PipelineContact {
  id: string
  name: string | null
  company: string | null
  pipeline_stage: PipelineStage | null
  vista_composite: number | null
  last_contact_date: string | null
}

interface PipelinePageProps {
  contacts: PipelineContact[]
}

interface StuckContact {
  contact_id: string
  name: string | null
  company: string | null
  pipeline_stage: PipelineStage
  days_in_stage: number
  score: number | null
}

interface ConversionRates {
  prospect_to_contacted: number
  contacted_to_engaged: number
  engaged_to_meeting: number
  meeting_to_closed: number
  overall: number
}

export function PipelinePage({ contacts }: PipelinePageProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [stuckContacts, setStuckContacts] = useState<StuckContact[]>([])
  const [conversionRates, setConversionRates] = useState<ConversionRates | null>(null)
  const [loadingIntelligence, setLoadingIntelligence] = useState(true)

  useEffect(() => {
    fetchIntelligence()
  }, [])

  const fetchIntelligence = async () => {
    try {
      const res = await fetch("/api/pipeline/intelligence")
      const data = await res.json()
      setStuckContacts(data.stuck_contacts || [])
      setConversionRates(data.conversion_rates || null)
    } catch (error) {
      addToast("error", "Failed to load pipeline intelligence")
    } finally {
      setLoadingIntelligence(false)
    }
  }

  const stageGroups: Record<string, typeof contacts> = {}
  for (const stage of PIPELINE_STAGES) {
    stageGroups[stage] = contacts.filter((c) => c.pipeline_stage === stage)
  }

  const handleAdvanceStage = async (contactId: string, currentStage: string) => {
    const currentIndex = PIPELINE_STAGES.indexOf(currentStage as PipelineStage)
    if (currentIndex < 0 || currentIndex >= PIPELINE_STAGES.length - 1) {
      return
    }

    const nextStage = PIPELINE_STAGES[currentIndex + 1]

    try {
      const res = await fetch(`/api/pipeline/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline_stage: nextStage }),
      })
      const data = await res.json()

      if (data.success) {
        addToast("success", `Stage updated: ${currentStage} → ${nextStage}`)
        router.refresh()
      } else {
        addToast("error", `Failed to update stage: ${data.error}`)
      }
    } catch (error) {
      addToast("error", `Failed to update stage: ${String(error)}`)
    }
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pipeline</h1>
        <div className="flex gap-2">
          <GenerateReportButton
            reportType="pipeline-review"
            label="Generate Review"
            variant="outline"
            size="sm"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                onClick={() => setViewMode("kanban")}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Kanban View
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to kanban board view</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to list view</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {viewMode === "kanban" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 overflow-x-auto">
          {PIPELINE_STAGES.map((stage) => {
            const stageContacts = stageGroups[stage] || []
            return (
              <div
                key={stage}
                className="bg-muted/30 rounded-lg p-4 min-h-[400px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-medium cursor-help">{stage}</h3>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{STAGE_DESCRIPTIONS[stage] || stage}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Badge variant="secondary">{stageContacts.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.company}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          Score: {contact.vista_composite || 0}
                        </Badge>
                        {PIPELINE_STAGES.indexOf(stage) <
                          PIPELINE_STAGES.length - 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAdvanceStage(contact.id, stage)
                                }}
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Advance to next stage</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {stageContacts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No contacts
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {viewMode === "list" && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length > 0 ? (
                  contacts.map((contact) => {
                    const stageIndex = PIPELINE_STAGES.indexOf(
                      contact.pipeline_stage as PipelineStage
                    )
                    const canAdvance =
                      stageIndex >= 0 && stageIndex < PIPELINE_STAGES.length - 1
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <a
                            href={`/contacts/${contact.id}`}
                            className="font-medium hover:underline"
                          >
                            {contact.name || "-"}
                          </a>
                        </TableCell>
                        <TableCell>{contact.company || "-"}</TableCell>
                        <TableCell>{contact.vista_composite || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contact.pipeline_stage || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          {contact.last_contact_date
                            ? new Date(contact.last_contact_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {canAdvance && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleAdvanceStage(
                                      contact.id,
                                      contact.pipeline_stage || "Prospect"
                                    )
                                  }
                                >
                                  Advance →
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Advance to next stage</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No contacts in pipeline.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pipeline Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingIntelligence ? (
            <div className="text-center py-8">Loading intelligence...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stuckContacts.length > 0 && (
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Stuck Contacts (30+ days in same stage)
                  </h3>
                  <div className="space-y-2">
                    {stuckContacts.map((contact) => (
                      <div
                        key={contact.contact_id}
                        className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg cursor-pointer hover:bg-warning/20 transition-colors"
                        onClick={() => router.push(`/contacts/${contact.contact_id}`)}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-4 w-4 text-warning cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stuck: 30+ days without stage change</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {contact.name} ({contact.company})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.pipeline_stage} for {contact.days_in_stage} days
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {conversionRates && (
                <div>
                  <h3 className="font-medium mb-3">Conversion Rates</h3>
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-2 rounded cursor-help">
                          <span className="text-sm">Prospect → Contacted</span>
                          <Badge variant="secondary">
                            {conversionRates.prospect_to_contacted}%
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage of prospects that received first contact</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-2 rounded cursor-help">
                          <span className="text-sm">Contacted → Engaged</span>
                          <Badge variant="secondary">
                            {conversionRates.contacted_to_engaged}%
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage of contacted prospects that became engaged</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-2 rounded cursor-help">
                          <span className="text-sm">Engaged → Meeting</span>
                          <Badge variant="secondary">
                            {conversionRates.engaged_to_meeting}%
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage of engaged contacts that booked a meeting</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-2 rounded cursor-help">
                          <span className="text-sm">Meeting → Closed Won</span>
                          <Badge variant="secondary">
                            {conversionRates.meeting_to_closed}%
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage of meetings that resulted in a closed-won deal</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-3 rounded bg-primary/10 cursor-help">
                          <span className="font-medium">Overall Conversion</span>
                          <Badge>{conversionRates.overall}%</Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>End-to-end conversion from prospect to closed won</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}