"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScoreGauge } from "@/components/scoring/ScoreGauge"
import { TierBadge } from "@/components/scoring/TierBadge"
import { EncirclementBadge } from "@/components/scoring/EncirclementBadge"
import { ScoreBreakdown } from "@/components/scoring/ScoreBreakdown"
import { VistaScoreRadar } from "@/components/scoring/VistaScoreRadar"
import { DeltaIndicator } from "@/components/scoring/DeltaIndicator"
import { formatRelativeDate, formatDate, truncateText } from "@/lib/utils"
import { 
  ArrowLeft, 
  Mail, 
  Activity, 
  ExternalLink, 
  Phone, 
  MapPin,
  Building2,
  Calendar,
  MessageSquare
} from "lucide-react"
import type { VistaContact, Signal, CampaignActivity, StrategicNote } from "@/lib/types"

interface ContactDetailProps {
  contact: VistaContact
  signals: Signal[]
  activities: CampaignActivity[]
  notes: StrategicNote[]
}

export function ContactDetail({ contact, signals, activities, notes }: ContactDetailProps) {
  const initials = contact.name
    ? contact.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{contact.name || "Unknown Contact"}</h1>
          <div className="flex items-center gap-2 mt-1">
            {contact.role && (
              <span className="text-muted-foreground">{contact.role}</span>
            )}
            {contact.company && (
              <span className="text-muted-foreground">at {contact.company}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Draft Outreach
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Add Signal
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact Info */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {contact.avatar_url && (
                    <AvatarImage src={contact.avatar_url} alt={contact.name || ""} />
                  )}
                  <AvatarFallback className="text-lg bg-primary-navy text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <TierBadge tier={contact.engagement_tier} />
                    <EncirclementBadge level={contact.encirclement_level} />
                    {contact.decay_flag && (
                      <Badge variant="outline" className="text-warning">Stale</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{contact.location}</span>
                      </div>
                    )}
                    {contact.region && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{contact.region}, {contact.country || "-"}</span>
                      </div>
                    )}
                    {contact.profile_url && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <a href={contact.profile_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Delta */}
          {contact.score_delta && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Score Change</CardTitle>
              </CardHeader>
              <CardContent>
                <DeltaIndicator delta={contact.score_delta} />
                {contact.last_score_update && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated {formatRelativeDate(contact.last_score_update)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center: Scores */}
        <div className="space-y-6">
          {/* Priority Score */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <ScoreGauge score={contact.priority_score || 0} size="lg" />
              <ScoreBreakdown
                stainScore={contact.stain_score}
                clusterScore={contact.cluster_score}
                signalScore={contact.signal_score}
                engagementScore={contact.engagement_score}
              />
            </CardContent>
          </Card>

          {/* VISTA Score */}
          <Card>
            <CardHeader>
              <CardTitle>VISTA Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <VistaScoreRadar
                vistaV={contact.vista_v}
                vistaI={contact.vista_i}
                vistaS={contact.vista_s}
                vistaT={contact.vista_t}
                vistaA={contact.vista_a}
                composite={contact.vista_composite}
              />
            </CardContent>
          </Card>

          {/* Engagement History */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.last_engagement_date ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last engagement: {formatDate(contact.last_engagement_date)}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No engagement recorded
                </div>
              )}
              {contact.touch_count && (
                <div className="text-xs text-muted-foreground mt-2">
                  {contact.touch_count} touches
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Signals & Activities */}
        <div className="space-y-6">
          {/* Signals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Signals</span>
                <Badge variant="secondary">{signals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {signals.length > 0 ? (
                <div className="space-y-3">
                  {signals.map((signal) => (
                    <div key={signal.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{signal.signal_type || "Signal"}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(signal.detected_date)}
                        </span>
                      </div>
                      {signal.signal_strength && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Strength:</span>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              signal.signal_strength === 'High' && "bg-error text-white",
                              signal.signal_strength === 'Medium-High' && "bg-warning text-white",
                              signal.signal_strength === 'Medium' && "bg-info text-white",
                              signal.signal_strength === 'Low' && "bg-muted"
                            )}
                          >
                            {signal.signal_strength}
                          </Badge>
                        </div>
                      )}
                      {signal.description && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {truncateText(signal.description, 100)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No signals recorded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Outreach History</span>
                <Badge variant="secondary">{activities.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{activity.campaign_type || activity.activity_type}</span>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            activity.activity_status === 'Meeting Booked' && "bg-success text-white",
                            activity.activity_status === 'Replied' && "bg-info text-white",
                            activity.activity_status === 'Opened' && "bg-warning text-white",
                            activity.activity_status === 'Sent' && "bg-muted",
                            activity.activity_status === 'Drafted' && "bg-tier-cold"
                          )}
                        >
                          {activity.activity_status || activity.outcome}
                        </Badge>
                      </div>
                      {activity.sent_date && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Sent: {formatDate(activity.sent_date)}
                        </div>
                      )}
                      {activity.conversation_angle && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {truncateText(activity.conversation_angle, 80)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No outreach history
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategic Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.note_id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{note.note_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      {note.description && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {truncateText(note.description, 100)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No strategic notes
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}