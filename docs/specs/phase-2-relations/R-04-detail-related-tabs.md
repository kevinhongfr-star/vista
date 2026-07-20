# R-04: Detail Page Template — Related Tabs

> **Phase**: 2 — Relations | **Effort**: 0.5 day | **Dependencies**: R-01, R-02
> **Ticket**: Build the detail page template with tabs for each related entity.

---

## Objective

Create a reusable detail page template that any entity can use. It shows the record's full data at top, then tabs for each related entity below.

## Detail Page Layout

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Contacts                    [Edit] [Delete]   │
│                                                           │
│  John Smith                              Score: 87       │
│  VP Engineering · Acme Corp · APAC                      │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Core Info          │ Pipeline        │ Activity      │ │
│  │ Email: john@...    │ Stage: Qualified│ Last: 3d ago  │ │
│  │ Phone: +1-...      │ Tier: A         │ Contacts: 5   │ │
│  │ LinkedIn: ...      │ Sector: Tech    │ Campaigns: 2  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [Overview] [Signals (5)] [Campaigns (2)] [Activities (8)] [Clusters (1)] │
│  ═══════════════════════════════════════════════════════ │
│                                                           │
│  (Content of selected tab)                               │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Template Component

```typescript
interface DetailPageTemplateProps {
  config: EntityConfig;
  record: Record<string, unknown>;
  children?: React.ReactNode;  // Custom content for overview tab
}

// Renders:
// 1. Breadcrumb + action buttons
// 2. Header section (name, key fields, score)
// 3. Property sections (grouped: Core, Pipeline, Activity)
// 4. Related entity tabs (from config.relations)
// 5. Each tab: mini-table of related records (reuses DataTableView)
```

## Usage

```typescript
// src/app/(dashboard)/contacts/[id]/page.tsx
export default function ContactDetail({ params }: { params: { id: string } }) {
  const { data: record } = useContact(params.id);
  return <DetailPageTemplate config={contactsConfig} record={record} />;
}
```

## Acceptance Criteria

- [ ] Template renders for any entity config
- [ ] Overview tab shows all properties grouped logically
- [ ] Related entity tabs show counts
- [ ] Click tab → fetches and displays related records as mini-table
- [ ] Click related record → navigates to that record's detail
- [ ] Edit button → inline edit mode or edit modal
- [ ] Delete button → confirmation dialog → DELETE API → redirect back
