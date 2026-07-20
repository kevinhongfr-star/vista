# E-02: Table View — TanStack Table Renderer

> **Phase**: 0 — Foundation | **Effort**: 1 day | **Dependencies**: E-01
> **Ticket**: Build the core table view component using TanStack Table v8.

---

## Objective

Build `<DataTableView>` — the default and most-used view renderer. This component takes an EntityConfig + data and renders a fully-featured data table with inline editing, sorting, column management, and row selection.

## Acceptance Criteria

- [ ] `DataTableView.tsx` renders a table from EntityConfig + data array
- [ ] Columns render correct cell content based on PropertyType
- [ ] Column headers are sortable (click to toggle asc/desc/none)
- [ ] Multi-column sort with shift+click
- [ ] Column headers are resizable (drag edge)
- [ ] Column visibility toggle (show/hide columns)
- [ ] Column drag-reorder
- [ ] Inline cell editing: click cell → editor appears → blur saves
- [ ] Type-aware editors: text input, number input, select dropdown, date picker, boolean toggle
- [ ] Row selection (checkbox column, shift+click for range)
- [ ] Row virtualization enabled when > 50 rows
- [ ] Sticky header on scroll
- [ ] Responsive: horizontal scroll on narrow screens
- [ ] Keyboard navigation: arrow keys move between cells, Enter starts editing
- [ ] Loading skeleton while data fetches
- [ ] Empty state renders configured emptyState from EntityConfig

---

## Component API

```typescript
// src/components/data-grid/views/DataTableView.tsx

interface DataTableViewProps {
  config: EntityConfig;
  data: Record<string, unknown>[];
  
  // State (controlled by parent hook)
  sorting: SortConfig[];
  onSortingChange: (sorts: SortConfig[]) => void;
  
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (vis: Record<string, boolean>) => void;
  
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  
  columnWidths: Record<string, number>;
  onColumnWidthsChange: (widths: Record<string, number>) => void;
  
  // Selection
  selectedRows: Set<string>;
  onSelectedRowsChange: (rows: Set<string>) => void;
  
  // Editing
  onCellEdit: (rowId: string, propertyId: string, value: unknown) => Promise<void>;
  isEditing?: boolean;  // Bulk edit mode
  
  // UI state
  isLoading?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
}
```

## Cell Renderers by PropertyType

| PropertyType | Display Renderer | Edit Renderer |
|---|---|---|
| `text` | Plain text | `<input type="text">` |
| `number` | Formatted number | `<input type="number">` |
| `select` | Colored badge (from selectOptions) | `<select>` dropdown |
| `multi_select` | Multiple colored badges | Multi-select dropdown (cmdk) |
| `date` | `MMM D, YYYY` format | `<input type="date">` |
| `datetime` | `MMM D, YYYY h:mm A` | `<input type="datetime-local">` |
| `boolean` | ✅ / ❌ icon | Toggle switch |
| `email` | Clickable `mailto:` link | `<input type="email">` |
| `phone` | Clickable `tel:` link | `<input type="tel">` |
| `url` | Clickable link (truncated display) | `<input type="url">` |
| `relation` | Entity pill (see R-03) | Search + select (see R-02) |
| `formula` | Computed display (read-only) | N/A (read-only) |
| `score` | Mini ScoreGauge component | N/A (computed by LENS) |
| `status` | Colored stage badge | Select dropdown (from stage options) |
| `tag` | Colored tag chip | Tag input |

---

## Inline Edit Flow

```
1. User clicks cell (editable = true)
2. Cell enters edit mode → shows type-appropriate editor
3. User modifies value
4. On blur or Enter:
   a. Optimistic update: UI shows new value immediately
   b. API call: PATCH /api/{entity}/{id} { propertyId: newValue }
   c. On success: confirm (no visual change needed)
   d. On error: revert to previous value, show toast error
5. On Escape: cancel edit, revert to previous value
```

---

## Data Fetching Hook

```typescript
// src/lib/data-grid/useDataGrid.ts
export function useDataGrid(config: EntityConfig, options: {
  filters: FilterConfig;
  sorts: SortConfig[];
  groupBy?: GroupConfig;
  pagination?: { page: number; pageSize: number };
}) {
  // Builds Supabase query from config + options
  // Returns: { data, isLoading, error, totalCount, refetch }
  
  const query = supabase
    .from(config.table)
    .select('*', { count: 'exact' });
  
  // Apply filters → PostgREST filter syntax
  // Apply sorts → .order()
  // Apply pagination → .range()
  
  return { data, isLoading, error, totalCount, refetch };
}
```

---

## API Routes

### GET /api/{entity}
```
Query params:
  ?filter[property][operator]=value    → Supabase filters
  ?sort=property:asc,property2:desc
  ?page=1&pageSize=50
  ?select=id,name,email,pipeline_stage  → Only requested columns

Response 200:
{
  "data": [...],
  "count": 1000,
  "page": 1,
  "pageSize": 50
}
```

### PATCH /api/{entity}/{id}
```json
// Request (inline edit — single field)
{ "pipeline_stage": "qualified" }

// Response 200
{ "id": "uuid", "pipeline_stage": "qualified", "updated_at": "..." }
```

### PATCH /api/{entity}/bulk
```json
// Request (bulk edit — multiple records, single field)
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"],
  "updates": { "tier": "A", "pipeline_stage": "contacted" }
}

// Response 200
{ "updated": 3 }
```

---

## Implementation Guidance

1. Install: `pnpm add @tanstack/react-table @tanstack/react-virtual`
2. Create `DataTableView.tsx` using `useReactTable()` hook
3. Map EntityConfig.properties → TanStack ColumnDef[]
4. For each PropertyType, create a cell renderer component
5. Create `InlineCellEditor.tsx` with type-aware editor switching
6. Wire up sorting via column header click handlers
7. Wire up column resize via TanStack's built-in resize
8. Add `@dnd-kit/sortable` for column reorder (separate from kanban dnd)
9. Add virtualization: `useVirtualizer()` from `@tanstack/react-virtual`
10. Create `useDataGrid` hook for data fetching

## Key Performance Notes

- **Virtualization**: Only render visible rows. Critical for 1000+ contacts.
- **Debounce inline edits**: Wait 300ms after last keystroke before API call.
- **Optimistic updates**: Update UI immediately, reconcile on server response.
- **Column memoization**: Use `React.useMemo` for column defs — don't recreate on every render.
- **Lazy select options**: For select/multi_select, load options once and cache.
