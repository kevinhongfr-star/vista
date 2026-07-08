"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
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
import { formatDate, truncateText } from "@/lib/utils"
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  DollarSign,
  Plus,
  Lightbulb,
  MapPin,
  Building2,
} from "lucide-react"
import type { DensityCluster, VistaContact, StrategicNote } from "@/lib/types"

interface ClusterDetailProps {
  cluster: DensityCluster
  contacts: VistaContact[]
  notes: StrategicNote[]
  avgScore: number
  avgPipelineReadiness: number
  activeSignals: number
}

export function ClusterDetail({
  cluster,
  contacts,
  notes,
  avgScore,
  avgPipelineReadiness,
  activeSignals,
}: ClusterDetailProps) {
  const statusColors: Record<string, string> = {
    Active: "bg-success text-white",
    Emerging: "bg-warning text-white",
    Watch: "bg-muted",
  }

  const typeColors: Record<string, string> = {
    Priority: "bg-error/10 text-error",
    Insight: "bg-info/10 text-info",
    "Action-Item": "bg-warning/10 text-warning",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clusters">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{cluster.industry}</h1>
            <Badge className={statusColors[cluster.status || "Watch"]}>
              {cluster.status || "Watch"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{cluster.geography}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{cluster.contact_count || 0} contacts</span>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href="/programs">
            <Plus className="h-4 w-4 mr-2" />
            Create Program from Cluster
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgScore.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-info/10">
                <Target className="h-6 w-6 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{avgPipelineReadiness.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Avg Pipeline Readiness</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeSignals}</div>
                <div className="text-sm text-muted-foreground">Active Signals</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {cluster.revenue_potential
                    ? `$${(cluster.revenue_potential / 1000).toFixed(0)}K`
                    : "-"}
                </div>
                <div className="text-sm text-muted-foreground">Revenue Potential</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contacts in Cluster</span>
                <Badge variant="secondary">{contacts.length} contacts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length > 0 ? (
                    contacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="hover:underline"
                          >
                            {contact.name || "Unknown"}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{contact.company || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {contact.role || "-"}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {contact.priority_score?.toFixed(0) || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          {contact.engagement_tier && (
                            <Badge variant="outline">{contact.engagement_tier}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No contacts in this cluster.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Strategic Notes
                </span>
                <Badge variant="secondary">{notes.length} notes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.note_id}
                      className="border rounded-lg p-4 hover:bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            typeColors[note.category || "Insight"]
                          )}
                        >
                          {note.category || note.note_type || "Note"}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(note.created_at)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {truncateText(note.description, 150)}
                      </p>
                      {note.author && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Author: {note.author}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No strategic notes for this cluster.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signal Types</CardTitle>
            </CardHeader>
            <CardContent>
              {cluster.signal_types && cluster.signal_types.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cluster.signal_types.map((signal, idx) => (
                    <Badge key={idx} variant="outline">
                      {signal}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No signal types recorded
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Programs</CardTitle>
            </CardHeader>
            <CardContent>
              {cluster.recommended_programs && cluster.recommended_programs.length > 0 ? (
                <div className="space-y-2">
                  {cluster.recommended_programs.map((program, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                    >
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{program}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No recommended programs
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cluster Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Density Score</span>
                <span className="font-medium">
                  {cluster.density_score?.toFixed(0) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Contact Count</span>
                <span className="font-medium">{cluster.contact_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Calculated</span>
                <span className="font-medium">
                  {formatDate(cluster.last_calculated)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cluster ID</span>
                <span className="font-mono text-xs">
                  {cluster.cluster_id.slice(0, 8)}...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
