# VISTA V2 — Complete Gap Analysis, Spec Inventory & Ticket Backlog

**Author:** James/AI (PM) | **Date:** 2026-07-11 | **Status:** Ready for Kevin Review
**Supersedes:** VISTA_GAP_ANALYSIS_AND_TICKETS.md (V1 — 47 tickets)
**Benchmark Products:** Notion, Salesforce Lightning, HubSpot CRM, Greenhouse ATS, Recruit CRM, Calendly, Lovable, Replit, Vercel Dashboard, Linear

---

## Executive Summary

VISTA has completed **Wave 1** of its frontend overhaul. The foundation is in place: LinkedIn links everywhere, contact preview panel, AI summaries on all 7 pages, inline cell editing, column controls + saved views, bulk cluster assignment, rich contact header, context-aware email generator, and multi-step campaign builder wizard.

**But Kevin's feedback is clear:** the product still feels far from the reference products (Notion, Salesforce, HubSpot, Greenhouse, Calendly, Lovable, Replit). The gaps are no longer about individual features — they're about **depth**, **connectivity**, and **craft**.

### Three Categories of Remaining Work

| Category | What It Means | Scope |
|----------|---------------|-------|
| **Depth** | Full CV, meeting transcripts, mandate management, assessment center — the app has no "there" there for key BD workflows | 4 new entities, 8 new pages |
| **Connectivity** | Signals → Contacts → Companies → Clusters → Campaigns → Activities are siloed. Clicking anything should reveal everything related to it | 12 cross-link features |
| **Craft** | Spacing, animations, hover states, micro-interactions, loading states, empty states, keyboard navigation — the "feel" that separates Notion from an admin panel | 15 design quality tickets |

---

## Part 1: What's Shipped (Wave 1 Complete)

| Component | Status | Commit |
|-----------|--------|--------|
| LinkedInLink (everywhere) | ✅ Shipped | `2dcc28f` |
| ContactPreviewPanel (side panel) | ✅ Shipped | `2dcc28f` |
| AISummaryPanel (all 7 pages) | ✅ Shipped | `2dcc28f` |
| InlineCellEditor (Stage column) | ✅ Shipped | `2dcc28f` |
| Column Show/Hide + Saved Views | ✅ Shipped | `8003382` |
| Bulk Assign to Cluster | ✅ Shipped | `8003382` |
| Rich Contact Header (Greenhouse-style) | ✅ Shipped | `8003382` |
| Context-Aware Email Generator | ✅ Shipped | `8003382` |
| Multi-Step Campaign Builder Wizard | ✅ Shipped | `8003382` |
| Design tokens, zero border-radius, brand colors | ✅ Shipped | `a9c41a4`, `b79242d` |
| Dashboard VistaCard redesign | ✅ Shipped | `a497691` |
| Contacts Grid/Card view | ✅ Shipped | `4beef5b` |
| Bulk Stage/Tier operations | ✅ Shipped | `4beef5b` |
| Pipeline data fix | ✅ Shipped | `4beef5b` |
| Performance optimization (parallel queries, caching) | ✅ Shipped | `30e3988` |

---

## Part 2: Spec Inventory — What Exists vs. What's Missing

### Existing Specs (All in `/VISTA/` directory)

| Spec | Lines | Coverage | Status |
|------|-------|----------|--------|
| VISTA_GAP_ANALYSIS_AND_TICKETS.md (V1) | 721 | 9 epics, 47 tickets | **Superseded by this doc** |
| VISTA_MASTER_FRONTEND_SPEC.md | 797 | Frontend architecture, component tree | Partially implemented |
| VISTA_UX_COMPLETION_SPEC.md | 706 | Bug fixes, design system, intelligence briefing | Partially implemented |
| VISTA_DESIGN_SYSTEM_OVERHAUL.md | 362 | Design tokens, CSS variables, fonts | ✅ Implemented |
| WAVE2_BULK_OPS_SPEC.md | 272 | Bulk assess, bulk signals, realtime | Backend only, not UI-integrated |
| WAVE3_ACTION_ENGINE_SPEC.md | 289 | AI email gen, campaign gen, execute buttons | Backend endpoints exist, UI partially wired |
| WAVE4_REPORTS_SPEC.md | 283 | Cluster report, signal digest, pipeline review | Backend endpoints exist, UI not integrated |
| WAVE5_AGENT_BRIDGE_SPEC.md | 450 | Agent triggers, Feishu integration, dynamic routes | Trigger routes exist, response handling not built |
| INTELLIGENCE_LAYER_SPEC.md | 504 | DeepSeek integration, scoring, signal detection | Backend live |
| NEXT_TICKETS.md | 184 | P1-P3 frontend polish tickets | Partially addressed |

### Missing Specs (Not Yet Documented)

| Spec | Why It's Needed | Priority |
|------|----------------|----------|
| **S1: Mandate/Candidate Management** | Kevin: "candidate/mandate management directly on the platform" | P0 |
| **S2: Meeting Transcript Management** | Kevin: "meeting transcript with clients" | P0 |
| **S3: CV/Resume Management** | Kevin: "full CV anytime possible", "CV generator" | P0 |
| **S4: Assessment & Diagnostics Center** | Kevin: "assessment and diagnostics center" | P1 |
| **S5: Signal Cross-Connectivity** | Kevin: "connect better the information from signals across cluster, contacts and companies" | P0 |
| **S6: Global Context System** | Kevin: "on all pages button I click I should always be able to connect/open/review more information" | P0 |
| **S7: Design Craft & UX Quality** | Kevin: "making the general feel like Notion, Salesforce, HubSpot, Greenhouse" + "no more clunkiness" | P0 |
| **S8: Pipeline Management Enhancement** | Kevin: pipeline needs inline editing, deal values, velocity metrics | P1 |
| **S9: Project Status Reporting** | Kevin: "project status report" | P1 |
| **S10: Contact-to-Mandate Mapping** | Kevin: "mapping" | P1 |

---

## Part 3: Detailed Gap Analysis by Domain

### 3.1 CONTACT DEPTH — "I need the full CV anytime possible"

**Current state:** Contact detail shows name, title, company, VISTA scores, pipeline stage, contact info, and a rich sticky header. No CV. No resume. No experience history. No education. No skills.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| No CV/Resume upload | Greenhouse (resume viewer), Recruit CRM (CV tab) | P0 | **T-01** |
| No parsed CV display (experience, education, skills) | Greenhouse (structured resume), LinkedIn profile | P0 | **T-02** |
| No AI CV generation from VISTA data | N/A (new capability) | P1 | **T-03** |
| No CV export as PDF | Greenhouse (print candidate), Recruit CRM | P2 | **T-04** |
| No file attachment management (multiple docs per contact) | Greenhouse (documents tab) | P1 | **T-05** |
| No experience timeline visualization | LinkedIn (experience section), Greenhouse | P1 | **T-06** |
| No skills/competency tags | Greenhouse (skills labels), Salesforce (skills) | P2 | **T-07** |
| No "contact completeness" indicator | HubSpot (profile completeness) | P2 | **T-08** |

### 3.2 SIGNAL CROSS-CONNECTIVITY — "Connect better the information from signals across cluster, contacts and companies"

**Current state:** Signals page shows signals in a table. Contact preview panel shows recent signals. But signals are NOT deeply cross-linked to clusters, companies, campaigns, or activities.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| No "affected contacts" drill-down from signal | Notion (linked databases), Salesforce (related lists) | P0 | **T-09** |
| No "company signals" view — all signals for a company in one place | Salesforce (company timeline), HubSpot (company insights) | P0 | **T-10** |
| No "cluster signals" — signals aggregated by cluster | N/A (new) | P0 | **T-11** |
| No signal → campaign suggestion ("this signal suggests: email these 5 contacts") | N/A (new) | P0 | **T-12** |
| No signal → activity auto-creation | HubSpot (signal triggers workflow) | P1 | **T-13** |
| No signal correlation ("funding + leadership change = high engagement window") | N/A (new) | P1 | **T-14** |
| No signal timeline per company (chronological view) | Salesforce (company activity history) | P1 | **T-15** |
| Company Preview Panel — click company name anywhere → side panel | HubSpot (company sidebar) | P0 | **T-16** |
| Signal Preview Panel — click signal → side panel with details + affected contacts | N/A (new) | P1 | **T-17** |

### 3.3 MANDATE/CANDIDATE MANAGEMENT — "Candidate/mandate management directly on the platform"

**Current state:** VISTA has NO concept of mandates, projects, or engagements. Contacts exist in isolation. There's no way to group contacts by client project, track mandate progress, or assign contacts to specific search engagements.

**What's missing (entirely new entity):**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Mandate entity (CRUD) — name, client company, status, description, deadline, value | Greenhouse (job/requisition), Recruit CRM (assignment) | P0 | **T-18** |
| Mandate Dashboard — per-mandate view with contacts, pipeline, activities, timeline | Greenhouse (requisition view), Recruit CRM | P0 | **T-19** |
| Contact-to-Mandate assignment — assign contacts to mandates from Contacts page | Recruit CRM (assign candidate to assignment) | P0 | **T-20** |
| Mandate pipeline stages (Active → Sourcing → Shortlist → Interview → Offer → Placed) | Greenhouse (stage pipeline per requisition) | P0 | **T-21** |
| Mandate status report generator (AI) | N/A (new) | P1 | **T-22** |
| Mandate timeline — all activities across all contacts in one mandate | Greenhouse (requisition activity feed) | P1 | **T-23** |
| Visual mapping: contacts ↔ mandates (drag-and-drop) | Recruit CRM (visual assignment) | P1 | **T-24** |
| Mandate metrics: time-to-fill, source effectiveness, pipeline velocity | Greenhouse (requisition analytics) | P2 | **T-25** |
| Mandate templates — clone mandate structure for repeat searches | Recruit CRM (templates) | P2 | **T-26** |
| Unassigned contacts view — contacts not assigned to any mandate | N/A (new) | P1 | **T-27** |

### 3.4 MEETING TRANSCRIPT MANAGEMENT — "Meeting transcript with clients"

**Current state:** Activities page has basic activity logging (type, notes, duration). No meeting transcript upload, no parsing, no AI summarization, no action item extraction.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Meeting transcript upload (text, PDF, DOCX) | Grain, Otter.ai, Fathom | P0 | **T-28** |
| AI meeting summarization (key decisions, action items, follow-ups) | Otter.ai (AI summary), Fathom | P0 | **T-29** |
| Auto-create activities from meeting action items | HubSpot (meeting → tasks) | P1 | **T-30** |
| Meeting ↔ Contact association (which contacts were in the meeting) | Calendly + HubSpot | P0 | **T-31** |
| Meeting ↔ Campaign association | N/A (new) | P1 | **T-32** |
| Meeting calendar view | Calendly, HubSpot (meetings calendar) | P1 | **T-33** |
| Meeting notes template (structured fields: attendees, agenda, decisions, next steps) | Notion (meeting notes template) | P1 | **T-34** |
| Transcription integration (auto-transcribe audio/video) | Otter.ai, Whisper | P2 | **T-35** |
| Meeting search (full-text search across all transcripts) | Notion (search) | P2 | **T-36** |

### 3.5 ASSESSMENT & DIAGNOSTICS CENTER — "Assessment and diagnostics center"

**Current state:** VISTA has V/I/S/T/A scores per contact. No structured assessment framework. No diagnostics dashboard. No comparison view. No historical tracking of score changes. No assessment narratives.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Assessment Dashboard — per-contact diagnostic view (all scores, trends, signals, recommendations in one place) | Greenhouse (scorecard), Salesforce (contact diagnostics) | P0 | **T-37** |
| Score trend tracking (V/I/S/T/A over time) | Salesforce (field history) | P1 | **T-38** |
| Comparative assessment (compare 2-3 contacts side-by-side) | Greenhouse (candidate comparison) | P1 | **T-39** |
| AI assessment narrative (paragraph explaining the contact's profile, strengths, risks, potential) | N/A (new) | P1 | **T-40** |
| Assessment templates (different assessment frameworks for different contexts) | N/A (new) | P2 | **T-41** |
| Diagnostic alerts ("this contact's I score dropped 15pts in 2 weeks — investigate") | N/A (new) | P1 | **T-42** |
| Batch assessment trigger (re-assess N contacts with AI) | Already exists as API (Wave 2) — needs UI | P1 | **T-43** |

### 3.6 EMAIL/ACTION CONTEXT DEPTH — "In email writing, I lack all the context of who is the guy"

**Current state:** Email composer has a context panel showing contact name, title, company, industry, pipeline, score, last contact, touches. Company signals fetched from API. But it's still shallow.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Campaign context in email composer (which campaign is this email part of?) | HubSpot (campaign-aware email) | P0 | **T-44** |
| Activity history in email composer (last 5 activities with this contact) | HubSpot (timeline in email) | P0 | **T-45** |
| Signal context in email composer (recent signals for this contact/company) | N/A (new) | P0 | **T-46** |
| Pipeline context in email composer (what stage, what's the next stage, what happened before) | Salesforce (opportunity context) | P1 | **T-47** |
| Cluster context in email composer (what cluster, what other contacts in cluster) | N/A (new) | P1 | **T-48** |
| Meeting context in email composer (last meeting summary, pending action items) | N/A (new) | P1 | **T-49** |
| "Related contacts" in email composer (other contacts at same company/cluster) | N/A (new) | P2 | **T-50** |
| Full contact profile sneak-peek within email composer (expandable, not just summary) | Greenhouse (candidate side panel) | P0 | **T-51** |
| Email template variable insertion ({{first_name}}, {{company}}, {{signal}}, {{meeting_topic}}) | HubSpot (personalization tokens) | P1 | **T-52** |
| AI email generation with FULL context (all of the above fed to DeepSeek) | N/A (enhancement) | P0 | **T-53** |

### 3.7 PIPELINE ENHANCEMENT

**Current state:** Kanban board with 8 stages, basic drag between columns, cards showing name/role/company/location. No deal values, no velocity metrics, no inline editing, no filters within columns.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Inline editing on pipeline cards (click to edit fields) | Greenhouse (inline edit), Notion | P0 | **T-54** |
| Deal/mandate value display on cards | Salesforce (deal amount) | P1 | **T-55** |
| Pipeline velocity metrics (avg days per stage, conversion rates) | Salesforce (pipeline velocity) | P1 | **T-56** |
| Filter within columns (e.g., show only "Hot" tier in Prospect column) | Greenhouse (filter) | P1 | **T-57** |
| List view toggle (board/list) | Greenhouse, Notion | P1 | **T-58** |
| Bulk stage change (select multiple → move) | Salesforce (mass update) | P1 | **T-59** |
| Drag-and-drop auto-log (dragging logs activity automatically) | Greenhouse (stage change log) | P1 | **T-60** |
| Stage-specific required fields (must fill X before advancing) | Salesforce (validation rules) | P2 | **T-61** |
| Pipeline forecast (weighted deal values) | Salesforce (forecast) | P2 | **T-62** |

### 3.8 DESIGN CRAFT — "No more clunkiness"

**Current state:** Design tokens exist (zero border-radius, brand colors, fuchsia accent). VistaCard component exists. But the overall feel is still admin-panel, not product-grade.

**What's missing (reference: Notion, Linear, Vercel, Lovable, Replit):**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Table density overhaul (thinner rows, better spacing, zebra striping) | Notion tables, Airtable | P0 | **T-63** |
| Micro-interactions (page transitions, button hover, card lift, toast animations) | Linear (micro-interactions), Lovable | P0 | **T-64** |
| Loading skeletons everywhere (replace spinners) | Vercel, Linear (skeleton loading) | P0 | **T-65** |
| Empty states with illustration + CTA on every page | Notion (empty state), Linear | P1 | **T-66** |
| Sidebar polish (collapsible sections, better hover, user avatar at bottom) | Linear sidebar, Notion sidebar | P1 | **T-67** |
| Button/form redesign (consistent sizing, better focus states, modern dropdowns) | Vercel dashboard, Linear | P1 | **T-68** |
| Command palette enhancement (search across all entities, instant navigation) | Linear (command palette), Vercel | P1 | **T-69** |
| Keyboard navigation (arrow keys between cells, shortcuts) | Notion (keyboard nav), Airtable | P2 | **T-70** |
| Drag-to-select ranges (multi-cell selection) | Notion, Airtable | P2 | **T-71** |
| Responsive mobile layout (sidebar drawer, card tables) | Every modern SaaS | P2 | **T-72** |
| Dark mode toggle (full implementation) | Every modern SaaS | P2 | **T-73** |
| Notification system (in-app alerts for signals, task due, replies) | HubSpot, Salesforce | P2 | **T-74** |

### 3.9 PROJECT STATUS REPORTING — "Project status report"

**Current state:** Wave 4 spec defines cluster reports, signal digests, pipeline reviews. But no mandate-specific status reports. No project health dashboard.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Mandate status report (AI-generated progress summary per mandate) | Greenhouse (requisition report) | P0 | **T-75** |
| Mandate health dashboard (all mandates, status, timeline, risks) | Salesforce (portfolio dashboard) | P1 | **T-76** |
| Export reports as PDF (mandate, cluster, pipeline, signal) | Wave 4 spec (exists but not built) | P1 | **T-77** |
| Scheduled reports (weekly mandate status emailed automatically) | HubSpot (scheduled reports) | P2 | **T-78** |
| Cross-mandate summary (portfolio view of all active mandates) | Salesforce (portfolio) | P2 | **T-79** |

### 3.10 CAMPAIGN ENHANCEMENT

**Current state:** Campaign builder wizard (5-step), bulk assign to cluster, AI generation. But no mailing lists, no per-contact tracking, no templates, no scheduling.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Mailing list management (create lists, add/remove contacts) | HubSpot (contact lists) | P0 | **T-80** |
| Per-contact status tracking within campaign (who opened, who replied) | HubSpot (recipient journey) | P1 | **T-81** |
| Campaign templates (save/reuse) | HubSpot (campaign templates) | P1 | **T-82** |
| Schedule send (pick date/time) | HubSpot (schedule) | P1 | **T-83** |
| Campaign performance analytics (open rate, reply rate, meeting rate) | HubSpot (campaign analytics) | P1 | **T-84** |
| Drip sequence automation (Day 1 email → Day 3 LinkedIn → Day 7 follow-up) | HubSpot (sequences) | P2 | **T-85** |
| Newsletter builder (block-based editor) | HubSpot (email editor) | P2 | **T-86** |
| A/B testing (subject line variants) | HubSpot | P3 | **T-87** |

### 3.11 GLOBAL CONTEXT & NAVIGATION — "Always be able to connect/open/review more information"

**Current state:** ContactPreviewPanel opens when clicking a contact name. But company names aren't clickable. Signals aren't clickable for drill-down. No breadcrumb trail. No "back to context" navigation.

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| Company name clickable everywhere → CompanyPreviewPanel | HubSpot, Salesforce | P0 | **T-16** (dup) |
| Signal type clickable → SignalPreviewPanel | N/A | P1 | **T-17** (dup) |
| Cluster name clickable → ClusterPreviewPanel | N/A | P1 | **T-88** |
| Campaign name clickable → CampaignPreviewPanel | N/A | P1 | **T-89** |
| Breadcrumb navigation (Dashboard > Contacts > John Doe > Email) | Notion (breadcrumbs) | P1 | **T-90** |
| "Open in new tab" on all entity links | Notion, Linear | P2 | **T-91** |
| Recent items list (last 10 entities viewed) | Linear (recent) | P2 | **T-92** |
| Global entity search (typeahead across contacts, companies, signals, campaigns, mandates) | Linear (search), Notion | P0 | **T-93** |

### 3.12 DATA INTEGRATION & EXPORT

**What's missing:**

| Gap | Reference | Severity | New Ticket |
|-----|-----------|----------|------------|
| CSV import (contacts bulk upload) | Every CRM | P1 | **T-94** |
| CSV export (contacts, pipeline, campaigns, signals) | Every CRM | P1 | **T-95** |
| PDF export (contact profile, mandate report, cluster report) | Greenhouse, Recruit CRM | P1 | **T-96** |
| MS Graph email sending (actual send, not just draft) | Wave 3 spec (exists but OAuth not configured) | P0 | **T-97** |
| Calendly integration (schedule from contact) | Calendly, HubSpot | P2 | **T-98** |
| LinkedIn data sync (pull profile data) | Recruit CRM | P3 | **T-99** |

---

## Part 4: Complete Ticket Inventory (V2)

### Summary

| Priority | Count | Dev-Days | Description |
|----------|-------|----------|-------------|
| **P0 — Critical** | 33 | ~55 | Core depth, connectivity, and context that Kevin explicitly asked for |
| **P1 — High** | 40 | ~62 | Workflow features, reporting, integrations |
| **P2 — Medium** | 20 | ~30 | Polish, automation, advanced features |
| **P3 — Low** | 6 | ~10 | Nice-to-have, future capabilities |
| **TOTAL** | **99** | **~157** | |

### P0 Tickets (Must-Have) — 33 tickets, ~55 dev-days

| ID | Ticket | Domain | Estimate |
|----|--------|--------|----------|
| T-01 | CV/Resume upload (drag-drop, PDF/DOCX) | Contact Depth | 2d |
| T-02 | Parsed CV display (experience, education, skills) | Contact Depth | 3d |
| T-09 | Signal → affected contacts drill-down | Signal Connectivity | 2d |
| T-10 | Company signals view (all signals per company) | Signal Connectivity | 2d |
| T-11 | Cluster signals (signals aggregated by cluster) | Signal Connectivity | 2d |
| T-12 | Signal → campaign suggestion (one-click) | Signal Connectivity | 2d |
| T-16 | Company Preview Panel (side panel) | Signal Connectivity | 2d |
| T-18 | Mandate entity (CRUD, DB migration) | Mandate Mgmt | 3d |
| T-19 | Mandate Dashboard (per-mandate view) | Mandate Mgmt | 3d |
| T-20 | Contact-to-Mandate assignment | Mandate Mgmt | 2d |
| T-21 | Mandate pipeline stages | Mandate Mgmt | 2d |
| T-28 | Meeting transcript upload | Meeting Mgmt | 2d |
| T-29 | AI meeting summarizer | Meeting Mgmt | 3d |
| T-31 | Meeting ↔ Contact association | Meeting Mgmt | 1d |
| T-37 | Assessment Dashboard (per-contact diagnostics) | Assessment | 3d |
| T-44 | Campaign context in email composer | Email Context | 1d |
| T-45 | Activity history in email composer | Email Context | 1d |
| T-46 | Signal context in email composer | Email Context | 1d |
| T-51 | Full profile sneak-peek in email composer | Email Context | 2d |
| T-53 | AI email with FULL context (all signals, activities, pipeline, campaign, cluster) | Email Context | 3d |
| T-54 | Pipeline inline editing | Pipeline | 2d |
| T-63 | Table density overhaul (Notion-style) | Design Craft | 3d |
| T-64 | Micro-interactions & animations | Design Craft | 2d |
| T-65 | Loading skeletons everywhere | Design Craft | 2d |
| T-75 | Mandate status report (AI-generated) | Reporting | 2d |
| T-80 | Mailing list management | Campaigns | 3d |
| T-93 | Global entity search (typeahead) | Navigation | 3d |
| T-97 | MS Graph email sending (actual send) | Integration | 3d |
| T-06 | Experience timeline visualization | Contact Depth | 2d |
| T-27 | Unassigned contacts view | Mandate Mgmt | 1d |
| T-60 | Pipeline drag-and-drop auto-log | Pipeline | 2d |
| T-69 | Command palette enhancement | Navigation | 2d |
| T-90 | Breadcrumb navigation | Navigation | 1d |

### P1 Tickets — 40 tickets, ~62 dev-days

| ID | Ticket | Domain | Estimate |
|----|--------|--------|----------|
| T-03 | AI CV generation from VISTA data | Contact Depth | 2d |
| T-05 | File attachment management | Contact Depth | 2d |
| T-13 | Signal → activity auto-creation | Signal Connectivity | 1d |
| T-14 | Signal correlation analysis | Signal Connectivity | 2d |
| T-15 | Signal timeline per company | Signal Connectivity | 1d |
| T-17 | Signal Preview Panel | Signal Connectivity | 2d |
| T-22 | Mandate status report generator (AI) | Mandate Mgmt | 2d |
| T-23 | Mandate timeline (cross-contact) | Mandate Mgmt | 2d |
| T-24 | Visual contact ↔ mandate mapping | Mandate Mgmt | 3d |
| T-30 | Auto-create activities from meeting actions | Meeting Mgmt | 2d |
| T-32 | Meeting ↔ Campaign association | Meeting Mgmt | 1d |
| T-33 | Meeting calendar view | Meeting Mgmt | 2d |
| T-34 | Meeting notes template (structured) | Meeting Mgmt | 1d |
| T-38 | Score trend tracking (over time) | Assessment | 2d |
| T-39 | Comparative assessment (side-by-side) | Assessment | 2d |
| T-40 | AI assessment narrative | Assessment | 2d |
| T-42 | Diagnostic alerts | Assessment | 1d |
| T-43 | Batch assessment UI | Assessment | 1d |
| T-47 | Pipeline context in email composer | Email Context | 1d |
| T-48 | Cluster context in email composer | Email Context | 1d |
| T-49 | Meeting context in email composer | Email Context | 1d |
| T-52 | Email template variable insertion | Email Context | 2d |
| T-55 | Deal/mandate value on pipeline cards | Pipeline | 1d |
| T-56 | Pipeline velocity metrics | Pipeline | 2d |
| T-57 | Filter within pipeline columns | Pipeline | 1d |
| T-58 | Pipeline list view toggle | Pipeline | 1d |
| T-59 | Pipeline bulk stage change | Pipeline | 1d |
| T-66 | Empty states with illustration + CTA | Design Craft | 2d |
| T-67 | Sidebar polish | Design Craft | 1d |
| T-68 | Button/form redesign | Design Craft | 2d |
| T-76 | Mandate health dashboard | Reporting | 2d |
| T-77 | Export reports as PDF | Reporting | 2d |
| T-81 | Per-contact status in campaign | Campaigns | 2d |
| T-82 | Campaign templates | Campaigns | 2d |
| T-83 | Schedule send | Campaigns | 1d |
| T-84 | Campaign performance analytics | Campaigns | 2d |
| T-88 | Cluster Preview Panel | Navigation | 2d |
| T-89 | Campaign Preview Panel | Navigation | 2d |
| T-94 | CSV import (contacts) | Integration | 2d |
| T-95 | CSV export (all entities) | Integration | 2d |
| T-96 | PDF export (profiles, reports) | Integration | 2d |

### P2 Tickets — 20 tickets, ~30 dev-days

| ID | Ticket | Domain | Estimate |
|----|--------|--------|----------|
| T-04 | CV export as PDF | Contact Depth | 1d |
| T-07 | Skills/competency tags | Contact Depth | 1d |
| T-08 | Contact completeness indicator | Contact Depth | 1d |
| T-25 | Mandate metrics (time-to-fill) | Mandate Mgmt | 2d |
| T-26 | Mandate templates | Mandate Mgmt | 1d |
| T-35 | Audio/video transcription | Meeting Mgmt | 3d |
| T-36 | Meeting full-text search | Meeting Mgmt | 1d |
| T-41 | Assessment templates | Assessment | 2d |
| T-50 | Related contacts in email composer | Email Context | 1d |
| T-61 | Stage-specific required fields | Pipeline | 2d |
| T-62 | Pipeline forecast | Pipeline | 2d |
| T-70 | Keyboard navigation | Design Craft | 3d |
| T-71 | Drag-to-select ranges | Design Craft | 2d |
| T-72 | Responsive mobile layout | Design Craft | 4d |
| T-73 | Dark mode toggle | Design Craft | 2d |
| T-74 | Notification system | Design Craft | 4d |
| T-78 | Scheduled reports | Reporting | 2d |
| T-79 | Cross-mandate summary | Reporting | 2d |
| T-85 | Drip sequence automation | Campaigns | 3d |
| T-86 | Newsletter builder | Campaigns | 4d |

### P3 Tickets — 6 tickets, ~10 dev-days

| ID | Ticket | Domain | Estimate |
|----|--------|--------|----------|
| T-87 | A/B testing | Campaigns | 3d |
| T-91 | Open in new tab | Navigation | 1d |
| T-92 | Recent items list | Navigation | 1d |
| T-98 | Calendly integration | Integration | 2d |
| T-99 | LinkedIn data sync | Integration | 5d |
| T-100 | Multi-user support | Platform | 4d |

---

## Part 5: New Specs Required

The following specs need to be written before implementation begins:

| Spec | Covers Tickets | Priority |
|------|---------------|----------|
| **S1: Mandate Management Spec** | T-18 through T-27, T-75, T-76 | P0 |
| **S2: Meeting Transcript Spec** | T-28 through T-36 | P0 |
| **S3: CV/Resume Management Spec** | T-01 through T-08 | P0 |
| **S4: Assessment & Diagnostics Spec** | T-37 through T-43 | P1 |
| **S5: Signal Cross-Connectivity Spec** | T-09 through T-17 | P0 |
| **S6: Global Context System Spec** | T-44 through T-53, T-88, T-89 | P0 |
| **S7: Design Craft Spec** | T-63 through T-74 | P0 |
| **S8: Pipeline Enhancement Spec** | T-54 through T-62 | P1 |
| **S9: Reporting Spec (V2)** | T-75 through T-79 | P1 |
| **S10: Campaign Enhancement Spec** | T-80 through T-87 | P1 |

---

## Part 6: Proposed Execution Waves (V2)

### Wave 2 — Context & Connectivity (2 weeks)
> Make every entity clickable, every action context-aware

| # | Ticket | Est |
|---|--------|-----|
| 1 | T-16: Company Preview Panel | 2d |
| 2 | T-09: Signal → affected contacts | 2d |
| 3 | T-10: Company signals view | 2d |
| 4 | T-44: Campaign context in email | 1d |
| 5 | T-45: Activity history in email | 1d |
| 6 | T-46: Signal context in email | 1d |
| 7 | T-51: Full profile sneak-peek in email | 2d |
| 8 | T-53: AI email with FULL context | 3d |
| 9 | T-93: Global entity search | 3d |
| | **Wave 2 Total** | **~17d** |

### Wave 3 — Mandate Management (2 weeks)
> Entirely new entity + dashboard + mapping

| # | Ticket | Est |
|---|--------|-----|
| 1 | T-18: Mandate entity | 3d |
| 2 | T-19: Mandate Dashboard | 3d |
| 3 | T-20: Contact-to-Mandate assignment | 2d |
| 4 | T-21: Mandate pipeline stages | 2d |
| 5 | T-27: Unassigned contacts view | 1d |
| 6 | T-75: Mandate status report | 2d |
| | **Wave 3 Total** | **~13d** |

### Wave 4 — Meeting & CV Management (2 weeks)
> Full document lifecycle

| # | Ticket | Est |
|---|--------|-----|
| 1 | T-01: CV upload | 2d |
| 2 | T-02: Parsed CV display | 3d |
| 3 | T-06: Experience timeline | 2d |
| 4 | T-28: Meeting transcript upload | 2d |
| 5 | T-29: AI meeting summarizer | 3d |
| 6 | T-31: Meeting ↔ Contact association | 1d |
| | **Wave 4 Total** | **~13d** |

### Wave 5 — Pipeline & Assessment (2 weeks)
> Pipeline feels like Greenhouse, assessment feels like a diagnostics tool

| # | Ticket | Est |
|---|--------|-----|
| 1 | T-54: Pipeline inline editing | 2d |
| 2 | T-60: Pipeline drag-and-drop auto-log | 2d |
| 3 | T-37: Assessment Dashboard | 3d |
| 4 | T-38: Score trend tracking | 2d |
| 5 | T-40: AI assessment narrative | 2d |
| 6 | T-42: Diagnostic alerts | 1d |
| | **Wave 5 Total** | **~12d** |

### Wave 6 — Design Craft (2 weeks)
> The "no more clunkiness" wave

| # | Ticket | Est |
|---|--------|-----|
| 1 | T-63: Table density overhaul | 3d |
| 2 | T-64: Micro-interactions | 2d |
| 3 | T-65: Loading skeletons | 2d |
| 4 | T-66: Empty states | 2d |
| 5 | T-67: Sidebar polish | 1d |
| 6 | T-68: Button/form redesign | 2d |
| 7 | T-69: Command palette | 2d |
| 8 | T-90: Breadcrumb navigation | 1d |
| | **Wave 6 Total** | **~15d** |

### Wave 7 — Campaign & Integration (2 weeks)
> Mailist management, email sending, export

| # | Ticket | Est |
|---|--------|-----|
| 1 | T-80: Mailing list management | 3d |
| 2 | T-97: MS Graph email sending | 3d |
| 3 | T-95: CSV export | 2d |
| 4 | T-96: PDF export | 2d |
| 5 | T-81: Per-contact campaign tracking | 2d |
| 6 | T-84: Campaign analytics | 2d |
| | **Wave 7 Total** | **~14d** |

---

## Part 7: Database Schema Changes Required

```sql
-- Mandates (NEW)
vista_mandates (
  id UUID PK,
  name TEXT NOT NULL,
  client_company TEXT,
  status TEXT DEFAULT 'Active',  -- Active, Sourcing, Shortlist, Interview, Offer, Placed, Closed
  description TEXT,
  deadline DATE,
  deal_value NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

vista_mandate_contacts (
  mandate_id UUID FK,
  contact_id UUID FK,
  role_in_mandate TEXT,  -- 'Candidate', 'Hiring Manager', 'Stakeholder', 'Referral'
  mandate_stage TEXT,    -- Per-contact stage within mandate
  assigned_at TIMESTAMPTZ,
  PRIMARY KEY (mandate_id, contact_id)
)

-- Meetings (NEW)
vista_meetings (
  id UUID PK,
  title TEXT,
  meeting_date TIMESTAMPTZ,
  duration_minutes INT,
  transcript_text TEXT,
  ai_summary TEXT,
  action_items JSONB,     -- [{text, assignee, due_date, completed}]
  attendees JSONB,        -- [{contact_id, name, role}]
  campaign_id UUID FK,
  mandate_id UUID FK,
  created_at TIMESTAMPTZ
)

-- CV Data (NEW)
vista_cv_data (
  id UUID PK,
  contact_id UUID FK,
  parsed_data JSONB,      -- {experience[], education[], skills[], certifications[], languages[]}
  raw_file_path TEXT,
  file_type TEXT,         -- pdf, docx, txt
  uploaded_at TIMESTAMPTZ,
  parsed_at TIMESTAMPTZ
)

-- Mailing Lists (NEW)
vista_mailing_lists (
  id UUID PK,
  name TEXT NOT NULL,
  description TEXT,
  cluster_id UUID FK,
  contact_count INT DEFAULT 0,
  created_at TIMESTAMPTZ
)

vista_mailing_list_contacts (
  list_id UUID FK,
  contact_id UUID FK,
  added_at TIMESTAMPTZ,
  PRIMARY KEY (list_id, contact_id)
)

-- Score History (for trend tracking)
vista_score_history (
  id UUID PK,
  contact_id UUID FK,
  vista_v NUMERIC,
  vista_i NUMERIC,
  vista_s NUMERIC,
  vista_t NUMERIC,
  vista_a NUMERIC,
  vista_composite NUMERIC,
  scored_at TIMESTAMPTZ
)
```

---

## Part 8: New Reusable Components Needed

| Component | Used On | Ticket |
|-----------|---------|--------|
| `<CompanyPreviewPanel>` | Everywhere company name appears | T-16 |
| `<SignalPreviewPanel>` | Signal references | T-17 |
| `<ClusterPreviewPanel>` | Cluster references | T-88 |
| `<CampaignPreviewPanel>` | Campaign references | T-89 |
| `<CVViewer>` | Contact detail | T-02 |
| `<CVUpload>` | Contact detail | T-01 |
| `<ExperienceTimeline>` | Contact detail | T-06 |
| `<MeetingTranscriptViewer>` | Meeting detail | T-28 |
| `<MeetingSummarizer>` | Meeting detail | T-29 |
| `<AssessmentDashboard>` | Contact detail, new page | T-37 |
| `<ScoreTrendChart>` | Assessment, Contact detail | T-38 |
| `<MandateCard>` | Mandate list, Dashboard | T-19 |
| `<MandateTimeline>` | Mandate detail | T-23 |
| `<MandateMapping>` | Mapping page | T-24 |
| `<MailingListManager>` | Campaigns page | T-80 |
| `<GlobalSearchBar>` | Header | T-93 |
| `<BreadcrumbNav>` | All pages | T-90 |
| `<SkeletonLoader>` | All pages | T-65 |
| `<EmptyState>` | All pages | T-66 |

---

## Summary Statistics

| Metric | V1 (Previous) | V2 (This Doc) | Delta |
|--------|---------------|---------------|-------|
| Total Tickets | 47 | 100 | +53 |
| New Epics/Domains | 9 | 12 | +3 |
| New DB Tables | 7 | 13 | +6 |
| New Components | 11 | 19 | +8 |
| New Specs Required | 0 | 10 | +10 |
| P0 Tickets | 10 | 33 | +23 |
| Total Dev-Days | ~130 | ~157 | +27 |
| Execution Waves | 4 | 7 | +3 |

---

*This is the single source of truth for VISTA's complete feature backlog. Each spec (S1-S10) should be written as a standalone document before its associated wave begins. Each ticket should become a Notion card with acceptance criteria.*
