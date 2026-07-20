# E-03: Kanban View — dnd-kit Board Renderer

> **Phase**: 0 — Foundation | **Effort**: 1 day | **Dependencies**: E-01, E-02
> **Ticket**: Build the Kanban board view for Pipeline, Signals, and any groupable entity.

---

## Objective

Build `<DataKanbanView>` — a drag-and-drop kanban board that groups records by a select/status property. Primary use: Pipeline (grouped by stage), but reusable for any entity with categorical grouping.

## Acceptance Criteria

- [ ] `DataKanbanView.tsx` renders columns from selectOptions or distinct values
- [ ] Each card shows configured cardProperties (max 5 fields)
- [ ] Drag card between columns → updates the groupBy field value
- [ ] Drag reorders cards within a column
- [ ] Column headers show count badge (number of cards)
- [ ] Column order follows selectOptions order (or kanbanConfig.columnOrder)
- [ ] Cards show VISTA score badge if entity has score properties
- [ ] Click card → navigates to detail page (rowLink from config)
- [ ] Double-click card → opens inline edit (or detail panel)
- [ ] Loading skeleton while data fetches
- [ ] Empty column state ("No items")
- [ ] Responsive: horizontal scroll on narrow screens, snap to column on mobile
- [ ] Performance: handles 200+ cards across columns without jank

---

## Component API

```typescript
interface DataKanbanViewProps {
  config: EntityConfig;
  data: Record<string, unknown>[];
  kanbanConfig: Required<ViewConfig>['kanbanConfig'];
  
  // Drag handler — parent manages the data update
  onCardMove: (cardId: string, newGroupValue: string) => Promise<void>;
  
  // Selection
  selectedCards: Set<string>;
  onSelectedCardsChange: (cards: Set<string>) => void;
  
  // UI
  isLoading?: boolean;
  onCardClick?: (row: Record<string, unknown>) => void;
}
```

## Card Layout

```
┌─────────────────────────────┐
│ ● High Priority    Score: 87│  ← cardProperties[0] + score (if exists)
│                             │
│ John Smith                  │  ← Primary field (first cardProperty or rowLink field)
│ Acme Corp                   │  ← cardProperties[1]
│ APAC · VP Engineering       │  ← cardProperties[2] + cardProperties[3]
│                             │
│ 📧 Last contact: 3 days ago │  ← cardProperties[4] (if date type)
└─────────────────────────────┘
```

## Drag-and-Drop Implementation

```typescript
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Strategy: Each column is a droppable zone. Cards within are sortable.
// On dragEnd:
//   1. Determine target column (droppable zone)
//   2. Call onCardMove(cardId, targetColumnValue)
//   3. Optimistic update: move card in UI
//   4. API call: PATCH /api/{entity}/{id} { groupByField: newValue }
//   5. On error: revert card position, show toast

// Performance: Use CSS transforms for drag animation, not layout recalculation
```

## Column Config

```typescript
interface KanbanColumn {
  id: string;              // Value of groupBy property (e.g., 'new', 'contacted')
  label: string;           // Display name (from selectOptions)
  color: string;           // Column header accent color
  cards: Record<string, unknown>[];  // Records in this column
  count: number;
}
```

## Implementation Guidance

1. Install: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. Create `DataKanbanView.tsx`
3. Group data by `kanbanConfig.groupBy` property value
4. Map selectOptions → KanbanColumn[]
5. Each column: `<Droppable>` zone with sortable cards
6. Card component: `<KanbanCard>` showing configured properties
7. DragOverlay for smooth drag animation
8. Handle onDragEnd → call onCardMove
9. Handle onDragOver for live column highlighting

## Performance Notes

- Limit visible cards per column to 50. Show "Show more..." button.
- Use `transform` CSS for drag, not margin/padding changes.
- Memoize card components with `React.memo`.
- Virtualize cards within column if > 50 cards.
