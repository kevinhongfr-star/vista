"use client"

import Link from "next/link"
import { useMemo, useState, Fragment } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type ExpandedState,
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
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Activity, Edit, Trash2, MoreHorizontal, ArrowRight, Send, Trash, CheckSquare, Square, ArrowUp, ArrowDown, ArrowUpDown, X, Filter
} from "lucide-react"
import type { VistaContact } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { Toaster, useToasts } from "@/components/ui/toast"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

interface ContactsTableProps {
  data: VistaContact[]
  pageCount: number
  currentPage: number
  pageSize: number
  totalCount: number
  searchParams: {
    tier?: string
    level?: string
    search?: string
    stage?: string
    function?: string
    minScore?: string
    maxScore?: string
    pageSize?: string
  }
}

export function ContactsTable({
  data,
  pageCount,
  currentPage,
  pageSize,
  totalCount,
  searchParams
}: ContactsTableProps) {
  const router = useRouter()
  const { toasts, addToast, dismissToast } = useToasts()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'priority_score', desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState(searchParams.search || '')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<VistaContact | undefined>()
  const [selectedContacts, setSelectedContacts] = useState<VistaContact[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  const columns: ColumnDef<VistaContact>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            const allSelected = table.getIsAllRowsSelected()
            table.toggleAllRowsSelected(!allSelected)
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          {table.getIsAllRowsSelected() ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            row.toggleSelected()
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          {row.getIsSelected() ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      ),
      size: 40,
    },
    {
      id: 'score',
      header: 'Score',
      accessorKey: 'priority_score',
      cell: ({ row }) => {
        const contact = row.original
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <ScoreGauge score={contact.priority_score || 0} size="sm" showLabel={false} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="w-48 p-3 space-y-2">
              <div className="font-semibold text-white">Score Breakdown</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Priority</span>
                  <span className="font-medium">{contact.priority_score ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Stain</span>
                  <span className="font-medium">{contact.stain_score ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Cluster</span>
                  <span className="font-medium">{contact.cluster_score ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Signal</span>
                  <span className="font-medium">{contact.signal_score ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Engagement</span>
                  <span className="font-medium">{contact.engagement_score ?? '-'}</span>
                </div>
                <div className="border-t border-white/20 pt-1 flex justify-between">
                  <span className="text-white/70">Tier</span>
                  <span className="font-medium">{contact.engagement_tier || '-'}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )
      },
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
      rowSelection,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
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
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    getRowCanExpand: () => true,
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

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '0')
    params.set('pageSize', value)
    router.push(`/contacts?${params.toString()}`)
  }

  const hasActiveFilters = searchParams.search || searchParams.stage || searchParams.function || searchParams.tier || searchParams.level

  const clearFilters = () => {
    const params = new URLSearchParams()
    params.set('page', '0')
    if (searchParams.pageSize) params.set('pageSize', searchParams.pageSize)
    router.push(`/contacts?${params.toString()}`)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    if (pageCount <= maxVisible + 2) {
      for (let i = 0; i < pageCount; i++) pages.push(i)
    } else {
      pages.push(0)
      const left = Math.max(1, currentPage - 1)
      const right = Math.min(pageCount - 2, currentPage + 1)
      if (left > 1) pages.push('...')
      for (let i = left; i <= right; i++) pages.push(i)
      if (right < pageCount - 2) pages.push('...')
      pages.push(pageCount - 1)
    }
    return pages
  }

  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalCount)

  return (
    <TooltipProvider>
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-accent-fuchsia/10 border border-accent-fuchsia/20 rounded-lg">
          <span className="text-sm font-medium">
            {Object.keys(rowSelection).length} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const selected = table.getSelectedRowModel().rows.map(r => r.original)
                setSelectedContacts(selected)
                setEmailComposerOpen(true)
              }}
            >
              <Send className="h-3 w-3 mr-1" />
              Send Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const selected = table.getSelectedRowModel().rows.map(r => r.original)
                setSelectedContacts(selected)
                setActivityLogOpen(true)
              }}
            >
              <Activity className="h-3 w-3 mr-1" />
              Log Activity
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={async () => {
                const selected = table.getSelectedRowModel().rows.map(r => r.original)
                if (!confirm(`Delete ${selected.length} contacts? This cannot be undone.`)) return
                setBulkLoading(true)
                try {
                  let deleted = 0
                  for (const contact of selected) {
                    const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' })
                    if (res.ok) deleted++
                  }
                  addToast('success', `Deleted ${deleted} contacts`)
                  setRowSelection({})
                  router.refresh()
                } catch (error) {
                  addToast('error', 'Failed to delete contacts')
                } finally {
                  setBulkLoading(false)
                }
              }}
              disabled={bulkLoading}
            >
              <Trash className="h-3 w-3 mr-1" />
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRowSelection({})}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">
            {totalCount > 0 ? `Showing ${startItem}-${endItem} of ${totalCount}` : 'No contacts'}
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
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="inline-flex">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-accent-fuchsia" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-3 w-3 text-accent-fuchsia" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (target.closest('button') || target.closest('a') || target.closest('[data-no-expand]')) return
                      row.toggleExpanded()
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={columns.length} className="p-0">
                        <ContactDetailRow contact={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Select
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {pageCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 0}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum as number)}
                className={cn(
                  "h-8 w-8 px-0",
                  currentPage === pageNum && "bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
                )}
              >
                {(pageNum as number) + 1}
              </Button>
            )
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pageCount - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={currentPage >= pageCount - 1}
            className="h-8 w-8"
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
    </TooltipProvider>
  )
}

function ContactDetailRow({ contact }: { contact: VistaContact }) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      {/* Contact Info */}
      <div className="space-y-2">
        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Contact Info</h4>
        <div className="space-y-1">
          {contact.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>{contact.location}</span>
            </div>
          )}
          {contact.country && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span>{contact.country}</span>
            </div>
          )}
          {contact.headline && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Headline</span>
              <span className="truncate max-w-[200px]" title={contact.headline}>{contact.headline}</span>
            </div>
          )}
          {contact.seniority && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seniority</span>
              <span>{contact.seniority}</span>
            </div>
          )}
        </div>
      </div>

      {/* Strategy */}
      <div className="space-y-2">
        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Strategy</h4>
        <div className="space-y-1">
          {contact.bd_pathway && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pathway</span>
              <span>{contact.bd_pathway}</span>
            </div>
          )}
          {contact.bd_priority && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <span>{contact.bd_priority}</span>
            </div>
          )}
          {contact.encirclement_level && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Encirclement</span>
              <span>{contact.encirclement_level}</span>
            </div>
          )}
          {contact.advisory_tier && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advisory</span>
              <span>{contact.advisory_tier}</span>
            </div>
          )}
          {contact.recommended_next && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Step</span>
              <span className="truncate max-w-[200px]" title={contact.recommended_next}>{contact.recommended_next}</span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement */}
      <div className="space-y-2">
        <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Engagement</h4>
        <div className="space-y-1">
          {contact.touch_count !== null && contact.touch_count !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Touches</span>
              <span>{contact.touch_count}</span>
            </div>
          )}
          {contact.last_touch_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Touch</span>
              <span>{new Date(contact.last_touch_date).toLocaleDateString()}</span>
            </div>
          )}
          {contact.last_synced_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Sync</span>
              <span>{new Date(contact.last_synced_at).toLocaleDateString()}</span>
            </div>
          )}
          {contact.data_source && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span>{contact.data_source}</span>
            </div>
          )}
          {contact.conversation_category && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span>{contact.conversation_category}</span>
            </div>
          )}
          {contact.stain_group && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stain Group</span>
              <span>{contact.stain_group}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {contact.notes && (
        <div className="md:col-span-3 pt-2 border-t">
          <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes</h4>
          <p className="text-muted-foreground line-clamp-3">{contact.notes}</p>
        </div>
      )}
    </div>
  )
}