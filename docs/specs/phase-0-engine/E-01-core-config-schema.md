# E-01: Core Config Schema & TypeScript Types

> **Phase**: 0 — Foundation | **Effort**: 1 day | **Dependencies**: None
> **Ticket**: Build the type system, zod validators, and Supabase schema that the entire engine depends on.

---

## Objective

Define the complete TypeScript type system for the Universal Data Grid Engine. Every other ticket (E-02 through D-05) depends on these types. This is the foundation — get it right.

## Acceptance Criteria

- [ ] `src/components/data-grid/types.ts` exists with all interfaces below
- [ ] `src/components/data-grid/validators.ts` exists with zod schemas matching every type
- [ ] `src/lib/data-grid/configSchema.ts` exports `validateEntityConfig()` function
- [ ] Supabase migration creates `user_saved_views` table
- [ ] `src/types/database.ts` updated with `UserSavedView` row type
- [ ] All types pass `tsc --noEmit` with zero errors
- [ ] Unit tests: validators accept valid configs, reject invalid configs

---

## TypeScript Interfaces

### PropertyConfig — The atomic unit

```typescript
// src/components/data-grid/types.ts

export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'url'
  | 'relation'
  | 'formula'
  | 'score'        // VISTA V/I/S/T/A scores
  | 'status'       // Pipeline stage
  | 'tag';         // Colored label

export interface SelectOption {
  value: string;
  label: string;
  color: string;   // Tailwind color class: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray'
}

export interface PropertyConfig {
  id: string;                    // Unique key, maps to DB column name
  label: string;                 // Display name in column header
  type: PropertyType;
  dbColumn: string;              // Supabase column name (may differ from id)
  
  // Display
  width?: number;                // Default column width in px (default: 150)
  minWidth?: number;             // Minimum resize width (default: 80)
  pinned?: 'left' | 'right';    // Pin column to edge
  hidden?: boolean;              // Hidden by default (user can show)
  
  // Editing
  editable?: boolean;            // Can user inline-edit? (default: true)
  required?: boolean;            // Required for record creation
  defaultValue?: unknown;        // Default for new records
  
  // Type-specific config
  selectOptions?: SelectOption[];          // For 'select' and 'multi_select'
  relationConfig?: RelationFieldConfig;    // For 'relation' type
  formulaExpression?: string;              // For 'formula' type (computed)
  scoreDimension?: 'V' | 'I' | 'S' | 'T' | 'A'; // For 'score' type
  
  // Filtering & Sorting
  filterable?: boolean;          // Can filter by this property? (default: true)
  sortable?: boolean;            // Can sort by this property? (default: true)
  groupable?: boolean;           // Can group by this property? (default: true)
  
  // Validation
  zodValidator?: string;         // Zod schema name for runtime validation
}

export interface RelationFieldConfig {
  targetEntity: string;          // e.g., 'signals', 'campaigns'
  targetTable: string;           // e.g., 'signals', 'campaigns'
  foreignKey: string;            // FK column name in target table
  displayField: string;          // Field to show in relation pill (e.g., 'name')
  junctionTable?: string;        // For many-to-many relations
  localKey?: string;             // For many-to-many: local FK in junction table
}
```

### ViewConfig — How data is displayed

```typescript
export type ViewType = 'table' | 'kanban' | 'calendar' | 'chart';

export interface ViewConfig {
  type: ViewType;
  label: string;                 // Display name: "Table View", "Kanban Board"
  icon?: string;                 // Lucide icon name
  
  // Table-specific
  tableConfig?: {
    virtualization?: boolean;    // Enable row virtualization (default: true for 100+ rows)
    rowHeight?: number;          // Default: 40px
    stickyHeader?: boolean;      // Default: true
  };
  
  // Kanban-specific
  kanbanConfig?: {
    groupBy: string;             // Property id to group by (must be 'select' or 'status' type)
    columnOrder?: string[];      // Explicit column order (values from selectOptions)
    cardProperties?: string[];   // Property ids to show on card (max 5)
    cardHeight?: number;         // Default: 120px
  };
  
  // Calendar-specific
  calendarConfig?: {
    dateField: string;           // Property id for date (must be 'date' or 'datetime')
    endDateField?: string;       // For range events (optional)
    titleField: string;          // Property id for event title
    defaultMode?: 'month' | 'week' | 'day';  // Default: 'month'
  };
  
  // Chart-specific
  chartConfig?: {
    chartType: 'bar' | 'line' | 'donut' | 'area';
    xField: string;              // Property for x-axis / grouping
    yField: string;              // Property for y-axis / aggregation
    yAggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
    stacked?: boolean;
  };
}
```

### FilterConfig — How data is filtered

```typescript
export type FilterOperator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'greater_than' | 'less_than'
  | 'between'
  | 'is_empty' | 'is_not_empty'
  | 'in' | 'not_in';

export type FilterCombinator = 'AND' | 'OR';

export interface FilterCondition {
  property: string;              // PropertyConfig.id
  operator: FilterOperator;
  value: unknown;                // Type depends on PropertyType
}

export interface FilterGroup {
  combinator: FilterCombinator;
  conditions: (FilterCondition | FilterGroup)[];  // Nested groups supported
}

export interface FilterConfig {
  groups: FilterGroup[];         // Multiple groups combined with AND
}
```

### SortConfig

```typescript
export interface SortConfig {
  property: string;              // PropertyConfig.id
  direction: 'asc' | 'desc';
  priority?: number;             // For multi-sort (1 = primary, 2 = secondary)
}
```

### GroupConfig

```typescript
export interface GroupConfig {
  primary: string;               // Property id for primary grouping
  secondary?: string;            // Property id for sub-grouping (2-level)
  collapseAll?: boolean;         // Start collapsed? (default: false)
}
```

### SavedView — Server-side persistence

```typescript
export interface SavedView {
  id?: string;                   // UUID, assigned by Supabase
  user_id: string;               // Owner
  entity: string;                // e.g., 'contacts', 'signals'
  name: string;                  // User-given name
  isDefault?: boolean;           // Default view for this entity?
  isShared?: boolean;            // Visible to other users?
  
  // Persisted state
  viewType: ViewType;
  columns: {                     // Column visibility + order
    id: string;
    visible: boolean;
    width?: number;
    order: number;
  }[];
  filters: FilterConfig;
  sorts: SortConfig[];
  groupBy?: GroupConfig;
  
  // Kanban-specific persisted state
  kanbanGroupBy?: string;
  kanbanColumnOrder?: string[];
  
  // Calendar-specific persisted state
  calendarDateField?: string;
  calendarMode?: 'month' | 'week' | 'day';
  calendarDate?: string;         // ISO date string for current view position
  
  // Chart-specific persisted state
  chartType?: string;
  chartXField?: string;
  chartYField?: string;
  
  created_at?: string;
  updated_at?: string;
}
```

### EntityConfig — The top-level config for each page

```typescript
export interface EntityConfig {
  entity: string;                // Unique entity key: 'contacts', 'signals', etc.
  label: string;                 // Display name: "Contacts", "Signals"
  labelPlural: string;           // "Contacts", "Signals"
  table: string;                 // Supabase table name: 'vista_contacts', 'signals'
  icon?: string;                 // Lucide icon name
  
  // Properties
  properties: PropertyConfig[];
  
  // Views
  views: ViewConfig[];
  defaultView: ViewType;
  
  // Default state
  defaultSort: SortConfig[];
  defaultFilters?: FilterConfig;
  defaultGroupBy?: GroupConfig;
  
  // Features
  features: {
    inlineEdit: boolean;         // Default: true
    bulkEdit: boolean;           // Default: true
    createRecord: boolean;       // Default: true
    deleteRecord: boolean;       // Default: true
    export: boolean;             // Default: true (CSV + PDF)
    savedViews: boolean;         // Default: true
    aiPrompt: boolean;           // Default: false (enable per entity)
    realtime: boolean;           // Default: true
  };
  
  // Relations
  relations?: RelationConfig[];
  
  // API
  apiBasePath: string;           // e.g., '/api/contacts', '/api/signals'
  
  // UI customizations
  rowLink?: (row: Record<string, unknown>) => string;  // Click row → navigate to URL
  rowClassName?: string;         // Custom row styling
  emptyState?: {
    title: string;
    description: string;
    action?: { label: string; href?: string; onClick?: string };
  };
}

export interface RelationConfig {
  id: string;                    // Relation key: 'contact_signals'
  label: string;                 // Display: "Signals"
  targetEntity: string;          // Target entity key
  targetTable: string;           // Target Supabase table
  type: 'one-to-many' | 'many-to-many';
  foreignKey: string;            // FK in target table (one-to-many)
  junctionTable?: string;        // Junction table (many-to-many)
  localKey?: string;             // Local FK in junction table
  displayField: string;          // Field to display in relation panel
  countField?: string;           // For showing count badge
}
```

---

## Zod Validators

```typescript
// src/components/data-grid/validators.ts
import { z } from 'zod';

const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  color: z.enum(['red', 'blue', 'green', 'yellow', 'purple', 'gray', 'orange', 'pink']),
});

const propertyTypeSchema = z.enum([
  'text', 'number', 'select', 'multi_select', 'date', 'datetime',
  'boolean', 'email', 'phone', 'url', 'relation', 'formula',
  'score', 'status', 'tag'
]);

const propertyConfigSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: propertyTypeSchema,
  dbColumn: z.string().min(1),
  width: z.number().optional(),
  minWidth: z.number().optional(),
  pinned: z.enum(['left', 'right']).optional(),
  hidden: z.boolean().optional(),
  editable: z.boolean().optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  selectOptions: z.array(selectOptionSchema).optional(),
  filterable: z.boolean().optional(),
  sortable: z.boolean().optional(),
  groupable: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.type === 'select' || data.type === 'multi_select') {
      return data.selectOptions && data.selectOptions.length > 0;
    }
    return true;
  },
  { message: 'select/multi_select types require selectOptions' }
);

const viewTypeSchema = z.enum(['table', 'kanban', 'calendar', 'chart']);

const viewConfigSchema = z.object({
  type: viewTypeSchema,
  label: z.string().min(1),
  icon: z.string().optional(),
  tableConfig: z.object({
    virtualization: z.boolean().optional(),
    rowHeight: z.number().optional(),
    stickyHeader: z.boolean().optional(),
  }).optional(),
  kanbanConfig: z.object({
    groupBy: z.string(),
    columnOrder: z.array(z.string()).optional(),
    cardProperties: z.array(z.string()).max(5).optional(),
    cardHeight: z.number().optional(),
  }).optional(),
  calendarConfig: z.object({
    dateField: z.string(),
    endDateField: z.string().optional(),
    titleField: z.string(),
    defaultMode: z.enum(['month', 'week', 'day']).optional(),
  }).optional(),
  chartConfig: z.object({
    chartType: z.enum(['bar', 'line', 'donut', 'area']),
    xField: z.string(),
    yField: z.string(),
    yAggregation: z.enum(['count', 'sum', 'avg', 'min', 'max']).optional(),
    stacked: z.boolean().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.type === 'kanban') return !!data.kanbanConfig;
    if (data.type === 'calendar') return !!data.calendarConfig;
    if (data.type === 'chart') return !!data.chartConfig;
    return true;
  },
  { message: 'View type requires matching config object' }
);

export const entityConfigSchema = z.object({
  entity: z.string().min(1),
  label: z.string().min(1),
  labelPlural: z.string().min(1),
  table: z.string().min(1),
  icon: z.string().optional(),
  properties: z.array(propertyConfigSchema).min(1),
  views: z.array(viewConfigSchema).min(1),
  defaultView: viewTypeSchema,
  defaultSort: z.array(z.object({
    property: z.string(),
    direction: z.enum(['asc', 'desc']),
    priority: z.number().optional(),
  })).min(1),
  defaultFilters: z.any().optional(),
  defaultGroupBy: z.any().optional(),
  features: z.object({
    inlineEdit: z.boolean(),
    bulkEdit: z.boolean(),
    createRecord: z.boolean(),
    deleteRecord: z.boolean(),
    export: z.boolean(),
    savedViews: z.boolean(),
    aiPrompt: z.boolean(),
    realtime: z.boolean(),
  }),
  relations: z.array(z.any()).optional(),
  apiBasePath: z.string().startsWith('/api/'),
  rowLink: z.function().optional(),
  emptyState: z.object({
    title: z.string(),
    description: z.string(),
    action: z.object({
      label: z.string(),
      href: z.string().optional(),
      onClick: z.string().optional(),
    }).optional(),
  }).optional(),
});

export function validateEntityConfig(config: unknown): EntityConfig {
  return entityConfigSchema.parse(config);
}
```

---

## Supabase Schema — user_saved_views

```sql
-- Migration: create_user_saved_views
-- Run via Supabase SQL editor or migration file

CREATE TABLE IF NOT EXISTS user_saved_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  
  -- Persisted view state (JSONB for flexibility)
  view_type TEXT NOT NULL DEFAULT 'table',
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  filters JSONB NOT NULL DEFAULT '{"groups":[]}'::jsonb,
  sorts JSONB NOT NULL DEFAULT '[]'::jsonb,
  group_by JSONB,
  
  -- View-specific state
  kanban_group_by TEXT,
  kanban_column_order JSONB,
  calendar_date_field TEXT,
  calendar_mode TEXT,
  calendar_date TEXT,
  chart_type TEXT,
  chart_x_field TEXT,
  chart_y_field TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_user_entity_name UNIQUE (user_id, entity, name)
);

-- Indexes for common queries
CREATE INDEX idx_saved_views_user_entity ON user_saved_views (user_id, entity);
CREATE INDEX idx_saved_views_default ON user_saved_views (user_id, entity) WHERE is_default = true;

-- RLS (if using Supabase auth; for now, service role manages)
ALTER TABLE user_saved_views ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_saved_views_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_views_updated_at
  BEFORE UPDATE ON user_saved_views
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_views_timestamp();
```

---

## API Routes

### GET /api/views?entity={entity}&user_id={user_id}
```json
// Response 200
{
  "views": [
    {
      "id": "uuid-1",
      "entity": "contacts",
      "name": "My Active Leads",
      "view_type": "table",
      "columns": [...],
      "filters": {...},
      "sorts": [...],
      "is_default": false,
      "is_shared": false
    }
  ]
}
```

### POST /api/views
```json
// Request
{
  "user_id": "user-123",
  "entity": "contacts",
  "name": "High Priority APAC",
  "view_type": "kanban",
  "columns": [...],
  "filters": {...},
  "sorts": [...],
  "kanban_group_by": "pipeline_stage",
  "kanban_column_order": ["new", "contacted", "qualified", "proposal", "closed"]
}
// Response 201
{ "id": "uuid-new", ... }
```

### PUT /api/views/{id}
```json
// Request (partial update)
{ "name": "Renamed View", "filters": {...} }
// Response 200
{ "id": "uuid-1", "name": "Renamed View", ... }
```

### DELETE /api/views/{id}
```
// Response 204 No Content
```

---

## Implementation Guidance for Trae

1. Create `src/components/data-grid/types.ts` — copy all interfaces above
2. Create `src/components/data-grid/validators.ts` — copy zod schemas above
3. Create `src/lib/data-grid/configSchema.ts`:
   ```typescript
   import { entityConfigSchema, type EntityConfig } from './validators';
   
   export function validateEntityConfig(config: unknown): EntityConfig {
     try {
       return entityConfigSchema.parse(config);
     } catch (error) {
       console.error('Invalid entity config:', error);
       throw new Error(`Invalid entity config: ${error}`);
     }
   }
   ```
4. Run the SQL migration above in Supabase
5. Add `UserSavedView` type to `src/types/database.ts`
6. Create API route files under `src/app/api/views/`
7. Run `tsc --noEmit` to verify zero errors
8. Write basic unit tests for validators

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSONB for view state columns/filters/sorts | Flexible schema — different view types need different fields. Avoids 20+ nullable columns. |
| Separate `view_type` column + JSONB | Allows SQL filtering by view type without parsing JSON |
| `user_id` as TEXT, not UUID FK | VISTA doesn't use Supabase Auth. User ID comes from session/cookie. Future-proof for when auth is added. |
| Zod for runtime validation | Catches config errors at startup, not at runtime. Each entity config is validated once on import. |
| `PropertyType` includes 'score' and 'status' | VISTA-specific types that need custom renderers (ScoreGauge, stage colors). Extensible. |
| FilterConfig supports nested groups | Matches Supabase's PostgREST filter syntax. Enables complex queries like "(sector = X AND tier = Y) OR (status = Z)". |

## Testing Checklist

- [ ] Valid contacts config passes validation
- [ ] Valid signals config passes validation
- [ ] Config with missing required field throws clear error
- [ ] Select type without selectOptions throws error
- [ ] Kanban view without kanbanConfig throws error
- [ ] Calendar view without calendarConfig throws error
- [ ] Chart view without chartConfig throws error
- [ ] API: POST creates view, GET retrieves, PUT updates, DELETE removes
- [ ] API: Duplicate name for same user+entity returns 409
- [ ] Supabase: Table created with correct indexes
