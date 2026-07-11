# VISTA V4 — Action-Pushing Intelligence Platform

**Author:** James/AI (PM) | **Date:** 2026-07-11 | **Status:** Ready for Kevin Review
**Supersedes:** VISTA_V3_EXHAUSTIVE_FEATURE_MAP.md (V3 — 293 tickets)
**Trigger:** Kevin's feedback on Signals depth, LENS recommendations, gamification, Kanban-first, action-pushing UX

---

## Philosophy Shift

V1-V3 treated VISTA as a **data display platform** — show contacts, show signals, show pipeline.

Kevin's feedback makes clear VISTA must be an **action-pushing intelligence platform**:
- **Don't show me lists — push me to act.**
- **Don't give me scores — give me insights and narratives.**
- **Don't wait for me to ask — tell me what to do, why, and how.**
- **Don't let me stop — gamify, encourage, incentivize.**
- **Don't make me navigate — bring the right thing to the top.**

### Core UX Principles (from Kevin's feedback)

1. **No full lists. Ever.** Everything must be filtered, grouped, categorized, prioritized.
2. **Action-first.** Every view must push the next action. "Contact X because Y. Send Z."
3. **Kanban-first.** Trello-style boards across projects, contacts, pipelines, actions, clusters, campaigns.
4. **Qualitative over quantitative.** Signals aren't scores — they're market intelligence narratives.
5. **Gamified momentum.** Daily targets, streaks, progress bars, celebrations.
6. **Strategic BD recommendations.** Always pushing toward next steps, nurturing the funnel.
7. **Timing-aware.** Clock actions, track cadence, remind about follow-ups.
8. **Auto-log everything.** Meeting transcripts, emails, communications → Supabase → activity trail.
9. **Shareable outputs.** Reports, status updates, message links — like Lovable/Replit shareable previews.
10. **AI-native.** Like Notion AI — intelligence embedded in every interaction, not bolted on.

---

## Part 1: Qualitative Intelligence Engine

### Problem with Current State

Signals today are: type + strength (Low/Medium/High) + one-line description. That's not intelligence — that's a notification.

LENS today: generates V/I/S/T/A scores. That's a ranking, not a recommendation.

### What Kevin Wants

**Signals = Market Intelligence Briefs**
Each signal should contain exhaustive qualitative information:
- What happened (the event)
- Why it matters (market context)
- Who is affected (contacts, companies, clusters)
- What the implications are (opportunities, risks)
- What to do about it (recommended actions)
- What to say (suggested messaging angles)

**LENS = Strategic Advisor**
LENS should not just score — it should:
- Recommend WHICH contacts to engage and WHY
- Prepare email drafts with full context (contact + company + history + signals + relationship)
- Recommend cluster assignments and campaign placements
- Suggest communication templates (podcast invite, webinar invite, exploratory call, follow-up, etc.)
- Explain the reasoning behind every recommendation

### New Features — Qualitative Intelligence

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### New DB Tables for Qualitative Intelligence

```sql
-- Signal intelligence briefs (stored, not generated on-the-fly)
CREATE TABLE vista_signal_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES signals(id),
  brief_text text,           -- Full intelligence narrative
  market_context text,       -- Why this matters
  affected_entities jsonb,   -- Contacts, companies, clusters affected
  recommended_actions jsonb, -- [{action, why, priority, channel}]
  messaging_angles jsonb,    -- [{angle, rationale}]
  generated_at timestamptz,
  edited_at timestamptz,
  edited_by text
);

-- Contact opportunity briefs
CREATE TABLE vista_contact_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES vista_contacts(id),
  who_they_are text,
  company_situation text,
  what_we_can_offer text,
  how_to_approach text,
  what_to_avoid text,
  relationship_summary text,
  generated_at timestamptz,
  updated_at timestamptz
);

-- LENS recommendations (stored)
CREATE TABLE vista_lens_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES vista_contacts(id),
  recommendation_type text,  -- 'contact', 'cluster', 'campaign', 'action'
  who_to_contact text,
  why text,
  how text,                  -- Channel + template
  what_to_say text,          -- Messaging angles
  email_draft text,
  confidence float,
  generated_at timestamptz,
  acted_on boolean DEFAULT false,
  acted_at timestamptz
);
```

---

## Part 2: Action-Pushing Engine & Gamification

### Problem with Current State

Dashboard shows data. It doesn't push you to act. There's no sense of momentum, urgency, or achievement.

### What Kevin Wants

- "Push me for taking actions with contacts"
- "Tracking how many are contacted per day"
- "Reminding me encouraging me incentivizing via gamification"
- "Encouraging to take care of certain clusters"
- "Push the funnel to the next steps"
- "Be careful of timing and clocking actions"

### New Features — Action Engine

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

### Gamification UX Patterns

```
┌─────────────────────────────────────────────────┐
│  🔥 7-day streak   │   3/5 today   │   68% weekly │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                 │
│  NEXT ACTION:                                   │
│  ┌─────────────────────────────────────────────┐│
│  │ 1. Email Sarah Chen (FinTech, Singapore)    ││
│  │    WHY: Signal detected — Series B funding  ││
│  │    HOW: Email — use "Congrats + Explore"    ││
│  │    WHAT: "Congrats on the Series B! I'd..." ││
│  │    [Send Email] [Log Call] [Skip →]         ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ 2. Follow up with Marcus Lee (HealthTech)   ││
│  │    WHY: 14 days since last contact (overdue)││
│  │    HOW: LinkedIn message — re-engagement    ││
│  │    [Send LinkedIn] [Log Call] [Skip →]      ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  CLUSTER ALERT:                                 │
│  APAC FinTech — 5 days since last activity      │
│  [Take Action]                                   │
└─────────────────────────────────────────────────┘
```

---

## Part 3: Kanban-First UX — No Full Lists Ever

### Problem with Current State

Every page is a table/list. Contacts = table. Signals = table. Activities = table. Pipeline = list.
Kevin: "I do not want to see full list of anything ever."

### What Kevin Wants

- Kanban Trello-style across projects, contacts, pipelines, actions
- Filtered, grouped, categorized, prioritized views
- Layout adapts to show immediate actions and targeted strategy
- Status-change views with priority logic

### New Features — Kanban & Priority Views

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

---

## Part 4: Structured Action Intelligence

### Problem with Current State

Actions are a flat list with type (Email Sent, Call, Meeting) and notes. No categorization of PURPOSE, no structured tracking of INTENT, no measurement of EFFECTIVENESS.

### What Kevin Wants

"Structured and detailed categorization of actions" — every action should be categorized by:
- Purpose (why was this action taken?)
- Type (what channel?)
- Outcome (what happened?)
- Next step (what's the follow-up?)

### New Features — Action Taxonomy

| # | Feature | Description | Priority | Ticket |
|---|---------|-------------|----------|--------|
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

---

## Part 5: Auto-Logging & Supabase Sync

### Problem with Current State

Emails sent via the platform are logged but inconsistently. Meeting transcripts are not auto-logged. Communications from different channels are siloed.

### What Kevin Wants

"Log meeting transcripts, log email communication when done via the platform, into Supabase"
"Activities per account, contacts, cluster"

### New Features — Auto-Logging

| # | Feature | Description | Priority | Ticket |
|---|---------|-------------|----------|--------|
| AL-01 | Email Auto-Log | Every email sent via platform auto-creates an activity record with: type, purpose, template, outcome fields | P0 | T-349 |
| AL-02 | Meeting Transcript Auto-Log | Uploaded/pasted transcripts auto-create meeting + activity records, link to all attendees | P0 | T-350 |
| AL-03 | Communication Channel Log | Every communication (email, LinkedIn, phone, in-person) logged with channel, purpose, outcome | P0 | T-351 |
| AL-04 | Activity → Signal Generation | Logged activities can trigger signal detection: "Meeting held" = positive engagement signal | P1 | T-352 |
| AL-05 | Activity → Score Update | Logged activities update contact scores: email sent = touch_count++, meeting held = engagement_score boost | P1 | T-353 |
| AL-06 | Cross-Entity Activity View | View activities by: contact, company, cluster, campaign, mandate. Same activity appears in all relevant views. | P0 | T-354 |
| AL-07 | Activity Search & Filter | Full-text search across all activities. Filter by: type, purpose, outcome, date range, entity. | P1 | T-355 |
| AL-08 | Duplicate Activity Prevention | Prevent double-logging: if an email was already logged, don't create a duplicate. | P2 | T-356 |

---

## Part 6: Shareable Outputs & Report Generation

### Problem with Current State

Reports are generated but only viewable in-app. No shareable links, no external distribution.

### What Kevin Wants

"Report generation, analysis, status update, message update incl link sender like loveable or replit"

### New Features — Shareable Outputs

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| SO-01 | Shareable Report Links | Every report gets a unique URL that can be shared externally (like Lovable share links). No login required for viewers. | Lovable Share Links | P0 | T-357 |
| SO-02 | Shareable Contact Briefs | Share a contact's brief via link — useful for team members or external partners | N/A | P1 | T-358 |
| SO-03 | Shareable Cluster Reports | Share cluster intelligence reports via link | N/A | P1 | T-359 |
| SO-04 | Email Status Updates | Auto-generate status update emails: "Here's what happened this week" — with embedded charts and links | N/A | P0 | T-360 |
| SO-05 | PDF Report Export | Professional PDF export for any report, brief, or summary | N/A | P0 | T-361 |
| SO-06 | PPTX Export | Presentation-ready export for executive summaries, cluster reports, proposal decks | N/A | P1 | T-362 |
| SO-07 | Scheduled Report Distribution | Auto-email reports on schedule: "Every Monday, send pipeline report to team" | Salesforce Scheduled Reports | P1 | T-363 |
| SO-08 | Embedded Report Links | Reports can be embedded in emails, Feishu messages, or other platforms via iframe/link | N/A | P2 | T-364 |

---

## Part 7: Funnel Management & Nurture Engine

### Problem with Current State

Pipeline shows stages but doesn't actively manage the funnel. No nurture workflows, no funnel health monitoring, no proactive progression.

### What Kevin Wants

"Encouraging me building a strong funnel"
"Push the funnel to the next steps"
"Although we may start from scratch in the beginning, need to help me nurture"

### New Features — Funnel Engine

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
| FN-01 | Funnel Health Dashboard | Visual funnel: count and value at each stage. Highlight bottlenecks: "Too many stuck in Engaged" | HubSpot Funnel Analytics | P0 | T-365 |
| FN-02 | Stage Duration Alerts | "Contact X has been in 'Engaged' for 21 days — average is 10 days. Consider advancing or re-qualifying." | N/A | P0 | T-366 |
| FN-03 | Nurture Campaign Suggestions | When funnel is thin: "You have 3 cold contacts showing signals. Start a nurture campaign?" | N/A | P0 | T-367 |
| FN-04 | Auto-Advance Suggestions | AI suggests contacts ready to advance: "Sarah has 4 positive signals + 3 meetings → advance to Hot" | N/A | P0 | T-368 |
| FN-05 | Funnel Velocity Tracking | Track how fast contacts move through stages. Week over week improvement or regression. | Salesforce Path Pilot | P1 | T-369 |
| FN-06 | Re-Engagement Queue | Contacts who went cold: auto-surface for re-engagement with suggested approach | N/A | P0 | T-370 |
| FN-07 | Pipeline Balance Alerts | "Your pipeline is top-heavy: 20 cold, 5 engaged, 1 hot. Need to advance more contacts." | N/A | P1 | T-371 |
| FN-08 | Win Probability Scoring | Per-contact probability of conversion based on: signals, engagement, stage, history | Salesforce Opportunity Scoring | P1 | T-372 |

---

## Part 8: Editable Tables & Layouts

### Problem with Current State

Tables are read-only for most data. Can't inline-edit most fields. Can't customize layouts.

### What Kevin Wants

"Editable tables and editable layout"
"Manage things within the app, like a proper CRM"

### New Features — Editable Everything

| # | Feature | Description | Reference | Priority | Ticket |
|---|---------|-------------|-----------|----------|--------|
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

---

## Part 9: V4 Ticket Summary

| Category | # Tickets | P0 | P1 | P2 |
|----------|-----------|----|----|-----|
| Qualitative Intelligence (QI) | 15 | 11 | 3 | 1 |
| Action-Pushing & Gamification (AP) | 15 | 10 | 3 | 2 |
| Kanban-First UX (KB) | 15 | 11 | 2 | 2 |
| Structured Action Intelligence (SA) | 10 | 6 | 3 | 1 |
| Auto-Logging & Sync (AL) | 8 | 5 | 2 | 1 |
| Shareable Outputs (SO) | 8 | 3 | 4 | 1 |
| Funnel Management (FN) | 8 | 5 | 3 | 0 |
| Editable Tables & Layouts (ET) | 10 | 6 | 4 | 0 |
| **V4 TOTAL** | **89** | **57** | **24** | **8** |

### Grand Total (V2 + V3 + V4): **382 tickets**

| Priority | Count | Est. Dev Days |
|----------|-------|---------------|
| P0 | 189 | ~250 days |
| P1 | 132 | ~155 days |
| P2 | 54 | ~55 days |
| P3 | 7 | ~7 days |
| **TOTAL** | **382** | **~467 dev-days** |

---

## Part 10: Revised Execution Waves

### Wave 2: Context & Connectivity (17d) — unchanged
### Wave 3: Qualitative Intelligence + Kanban-First (20d)
- QI-01 to QI-15 (Signal intelligence briefs, LENS recommendations, contact/company briefs)
- KB-01 to KB-15 (Kanban views across all pages, priority feed, smart defaults)
- This is the **transformative wave** — changes the entire UX paradigm

### Wave 4: Action-Pushing Engine + Gamification (18d)
- AP-01 to AP-15 (Daily targets, streaks, nudges, queue, follow-up clock)
- SA-01 to SA-10 (Action categorization, outcome tracking, next-step engine)

### Wave 5: New Portals — Companies, Mandates, Meetings (18d) — from V3
### Wave 6: Contact Depth & CV (13d) — from V2
### Wave 7: Funnel Management + Editable Everything (16d)
- FN-01 to FN-08 (Funnel health, nurture suggestions, auto-advance)
- ET-01 to ET-10 (Inline editing, bulk edit, custom layouts)

### Wave 8: Products, Assessment, Communications (15d) — from V3
### Wave 9: Auto-Logging + Shareable Outputs (14d)
- AL-01 to AL-08 (Email/transcript auto-logging, cross-entity activity)
- SO-01 to SO-08 (Shareable links, PDF/PPTX export, scheduled reports)

### Wave 10: Three-Platform Integration (16d) — from V3
### Wave 11: AI Intelligence Layer (14d) — from V3
### Wave 12: Design Craft & Polish (15d) — from V3

**Total: 12 waves, ~174 dev-days**

---

## Key Insight from Kevin's Feedback

The fundamental shift: VISTA is not a dashboard. It's a **BD co-pilot**.

Every screen should answer: **"What should I do right now, and why?"**

Not: "Here's a list of 200 contacts."
But: "Here are the 3 people you should contact today, here's why, here's what to say."

Not: "Here are 50 signals."
But: "Here's the market intelligence brief for this week: 4 opportunities, 2 risks, here's how to approach each."

Not: "Here's your pipeline."
But: "Your pipeline is thin at Proposal stage. Here are 3 contacts ready to advance. Click to advance."

This is the Notion AI philosophy applied to BD: the intelligence is not a feature — it IS the product.
