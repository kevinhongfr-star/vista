# VISTA GO-LIVE MASTER BRIEF — All Phases

**Created:** 2026-07-17 by James/AI
**Status:** VISTA deployed & accessible. Phases 1-4 required for full go-live.
**Repo:** https://github.com/kevinhongfr-star/vista
**Production:** https://vista-azure-delta-theta.vercel.app

---

## ⚠️ CRITICAL: Wave 1.7 Code Status

The `trae/wave1.5-frontend` branch has been **deleted** from GitHub. Wave 1.7 code (BC-01 to BC-10: B2C scoring engine, ingestion API, webhook handler, alerts, pipeline kanban, lead profile, promotion engine, analytics, revenue attribution, DEX integration) is **NOT on any branch**.

**ACTION REQUIRED:** Trae must re-push Wave 1.7 code before it can be merged. The Vercel preview deployment (`dpl_Bb7hEp15vodCd3ndBqZBVaXE7kCq`) still exists but the source is orphaned.

---

## PHASE 1 — Stabilize (IMMEDIATE)

### FIX-19: Contact Notes Formatting ✅ TICKET EXISTS
**File:** `VISTA/TRAETASK_FIX19_NOTES_FORMATTING.md`
- Add `whitespace-pre-wrap` to note descriptions
- Show `author` field
- Color-code left border by `note_type`
- Effort: 10 min

### FIX-20: Missing Navigation Items
**File:** `components/layout/Sidebar.tsx`
- Add `/revenue` to nav (icon: `TrendingUp` or `DollarSign`)
- Add `/templates` to nav (icon: `FileText` or `LayoutTemplate`)
- Place Revenue after Conversions, Templates after Automation
- Effort: 5 min

### FIX-21: Empty States (ALL PAGES)
**Priority:** 🔴 HIGH — Currently ZERO pages show empty states

Pages that need empty states (where table/list could be empty):
| Page | Current State | Empty State Needed |
|------|--------------|-------------------|
| contacts | No empty state | "No contacts found. Import contacts or create your first one." + CTA |
| activities | No empty state | "No activities recorded." + "Log Activity" button |
| automation | No empty state | "No automations configured." + "Create Automation" button |
| revenue | No empty state | "No revenue data yet." |
| dashboard | Has basic empty | Verify all widgets have fallbacks |

**Pattern to follow:** Signals page already has a good empty state pattern:
```tsx
<div className="text-center py-8 text-muted-foreground">
  <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
  <p>No data found.</p>
  <Button onClick={...} variant="outline" size="sm" className="mt-4">
    Action CTA
  </Button>
</div>
```

Apply this pattern to ALL pages. Every table/list must have a meaningful empty state with an icon, message, and CTA where applicable.

- Effort: 30-45 min

### FIX-22: CSV Export (Core Tables)
**Priority:** 🔴 HIGH — Only settings page has export

Add CSV export to:
1. **Contacts** (`components/contacts/ContactsTable.tsx`) — Export button in toolbar
2. **Pipeline** (`app/pipeline/PipelinePage.tsx`) — Export deals as CSV
3. **Signals** (`app/signals/SignalsPage.tsx`) — Export signals
4. **Activities** (`app/activities/ActivitiesPage.tsx`) — Export activity log

**Implementation:**
```tsx
// Add to page toolbar
<Button variant="outline" size="sm" onClick={handleExport}>
  <Download className="h-4 w-4 mr-2" /> Export CSV
</Button>

// Export function
const handleExport = () => {
  const csv = data.map(row => ({
    Name: row.full_name,
    Company: row.company,
    Score: row.priority_score,
    Stage: row.pipeline_stage,
    // ... relevant columns
  }));
  const blob = new Blob([parseCSV(csv)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vista-${pageName}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
```

- Effort: 30 min

---

## PHASE 1.5 — Wave 1.7 Recovery + Merge

### FIX-23: Re-push Wave 1.7 Code
**Trae must:**
1. Re-create the Wave 1.7 code locally (BC-01 to BC-10)
2. Push to `trae/wave1.7-b2c-intelligence` (new branch name)
3. I will review the diff before merging (the previous 43k deletion count needs investigation)
4. After approval, I merge to `main` and deploy

**Wave 1.7 tickets (re-implement):**
- BC-01: B2C Lead Ingestion API (`/api/b2c/ingest`)
- BC-02: B2C Event Webhook Handler (`/api/b2c/webhook`)
- BC-03: B2B Potential Scoring Engine (`lib/b2c/scoring.ts`)
- BC-04: B2C Lead Flagging & Alerts (`/api/b2c/alerts`)
- BC-05: B2C Lead Pipeline Kanban (`/b2c-pipeline`)
- BC-06: B2C Lead Profile & Context Panel (`/b2c-pipeline/[id]`)
- BC-07: B2C → B2B Promotion Engine (`/api/b2c/leads/[id]/promote`)
- BC-08: B2C → B2B Conversion Analytics (`/b2c-analytics`)
- BC-09: B2C Revenue Attribution (`/api/b2c/analytics/revenue`)
- BC-10: DEX AI Integration Configuration (`/settings/b2c-integration`)

Spec: `spec_wave1.7_b2c_portal.md` (already in repo)

---

## PHASE 2 — Agent Integration (James/AI leads)

### AGENT-01: LENS Scoring Automation
**Architecture:**
- LENS agent (Feishu group `oc_a61e78ff28a98b1cba03b6c48b1fc02f`) scores contacts
- LENS reads from `vista_contacts` + `vista_signals`
- LENS writes `priority_score`, `vista_composite`, `pain_cluster_match`, `persona_fit` back to `vista_contacts`
- VISTA UI already displays these fields — no frontend changes needed
- **James creates:** Scoring trigger spec, Supabase RLS policy for agent writes, cron schedule

### AGENT-02: PROBE Signal Ingestion
**Architecture:**
- PROBE agent (`oc_1ff6972d43573e6a9ba3da2cbe71af4a`) detects signals
- PROBE writes to `vista_signals` table
- VISTA Signals page already displays signals — no frontend changes needed
- **James creates:** Signal detection criteria, source integrations spec, dedup logic

### AGENT-03: MARIA Campaign Execution
**Architecture:**
- MARIA agent (`oc_c7f53702baeaa6fae1df9e414b29abc6`) manages campaigns
- MARIA writes to `campaign_activities` + `outreach_assignments`
- VISTA Campaigns page already displays campaigns
- **James creates:** Campaign template spec, outreach sequence logic, approval workflow

### AGENT-04: CARL Strategic Insights
**Architecture:**
- CARL agent (`oc_ba0972a363702b1829a52461558bf34b`) generates strategy
- CARL writes to `strategic_notes` table
- VISTA Strategy page already displays notes
- **James creates:** Insight generation prompt, frequency spec, priority ranking logic

### AGENT-05: Feishu → Supabase → VISTA Pipeline
- All 4 agents write to Supabase via service role key
- VISTA auto-refreshes when Supabase data changes (existing Realtime or manual refresh)
- **James creates:** RLS policies, agent training specs, monitoring dashboard

**Note:** Phase 2 is NOT Trae work. James/AI handles agent architecture. Trae may need minor UI adjustments once agents are writing data (e.g., new fields, status indicators).

---

## PHASE 3 — Data Pipeline

### DATA-01: B2C Lead Ingestion
- Part of Wave 1.7 (BC-01, BC-02) — Trae re-implements
- DEX AI portal sends lead data → VISTA API → Supabase
- James creates the integration spec

### DATA-02: Contact Enrichment Automation
- Auto-enrich contacts with: company size, industry, LinkedIn data
- Sources: Apollo API, LinkedIn scraping, or manual batch import
- **James creates:** Enrichment pipeline spec, API integration plan

### DATA-03: ICP Pain Point Matching
- Map contacts to pain clusters based on signals + profile data
- Uses the 9 pain clusters from Notion extraction
- **James creates:** Matching algorithm spec, cluster definitions

### DATA-04: Historical Data Backfill
- Import existing LYC client data into VISTA
- Map legacy CRM data to VISTA schema
- **James creates:** Import script, data mapping doc

---

## PHASE 4 — UI/UX Polish

### UX-01: Command Palette (Cmd+K)
**Priority:** 🟡 Medium
- Global keyboard shortcut to search/jump to any page
- Search across: contacts, signals, pages, actions
- Implementation: Use `cmdk` library or build lightweight version
- Files: New component `components/ui/CommandPalette.tsx`, add to `layout.tsx`
- Effort: 1-2 hours

### UX-02: Bulk Actions Expansion
**Priority:** 🟡 Medium
Currently only 5/19 pages have bulk select. Add to:
- **Contacts** (`ContactsTable.tsx` already has tanstack row selection — wire it up)
- **Pipeline** — bulk stage change, bulk assign
- **Activities** — bulk status update

Bulk actions to support:
- Add to campaign
- Change pipeline stage
- Assign owner
- Export selected
- Delete (with confirmation)

- Effort: 1-2 hours

### UX-03: Breadcrumbs for Detail Pages
**Priority:** 🟢 Low
Add breadcrumbs to:
- `/contacts/[id]` → Contacts / John Doe
- `/signals/[id]` → Signals / Company Name
- `/clusters/[id]` → Clusters / Cluster Name

Use simple pattern:
```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
  <Link href="/contacts">Contacts</Link>
  <span>/</span>
  <span className="text-foreground">{contact.full_name}</span>
</div>
```

- Effort: 20 min

### UX-04: Keyboard Shortcuts
**Priority:** 🟢 Low
Global shortcuts:
- `Cmd+K` → Command palette
- `N` → New contact (on contacts page)
- `L` → Log activity (on contact detail)
- `E` → Export CSV (on any table page)
- `?` → Show shortcuts help

Implementation: `useEffect` with keydown listener in `layout.tsx`
- Effort: 30 min

### UX-05: Print Styles
**Priority:** 🟢 Low
Add `@media print` CSS to `globals.css`:
- Hide sidebar, header
- Format contact detail for A4
- Clean table printing (no hover states, proper borders)
- Effort: 30 min

### UX-06: Loading State Audit
**Priority:** 🟡 Medium
19 files reference loading but need verification:
- Are skeletons actually shown during data fetch?
- Or is loading state just defined but not triggered?
- Add proper `<Skeleton>` components to all data-fetching pages
- Effort: 1 hour

### UX-07: Toast Notifications Consistency
**Priority:** 🟢 Low
- Verify all CRUD operations show success/error toasts
- Add toast for: stage changes, score updates, campaign actions
- Currently uses custom toast system (`components/ui/toast.tsx`)
- Effort: 30 min

### UX-08: Mobile Responsive Audit
**Priority:** 🟢 Low (desktop-first product, but should be usable on tablet)
- 30 files have responsive classes — need visual audit
- Key areas: sidebar collapse, table horizontal scroll, detail panel layout
- Effort: 2 hours

---

## EXECUTION ORDER

**Week 1 (IMMEDIATE):**
1. Trae: FIX-19 (notes) → FIX-20 (nav) → FIX-21 (empty states) → FIX-22 (export)
2. James: Agent integration architecture docs (Phase 2)
3. Trae: Re-push Wave 1.7 (FIX-23)
4. James: Review Wave 1.7 diff → merge → deploy

**Week 2:**
5. James: Set up LENS scoring automation (AGENT-01)
6. James: Set up PROBE signal ingestion (AGENT-02)
7. Trae: UX-01 (command palette) → UX-02 (bulk actions) → UX-06 (loading audit)

**Week 3:**
8. James: MARIA campaign engine (AGENT-03)
9. James: CARL strategic insights (AGENT-04)
10. Trae: UX-03 (breadcrumbs) → UX-04 (shortcuts) → UX-05 (print) → UX-07 (toasts)

**Week 4:**
11. James: Data pipeline (Phase 3)
12. Trae: UX-08 (mobile audit)
13. Final smoke test → GO-LIVE

---

## NOTES FOR TRAE

- Push all fixes to `trae/wave1.5-frontend` (or a new branch if needed)
- One commit per fix (or logical group)
- I (James) will review, merge to `main`, and deploy to Vercel
- DO NOT delete branches after pushing — I need them for review
- Test your changes locally before pushing

## NOTES FOR JAMES/AI

- Phase 2 (Agent Integration) is YOUR ownership, not Trae's
- Create agent training specs in `VISTA/AGENT_TRAINING_SPECS.md`
- Set up Supabase RLS policies for agent writes
- Monitor agent output quality before automating at scale
