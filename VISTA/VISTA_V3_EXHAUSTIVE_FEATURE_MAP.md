# VISTA V3 — Exhaustive Feature Map by Portal & Page

**Author:** James/AI (PM) | **Date:** 2026-07-11 | **Status:** Ready for Kevin Review
**Supersedes:** VISTA_V2_GAP_ANALYSIS.md (V2 — 100 tickets across 12 domains)
**Purpose:** Exhaustive inventory of ALL features needed for a world-class BD intelligence platform. Maps every feature to a specific page/portal. Ensures nothing critical is forgotten.

---

## Executive Summary

V2 identified 100 tickets across 12 domains. **This was not enough.**

Kevin's vision is a **BD Intelligence Platform** where:
- Insights, market signals, and contact intelligence flow seamlessly
- Products, services, advisory offerings are mapped to signals and recommendations
- Inbound activity (webinar, newsletter, workshop, podcast, coaching) drives intelligence
- Proposals, emails, decks, campaigns are AI-generated from signal-to-product mapping
- Three platforms interoperate: **VISTA** (intelligence) ↔ **Wave** (marketing) ↔ **DEX AI** (ATS/consulting)

V3 adds **100 new tickets** (T-101 to T-200) across **20 domains** (12 existing + 8 new), organized by portal/page. Total platform scope: **200 tickets**.

### What V3 Adds Over V2

| Dimension | V2 | V3 |
|-----------|-----|-----|
| Tickets | 100 | **200** |
| Domains | 12 | **20** |
| Portals/Pages | 7 current | **16 portals (7 enhanced + 9 new)** |
| Three-platform integration | Not addressed | **Full VISTA ↔ Wave ↔ DEX architecture** |
| Inbound signal intelligence | Not addressed | **Webinar, newsletter, workshop, podcast, coaching tracking** |
| Product/service mapping | Not addressed | **Signal → Product → Proposal generation** |
| Communication tracking | Basic activity log | **Unified omnichannel inbox** |
| Assessment/diagnostics | Mentioned as gap | **Full assessment center with 7 sub-features** |
| Meeting intelligence | Basic transcript storage | **AI meeting analytics, action tracking, follow-up automation** |

---

## Part 1: Portal & Page Map — Current vs. Required

### Current Pages (7 portals)

| Portal | Route | Status | V3 Enhancement Level |
|--------|-------|--------|---------------------|
| Dashboard | `/dashboard` | ✅ Exists | Major — needs command center, real-time KPIs, activity heatmap |
| Contacts | `/contacts`, `/contacts/[id]` | ✅ Exists | Major — needs full CV, org chart, timeline, completeness score |
| Clusters | `/clusters`, `/clusters/[id]` | ✅ Exists | Moderate — needs analytics, benchmarks, health dashboard |
| Pipeline | `/pipeline` | ✅ Exists | Major — needs Kanban, forecasting, deal health, velocity |
| Campaigns | `/campaigns` | ✅ Exists | Major — needs A/B testing, journeys, ROI, drip automation |
| Signals | `/signals`, `/signals/[id]` | ✅ Exists | Moderate — needs custom triggers, decay scoring, anomaly detection |
| Activities | `/activities` | ✅ Exists | Moderate — needs calendar sync, follow-up engine, task dependencies |

### Missing Pages/Portals (9 new portals)

| Portal | Route | Why Critical | V3 Priority |
|--------|-------|-------------|-------------|
| **Companies** | `/companies`, `/companies/[id]` | Companies are first-class entities in BD. Currently embedded in contacts — need separate portal for account-based intelligence | P0 |
| **Mandates** | `/mandates`, `/mandates/[id]` | Kevin: "candidate/mandate management directly on the platform." Core BD workflow — matching contacts to opportunities | P0 |
| **Meetings** | `/meetings`, `/meetings/[id]` | Kevin: "meeting transcript with clients." Meeting intelligence is how BD actually works | P0 |
| **Assessment Center** | `/assessment` | Kevin: "assessment and diagnostics center." Product-market fit scoring, needs assessment | P0 |
| **Reports** | `/reports` | Kevin: "project status report." Dedicated reporting portal separate from dashboard | P1 |
| **Communications** | `/communications` | Kevin: "communication tracker." Unified inbox for all channels | P0 |
| **Products & Services** | `/products` | Kevin: "how this connects to our services, products, assessments." Signal-to-offering mapping | P0 |
| **Projects** | `/projects`, `/projects/[id]` | Kevin: "project status report." Project management for mandates/engagements | P1 |
| **Integrations Hub** | `/integrations` | Three-platform sync (Wave, DEX AI) requires management UI | P1 |

### Existing But Underdeveloped Pages

| Portal | Current State | V3 Required State |
|--------|---------------|-------------------|
| Programs | Basic API + assignment list | Full program management with milestones, deliverables, team |
| Strategy | Placeholder | Strategic initiative tracking with OKRs, milestones |
| Automation | Basic config page | Visual workflow builder with triggers, conditions, actions |
| Settings | Basic | Full admin: RBAC, audit log, custom fields, integrations, data management |

---

## Part 2: Feature Inventory by Portal

### 2.1 DASHBOARD PORTAL (15 features)

**Current:** KPI cards, pipeline summary, alert feed, quick actions, top 7 ranking.
**Required:** Real-time command center with actionable intelligence.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.2 CONTACTS PORTAL (18 features)

**Current:** Table with inline editing, grid view, detail page with rich header, preview panel, AI summary.
**Required:** Full professional profile with complete CV, relationship mapping, engagement tracking.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-16 | Full CV/Resume Display | Parsed CV with experience timeline, education, skills, certifications — not just title/company | Greenhouse Candidate Profile | P0 | T-02 (V2) |
| F-17 | CV/Resume Upload | Drag-and-drop upload of PDF/DOCX resumes with auto-parsing | Greenhouse Resume Parser | P0 | T-01 (V2) |
| F-18 | Experience Timeline | Visual timeline of career progression (company, role, dates, description) | LinkedIn Experience Section | P0 | T-06 (V2) |
| F-19 | Skills & Competency Tags | Structured skill tags with proficiency levels, extracted from CV or manually added | Salesforce Skills | P1 | T-07 (V2) |
| F-20 | Contact Completeness Score | Visual indicator of how complete the contact profile is (0-100%) with suggestions for missing data | HubSpot Profile Completeness | P1 | T-08 (V2) |
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

### 2.3 COMPANIES PORTAL (NEW — 14 features)

**Current:** Company info embedded in contacts. No separate company page.
**Required:** Full account intelligence portal — firms are first-class entities in BD.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.4 PIPELINE PORTAL (12 features)

**Current:** Basic list view with stage grouping. No Kanban, no forecasting.
**Required:** Full deal management with visual pipeline, forecasting, and analytics.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.5 SIGNALS PORTAL (10 features)

**Current:** Signal list, AI summary, signal detail page. Missing: custom triggers, decay, anomaly detection.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.6 CAMPAIGNS PORTAL (12 features)

**Current:** List view, campaign builder wizard. Missing: A/B testing, journeys, ROI tracking.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.7 CLUSTERS PORTAL (8 features)

**Current:** List view, detail page, AI summary. Missing: analytics, benchmarks, health.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-82 | Cluster Analytics Dashboard | Contact count trend, signal density, pipeline value, engagement rate per cluster | N/A (new) | P1 | T-170 |
| F-83 | Cluster Benchmarking | Compare clusters against each other on key metrics (engagement, pipeline, signals) | N/A (new) | P2 | T-171 |
| F-84 | Cluster Health Monitoring | Composite health score per cluster with trend, drill-down to unhealthy contacts | N/A (new) | P1 | T-172 |
| F-85 | Geographic/Industry Heatmap | Visual map showing cluster distribution by geography and industry | Salesforce Territory Mapping | P2 | T-173 |
| F-86 | Cluster Trend Analysis | Is the cluster growing, shrinking, or stable? Signal trend, contact additions, engagement changes | N/A (new) | P2 | T-174 |
| F-87 | TAM per Cluster | Total Addressable Market estimation per cluster (how many more contacts/companies could be in this cluster) | N/A (new) | P2 | T-175 |
| F-88 | Cluster-to-Campaign Linking | Which campaigns target this cluster? Performance of campaigns per cluster | N/A (new) | P1 | T-176 |
| F-89 | Cluster AI Recommendations | AI suggests actions to improve cluster health: "Add more senior contacts", "Increase signal monitoring" | N/A (new) | P1 | T-177 |

### 2.8 ACTIVITIES PORTAL (8 features)

**Current:** Activity list with type filters. Missing: calendar sync, follow-up engine, task management.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-90 | Calendar Integration | Two-way sync with Google Calendar / Outlook — meetings auto-appear as activities | HubSpot Calendar Sync | P0 | T-178 |
| F-91 | Follow-Up Reminder Engine | Auto-generate follow-up tasks after interactions. "You emailed X 3 days ago — follow up?" | HubSpot Tasks | P0 | T-179 |
| F-92 | Task Management | Full task system: assign, due date, priority, status, dependencies | Linear Task Management | P1 | T-180 |
| F-93 | Activity Type Taxonomy | Extended activity types: call, email, meeting, LinkedIn message, note, task, webinar, workshop, podcast | Salesforce Activity Types | P1 | T-181 |
| F-94 | Recurring Activity Templates | Template for recurring activities (weekly check-in, monthly review) | N/A (new) | P2 | T-182 |
| F-95 | Activity Search & Filters | Full-text search across all activities, advanced filters by type/date/contact/company | HubSpot Activity Search | P1 | T-183 |
| F-96 | Activity-to-Signal Linking | Activities generate signals (e.g., "meeting held" = positive engagement signal) | N/A (new) | P1 | T-184 |
| F-97 | Meeting Scheduler | Embedded scheduling link (like Calendly) for each contact/mandate | Calendly Integration | P1 | T-185 |

### 2.9 MANDATES PORTAL (NEW — 12 features)

**Current:** Nothing. No mandate/candidate management page exists.
**Required:** Full mandate lifecycle management — the core BD workflow of matching contacts to opportunities.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.10 MEETINGS PORTAL (NEW — 10 features)

**Current:** Nothing. No meeting management exists.
**Required:** Full meeting intelligence — capture, transcribe, analyze, extract actions.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.11 ASSESSMENT & DIAGNOSTICS PORTAL (NEW — 10 features)

**Current:** Basic scoring via intelligence API. No dedicated assessment portal.
**Required:** Full diagnostic center — product-market fit, needs assessment, diagnostic tools.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.12 COMMUNICATIONS PORTAL (NEW — 8 features)

**Current:** Email composer modal only. No unified inbox, no communication history.
**Required:** Unified communication tracker across all channels.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-130 | Unified Inbox | `/communications` — all messages across email, LinkedIn, phone notes in one feed | HubSpot Conversations | P0 | T-191 |
| F-131 | Email Thread View | Full email thread display with inline reply (like Gmail) | Gmail Thread View | P0 | T-192 |
| F-132 | Communication Timeline per Contact | All communications with a specific contact, in chronological order, filterable by channel | HubSpot Conversation Timeline | P0 | T-193 |
| F-133 | Unread/Unresponded Tracker | Highlight communications that need response — with aging indicators | HubSpot Missed Conversations | P1 | T-194 |
| F-134 | Communication Templates | Quick-reply templates for common communication patterns | Salesforce Quick Text | P1 | T-195 |
| F-135 | LinkedIn Message Integration | Track LinkedIn messages as part of communication history (manual logging or API) | N/A (new) | P2 | T-196 |
| F-136 | Phone Call Logging | Log call notes, duration, outcome after phone conversations | HubSpot Call Logging | P1 | T-197 |
| F-137 | Communication Analytics | Response time trends, channel preference by contact, communication volume over time | N/A (new) | P2 | T-198 |

### 2.13 PRODUCTS & SERVICES PORTAL (NEW — 10 features)

**Current:** Nothing. No product/service catalog.
**Required:** Full offering catalog with signal-to-product mapping — the bridge between intelligence and revenue.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### 2.14 PROJECTS PORTAL (NEW — 6 features)

**Current:** Nothing. No project management.
**Required:** Project status reporting and tracking for mandates/engagements.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-148 | Project List Page | `/projects` — active projects with status, health, owner, deadline | Linear Projects | P1 | T-076 (V2) |
| F-149 | Project Detail Page | Milestones, deliverables, team, timeline, budget, status updates | Linear Project Detail | P1 | T-077 (V2) |
| F-150 | Project Status Report Generator | AI-generated status reports: progress, blockers, next steps, risk assessment | N/A (new) | P0 | T-078 (V2) |
| F-151 | Project-to-Mandate Linking | Projects linked to mandates — see which projects support which mandates | N/A (new) | P1 | T-079 (V2) |
| F-152 | Project Timeline/Gantt | Visual timeline with milestones and dependencies | Linear Timeline | P2 | T-209 |
| F-153 | Project Dashboard | Aggregate view: all projects, health distribution, resource allocation | N/A (new) | P1 | T-210 |

### 2.15 REPORTS PORTAL (NEW — 8 features)

**Current:** Report generation exists (cluster, signal digest, pipeline review) but no dedicated reports portal.
**Required:** Dedicated reporting hub with custom reports, scheduling, and export.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-154 | Reports Hub Page | `/reports` — centralized location for all reports, organized by type | Salesforce Reports | P1 | T-211 |
| F-155 | Custom Report Builder | Build custom reports: select entity, fields, filters, groupings, chart type | HubSpot Report Builder | P2 | T-212 |
| F-156 | Scheduled Report Generation | Auto-generate and email reports on schedule (daily/weekly/monthly) | Salesforce Scheduled Reports | P1 | T-213 |
| F-157 | Report Templates | Pre-built templates: Weekly Pipeline Review, Monthly BD Summary, Cluster Health, Signal Digest | N/A (new) | P1 | T-214 |
| F-158 | Comparative Analytics | Compare periods (MoM, QoQ, YoY) across all metrics | N/A (new) | P2 | T-215 |
| F-159 | Executive Summary Generator | AI generates executive summary from data — "here's what happened this week" | N/A (new) | P0 | T-216 |
| F-160 | Report Export (PDF/Excel/PPTX) | Export reports in multiple formats for distribution | Salesforce Report Export | P1 | T-217 |
| F-161 | Shared Reports | Share reports with team members via link | N/A (new) | P2 | T-218 |

### 2.16 INTEGRATIONS HUB (NEW — 7 features)

**Current:** No integration management UI. Wave and DEX connections are implicit.
**Required:** Full integration management for the three-platform ecosystem.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| F-162 | Integrations Page | `/integrations` — catalog of connected systems, connection status, sync health | HubSpot Integrations | P1 | T-219 |
| F-163 | Wave Connection Manager | Configure VISTA ↔ Wave sync: which signals push, which campaign data pulls, sync frequency | N/A (new) | P0 | T-220 |
| F-164 | DEX AI Connection Manager | Configure VISTA ↔ DEX sync: mandates, candidates, placements, consultant data | N/A (new) | P0 | T-221 |
| F-165 | Sync Health Monitor | Real-time status of all integrations — last sync time, error count, data volume | N/A (new) | P1 | T-222 |
| F-166 | Data Sync Logs | Detailed logs of what data was synced, when, and any errors | N/A (new) | P1 | T-223 |
| F-167 | Webhook Management | Configure webhooks for real-time event notifications between platforms | N/A (new) | P2 | T-224 |
| F-168 | API Key Management | Manage API keys for external integrations | N/A (new) | P1 | T-225 |

---

## Part 3: Three-Platform Architecture (VISTA ↔ Wave ↔ DEX AI)

### Platform Roles

| Platform | Role | Key Data |
|----------|------|----------|
| **VISTA** | BD Intelligence & CRM | Contacts, companies, signals, pipeline, campaigns, mandates, assessments |
| **Wave** | Marketing Planning & Execution | Campaigns, content calendar, event management, newsletter, webinar tracking, audience engagement |
| **DEX AI** | ATS & Project Management | Consultant profiles, client engagements, candidate placements, project delivery, billing |

### Three-Way Data Flows

#### VISTA → Wave (Intelligence drives Marketing)

| Data | Purpose | Priority | Ticket |
|------|---------|----------|--------|
| Contact signals → Wave | Wave uses signals to plan targeted campaigns | P0 | T-226 |
| Cluster insights → Wave | Wave creates cluster-specific marketing content | P0 | T-227 |
| Product recommendations → Wave | Wave promotes recommended products via campaigns | P0 | T-228 |
| Contact preferences → Wave | Wave respects communication preferences (channel, frequency) | P1 | T-229 |
| Pipeline stage → Wave | Wave adjusts messaging based on where contact is in pipeline | P1 | T-230 |

#### Wave → VISTA (Marketing feeds Intelligence)

| Data | Purpose | Priority | Ticket |
|------|---------|----------|--------|
| Webinar attendance → VISTA | Logged as inbound signal for contacts who attended | P0 | T-231 |
| Newsletter read/subscription → VISTA | Tracked as engagement signal | P0 | T-232 |
| Workshop request → VISTA | Creates activity + signal in VISTA | P0 | T-233 |
| Podcast invitation/attendance → VISTA | Tracked as engagement signal | P1 | T-234 |
| Coaching request → VISTA | Creates inbound opportunity signal | P0 | T-235 |
| Campaign performance → VISTA | Updates contact engagement scores, campaign ROI | P1 | T-236 |
| Content engagement metrics → VISTA | Which contacts engaged with which content | P1 | T-237 |

#### VISTA → DEX AI (CRM feeds ATS/Consulting)

| Data | Purpose | Priority | Ticket |
|------|---------|----------|--------|
| Mandate data → DEX | DEX manages consultant assignment and project delivery | P0 | T-238 |
| Candidate matches → DEX | DEX tracks candidate submissions and placements | P0 | T-239 |
| Contact assessments → DEX | DEX uses assessment data for consultant matching | P1 | T-240 |
| Company intelligence → DEX | DEX uses company context for project scoping | P1 | T-241 |

#### DEX AI → VISTA (ATS feeds CRM)

| Data | Purpose | Priority | Ticket |
|------|---------|----------|--------|
| Placement outcomes → VISTA | Updates pipeline stage, contact status, success metrics | P0 | T-242 |
| Consultant performance → VISTA | Informs VISTA about delivery quality for future recommendations | P2 | T-243 |
| Project status → VISTA | Updates project portal with delivery milestones | P1 | T-244 |
| Client feedback → VISTA | Feeds back into contact/company health scores | P1 | T-245 |

### Shared Data Layer (Supabase)

All three platforms read/write to shared Supabase tables:

| Table | VISTA | Wave | DEX |
|-------|-------|------|-----|
| `vista_contacts` | R/W | R | R |
| `vista_companies` | R/W | R | R |
| `vista_signals` | R/W | R (inbound) | R |
| `vista_campaigns` | R/W | R/W (execution) | R |
| `vista_mandates` | R/W | R | R/W |
| `vista_activities` | R/W | R/W | R/W |
| `vista_assessments` | R/W | R | R/W |
| `vista_meetings` | R/W | R | R |
| `vista_products` | R/W | R/W | R |
| `vista_score_history` | R/W | R | R |

---

## Part 4: AI Intelligence Layer — Signal-to-Revenue Engine

### The Core Intelligence Loop

```
1. SIGNAL DETECTION
   → Inbound activity (webinar, newsletter, workshop, podcast, coaching)
   → Market signals (funding, hiring, expansion, leadership change)
   → Engagement signals (email opens, meeting requests, content downloads)
   → Behavioral signals (website visits, event attendance, referral activity)

2. SIGNAL ANALYSIS
   → Score urgency and relevance
   → Map to contact/company profile
   → Correlate across entities
   → Detect patterns and anomalies

3. PRODUCT/SERVICE MAPPING
   → Match signals to relevant products/services
   → Score fit (product-market fit)
   → Identify cross-sell and upsell opportunities
   → Recommend advisory approach

4. CONTENT GENERATION
   → AI generates proposals based on signal + product match
   → AI generates personalized emails with full context
   → AI generates presentation decks tailored to the contact
   → AI generates campaign concepts from signal clusters
   → AI generates webinar/workshop ideas from signal patterns

5. EXECUTION & TRACKING
   → Push campaigns to Wave for execution
   → Track engagement back as new signals
   → Update scores and recommendations
   → Loop continuously
```

### AI Features by Page

| Page | AI Capability | Description | Priority | Ticket |
|------|---------------|-------------|----------|--------|
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

---

## Part 5: Cross-Cutting Capabilities (Platform-Wide)

These features apply across ALL pages/portals.

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

---

## Part 6: Design Craft — "No More Clunkiness" (Platform-Wide)

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

## Part 7: Complete Ticket Summary

### V2 Tickets (T-01 to T-100) — Already Documented

100 tickets across 12 domains. See VISTA_V2_GAP_ANALYSIS.md.

### V3 New Tickets (T-101 to T-293)

| Domain | # New | P0 | P1 | P2 |
|--------|-------|----|----|-----|
| Dashboard | 15 | 5 | 7 | 3 |
| Contacts | 18 | 5 | 9 | 4 |
| Companies (NEW) | 14 | 6 | 6 | 2 |
| Pipeline | 12 | 4 | 5 | 3 |
| Signals | 10 | 4 | 3 | 3 |
| Campaigns | 12 | 4 | 5 | 3 |
| Clusters | 8 | 0 | 5 | 3 |
| Activities | 8 | 2 | 5 | 1 |
| Mandates (NEW) | 12 | 8 | 2 | 2 |
| Meetings (NEW) | 10 | 6 | 2 | 2 |
| Assessment (NEW) | 10 | 6 | 3 | 1 |
| Communications (NEW) | 8 | 4 | 3 | 1 |
| Products & Services (NEW) | 10 | 5 | 3 | 2 |
| Projects (NEW) | 6 | 1 | 4 | 1 |
| Reports (NEW) | 8 | 1 | 5 | 2 |
| Integrations (NEW) | 7 | 2 | 4 | 1 |
| Three-Platform Sync | 20 | 12 | 5 | 3 |
| AI Intelligence Layer | 12 | 11 | 1 | 0 |
| Cross-Cutting | 18 | 3 | 11 | 4 |
| Design Craft | 18 | 10 | 7 | 1 |
| **V3 TOTAL** | **193** | **99** | **68** | **26** |

### Grand Total: 293 Tickets (V2 100 + V3 193)

| Priority | Count | Est. Dev Days |
|----------|-------|---------------|
| P0 | 132 (33 V2 + 99 V3) | ~180 days |
| P1 | 108 (40 V2 + 68 V3) | ~130 days |
| P2 | 46 (20 V2 + 26 V3) | ~50 days |
| P3 | 7 (7 V2) | ~7 days |
| **TOTAL** | **293** | **~367 dev-days** |

---

## Part 8: Revised Execution Waves

### Wave 2: Context & Connectivity (V2 original — 17 days)
Still valid. Foundation for everything else.
- T-009 to T-017 (Signal Cross-Connectivity)
- T-044 to T-053 (Global Context System)
- T-088, T-089 (Navigation)

### Wave 3: New Portals — Companies, Mandates, Meetings (18 days)
- F-034 to F-047 (Companies Portal)
- F-098 to F-109 (Mandates Portal)
- F-110 to F-119 (Meetings Portal)

### Wave 4: Contact Depth & CV (13 days — V2 original)
- T-01 to T-08 (CV/Resume)
- T-09 to T-17 (Signal connectivity)

### Wave 5: Products, Assessment, Communications (15 days)
- F-138 to F-147 (Products & Services)
- F-120 to F-129 (Assessment & Diagnostics)
- F-130 to F-137 (Communications)

### Wave 6: Pipeline, Campaigns, Projects (14 days)
- F-048 to F-059 (Pipeline Enhancement)
- F-070 to F-081 (Campaign Enhancement)
- F-148 to F-153 (Projects)

### Wave 7: Three-Platform Integration (16 days)
- F-162 to F-168 (Integration Hub)
- F-226 to F-245 (All three-way sync tickets)

### Wave 8: AI Intelligence Layer (14 days)
- F-246 to F-257 (AI features by page)
- Signal-to-product mapping engine
- Proposal/deck generation

### Wave 9: Design Craft & Polish (15 days)
- F-276 to F-293 (Design quality)
- V2 Design Craft tickets

### Wave 10: Reports, Analytics & Remaining (12 days)
- F-154 to F-161 (Reports Portal)
- F-082 to F-089 (Cluster analytics)
- Remaining cross-cutting features

**Total estimated timeline: ~134 dev-days across 9 waves**

---

## Part 9: Inbound Signal Intelligence — Detailed Specification

### What Are Inbound Signals?

Inbound signals are **engagement actions** taken by contacts that indicate interest, intent, or activity. These are tracked by **Wave** (marketing platform) and stored in **Supabase** for VISTA to consume.

### Signal Types

| Signal Type | Source | Weight | Action Trigger |
|-------------|--------|--------|----------------|
| Webinar attendance | Wave events | High | Suggest follow-up meeting |
| Newsletter subscription | Wave content | Low | Add to nurture campaign |
| Newsletter read/open | Wave content | Medium | Boost engagement score |
| Workshop request | Wave events | High | Create activity + suggest scheduling |
| Podcast invitation | Wave content | Medium | Track in activity timeline |
| Podcast attendance/listen | Wave content | Medium | Boost engagement score |
| Coaching request | Wave services | High | Create inbound opportunity |
| Content download | Wave content | Medium | Signal interest in topic |
| Event registration | Wave events | Medium | Add to pre-event campaign |
| Event attendance | Wave events | High | Post-event follow-up sequence |
| Resource request | Wave content | Medium | Suggest relevant product |
| Referral submission | VISTA | High | Create referral link in network |

### Signal Flow: Wave → Supabase → VISTA

```
Wave tracks engagement
    ↓
Wave writes to Supabase `vista_signals` table
    ↓
VISTA reads signals via API
    ↓
VISTA displays in:
  - Contact detail (Inbound Activity tab)
  - Signals page (filtered by source=inbound)
  - Dashboard (signal ticker)
  - AI Summary (context for recommendations)
    ↓
AI maps signal → product/service recommendation
    ↓
AI generates suggested action (email, call, meeting invite)
    ↓
Action executed → tracked as activity → generates new signal
    ↓
Loop continues
```

---

## Part 10: What's Critical vs. What Can Wait

### Tier 1 — Can't Ship Without These (P0, must be in next 3 waves)

| Feature | Why Critical |
|---------|-------------|
| Companies Portal | BD without company intelligence is contact management, not intelligence |
| Mandates Portal | Core BD workflow — matching talent to opportunities |
| Meetings Portal | Meeting intelligence is how BD actually operates |
| Products & Services | Can't do signal-to-product mapping without a product catalog |
| Full CV on Contacts | Kevin explicitly demanded this multiple times |
| Signal Cross-Connectivity | The "intelligence" in BD intelligence requires connecting signals |
| Communications Portal | Can't track BD without tracking communications |
| Inbound Signal Integration | Wave integration is core to the three-platform vision |
| AI Proposal Generation | The revenue engine — signal → product → proposal |
| Dashboard Command Center | First thing users see — must be actionable |

### Tier 2 — Important for Parity (P1, within 6 waves)

| Feature | Why Important |
|---------|--------------|
| Pipeline Kanban + Forecasting | Every CRM has this — expected |
| Campaign Journeys + A/B Testing | Marketing automation parity |
| Assessment & Diagnostics | Kevin explicitly asked for this |
| Task Management | Can't manage BD without tasks |
| Reports Portal | Need structured reporting |
| Three-Platform Full Sync | Architecture requirement |
| Role-Based Access Control | Multi-user requirement |
| Calendar Integration | Meeting management needs calendar |

### Tier 3 — Nice to Have (P2, when foundation is solid)

| Feature | Why Nice |
|---------|---------|
| Dark Mode | Quality of life |
| Duplicate Detection | Data hygiene |
| Custom Objects | Flexibility |
| Advanced Analytics | Depth |
| Mobile Optimization | Accessibility |
| Keyboard Shortcuts | Power users |

---

## Appendix: Complete Feature Count by Portal

| Portal | Features | New Pages | New Components | New API Routes |
|--------|----------|-----------|----------------|----------------|
| Dashboard | 15 | 0 | 8 | 3 |
| Contacts | 18 | 0 | 5 | 2 |
| Companies | 14 | 2 | 7 | 4 |
| Pipeline | 12 | 0 | 4 | 2 |
| Signals | 10 | 0 | 3 | 2 |
| Campaigns | 12 | 0 | 5 | 3 |
| Clusters | 8 | 0 | 3 | 2 |
| Activities | 8 | 0 | 4 | 2 |
| Mandates | 12 | 2 | 6 | 4 |
| Meetings | 10 | 2 | 5 | 3 |
| Assessment | 10 | 1 | 5 | 3 |
| Communications | 8 | 1 | 4 | 2 |
| Products & Services | 10 | 2 | 5 | 3 |
| Projects | 6 | 2 | 3 | 2 |
| Reports | 8 | 1 | 4 | 2 |
| Integrations | 7 | 1 | 3 | 2 |
| Three-Platform | 20 | 0 | 0 | 6 |
| AI Intelligence | 12 | 0 | 6 | 4 |
| Cross-Cutting | 18 | 0 | 8 | 2 |
| Design Craft | 18 | 0 | 10 | 0 |
| **TOTAL** | **193** | **14** | **91** | **49** |

**Combined with V2's 100 tickets: 293 total features, 14 new pages, 91 new components, 49 new API routes.**

This is the exhaustive inventory. Every page, every portal, every feature. Nothing forgotten.
