"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone, MapPin, Building2, ExternalLink, Calendar, TrendingUp, Zap, Target, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScoreGauge } from "@/components/scoring/ScoreGauge"
import { TierBadge } from "@/components/scoring/TierBadge"
import { LinkedInLink } from "@/components/ui/LinkedInLink"
import { cn } from "@/lib/utils"
import type { VistaContact } from "@/lib/types"

interface ContactPreviewPanelProps {
  contact: VistaContact | null
  onClose: () => void
}

/**
 * Global Contact Preview Panel — slides in from the right.
 * Triggered by clicking any contact name across the app (table, grid, pipeline cards, etc.)
 * Shows: full profile header, score breakdown, VISTA radar, recent signals, recommended action, quick actions.
 */
export function ContactPreviewPanel({ contact, onClose }: ContactPreviewPanelProps) {
  const [signals, setSignals] = useState<any[]>([])
  const [loadingSignals, setLoadingSignals] = useState(false)

  useEffect(() => {
    if (!contact) return
    // Fetch recent signals for this contact's company
    const fetchSignals = async () => {
      if (!contact.company) return
      setLoadingSignals(true)
      try {
        const res = await fetch(`/api/signals?company=${encodeURIComponent(contact.company)}&limit=3`)
        if (res.ok) {
          const data = await res.json()
          setSignals(data.signals || [])
        }
      } catch {}
      setLoadingSignals(false)
    }
    fetchSignals()
  }, [contact?.id, contact?.company])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  if (!contact) return null

  const score = contact.priority_score || contact.vista_composite || 0
  const getScoreColor = (s: number) => s >= 70 ? "text-green-600" : s >= 40 ? "text-amber-600" : "text-muted-foreground"
  const daysSinceActivity = contact.last_engagement_date || contact.last_contact_date || contact.last_touch_date
    ? Math.floor((Date.now() - new Date(contact.last_engagement_date || contact.last_contact_date || contact.last_touch_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Smart recommended action
  const getRecommendation = () => {
    const stage = contact.pipeline_stage || "Prospect"
    if (score >= 70 && ["Prospect", "Contacted"].includes(stage)) return { title: "Schedule Discovery Call", icon: Zap, color: "bg-accent-5 border-accent/20" }
    if (stage === "Meeting Booked" && daysSinceActivity && daysSinceActivity > 14) return { title: "Send Follow-Up", icon: Mail, color: "bg-warning/5 border-warning/20" }
    if (stage === "Proposal Sent") return { title: "Follow Up on Proposal", icon: Target, color: "bg-ocean/5 border-ocean/20" }
    if (score < 50 && daysSinceActivity && daysSinceActivity > 30) return { title: "Add to Nurture Campaign", icon: Activity, color: "bg-muted border-border" }
    if (stage === "Negotiation") return { title: "Schedule Closing Call", icon: TrendingUp, color: "bg-teal/5 border-teal/20" }
    return { title: "Log Activity", icon: Activity, color: "bg-muted border-border" }
  }
  const recommendation = getRecommendation()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-[55] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l-2 border-accent shadow-2xl z-[60] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Preview</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Identity */}
          <div>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold truncate">{contact.name || "Unknown"}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {contact.role || contact.headline?.slice(0, 80) || "No title"}
                </p>
                {contact.seniority && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-muted border border-border uppercase">
                    {contact.seniority.replace("_", " ")}
                  </span>
                )}
              </div>
              <ScoreGauge score={score} size="md" />
            </div>

            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground flex-wrap">
              <Building2 className="h-3.5 w-3.5" />
              <span>{contact.company || "-"}</span>
              {contact.industry && <span className="text-xs">({contact.industry})</span>}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-2">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-xs hover:bg-accent-5 transition-colors" onClick={(e) => e.stopPropagation()}>
                <Mail className="h-3 w-3" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-xs">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </div>
            )}
            {(contact.location || contact.country) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-xs">
                <MapPin className="h-3 w-3" />
                {contact.location && contact.country ? `${contact.location}, ${contact.country}` : contact.country || contact.location}
              </div>
            )}
          </div>

          {/* LinkedIn */}
          {contact.profile_url && (
            <div className="flex items-center gap-2 p-3 border border-[#0A66C2]/20 bg-[#0A66C2]/5">
              <LinkedInLink url={contact.profile_url} size="lg" showLabel />
              <span className="text-xs text-muted-foreground">View full LinkedIn profile</span>
            </div>
          )}

          {/* Meta Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {contact.pipeline_stage || "Prospect"}
            </Badge>
            <TierBadge tier={contact.engagement_tier || "C"} />
            {contact.function && <Badge variant="secondary" className="text-xs">{contact.function}</Badge>}
            {contact.bd_pathway && <Badge variant="outline" className="text-xs">{contact.bd_pathway}</Badge>}
          </div>

          {/* Score Breakdown */}
          <div className="p-4 bg-muted/30 border border-border space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">VISTA Score Breakdown</h4>
            <Progress value={score} className="h-2" />
            <div className="grid grid-cols-5 gap-1 text-center mt-2">
              {[
                { label: "V", value: contact.vista_v, desc: "Value" },
                { label: "I", value: contact.vista_i, desc: "Identity" },
                { label: "S", value: contact.vista_s, desc: "Signal" },
                { label: "T", value: contact.vista_t, desc: "Timing" },
                { label: "A", value: contact.vista_a, desc: "Access" },
              ].map((c) => (
                <div key={c.label} className="p-1.5 bg-white border border-border">
                  <div className="text-[10px] font-bold text-accent-fuchsia">{c.label}</div>
                  <div className="text-sm font-semibold">{c.value ?? "-"}</div>
                  <div className="text-[9px] text-muted-foreground">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Snapshot */}
          <div className="p-4 bg-muted/30 border border-border space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engagement</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Touches</span>
                <p className="font-semibold">{contact.touch_count ?? 0}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Last Activity</span>
                <p className="font-semibold">{daysSinceActivity !== null ? `${daysSinceActivity}d ago` : "Never"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Cluster</span>
                <p className="font-semibold">{contact.density_cluster_id ? "Assigned" : "Unassigned"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Source</span>
                <p className="font-semibold text-xs truncate">{contact.data_source || "-"}</p>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className={cn("p-4 border", recommendation.color)}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-accent-fuchsia" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">Recommended Action</h4>
            </div>
            <p className="font-medium text-sm">{recommendation.title}</p>
            {contact.recommended_next && (
              <p className="text-xs text-muted-foreground mt-1">{contact.recommended_next}</p>
            )}
          </div>

          {/* Company Signals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Company Signals
            </h4>
            {loadingSignals ? (
              <p className="text-sm text-muted-foreground">Loading signals...</p>
            ) : signals.length > 0 ? (
              <div className="space-y-2">
                {signals.map((s: any) => (
                  <div key={s.id} className="p-3 bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px]">{s.signal_type?.replace(/_/g, " ")}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{s.signal_strength}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                    {s.detected_date && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(s.detected_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent signals for {contact.company || "this company"}</p>
            )}
          </div>

          {/* Conversation Recap */}
          {contact.last_conversation_recap && (
            <div className="p-4 bg-muted/30 border border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Last Conversation</h4>
              <p className="text-sm text-muted-foreground">{contact.last_conversation_recap}</p>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="p-4 bg-muted/30 border border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{contact.notes}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <a href={`/contacts/${contact.id}`} className="flex-1">
              <Button className="w-full bg-accent-fuchsia hover:bg-accent-hover text-white">
                Open Full Profile
              </Button>
            </a>
            {contact.profile_url && (
              <a href={contact.profile_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="border-[#0A66C2] text-[#0A66C2]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
