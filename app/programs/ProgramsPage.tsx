"use client"

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
import { formatDate } from "@/lib/utils"
import { Calendar, Plus, Users, DollarSign, CheckCircle } from "lucide-react"
import type { Program, ProgramAssignment } from "@/lib/types"

interface ProgramsPageProps {
  programs: Program[]
  assignments: ProgramAssignment[]
  totalCount: number
}

export function ProgramsPage({ programs, assignments, totalCount }: ProgramsPageProps) {
  const statusColors: Record<string, string> = {
    Active: "bg-success text-white",
    Completed: "bg-info text-white",
    Inviting: "bg-warning text-white",
    Planned: "bg-muted",
  }

  const tierColors: Record<string, string> = {
    Free: "bg-info/10 text-info",
    Paid: "bg-accent-fuchsia/10 text-accent-fuchsia",
  }

  const activePrograms = programs.filter(p => p.status === 'Active').length
  const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrolled_count || 0), 0)
  const totalRevenue = programs.reduce((sum, p) => sum + (p.revenue_actual || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs</h1>
        <div className="flex gap-2">
          <Badge variant="secondary">{totalCount} programs</Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activePrograms}</div>
                <div className="text-sm text-muted-foreground">Active Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-info/10">
                <Users className="h-6 w-6 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalEnrolled}</div>
                <div className="text-sm text-muted-foreground">Total Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent-fuchsia/10">
                <DollarSign className="h-6 w-6 text-accent-fuchsia" />
              </div>
              <div>
                <div className="text-2xl font-bold">$${totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Revenue Actual</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.program_id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={tierColors[program.tier || 'Free']}>
                        {program.tier || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[program.status || 'Planned']}>
                        {program.status || 'Planned'}
                      </Badge>
                    </TableCell>
                    <TableCell>{program.capacity || '-'}</TableCell>
                    <TableCell>
                      <span className="font-medium">{program.enrolled_count || 0}</span>
                      {program.capacity && (
                        <span className="text-muted-foreground">/{program.capacity}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {program.price ? `$${program.price.toLocaleString()}` : 'Free'}
                    </TableCell>
                    <TableCell>
                      {program.revenue_actual ? `$${program.revenue_actual.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No programs found. Create a program to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell>{assignment.contact_id}</TableCell>
                    <TableCell>{assignment.program_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                    <TableCell>
                      {assignment.revenue_attributed ? `$${assignment.revenue_attributed.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No assignments found.
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