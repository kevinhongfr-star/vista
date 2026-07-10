"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Mail,
  ClipboardList,
  Users,
  Edit3,
  Lightbulb,
  Target,
  AlertTriangle,
  Zap,
  Clock,
  Globe,
  Sparkles,
  Loader2,
} from "lucide-react"
import type { Signal, VistaContact } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { useToasts } from "@/components/ui/toast"
import { AgentTriggerButton } from "@/components/intelligence/agent-trigger-button"

interface SignalDetailProps {
  signal: Signal
  affectedContacts: VistaContact[]
}

interface AIAnalysis {
  plain_english: string
  market_context: string
  most_affected: string[]
  recommended_actions: { contact: string; action: string; channel: string; timing: string }[]
  campaign_angle: string
  time_sensitivity: string
  opportunity_score: number
  risk_factors: string[]
}

export function SignalDetail({ signal, affectedContacts }: SignalDetailProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [analysisSource, setAnalysisSource] = useState<"ai" | "rules">("rules")
  const [loading, setLoading] = useState(true)

  const top3Contacts = [...affectedContacts]
    .sort((a, b) => (b.vista_composite || 0) - (a.vista_composite || 0))
    .slice(0, 3)

  const functionCounts = affectedContacts.reduce((acc, contact) => {
    const func = contact.function || "Unknown"
    acc[func] = (acc[func] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/intelligence/signal/${signal.id}/impact`)
        const data = await res.json()
        if (data.success && data.ai_analysis) {
          setAiAnalysis(data.ai_analysis)
          setAnalysisSource(data.analysis_source || "rules")
        }
      } catch (err) {
        console.error("Failed to fetch signal analysis:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [signal.id])

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "linkedin": return <Globe className="h-3 w-3" />
      default: return <Mail className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <AgentTriggerButton
          agent="PROBE"
          label="Analyze with PROBE"
          variant="outline"
          triggerData={{
            type: "refresh",
          }}
        />
      </div>

      {/* Signal Header */}
      <div className="space-y-3">
        <h1 className="text-2xl font-heading font-bold">
          {signal.company} — {signal.signal_type?.replace(/_/g, " ") || "Signal"}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            {signal.signal_type?.replace(/_/g, " ") || "Unknown"}
          </Badge>
          <Badge
            className={
              signal.signal_strength === "High"
                ? "bg-red-600 text-white"
                : signal.signal_strength === "Medium-High"
                ? "bg-amber-600 text-white"
                : signal.signal_strength === "Medium"
                ? "bg-blue-600 text-white"
                : "bg-gray-500 text-white"
            }
          >
            Impact: {signal.signal_strength || "Low"}
          </Badge>
          <Badge variant="secondary">
            {signal.status || "New"}
          </Badge>
          {aiAnalysis && (
            <Badge className="bg-accent-fuchsia text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Opportunity: {aiAnalysis.opportunity_score}/100
            </Badge>
          )}
        </div>
      </div>

      {/* AI Intelligence Briefing */}
      {loading ? (
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Analyzing signal with AI...</span>
          </CardContent>
        </Card>
      ) : aiAnalysis ? (
        <div className="space-y-4">
          {/* Main Assessment */}
          <Card className="border-l-4 border-l-accent-fuchsia">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-accent-fuchsia" />
                Strategic Assessment
                {analysisSource === "ai" && (
                  <Badge variant="outline" className="text-xs ml-2">
                    <Sparkles className="h-3 w-3 mr-1" /> AI
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">What This Means</p>
                <p className="text-sm">{aiAnalysis.plain_english}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  Market Context
                </p>
                <p className="text-sm">{aiAnalysis.market_context}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  Campaign Angle
                </p>
                <p className="text-sm">{aiAnalysis.campaign_angle}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timing & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Time Sensitivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{aiAnalysis.time_sensitivity}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {aiAnalysis.risk_factors.map((risk, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Actions */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-green-500" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiAnalysis.recommended_actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-fuchsia/10 flex items-center justify-center text-accent-fuchsia font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.contact}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{action.action}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {getChannelIcon(action.channel)}
                        {action.channel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {action.timing}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            AI analysis unavailable. Showing raw signal data.
          </CardContent>
        </Card>
      )}

      {/* Affected Contacts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Affected Contacts ({affectedContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(functionCounts).length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {Object.entries(functionCounts).map(([func, count]) => (
                <Badge key={func} variant="outline" className="text-xs">
                  {func}: {count}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            {top3Contacts.map((contact, i) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/contacts/${contact.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contact.role} @ {contact.company}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  Score: {contact.vista_composite || 0}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={() => setEmailComposerOpen(true)} className="bg-accent-fuchsia hover:bg-accent-fuchsia/90">
              <Mail className="h-4 w-4 mr-2" />
              Email All {affectedContacts.length}
            </Button>
            <Button variant="outline" onClick={() => setActivityLogOpen(true)}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signal Description */}
      {signal.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{signal.description}</p>
          </CardContent>
        </Card>
      )}

      <EmailComposer
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        prefilledContacts={affectedContacts}
      />
      <ActivityLog
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
      />
    </div>
  )
}
