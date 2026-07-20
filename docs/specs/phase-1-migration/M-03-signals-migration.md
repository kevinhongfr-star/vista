# M-03: Signals Migration — Engine + Calendar + Empty State

> **Phase**: 1 — Migration | **Effort**: 1 day | **Dependencies**: Phase 0
> **Ticket**: Replace SignalsPage.tsx (619 lines) with UniversalDataGrid + signalsConfig.

---

## Objective

Replace hardcoded SignalsPage with engine-driven page. Signals currently has 0 rows — this ticket must also handle the empty state gracefully and provide a path to populate data (via LENS agent or manual import).

## Acceptance Criteria

- [ ] Signals page renders via UniversalDataGrid with signalsConfig
- [ ] Table view shows signals with all configured columns
- [ ] Kanban view groups by status (New → Reviewed → Actioned → Dismissed)
- [ ] Calendar view shows signals on timeline by signal_date
- [ ] Chart view shows breakdown by type and impact
- [ ] Empty state displays when 0 signals: "No signals yet" + "Run LENS Classification" button
- [ ] Inline edit works for type, impact, status fields
- [ ] Signal type badges use correct colors
- [ ] Impact level badges use correct colors
- [ ] Old SignalsPage.tsx deleted

## Empty State

When `data.length === 0`:
```
┌─────────────────────────────────────────┐
│                                         │
│         ⚡ (large icon)                 │
│                                         │
│    No signals yet                       │
│                                         │
│    Signals are auto-classified from     │
│    market intelligence by the LENS      │
│    agent.                               │
│                                         │
│    [Run LENS Classification]            │
│    [Import Signals (CSV)]               │
│                                         │
└─────────────────────────────────────────┘
```

"Run LENS Classification" → triggers LENS agent via Feishu messaging API (see A-04)
"Import Signals (CSV)" → opens CSV import modal

## Implementation

```typescript
// src/app/(dashboard)/signals/page.tsx
'use client';
import { UniversalDataGrid } from '@/components/data-grid/UniversalDataGrid';
import { signalsConfig } from '@/configs/signals.config';

export default function SignalsPage() {
  return <UniversalDataGrid config={signalsConfig} />;
}
```

Delete: `src/components/signals/SignalsPage.tsx` (619 lines).
