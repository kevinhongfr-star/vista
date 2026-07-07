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
import { EncirclementBadge } from "@/components/scoring/EncirclementBadge"
import { DeltaIndicator } from "@/components/scoring/DeltaIndicator"
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Activity } from "lucide-react"
import type { VistaContact } from "@/lib/types"

interface ContactsTableProps {
  data: VistaContact[]
  pageCount: number
  currentPage: number
  searchParams: {
    tier?: string
    level?: string
    search?: string
  }
}

export function ContactsTable({ 
  data, 
  pageCount, 
  currentPage,
  searchParams 
}: ContactsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'priority_score', desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState(searchParams.search || '')

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
      header: 'Contact',
      accessorKey: 'name',
      cell: ({ row }) => (
        <Link 
          href={`/contacts/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name || "Unknown"}
        </Link>
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
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.role || "-"}</div>
          {row.original.seniority && (
            <div className="text-xs text-muted-foreground">{row.original.seniority}</div>
          )}
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      id: 'region',
      header: 'Region',
      accessorKey: 'region',
      cell: ({ row }) => row.original.region || "-",
      enableGlobalFilter: true,
    },
    {
      id: 'tier',
      header: 'Tier',
      accessorKey: 'engagement_tier',
      cell: ({ row }) => (
        <TierBadge tier={row.original.engagement_tier} size="sm" />
      ),
      filterFn: (row, id, value) => {
        const tierValue = row.getValue(id) as string | null | undefined
        return value === 'all' || tierValue?.toLowerCase() === (value as string).toLowerCase()
      },
    },
    {
      id: 'level',
      header: 'Level',
      accessorKey: 'encirclement_level',
      cell: ({ row }) => (
        <EncirclementBadge level={row.original.encirclement_level} size="sm" />
      ),
      filterFn: (row, id, value) => {
        const levelValue = row.getValue(id) as string | null | undefined
        return value === 'all' || levelValue?.toLowerCase() === (value as string).toLowerCase()
      },
    },
    {
      id: 'delta',
      header: 'Delta',
      accessorKey: 'score_delta',
      cell: ({ row }) => (
        <DeltaIndicator delta={row.original.score_delta} />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            title="Draft Outreach"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            title="Add Signal"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 80,
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

  const handleTierChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '0')
    if (value === 'all') {
      params.delete('tier')
    } else {
      params.set('tier', value)
    }
    router.push(`/contacts?${params.toString()}`)
  }

  const handleLevelChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '0')
    if (value === 'all') {
      params.delete('level')
    } else {
      params.set('level', value)
    }
    router.push(`/contacts?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
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
          className="max-w-sm"
        />
        
        <Select
          value={searchParams.tier || 'all'}
          onValueChange={handleTierChange}
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

        <Select
          value={searchParams.level || 'all'}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="scout">Scout</SelectItem>
            <SelectItem value="patrol">Patrol</SelectItem>
            <SelectItem value="encirclement">Encirclement</SelectItem>
            <SelectItem value="siege">Siege</SelectItem>
            <SelectItem value="occupation">Occupation</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">
            {data.length} contacts
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
                      header.id === 'actions' && "text-center"
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
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    (row.original.priority_score ?? 0) >= 60 && "bg-success/5"
                  )}
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
    </div>
  )
}