"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeft,
  Mail,
  ClipboardList,
  TrendingUp,
  Users,
  Building2,
  Edit3,
  Lightbulb,
  Target,
} from "lucide-react"
import type { Signal, VistaContact } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { Toaster, useToasts } from "@/components/ui/toast"

interface SignalDetailProps {
  signal: Signal
  affectedContacts: VistaContact[]
}

function getSignalInterpretation(signal: Signal) {
  const type = signal.signal_type || '';
  const score = signal.score_impact || 0;
  const interpretations: Record<string, { meaning: string; action: string }> = {
    'funding': {
      meaning: 'Their company just raised capital. This is an optimal time to reach out — they have budget and are likely evaluating new solutions.',
      action: 'Send personalized email referencing the funding round and how your solution can help them capitalize on it.',
    },
    'hiring': {
      meaning: 'They\'re actively hiring, indicating growth and expansion. They may need solutions to support scaling operations.',
      action: 'Reach out with a message about how your solution can help them scale efficiently.',
    },
    'product_launch': {
      meaning: 'They just launched a new product or feature. This signals innovation and openness to partnerships.',
      action: 'Congratulate them on the launch and explore synergies or integration opportunities.',
    },
    'leadership_change': {
      meaning: 'New leadership often means new priorities and budget allocation. Good time to establish relationships.',
      action: 'Send a brief intro message and schedule a discovery call to understand their new direction.',
    },
    'partnership': {
      meaning: 'They announced a new partnership or integration. This indicates they\'re open to collaborating.',
      action: 'Explore how your solution complements their new partnership.',
    },
    'expansion': {
      meaning: 'The company is expanding into new markets or geographies. This indicates growth and increased resource needs.',
      action: 'Reach out to discuss how your solution can support their expansion plans.',
    },
    'acquisition': {
      meaning: 'They acquired or were acquired by another company. Integration and strategic shifts are likely.',
      action: 'Monitor the situation closely and reach out once integration plans are clearer.',
    },
    'award': {
      meaning: 'They received recognition or an award, indicating industry respect and positive momentum.',
      action: 'Send a congratulatory note and use it as a conversation starter.',
    },
  };
  const interpretation = interpretations[type] || {
    meaning: `This signal indicates ${type} activity. Based on the score of ${score}, this is a ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'weak'} indicator of engagement potential.`,
    action: 'Review the signal details and determine if outreach is appropriate based on timing and relevance.',
  };
  return interpretation;
}

export function SignalDetail({ signal, affectedContacts }: SignalDetailProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const interpretation = getSignalInterpretation(signal)

  const top3Contacts = [...affectedContacts]
    .sort((a, b) => (b.vista_composite || 0) - (a.vista_composite || 0))
    .slice(0, 3)

  const functionCounts = affectedContacts.reduce((acc, contact) => {
    const func = contact.function || "Unknown"
    acc[func] = (acc[func] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleSendEmailToAll = () => {
    setEmailComposerOpen(true)
  }

  const handleLogActivity = () => {
    setActivityLogOpen(true)
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Signals
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Back to signals</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => router.refresh()}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit signal details</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          {signal.company} - {signal.signal_type?.replace("_", " ") || "Signal"}
        </h1>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline">
                Type: {signal.signal_type?.replace("_", " ") || "Unknown"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Category of detected signal</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={
                  signal.signal_strength === "High"
                    ? "bg-error text-white"
                    : signal.signal_strength === "Medium-High"
                    ? "bg-warning text-white"
                    : signal.signal_strength === "Medium"
                    ? "bg-info text-white"
                    : ""
                }
              >
                Impact: {signal.signal_strength || "Low"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estimated impact strength of this signal</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary">
                Status: {signal.status || "New"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current workflow status of this signal</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* What This Means */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            What This Means
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-blue-900 font-medium mb-2">Interpretation:</p>
            <p className="text-sm text-blue-800">{interpretation.meaning}</p>
          </div>
          
          <div>
            <p className="text-sm text-blue-900 font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommended Action:
            </p>
            <p className="text-sm text-blue-800">{interpretation.action}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-3">
                This signal affects {affectedContacts.length} contacts in your database:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(functionCounts).map(([func, count]) => (
                  <Badge key={func} variant="outline">
                    {func}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {top3Contacts.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Top 3 Contacts to Act On:</h3>
                <div className="space-y-3">
                  {top3Contacts.map((contact, index) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="font-bold text-lg w-8">{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contact.function} @ {contact.company}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        Score: {contact.vista_composite || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {signal.recommended_action && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-2">Recommended Action:</h3>
                <p className="text-purple-700">{signal.recommended_action}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSendEmailToAll}
                    disabled={affectedContacts.length === 0}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email to All {affectedContacts.length}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send an email to all affected contacts</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleLogActivity}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Log Activity
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Log a new activity related to this signal</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {signal.description || "No description available."}
          </p>
          {signal.source_url && (
            <p className="mt-3">
              <a
                href={signal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Source: {signal.source_url}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      {affectedContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Related Contacts ({affectedContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {affectedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-4 p-3 hover:bg-muted/30 rounded-lg cursor-pointer transition-colors"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                  </div>
                  <Badge variant="secondary">
                    Score: {contact.vista_composite || 0}
                  </Badge>
                </div>
              ))}
            </div>
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

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}