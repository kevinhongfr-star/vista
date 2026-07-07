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
import { formatDate, truncateText } from "@/lib/utils"
import { Plus, Activity, Filter, Calendar } from "lucide-react"
import type { Signal } from "@/lib/types"

const SIGNAL_TYPES = [
  "Hiring",
  "Leadership Change",
  "M&A Activity",
  "Restructuring",
  "Market Expansion",
  "Funding",
  "Partnership Announcement",
  "Product Launch",
  "Earnings/Financial Results",
  "Regulatory Change",
  "Competitor Movement",
]

const SIGNAL_STRENGTHS = ["Low", "Medium", "Medium-High", "High"]

interface SignalsPageProps {
  signals: Signal[]
  totalCount: number
}

export function SignalsPage({ signals, totalCount }: SignalsPageProps) {
  const [isAddingSignal, setIsAddingSignal] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStrength, setFilterStrength] = useState<string>("all")

  const filteredSignals = signals.filter((signal) => {
    if (filterType !== "all" && signal.signal_type !== filterType) return false
    if (filterStrength !== "all" && signal.signal_strength !== filterStrength)
      return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Signals</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{totalCount} total</Badge>
          <Button onClick={() => setIsAddingSignal(!isAddingSignal)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Signal
          </Button>
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
                <Input id="company" placeholder="Company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signalType">Signal Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Signal Strength</Label>
                <Select>
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
                <Label htmlFor="detectedDate">Detected Date</Label>
                <Input id="detectedDate" type="date" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Signal description" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Save Signal</Button>
              <Button variant="outline" onClick={() => setIsAddingSignal(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SIGNAL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStrength} onValueChange={setFilterStrength}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Strength" />
              </SelectTrigger>
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

      {/* Signals Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Strength</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[80px]">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignals.length > 0 ? (
                filteredSignals.map((signal) => (
                  <TableRow key={signal.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline">{signal.signal_type || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{signal.company || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          signal.signal_strength === "High" && "bg-error text-white",
                          signal.signal_strength === "Medium-High" && "bg-warning text-white",
                          signal.signal_strength === "Medium" && "bg-info text-white"
                        )}
                      >
                        {signal.signal_strength || "Low"}
                      </Badge>
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
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{signal.score_impact || 0}</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No signals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}