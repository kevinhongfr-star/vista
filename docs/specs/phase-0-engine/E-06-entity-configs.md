# E-06: UniversalDataGrid Wrapper + All Entity Configs

> **Phase**: 0 — Foundation | **Effort**: 1 day | **Dependencies**: E-01 through E-05
> **Ticket**: Build the main wrapper component and write config files for all 10 entities.

---

## Objective

Create `<UniversalDataGrid>` — the single component that every entity page uses. It composes all view renderers, toolbar components, and state management into one clean API. Then write the config file for each of the 10 entities.

## Acceptance Criteria

- [ ] `UniversalDataGrid.tsx` exists and accepts EntityConfig
- [ ] It composes: DataTableView, DataKanbanView, DataCalendarView, DataChartView
- [ ] It composes: FilterBar, GroupBySelector, ViewSwitcher, ColumnManager, BulkActions, SavedViewsSidebar
- [ ] View switching preserves state (filters, sorts, column visibility)
- [ ] State management: all view state in URL params + saved views
- [ ] Configs for all 10 entities compile without errors
- [ ] Each config validates against zod schema from E-01

---

## UniversalDataGrid Component

```typescript
// src/components/data-grid/UniversalDataGrid.tsx

interface UniversalDataGridProps {
  config: EntityConfig;
  // Optional overrides (e.g., Pipeline forces kanban view)
  initialView?: ViewType;
  initialFilters?: FilterConfig;
}

export function UniversalDataGrid({ config, initialView, initialFilters }: UniversalDataGridProps) {
  // 1. Load saved views for this entity
  // 2. Initialize state from saved view OR defaults
  // 3. Fetch data using useDataGrid(config, { filters, sorts, groupBy })
  // 4. Render:
  //    - Top toolbar: FilterBar + GroupBySelector + ViewSwitcher + ColumnManager + AI Prompt (Phase 3)
  //    - Main area: active view renderer (table/kanban/calendar/chart)
  //    - Bottom bar (when selected): BulkActions
  //    - Side panel: SavedViewsSidebar (toggle)
  //    - Side panel: RelationPanel (Phase 2, on row click)
}
```

## View Switcher

```typescript
interface ViewSwitcherProps {
  views: ViewConfig[];
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}
// Renders tabs: [📊 Table] [📋 Kanban] [📅 Calendar] [📈 Chart]
// Only shows views that exist in config.views
```

---

## Entity Configs

### contacts.config.ts (used by M-01)

```typescript
import { EntityConfig } from '@/components/data-grid/types';

export const contactsConfig: EntityConfig = {
  entity: 'contacts',
  label: 'Contact',
  labelPlural: 'Contacts',
  table: 'vista_contacts',
  icon: 'Users',
  apiBasePath: '/api/contacts',
  
  properties: [
    // Core identity
    { id: 'full_name', label: 'Name', type: 'text', dbColumn: 'full_name', width: 200, pinned: 'left' },
    { id: 'company', label: 'Company', type: 'text', dbColumn: 'company_name', width: 180 },
    { id: 'title', label: 'Title', type: 'text', dbColumn: 'job_title', width: 200 },
    { id: 'email', label: 'Email', type: 'email', dbColumn: 'email', width: 200 },
    { id: 'phone', label: 'Phone', type: 'phone', dbColumn: 'phone', width: 150 },
    { id: 'linkedin', label: 'LinkedIn', type: 'url', dbColumn: 'linkedin_url', width: 150 },
    
    // Classification
    { id: 'sector', label: 'Sector', type: 'select', dbColumn: 'sector', width: 120,
      selectOptions: [
        { value: 'financial_services', label: 'Financial Services', color: 'blue' },
        { value: 'technology', label: 'Technology', color: 'purple' },
        { value: 'healthcare', label: 'Healthcare', color: 'green' },
        { value: 'energy', label: 'Energy', color: 'yellow' },
        { value: 'consumer', label: 'Consumer', color: 'pink' },
        { value: 'industrial', label: 'Industrial', color: 'gray' },
      ]},
    { id: 'region', label: 'Region', type: 'select', dbColumn: 'region', width: 120,
      selectOptions: [
        { value: 'apac', label: 'APAC', color: 'blue' },
        { value: 'emea', label: 'EMEA', color: 'green' },
        { value: 'americas', label: 'Americas', color: 'purple' },
        { value: 'global', label: 'Global', color: 'gray' },
      ]},
    { id: 'seniority', label: 'Seniority', type: 'select', dbColumn: 'seniority_level', width: 120,
      selectOptions: [
        { value: 'c_suite', label: 'C-Suite', color: 'red' },
        { value: 'vp', label: 'VP', color: 'purple' },
        { value: 'director', label: 'Director', color: 'blue' },
        { value: 'manager', label: 'Manager', color: 'green' },
        { value: 'individual', label: 'Individual', color: 'gray' },
      ]},
    { id: 'tier', label: 'Tier', type: 'select', dbColumn: 'tier', width: 80,
      selectOptions: [
        { value: 'S', label: 'S', color: 'red' },
        { value: 'A', label: 'A', color: 'purple' },
        { value: 'B', label: 'B', color: 'blue' },
        { value: 'C', label: 'C', color: 'green' },
        { value: 'D', label: 'D', color: 'gray' },
      ]},
    
    // Pipeline
    { id: 'pipeline_stage', label: 'Stage', type: 'status', dbColumn: 'pipeline_stage', width: 130,
      selectOptions: [
        { value: 'new', label: 'New', color: 'blue' },
        { value: 'contacted', label: 'Contacted', color: 'yellow' },
        { value: 'qualified', label: 'Qualified', color: 'purple' },
        { value: 'proposal', label: 'Proposal', color: 'orange' },
        { value: 'interview', label: 'Interview', color: 'pink' },
        { value: 'closed_won', label: 'Closed Won', color: 'green' },
        { value: 'closed_lost', label: 'Closed Lost', color: 'gray' },
      ]},
    
    // Scores
    { id: 'vista_score', label: 'VISTA Score', type: 'score', dbColumn: 'priority_score', width: 100 },
    { id: 'value_score', label: 'Value', type: 'score', dbColumn: 'value_score', width: 80, scoreDimension: 'V' },
    { id: 'insight_score', label: 'Insight', type: 'score', dbColumn: 'insight_score', width: 80, scoreDimension: 'I' },
    { id: 'signal_score', label: 'Signal', type: 'score', dbColumn: 'signal_score', width: 80, scoreDimension: 'S' },
    { id: 'trust_score', label: 'Trust', type: 'score', dbColumn: 'trust_score', width: 80, scoreDimension: 'T' },
    { id: 'access_score', label: 'Access', type: 'score', dbColumn: 'access_score', width: 80, scoreDimension: 'A' },
    
    // Dates
    { id: 'last_contact', label: 'Last Contact', type: 'date', dbColumn: 'last_outreach_date', width: 130 },
    { id: 'created_at', label: 'Added', type: 'date', dbColumn: 'created_at', width: 120, hidden: true },
    { id: 'updated_at', label: 'Updated', type: 'datetime', dbColumn: 'updated_at', width: 150, hidden: true },
  ],
  
  views: [
    { type: 'table', label: 'Table', icon: 'Table' },
    { type: 'kanban', label: 'Pipeline', icon: 'Columns',
      kanbanConfig: { groupBy: 'pipeline_stage', cardProperties: ['company', 'title', 'sector', 'region', 'last_contact'] }},
    { type: 'chart', label: 'Analytics', icon: 'BarChart',
      chartConfig: { chartType: 'bar', xField: 'sector', yField: 'vista_score', yAggregation: 'avg' }},
  ],
  defaultView: 'table',
  
  defaultSort: [{ property: 'vista_score', direction: 'desc' }],
  
  features: {
    inlineEdit: true,
    bulkEdit: true,
    createRecord: true,
    deleteRecord: true,
    export: true,
    savedViews: true,
    aiPrompt: true,  // Phase 3
    realtime: true,
  },
  
  relations: [
    { id: 'contact_signals', label: 'Signals', targetEntity: 'signals', targetTable: 'signals', type: 'one-to-many', foreignKey: 'contact_id', displayField: 'title' },
    { id: 'contact_campaigns', label: 'Campaigns', targetEntity: 'campaigns', targetTable: 'campaigns', type: 'many-to-many', junctionTable: 'campaign_contacts', localKey: 'contact_id', foreignKey: 'campaign_id', displayField: 'name' },
    { id: 'contact_activities', label: 'Activities', targetEntity: 'activities', targetTable: 'campaign_activities', type: 'one-to-many', foreignKey: 'contact_id', displayField: 'activity_type' },
  ],
  
  rowLink: (row) => `/contacts/${row.id}`,
  emptyState: {
    title: 'No contacts yet',
    description: 'Import contacts or create your first one.',
    action: { label: 'Import Contacts', href: '/contacts/import' },
  },
};
```

### signals.config.ts (used by M-03)

```typescript
export const signalsConfig: EntityConfig = {
  entity: 'signals',
  label: 'Signal',
  labelPlural: 'Signals',
  table: 'signals',
  icon: 'Zap',
  apiBasePath: '/api/signals',
  properties: [
    { id: 'title', label: 'Title', type: 'text', dbColumn: 'title', width: 250, pinned: 'left' },
    { id: 'type', label: 'Type', type: 'select', dbColumn: 'signal_type', width: 120,
      selectOptions: [
        { value: 'market', label: 'Market', color: 'blue' },
        { value: 'company', label: 'Company', color: 'purple' },
        { value: 'industry', label: 'Industry', color: 'green' },
        { value: 'regulatory', label: 'Regulatory', color: 'red' },
        { value: 'technology', label: 'Technology', color: 'yellow' },
        { value: 'people', label: 'People', color: 'pink' },
      ]},
    { id: 'impact', label: 'Impact', type: 'select', dbColumn: 'impact_level', width: 100,
      selectOptions: [
        { value: 'critical', label: 'Critical', color: 'red' },
        { value: 'high', label: 'High', color: 'orange' },
        { value: 'medium', label: 'Medium', color: 'yellow' },
        { value: 'low', label: 'Low', color: 'green' },
      ]},
    { id: 'company', label: 'Company', type: 'text', dbColumn: 'company_name', width: 150 },
    { id: 'sector', label: 'Sector', type: 'select', dbColumn: 'sector', width: 120 },
    { id: 'region', label: 'Region', type: 'select', dbColumn: 'region', width: 100 },
    { id: 'date', label: 'Date', type: 'date', dbColumn: 'signal_date', width: 120 },
    { id: 'source', label: 'Source', type: 'url', dbColumn: 'source_url', width: 150 },
    { id: 'status', label: 'Status', type: 'select', dbColumn: 'status', width: 110,
      selectOptions: [
        { value: 'new', label: 'New', color: 'blue' },
        { value: 'reviewed', label: 'Reviewed', color: 'yellow' },
        { value: 'actioned', label: 'Actioned', color: 'green' },
        { value: 'dismissed', label: 'Dismissed', color: 'gray' },
      ]},
    { id: 'description', label: 'Description', type: 'text', dbColumn: 'description', width: 300, hidden: true },
  ],
  views: [
    { type: 'table', label: 'Table', icon: 'Table' },
    { type: 'kanban', label: 'By Status', icon: 'Columns',
      kanbanConfig: { groupBy: 'status', cardProperties: ['title', 'type', 'impact', 'company', 'date'] }},
    { type: 'calendar', label: 'Timeline', icon: 'Calendar',
      calendarConfig: { dateField: 'date', titleField: 'title', defaultMode: 'month' }},
    { type: 'chart', label: 'Analytics', icon: 'BarChart',
      chartConfig: { chartType: 'bar', xField: 'type', yField: 'impact', yAggregation: 'count' }},
  ],
  defaultView: 'table',
  defaultSort: [{ property: 'date', direction: 'desc' }],
  features: { inlineEdit: true, bulkEdit: true, createRecord: true, deleteRecord: true, export: true, savedViews: true, aiPrompt: true, realtime: true },
  relations: [
    { id: 'signal_contacts', label: 'Related Contacts', targetEntity: 'contacts', targetTable: 'vista_contacts', type: 'many-to-many', junctionTable: 'signal_contacts', localKey: 'signal_id', foreignKey: 'contact_id', displayField: 'full_name' },
  ],
  emptyState: { title: 'No signals yet', description: 'Signals are auto-classified from market intelligence.', action: { label: 'Run LENS Classification', onClick: 'trigger_lens' } },
};
```

### Remaining 8 Configs (abbreviated — full detail in each migration ticket)

| Entity | Table | Key Properties | Default View | Views |
|--------|-------|----------------|-------------|-------|
| **pipeline** | vista_contacts | Same as contacts + filtered (stage ≠ Closed) | kanban | table, kanban, chart |
| **campaigns** | campaigns | name, status, type, sector, start_date, end_date | table | table, kanban |
| **clusters** | density_clusters | name, sector, region, status, contact_count | table | table, kanban |
| **activities** | campaign_activities | activity_type, date, contact, campaign, notes | calendar | table, calendar |
| **programs** | programs | name, status, sector, region, start_date | table | table, kanban |
| **strategy** | strategic_notes | topic, content, author, date, related_entity | table | table |
| **templates** | vista_outreach_templates | name, type, subject, status | table | table |
| **automation** | (computed) | counters, last_run, status | table | table |

Each config is ~50 lines of TypeScript. Total: ~400 lines for all 10 configs.

---

## Implementation Guidance

1. Create `UniversalDataGrid.tsx` — compose all components
2. Create `ViewSwitcher.tsx` — tab bar for switching view types
3. Create `ColumnManager.tsx` — popover with checkbox list for visibility + drag reorder
4. Write all 10 entity configs in `src/configs/`
5. Validate each config: `validateEntityConfig(contactsConfig)` — must pass
6. Create `src/app/data-grid-demo/page.tsx` — test page rendering each config
7. Test: contacts config renders with data, kanban shows pipeline stages, chart shows sector breakdown

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Config per entity, not per page | Same config drives table, kanban, calendar, chart. No duplication. |
| Pipeline = filtered contacts, not separate table | Avoids data sync issues. One source of truth (vista_contacts). |
| View state in URL params | Shareable links, back button works, refreshable without losing state. |
| 50-line configs vs 500-line components | 10x less code. Adding a new entity = writing a config file. |
