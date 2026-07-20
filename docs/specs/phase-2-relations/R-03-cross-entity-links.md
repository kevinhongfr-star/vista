# R-03: Cross-Entity Links — Clickable Pills

> **Phase**: 2 — Relations | **Effort**: 0.5 day | **Dependencies**: R-01
> **Ticket**: Make relation fields in the grid show clickable entity pills with popover preview.

---

## Objective

When a grid cell displays a relation type (e.g., a signal's "Related Contacts" column), render it as a clickable pill that shows a popover with record details on hover, and navigates on click.

## Acceptance Criteria

- [ ] Relation cells render as colored pills (entity-specific color)
- [ ] Hover pill → popover with 3-4 key fields from the related record
- [ ] Click pill → navigates to related record's detail page
- [ ] Multiple relations in one cell: show first 2 + "+N more"
- [ ] Company name auto-links to company cluster (if company appears in multiple contacts)
- [ ] Pill shows entity icon (⚡ for signal, 📢 for campaign, etc.)

## RelationLink Component

```typescript
interface RelationLinkProps {
  entity: string;          // Target entity type
  record: { id: string; displayField: string; [key: string]: unknown };
  color?: string;
}

// Renders: <span className="pill">⚡ Market shift</span>
// On hover: <Popover> with record details
// On click: router.push(`/${entity}/${record.id}`)
```

## Popover Preview

```
┌───────────────────────────────────┐
│ ⚡ Market shift in APAC fintech   │
│                                    │
│ Type: Market     Impact: High     │
│ Company: Acme Corp                │
│ Date: Jul 17, 2026                │
│                                    │
│ [View Signal →]                   │
└───────────────────────────────────┘
```

## Cell Renderer for Relation Type

In DataTableView, when `property.type === 'relation'`:
1. Fetch related record (or use pre-fetched data from join)
2. Render `<RelationLink entity={relationConfig.targetEntity} record={relatedRecord} />`
3. If multiple: show first 2 pills + "+N" badge

## Performance Note

- Prefetch relation display fields in the main query via Supabase joins
- Don't make individual API calls for each relation cell — use embedded data
