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
