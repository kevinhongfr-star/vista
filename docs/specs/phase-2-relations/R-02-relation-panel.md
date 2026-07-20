# R-02: Relation Panel — Slide-in Related Records

> **Phase**: 2 — Relations | **Effort**: 1 day | **Dependencies**: R-01
> **Ticket**: Build the slide-in panel that shows related records for any entity.

---

## Objective

Build `<RelationPanel>` — a 420px slide-in panel from the right side that shows all related records for a selected entity instance, organized by relation type in tabs.

## Acceptance Criteria

- [ ] Panel slides in from right when row is clicked (or "View relations" button)
- [ ] Panel shows entity name + icon at top
- [ ] Tabs for each relation type defined in EntityConfig.relations
- [ ] Each tab shows count badge: "Signals (5)"
- [ ] Tab content: mini-list of related records (displayField + 1-2 metadata fields)
- [ ] Click related record → navigates to that record's detail page
- [ ] "Create new" button in each tab → creates new related record
- [ ] "Link existing" button → search + select from dropdown
- [ ] "Unlink" button on each related record → removes the relation
- [ ] Loading skeleton while relations fetch
- [ ] Empty state per tab: "No related signals"
- [ ] Panel can be closed (X button or click outside)
- [ ] Panel width: 420px, responsive: full-width on mobile

## Component API

```typescript
interface RelationPanelProps {
  config: EntityConfig;
  record: Record<string, unknown>;  // The selected record
  isOpen: boolean;
  onClose: () => void;
}
```

## UI Layout

```
┌──────────────────────────────────────┐
│  John Smith                    [×]   │
│  VP Engineering · Acme Corp          │
│                                      │
│  [Signals(5)] [Campaigns(2)] [Acts(8)] [Clusters(1)]  │
│  ─────────────────────────────────── │
│                                      │
│  🔍 Search signals...                │
│                                      │
│  ⚡ Market shift in APAC fintech     │
│     Type: Market · Impact: High      │
│     3 days ago · [Unlink]            │
│                                      │
│  ⚡ New funding round: Series B      │
│     Type: Company · Impact: Medium   │
│     1 week ago · [Unlink]            │
│                                      │
│  [+ Link existing signal]            │
│  [+ Create new signal]               │
│                                      │
└──────────────────────────────────────┘
```

## Lazy Loading Strategy

- Panel opens → fetch ALL relation counts immediately (lightweight)
- User clicks tab → fetch records for THAT relation only
- Cache fetched relations for session duration
- Invalidate cache on realtime update

## API Calls

```
// On open: GET /api/relations/{entity}/{id}/counts
Response: { "signals": 5, "campaigns": 2, "activities": 8 }

// On tab click: GET /api/relations/{entity}/{id}/{relation}?limit=20
Response: { "data": [...], "count": 5 }
```

## Implementation Guidance

1. Create `RelationPanel.tsx` with Sheet/Drawer component (shadcn/ui)
2. Use tabs from shadcn/ui
3. Fetch counts on open, fetch details on tab click
4. Each related record: mini card component
5. Link/Unlink use the API routes from R-01
6. Animate slide-in with framer-motion or CSS transition
