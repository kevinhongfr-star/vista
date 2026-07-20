# M-02: Pipeline Migration — Filtered Contacts + Kanban

> **Phase**: 1 — Migration | **Effort**: 0.5 day | **Dependencies**: Phase 0, M-01
> **Ticket**: Pipeline page becomes a filtered view of contacts (stage ≠ Closed) with Kanban as default.

---

## Objective

Replace `PipelinePage.tsx` (479 lines) with `<UniversalDataGrid config={pipelineConfig} />`. Pipeline is NOT a separate table — it's vista_contacts filtered to active pipeline stages.

## pipeline.config.ts

```typescript
import { contactsConfig } from './contacts.config';

export const pipelineConfig: EntityConfig = {
  ...contactsConfig,
  entity: 'pipeline',
  label: 'Deal',
  labelPlural: 'Pipeline',
  icon: 'GitBranch',
  apiBasePath: '/api/contacts',  // Same API, different filters
  defaultView: 'kanban',
  
  // Default filter: exclude closed deals
  defaultFilters: {
    groups: [{
      combinator: 'AND',
      conditions: [
        { property: 'pipeline_stage', operator: 'not_equals', value: 'closed_won' },
        { property: 'pipeline_stage', operator: 'not_equals', value: 'closed_lost' },
      ]
    }]
  },
  
  views: [
    { type: 'kanban', label: 'Board', icon: 'Columns',
      kanbanConfig: {
        groupBy: 'pipeline_stage',
        columnOrder: ['new', 'contacted', 'qualified', 'proposal', 'interview'],
        cardProperties: ['full_name', 'company', 'sector', 'vista_score', 'last_contact'],
      }},
    { type: 'table', label: 'Table', icon: 'Table' },
    { type: 'chart', label: 'Funnel', icon: 'BarChart',
      chartConfig: { chartType: 'bar', xField: 'pipeline_stage', yField: 'vista_score', yAggregation: 'count' }},
  ],
};
```

## Acceptance Criteria

- [ ] Pipeline page defaults to Kanban view
- [ ] Kanban columns: New → Contacted → Qualified → Proposal → Interview (no Closed)
- [ ] Drag card from one column to another → PATCH pipeline_stage
- [ ] Table view shows same data (filtered)
- [ ] Chart view shows funnel (count per stage)
- [ ] Total pipeline value shown somewhere (sum of related deal values, or just count)
- [ ] Old PipelinePage.tsx deleted

## Implementation

```typescript
// src/app/(dashboard)/pipeline/page.tsx
'use client';
import { UniversalDataGrid } from '@/components/data-grid/UniversalDataGrid';
import { pipelineConfig } from '@/configs/pipeline.config';

export default function PipelinePage() {
  return <UniversalDataGrid config={pipelineConfig} initialView="kanban" />;
}
```

Delete: `src/app/(dashboard)/pipeline/page.tsx` old version, `PipelinePage.tsx` component.
