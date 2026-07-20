"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { B2CLeadCard } from "./B2CLeadCard"
import { UserPlus, Search, Filter } from "lucide-react"
import { useToasts } from "@/components/ui/toast"

const PIPELINE_STAGES = [
  { key: "b2c_user", label: "B2C User" },
  { key: "flagged", label: "Flagged" },
  { key: "monitoring", label: "Monitoring" },
  { key: "research", label: "Research" },
  { key: "outreach_ready", label: "Outreach Ready" },
  { key: "in_conversation", label: "In Conversation" },
  { key: "promoted", label: "Promoted" },
] as const

interface B2CLead {
  id: string
  name: string | null
  title: string | null
  company: string | null
  b2b_potential_score: number | null
  current_tier: string | null
  total_spend_cny: number | null
  pipeline_stage: string | null
  industry: string | null
  email: string | null
}

interface B2CPipelinePageProps {
  leads: B2CLead[]
}

export function B2CPipelinePage({ leads }: B2CPipelinePageProps) {
  const router = useRouter()
  const { addToast } = useToasts()
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [scoreFilter, setScoreFilter] = useState<string>("all")

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      (lead.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(search.toLowerCase())

    const matchesStage = stageFilter === "all" || lead.pipeline_stage === stageFilter

    let matchesScore = true
    if (scoreFilter === "high") matchesScore = (lead.b2b_potential_score || 0) >= 80
    else if (scoreFilter === "watch") matchesScore = (lead.b2b_potential_score || 0) >= 60
    else if (scoreFilter === "monitor") matchesScore = (lead.b2b_potential_score || 0) >= 40

    return matchesSearch && matchesStage && matchesScore
  })

  const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = filteredLeads.filter((l) => l.pipeline_stage === stage.key).length
    return acc
  }, {} as Record<string, number>)

  const moveStage = useCallback(
    async (leadId: string, newStage: string) => {
      try {
        const res = await fetch(`/api/b2c/leads/${leadId}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        })
        if (!res.ok) throw new Error("Failed to update stage")
        addToast("success", `Stage updated: Moved to ${newStage}`)
        router.refresh()
      } catch (e) {
        addToast("error", String(e))
      }
    },
    [addToast, router]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-accent-fuchsia" />
            B2C Pipeline
          </h1>
          <p className="text-muted-foreground">B2C to B2B conversion pipeline</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredLeads.length} leads
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={scoreFilter} onValueChange={setScoreFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="high">High Priority (80+)</SelectItem>
            <SelectItem value="watch">Watch (60+)</SelectItem>
            <SelectItem value="monitor">Monitor (40+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.pipeline_stage === stage.key)
          return (
            <Card key={stage.key} className="min-h-[400px]">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>{stage.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stageCounts[stage.key] || 0}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="space-y-1">
                    <B2CLeadCard
                      lead={lead}
                      onClick={() => router.push(`/b2c-pipeline/${lead.id}`)}
                    />
                    <div className="flex flex-wrap gap-1">
                      {stage.key !== "promoted" &&
                        PIPELINE_STAGES.map((s) => {
                          if (s.key === stage.key) return null
                          return (
                            <Button
                              key={s.key}
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveStage(lead.id, s.key)
                              }}
                            >
                              → {s.label}
                            </Button>
                          )
                        })}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No leads
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
