# VISTA — Master Specification & Ticket Index

> **Complete platform spec + all tickets in one document**
> Generated: 2026-07-11 | Updated: 2026-07-12 | Total: 524 tickets across 7 versions

---

## Document Index

| Document | Size | Description |
|---|---|---|
| [V1 Gap Analysis](VISTA_GAP_ANALYSIS_AND_TICKETS.md) | 36KB | Original 51 tickets — UX completion, visual design, dashboard |
| [V2 Gap Analysis](VISTA_V2_GAP_ANALYSIS.md) | 35KB | 100 tickets (T-01→T-100) — CV upload, search, filtering, export, integrations |
| [V3 Exhaustive Feature Map](VISTA_V3_EXHAUSTIVE_FEATURE_MAP.md) | 55KB | 193 tickets (T-101→T-293) — 20 domains, 16 portals, full feature coverage |
| [V4 Action-Pushing Platform](VISTA_V4_ACTION_PUSHING_PLATFORM.md) | 29KB | 89 tickets (T-294→T-382) — intelligence, gamification, kanban, auto-push |
| [V5 Backend Wiring Gap](VISTA_V5_BACKEND_WIRING_GAP.md) | 36KB | 17 missing tables identified, full migration SQL |
| [Wave 1.5 Funnel Core Spec](spec_wave1.5_funnel_core.md) | 21KB | 8 tickets (F-01→F-08) — outreach engine, scoring, nurture router |
| [Master Frontend Spec](VISTA_MASTER_FRONTEND_SPEC.md) | 27KB | Complete frontend architecture, design tokens, component library |
| [UX Completion Spec](VISTA_UX_COMPLETION_SPEC.md) | 26KB | UX patterns, responsive design, accessibility |
| [Intelligence Layer Spec](INTELLIGENCE_LAYER_SPEC.md) | 20KB | AI agent architecture, signal processing |
| [Wave 1.6 Revenue OS Spec](spec_wave1.6_revenue_os.md) | 30KB | 20 tickets (R-01→R-20) — pricing architecture, tiered funnel, cross-sell, content attribution |
| [Wave 1.7 B2C Portal Spec](spec_wave1.7_b2c_portal.md) | 40KB | 25 tickets (BC-01→BC-25) — B2C auth, chat engine, credits, assessments, upgrade paths |

---

## Complete Ticket Inventory

### V1 — Original Gap Analysis (51 tickets)

| # | Ticket | Epic | Estimate |
|---|---|---|---|
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

| # | Ticket | Epic | Estimate |
|---|---|---|---|
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

| # | Ticket | Epic | Estimate |
|---|---|---|---|
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

| # | Ticket | Epic | Estimate |
|---|---|---|---|
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

### V2 — Gap Analysis (100 tickets: T-01 to T-100)

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
| T-87 | A/B testing | Campaigns | 3d |
| T-91 | Open in new tab | Navigation | 1d |
| T-92 | Recent items list | Navigation | 1d |
| T-98 | Calendly integration | Integration | 2d |
| T-99 | LinkedIn data sync | Integration | 5d |
| T-100 | Multi-user support | Platform | 4d |
| ID | Ticket | Domain | Estimate |
|---|---|---|---|
| ID | Ticket | Domain | Estimate |
|---|---|---|---|
| ID | Ticket | Domain | Estimate |
|---|---|---|---|
| ID | Ticket | Domain | Estimate |
|---|---|---|---|
| ID | Ticket | Domain | Estimate |
|---|---|---|---|
| ID | Ticket | Domain | Estimate |
|---|---|---|---|

---

### V3 — Exhaustive Feature Map (193 tickets: T-101 to T-293)

| Tickets | 100 | **200** |
| # | Feature | Description | Reference | Priority | Ticket |
| F-01 | Real-time KPI Widgets | Auto-refreshing KPIs (contacts, signals, pipeline value, campaign reach) with sparklines showing 7/30/90-day trends | Salesforce Lightning Dashboard | P0 | T-101 |
| F-02 | Today's Command Center | "What to do today" widget — prioritized list of follow-ups, expiring tasks, hot signals, meeting prep | HubSpot Dashboard | P0 | T-102 |
| F-03 | Pipeline Velocity Chart | Rate at which contacts move through pipeline stages, with trend lines | Salesforce Forecasting | P1 | T-103 |
| F-04 | Revenue Forecast Widget | Probability-weighted revenue forecast based on pipeline stage probabilities | HubSpot Revenue Forecasting | P1 | T-104 |
| F-05 | Activity Heatmap | Calendar-style heatmap showing interaction density over time (like GitHub contribution graph) | GitHub Activity Graph | P1 | T-105 |
| F-06 | Signal Alert Ticker | Real-time scrolling ticker of new signals detected, with severity color coding | Bloomberg Terminal | P0 | T-106 |
| F-07 | Meeting Prep Widget | "Your next meeting is with X — here's their profile, last activity, and key signals" | Calendly + CRM integration | P0 | T-107 |
| F-08 | Campaign Performance Summary | Mini dashboard showing active campaign metrics (open rate, response rate, conversion) | HubSpot Campaign Dashboard | P1 | T-108 |
| F-09 | Contact Engagement Score Trend | Aggregate engagement score trend across all contacts | Salesforce Engagement Score | P2 | T-109 |
| F-10 | Cluster Health Overview | Traffic-light view of all cluster health scores | Recruit CRM Dashboard | P1 | T-110 |
| F-11 | Mandate Pipeline Widget | Active mandates with stage progress, matching scores, days open | Greenhouse Dashboard | P0 | T-111 |
| F-12 | Quick Create Widget | One-click create: new contact, new mandate, log activity, compose email | Notion Quick Create | P1 | T-112 |
| F-13 | Team Activity Feed | What teammates are doing (if multi-user) — logged calls, sent emails, updated contacts | Salesforce Chatter | P2 | T-113 |
| F-14 | Goal Tracking Widget | Monthly/quarterly BD goals vs. actual (contacts added, meetings held, proposals sent) | HubSpot Goals | P2 | T-114 |
| F-15 | Three-Platform Status | Health/status indicator for VISTA ↔ Wave ↔ DEX connections | Status page widget | P1 | T-115 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-21 | Interaction Timeline | Chronological feed of all interactions (emails, calls, meetings, signals, activities) with filters by type | HubSpot Activity Timeline | P0 | T-116 |
| F-22 | Relationship Strength Meter | Visual gauge showing relationship strength based on interaction frequency, recency, depth | Salesforce Relationship Map | P1 | T-117 |
| F-23 | Organization Chart | Visual org chart showing this contact's position, peers, reports, manager — linked to other VISTA contacts | LinkedIn Org Chart | P1 | T-118 |
| F-24 | Duplicate Detection | AI-powered duplicate detection when creating/editing contacts, with merge suggestion | HubSpot Duplicate Detection | P2 | T-119 |
| F-25 | Contact Merge | Merge duplicate contacts — combine data, resolve conflicts, preserve history | Salesforce Contact Merge | P2 | T-120 |
| F-26 | Contact Lifetime Value | Computed metric: total interactions, deals influenced, revenue attributed, engagement score trend | N/A (new) | P2 | T-121 |
| F-27 | Referral Network Map | Visual map showing who referred whom, referral chains, network density | N/A (new) | P2 | T-122 |
| F-28 | Custom Fields per Contact | User-defined fields (e.g., "industry expertise", "preferred language", "dietary restrictions") | Salesforce Custom Fields | P1 | T-123 |
| F-29 | Contact Tags & Segments | Flexible tagging system for ad-hoc grouping and filtering beyond clusters | HubSpot Lists | P1 | T-124 |
| F-30 | Bulk Import/Export | CSV import with field mapping, CSV/Excel export with field selection | Recruit CRM Import | P1 | T-125 |
| F-31 | Role Change Detection | Alert when a contact changes company/title (detected via LinkedIn signals or manual update) | N/A (new) | P1 | T-126 |
| F-32 | Contact-to-Contact Linking | Manual or AI-suggested links between contacts (mentor, colleague, collaborator) | N/A (new) | P1 | T-127 |
| F-33 | Inbound Activity Feed | Dedicated tab showing all inbound signals: webinar attendance, newsletter reads, workshop requests, podcast listens, coaching requests | N/A (new) | P0 | T-128 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-34 | Company List Page | Dedicated `/companies` page with sortable table: name, industry, size, location, # contacts, VISTA score, pipeline value | Salesforce Accounts | P0 | T-129 |
| F-35 | Company Detail Page | Full company profile: overview, firmographics, contacts, signals, activities, pipeline, notes | Salesforce Account Detail | P0 | T-130 |
| F-36 | Company Firmographics | Industry, sub-industry, headcount, revenue, founding year, HQ location, website, stock ticker | HubSpot Company Record | P0 | T-131 |
| F-37 | Company Org Chart | Visual hierarchy of all contacts at this company, showing reporting lines | LinkedIn Company Page | P1 | T-132 |
| F-38 | Company Signals Timeline | All signals related to this company in chronological order, with AI summary | Salesforce Company News | P0 | T-133 |
| F-39 | Company-to-Cluster Mapping | Which clusters this company belongs to, with visual indicators | N/A (new) | P1 | T-134 |
| F-40 | Company Pipeline View | All deals/opportunities associated with this company | Salesforce Account Pipeline | P1 | T-135 |
| F-41 | Company Health Score | Composite score: contact engagement, signal frequency, pipeline health, relationship depth | HubSpot Account Health | P0 | T-136 |
| F-42 | Company Notes & Strategic Brief | Free-form notes + AI-generated strategic brief (strengths, risks, opportunities) | Salesforce Account Notes | P1 | T-137 |
| F-43 | Company Technology Stack | Detected or manual tech stack (useful for product/service recommendations) | BuiltWith integration | P2 | T-138 |
| F-44 | Company Funding/News Feed | Recent funding rounds, acquisitions, press releases, leadership changes | Crunchbase integration | P2 | T-139 |
| F-45 | Company Contact Affinity | Which contacts at this company are most engaged, most senior, most influential | N/A (new) | P1 | T-140 |
| F-46 | Account-Based Scoring | ABM-style scoring: firmographic fit + engagement level = account priority | Salesforce ABM | P1 | T-141 |
| F-47 | Company Preview Panel | Slide-out panel (like ContactPreviewPanel) when hovering over company names anywhere in the app | N/A (new) | P0 | T-016 (V2) |
| # | Feature | Description | Reference | Priority | Ticket |
| F-48 | Kanban Board View | Drag-and-drop Kanban board with columns for each stage, cards for each deal | Salesforce Kanban, HubSpot Deals | P0 | T-142 |
| F-49 | Deal Value Tracking | Monetary value per deal, probability-weighted forecast by stage | Salesforce Opportunity Amount | P0 | T-143 |
| F-50 | Stage Probability % | Configurable probability per stage (e.g., Proposal = 40%, Negotiation = 70%) | HubSpot Deal Stage Probability | P1 | T-144 |
| F-51 | Deal Velocity Metrics | Average days per stage, average total cycle time, velocity trend | Salesforce Path Pilot | P1 | T-145 |
| F-52 | Deal Health Indicator | Per-deal health: green/amber/red based on activity recency, stage duration, engagement | N/A (new) | P1 | T-146 |
| F-53 | Multiple Deals per Contact | One contact can have multiple active deals/mandates simultaneously | Salesforce Multiple Opportunities | P0 | T-147 |
| F-54 | Pipeline Forecasting | AI-powered forecast: expected close dates, revenue projection, confidence intervals | HubSpot Forecasting | P1 | T-148 |
| F-55 | Stage Automation Rules | Auto-advance stage when conditions met (e.g., proposal sent → Negotiation) | HubSpot Workflow Automation | P2 | T-149 |
| F-56 | Win/Loss Analysis | Track why deals were won or lost, with categorization and trend analysis | Salesforce Win/Loss | P2 | T-150 |
| F-57 | Pipeline Comparison | Compare pipeline snapshots over time (this month vs. last month) | N/A (new) | P2 | T-151 |
| F-58 | Deal Team Assignment | Assign multiple team members to a deal (owner, support, executive sponsor) | Salesforce Opportunity Team | P1 | T-152 |
| F-59 | Pipeline Intelligence Panel | AI-generated insights about pipeline: bottlenecks, at-risk deals, acceleration opportunities | N/A (new) | P0 | T-054 (V2) |
| # | Feature | Description | Reference | Priority | Ticket |
| F-60 | Custom Signal Definitions | User-defined signal rules (e.g., "contact opened 3+ emails" = engagement signal) | HubSpot Custom Events | P1 | T-153 |
| F-61 | Signal Urgency/Decay Scoring | Signals lose urgency over time — visual decay curve with actionable window indicator | N/A (new) | P1 | T-009 (V2) |
| F-62 | Signal-to-Contact Heatmap | Matrix view: which contacts are generating the most signals, by type and time | N/A (new) | P1 | T-010 (V2) |
| F-63 | Company Signal Aggregation | Roll up individual contact signals to company level — see the "company narrative" | Salesforce Company News | P0 | T-011 (V2) |
| F-64 | Signal Anomaly Detection | Alert when signal volume spikes abnormally for a contact/company/cluster | N/A (new) | P2 | T-154 |
| F-65 | Signal-to-Action Suggestions | AI recommends next actions based on signal patterns (e.g., "3 positive signals → suggest meeting") | N/A (new) | P0 | T-013 (V2) |
| F-66 | Inbound Activity Signals | Track: webinar attendance, newsletter subscription/read, workshop requests, podcast invitations, coaching requests — as signal sources | N/A (new) | P0 | T-155 |
| F-67 | Signal Correlation Engine | Cross-reference signals across entities — "Contact A's signal X correlates with Company B's signal Y" | N/A (new) | P0 | T-015 (V2) |
| F-68 | Signal Export/Push to Wave | Push relevant signals to Wave for campaign planning | N/A (new) | P1 | T-156 |
| F-69 | Signal Lifecycle Management | Signal states: detected → acknowledged → acted upon → resolved. Prevent signal fatigue | N/A (new) | P2 | T-157 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-70 | A/B Testing | Test subject lines, content variants, send times — with statistical significance tracking | HubSpot A/B Testing | P1 | T-158 |
| F-71 | Email Template Library | Reusable email templates with merge fields, categorized by purpose (intro, follow-up, nurture) | Salesforce Email Templates | P1 | T-159 |
| F-72 | Multi-Channel Journey Builder | Visual flow builder: email → wait 3 days → LinkedIn → wait 1 week → call. With branching logic | HubSpot Customer Journeys | P0 | T-160 |
| F-73 | Campaign ROI Attribution | Track which campaigns led to pipeline progression, meetings booked, deals closed | HubSpot Campaign ROI | P1 | T-161 |
| F-74 | Drip Campaign Automation | Automated sequential touch sequences with conditional logic | HubSpot Drip Automation | P1 | T-162 |
| F-75 | Campaign Analytics Dashboard | Open rates, click rates, response rates, conversion rates, per-touch performance | HubSpot Campaign Analytics | P0 | T-163 |
| F-76 | Segmentation Engine | Dynamic audience segmentation based on contact properties, signals, behaviors, cluster membership | HubSpot Smart Lists | P0 | T-164 |
| F-77 | Content Block Library | Reusable content blocks (intros, value props, CTAs) that can be assembled into campaigns | Notion Content Blocks | P2 | T-165 |
| F-78 | Send Time Optimization | AI recommends optimal send times based on recipient's past engagement patterns | HubSpot Send Time Optimization | P2 | T-166 |
| F-79 | Campaign-to-Mandate Linking | Connect campaigns to mandates — see which campaigns support which mandates | N/A (new) | P1 | T-167 |
| F-80 | Campaign Approval Workflow | Draft → Review → Approve → Send workflow with reviewer comments | Salesforce Campaign Approval | P2 | T-168 |
| F-81 | Campaign Performance Comparison | Compare campaign performance over time, against benchmarks, across segments | N/A (new) | P2 | T-169 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-82 | Cluster Analytics Dashboard | Contact count trend, signal density, pipeline value, engagement rate per cluster | N/A (new) | P1 | T-170 |
| F-83 | Cluster Benchmarking | Compare clusters against each other on key metrics (engagement, pipeline, signals) | N/A (new) | P2 | T-171 |
| F-84 | Cluster Health Monitoring | Composite health score per cluster with trend, drill-down to unhealthy contacts | N/A (new) | P1 | T-172 |
| F-85 | Geographic/Industry Heatmap | Visual map showing cluster distribution by geography and industry | Salesforce Territory Mapping | P2 | T-173 |
| F-86 | Cluster Trend Analysis | Is the cluster growing, shrinking, or stable? Signal trend, contact additions, engagement changes | N/A (new) | P2 | T-174 |
| F-87 | TAM per Cluster | Total Addressable Market estimation per cluster (how many more contacts/companies could be in this cluster) | N/A (new) | P2 | T-175 |
| F-88 | Cluster-to-Campaign Linking | Which campaigns target this cluster? Performance of campaigns per cluster | N/A (new) | P1 | T-176 |
| F-89 | Cluster AI Recommendations | AI suggests actions to improve cluster health: "Add more senior contacts", "Increase signal monitoring" | N/A (new) | P1 | T-177 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-90 | Calendar Integration | Two-way sync with Google Calendar / Outlook — meetings auto-appear as activities | HubSpot Calendar Sync | P0 | T-178 |
| F-91 | Follow-Up Reminder Engine | Auto-generate follow-up tasks after interactions. "You emailed X 3 days ago — follow up?" | HubSpot Tasks | P0 | T-179 |
| F-92 | Task Management | Full task system: assign, due date, priority, status, dependencies | Linear Task Management | P1 | T-180 |
| F-93 | Activity Type Taxonomy | Extended activity types: call, email, meeting, LinkedIn message, note, task, webinar, workshop, podcast | Salesforce Activity Types | P1 | T-181 |
| F-94 | Recurring Activity Templates | Template for recurring activities (weekly check-in, monthly review) | N/A (new) | P2 | T-182 |
| F-95 | Activity Search & Filters | Full-text search across all activities, advanced filters by type/date/contact/company | HubSpot Activity Search | P1 | T-183 |
| F-96 | Activity-to-Signal Linking | Activities generate signals (e.g., "meeting held" = positive engagement signal) | N/A (new) | P1 | T-184 |
| F-97 | Meeting Scheduler | Embedded scheduling link (like Calendly) for each contact/mandate | Calendly Integration | P1 | T-185 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-98 | Mandate List Page | `/mandates` — table view: name, company, status, # candidates, days open, match score | Greenhouse Jobs | P0 | T-018 (V2) |
| F-99 | Mandate Detail Page | Full mandate view: requirements, matched candidates, stage pipeline, team, notes | Greenhouse Job Detail | P0 | T-019 (V2) |
| F-100 | Mandate Creation Wizard | Step-by-step: define role, requirements (must-have/nice-to-have skills), seniority, location, compensation range | Greenhouse Create Job | P0 | T-020 (V2) |
| F-101 | Contact-to-Mandate Matching | AI-powered matching: score all contacts against mandate requirements, rank by fit | Greenhouse Candidate Ranking | P0 | T-021 (V2) |
| F-102 | Mandate Pipeline | Kanban view of candidates per mandate: Sourced → Screened → Interviewing → Offered → Placed | Greenhouse Pipeline | P0 | T-022 (V2) |
| F-103 | Mandate Status Tracking | Stage progression with timestamps, SLA tracking, overdue alerts | Greenhouse Stage Tracking | P0 | T-023 (V2) |
| F-104 | Mandate Team Assignment | Assign hiring manager, recruiters, interviewers to each mandate | Greenhouse Scorecard | P1 | T-024 (V2) |
| F-105 | Mandate-to-Contact Linking | Bidirectional link: mandate shows candidates, contact shows mandates they're matched to | N/A (new) | P0 | T-025 (V2) |
| F-106 | Mandate Analytics | Time-to-fill, candidate quality distribution, source effectiveness, bottleneck stages | Greenhouse Analytics | P1 | T-026 (V2) |
| F-107 | Mandate Templates | Reusable mandate templates for recurring role types | N/A (new) | P2 | T-027 (V2) |
| F-108 | Mandate-to-DEX Sync | Sync mandate data with DEX AI for consultant/candidate management | N/A (new) | P0 | T-186 |
| F-109 | Mandate Status Report | Auto-generated status report per mandate: progress, blockers, recommendations | N/A (new) | P1 | T-075 (V2) |
| # | Feature | Description | Reference | Priority | Ticket |
| F-110 | Meeting List Page | `/meetings` — table: date, title, attendees, duration, type, status, actions pending | N/A (new) | P0 | T-028 (V2) |
| F-111 | Meeting Detail Page | Full meeting view: transcript, summary, action items, follow-ups, recording link | N/A (new) | P0 | T-029 (V2) |
| F-112 | Transcript Upload/Paste | Upload transcript file (TXT/SRT/VTT) or paste raw transcript text | Otter.ai Import | P0 | T-030 (V2) |
| F-113 | AI Meeting Summary | AI-generated summary: key decisions, discussion points, sentiment, action items | Otter.ai Summary | P0 | T-031 (V2) |
| F-114 | Action Item Extraction | AI extracts action items with owners, deadlines, priority — auto-creates tasks | Fireflies.ai Actions | P0 | T-032 (V2) |
| F-115 | Follow-Up Automation | Auto-generate follow-up emails/tasks from meeting outcomes | N/A (new) | P1 | T-033 (V2) |
| F-116 | Meeting-to-Contact Linking | Meetings linked to all attendee contacts — appears in their activity timeline | N/A (new) | P0 | T-034 (V2) |
| F-117 | Meeting Search | Full-text search across transcripts, with keyword highlighting | N/A (new) | P1 | T-035 (V2) |
| F-118 | Meeting Templates | Templates for different meeting types: discovery call, pitch, interview, review | N/A (new) | P2 | T-036 (V2) |
| F-119 | Meeting Analytics | Meeting frequency, duration trends, action completion rate, outcome distribution | N/A (new) | P2 | T-187 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-120 | Assessment List Page | `/assessment` — catalog of available assessment types and diagnostic tools | N/A (new) | P0 | T-037 (V2) |
| F-121 | Assessment Builder | Create custom assessments: questions, scoring logic, result categories | SurveyMonkey Builder | P1 | T-038 (V2) |
| F-122 | Diagnostic Tool Library | Pre-built diagnostic frameworks: needs assessment, maturity model, readiness check | N/A (new) | P0 | T-039 (V2) |
| F-123 | Assessment Scoring Engine | Configurable scoring with weighted factors, thresholds, result bands | N/A (new) | P1 | T-040 (V2) |
| F-124 | Benchmarking Data | Industry/function benchmarks for comparison ("your score vs. industry average") | N/A (new) | P1 | T-041 (V2) |
| F-125 | Assessment Report Generation | Auto-generate professional PDF reports with charts, findings, recommendations | N/A (new) | P0 | T-042 (V2) |
| F-126 | Historical Comparison | Compare assessment results over time — track improvement/regression | N/A (new) | P1 | T-043 (V2) |
| F-127 | Product-Market Fit Scoring | Specific diagnostic: score how well our products/services match a contact/company's needs | N/A (new) | P0 | T-188 |
| F-128 | Needs Assessment Matrix | Map contact/company needs against our capabilities — identify gaps and opportunities | N/A (new) | P0 | T-189 |
| F-129 | Assessment-to-Proposal Link | Assessment results feed into proposal generation — "based on your diagnostic, we recommend..." | N/A (new) | P0 | T-190 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-130 | Unified Inbox | `/communications` — all messages across email, LinkedIn, phone notes in one feed | HubSpot Conversations | P0 | T-191 |
| F-131 | Email Thread View | Full email thread display with inline reply (like Gmail) | Gmail Thread View | P0 | T-192 |
| F-132 | Communication Timeline per Contact | All communications with a specific contact, in chronological order, filterable by channel | HubSpot Conversation Timeline | P0 | T-193 |
| F-133 | Unread/Unresponded Tracker | Highlight communications that need response — with aging indicators | HubSpot Missed Conversations | P1 | T-194 |
| F-134 | Communication Templates | Quick-reply templates for common communication patterns | Salesforce Quick Text | P1 | T-195 |
| F-135 | LinkedIn Message Integration | Track LinkedIn messages as part of communication history (manual logging or API) | N/A (new) | P2 | T-196 |
| F-136 | Phone Call Logging | Log call notes, duration, outcome after phone conversations | HubSpot Call Logging | P1 | T-197 |
| F-137 | Communication Analytics | Response time trends, channel preference by contact, communication volume over time | N/A (new) | P2 | T-198 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-138 | Product/Service Catalog | `/products` — list of all offerings: advisory services, assessments, workshops, webinars, coaching programs, podcasts, newsletters | N/A (new) | P0 | T-199 |
| F-139 | Product Detail Pages | Each product: description, target audience, pricing tier, delivery format, related products | N/A (new) | P0 | T-200 |
| F-140 | Signal-to-Product Mapping | AI maps detected signals to relevant products ("contact shows signal X → they need product Y") | N/A (new) | P0 | T-201 |
| F-141 | Product Recommendation Engine | For each contact/company, recommend the most relevant products based on their profile, signals, and needs | N/A (new) | P0 | T-202 |
| F-142 | Service-to-Cluster Fit | Which services/products are most relevant to each cluster? | N/A (new) | P1 | T-203 |
| F-143 | Proposal Generator | AI generates proposals combining: client needs + signal analysis + product mapping + pricing | N/A (new) | P0 | T-204 |
| F-144 | Presentation Deck Generator | AI generates presentation decks based on product selection and client context | N/A (new) | P1 | T-205 |
| F-145 | Product Performance Tracking | Which products are most in-demand, most proposed, most converted? | N/A (new) | P2 | T-206 |
| F-146 | Webinar/Workshop Management | Manage upcoming events, track registrations (linked to Wave), attendee engagement | N/A (new) | P1 | T-207 |
| F-147 | Content Library | Newsletter issues, podcast episodes, coaching materials — linked to products and trackable by engagement | N/A (new) | P1 | T-208 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-148 | Project List Page | `/projects` — active projects with status, health, owner, deadline | Linear Projects | P1 | T-076 (V2) |
| F-149 | Project Detail Page | Milestones, deliverables, team, timeline, budget, status updates | Linear Project Detail | P1 | T-077 (V2) |
| F-150 | Project Status Report Generator | AI-generated status reports: progress, blockers, next steps, risk assessment | N/A (new) | P0 | T-078 (V2) |
| F-151 | Project-to-Mandate Linking | Projects linked to mandates — see which projects support which mandates | N/A (new) | P1 | T-079 (V2) |
| F-152 | Project Timeline/Gantt | Visual timeline with milestones and dependencies | Linear Timeline | P2 | T-209 |
| F-153 | Project Dashboard | Aggregate view: all projects, health distribution, resource allocation | N/A (new) | P1 | T-210 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-154 | Reports Hub Page | `/reports` — centralized location for all reports, organized by type | Salesforce Reports | P1 | T-211 |
| F-155 | Custom Report Builder | Build custom reports: select entity, fields, filters, groupings, chart type | HubSpot Report Builder | P2 | T-212 |
| F-156 | Scheduled Report Generation | Auto-generate and email reports on schedule (daily/weekly/monthly) | Salesforce Scheduled Reports | P1 | T-213 |
| F-157 | Report Templates | Pre-built templates: Weekly Pipeline Review, Monthly BD Summary, Cluster Health, Signal Digest | N/A (new) | P1 | T-214 |
| F-158 | Comparative Analytics | Compare periods (MoM, QoQ, YoY) across all metrics | N/A (new) | P2 | T-215 |
| F-159 | Executive Summary Generator | AI generates executive summary from data — "here's what happened this week" | N/A (new) | P0 | T-216 |
| F-160 | Report Export (PDF/Excel/PPTX) | Export reports in multiple formats for distribution | Salesforce Report Export | P1 | T-217 |
| F-161 | Shared Reports | Share reports with team members via link | N/A (new) | P2 | T-218 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-162 | Integrations Page | `/integrations` — catalog of connected systems, connection status, sync health | HubSpot Integrations | P1 | T-219 |
| F-163 | Wave Connection Manager | Configure VISTA ↔ Wave sync: which signals push, which campaign data pulls, sync frequency | N/A (new) | P0 | T-220 |
| F-164 | DEX AI Connection Manager | Configure VISTA ↔ DEX sync: mandates, candidates, placements, consultant data | N/A (new) | P0 | T-221 |
| F-165 | Sync Health Monitor | Real-time status of all integrations — last sync time, error count, data volume | N/A (new) | P1 | T-222 |
| F-166 | Data Sync Logs | Detailed logs of what data was synced, when, and any errors | N/A (new) | P1 | T-223 |
| F-167 | Webhook Management | Configure webhooks for real-time event notifications between platforms | N/A (new) | P2 | T-224 |
| F-168 | API Key Management | Manage API keys for external integrations | N/A (new) | P1 | T-225 |
| Data | Purpose | Priority | Ticket |
| Contact signals → Wave | Wave uses signals to plan targeted campaigns | P0 | T-226 |
| Cluster insights → Wave | Wave creates cluster-specific marketing content | P0 | T-227 |
| Product recommendations → Wave | Wave promotes recommended products via campaigns | P0 | T-228 |
| Contact preferences → Wave | Wave respects communication preferences (channel, frequency) | P1 | T-229 |
| Pipeline stage → Wave | Wave adjusts messaging based on where contact is in pipeline | P1 | T-230 |
| Data | Purpose | Priority | Ticket |
| Webinar attendance → VISTA | Logged as inbound signal for contacts who attended | P0 | T-231 |
| Newsletter read/subscription → VISTA | Tracked as engagement signal | P0 | T-232 |
| Workshop request → VISTA | Creates activity + signal in VISTA | P0 | T-233 |
| Podcast invitation/attendance → VISTA | Tracked as engagement signal | P1 | T-234 |
| Coaching request → VISTA | Creates inbound opportunity signal | P0 | T-235 |
| Campaign performance → VISTA | Updates contact engagement scores, campaign ROI | P1 | T-236 |
| Content engagement metrics → VISTA | Which contacts engaged with which content | P1 | T-237 |
| Data | Purpose | Priority | Ticket |
| Mandate data → DEX | DEX manages consultant assignment and project delivery | P0 | T-238 |
| Candidate matches → DEX | DEX tracks candidate submissions and placements | P0 | T-239 |
| Contact assessments → DEX | DEX uses assessment data for consultant matching | P1 | T-240 |
| Company intelligence → DEX | DEX uses company context for project scoping | P1 | T-241 |
| Data | Purpose | Priority | Ticket |
| Placement outcomes → VISTA | Updates pipeline stage, contact status, success metrics | P0 | T-242 |
| Consultant performance → VISTA | Informs VISTA about delivery quality for future recommendations | P2 | T-243 |
| Project status → VISTA | Updates project portal with delivery milestones | P1 | T-244 |
| Client feedback → VISTA | Feeds back into contact/company health scores | P1 | T-245 |
| Page | AI Capability | Description | Priority | Ticket |
| Dashboard | Executive Brief | AI-generated daily brief: what happened, what needs attention, what to do next | P0 | T-246 |
| Contacts | Profile Intelligence | AI-generated contact brief: who they are, what they need, how to approach | P0 | T-247 |
| Contacts | Inbound Analysis | AI summarizes inbound activity patterns and recommends actions | P0 | T-248 |
| Companies | Account Intelligence | AI-generated company brief: situation, opportunities, risks, approach | P0 | T-249 |
| Signals | Signal Narrative | AI weaves individual signals into a coherent story per contact/company | P0 | T-250 |
| Pipeline | Deal Intelligence | AI assesses deal health, recommends actions, predicts outcomes | P1 | T-251 |
| Campaigns | Campaign Generation | AI generates full campaign from signal analysis + product mapping | P0 | T-252 |
| Mandates | Match Analysis | AI explains why a contact matches a mandate, with evidence | P0 | T-253 |
| Meetings | Meeting Intelligence | AI summarizes meeting, extracts actions, suggests follow-ups | P0 | T-254 |
| Assessment | Diagnostic Intelligence | AI interprets assessment results, compares to benchmarks, recommends actions | P0 | T-255 |
| Products | Recommendation Engine | AI recommends products per contact based on signals + needs | P0 | T-256 |
| Projects | Status Intelligence | AI generates project status, identifies risks, recommends actions | P1 | T-257 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-258 | Global Command Palette | ⌘K to search any entity, navigate anywhere, execute actions | Linear Command Bar, Notion Search | P0 | T-258 (V2-T-093) |
| F-259 | Keyboard Shortcuts | Comprehensive keyboard shortcuts for power users | Linear Shortcuts | P1 | T-063 (V2) |
| F-260 | Notification Center | Bell icon with unread notifications, categorized by type | HubSpot Notifications | P0 | T-259 |
| F-261 | Global Entity Search | Search across ALL entities (contacts, companies, mandates, meetings, signals, campaigns) simultaneously | Salesforce Global Search | P0 | T-093 (V2) |
| F-262 | Global Filters | Save filters and apply them across different pages | HubSpot Saved Filters | P1 | T-260 |
| F-263 | Breadcrumb Navigation | Clear breadcrumb trail showing where you are in the hierarchy | Notion Breadcrumbs | P1 | T-064 (V2) |
| F-264 | Recent Items | Quick access to recently viewed entities | Salesforce Recently Viewed | P1 | T-261 |
| F-265 | Favorites/Starred | Star any entity for quick access | Linear Stars | P2 | T-262 |
| F-266 | Dark Mode | Full dark mode support across all pages | Notion Dark Mode | P2 | T-065 (V2) |
| F-267 | Responsive Design | All pages work on tablet and mobile | HubSpot Mobile | P1 | T-066 (V2) |
| F-268 | Role-Based Access Control | Admin, Manager, User roles with configurable permissions | Salesforce RBAC | P1 | T-263 |
| F-269 | Audit Trail | Log all changes: who changed what, when, from what to what | Salesforce Field History | P1 | T-264 |
| F-270 | Data Import Wizard | Guided import from CSV, Excel, with field mapping and validation | HubSpot Import | P1 | T-125 (V2) |
| F-271 | Data Export | Export any list as CSV/Excel with field selection | Salesforce Export | P1 | T-265 |
| F-272 | Custom Objects | User-defined entity types beyond the built-in ones | Salesforce Custom Objects | P2 | T-266 |
| F-273 | Workflow Automation | Visual workflow builder: trigger → condition → action | HubSpot Workflows | P1 | T-267 |
| F-274 | Mention & Comment System | @mention team members on any entity, thread comments | Notion Comments | P2 | T-268 |
| F-275 | Task Assignment | Assign tasks to team members from any entity | Linear Issues | P1 | T-269 |
| # | Feature | Description | Reference | Priority | Ticket |
| F-276 | Consistent Spacing System | 4px/8px/12px/16px/24px/32px/48px spacing scale across all pages | Notion Spacing | P0 | T-067 (V2) |
| F-277 | Skeleton Loading States | Skeleton placeholders for all data-loading scenarios | Linear Skeleton | P0 | T-068 (V2) |
| F-278 | Empty States | Beautiful empty states with CTAs for every page/list | Notion Empty States | P0 | T-069 (V2) |
| F-279 | Micro-Animations | Subtle animations: hover, focus, expand, collapse, page transitions | Linear Animations | P0 | T-070 (V2) |
| F-280 | Toast Notifications | Non-blocking notifications for actions (save, delete, success, error) | Notion Toast | P0 | T-071 (V2) |
| F-281 | Context Menus | Right-click context menus on table rows, entities | Linear Context Menu | P1 | T-072 (V2) |
| F-282 | Drag & Drop Interactions | Smooth drag-and-drop for Kanban, reordering, file uploads | Linear Drag & Drop | P1 | T-073 (V2) |
| F-283 | Progressive Disclosure | Show summary first, expand for details — avoid information overload | Notion Toggle Blocks | P0 | T-074 (V2) |
| F-284 | Consistent Typography | Type scale: 12/14/16/20/24/30/36px with proper line heights | Notion Typography | P0 | T-270 |
| F-285 | Color Semantics | Consistent color usage: success=green, warning=amber, error=red, info=blue | Salesforce Lightning Colors | P0 | T-271 |
| F-286 | Hover Preview Cards | Hovering any entity reference shows a preview card (already have for contacts — extend to companies, mandates, signals) | N/A (new) | P0 | T-272 |
| F-287 | Smooth Page Transitions | Page transitions with subtle fade/slide animations | Lovable Page Transitions | P1 | T-273 |
| F-288 | Infinite Scroll / Virtualized Lists | Smooth scrolling for large lists without pagination jumps | Linear Infinite Scroll | P1 | T-274 |
| F-289 | Accessible Focus States | Clear, visible focus indicators for keyboard navigation | Replit Accessibility | P1 | T-275 |
| F-290 | Responsive Tables | Tables that gracefully adapt to smaller screens (column hiding, horizontal scroll) | HubSpot Responsive Tables | P1 | T-276 |
| F-291 | Error Recovery UI | Clear error messages with actionable recovery steps (not just "something went wrong") | Notion Error States | P0 | T-277 |
| F-292 | Undo/Redo | Undo for destructive actions (delete, bulk change) with toast undo option | Linear Undo | P1 | T-278 |
| F-293 | Confirmation Dialogs | Contextual confirmations — inline for simple, modal for destructive | Notion Confirmations | P0 | T-279 |

---

### V4 — Action-Pushing Platform (89 tickets: T-294 to T-382)

| # | Feature | Description | Reference | Priority | Ticket |
| QI-01 | Signal Intelligence Brief | Each signal auto-generates a full intelligence brief: event context, market implications, affected entities, recommended actions, messaging angles. Stored in DB, editable, shareable | N/A | P0 | T-294 |
| QI-02 | Signal Narrative Generator | AI weaves multiple signals for a contact/company into a coherent narrative: "Over the past 30 days, Company X has shown 4 signals suggesting they are preparing for expansion..." | N/A | P0 | T-295 |
| QI-03 | LENS Strategic Recommendations | LENS output expanded from scores to full recommendations: WHO to contact, WHY (reasoning), HOW (channel + template), WHAT to say (messaging angles) | N/A | P0 | T-296 |
| QI-04 | Email Draft with Full Context | LENS generates email drafts that incorporate: contact profile, company signals, relationship history, previous interactions, cluster context, recommended approach | N/A | P0 | T-297 |
| QI-05 | Communication Template Recommender | AI recommends the right template based on context: exploratory call, podcast invitation, webinar invite, follow-up, introduction, nurture, re-engagement | N/A | P0 | T-298 |
| QI-06 | Cluster Assignment Recommender | AI recommends which cluster a contact should belong to, with reasoning: "This contact works in FinTech in Singapore — assign to APAC FinTech cluster because..." | N/A | P1 | T-299 |
| QI-07 | Campaign Assignment Recommender | AI recommends which campaign a contact should be in: "Based on their signals (digital transformation + leadership change), they should be in the Enterprise DX Campaign" | N/A | P1 | T-300 |
| QI-08 | Contact Opportunity Brief | Per-contact AI-generated brief: who they are, what their company is going through, what we can offer, how to approach, what to avoid, relationship history summary | N/A | P0 | T-301 |
| QI-09 | Company Market Intelligence | Per-company AI brief: market position, recent developments, competitive landscape, opportunities for us, risks, key contacts and their influence | N/A | P0 | T-302 |
| QI-10 | Cluster Intelligence Report | Per-cluster AI report: market dynamics, key players, trends, opportunities, recommended approach, which contacts to prioritize | N/A | P1 | T-303 |
| QI-11 | Signal-to-Product Narrative | AI generates: "This signal suggests Company X needs [Product Y]. Here's why, here's how to position it, here's a draft proposal outline" | N/A | P0 | T-304 |
| QI-12 | Relationship Context Engine | AI tracks and summarizes the full relationship: first contact, all interactions, sentiment trend, relationship strength, key moments, what was discussed, what was promised | N/A | P0 | T-305 |
| QI-13 | Meeting Preparation Brief | Before any meeting: AI generates one-page brief — who you're meeting, their background, company situation, last interactions, signals, objectives for this meeting, suggested questions | N/A | P0 | T-306 |
| QI-14 | Post-Meeting Intelligence | After logging a meeting: AI extracts key insights, updates contact intelligence, suggests follow-up actions, updates signal detection | N/A | P1 | T-307 |
| QI-15 | Stored Intelligence Cache | All AI-generated intelligence stored in Supabase — searchable, retrievable, editable, versionable. Not generated on-the-fly every time | N/A | P0 | T-308 |
| # | Feature | Description | Reference | Priority | Ticket |
| AP-01 | Daily Action Target | Configurable daily target: "Contact 5 people today." Dashboard shows progress: 3/5 done. Celebrates when hit. | Habitica / Duolingo | P0 | T-309 |
| AP-02 | Action Streaks | "You've contacted someone 7 days in a row!" Visual streak counter. Breaking a streak shows gentle warning. | Duolingo Streaks | P0 | T-310 |
| AP-03 | Action Queue (Priority-Ordered) | Never show a full list. Show a priority-ordered queue of "what to do next." Each item: WHO, WHY, HOW, WHAT to say. Swipe/action to complete. | Linear Inbox | P0 | T-311 |
| AP-04 | Follow-Up Clock | Every contact has a "follow-up due" timer. Overdue contacts surface automatically. "John hasn't been contacted in 14 days — your pattern is every 7 days." | HubSpot Task Reminders | P0 | T-312 |
| AP-05 | Nudge Notifications | Timed nudges: "It's 10am — you haven't contacted anyone yet today. Here's who to start with." Gentle but persistent. | N/A | P0 | T-313 |
| AP-06 | Weekly BD Goal | Set weekly goals: "15 contacts this week, 3 meetings booked, 1 campaign launched." Progress bar with daily breakdown. | N/A | P1 | T-314 |
| AP-07 | Cluster Care Reminders | "APAC FinTech cluster hasn't had activity in 5 days. 3 contacts need attention." Push to nurture specific clusters. | N/A | P0 | T-315 |
| AP-08 | Campaign Completion Tracker | "Campaign X is 60% complete. 4 touches remaining. Next action: send follow-up email to 12 contacts." Push to complete campaigns. | N/A | P0 | T-316 |
| AP-09 | Funnel Health Nudges | "Your pipeline is thinning at the Proposal stage. Consider advancing 3 Engaged contacts." Push to nurture the funnel. | N/A | P1 | T-317 |
| AP-10 | Cadence Tracking | Track communication cadence per contact: "Sarah's ideal cadence is every 10 days. Last contact: 8 days ago. Approaching optimal window." | Outreach Cadence | P1 | T-318 |
| AP-11 | Achievement Badges | Unlock achievements: "First 50 contacts", "7-day streak", "First campaign completed", "10 meetings logged". Visual badge collection. | Habitica Achievements | P2 | T-319 |
| AP-12 | Momentum Score | Aggregate metric: how much BD momentum do you have? Based on: daily activity, streak, goal progress, pipeline movement. | N/A | P1 | T-320 |
| AP-13 | End-of-Day Summary | At end of day: "You contacted 4 people, logged 2 meetings, sent 3 emails. Tomorrow: 3 follow-ups due, 2 cluster actions pending." | N/A | P0 | T-321 |
| AP-14 | Action Categories | Every action categorized: exploratory call, podcast invite, webinar invite, follow-up, introduction, nurture, re-engagement, proposal, closing. Track distribution. | N/A | P0 | T-322 |
| AP-15 | Priority View Mode | Default view across ALL pages: not a list, but a priority-ordered feed. "Here's what needs your attention right now, in this order." | Linear Inbox | P0 | T-323 |
| # | Feature | Description | Reference | Priority | Ticket |
| KB-01 | Contacts Kanban by Stage | Drag-and-drop contacts by pipeline stage: Cold → Warm → Engaged → Hot → Committed | Trello / HubSpot Deals | P0 | T-324 |
| KB-02 | Contacts Kanban by Priority | Alternative Kanban: by priority tier (P0/P1/P2/P3) — what needs attention NOW | Linear Issues | P0 | T-325 |
| KB-03 | Signals Kanban by Actionability | Signals grouped by: Needs Action → Being Monitored → Resolved | N/A | P0 | T-326 |
| KB-04 | Actions Kanban Board | Full Kanban of all pending actions: To Do → In Progress → Done. Each card = one action with WHO/WHY/HOW | Trello | P0 | T-327 |
| KB-05 | Campaign Kanban by Status | Campaigns grouped: Draft → Active → Paused → Completed | HubSpot Campaigns | P1 | T-328 |
| KB-06 | Cluster Kanban by Health | Clusters grouped: Healthy → Needs Attention → Critical | N/A | P1 | T-329 |
| KB-07 | Mandates Kanban by Stage | Candidates per mandate: Sourced → Screened → Interviewing → Offered → Placed | Greenhouse | P0 | T-330 |
| KB-08 | Projects Kanban by Status | Projects: Planning → Active → Blocked → Completed | Linear | P1 | T-331 |
| KB-09 | View Toggle (Table ↔ Kanban ↔ Priority Feed) | Every page has 3 view modes: Table (for data work), Kanban (for status management), Priority Feed (for action) | Notion View Toggle | P0 | T-332 |
| KB-10 | Smart Default View | Each page defaults to the most useful view: Contacts → Priority Feed, Pipeline → Kanban, Signals → Kanban, Activities → Timeline | N/A | P0 | T-333 |
| KB-11 | Filtered Subsets | Never show "all contacts." Show: "Contacts needing action (12)", "Contacts this week (5)", "Stale contacts (8)". Always scoped. | Linear Filters | P0 | T-334 |
| KB-12 | Inline Action Cards | Each Kanban card has inline actions: [Email] [Log] [Advance] [Reschedule] — no need to open detail page | Trello Power-Ups | P0 | T-335 |
| KB-13 | Drag-to-Advance | Drag a contact card from "Engaged" to "Hot" = automatically log activity and update stage | Trello Drag & Drop | P0 | T-336 |
| KB-14 | Swimlanes | Kanban supports swimlanes: e.g., by cluster, by seniority, by industry | Jira Swimlanes | P2 | T-337 |
| KB-15 | WIP Limits | Warn when too many items in a column: "You have 15 contacts in 'To Contact' — focus before adding more" | Kanban WIP Limits | P2 | T-338 |
| # | Feature | Description | Priority | Ticket |
| SA-01 | Action Purpose Categories | Every action tagged with purpose: exploratory_call, podcast_invite, webinar_invite, follow_up, introduction, nurture, re_engagement, proposal_sent, closing, feedback_request, thank_you, cross_sell, upsell | P0 | T-339 |
| SA-02 | Action Outcome Tracking | Every action logged with outcome: no_response, positive_reply, negative_reply, meeting_booked, meeting_completed, proposal_accepted, proposal_declined, referred, closed_won, closed_lost | P0 | T-340 |
| SA-03 | Communication Template Linking | Each action links to the template used. Track which templates convert best. | P1 | T-341 |
| SA-04 | Action Timing Analytics | When are actions most effective? Time of day, day of week, response rate by timing. | P1 | T-342 |
| SA-05 | Action Chain Visualization | Visual chain of actions per contact: "Email → 3 days → LinkedIn → 7 days → Call → Meeting booked". Show what worked. | P0 | T-343 |
| SA-06 | Response Rate by Action Type | Track: exploratory call emails get 30% response, podcast invites get 50%, etc. | P1 | T-344 |
| SA-07 | Auto-Categorize Actions | AI auto-categorizes actions based on content: "This email looks like a follow-up" → auto-tag | P2 | T-345 |
| SA-08 | Action Templates per Stage | Different action templates suggested based on pipeline stage: Cold → exploratory call, Engaged → proposal, etc. | P0 | T-346 |
| SA-09 | Next-Step Engine | After every action, AI suggests the next step: "You sent an email 3 days ago. No response. Next: LinkedIn message with a different angle." | P0 | T-347 |
| SA-10 | Action Completion Tracking | Track action completion rates: how many of today's recommended actions did you complete? | P0 | T-348 |
| # | Feature | Description | Priority | Ticket |
| AL-01 | Email Auto-Log | Every email sent via platform auto-creates an activity record with: type, purpose, template, outcome fields | P0 | T-349 |
| AL-02 | Meeting Transcript Auto-Log | Uploaded/pasted transcripts auto-create meeting + activity records, link to all attendees | P0 | T-350 |
| AL-03 | Communication Channel Log | Every communication (email, LinkedIn, phone, in-person) logged with channel, purpose, outcome | P0 | T-351 |
| AL-04 | Activity → Signal Generation | Logged activities can trigger signal detection: "Meeting held" = positive engagement signal | P1 | T-352 |
| AL-05 | Activity → Score Update | Logged activities update contact scores: email sent = touch_count++, meeting held = engagement_score boost | P1 | T-353 |
| AL-06 | Cross-Entity Activity View | View activities by: contact, company, cluster, campaign, mandate. Same activity appears in all relevant views. | P0 | T-354 |
| AL-07 | Activity Search & Filter | Full-text search across all activities. Filter by: type, purpose, outcome, date range, entity. | P1 | T-355 |
| AL-08 | Duplicate Activity Prevention | Prevent double-logging: if an email was already logged, don't create a duplicate. | P2 | T-356 |
| # | Feature | Description | Reference | Priority | Ticket |
| SO-01 | Shareable Report Links | Every report gets a unique URL that can be shared externally (like Lovable share links). No login required for viewers. | Lovable Share Links | P0 | T-357 |
| SO-02 | Shareable Contact Briefs | Share a contact's brief via link — useful for team members or external partners | N/A | P1 | T-358 |
| SO-03 | Shareable Cluster Reports | Share cluster intelligence reports via link | N/A | P1 | T-359 |
| SO-04 | Email Status Updates | Auto-generate status update emails: "Here's what happened this week" — with embedded charts and links | N/A | P0 | T-360 |
| SO-05 | PDF Report Export | Professional PDF export for any report, brief, or summary | N/A | P0 | T-361 |
| SO-06 | PPTX Export | Presentation-ready export for executive summaries, cluster reports, proposal decks | N/A | P1 | T-362 |
| SO-07 | Scheduled Report Distribution | Auto-email reports on schedule: "Every Monday, send pipeline report to team" | Salesforce Scheduled Reports | P1 | T-363 |
| SO-08 | Embedded Report Links | Reports can be embedded in emails, Feishu messages, or other platforms via iframe/link | N/A | P2 | T-364 |
| # | Feature | Description | Reference | Priority | Ticket |
| FN-01 | Funnel Health Dashboard | Visual funnel: count and value at each stage. Highlight bottlenecks: "Too many stuck in Engaged" | HubSpot Funnel Analytics | P0 | T-365 |
| FN-02 | Stage Duration Alerts | "Contact X has been in 'Engaged' for 21 days — average is 10 days. Consider advancing or re-qualifying." | N/A | P0 | T-366 |
| FN-03 | Nurture Campaign Suggestions | When funnel is thin: "You have 3 cold contacts showing signals. Start a nurture campaign?" | N/A | P0 | T-367 |
| FN-04 | Auto-Advance Suggestions | AI suggests contacts ready to advance: "Sarah has 4 positive signals + 3 meetings → advance to Hot" | N/A | P0 | T-368 |
| FN-05 | Funnel Velocity Tracking | Track how fast contacts move through stages. Week over week improvement or regression. | Salesforce Path Pilot | P1 | T-369 |
| FN-06 | Re-Engagement Queue | Contacts who went cold: auto-surface for re-engagement with suggested approach | N/A | P0 | T-370 |
| FN-07 | Pipeline Balance Alerts | "Your pipeline is top-heavy: 20 cold, 5 engaged, 1 hot. Need to advance more contacts." | N/A | P1 | T-371 |
| FN-08 | Win Probability Scoring | Per-contact probability of conversion based on: signals, engagement, stage, history | Salesforce Opportunity Scoring | P1 | T-372 |
| # | Feature | Description | Reference | Priority | Ticket |
| ET-01 | Universal Inline Editing | Every cell in every table is editable inline (already have for Stage — extend to ALL fields) | Notion Inline Edit | P0 | T-373 |
| ET-02 | Bulk Edit Mode | Select multiple rows → edit shared fields in bulk (stage, cluster, tier, tags) | Airtable Bulk Edit | P0 | T-374 |
| ET-03 | Drag-to-Reorder | Drag rows to reorder manually in any table (saves sort preference) | Notion Drag Reorder | P1 | T-375 |
| ET-04 | Custom Layout Builder | Drag-and-drop layout builder for each page: choose which widgets to show, where, in what size | Notion Block Editor | P1 | T-376 |
| ET-05 | Saved Layouts | Save and switch between layouts: "Action View", "Analytics View", "Quick Overview" | N/A | P1 | T-377 |
| ET-06 | Resizable Panels | All panels/sections are resizable. Drag borders to adjust widths. | Replit Panels | P1 | T-378 |
| ET-07 | Collapsible Sections | Every section can be collapsed/expanded. Remember state across sessions. | Notion Toggle | P0 | T-379 |
| ET-08 | Table Row Expansion | Click a row to expand inline detail (no need to navigate to a new page for basic info) | Airtable Row Expansion | P0 | T-380 |
| ET-09 | Quick Create from Anywhere | "+" button on every page to create new entity (contact, signal, activity, mandate) without leaving | Notion Quick Create | P0 | T-381 |
| ET-10 | Keyboard-First Navigation | Navigate tables and Kanban with arrow keys. Enter to edit. Escape to cancel. | Linear Keyboard Nav | P1 | T-382 |
| Category | # Tickets | P0 | P1 | P2 |

---

### Wave 1.5 — Funnel Core (8 tickets: F-01 to F-08)

| F-01 | Contact Funnel Extensions | 🔴 P0 | 0.5 |
| F-02 | Outreach Sequence Engine | 🔴 P0 | 2 |
| F-03 | Outreach Templates (4 seeded) | 🔴 P0 | 1 |
| F-04 | Outreach Tracking UI | 🔴 P0 | 1.5 |
| F-05 | Nurture Router | 🟡 P1 | 1 |
| F-06 | Opportunity Scoring | 🟡 P1 | 1 |
| F-07 | Weekly Rhythm Dashboard | 🟡 P1 | 0.5 |
| F-08 | 90-Day Milestone Tracker | 🟢 P2 | 0.5 |

---

## 12-Execution Wave Plan

| Wave | Theme | Duration | Status |
|---|---|---|---|
| Wave 1 | Foundation — Design tokens, brand, contacts, dashboard | 15d | ✅ DONE |
| Wave 1.5 | Funnel Core — Outreach engine, scoring, nurture | 8d | ✅ DB Migrated |
| Wave 2 | Context & Connectivity — Email, LinkedIn, calendar | 17d | 📋 Ready |
| Wave 3 | Qualitative Intelligence + Kanban-First | 20d | 📋 Ready |
| Wave 4 | Action-Pushing + Gamification | 18d | 📋 Ready |
| Wave 5 | New Portals — Companies, Mandates, Meetings | 18d | 📋 Ready |
| Wave 6 | Contact Depth & CV | 13d | 📋 Ready |
| Wave 7 | Funnel Management + Editable Everything | 16d | 📋 Ready |
| Wave 8 | Products, Assessment, Communications | 15d | 📋 Ready |
| Wave 9 | Auto-Logging + Shareable Outputs | 14d | 📋 Ready |
| Wave 10 | Three-Platform Integration | 16d | 📋 Ready |
| Wave 11 | AI Intelligence Layer | 14d | 📋 Ready |
| Wave 12 | Design Craft & Polish | 15d | 📋 Ready |

**Total estimated: ~272 days** (sequential), parallelizable to ~90 days with 3 devs

---

## Database Schema Status

| Layer | Tables | Status |
|---|---|---|
| Original (V1) | 19 tables | ✅ Live |
| Wave 1.5 Funnel | 3 new + 2 altered | ✅ Live |
| V2 Service Catalog | 17 new + 1 altered | ✅ Live |
| Wave 1.7 B2C Portal | 13 new + 3 altered | 📋 Migration Ready |
| **Total** | **52 tables** | **39 live + 13 pending** |

### Key Tables

**Core**: vista_contacts, vista_opportunities, signals, campaign_activities, campaign_contacts

**Funnel (Wave 1.5)**: vista_outreach_templates (8 seeded), vista_outreach_sequences, vista_nurture_routes


**B2C Portal (Wave 1.7)**: vista_b2c_users, vista_b2c_profiles, vista_b2c_credit_ledger, vista_b2c_credit_packs, vista_b2c_payments, vista_b2c_subscriptions, vista_b2c_chat_sessions, vista_b2c_chat_messages, vista_b2c_assessment_results, vista_b2c_events, vista_b2c_upgrade_candidates, vista_b2c_cross_sell_rules, vista_b2c_revenue_metrics

**Service Catalog (V2)**: vista_service_catalog (24 services seeded), vista_contact_services, vista_service_templates, vista_goals, vista_daily_log, vista_achievements, vista_nudges, vista_tasks, vista_signal_intelligence, vista_contact_briefs, vista_lens_recommendations, vista_alert_rules, vista_alerts, vista_shared_reports, vista_layout_config, vista_platform_sync, vista_inbound_signals

---

### Wave 1.6 — Revenue Operating System (20 tickets: R-01 to R-20)

> **Triggered by:** Pricing Strategy & Market Penetration Playbook (2026-07-12)
> **Focus:** 7-tier pricing architecture, tiered conversion funnel, cross-sell rules engine, content attribution, bundle/discount logic
> **Migration SQL:** `run_this_wave1.6_migration.sql`
> **Spec:** `spec_wave1.6_revenue_os.md`

| # | Ticket | Domain | Estimate |
|---|--------|--------|----------|
| R-01 | Service Catalog Restructure — 7 Tier Architecture (all 7 tiers, 40+ services) | Catalog | 3d |
| R-02 | Bundle Definitions & Pricing Engine (6 bundles with auto-calculation) | Catalog | 3d |
| R-03 | Discount Rules Engine (never-discount enforcement, founding client rates) | Catalog | 2d |
| R-04 | Proposal & Quote Generator (auto-pricing, PDF output) | Catalog | 3d |
| R-05 | Revenue Tracking Dashboard (by tier, by service, bundle adoption) | Catalog | 2d |
| R-06 | Payment Schedule Tracker (milestone/monthly/quarterly tracking) | Catalog | 2d |
| R-07 | Contact Revenue Potential Scoring (LTV estimation, tier potential) | Catalog | 2d |
| R-08 | Service Engagement Tracker (full history, upgrade path, testimonial tracking) | Catalog | 1d |
| R-09 | Tiered Funnel Stage Model (7 stages replacing linear 500→50→10→2) | Funnel | 3d |
| R-10 | Tier Progression Tracking & Analytics (conversion rates, drop-off points) | Funnel | 2d |
| R-11 | Content Attribution Engine (LinkedIn/Newsletter/Podcast/Webinar → lead) | Funnel | 3d |
| R-12 | Workshop & Event Management (registration, attendance, follow-up automation) | Funnel | 2d |
| R-13 | The Council Membership Module (3 tiers, capacity limits, renewals) | Funnel | 3d |
| R-14 | DEX AI Platform Tracking (credits, subscriptions, upgrade paths) | Funnel | 2d |
| R-15 | Cross-Sell Matrix Configuration (10 explicit if-bought→recommend paths) | Cross-Sell | 2d |
| R-16 | Automated Cross-Sell Recommendations (auto-trigger on engagement completion) | Cross-Sell | 2d |
| R-17 | Bundle Suggestion Engine (auto-suggest bundles when 2+ services selected) | Cross-Sell | 1d |
| R-18 | "Never Discount" Enforcement (hard block on search/platform/post-founding) | Cross-Sell | 1d |
| R-19 | Phase 1 (Month 1-2) Minimum Viable Revenue Stack | Priority | 3d |
| R-20 | Phase 2 (Month 2-4) Diagnostic + Workshop Stack | Priority | 3d |
| | | **Wave 1.6 Total:** | **~48 days** |


### Wave 1.7 — DEX AI B2C Career Advisory Portal (25 tickets: BC-01 to BC-25)

> **Triggered by:** LYC Pricing Strategy V2 (2026-07-12)
> **Focus:** B2C AI career advisory portal — entirely new business line
> **Migration SQL:** `run_this_wave1.7_migration.sql`
> **Spec:** `spec_wave1.7_b2c_portal.md`

| # | Ticket | Domain | Estimate |
|---|--------|--------|----------|
| BC-01 | B2C User Registration & Authentication (email + LinkedIn OAuth) | Auth | 3d |
| BC-02 | B2C User Profile Management (career context, LinkedIn import) | Auth | 2d |
| BC-03 | Credit System & Ledger (purchase, consumption, expiry, balance) | Auth | 3d |
| BC-04 | Subscription Management — Member (¥99/mo) & Pro (¥299/mo) | Auth | 3d |
| BC-05 | Chat Interface — Core UI (chat-first AI career advisory) | Chat | 3d |
| BC-06 | Message Counting & Free Tier Enforcement (5-message lifetime limit) | Chat | 1d |
| BC-07 | Conversation History & Context Management | Chat | 2d |
| BC-08 | DeepSeek AI Integration — Career Advisory Engine | Chat | 3d |
| BC-09 | Credit Pack Purchase Flow (3 packs: ¥99/¥399/¥799) | Billing | 2d |
| BC-10 | Payment Integration — MVP manual + future Stripe/WeChat | Billing | 3d |
| BC-11 | B2C Billing Dashboard — Admin (MRR, transactions, subscriptions) | Billing | 2d |
| BC-12 | B2C Conversion Funnel Tracking (8-stage funnel) | Analytics | 2d |
| BC-13 | B2C User Analytics Dashboard (DAU/MAU, ARPU, LTV) | Analytics | 2d |
| BC-14 | Credit Burn Analytics & Forecasting | Analytics | 2d |
| BC-15 | Assessment Gateway — Credit-Gated Access (7 assessment types) | Assessment | 2d |
| BC-16 | PRISM Assessment — Personality Profile (3 credits) | Assessment | 3d |
| BC-17 | TRIDENT Assessment — Skills Gap Analysis (5 credits) | Assessment | 3d |
| BC-18 | CANVAS Assessment — Career Path Mapping (8 credits) | Assessment | 3d |
| BC-19 | B2C → B2B Upgrade Pipeline (auto-detect enterprise signals) | Upgrade | 3d |
| BC-20 | Council Pricing Restructure — V2 Model (¥2.8K-50K, 4 tiers) | Upgrade | 2d |
| BC-21 | B2C Cross-Sell Paths — 4 explicit paths (Free→Credits→Member→Pro→Council) | Upgrade | 2d |
| BC-22 | Update R-01 Service Catalog — Add B2C Products (6 entries + 1 bundle) | Modifications | 1d |
| BC-23 | Update Funnel Core — Add Tier 1.5 | Modifications | 1d |
| BC-24 | Update Revenue Dashboard — B2C Revenue Lines | Modifications | 1d |
| BC-25 | Update R-13 Council Module — V2 Pricing + B2C Path | Modifications | 1d |
| | | **Wave 1.7 Total:** | **~55 days** |

### Updated Totals

| Version | Tickets | Description |
|---------|---------|-------------|
| V1 — Original Gap | 51 | UX, visual design, dashboard |
| V2 — Gap Analysis | 100 | T-01→T-100: CV, search, integrations |
| V3 — Exhaustive Feature Map | 193 | T-101→T-293: 20 domains, 16 portals |
| V4 — Action-Pushing Platform | 89 | T-294→T-382: intelligence, gamification, kanban |
| Wave 1.5 — Funnel Core | 8 | F-01→F-08: outreach engine, scoring |
| **Wave 1.6 — Revenue OS** | **20** | **R-01→R-20: pricing, tiered funnel, cross-sell, content** |
| Wave 1.7 — B2C Portal | 25 | BC-01→BC-25: B2C auth, chat, credits, assessments, upgrade |
| **GRAND TOTAL** | **524** | |

### Updated 12-Wave Execution Order

| Wave | Name | Duration | Status |
|------|------|----------|--------|
| Wave 1 | Foundation | 27d | ✅ DONE |
| Wave 1.5 | Funnel Core (DB) | 8d | ✅ DB Migrated |
| **Wave 1.6** | **Revenue Operating System** | **18d** | **🆕 SPEC READY** |
| Wave 2 | Context & Connectivity | 17d | Next |
| Wave 3 | Qualitative Intelligence + Kanban | 20d | Transformative |
| Wave 4 | Action-Pushing + Gamification | 18d | |
| Wave 5 | Companies, Mandates, Meetings | 18d | |
| Wave 6 | Contact Depth & CV | 13d | |
| Wave 7 | Funnel + Editable Everything | 16d | |
| Wave 8 | Products, Assessment, Communications | 15d | |
| Wave 9 | Auto-Logging + Shareable Outputs | 14d | |
| Wave 10 | Three-Platform Integration | 16d | |
| Wave 11 | AI Intelligence Layer | 14d | |
| Wave 12 | Design Craft & Polish | 15d | |
| **Total** | | **~272 days sequential, ~90 days with 3 devs** | |
