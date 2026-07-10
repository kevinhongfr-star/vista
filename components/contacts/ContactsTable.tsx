"use client"

import Link from "next/link"
import { useMemo, useState, Fragment, useRef, useEffect } from "react"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Activity, Edit, Trash2, MoreHorizontal, ArrowRight, Send, Trash, CheckSquare, Square, ArrowUp, ArrowDown, ArrowUpDown, X, Filter, Save, FolderOpen, Trash as TrashIcon
} from "lucide-react"
import type { VistaContact } from "@/lib/types"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { Toaster, useToasts } from "@/components/ui/toast"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

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

const stageStyles: Record<string, string> = {
  'Prospect': 'bg-blueGrey/10 text-slate border-blueGrey/30',
  'Engaged': 'bg-ocean/10 text-ocean-deep border-ocean/30',
  'Meeting Booked': 'bg-teal/10 text-teal border-teal/30',
  'Proposal': 'bg-accent-10 text-accent-hover border-accent/30',
  'Negotiation': 'bg-teal/10 text-teal border-teal/30',
  'Closed Won': 'bg-success/10 text-success border-success/30',
  'Closed Lost': 'bg-error/10 text-error border-error/30',
};

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [filterPresets, setFilterPresets] = useState<{ name: string; filters: typeof searchParams }[]>([])
  const [showPresetMenu, setShowPresetMenu] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmText: string
    onConfirm: () => void | Promise<void>
  }>({ open: false, title: "", description: "", confirmText: "Delete", onConfirm: () => {} })
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('contactFilterPresets')
    if (saved) {
      setFilterPresets(JSON.parse(saved))
    } else {
      const defaults = [
        { name: "Hot Contacts", filters: { tier: "hot", stage: "all", search: "", function: "all", level: "all" } },
        { name: "Active Pipeline", filters: { tier: "all", stage: "Engaged", search: "", function: "all", level: "all" } },
        { name: "Executives", filters: { tier: "all", stage: "all", search: "", function: "Executive", level: "all" } },
      ]
      setFilterPresets(defaults)
      localStorage.setItem('contactFilterPresets', JSON.stringify(defaults))
    }
  }, [])

  const savePreset = () => {
    if (!presetName.trim()) return
    const newPreset = {
      name: presetName.trim(),
      filters: { ...searchParams },
    }
    const updated = [...filterPresets, newPreset]
    setFilterPresets(updated)
    localStorage.setItem('contactFilterPresets', JSON.stringify(updated))
    setPresetName("")
    setShowPresetMenu(false)
    addToast("success", `Filter preset "${presetName}" saved`)
  }

  const loadPreset = (preset: typeof filterPresets[0]) => {
    const params = new URLSearchParams()
    params.set('page', '0')
    if (preset.filters.search) params.set('search', preset.filters.search)
    if (preset.filters.stage && preset.filters.stage !== 'all') params.set('stage', preset.filters.stage)
    if (preset.filters.function && preset.filters.function !== 'all') params.set('function', preset.filters.function)
    if (preset.filters.tier && preset.filters.tier !== 'all') params.set('tier', preset.filters.tier)
    if (preset.filters.level && preset.filters.level !== 'all') params.set('level', preset.filters.level)
    if (searchParams.pageSize) params.set('pageSize', searchParams.pageSize)
    router.push(`/contacts?${params.toString()}`)
    setShowPresetMenu(false)
  }

  const deletePreset = (index: number) => {
    const updated = filterPresets.filter((_, i) => i !== index)
    setFilterPresets(updated)
    localStorage.setItem('contactFilterPresets', JSON.stringify(updated))
    addToast("success", "Preset deleted")
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
      if (e.key === "/" && !isInput) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

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
      id: 'title',
      header: 'Title',
      accessorKey: 'role',
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.original.role || row.original.headline?.slice(0, 50) || "-"}</div>
          {row.original.seniority && (
            <div className="text-xs text-muted-foreground capitalize">{row.original.seniority.replace('_', ' ')}</div>
          )}
        </div>
      ),
      enableGlobalFilter: true,
      size: 180,
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
      id: 'location',
      header: 'Location',
      accessorKey: 'country',
      cell: ({ row }) => {
        const city = row.original.location
        const country = row.original.country
        if (!city && !country) return <span className="text-muted-foreground">-</span>
        return (
          <span className="text-sm text-muted-foreground">
            {city && country ? `${city}, ${country}` : country || city}
          </span>
        )
      },
      enableGlobalFilter: true,
      size: 120,
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
      cell: ({ row }) => {
        const stage = row.original.pipeline_stage || 'Prospect';
        const stageClass = stageStyles[stage] || 'bg-blueGrey/10 text-slate border-blueGrey/30';
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium border ${stageClass}`}>
            {stage}
          </span>
        );
      },
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
                onClick={() => {
                  setConfirmDialog({
                    open: true,
                    title: "Delete Contact",
                    description: `Are you sure you want to delete ${row.original.name || "this contact"}? This action cannot be undone.`,
                    confirmText: "Delete",
                    onConfirm: async () => {
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
                    },
                  })
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
        <div className="flex items-center gap-3 p-3 bg-accent-fuchsia/10 border border-accent-fuchsia/20 rounded-none">
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
            <Select
              onValueChange={async (stage) => {
                const selected = table.getSelectedRowModel().rows.map(r => r.original)
                setBulkLoading(true)
                try {
                  let updated = 0
                  for (const contact of selected) {
                    const res = await fetch(`/api/contacts/${contact.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pipeline_stage: stage }),
                    })
                    if (res.ok) updated++
                  }
                  addToast('success', `Updated ${updated} contacts to ${stage}`)
                  setRowSelection({})
                  router.refresh()
                } catch { addToast('error', 'Failed to update stage') }
                finally { setBulkLoading(false) }
              }}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Set Stage" /></SelectTrigger>
              <SelectContent>
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
              onValueChange={async (tier) => {
                const selected = table.getSelectedRowModel().rows.map(r => r.original)
                setBulkLoading(true)
                try {
                  let updated = 0
                  for (const contact of selected) {
                    const res = await fetch(`/api/contacts/${contact.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ engagement_tier: tier }),
                    })
                    if (res.ok) updated++
                  }
                  addToast('success', `Updated ${updated} contacts to Tier ${tier}`)
                  setRowSelection({})
                  router.refresh()
                } catch { addToast('error', 'Failed to update tier') }
                finally { setBulkLoading(false) }
              }}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Set Tier" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cold">Cold</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Engaged">Engaged</SelectItem>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Committed">Committed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                const selected = table.getSelectedRowModel().rows.map(r => r.original)
                setConfirmDialog({
                  open: true,
                  title: `Delete ${selected.length} Contact${selected.length > 1 ? 's' : ''}`,
                  description: `Are you sure you want to delete ${selected.length} contact${selected.length > 1 ? 's' : ''}? This action cannot be undone.`,
                  confirmText: `Delete ${selected.length}`,
                  onConfirm: async () => {
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
                  },
                })
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
        <div className="flex items-center gap-1 border border-border p-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2 py-1 text-xs transition-colors ${viewMode === 'table' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2 py-1 text-xs transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Grid
          </button>
        </div>
        <div className="relative">
          <Input
            ref={searchInputRef}
            placeholder="Search contacts... (Press / to focus)"
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
            className="max-w-xs pr-8"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            /
          </kbd>
        </div>
        
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-3 w-3 mr-2" />
              Presets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {filterPresets.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Saved Presets
                </div>
                {filterPresets.map((preset, index) => (
                  <DropdownMenuItem
                    key={preset.name}
                    onClick={() => loadPreset(preset)}
                    className="flex justify-between items-center"
                  >
                    <span>{preset.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePreset(index)
                      }}
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
              Save Current Filter
            </div>
            <div className="px-2 pb-2">
              <Input
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="h-8 text-sm mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') savePreset()
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={savePreset}
                disabled={!presetName.trim()}
              >
                <Save className="h-3 w-3 mr-2" />
                Save
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">
            {totalCount > 0 ? `Showing ${startItem}-${endItem} of ${totalCount}` : 'No contacts'}
          </span>
        </div>
      </div>

      {/* Grid/Card View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {table.getRowModel().rows.map((row) => {
            const contact = row.original
            return (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="block bg-white border border-border hover:border-accent/30 transition-all p-4 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                      {contact.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {contact.role || contact.headline?.slice(0, 40) || '-'}
                    </p>
                  </div>
                  <ScoreGauge score={contact.priority_score || 0} size="sm" showLabel={false} />
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium text-foreground/80">{contact.company || '-'}</span>
                    {contact.industry && <span className="text-muted-foreground/60">· {contact.industry}</span>}
                  </div>
                  {(contact.country || contact.location) && (
                    <div className="truncate">
                      {contact.location && contact.country ? `${contact.location}, ${contact.country}` : contact.country || contact.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium border ${stageStyles[contact.pipeline_stage || 'Prospect'] || 'bg-blueGrey/10 text-slate border-blueGrey/30'}`}>
                    {contact.pipeline_stage || 'Prospect'}
                  </span>
                  <TierBadge tier={contact.engagement_tier || 'C'} />
                </div>
              </Link>
            )
          })}
          {table.getRowModel().rows.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">No contacts found</div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
      <div className="border rounded-none">
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

      )}

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
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
      />
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