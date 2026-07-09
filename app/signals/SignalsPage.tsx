"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDate, truncateText } from "@/lib/utils"
import { Plus, Activity, Filter, Calendar, Loader2, ArrowRight, CheckSquare, Square, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToasts, Toaster } from "@/components/ui/toast"
import type { Signal } from "@/lib/types"

const SIGNAL_TYPES = [
  "funding",
  "leadership_change",
  "ma_activity",
  "market_expansion",
  "digital_transformation",
  "partnership",
  "product_launch",
  "executive_departure",
  "team_growth",
  "crisis",
  "market_event",
]

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  funding: "Funding / Investment",
  leadership_change: "Leadership Change",
  ma_activity: "M&A Activity",
  market_expansion: "Market Expansion",
  digital_transformation: "Digital Transformation",
  partnership: "Partnership",
  product_launch: "Product Launch",
  executive_departure: "Executive Departure",
  team_growth: "Team Growth / Restructure",
  crisis: "Crisis / Turnaround",
  market_event: "Market Event",
}

const SIGNAL_TYPE_DESCRIPTIONS: Record<string, string> = {
  funding: "Company raised capital or received investment",
  leadership_change: "Key leadership was added, replaced, or exited",
  ma_activity: "Merger, acquisition, or divestiture activity",
  market_expansion: "Company is entering new markets or geographies",
  digital_transformation: "Company is undergoing digital transformation initiatives",
  partnership: "New strategic partnership or alliance formed",
  product_launch: "Company launched a new product or service",
  executive_departure: "A notable executive has departed the company",
  team_growth: "Team growth, hiring push, or restructuring underway",
  crisis: "Company is facing a crisis or turnaround situation",
  market_event: "Broader market event affecting the company",
}

const SIGNAL_STRENGTH_DESCRIPTIONS: Record<string, string> = {
  Low: "Minor signal — low confidence or limited impact",
  Medium: "Moderate signal — worth monitoring",
  "Medium-High": "Notable signal — likely actionable",
  High: "Strong signal — prioritize action",
}

const SIGNAL_STRENGTHS = ["Low", "Medium", "Medium-High", "High"]

const SIGNAL_SOURCES = [
  "manual",
  "linkedin",
  "email",
  "feishu",
  "notion",
  "agent",
  "import",
  "web",
  "news",
  "market_intel",
]

interface SignalsPageProps {
  signals: Signal[]
  totalCount: number
}

export function SignalsPage({ signals, totalCount }: SignalsPageProps) {
  const [isAddingSignal, setIsAddingSignal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStrength, setFilterStrength] = useState<string>("all")
  const [signalList, setSignalList] = useState<Signal[]>(signals)
  const [selectedSignalIds, setSelectedSignalIds] = useState<Set<string>>(new Set())
  const { toasts, addToast, dismissToast } = useToasts()

  const toggleSignalSelection = (signalId: string) => {
    const newSelection = new Set(selectedSignalIds)
    if (newSelection.has(signalId)) {
      newSelection.delete(signalId)
    } else {
      newSelection.add(signalId)
    }
    setSelectedSignalIds(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedSignalIds.size === filteredSignals.length) {
      setSelectedSignalIds(new Set())
    } else {
      setSelectedSignalIds(new Set(filteredSignals.map(s => s.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSignalIds.size === 0) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/signals/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalIds: Array.from(selectedSignalIds) }),
      })
      const data = await response.json()
      if (data.success) {
        setSignalList(prev => prev.filter(s => !selectedSignalIds.has(s.id)))
        setSelectedSignalIds(new Set())
        addToast("success", `Deleted ${selectedSignalIds.size} signal(s)`)
      } else {
        addToast("error", `Failed to delete signals: ${data.error}`)
      }
    } catch (error) {
      addToast("error", "Failed to delete signals")
    } finally {
      setIsSaving(false)
    }
  }

  const [formCompany, setFormCompany] = useState("")
  const [formSignalType, setFormSignalType] = useState("")
  const [formStrength, setFormStrength] = useState("")
  const [formSource, setFormSource] = useState("manual")
  const [formDetectedDate, setFormDetectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [formDescription, setFormDescription] = useState("")
  const [formSourceUrl, setFormSourceUrl] = useState("")

  const filteredSignals = signalList.filter((signal) => {
    if (filterType !== "all" && signal.signal_type !== filterType) return false
    if (filterStrength !== "all" && signal.signal_strength !== filterStrength)
      return false
    return true
  })

  const resetForm = () => {
    setFormCompany("")
    setFormSignalType("")
    setFormStrength("")
    setFormSource("manual")
    setFormDetectedDate(new Date().toISOString().split("T")[0])
    setFormDescription("")
    setFormSourceUrl("")
  }

  const handleSaveSignal = async () => {
    if (!formSignalType) {
      addToast("error", "Please select a signal type")
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formCompany,
          signal_type: formSignalType,
          signal_strength: formStrength || null,
          source: formSource,
          detected_date: formDetectedDate,
          description: formDescription,
          source_url: formSourceUrl,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSignalList((prev) => [data.signal, ...prev])
        addToast("success", "Signal created successfully")
        resetForm()
        setIsAddingSignal(false)
      } else {
        addToast("error", `Failed to create signal: ${data.error}`)
      }
    } catch (error: any) {
      addToast("error", `Failed to create signal: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Signals</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{signalList.length || totalCount} total</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setIsAddingSignal(!isAddingSignal)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Signal
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new signal</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Add Signal Form */}
      {isAddingSignal && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Signal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signalType">Signal Type</Label>
                <Select value={formSignalType} onValueChange={setFormSignalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SIGNAL_TYPE_LABELS[type] || type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Signal Strength</Label>
                <Select value={formStrength} onValueChange={setFormStrength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strength" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_STRENGTHS.map((strength) => (
                      <SelectItem key={strength} value={strength}>
                        {strength}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={formSource} onValueChange={setFormSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="detectedDate">Detected Date</Label>
                <Input
                  id="detectedDate"
                  type="date"
                  value={formDetectedDate}
                  onChange={(e) => setFormDetectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://..."
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Signal description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveSignal} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Signal"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingSignal(false)
                  resetForm()
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by signal type</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SIGNAL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {SIGNAL_TYPE_LABELS[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStrength} onValueChange={setFilterStrength}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Strength" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by signal strength</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectItem value="all">All Strengths</SelectItem>
                {SIGNAL_STRENGTHS.map((strength) => (
                  <SelectItem key={strength} value={strength}>
                    {strength}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredSignals.length} signals</Badge>
          </div>
        </CardContent>
      </Card>

      {selectedSignalIds.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">{selectedSignalIds.size} selected</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedSignalIds(new Set())}>
            Clear Selection
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isSaving}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isSaving ? "Deleting..." : "Delete Selected"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete all selected signals</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Signals Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[48px]">
                  <button
                    onClick={toggleAllSelection}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {selectedSignalIds.size === filteredSignals.length && filteredSignals.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[80px]">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignals.length > 0 ? (
                filteredSignals.map((signal) => (
                  <TableRow
                    key={signal.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selectedSignalIds.has(signal.id) && "bg-muted/50"
                    )}
                  >
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSignalSelection(signal.id)
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {selectedSignalIds.has(signal.id) ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="cursor-help">
                            {SIGNAL_TYPE_LABELS[signal.signal_type || ""] ||
                              signal.signal_type ||
                              "Unknown"}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {SIGNAL_TYPE_DESCRIPTIONS[signal.signal_type || ""] ||
                              "Signal type description unavailable"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="font-medium">
                      {signal.company || "-"}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "cursor-help",
                              signal.signal_strength === "High" &&
                                "bg-error text-white",
                              signal.signal_strength === "Medium-High" &&
                                "bg-warning text-white",
                              signal.signal_strength === "Medium" &&
                                "bg-info text-white"
                            )}
                          >
                            {signal.signal_strength || "Low"}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {SIGNAL_STRENGTH_DESCRIPTIONS[signal.signal_strength || "Low"] ||
                              "Signal strength description unavailable"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">
                      {signal.source?.toString() || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(signal.detected_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {truncateText(signal.description, 60)}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/signals/${signal.id}`} className="flex items-center gap-1 hover:text-primary">
                            View
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View signal details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No signals found. Click Add Signal to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
