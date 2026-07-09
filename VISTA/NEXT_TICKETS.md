# VISTA Frontend — Remaining Implementation Tickets

**Status:** P0 complete. P1-P3 remaining.
**Date:** 2026-07-09
**Priority:** P1 first, then P2, then P3

---

## ⚠️ CRITICAL: Force Push Damage

Your force push to main **wiped out** documentation and Wave changes that were on main. The following were deleted:
- `VISTA/` directory (P0 prompt, 13 implementation specs, tickets)
- Header tooltips (Wave 2)
- Dashboard tooltips (Wave 5)
- InfoPanel banners (Wave 5)
- Strategy page enhancements (Wave 5)

**Action required:** Do NOT force push main again. Push to your branch, then create a PR.

---

## P1 — HIGH VISIBILITY (Complete these first)

### Ticket P1-1: Tooltips on ALL interactive elements

**Current state:** Only `Sidebar.tsx` has tooltips. 0 tooltips on Header, Dashboard, Pipeline, Signals, Campaigns, Clusters, Programs, Conversions, Automation, Strategy, Settings, Activities, ContactDetail.

**Required:** Wrap every icon, button, and action with the `<Tooltip>` component. Specific targets:

| File | What needs tooltips |
|------|-------------------|
| `components/layout/Header.tsx` | All icon buttons (search, notifications, quick actions, user menu) |
| `app/dashboard/Dashboard.tsx` | KPI cards (explain what each metric means), action buttons |
| `app/pipeline/PipelinePage.tsx` | Stage headers, action buttons, card actions |
| `app/signals/SignalsPage.tsx` | Signal type icons, action buttons, filter controls |
| `app/campaigns/CampaignsPage.tsx` | Campaign status icons, action buttons |
| `app/clusters/ClustersPage.tsx` | Cluster score indicators, action buttons |
| `app/contacts/[id]/ContactDetail.tsx` | Score breakdown items, action buttons, timeline icons |
| `app/signals/[id]/SignalDetail.tsx` | Signal metadata, action buttons |
| `app/programs/ProgramsPage.tsx` | Program type icons, status indicators |
| `app/conversions/ConversionsPage.tsx` | Conversion metric icons |
| `app/automation/AutomationDashboard.tsx` | Rule status icons, trigger indicators |
| `app/strategy/StrategyPage.tsx` | Strategy metric cards, action buttons |
| `app/settings/page.tsx` | Setting descriptions, toggle labels |
| `app/activities/ActivitiesPage.tsx` | Activity type icons |

**Pattern to follow:** Already implemented in `components/layout/Sidebar.tsx`:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent side="right">Settings</TooltipContent>
</Tooltip>
```

**Note:** `TooltipProvider` is already at root level in `app/client-layout.tsx`. No need to wrap again.

**Acceptance criteria:** Every icon and action button across the app shows a descriptive tooltip on hover.

---

### Ticket P1-2: ConfirmDialog on all destructive actions

**Current state:** No `ConfirmDialog` component found in codebase. Destructive actions likely use browser `confirm()`.

**Required:** Create a reusable `ConfirmDialog` component and use it for:
- Delete contact
- Delete signal
- Bulk delete contacts
- Any destructive action

**File:** `components/ui/confirm-dialog.tsx`

**Acceptance criteria:** All delete/destructive actions show a styled modal confirmation (not browser alert).

---

### Ticket P1-3: Multi-select on Signals, Campaigns, and Clusters tables

**Current state:** Only `ContactsTable.tsx` has row selection + bulk delete.

**Required:** Add the same multi-select pattern to:
- `app/signals/SignalsPage.tsx` — select multiple signals, bulk archive/dismiss
- `app/campaigns/CampaignsPage.tsx` — select multiple campaigns, bulk activate/pause
- `app/clusters/ClustersPage.tsx` — select multiple clusters, bulk assign program

**Pattern:** Copy the row selection + bulk action toolbar pattern from `ContactsTable.tsx`.

**Acceptance criteria:** Checkbox column on each table, bulk action toolbar appears when items selected.

---

## P2 — MEDIUM VISIBILITY

### Ticket P2-1: Saved filter presets with URL sync

**Required:** On Contacts, Signals, Campaigns, and Clusters pages:
1. Add "Save current filter" button
2. Save filter presets to `localStorage` (key: `vista_filters_{page}`)
3. Sync active filter to URL query params (e.g., `?stage=Engaged&score_min=70`)
4. Show saved presets as clickable chips above the table
5. On page load, restore filters from URL params first, then localStorage

**Acceptance criteria:** User can save/load filters, and share filtered views via URL.

---

### Ticket P2-2: KPI trend sparklines on Dashboard

**Required:** On each KPI card in `app/dashboard/Dashboard.tsx`:
1. Show a small sparkline chart (last 7 days trend)
2. Below the number, show delta: "+12% vs last week"
3. On hover, show a popover explaining WHY: "Active contacts up 12% because 45 new signals detected this week"

**Pattern:** Use a simple SVG sparkline (no external chart library needed). Data from existing `/api/dashboard/kpis` endpoint.

**Acceptance criteria:** Each KPI card shows trend direction and explanatory context.

---

### Ticket P2-3: Contact hover preview cards

**Required:** In all tables (Contacts, Signals, Campaigns), hovering over a contact name shows a preview card:
- Photo/avatar
- Name, title, company
- VISTA score breakdown (mini bar chart)
- Last activity
- Quick actions: View Profile, Log Activity, Send Email

**File:** Create `components/contacts/ContactHoverCard.tsx`

**Acceptance criteria:** Hovering a contact name for 500ms shows a rich preview card.

---

## P3 — POLISH

### Ticket P3-1: Pipeline drag-and-drop

**Required:** In `app/pipeline/PipelinePage.tsx`:
1. Make contact cards draggable between stage columns
2. On drop, update the contact's pipeline stage via API
3. Show visual feedback (card opacity 0.5 while dragging, column highlight on hover)

**Acceptance criteria:** User can drag contacts between pipeline stages. Stage update persists.

---

### Ticket P3-2: Score visualizations with explanations

**Required:** Wherever a VISTA score appears:
1. Show a mini bar chart (5 segments for V/I/S/T/A)
2. Color-code: green (70+), amber (40-69), red (<40)
3. On hover, show explanation: "Score: 78 — Top 5% — Driven by recent LinkedIn activity (+15 pts) and company funding signal"

**Files:** `ContactDetail.tsx`, `ContactsTable.tsx`, `Dashboard.tsx`

**Acceptance criteria:** Every score shows visual breakdown + explanation on hover.

---

## Execution Order

1. **P1-1** (Tooltips everywhere) — ~2 hours. Highest visibility.
2. **P1-2** (ConfirmDialog) — ~30 min. Quick win.
3. **P1-3** (Multi-select) — ~1.5 hours. Copy pattern from ContactsTable.
4. **P2-1** (Saved filters) — ~2 hours.
5. **P2-2** (KPI sparklines) — ~1.5 hours.
6. **P2-3** (Hover cards) — ~2 hours.
7. **P3-1** (Pipeline drag-drop) — ~3 hours.
8. **P3-2** (Score viz) — ~2 hours.

**Total: ~15 hours of focused work.**

---

## Rules

1. **Do NOT force push main.** Push to your branch, then create a PR.
2. **Commit after each ticket.** Don't batch all 8 tickets into one commit.
3. **Test on Vercel preview** before merging to main.
