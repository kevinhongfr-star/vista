"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Sparkles, Loader2, Mail, Phone, Linkedin, Calendar, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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

export function CampaignWizard({ isOpen, onClose, contactIds, clusterId }: CampaignWizardProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [isGenerating, setIsGenerating] = useState(false)
  const [objective, setObjective] = useState("")
  const [touches, setTouches] = useState(3)
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null)

  const handleGenerate = async () => {
    if (!objective.trim()) {
      addToast("error", "Please enter a campaign objective")
      return
    }
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
          channel_mix: ["email", "linkedin", "phone"],
        }),
      })
      const data = await res.json()
      if (data.success && data.campaign) {
        setCampaign(data.campaign)
        addToast("success", `Campaign generated: ${data.campaign.touches.length} touches over ${data.campaign.duration_days} days`)
      } else {
        addToast("error", `Campaign generation failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      addToast("error", `Campaign generation failed: ${String(error)}`)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-none shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-modal">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-fuchsia/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Campaign Wizard</h2>
              <p className="text-sm text-muted-foreground">
                {campaign
                  ? `${campaign.campaign_name} — ${campaign.touches.length} touches`
                  : "Generate a multi-touch campaign sequence with AI"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {!campaign ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="objective">Campaign Objective</Label>
                <Textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Book 5 discovery calls for APAC tech practice"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="touches">Number of Touches (max 5)</Label>
                <div className="flex items-center gap-4">
                  {[2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant={touches === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTouches(n)}
                    >
                      {n} touches
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Channels:</span>
                <Badge variant="secondary">Email</Badge>
                <Badge variant="secondary">LinkedIn</Badge>
                <Badge variant="secondary">Phone</Badge>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-bold">{campaign.duration_days} days</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground">Touches</p>
                  <p className="font-bold">{campaign.touches.length}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-none">
                  <p className="text-xs text-muted-foreground">Target Contacts</p>
                  <p className="font-bold">{campaign.target_contacts}</p>
                </div>
              </div>

              <div className="space-y-4">
                {campaign.touches.map((touch, i) => {
                  const Icon = CHANNEL_ICONS[touch.channel] || Mail
                  return (
                    <div key={i} className="p-4 border rounded-none space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-accent-fuchsia/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-accent-fuchsia" />
                          </div>
                          <div>
                            <p className="font-medium">Day {touch.day_offset}: {touch.action}</p>
                            <Badge variant="outline" className="text-xs capitalize">{touch.channel}</Badge>
                          </div>
                        </div>
                      </div>
                      {touch.subject && (
                        <p className="text-sm font-medium text-muted-foreground">Subject: {touch.subject}</p>
                      )}
                      {touch.body && (
                        <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded whitespace-pre-wrap">
                          {touch.body}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Success: {touch.success_criteria}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30 sticky bottom-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!campaign ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !objective.trim()}
              className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Campaign
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCampaign(null)}>
                Regenerate
              </Button>
              <Button onClick={handleSave} className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white">
                Save as Draft
              </Button>
            </>
          )}
        </div>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
