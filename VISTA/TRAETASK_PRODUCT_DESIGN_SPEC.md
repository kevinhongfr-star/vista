# VISTA — Product Design Improvement Spec

**Date:** 2026-07-17
**Context:** Post-audit product design analysis. FIX-19 to FIX-43 fix functional bugs. THIS spec fixes design problems — things that work but don't serve the user's workflow.
**Core thesis:** VISTA is currently a data viewer, not a workflow tool. These changes transform it into a daily action driver.

---

## 🎯 PRIORITY 1: Transform Dashboard into Action Center

### PD-01: "Since Last Login" Changelog
**What:** Dashboard shows what changed since the user last visited.
**Design:**
```
┌─────────────────────────────────────────────┐
│ Since you were last here (2h ago):           │
│                                              │
│ 📡 3 new signals detected                   │
│ 👥 12 contacts were scored/updated          │
│ 📧 1 campaign completed (68% response rate) │
│ 🔄 5 contacts moved pipeline stages         │
│ ⚠️  2 contacts need follow-up (overdue)     │
└─────────────────────────────────────────────┘
```
**Implementation:**
- API: `/api/dashboard/changelog` — query all tables where `created_at > last_login`
- Store `last_login_at` in `vista_user_sessions` table (create if needed)
- Update `last_login_at` on each dashboard load
- Return grouped counts by entity type
- Frontend: render as collapsible section below KPI cards
**Files:** 
- `app/api/dashboard/changelog/route.ts` (new)
- `app/dashboard/Dashboard.tsx` (add section)
- SQL: create `vista_user_sessions` table if needed
**Effort:** 4 hours

### PD-02: Priority Actions — Urgency Grouping
**What:** Split flat priority actions list into urgency tiers.
**Design:**
```
🔴 ACT TODAY (3)
  └ Call John Doe — Score 85, no contact in 45 days
  └ Follow up with Jane Smith — Meeting was 3 days ago
  └ New signal: CEO change at McKinsey — affects 2 pipeline contacts

🟡 THIS WEEK (7)
  └ Send proposal to Acme Corp — stage: Proposal Sent
  └ Nurture: 15 low-score contacts need quarterly touchpoint
  
🟢 WHEN FREE (12)
  └ 12 new contacts added this week — review and score
```
**Implementation:**
- API: `/api/dashboard/priority-actions` already returns actions — add `urgency` field
- Urgency logic:
  - `today`: overdue follow-ups (>14 days), hot signals on pipeline contacts, score drops >20 points
  - `week`: scheduled follow-ups, proposal follow-ups, warm signals
  - `free`: new contacts to review, nurture track, exploratory
- Frontend: group by urgency, collapsible sections
**Files:** 
- `app/api/dashboard/priority-actions/route.ts` (add urgency field)
- `app/dashboard/Dashboard.tsx` (group rendering)
**Effort:** 3 hours

### PD-03: KPI Cards — Contextual Links + Week-over-Week
**What:** KPI cards link to filtered views and show real deltas.
**Design:**
- "17,359 contacts" → links to `/contacts?added_this_week=true`
- "2,829 signals" → links to `/signals?since=7d`
- "42 active deals" → links to `/pipeline?stage=active`
- Each card shows: current value | delta vs last week | mini sparkline (last 8 weeks)
**Implementation:**
- API: add `previous_week` to kpis response + `delta = current - previous`
- Add `sparkline_data` array (8 data points)
- Frontend: make cards clickable with router.push(filtered URL), add delta arrow + color
**Files:**
- `app/api/dashboard/kpis/route.ts` (add previous week query)
- `app/dashboard/Dashboard.tsx` (links, delta display, sparkline)
**Effort:** 4 hours

### PD-04: Personalized Greeting
**What:** Use the existing `getGreeting()` function (currently dead code).
**Design:** "Good afternoon, Kevin" as the page title instead of generic "Dashboard"
**Implementation:** Wire `getGreeting()` into the render. Get user name from session.
**Files:** `app/dashboard/Dashboard.tsx`
**Effort:** 30 min

---

## 🎯 PRIORITY 2: Transform Contacts into Relationship Intelligence

### PD-05: Visual Score Indicators in Table
**What:** Score column shows color-coded tier badge instead of raw number.
**Design:**
- Score 0-20: Grey dot
- Score 21-40: Blue dot  
- Score 41-60: Yellow dot
- Score 61-80: Orange dot
- Score 81-100: Green dot
- Hover shows exact number + tier label
**Implementation:** Use existing `TierBadge` component in the Score column cell renderer.
**Files:** `components/contacts/ContactsTable.tsx` (score column cell)
**Effort:** 30 min

### PD-06: "Last Contacted" Column
**What:** Add column showing days since last contact with color coding.
**Design:**
- Column: "Last Contact" 
- Shows: "3 days ago" / "2 weeks ago" / "Never"
- Color: Green (<7 days), Yellow (7-30 days), Red (>30 days), Grey (never)
- Default sort: oldest first (most urgent)
**Implementation:** 
- Add column def in ContactsTable.tsx using `last_contact_date` or `last_engagement_date`
- Relative time formatting
- Color logic as above
**Files:** `components/contacts/ContactsTable.tsx` (new column)
**Effort:** 1 hour

### PD-07: Company Grouping Toggle
**What:** Toggle button "Group by Company" that reorganizes the table.
**Design:**
- Toggle in table toolbar
- When active: rows grouped by company, company header shows # contacts + avg score
- Each group expandable/collapsible
- Sort groups by: total contacts, avg score, or pipeline value
**Implementation:**
- Add `groupBy` state to ContactsTable
- When groupBy=company: reorganize data, render group headers
- Group header: company name, industry, contact count, avg score
**Files:** `components/contacts/ContactsTable.tsx`
**Effort:** 3 hours

### PD-08: Contact Preview Panel — Enriched
**What:** Side drawer shows more useful info when clicking a contact name.
**Design:** Current preview shows basic fields. Add:
- Score breakdown (4 factors with mini bars)
- Next Best Action (big banner)
- Last 3 activities (timeline snippet)
- Recent signals (last 3)
- Quick actions: Email, Log Call, Change Stage
**Implementation:**
- `ContactPreviewPanel.tsx` — fetch additional data (activities, signals, NBA)
- Render score breakdown using existing `ScoreGauge` component
- Quick action buttons fire existing APIs
**Files:** `components/ui/ContactPreviewPanel.tsx` (major update)
**Effort:** 4 hours

### PD-09: Contact Tags/Labels System
**What:** Custom tags for contacts (VIP, Board Member, Needs Intro, etc.)
**Design:**
- Tag chips on contact row (visible in table)
- Tag filter in toolbar (multi-select)
- Tag management in Settings
- Bulk tag assignment from selection
**Implementation:**
- New table: `vista_contact_tags` (id, name, color, created_by)
- New table: `vista_contact_tag_assignments` (contact_id, tag_id)
- API: CRUD for tags, assign/unassign
- UI: Tag picker on contact, filter dropdown in table
**Files:**
- SQL migration (new tables)
- `app/api/tags/route.ts` (new)
- `components/contacts/TagPicker.tsx` (new)
- `ContactsTable.tsx` (add tag column + filter)
**Effort:** 6 hours

---

## 🎯 PRIORITY 3: Transform Contact Detail into Action Hub

### PD-10: Next Best Action — Hero Banner
**What:** Move Next Best Action from a small card to the top-of-page hero.
**Design:**
```
┌─────────────────────────────────────────────────────┐
│ 📞 CALL JOHN DOE                                    │
│ Score 85 | No contact in 45 days | High-value       │
│ "Schedule Discovery Call — Recent signal activity   │
│  indicates strong timing"                           │
│                                                     │
│ [Log Call]  [Send Email]  [Dismiss]                 │
└─────────────────────────────────────────────────────┘
```
**Implementation:**
- Extract `getNextBestAction()` logic into reusable component
- Render as top banner above tabs
- Color-code by action type (call=green, email=blue, campaign=purple)
- Action buttons log the activity + advance stage if applicable
**Files:**
- `components/intelligence/NextBestActionBanner.tsx` (new)
- `app/contacts/[id]/ContactDetail.tsx` (add banner at top)
**Effort:** 3 hours

### PD-11: Unified Relationship Timeline
**What:** Single chronological view of ALL interactions.
**Design:**
```
Timeline:
────────────────────────────────────────
Mar 15  📧 Email sent — "Follow up on proposal"
Mar 12  📡 Signal detected — "Company announces expansion"
Mar 10  📞 Call logged — 30 min, discussed Q2 budget
Feb 28  🔄 Stage changed — Engaged → Proposal Sent
Feb 20  📝 Note added — "Very interested in AI transformation"
Feb 15  📅 Meeting — Coffee at The Ritz
Feb 1   📧 Email sent — Initial outreach
Jan 20  👤 Contact added to VISTA
────────────────────────────────────────
```
**Implementation:**
- New API: `/api/contacts/[id]/timeline` — UNION activities + signals + notes + pipeline_history + campaign_activities, ORDER BY date DESC
- Each entry has: type icon, title, description, metadata
- Render as vertical timeline component
- Replace or augment the "Engagement" tab
**Files:**
- `app/api/contacts/[id]/timeline/route.ts` (new)
- `components/contacts/RelationshipTimeline.tsx` (new)
- `app/contacts/[id]/ContactDetail.tsx` (add as tab or replace Engagement)
**Effort:** 6 hours

### PD-12: "Prep for Meeting" One-Click Brief
**What:** Generate a 1-page meeting prep document.
**Design:** 
- Button: "📋 Prep for Meeting"
- Opens modal with:
  - Contact summary (name, role, company, score, tier)
  - Company context (industry, size, location, recent signals)
  - Last 5 interactions (timeline)
  - Open deals / pipeline status
  - Key signals (last 3)
  - Suggested talking points (from Next Best Action)
- Export as PDF or copy to clipboard
**Implementation:**
- Fetch all contact data + recent activities + signals + company info
- Format into structured brief
- Use browser print-to-PDF or a library like `@react-pdf/renderer`
**Files:**
- `components/contacts/MeetingPrepModal.tsx` (new)
- `app/api/contacts/[id]/meeting-prep/route.ts` (new)
**Effort:** 4 hours

---

## 🎯 PRIORITY 4: Signals — From Data to Action

### PD-13: Signal Impact Assessment
**What:** Each signal shows how many pipeline contacts it affects.
**Design:**
- Signal row shows: "📡 CEO change at McKinsey — affects 3 pipeline contacts"
- Click → shows affected contacts
- CTA: "Notify these contacts" or "Log as campaign trigger"
**Implementation:**
- API: join signals with contacts via company/industry matching
- Count affected contacts per signal
- Frontend: show count badge, expandable list
**Files:**
- `app/api/signals/route.ts` (add affected_contacts count)
- `app/signals/SignalsPage.tsx` (display + expand)
**Effort:** 4 hours

### PD-14: Signal Type Breakdown
**What:** Visual breakdown of signal types on the signals page.
**Design:**
- Top of page: horizontal bar chart showing signal type distribution
- Click a segment → filter table to that type
- Weekly trend: "This week: 40% leadership changes, 30% M&A, 20% market shifts"
**Implementation:**
- API: aggregate by signal_type for current period
- Frontend: simple bar chart (can use CSS, no chart library needed for horizontal bars)
**Files:**
- `app/api/signals/route.ts` (add type aggregation)
- `app/signals/SignalsPage.tsx` (chart + filter)
**Effort:** 2 hours

### PD-15: Signal Digest Email (Weekly)
**What:** Automated weekly email summarizing relevant signals.
**Design:**
- Every Monday 8am: "5 signals relevant to your pipeline this week"
- Each signal: type, description, affected contacts
- CTA: "View in VISTA"
**Implementation:**
- Scheduled job (cron via Vercel or external) or agent trigger
- Query signals from past 7 days + match to contacts
- Format email via Graph API or Resend
- Config: enable/disable + day/time in Settings
**Files:**
- `app/api/automation/signal-digest/route.ts` (new)
- Integration with FIX-21 email provider
- Settings toggle
**Effort:** 4 hours

---

## 🎯 PRIORITY 5: Pipeline — From People Tracker to Deal Tracker

### PD-16: Rich Kanban Cards
**What:** Kanban cards show decision-enabling info.
**Design:**
```
┌──────────────────────┐
│ John Doe             │
│ McKinsey & Company   │
│ Score: 85 ●          │
│ Last contact: 3d ago │
│ Days in stage: 12    │
│ Next: Call           │
└──────────────────────┘
```
**Implementation:**
- Update kanban card component with: company, days_in_stage, last_contact_date, next_action
- Color code by recency (green <7d, yellow 7-30d, red >30d)
- Show next action icon (phone for call, mail for email)
**Files:** Pipeline kanban card component
**Effort:** 2 hours

### PD-17: Pipeline Conversion Rates — Real Calculation
**What:** Fix conversion rate calculation to use actual transitions.
**Design:**
- Currently: `stage_counts[next] / stage_counts[current]` (stock ratio, wrong)
- Should be: `transitions from A→B in period / total in stage A at start of period`
- Requires `pipeline_history` data (FIX-33 creates the logging)
- Until data exists, show "Insufficient data" instead of misleading numbers
**Implementation:**
- Query `pipeline_history` for transitions in date range
- Calculate: for each stage, how many entered and how many exited to next stage
- Display as conversion % with trend (improving/declining)
**Files:**
- `app/api/pipeline/intelligence/route.ts` (fix calculation)
- Pipeline page display
**Effort:** 3 hours

### PD-18: Stuck Contacts — Prominent Alert
**What:** Surface stuck contacts as a dashboard alert, not buried in pipeline page.
**Design:**
- Dashboard alert banner: "⚠️ 5 contacts haven't moved in 30+ days"
- Click → pipeline page filtered to stuck contacts only
- Each stuck contact shows: name, current stage, days stuck, score
**Implementation:**
- Already fetched by `/api/pipeline/intelligence` 
- Add to dashboard API or as separate fetch
- Render as dismissible alert banner
**Files:**
- `app/dashboard/Dashboard.tsx` (add alert section)
**Effort:** 1 hour

---

## 🎯 PRIORITY 6: Clusters — From Abstract Numbers to Actionable Segments

### PD-19: Human-Readable Cluster Names
**What:** Cluster names should describe the segment, not be numbered.
**Design:**
- Current: "Density Cluster #23"
- Should be: "PE Partners — Shanghai (Succession Focus)" or auto-generated from dominant traits
- Auto-name: use top pain_cluster, dominant persona, geographic concentration
**Implementation:**
- If clusters have metadata fields: use them
- If not: generate name from contact attributes (most common function, industry, location)
- Store as `cluster_name` field, allow manual override
**Files:**
- `app/clusters/ClustersPage.tsx` (display name)
- SQL: add `cluster_name` to `density_clusters` if not exists
**Effort:** 3 hours

### PD-20: Cluster Comparison View
**What:** Side-by-side cluster comparison.
**Design:**
- Select 2-4 clusters → comparison table
- Metrics: # contacts, avg score, pipeline value, top pain cluster, avg seniority
- Highlight best/worst per metric
**Implementation:**
- Multi-select checkboxes on cluster list
- "Compare" button → modal or side-by-side view
- Fetch aggregate stats per cluster
**Files:**
- `app/clusters/ClustersPage.tsx` (selection + compare button)
- `app/api/clusters/compare/route.ts` (new)
- `components/clusters/ClusterComparison.tsx` (new)
**Effort:** 4 hours

---

## 🎯 PRIORITY 7: Design System Polish

### PD-21: Color Semantics
**What:** Consistent color meaning across all pages.
**Design:**
- Green = positive/good (high score, recent contact, deal won)
- Red = negative/urgent (overdue, score drop, deal at risk)
- Yellow = warning (stale, medium score, needs attention)
- Blue = informational (new signal, stage change)
- Grey = inactive/neutral
- Document in design system: `lib/design-tokens.ts`
**Implementation:** Audit all pages for color usage. Fix inconsistencies.
**Effort:** 3 hours

### PD-22: Empty States — Everywhere
**What:** (Overlaps FIX-23 but from design perspective)
**Design principle:** Every empty state should answer:
1. What is this page for?
2. Why is it empty?
3. What should I do next?
**Example:** Activities page:
```
┌─────────────────────────────────────┐
│          📋                          │
│     No activities logged yet         │
│                                      │
│  Activities track every interaction  │
│  with your contacts — calls, emails, │
│  meetings, and notes.                │
│                                      │
│  [Log Your First Activity]           │
│                                      │
│  Or: Activities are auto-logged when │
│  you use VISTA's email and campaign  │
│  features.                           │
└─────────────────────────────────────┘
```
**Effort:** 2 hours (included in FIX-23 but with better copy)

---

## 📋 Implementation Order

| Wave | Tickets | Est. Hours | Focus |
|------|---------|-----------|-------|
| **PD-W1** | PD-04, PD-05, PD-06, PD-02, PD-18 | 8h | Quick wins — visual improvements + urgency grouping |
| **PD-W2** | PD-01, PD-03, PD-08, PD-10 | 14h | Dashboard action center + contact preview |
| **PD-W3** | PD-07, PD-11, PD-13, PD-16 | 15h | Relationship timeline + signal actionability |
| **PD-W4** | PD-09, PD-12, PD-14, PD-15, PD-17, PD-19, PD-20, PD-21 | 29h | Full feature build |

**Total: ~66 hours of product design work**

---

## ⚠️ Dependencies on FIX Tickets

Several PD tickets depend on FIX tickets being completed first:

| PD Ticket | Depends On | Why |
|-----------|-----------|-----|
| PD-11 (Timeline) | FIX-33 (Pipeline history logging) | Timeline needs transition records |
| PD-17 (Real conversion rates) | FIX-33 (Pipeline history logging) | Needs actual transition data |
| PD-15 (Signal digest email) | FIX-21 (Real email sending) | Can't email without provider |
| PD-10 (NBA Banner) | FIX-20 (Auth) | Needs user context for personalization |
| PD-08 (Preview Panel) | FIX-21 (Real email) | Quick action "Send Email" needs to work |

**Recommendation:** Complete FIX Batch 1 (Critical) first, then start PD-W1 in parallel with FIX Batch 2.

---

## ✅ Success Metrics

After all PD tickets are implemented:
- [ ] User opens VISTA → sees what to DO (not just what IS)
- [ ] Dashboard answers "What changed?" and "What's urgent?"
- [ ] Contact list answers "Who hasn't I talked to recently?"
- [ ] Contact detail answers "What should I do with this person?"
- [ ] Signals answer "What does this mean for my pipeline?"
- [ ] Pipeline answers "Which deals are at risk?"
- [ ] Clusters answer "Which segment should I focus on?"

---

## 🎯 PRIORITY 8: Information Architecture Overhaul

### PD-23: Nav Restructure — From Data Model to Workflow
**What:** Reorganize 12-item flat nav into 5 workflow-based groups.
**Current nav:**
```
Dashboard → Contacts → Signals → Pipeline → Activities → Campaigns → 
Clusters → Programs → Conversions → Automation → Strategy → Settings
```
**Proposed nav:**
```
📌 Priorities    — Dashboard + action queue (what to do TODAY)
👥 People        — Contacts + Accounts (who they are)
💬 Engage        — Campaigns, Templates, Programs (action tools)
💰 Deals         — Pipeline + Revenue + Conversions (the money)
🧠 Intelligence  — Signals, Clusters, Strategy, Automation (the brain)
⚙️ Settings
```
**Design:**
- Group headers in sidebar with collapsible sections
- Each group has 2-3 items max
- Badges on groups showing urgency counts (e.g., "Priorities (3)" = 3 things to do today)
**Implementation:**
- Update `navItems` array in `Sidebar.tsx` to include `group` field
- Render grouped nav with dividers/headers
- Move "Activities" to be a tab within "People" (it's per-contact activity, not global)
- Move "Programs" under "Engage"
- Consolidate: "Conversions" as a tab in "Deals"
**Files:** `components/layout/Sidebar.tsx`
**Effort:** 3 hours
**Note:** This is a PRODUCT DECISION. Kevin needs to approve the grouping before implementation.

---

## 🎯 PRIORITY 9: Company/Account Entity

### PD-24: Company/Account Page
**What:** New `/companies` page — the company is the real entity in B2B.
**Design:**
```
/companies
┌─────────────────────────────────────────────────────────┐
│ Companies                          [+ Add Company]       │
│                                                         │
│ Search: [_______________]  Filter: Industry ▼ Size ▼    │
│                                                         │
│ Company              Contacts  Avg Score  Pipeline Value │
│ ─────────────────────────────────────────────────────── │
│ McKinsey & Co.       12        78        $2.3M          │
│ Deloitte              8        65        $1.1M          │
│ Boston Consulting     5        82        $800K          │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```
**Implementation:**
- API: `/api/companies` — aggregate `vista_contacts` GROUP BY company
- Return: company name, contact count, avg score, total pipeline value, industry, top contact
- New page component with sortable table
**Files:**
- `app/api/companies/route.ts` (new)
- `app/companies/page.tsx` (new)
- SQL: may need index on `company` column
**Effort:** 6 hours

### PD-25: Company Detail Page
**What:** `/companies/[id]` — all info about a company in one place.
**Design:**
```
/companies/mckinsey
┌─────────────────────────────────────────────────────────┐
│ McKinsey & Company                    Account Score: 78  │
│ Management Consulting | 12 contacts | $2.3M pipeline    │
├─────────────────────────────────────────────────────────┤
│ Tab: Contacts | Deals | Signals | Activity | Notes      │
├─────────────────────────────────────────────────────────┤
│ Contacts tab: 12 people at this company                 │
│ Deals tab: 3 active opportunities                       │
│ Signals tab: 5 signals about this company               │
│ Activity tab: timeline of all interactions              │
│ Notes tab: strategic notes about the account            │
└─────────────────────────────────────────────────────────┘
```
**Implementation:**
- API: `/api/companies/[id]` — fetch all contacts, signals, pipeline data for company
- Page: tabbed view similar to contact detail but at account level
- Account scoring: weighted avg of contact scores + deal count + signal recency
**Files:**
- `app/api/companies/[id]/route.ts` (new)
- `app/companies/[id]/page.tsx` (new)
- `components/companies/CompanyDetail.tsx` (new)
**Effort:** 10 hours

### PD-26: Account-Level Scoring
**What:** Score the COMPANY, not just individual contacts.
**Design:**
- Account score = weighted formula:
  - 40% avg contact scores
  - 30% pipeline value (deal size)
  - 20% signal recency (how "alive" is this account)
  - 10% engagement depth (# of contacts engaged)
- Display: TierBadge on company row (Cold/Warm/Engaged/Hot)
- Use in prioritization: "Top 5 accounts to focus on this quarter"
**Implementation:**
- New table: `vista_company_scores` (company_name, score, tier, last_calculated)
- API: `/api/companies/scores` — calculate on demand or via LENS agent
- Store calculated scores, refresh daily or on trigger
**Files:**
- SQL: new table
- `app/api/companies/scores/route.ts` (new)
- Company list + detail pages (display score)
**Effort:** 6 hours

---

## 🎯 PRIORITY 10: Mobile Responsiveness

### PD-27: Responsive Sidebar
**What:** Sidebar collapses to hamburger menu on mobile.
**Design:**
- Desktop (>1024px): full sidebar (w-64), collapsible to icons (w-16)
- Tablet (768-1024px): icons only (w-16), expand on hover
- Mobile (<768px): hidden by default, hamburger icon in header, overlay on toggle
**Implementation:**
- Add responsive classes: `hidden md:flex` for sidebar
- Add hamburger button in Header for mobile
- Overlay backdrop when sidebar open on mobile
- Auto-close sidebar on navigation (mobile)
**Files:**
- `components/layout/Sidebar.tsx` (responsive classes)
- `components/layout/Header.tsx` (hamburger button)
- `app/client-layout.tsx` (margin-left responsive)
**Effort:** 4 hours

### PD-28: Mobile-Optimized Page Layouts
**What:** Key pages work on small screens.
**Design priorities:**
- Contact list → card view on mobile (not table)
- Contact detail → swipeable tabs, full-width
- Pipeline → horizontal scroll kanban (cards stacked vertically per column)
- Dashboard → single-column KPIs, stacked cards
**Implementation:**
- ContactsTable: detect mobile, render card list instead of table
- Each page: audit for `overflow-x`, `min-width`, and table-specific layouts
- Replace fixed-width layouts with `flex-col` on mobile
**Files:** All page components (audit + fix)
**Effort:** 8 hours

---

## 🎯 PRIORITY 11: Onboarding & Discovery

### PD-29: First-Run Onboarding Flow
**What:** Welcome screen + setup checklist for new users.
**Design:**
```
┌─────────────────────────────────────────────┐
│ Welcome to VISTA                             │
│ Let's get you set up in 4 steps:             │
│                                              │
│ ✅ Step 1: Import contacts    [Done]         │
│ ⬜ Step 2: Configure scoring   [Set up →]    │
│ ⬜ Step 3: Create first campaign [Start →]   │
│ ⬜ Step 4: Connect your email  [Connect →]   │
│                                              │
│ You can also explore with sample data →      │
└─────────────────────────────────────────────┘
```
**Implementation:**
- Check `vista_user_sessions.onboarding_complete` flag
- If false: show onboarding modal over dashboard
- Each step links to relevant settings/action
- "Explore with sample data" → pre-filter view with high-score contacts
- Mark complete when all steps done or user dismisses
**Files:**
- `components/onboarding/OnboardingFlow.tsx` (new)
- `app/dashboard/Dashboard.tsx` (check + show)
- SQL: add `onboarding_complete` to user session
**Effort:** 6 hours

### PD-30: Global Search Enhancement
**What:** Command palette becomes full search + actions.
**Design:**
```
┌─────────────────────────────────────────────┐
│ Cmd+K                                        │
│ ┌─────────────────────────────────────────┐  │
│ │ 🔍 Search contacts, signals, companies… │  │
│ └─────────────────────────────────────────┘  │
│                                              │
│ RECENT                                       │
│ 👤 John Doe — McKinsey (viewed 2h ago)       │
│ 👤 Jane Smith — Deloitte (viewed yesterday)  │
│                                              │
│ QUICK ACTIONS                                │
│ ➕ Create contact          [Ctrl+N]          │
│ 📞 Log call               [Ctrl+L]          │
│ 📧 Send email             [Ctrl+E]          │
│ 📝 Add note               [Ctrl+.]          │
│                                              │
│ NAVIGATE                                     │
│ 📊 Dashboard              [G D]             │
│ 👥 Contacts               [G C]             │
│ ...                                          │
└─────────────────────────────────────────────┘
```
**Implementation:**
- Extend `CommandPalette.tsx` to include:
  - Search API: `/api/search?q=...` → contacts, companies, signals (fuzzy match)
  - Recent items: localStorage array of last 10 viewed items
  - Quick actions: link to existing modals (CreateContact, LogActivity, etc.)
- Add keyboard shortcuts for actions
**Files:**
- `app/api/search/route.ts` (new — global search endpoint)
- `components/CommandPalette.tsx` (major extension)
- `app/client-layout.tsx` (pass modal refs for quick actions)
**Effort:** 8 hours

---

## 🎯 PRIORITY 12: Reporting & Output

### PD-31: PDF Report Generator
**What:** Generate client/board-ready reports.
**Design:**
- Report types:
  - Pipeline Summary (all deals, stages, values, trends)
  - Account Brief (one company: contacts, deals, signals, history)
  - Weekly BD Activity (what happened this week, what's planned)
  - Contact Brief (one person: full profile + meeting prep)
- Output: PDF with LYC branding
- Trigger: button on relevant page + scheduled (weekly Monday 8am)
**Implementation:**
- Use `@react-pdf/renderer` or server-side `puppeteer`
- Report templates as React components
- API: `/api/reports/[type]` → returns PDF buffer
- Frontend: "Generate Report" button on each relevant page
**Files:**
- `lib/reports/pipeline-summary.tsx` (new)
- `lib/reports/account-brief.tsx` (new)
- `lib/reports/weekly-activity.tsx` (new)
- `app/api/reports/[type]/route.ts` (new)
- Install `@react-pdf/renderer`
**Effort:** 12 hours

### PD-32: Scheduled Reports (Email)
**What:** Auto-email reports on schedule.
**Design:**
- Settings → Reports → Configure schedule
- Options: Pipeline Summary (weekly), Account updates (monthly), Weekly digest
- Delivery: email via Graph API (FIX-21)
- Recipients: configurable list
**Implementation:**
- Cron job (Vercel cron or external scheduler)
- Generate report → send email with PDF attachment
- Settings UI for schedule configuration
**Files:**
- `app/api/automation/scheduled-reports/route.ts` (new)
- Settings page section
- Integration with FIX-21 email provider
**Effort:** 6 hours

---

## 🎯 PRIORITY 13: Collaboration

### PD-33: Contact Ownership
**What:** Assign an "owner" to each contact.
**Design:**
- Contact record gets `owner_id` (user UUID)
- Owner badge on contact row + detail page
- Filter by owner in contacts table
- Default: whoever created the contact
- Handoff: "Transfer ownership" button → reassign to another user
**Implementation:**
- SQL: add `owner_id` column to `vista_contacts`
- API: update CRUD to include owner
- UI: owner badge, filter, transfer button
**Files:**
- SQL migration
- `app/api/contacts/[id]/route.ts` (add owner fields)
- `ContactsTable.tsx` (owner column)
- `ContactDetail.tsx` (transfer button)
**Effort:** 4 hours

### PD-34: @Mentions in Notes
**What:** Mention team members in notes, they get notified.
**Design:**
- Notes textarea: type `@` → autocomplete user list
- Mentioned user gets: in-app toast + email notification
- Notes display: highlighted mention with link to user profile
**Implementation:**
- Rich text editor or textarea with `@` detection
- Parse mentions → store as `note_mentions` table
- Notification: trigger on note create (in-app + email)
**Files:**
- SQL: `note_mentions` table
- `components/ui/MentionTextarea.tsx` (new)
- Notification logic
**Effort:** 6 hours

### PD-35: Activity Feed
**What:** Global feed showing all recent changes across the system.
**Design:**
```
Activity Feed (last 24h):
─────────────────────────
2m ago  Kevin updated John Doe's score to 85
5m ago  Kevin logged call with Jane Smith (30 min)
12m ago LENS detected new signal: CEO change at McKinsey
1h ago  Kevin created campaign "Q3 Outreach — PE Partners"
2h ago  Maria sent 15 emails via campaign "Follow-up Wave"
3h ago  Kevin transferred Acme Corp ownership to Sarah
```
**Implementation:**
- `activity_feed` table: event_type, actor_id, entity_type, entity_id, description, created_at
- Auto-log on: score change, stage change, email sent, call logged, campaign created, ownership transfer
- Feed page: `/feed` or as a tab on Dashboard
- Realtime subscription for live updates
**Files:**
- SQL: `activity_feed` table
- API: `/api/feed/route.ts` (new)
- `app/feed/page.tsx` (new) or Dashboard section
- Triggers in existing API routes
**Effort:** 8 hours

---

## 📋 Updated Implementation Order

| Wave | Tickets | Est. Hours | Focus | Dependencies |
|------|---------|-----------|-------|-------------|
| **FIX-B1** | FIX-20 to FIX-26 | 7h | Critical bugs | None |
| **PD-W1** | PD-04, PD-05, PD-06, PD-02, PD-18 | 8h | Quick visual wins | None |
| **FIX-B2** | FIX-27 to FIX-34 | 9h | High-priority functionality | FIX-B1 |
| **PD-W2** | PD-01, PD-03, PD-08, PD-10, PD-27 | 18h | Dashboard + mobile | FIX-B1 |
| **PD-W3** | PD-07, PD-11, PD-13, PD-16, PD-23, PD-30 | 33h | IA restructure + search | PD-W2 |
| **FIX-B3** | FIX-35 to FIX-43 | 11h | Medium polish | FIX-B2 |
| **PD-W4** | PD-09, PD-12, PD-14, PD-15, PD-17, PD-19, PD-20 | 29h | Full features | PD-W3 |
| **PD-W5** | PD-24, PD-25, PD-26 | 22h | Company/Account entity | PD-W3 |
| **PD-W6** | PD-28, PD-31, PD-32, PD-33, PD-34, PD-35 | 44h | Mobile, reports, collaboration | PD-W5 |

**Grand Total: ~181 hours** (FIX: 27h + PD: 154h)

**Realistic timeline:**
- Week 1-2: FIX-B1 + PD-W1 (15h) — immediate wins
- Week 3-4: FIX-B2 + PD-W2 (27h) — dashboard + mobile
- Week 5-6: PD-W3 + FIX-B3 (44h) — IA restructure
- Week 7-8: PD-W4 + PD-W5 (51h) — company entity
- Week 9-10: PD-W6 (44h) — reports + collaboration

---

## 🎯 PRIORITY 14: Dead/Decorative Features (Built but Not Wired)

### PD-36: Notification Bell — Actually Make It Work
**What:** Bell icon in Header renders with badge count but has NO click handler.
**Current state:**
- `<Bell />` icon renders in header
- `notifications.length > 0` shows a badge count
- But NO onClick, NO dropdown, NO popover — it's decorative
- Zustand store has `notifications: []` but nothing ever calls `addNotification()`
- No API endpoint pushes notifications
**Fix:**
1. Add Popover/Dropdown to bell icon showing notification list
2. Wire API: `/api/notifications` — returns unread notifications
3. Sources: threshold crossings, signal detections, campaign completions, stale contacts
4. Mark-as-read on click, "Clear all" button
5. Realtime subscription for live notifications
**Files:**
- `components/layout/Header.tsx` (add popover)
- `app/api/notifications/route.ts` (new)
- `components/notifications/NotificationPanel.tsx` (new)
**Effort:** 4 hours

### PD-37: AlertFeed Component — Wire It Up
**What:** `components/dashboard/AlertFeed.tsx` exists — well-designed component showing stale contacts, threshold crossings, new signals. But it's NEVER imported anywhere.
**Fix:** Import into Dashboard.tsx and pass the required props (staleContacts, thresholdCrossings, newSignals). These queries already exist in the priority-actions API.
**Files:**
- `app/dashboard/Dashboard.tsx` (import + render AlertFeed)
- `app/api/dashboard/alerts/route.ts` (new — aggregate the 3 alert types)
**Effort:** 2 hours

### PD-38: Header Search Bar — Wire It Up or Remove It
**What:** Search input in Header stores value in Zustand `searchQuery` but NOTHING reads it. It's decorative.
**Options:**
- Option A: Wire it to global search (connect to PD-30 Command Palette search)
- Option B: Remove it and rely on Cmd+K only (cleaner)
**Recommendation:** Option A — make the search bar the visible entry point, Cmd+K as the power-user shortcut. Typing in header search → opens command palette with pre-filled query.
**Files:**
- `components/layout/Header.tsx` (on focus/typing → open CommandPalette)
- `components/CommandPalette.tsx` (accept external query prop)
**Effort:** 1 hour

---

## 🎯 PRIORITY 15: UX Polish

### PD-39: Form Validation System
**What:** No form library in use. All forms are hand-rolled with `useState` — no validation, no error messages, no consistent UX.
**Impact:** Create Contact (FIX-22), Campaign Wizard, Settings forms — all lack validation. Users can submit empty forms, get no feedback on invalid emails, etc.
**Fix:**
1. Install `react-hook-form` + `zod` (already in project? check)
2. Create shared form patterns: `Form`, `FormField`, `FormError` components
3. Apply to: Create Contact, Create Campaign, Settings, Log Activity, Create Note
**Validation rules:**
- Email: valid format
- Name: required, min 2 chars
- Score: 0-100
- Phone: valid format (optional)
- Pipeline stage: must be valid enum
**Files:**
- `components/ui/form.tsx` (new — reusable form components)
- All form components (refactor to use react-hook-form)
**Effort:** 6 hours

### PD-40: Optimistic UI Updates
**What:** When you change a pipeline stage or toggle a filter, the UI waits for server response. Feels slow.
**Fix:**
- Pipeline stage change: update UI immediately, roll back on error
- Contact scoring: update badge immediately, sync in background
- Stage transitions in kanban: animate immediately, persist async
**Implementation:** React state management pattern: set local state → fire API → on error, revert local state + show toast.
**Files:** All pages with write operations (ContactDetail, PipelinePage, ContactsTable)
**Effort:** 4 hours

### PD-41: Error Boundary — Don't Expose Stack Traces
**What:** `app/error.tsx` renders `error.stack` in a `<pre>` tag. In production, this exposes internal code structure.
**Fix:**
- Show user-friendly message: "Something went wrong. Our team has been notified."
- Log error to monitoring service (Sentry from FIX-29)
- Keep stack trace only in development mode
- Add "Report this issue" button
**Files:** `app/error.tsx`
**Effort:** 30 min

### PD-42: "Last Updated" Indicator on Every Page
**What:** No page shows when its data was last refreshed. User doesn't know if they're looking at stale data.
**Design:** Small text in page header: "Last updated: 3 minutes ago ↻" with refresh button.
**Implementation:**
- Track `lastFetchTime` per page in local state
- Display relative time (just now / 2m ago / 1h ago)
- Refresh button clears cache + refetches
- Dashboard already has `realtimeUnsubscribeRef` — use similar pattern elsewhere
**Files:** All page components (add to page header)
**Effort:** 3 hours

### PD-43: Contextual Help System
**What:** No help text, no tooltips explaining features, no "?" icons. A new user sees "Density Cluster #23" and has no idea what that means.
**Design:**
- Help icon (ⓘ) next to complex features
- Click → tooltip/popover explaining what it is and why it matters
- Examples:
  - Score: "Composite score based on 4 factors: pain cluster match, persona fit, product alignment, deal size."
  - Pipeline stage: "Contacts in 'Proposal Sent' should be followed up within 3-5 days."
  - Cluster: "Clusters are AI-generated groups of contacts with similar profiles and needs."
- First-visit tooltip per page (once per user)
**Implementation:**
- `HelpTooltip` component wrapping feature labels
- Help content as a JSON config (so it's editable without code changes)
- Store `seen_tooltips[]` in user preferences
**Files:**
- `components/ui/HelpTooltip.tsx` (new)
- `lib/help-content.ts` (new — all help text)
- Apply to ~15 key features across pages
**Effort:** 6 hours

### PD-44: Print Styles
**What:** Only `report-viewer.tsx` has print styles. No other page is printable.
**Fix:**
- Add `@media print` styles for:
  - Contact detail (clean single-page profile)
  - Pipeline summary (one-page overview)
  - Account/company brief
- Hide: sidebar, header, buttons, navigation
- Show: data tables, key metrics
- Page breaks before major sections
**Files:** `app/globals.css` or per-page `print.css`
**Effort:** 3 hours

### PD-45: Accessibility (a11y) Audit
**What:** Minimal accessibility support. No skip-to-content link, no focus traps in modals, limited ARIA labels.
**Issues found:**
- No "Skip to main content" link
- Modals don't trap focus (Tab key escapes modal)
- No `aria-live` regions for dynamic content
- Score badges have no text alternative for screen readers
- Color-only indicators (score dots) without text labels
- Tables missing `scope` attributes on headers
**Fix:**
1. Add skip-to-content link in layout
2. Add focus trap to all Dialog/Modal components
3. Add `aria-label` to all icon-only buttons
4. Add `sr-only` text to color indicators
5. Audit withaxe-core or Lighthouse
**Files:** Layout, all modal/dialog components, all icon buttons
**Effort:** 6 hours

---

## 📋 FINAL Master Ticket Count

| Category | Tickets | Hours |
|----------|---------|-------|
| **FIX (bugs)** | FIX-19 to FIX-43 (24) | 27h |
| **PD Quick Wins** | PD-01 to PD-06, PD-10, PD-18 (8) | 16h |
| **PD Dashboard** | PD-02, PD-03, PD-04 (3) | 11h |
| **PD Contacts** | PD-05 to PD-09 (5) | 15h |
| **PD Contact Detail** | PD-10 to PD-12 (3) | 13h |
| **PD Signals** | PD-13 to PD-15 (3) | 10h |
| **PD Pipeline** | PD-16 to PD-18 (3) | 6h |
| **PD Clusters** | PD-19, PD-20 (2) | 7h |
| **PD Design System** | PD-21, PD-22 (2) | 5h |
| **PD IA / Nav** | PD-23 (1) | 3h |
| **PD Company Entity** | PD-24 to PD-26 (3) | 22h |
| **PD Mobile** | PD-27, PD-28 (2) | 12h |
| **PD Onboarding** | PD-29, PD-30 (2) | 14h |
| **PD Reports** | PD-31, PD-32 (2) | 18h |
| **PD Collaboration** | PD-33 to PD-35 (3) | 18h |
| **PD Dead Features** | PD-36 to PD-38 (3) | 7h |
| **PD UX Polish** | PD-39 to PD-45 (7) | 26h |
| **TOTAL** | **FIX: 24 + PD: 45 = 69 tickets** | **~245h** |

**Realistic timeline: ~12-14 weeks for one engineer working full-time.**

**Recommended phasing:**
- **Phase 1 (Week 1-2, 20h):** FIX-B1 + PD-36/37/38/41 — Security + email + wire up dead features + error fix
- **Phase 2 (Week 3-4, 30h):** PD-01 to PD-10 — Dashboard action center + contact improvements
- **Phase 3 (Week 5-6, 30h):** FIX-B2 + PD-11 to PD-18 — Timeline, signals, pipeline polish
- **Phase 4 (Week 7-8, 35h):** PD-23 to PD-28 — IA restructure + company entity + mobile
- **Phase 5 (Week 9-10, 40h):** PD-29 to PD-35 — Onboarding, search, reports, collaboration
- **Phase 6 (Week 11-12, 40h):** PD-39 to PD-45 + FIX-B3 — Forms, a11y, polish
- **Phase 7 (Week 13-14, 50h):** Remaining + integration testing + QA
