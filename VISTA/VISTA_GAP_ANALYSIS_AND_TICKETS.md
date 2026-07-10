# VISTA — Complete Gap Analysis & Ticket Inventory

**Author:** James/AI (PM) | **Date:** 2026-07-11 | **Status:** Ready for Review
**Supersedes:** VISTA_MASTER_FRONTEND_SPEC.md (now a subset of this document)
**Benchmark Products:** Notion, Salesforce Lightning, HubSpot CRM, Greenhouse ATS, Recruit CRM, Calendly, Lovable, Replit, Vercel Dashboard

---

## Executive Summary

VISTA currently operates as a **data display layer** — it shows tables, basic cards, and simple forms. Every reference product Kevin named shares a common trait: they feel like **interactive workspaces** where data is editable, contextual, and alive. The gap is not visual polish alone — it is the absence of **interaction patterns** (inline editing, contextual panels, AI summaries, cross-entity linking) that make modern SaaS products feel effortless.

**Three root gaps:**
1. **No inline editing** — Every edit requires a modal or page navigation. Notion, Airtable, and Salesforce let you edit cells in place.
2. **No contextual depth** — Clicking a contact from any page should reveal a rich profile preview (like Notion's page peek, or Greenhouse's candidate side panel). Currently, you must navigate to `/contacts/[id]` to see anything.
3. **No AI thread across pages** — AI summaries exist only on Signals. Contacts, Pipeline, Campaigns, Clusters, Activities — all lack AI-generated context that connects signals → contacts → companies → actions.

---

## Part 1: Gap Analysis by Page/Feature

### 1.1 CONTACTS PAGE (ContactsTable.tsx — 1219 lines)

**What exists:** Table view, Grid view, search, filters, sort, row selection, bulk actions (email, delete, log activity, set stage, set tier), pagination.

**What's missing (gaps vs benchmarks):**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No inline cell editing | Notion (click cell → edit → auto-save), Airtable, Salesforce | P0 |
| No column show/hide/reorder | Notion (drag columns, toggle visibility), Airtable | P0 |
| No saved views/layouts | Notion (named views with filters+sort+columns), Salesforce (saved list views) | P0 |
| No contact preview peek | Notion (page peek on hover), Greenhouse (side panel), HubSpot (side panel) | P0 |
| No LinkedIn link visible in table | Recruit CRM, Salesforce, Greenhouse — LinkedIn icon always visible | P0 |
| No full CV/resume display | Greenhouse (resume viewer), Recruit CRM (CV tab) | P1 |
| No AI summary bar | Signals page has it; Contacts needs "AI insight: 12 contacts match Cluster X, 3 are stale" | P1 |
| No drag-to-select ranges | Notion (drag across cells to multi-edit), Airtable | P2 |
| No keyboard navigation | Notion (arrow keys to move between cells), Airtable | P2 |
| No "last activity" column | HubSpot, Salesforce, Recruit CRM — show days since last touch | P1 |
| No engagement timeline inline | HubSpot (timeline preview on hover) | P2 |
| No avatar photos in table | Recruit CRM, Greenhouse, Salesforce — thumbnail next to name | P1 |
| No tags/labels visible | HubSpot (colored tags), Notion (multi-select pills) | P2 |
| No export to CSV/Excel | Every CRM has this | P1 |
| No "Add Contact" inline row | Notion (click below last row to add), Airtable | P2 |

### 1.2 CONTACT DETAIL PAGE (ContactDetail.tsx — 788 lines)

**What exists:** Header with name/company/score, tabs (Overview, Engagement, Signals, Campaigns, Notes), score breakdown, next best action recommendation, email composer, activity log, campaign wizard.

**What's missing:**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No full CV/resume section | Greenhouse (full resume viewer with parsed fields), Recruit CRM | P0 |
| No LinkedIn profile link (prominent) | Every ATS/CRM — LinkedIn button in header | P0 |
| No side-by-side profile panel | Greenhouse (collapsible right panel with all candidate info) | P0 |
| AI recommendation is template-based, not context-aware | Should consider: campaign context, recent signals, pipeline stage, company situation, activities history | P0 |
| No company intelligence panel | Should show company signals, recent news, other contacts at same company | P1 |
| No relationship map | "You have 4 other contacts at this company" — cross-reference | P1 |
| No conversation history timeline | Greenhouse (chronological interview/activity timeline), HubSpot | P1 |
| No file attachments (CV upload) | Greenhouse (resume/documents attached to candidate), Recruit CRM | P1 |
| No email thread view | HubSpot (shows full email conversation history) | P2 |
| No "Create Meeting" integration | Calendly, HubSpot — schedule directly from contact | P1 |
| No deal/opportunity value tracking | Salesforce (deal amount on contact), Recruit CRM | P2 |
| No score trend chart | Should show VISTA score over time (V, I, S, T, A components) | P2 |
| No "Similar Contacts" section | AI-powered: "People similar to this contact" | P3 |
| No print/PDF export of profile | Recruit CRM (candidate report PDF), Greenhouse | P2 |

### 1.3 PIPELINE PAGE (PipelinePage.tsx — 470 lines)

**What exists:** Kanban board with 8 stages, cards showing name/role/company/location, basic drag between columns.

**What's missing:**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No AI pipeline summary | "Pipeline health: 3 deals stale >14 days, $2.4M at risk" | P0 |
| No deal value display | Salesforce (deal amount on card), Recruit CRM | P1 |
| No win probability/forecast | Salesforce (weighted forecast), HubSpot | P2 |
| No filter within columns | Greenhouse (filter candidates within stage) | P1 |
| No drag-to-advance with auto-log | Greenhouse (dragging candidate logs stage change) | P1 |
| No list view toggle | Greenhouse (list/board toggle), Notion | P1 |
| No velocity metrics | "Avg days in stage: 12" — pipeline velocity | P2 |
| No stage-specific actions | Salesforce (each stage has required fields before advancing) | P2 |
| No pipeline history/audit trail | Salesforce (field history tracking) | P3 |
| No bulk stage change | Select multiple → move to stage | P1 |

### 1.4 CAMPAIGNS PAGE (CampaignsPage.tsx — 458 lines)

**What exists:** Draft queue with approve/edit/reject/send, campaign funnel visualization (Drafted→Sent→Opened→Replied→Meeting), activity history table.

**What's missing:**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No campaign creation wizard | HubSpot (multi-step campaign builder), Recruit CRM | P0 |
| No cluster-based campaign targeting | "Create campaign for Cluster X" — select cluster → auto-populate contact list | P0 |
| No mailist management | HubSpot (mailing lists), Recruit CRM (contact lists per campaign) | P0 |
| No email preview/sneak peek | Can't see what the email looks like before sending | P0 |
| No contact profile peek from campaign | Can't see who the recipient is without leaving page | P0 |
| No AI email generation with full context | Should consider: campaign theme, contact's signals, pipeline stage, company, title, past activities | P0 |
| No campaign templates | HubSpot (save/reuse campaign templates) | P1 |
| No scheduling (send later) | HubSpot (schedule for optimal time), Calendly | P1 |
| No A/B testing | HubSpot (subject line A/B test) | P2 |
| No campaign calendar view | Calendar view of all campaigns by date | P2 |
| No per-contact status tracking within campaign | HubSpot (see each recipient's journey) | P1 |
| No campaign performance analytics | Open rate, reply rate, meeting rate per campaign | P1 |
| No newsletter builder | Rich text / HTML email editor for newsletters | P1 |
| No drip sequence / automation | HubSpot (email sequences: Day 1, Day 3, Day 7) | P2 |

### 1.5 CLUSTERS PAGE (ClustersPage.tsx — 297 lines)

**What exists:** Summary cards (Active/Emerging/Watch), table with industry/geography/status/density score/contacts/revenue, bulk assign to program, drill-down to cluster detail.

**What's missing:**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No AI cluster summary | "Cluster X: 47 contacts, 3 high-value signals this week, recommended action: ..." | P0 |
| No inline contact browsing | Can't see which contacts belong to cluster without navigating away | P0 |
| No batch assign contacts to cluster | From Contacts page, select → "Assign to Cluster X" | P0 |
| No cluster health dashboard | Signals per cluster, engagement rate, revenue trend | P1 |
| No map/geo visualization | Density heatmap, geographic distribution | P2 |
| No cluster comparison | Side-by-side comparison of 2-3 clusters | P2 |
| No cluster-specific campaigns | "Launch campaign for this cluster" directly from cluster page | P1 |
| No cluster timeline | Key events, signal history for this cluster | P2 |

### 1.6 ACTIVITIES PAGE (ActivitiesPage.tsx — 253 lines)

**What exists:** Basic table (date, type, contact, notes, duration), filter by type, search.

**What's missing:**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No AI activity summary | "This week: 12 emails sent, 3 replies, 2 meetings. Reply rate: 25% (above avg)" | P0 |
| No meeting transcript integration | No way to attach/view meeting notes/transcripts | P0 |
| No calendar view | Calendly-style calendar showing all activities | P1 |
| No timeline view | HubSpot (chronological activity feed across all contacts) | P1 |
| No activity patterns/insights | "You send most emails on Tuesday mornings", "Reply rate peaks with subject lines <40 chars" | P2 |
| No bulk activity logging | Select 5 contacts → "Log call with all" | P1 |
| No activity type breakdown chart | Visual chart: emails vs calls vs meetings over time | P2 |
| No linked activities | Can't see that Email → Reply → Meeting is a thread | P2 |
| No file attachments on activities | Attach recordings, documents to activity entries | P2 |

### 1.7 SIGNALS PAGE (SignalsPage.tsx — 615 lines)

**What exists:** Table with type/company/strength/status/date, signal detail page, AI summary panel, generate report button, real-time subscription, bulk actions.

**This is the strongest page — AI summary exists here.** Gap is extending this pattern to all other pages.

| Gap | Reference | Severity |
|-----|-----------|----------|
| Signal-to-contact drill-down | Click signal → see affected contacts inline (not just count) | P0 |
| No signal-to-action workflow | "This signal suggests: email these 5 contacts" → one-click campaign | P0 |
| No signal timeline per company | See all signals for a company in sequence | P1 |
| No signal correlation | "Funding signal + leadership change = high engagement window" | P2 |

### 1.8 DASHBOARD (Dashboard.tsx — 479 lines)

**What exists:** KPI cards (Contacts/Deals/Won/Signals), pipeline funnel, priority actions, quick actions, recent signals. Recently redesigned with VistaCard components.

**What's missing:**

| Gap | Reference | Severity |
|-----|-----------|----------|
| No AI daily briefing | "Good morning. 3 signals overnight: Company X raised $50M (affects 4 contacts). Pipeline: 2 deals stale. Recommended: email [Name] re: [topic]." | P0 |
| No customizable widgets | Notion/Salesforce (drag widgets, resize, rearrange dashboard) | P1 |
| No recent activity feed | HubSpot dashboard (latest activities across all contacts) | P1 |
| No revenue/deal value tracking | Salesforce (revenue dashboard) | P1 |
| No calendar integration | Upcoming meetings, tasks due today | P2 |
| No "Focus Today" section | AI-curated: "Today you should: 1) Follow up with X, 2) Review signal Y, 3) Send campaign Z" | P0 |

### 1.9 GLOBAL / CROSS-CUTTING

| Gap | Reference | Severity |
|-----|-----------|----------|
| No global contact preview panel | Notion (page peek), Greenhouse (side panel), HubSpot (side panel) — clicking any contact name anywhere should open a preview | P0 |
| No command palette for navigation | Already exists (CommandPalette.tsx) but needs enhancement | P1 |
| No keyboard shortcuts | Already exists (KeyboardShortcutsModal.tsx) but needs adoption | P2 |
| No dark mode toggle | Planned Phase 4, not implemented | P2 |
| No mobile responsive nav | Sidebar needs mobile drawer | P2 |
| No global search with entity typeahead | Search should find contacts, companies, signals, campaigns all at once | P1 |
| No LinkedIn integration | Open LinkedIn profile, sync LinkedIn data, show LinkedIn URL everywhere | P0 |
| No data export (global) | Export contacts, pipeline, campaigns to CSV/PDF | P1 |
| No audit trail / activity log (global) | Who changed what, when | P3 |
| No notification system | In-app notifications for signal alerts, task due, campaign replies | P2 |
| No multi-user support | Currently single-user | P3 |

---

## Part 2: Feature Inventory & Ticket Breakdown

### EPIC 1: INLINE EDITING & DATA INTERACTION (Notion-like UX)

> "Why I can edit things directly like on notion database?"

**E-1.1** — Inline Cell Editing for Contacts Table
- Click any cell in Contacts table → transforms to editable input → on blur/Enter, PATCH to `/api/contacts/[id]`
- Support text input, select dropdown (for enum fields like stage, tier), date picker
- Visual feedback: subtle border on hover, save indicator
- Optimistic update (show immediately, rollback on error)
- **Files:** `components/contacts/ContactsTable.tsx`, new `components/ui/InlineCellEditor.tsx`
- **Estimate:** 2-3 days

**E-1.2** — Column Show/Hide/Reorder (Saved Views)
- Drag column headers to reorder
- Right-click column header → Hide column
- "Columns" button → checkbox list to show/hide
- Save current column config as named view (localStorage or user profile)
- Load saved views from dropdown
- **Files:** `components/contacts/ContactsTable.tsx`, new `hooks/useSavedView.ts`
- **Estimate:** 2 days

**E-1.3** — Inline Editing for Pipeline Cards
- Click card in pipeline → expand to show editable fields
- Drag card between columns → auto-update stage + log activity
- Inline add new card at bottom of each column
- **Files:** `app/pipeline/PipelinePage.tsx`
- **Estimate:** 2 days

**E-1.4** — Bulk Edit Modal (Enhanced)
- Select contacts → "Bulk Edit" → modal with all editable fields
- Batch change: stage, tier, cluster, tags, owner
- Preview changes before applying ("5 contacts will change stage from Prospect to Contacted")
- **Files:** `components/contacts/ContactsTable.tsx`, new `components/modals/BulkEditModal.tsx`
- **Estimate:** 1-2 days

**E-1.5** — Inline Editing for Clusters, Signals, Activities
- Cluster: edit industry, geography, status inline in table
- Signal: edit status, strength inline
- Activity: edit notes, type inline
- **Files:** Each page component
- **Estimate:** 2 days

---

### EPIC 2: CONTEXTUAL PROFILE PREVIEW ("Sneak Peek")

> "I need on all the edit or action I have in the app like in email etc to be able to have a sneak peak and view on the contact full profiles"

**E-2.1** — Global Contact Preview Panel (Side Panel)
- Click any contact name (in table, card, email, activity, signal, campaign) → right side panel slides open
- Panel shows: avatar, name, title, company, LinkedIn link, score gauge, pipeline stage, tier, last activity, recent signals, AI summary
- Panel is dismissible (Esc or click outside)
- "Open Full Profile" button → navigates to `/contacts/[id]`
- **Files:** New `components/panels/ContactPreviewPanel.tsx`, layout wrapper
- **Estimate:** 3 days

**E-2.2** — LinkedIn Link Everywhere
- Add `linkedin_url` field to contacts (or use existing `profile_url`)
- Display LinkedIn icon + link in: Contacts table (new column), Contact header, Grid cards, Preview panel, Pipeline cards, Activity rows, Campaign rows
- Open in new tab
- **Files:** All page components, ContactsTable, types
- **Estimate:** 1 day

**E-2.3** — Company Preview Panel
- Click company name → side panel with: company name, industry, other contacts at same company, recent signals for company, pipeline deals at this company
- Cross-reference: query all contacts where company = X
- **Files:** New `components/panels/CompanyPreviewPanel.tsx`
- **Estimate:** 2 days

**E-2.4** — Signal Preview Panel
- Click signal reference → side panel with signal details, affected contacts, recommended actions
- **Files:** New `components/panels/SignalPreviewPanel.tsx`
- **Estimate:** 1-2 days

**E-2.5** — Hover Cards (Quick Preview)
- Hover over contact name → small floating card (200ms delay) with avatar, name, title, company, score, stage
- Lighter version of full side panel, for quick recognition
- **Files:** New `components/ui/HoverCard.tsx`
- **Estimate:** 1 day

---

### EPIC 3: AI LAYER — CROSS-PAGE INTELLIGENCE

> "I need the AI summary like in signals all across for all tabs and pages"

**E-3.1** — AI Summary Component (Reusable)
- Create a reusable `<AISummaryPanel>` component (based on Signals page pattern)
- Accepts: entity type (contacts/pipeline/campaigns/clusters/activities), context data, prompt template
- Renders: collapsible panel with AI-generated insight, key metrics, recommended actions
- Uses DeepSeek API (per SOUL.md rules)
- **Files:** New `components/intelligence/AISummaryPanel.tsx`
- **Estimate:** 1-2 days (component), then integration per page

**E-3.2** — AI Summary: Contacts Page
- "12 of 247 contacts have gone stale (>30 days no activity). 3 high-value signals this week affect 8 contacts. Cluster 'Enterprise SaaS APAC' has highest density (47 contacts) with 2 active signals."
- **Files:** `app/contacts/page.tsx`, `components/contacts/ContactsTable.tsx`
- **Estimate:** 1 day integration

**E-3.3** — AI Summary: Pipeline Page
- "Pipeline: 23 contacts across 6 stages. $0 total deal value (not tracked). 3 contacts stuck in 'Prospect' >30 days. Bottleneck: 'Proposal Sent' → 'Negotiation' (avg 18 days)."
- **Files:** `app/pipeline/page.tsx`
- **Estimate:** 1 day integration

**E-3.4** — AI Summary: Campaigns Page
- "Campaign performance: 0% reply rate (below target). Draft queue: 4 pending. Suggestion: Campaigns targeting 'Enterprise SaaS' cluster have 2x higher open rate. Consider replicating angle."
- **Files:** `app/campaigns/page.tsx`
- **Estimate:** 1 day integration

**E-3.5** — AI Summary: Clusters Page
- "Top cluster: Enterprise SaaS APAC (47 contacts, density 189). 3 signals this week. Revenue potential: $X. Recommendation: Launch targeted campaign for this cluster."
- **Files:** `app/clusters/page.tsx`
- **Estimate:** 1 day integration

**E-3.6** — AI Summary: Activities Page
- "This week: 0 activities logged. Last activity: X days ago. Pattern: Most active on Tuesdays. Suggestion: 12 contacts need re-engagement."
- **Files:** `app/activities/page.tsx`
- **Estimate:** 1 day integration

**E-3.7** — AI Summary: Dashboard (Daily Briefing)
- Morning briefing: "Good morning. Overnight: 2 new signals (Company X funding, Company Y leadership change). 3 contacts affected. Pipeline: 2 stale deals. Today's priority: 1) Email [Name] re: [signal], 2) Follow up with [Name] on proposal, 3) Review cluster [X] opportunity."
- **Files:** `app/dashboard/Dashboard.tsx`
- **Estimate:** 2 days

**E-3.8** — Context-Aware Email Generator
- Email composer should receive FULL context: contact's signals, pipeline stage, company situation, past activities, campaign theme, cluster info, title/seniority
- AI generates email draft considering all of the above
- "Sneak peek" panel showing who you're writing to (contact summary) alongside the editor
- **Files:** `components/modals/EmailComposer.tsx` — major rewrite
- **Estimate:** 3 days

**E-3.9** — Context-Aware Action Generator
- On every page, AI suggests next actions based on full context
- Contact page: "Based on recent funding signal + high score + early stage → Schedule discovery call"
- Pipeline page: "3 contacts stuck → Suggested: send re-engagement email to all 3"
- Cluster page: "2 signals detected → Suggested: create campaign targeting cluster contacts"
- **Files:** Reusable `<AIActionSuggestions>` component
- **Estimate:** 2-3 days

---

### EPIC 4: FULL PROFILE & CV MANAGEMENT

> "The full profile should also be present in the contact view too. Not just some random analysis and some shallow content like title and company name. I need the full CV anytime possible."

**E-4.1** — Full CV/Resume Display in Contact Detail
- New "CV" tab or section in ContactDetail
- Display: parsed CV data (experience history, education, skills, certifications)
- If no CV data exists: "Upload CV" button + "Import from LinkedIn" placeholder
- CV stored as structured data (JSON) or file (PDF) with parsed extraction
- **Files:** `app/contacts/[id]/ContactDetail.tsx`, new DB fields or file storage
- **Estimate:** 3 days

**E-4.2** — CV/Resume Upload
- Drag-and-drop file upload (PDF, DOCX)
- Server-side parsing (extract name, title, experience, education, skills)
- Store parsed data in `vista_contacts` or separate `vista_cv_data` table
- **Files:** New `app/api/contacts/[id]/cv/route.ts`, upload UI component
- **Estimate:** 2-3 days

**E-4.3** — CV Generator (AI-Powered)
- Generate a professional CV/profile summary from VISTA data
- Include: contact info, role history, signals, engagement history, assessment scores
- Export as PDF
- **Files:** New `components/cv/CVGenerator.tsx`, PDF export utility
- **Estimate:** 2-3 days

**E-4.4** — Rich Contact Header
- Redesign contact detail header: avatar, name, title, company, LinkedIn icon (prominent), location, email, phone, score gauge, pipeline stage, tier badge
- Sticky header (stays visible on scroll like Greenhouse)
- Quick actions in header: Email, Call, Log Activity, Move Stage, LinkedIn
- **Files:** `app/contacts/[id]/ContactDetail.tsx` — header section rewrite
- **Estimate:** 1-2 days

**E-4.5** — Assessment & Diagnostics Center
- Per-contact assessment dashboard: VISTA score breakdown (V, I, S, T, A), radar chart, trend over time
- Comparative view: "This contact vs average for their tier/cluster/industry"
- AI-generated assessment narrative: "Strong on Value (8/10) but weak on Signal (3/10) — not responding to market triggers"
- **Files:** New `components/assessment/AssessmentCenter.tsx`
- **Estimate:** 3 days

---

### EPIC 5: CAMPAIGN & BULK OPERATIONS

> "I need to be able to batch assign contacts, create campaign, and manage these en masse"

**E-5.1** — Campaign Builder (Full Wizard)
- Multi-step wizard: 1) Campaign type → 2) Select contacts (from clusters, filters, manual) → 3) Choose/template email → 4) Review & schedule → 5) Launch
- Support: Newsletter, Executive Brief, Webinar Invite, Podcast Invite, Event Invite, Follow-up, Re-engagement
- Per-cluster campaign: select cluster → all contacts auto-added
- **Files:** Major rewrite of `components/modals/CampaignWizard.tsx`
- **Estimate:** 3-4 days

**E-5.2** — Mailist Management
- Create/save named mailing lists (e.g., "Enterprise SaaS APAC", "C-Suite Banking")
- Lists are reusable across campaigns
- Add/remove contacts from lists
- Import from cluster, from filters, from manual selection
- **Files:** New `app/mailing-lists/page.tsx`, new `vista_mailing_lists` + `vista_mailing_list_contacts` tables
- **Estimate:** 3 days

**E-5.3** — Bulk Assign to Cluster
- From Contacts page: select contacts → "Assign to Cluster" → select/create cluster
- From Clusters page: "Browse contacts" → see unassigned contacts → drag/assign to cluster
- **Files:** `components/contacts/ContactsTable.tsx`, `app/clusters/[id]/ClusterDetail.tsx`
- **Estimate:** 2 days

**E-5.4** — Bulk Assign by Multiple Criteria
- Select contacts → bulk assign by: cluster, country, title, company, stage, tier, tags
- Rule-based assignment: "All contacts with title containing 'CEO' in 'APAC' → assign to Cluster X"
- **Files:** Bulk operation components
- **Estimate:** 2 days

**E-5.5** — Campaign Email Preview & Editor
- Rich email preview: see formatted email before sending
- Side-by-side: email preview + contact profile peek
- Inline editing of email body
- Template variable insertion: {{first_name}}, {{company}}, {{signal}}, etc.
- **Files:** `components/modals/EmailComposer.tsx` — major enhancement
- **Estimate:** 3 days

**E-5.6** — Newsletter Campaign
- Rich text / block-based newsletter editor
- Sections: header image, intro paragraph, content blocks, CTA, footer
- Per-cluster newsletter: auto-personalize with cluster-specific content
- Preview on desktop/mobile
- **Files:** New `components/campaigns/NewsletterEditor.tsx`
- **Estimate:** 4-5 days

---

### EPIC 6: MEETING & TRANSCRIPT MANAGEMENT

> "Meeting transcript with clients"

**E-6.1** — Meeting Transcript Upload & Storage
- Upload meeting transcript (text, PDF, DOCX)
- Associate with contact(s) and/or campaign
- Store in `vista_meetings` table
- **Files:** New `app/api/meetings/route.ts`, upload UI
- **Estimate:** 2 days

**E-6.2** — AI Meeting Summarizer
- Upload transcript → AI generates: summary, key decisions, action items, follow-up tasks
- Auto-create activities from action items
- Auto-suggest next steps per contact
- **Files:** New `components/meetings/MeetingSummarizer.tsx`
- **Estimate:** 2-3 days

**E-6.3** — Meeting Calendar Integration
- Calendar view of all meetings (past and upcoming)
- Link to Calendly for scheduling
- Auto-log meeting as activity
- **Files:** New `app/meetings/page.tsx` or calendar view in Activities
- **Estimate:** 2-3 days

---

### EPIC 7: PROJECT & MANDATE MANAGEMENT

> "Candidate/mandate management directly on the platform"

**E-7.1** — Mandate/Project Entity
- New entity: `vista_mandates` (mandate name, client company, status, contacts assigned, description, deadline)
- CRUD operations via API
- **Files:** New `app/mandates/page.tsx`, API routes, DB migration
- **Estimate:** 3 days

**E-7.2** — Mandate Dashboard
- Per-mandate view: assigned contacts, pipeline status, activities, signals, timeline
- Assign contacts to mandate from Contacts page
- Track mandate progress (stages: Active → In Progress → Shortlist → Offer → Placed)
- **Files:** New `app/mandates/[id]/page.tsx`
- **Estimate:** 3 days

**E-7.3** — Project Status Report Generator
- AI-generated status report per mandate: progress summary, key metrics, risks, next actions
- Export as PDF
- **Files:** New `components/mandates/StatusReportGenerator.tsx`
- **Estimate:** 2 days

**E-7.4** — Mapping (Contact-to-Mandate)
- Visual mapping: which contacts are assigned to which mandates
- Unassigned contacts view
- Drag-and-drop assignment
- **Files:** New mapping component
- **Estimate:** 2-3 days

---

### EPIC 8: DESIGN QUALITY — "NO MORE CLUNKINESS"

> "Far from Notion, far from Salesforce, far from Vercel, Replit or Lovable"

**E-8.1** — Design System Audit & Refinement
- Audit every component against Notion/Salesforce/Vercel design language
- Standardize: spacing (consistent 8px grid), typography scale, color usage, border treatments, shadow depth
- Remove all remaining "clunky" elements: inconsistent padding, mismatched font sizes, generic shadcn styling
- **Files:** `globals.css`, `tailwind.config.ts`, all component files
- **Estimate:** 3-4 days

**E-8.2** — Micro-interactions & Animations
- Page transitions (fade-in on route change)
- Button hover states (subtle scale, color shift)
- Card hover effects (border highlight, subtle lift)
- Toast notifications with slide-in animation
- Loading skeletons instead of spinners
- **Files:** `globals.css` (animations), individual components
- **Estimate:** 2 days

**E-8.3** — Table Design Overhaul
- Reference: Notion table, Airtable, Vercel dashboard tables
- Thinner rows, better density, zebra striping option
- Sticky header row, sticky first column
- Better sort indicators
- Inline status badges with color dots
- **Files:** `components/contacts/ContactsTable.tsx`, all table components
- **Estimate:** 2-3 days

**E-8.4** — Button & Form Component Redesign
- Primary buttons: solid fuchsia, consistent sizing (sm/md/lg)
- Secondary buttons: outlined, ghost variants
- Input fields: cleaner borders, focus states, consistent heights
- Select dropdowns: modern styling
- Reference: Vercel dashboard, Linear, Notion forms
- **Files:** `components/ui/button.tsx`, `input.tsx`, `select.tsx`
- **Estimate:** 2 days

**E-8.5** — Navigation & Sidebar Polish
- Smoother transitions
- Better hover states
- Section groupings with collapsible sections
- Active indicator refinement
- User avatar + settings at bottom
- **Files:** `components/layout/Sidebar.tsx`
- **Estimate:** 1-2 days

**E-8.6** — Empty States & Onboarding
- Every empty state should have: illustration, helpful text, CTA button
- First-run onboarding: guided tour of key features
- **Files:** All page components (empty state sections)
- **Estimate:** 2 days

**E-8.7** — Responsive & Mobile
- Mobile-first sidebar (drawer pattern)
- Responsive tables (card view on mobile)
- Touch-friendly interactions
- **Files:** Layout components, all pages
- **Estimate:** 3-4 days

---

### EPIC 9: DATA INTEGRATION & CONNECTORS

**E-9.1** — LinkedIn Profile Connector
- For each contact, store LinkedIn URL
- "Open LinkedIn" button everywhere contact appears
- (Future) LinkedIn data sync via API
- **Files:** DB migration, UI components
- **Estimate:** 1 day (URL storage), 5+ days (API integration)

**E-9.2** — Email Integration (MS Graph)
- Send emails via MS Graph API (from kevin.hong@lyc-partners.ai)
- Track sent emails → auto-log as activities
- Track opens/replies → update campaign status
- **Files:** `app/api/email/` routes, MS Graph integration
- **Estimate:** 3-4 days

**E-9.3** — Calendly Integration
- Connect Calendly account
- "Schedule Meeting" button on contact → opens Calendly link with context
- Auto-log scheduled meetings as activities
- **Files:** Calendly API integration
- **Estimate:** 2-3 days

**E-9.4** — Data Import/Export
- CSV import for contacts (bulk)
- CSV export for all entities
- PDF export for reports, profiles, campaign summaries
- **Files:** Import/export utilities, UI components
- **Estimate:** 2-3 days

---

## Part 3: Prioritized Execution Order

### Wave 1 — P0 (Immediate, 2-3 weeks)
> Fix the core interaction gaps that make VISTA feel "clunky"

| # | Ticket | Epic | Estimate |
|---|--------|------|----------|
| 1 | E-1.1 Inline Cell Editing | Inline Editing | 3 days |
| 2 | E-1.2 Column Show/Hide/Reorder + Saved Views | Inline Editing | 2 days |
| 3 | E-2.1 Global Contact Preview Panel | Contextual Preview | 3 days |
| 4 | E-2.2 LinkedIn Link Everywhere | Contextual Preview | 1 day |
| 5 | E-3.1 Reusable AI Summary Component | AI Layer | 2 days |
| 6 | E-3.2–3.6 AI Summary on All Pages | AI Layer | 5 days |
| 7 | E-3.8 Context-Aware Email Generator | AI Layer | 3 days |
| 8 | E-4.4 Rich Contact Header | Full Profile | 2 days |
| 9 | E-5.1 Campaign Builder Wizard | Campaigns | 4 days |
| 10 | E-5.3 Bulk Assign to Cluster | Campaigns | 2 days |
| | | **Wave 1 Total:** | **~27 days** |

### Wave 2 — P1 (Short-term, 2-3 weeks)
> Add depth and workflow capabilities

| # | Ticket | Epic | Estimate |
|---|--------|------|----------|
| 11 | E-2.3 Company Preview Panel | Contextual Preview | 2 days |
| 12 | E-2.4 Signal Preview Panel | Contextual Preview | 2 days |
| 13 | E-1.3 Inline Editing Pipeline | Inline Editing | 2 days |
| 14 | E-1.4 Bulk Edit Modal | Inline Editing | 2 days |
| 15 | E-1.5 Inline Editing Clusters/Signals/Activities | Inline Editing | 2 days |
| 16 | E-3.7 AI Dashboard Daily Briefing | AI Layer | 2 days |
| 17 | E-3.9 AI Action Generator | AI Layer | 3 days |
| 18 | E-4.1 Full CV Display | Full Profile | 3 days |
| 19 | E-4.2 CV Upload | Full Profile | 3 days |
| 20 | E-5.2 Mailist Management | Campaigns | 3 days |
| 21 | E-5.4 Bulk Assign by Criteria | Campaigns | 2 days |
| 22 | E-5.5 Campaign Email Preview | Campaigns | 3 days |
| 23 | E-6.1 Meeting Transcript Upload | Meetings | 2 days |
| 24 | E-6.2 AI Meeting Summarizer | Meetings | 3 days |
| | | **Wave 2 Total:** | **~38 days** |

### Wave 3 — P2 (Medium-term, 3-4 weeks)
> Design quality, advanced features, integrations

| # | Ticket | Epic | Estimate |
|---|--------|------|----------|
| 25 | E-8.1 Design System Audit | Design Quality | 4 days |
| 26 | E-8.2 Micro-interactions | Design Quality | 2 days |
| 27 | E-8.3 Table Design Overhaul | Design Quality | 3 days |
| 28 | E-8.4 Button & Form Redesign | Design Quality | 2 days |
| 29 | E-8.5 Sidebar Polish | Design Quality | 2 days |
| 30 | E-8.6 Empty States | Design Quality | 2 days |
| 31 | E-5.6 Newsletter Builder | Campaigns | 5 days |
| 32 | E-6.3 Meeting Calendar | Meetings | 3 days |
| 33 | E-7.1 Mandate Entity | Mandates | 3 days |
| 34 | E-7.2 Mandate Dashboard | Mandates | 3 days |
| 35 | E-9.1 LinkedIn URL Storage | Integration | 1 day |
| 36 | E-9.2 MS Graph Email | Integration | 4 days |
| 37 | E-9.4 Data Import/Export | Integration | 3 days |
| | | **Wave 3 Total:** | **~39 days** |

### Wave 4 — P3 (Longer-term)
> Advanced intelligence, automation, scale

| # | Ticket | Epic | Estimate |
|---|--------|------|----------|
| 38 | E-4.3 CV Generator | Full Profile | 3 days |
| 39 | E-4.5 Assessment Center | Full Profile | 3 days |
| 40 | E-7.3 Status Report Generator | Mandates | 2 days |
| 41 | E-7.4 Contact-to-Mandate Mapping | Mandates | 3 days |
| 42 | E-8.7 Responsive/Mobile | Design Quality | 4 days |
| 43 | E-2.5 Hover Cards | Contextual Preview | 1 day |
| 44 | E-1.5 (remaining inline edit) | Inline Editing | 1 day |
| 45 | E-9.3 Calendly Integration | Integration | 3 days |
| 46 | Dark Mode Toggle | Design Quality | 2 days |
| 47 | Notification System | Global | 4 days |
| | | **Wave 4 Total:** | **~26 days** |

---

## Part 4: Architecture Notes

### New Database Tables Needed
```sql
-- Mailing lists
vista_mailing_lists (id, name, description, cluster_id, created_at)
vista_mailing_list_contacts (list_id, contact_id, added_at)

-- Mandates/Projects
vista_mandates (id, name, client_company, status, description, deadline, created_at)
vista_mandate_contacts (mandate_id, contact_id, role_in_mandate, assigned_at)

-- Meetings/Transcripts
vista_meetings (id, title, meeting_date, duration_minutes, transcript_text, ai_summary, contact_ids, campaign_id, created_at)

-- CV/Resume data
vista_cv_data (contact_id, parsed_data JSONB, raw_file_path, uploaded_at)

-- Saved views
vista_saved_views (id, user_id, entity_type, view_name, config JSONB, created_at)
```

### New Reusable Components
- `<AISummaryPanel>` — AI-generated insight panel (used on every page)
- `<ContactPreviewPanel>` — Side panel with full contact preview
- `<CompanyPreviewPanel>` — Side panel with company context
- `<SignalPreviewPanel>` — Side panel with signal details
- `<InlineCellEditor>` — Click-to-edit cell for tables
- `<HoverCard>` — Quick preview on hover
- `<CampaignWizard>` — Multi-step campaign builder (rewrite)
- `<NewsletterEditor>` — Block-based email editor
- `<MeetingSummarizer>` — AI transcript summarizer
- `<AssessmentCenter>` — Per-contact diagnostic dashboard
- `<CVViewer>` — Full CV display component

### DeepSeek Integration Points
All AI features route through DeepSeek API (per SOUL.md rules):
- Summary generation: flash model (fast, cheap)
- Email generation: pro model (quality matters)
- Meeting summarization: pro model
- Assessment narrative: pro model
- Daily briefing: flash model
- Prompt templates stored in `lib/ai/prompts/`

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Epics | 9 |
| Total Tickets | 47 |
| P0 (Wave 1) | 10 tickets, ~27 dev-days |
| P1 (Wave 2) | 14 tickets, ~38 dev-days |
| P2 (Wave 3) | 13 tickets, ~39 dev-days |
| P3 (Wave 4) | 10 tickets, ~26 dev-days |
| **Total estimated effort** | **~130 dev-days** |
| New DB tables | 7 |
| New reusable components | 11 |
| Files requiring modification | ~40+ |

---

*This document is the single source of truth for VISTA's feature backlog. Each ticket should be converted to a Notion card with acceptance criteria before implementation begins.*
