"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { ScoreGauge } from "@/components/scoring/ScoreGauge"
import { TierBadge } from "@/components/scoring/TierBadge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Activity, Edit, Trash2, MoreHorizontal, ArrowRight } from "lucide-react"
import type { VistaContact } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { Toaster, useToasts } from "@/components/ui/toast"

interface ContactsTableProps {
  data: VistaContact[]
  pageCount: number
  currentPage: number
  searchParams: {
    tier?: string
    level?: string
    search?: string
    stage?: string
    function?: string
    minScore?: string
    maxScore?: string
  }
}

export function ContactsTable({ 
  data, 
  pageCount, 
  currentPage,
  searchParams 
}: ContactsTableProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'priority_score', desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState(searchParams.search || '')
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<VistaContact | undefined>()

  const columns: ColumnDef<VistaContact>[] = useMemo(() => [
    {
      id: 'score',
      header: 'Score',
      accessorKey: 'priority_score',
      cell: ({ row }) => (
        <ScoreGauge score={row.original.priority_score || 0} size="sm" showLabel={false} />
      ),
      size: 60,
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <Link 
            href={`/contacts/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name || "Unknown"}
          </Link>
          {row.original.email && (
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          )}
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      id: 'company',
      header: 'Company',
      accessorKey: 'company',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.company || "-"}</div>
          {row.original.industry && (
            <div className="text-xs text-muted-foreground">{row.original.industry}</div>
          )}
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      id: 'function',
      header: 'Function',
      accessorKey: 'function',
      cell: ({ row }) => row.original.function || "-",
    },
    {
      id: 'stage',
      header: 'Stage',
      accessorKey: 'pipeline_stage',
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-muted">
          {row.original.pipeline_stage || "Prospect"}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <>
          <Link href={`/contacts/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8">
              View <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedContact(row.original)
                  setEmailComposerOpen(true)
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedContact(row.original)
                  setActivityLogOpen(true)
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                Log Activity
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push(`/contacts/${row.original.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/contacts/${row.original.id}`, {
                      method: 'DELETE',
                    })
                    const data = await res.json()
                    if (data.success) {
                      addToast('success', 'Contact deleted')
                      router.refresh()
                    } else {
                      addToast('error', 'Failed to delete contact')
                    }
                  } catch (error) {
                    addToast('error', 'Failed to delete contact')
                  }
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
      size: 120,
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value)
      const params = new URLSearchParams(searchParams)
      params.set('page', '0')
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.push(`/contacts?${params.toString()}`)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    enableGlobalFilter: true,
  })

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    router.push(`/contacts?${params.toString()}`)
  }

  const handleStageChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '0')
    if (value === 'all') {
      params.delete('stage')
    } else {
      params.set('stage', value)
    }
    router.push(`/contacts?${params.toString()}`)
  }

  const handleFunctionChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '0')
    if (value === 'all') {
      params.delete('function')
    } else {
      params.set('function', value)
    }
    router.push(`/contacts?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search contacts..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value)
            const params = new URLSearchParams(searchParams)
            params.set('page', '0')
            if (e.target.value) {
              params.set('search', e.target.value)
            } else {
              params.delete('search')
            }
            router.push(`/contacts?${params.toString()}`)
          }}
          className="max-w-xs"
        />
        
        <Select
          value={searchParams.stage || 'all'}
          onValueChange={handleStageChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Pipeline Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Engaged">Engaged</SelectItem>
            <SelectItem value="Meeting Booked">Meeting Booked</SelectItem>
            <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Closed Won">Closed Won</SelectItem>
            <SelectItem value="Closed Lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.function || 'all'}
          onValueChange={handleFunctionChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Function" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Functions</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.tier || 'all'}
          onValueChange={(value) => {
            const params = new URLSearchParams(searchParams)
            params.set('page', '0')
            if (value === 'all') {
              params.delete('tier')
            } else {
              params.set('tier', value)
            }
            router.push(`/contacts?${params.toString()}`)
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="committed">Committed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">
            Showing {data.length} contacts
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      header.column.getCanSort() && "cursor-pointer select-none",
                      header.id === 'actions' && "text-right"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={currentPage >= pageCount - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposer
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        prefilledContact={selectedContact}
      />

      {/* Activity Log Modal */}
      <ActivityLog
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
        prefilledContact={selectedContact}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}