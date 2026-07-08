"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { TrendingUp, Calendar, Users } from "lucide-react"
import type { Program, ProgramAssignment, CampaignActivity } from "@/lib/types"

interface ConversionsPageProps {
  programs: Program[]
  assignments: ProgramAssignment[]
  campaignActivities: CampaignActivity[]
  clusters: { cluster_id: string; industry: string; geography: string }[]
}

export function ConversionsPage({ programs, assignments, campaignActivities, clusters }: ConversionsPageProps) {
  const convertedCount = assignments.filter(a => a.status === 'Converted').length
  const totalRevenue = assignments.reduce((sum, a) => sum + (a.revenue_attributed || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conversions</h1>
        <Badge variant="secondary">{assignments.length} total assignments</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Programs
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Conversion Date</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell>
                      {programs.find(p => p.program_id === assignment.program_id)?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {assignment.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                    <TableCell>{formatDate(assignment.conversion_date)}</TableCell>
                    <TableCell>${(assignment.revenue_attributed || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No program assignments found.
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
