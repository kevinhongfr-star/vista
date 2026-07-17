"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Sparkles, Loader2, Mail, Phone, Linkedin, Calendar, CheckCircle2, ArrowRight, ArrowLeft, Target, Users, Radio, Eye, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToasts, Toaster } from "@/components/ui/toast"
import type { GeneratedCampaign, CampaignChannel } from "@/lib/types"

interface CampaignWizardProps {
  isOpen: boolean
  onClose: () => void
  contactIds?: string[]
  clusterId?: string
}

const CHANNEL_ICONS: Record<CampaignChannel, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  phone: Phone,
  event: Calendar,
}

const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  phone: "Phone Call",
  event: "Event/Meeting",
}

const STEPS = [
  { id: 1, label: "Objective", icon: Target },
  { id: 2, label: "Audience", icon: Users },
  { id: 3, label: "Channels", icon: Radio },
  { id: 4, label: "Generate", icon: Sparkles },
  { id: 5, label: "Review", icon: Eye },
]

export function CampaignWizard({ isOpen, onClose, contactIds, clusterId }: CampaignWizardProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [objective, setObjective] = useState("")
  const [touches, setTouches] = useState(3)
  const [channels, setChannels] = useState<CampaignChannel[]>(["email", "linkedin"])
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null)
  const [contactCount] = useState(contactIds?.length || 0)

  const toggleChannel = (ch: CampaignChannel) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  const canAdvance = (): boolean => {
    if (step === 1) return objective.trim().length > 0
    if (step === 3) return channels.length > 0 && touches >= 2
    return true
  }

  const handleGenerate = async () => {
    setStep(4)
    setIsGenerating(true)
    try {
      const res = await fetch("/api/intelligence/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: clusterId ? "cluster" : "contacts",
          cluster_id: clusterId,
          contact_ids: contactIds,
          objective,
          touches,
          channel_mix: channels,
        }),
      })
      const data = await res.json()
      if (data.success && data.campaign) {
        setCampaign(data.campaign)
        setCampaignName(data.campaign.campaign_name || campaignName)
        setStep(5)
        addToast("success", `Campaign generated: ${data.campaign.touches.length} touches over ${data.campaign.duration_days} days`)
      } else {
        addToast("error", `Generation failed: ${data.error || "Unknown error"}`)
        setStep(3)
      }
    } catch (error) {
      addToast("error", `Generation failed: ${String(error)}`)
      setStep(3)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!campaign) return
    addToast("success", "Campaign saved as draft — ready to execute")
    onClose()
    router.refresh()
  }

  const resetWizard = () => {
    setStep(1)
    setCampaign(null)
    setCampaignName("")
    setObjective("")
    setTouches(3)
    setChannels(["email", "linkedin"])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-none shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent-fuchsia/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Campaign Builder</h2>
              <p className="text-sm text-muted-foreground">
                {step <= 3 && "Configure your multi-touch campaign"}
                {step === 4 && "Generating campaign with AI..."}
                {step === 5 && campaign && `${campaign.campaign_name} — ${campaign.touches.length} touches`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { resetWizard(); onClose() }}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isCompleted = step > s.id
              const isGeneratingStep = step === 4 && s.id === 4
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium transition-colors w-full",
                    isActive && "bg-accent-fuchsia/10 text-accent-fuchsia border border-accent-fuchsia/30",
                    isCompleted && "text-success",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {isGeneratingStep && isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("h-px w-4 shrink-0", isCompleted ? "bg-success" : "bg-border")} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Objective */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., APAC Tech Q3 Outreach"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objective">Campaign Objective</Label>
                <Textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Book 5 discovery calls with CTOs in APAC tech companies for our new AI advisory practice"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific — AI will use this to tailor messaging and touch sequence
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/30 border border-border">
                <Target className="h-4 w-4 text-accent-fuchsia" />
                <span>
                  {clusterId
                    ? "Targeting contacts from a specific cluster"
                    : contactIds && contactIds.length > 0
                      ? `Targeting ${contactIds.length} selected contacts`
                      : "Targeting all contacts matching your criteria"}
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 border border-border bg-muted/20 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent-fuchsia" />
                  Audience Summary
                </h4>
                {clusterId ? (
                  <div className="text-sm">
                    <p className="font-medium">Cluster-based targeting</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      All contacts within the selected cluster will receive this campaign sequence
                    </p>
                  </div>
                ) : contactIds && contactIds.length > 0 ? (
                  <div className="text-sm">
                    <p className="font-medium">{contactIds.length} contacts selected</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Campaign will target the contacts you selected from the Contacts table
                    </p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="font-medium">Broad targeting</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Select specific contacts or a cluster for more targeted campaigns
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 border border-accent/20 bg-accent/5">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Tip:</span> Go back to Contacts table, select contacts using checkboxes, then open this wizard to target specific people.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Channels & Touches */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Communication Channels</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["email", "linkedin", "phone", "event"] as CampaignChannel[]).map(ch => {
                    const Icon = CHANNEL_ICONS[ch]
                    const isSelected = channels.includes(ch)
                    return (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={cn(
                          "flex items-center gap-3 p-3 border text-left transition-all",
                          isSelected ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <div className={cn("h-8 w-8 flex items-center justify-center", isSelected ? "bg-accent-fuchsia/10" : "bg-muted")}>
                          <Icon className={cn("h-4 w-4", isSelected ? "text-accent-fuchsia" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className={cn("text-sm font-medium", isSelected && "text-accent-fuchsia")}>{CHANNEL_LABELS[ch]}</p>
                          <p className="text-xs text-muted-foreground">
                            {ch === "email" && "Personalized email sequences"}
                            {ch === "linkedin" && "Connection requests & messages"}
                            {ch === "phone" && "Discovery & follow-up calls"}
                            {ch === "event" && "Meeting invitations & events"}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Number of Touches</Label>
                <div className="flex items-center gap-3">
                  {[2, 3, 4, 5].map(n => (
                    <Button
                      key={n}
                      variant={touches === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTouches(n)}
                      className={cn(touches === n && "bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white")}
                    >
                      {n} touches
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI will space touches optimally across your selected channels over ~{touches * 5} days
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Generating */}
          {step === 4 && isGenerating && (
            <div className="py-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-accent-fuchsia/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-accent-fuchsia animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Generating Campaign</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is crafting a {touches}-touch sequence across {channels.length} channels
                  for &quot;{objective.slice(0, 60)}...&quot;
                </p>
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                {["Analyzing contact profiles", "Crafting channel-specific messages", "Optimizing touch timing"].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin text-accent-fuchsia" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && campaign && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold">{campaign.duration_days} days</p>
                </div>
                <div className="p-3 bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground">Touches</p>
                  <p className="text-lg font-bold">{campaign.touches.length}</p>
                </div>
                <div className="p-3 bg-muted/30 border border-border text-center">
                  <p className="text-xs text-muted-foreground">Targets</p>
                  <p className="text-lg font-bold">{campaign.target_contacts}</p>
                </div>
              </div>

              {/* Touch Sequence */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Touch Sequence</h4>
                {campaign.touches.map((touch, i) => {
                  const Icon = CHANNEL_ICONS[touch.channel] || Mail
                  return (
                    <div key={i} className="p-4 border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-accent-fuchsia/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-accent-fuchsia" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Day {touch.day_offset}: {touch.action}</p>
                            <Badge variant="outline" className="text-[10px] capitalize mt-0.5">{touch.channel}</Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Touch {i + 1}/{campaign.touches.length}</span>
                      </div>
                      {touch.subject && (
                        <p className="text-sm font-medium text-muted-foreground">Subject: {touch.subject}</p>
                      )}
                      {touch.body && (
                        <div className="text-sm text-muted-foreground bg-muted/20 p-3 whitespace-pre-wrap border border-border">
                          {touch.body}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{touch.success_criteria}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30 sticky bottom-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && step !== 4 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {step === 5 && campaign && (
              <>
                <Button variant="outline" onClick={() => { resetWizard() }}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Start Over
                </Button>
                <Button onClick={handleSave} className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </>
            )}
            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={handleGenerate}
                disabled={!canAdvance() || isGenerating}
                className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Campaign
              </Button>
            )}
          </div>
        </div>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
