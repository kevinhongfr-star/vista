# E-05: Filter Bar, GroupBy, Saved Views, Bulk Actions

> **Phase**: 0 — Foundation | **Effort**: 1 day | **Dependencies**: E-01, E-02
> **Ticket**: Build the toolbar components that make the grid interactive.

---

## Objective

Build four toolbar components:
1. **FilterBar** — visual filter builder (any property, any operator, combinable)
2. **GroupBySelector** — group data by any property (2-level)
3. **SavedViewsSidebar** — CRUD for server-side saved views
4. **BulkActions** — toolbar that appears when rows are selected

## Acceptance Criteria — FilterBar

- [ ] Renders filter chips from active FilterConfig
- [ ] "Add filter" button → dropdown of filterable properties
- [ ] Each filter chip: [Property] [Operator] [Value] [×]
- [ ] Operator options change based on property type:
  - text: contains, equals, starts_with, is_empty
  - number: equals, greater_than, less_than, between
  - select: equals, not_equals, in, is_empty
  - date: equals, between, greater_than, less_than
  - boolean: equals
- [ ] Toggle between AND/OR combinator
- [ ] Nested groups: "Add group" creates a nested filter group
- [ ] Filter changes immediately update data (debounced 200ms)
- [ ] "Clear all" button resets to no filters

## FilterBar Component API

```typescript
interface FilterBarProps {
  config: EntityConfig;
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
}
```

## Acceptance Criteria — GroupBySelector

- [ ] Dropdown shows all groupable properties
- [ ] Selecting a group-by property reorganizes data into groups
- [ ] "None" option removes grouping
- [ ] Sub-group dropdown (secondary level)
- [ ] "Collapse all" / "Expand all" toggle
- [ ] Each group header shows: [Property value] — [count] records
- [ ] Works in table view (grouped rows with header rows)
- [ ] Works in kanban view (already grouped by definition)

## GroupBySelector Component API

```typescript
interface GroupBySelectorProps {
  config: EntityConfig;
  groupBy: GroupConfig | undefined;
  onGroupByChange: (groupBy: GroupConfig | undefined) => void;
}
```

## Acceptance Criteria — SavedViewsSidebar

- [ ] Slide-in panel from right (or left sidebar toggle)
- [ ] Lists saved views for current entity (owned by user + shared views)
- [ ] Click view → loads that view's config (columns, filters, sorts, groupBy, viewType)
- [ ] "Save current view" button → prompts for name
- [ ] "Save as new" vs "Update existing" option
- [ ] "Set as default" toggle
- [ ] "Share" toggle (sets is_shared = true)
- [ ] "Delete" with confirmation
- [ ] "Rename" inline edit
- [ ] Default view highlighted with star icon

## SavedViewsSidebar Component API

```typescript
interface SavedViewsSidebarProps {
  config: EntityConfig;
  currentViewState: {
    viewType: ViewType;
    columns: Record<string, boolean>;
    columnOrder: string[];
    filters: FilterConfig;
    sorts: SortConfig[];
    groupBy?: GroupConfig;
    kanbanGroupBy?: string;
    calendarMode?: string;
  };
  onViewLoad: (view: SavedView) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
```

## Acceptance Criteria — BulkActions

- [ ] Appears as a toolbar when selectedRows.size > 0
- [ ] Shows count: "N records selected"
- [ ] "Edit" button → opens BulkEditor modal
- [ ] "Delete" button → confirmation dialog → bulk DELETE
- [ ] "Export" button → CSV export of selected rows
- [ ] "Select all (N)" link to select all matching records (not just current page)
- [ ] "Clear selection" button
- [ ] Context-aware: shows only actions relevant to entity (e.g., "Run LENS scoring" for contacts)

## BulkActions Component API

```typescript
interface BulkActionsProps {
  config: EntityConfig;
  selectedRows: Set<string>;
  onClearSelection: () => void;
  onBulkEdit: (updates: Record<string, unknown>) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onExport: (format: 'csv' | 'pdf') => void;
  onSelectAll: () => void;
  totalCount: number;
}
```

## BulkEditor Modal

```typescript
interface BulkEditorProps {
  config: EntityConfig;
  selectedCount: number;
  onSubmit: (updates: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

// Shows all editable properties as form fields
// User changes values → only changed fields are submitted
// Preview: "This will update N records: field1=newValue, field2=newValue"
```

---

## Implementation Guidance

1. Create `FilterBar.tsx` — use cmdk for property/operator dropdown
2. Create `GroupBySelector.tsx` — simple dropdown with icon
3. Create `SavedViewsSidebar.tsx` — use the useSavedViews hook
4. Create `BulkActions.tsx` + `BulkEditor.tsx`
5. Create `useSavedViews.ts` hook:
   ```typescript
   export function useSavedViews(entity: string, userId: string) {
     // GET /api/views?entity=X&user_id=Y → list views
     // POST /api/views → save new view
     // PUT /api/views/:id → update existing
     // DELETE /api/views/:id → delete view
     return { views, isLoading, saveView, updateView, deleteView, setDefault };
   }
   ```
6. Wire FilterBar to useDataGrid → filter changes trigger refetch
7. Wire GroupBySelector to data transformation
8. Wire SavedViews to persist/load full view state
