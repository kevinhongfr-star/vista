"use client"

import { useRouter } from "next/navigation"
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
  TableRow
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDate } from "@/lib/utils"
import { Map, Plus, TrendingUp, Users, DollarSign } from "lucide-react"
import type { DensityCluster } from "@/lib/types"

interface ClustersPageProps {
  clusters: DensityCluster[]
  totalCount: number
}

export function ClustersPage({ clusters, totalCount }: ClustersPageProps) {
  const router = useRouter()

  const statusColors: Record<string, string> = {
    Active: "bg-success text-white",
    Emerging: "bg-warning text-white",
    Watch: "bg-muted",
  }

  const activeClusters = clusters.filter(c => c.status === 'Active').length
  const emergingClusters = clusters.filter(c => c.status === 'Emerging').length
  const watchClusters = clusters.filter(c => c.status === 'Watch').length

  const handleRowClick = (clusterId: string) => {
    router.push(`/clusters/${clusterId}`)
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Density Clusters</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{totalCount} clusters</Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Cluster
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new density cluster</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{activeClusters}</div>
                    <div className="text-sm text-muted-foreground">Active Clusters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clusters currently active and generating revenue opportunities</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{emergingClusters}</div>
                    <div className="text-sm text-muted-foreground">Emerging Clusters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clusters showing growth momentum, not yet fully established</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Map className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{watchClusters}</div>
                    <div className="text-sm text-muted-foreground">Watch Clusters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clusters under monitoring — potential but unproven</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Clusters Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Industry</TableHead>
                <TableHead>Geography</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Density Score</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Revenue Potential</TableHead>
                <TableHead>Last Calculated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clusters.length > 0 ? (
                clusters.map((cluster) => (
                  <Tooltip key={cluster.cluster_id}>
                    <TooltipTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(cluster.cluster_id)}
                      >
                        <TableCell className="font-medium">{cluster.industry}</TableCell>
                    <TableCell>{cluster.geography}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[cluster.status || 'Watch']}>
                        {cluster.status || 'Watch'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cluster.density_score?.toFixed(0) || 0}</span>
                        {(cluster.density_score ?? 0) >= 150 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="text-xs cursor-help">≥150</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>High density: 150+ contacts in this cluster</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{cluster.contact_count || 0}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {cluster.revenue_potential ? `$${cluster.revenue_potential.toLocaleString()}` : '-'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Estimated total revenue opportunity from this cluster</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(cluster.last_calculated)}
                    </TableCell>
                      </TableRow>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View cluster details</p>
                    </TooltipContent>
                  </Tooltip>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No density clusters found. Run PROBE to generate.
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
