# Wave 1.5 — Funnel Core: Revenue Engine

**Status:** Spec Complete | **Priority:** 🔴 Ship Before Wave 3 | **Estimate:** 8 days

---

## 1. Overview

VISTA is not a contact manager. It is a **revenue engine**. This wave wires the core business funnel — 500 outreach → 50 conversations → 10 opportunities → 2 paid — into the platform so every contact has a stage, every stage has a next action, and no one falls through the cracks.

**Source document:** `LYC_Outreach_Funnel_500_to_Revenue.md`

### What This Wave Delivers

| Ticket | Name | Priority | Days |
|--------|------|----------|------|
| F-01 | Contact Funnel Extensions | 🔴 P0 | 0.5 |
| F-02 | Outreach Sequence Engine | 🔴 P0 | 2 |
| F-03 | Outreach Templates (4 seeded) | 🔴 P0 | 1 |
| F-04 | Outreach Tracking UI | 🔴 P0 | 1.5 |
| F-05 | Nurture Router | 🟡 P1 | 1 |
| F-06 | Opportunity Scoring | 🟡 P1 | 1 |
| F-07 | Weekly Rhythm Dashboard | 🟡 P1 | 0.5 |
| F-08 | 90-Day Milestone Tracker | 🟢 P2 | 0.5 |

### Core Principle
> "No dead ends." Every contact is either moving forward in the funnel or being actively nurtured. The system tells Kevin what to do next, every day.

---

## 2. Database Schema

### 2.1 F-01: Contact Funnel Extensions

**ALTER `vista_contacts`** — add 8 columns:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `bd_bucket` | VARCHAR(20) | NULL | A=Sniper, B=Trojan Horse, C=Farmer, D=Weiqi |
| `warmth_score` | SMALLINT | NULL | 1-5 (1=cold, 5=referral) |
| `funnel_stage` | VARCHAR(30) | 'outreach' | outreach → conversation → opportunity → paid → nurture |
| `outreach_count` | SMALLINT | 0 | Number of touches sent (max 4 before nurture) |
| `last_outreach_date` | DATE | NULL | Date of most recent outreach |
| `next_action_date` | DATE | NULL | When to act next |
| `next_action_type` | VARCHAR(30) | NULL | message / follow_up / content_engage / meeting / proposal / stop |
| `lead_source` | VARCHAR(40) | NULL | network / sales_nav / podcast / event / referral / content_engagement |

**Index:** `CREATE INDEX idx_contacts_funnel ON vista_contacts(funnel_stage, next_action_date);`

---

### 2.2 F-02: Outreach Sequence Engine

**CREATE `vista_outreach_sequences`** — tracks every outreach touch:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | PK | |
| `contact_id` | UUID | FK → vista_contacts | Who was contacted |
| `template_id` | UUID | FK → vista_outreach_templates | Which template used |
| `touch_number` | SMALLINT | NOT NULL | 1, 2, 3, or 4 |
| `channel` | VARCHAR(20) | NOT NULL | linkedin / email / intro |
| `sent_at` | TIMESTAMPTZ | NULL | When actually sent |
| `scheduled_at` | TIMESTAMPTZ | NOT NULL | When planned |
| `status` | VARCHAR(20) | 'scheduled' | scheduled / sent / replied / no_response / bounced |
| `response_text` | TEXT | NULL | Their reply (if any) |
| `response_sentiment` | VARCHAR(20) | NULL | positive / neutral / negative / not_interested |
| `notes` | TEXT | NULL | Kevin's notes on the interaction |
| `created_at` | TIMESTAMPTZ | NOW() | |
| `updated_at` | TIMESTAMPTZ | NOW() | |

**Cadence Rules (enforced in UI, not DB):**
- Touch 1: Day 0 (first message)
- Touch 2: Day 3 (engage with their content)
- Touch 3: Day 7 (second message, different angle)
- Touch 4: Day 14 (final touch — podcast/webinar invite)
- Day 21: AUTO → move to nurture if no reply

**Index:** `CREATE INDEX idx_outreach_contact ON vista_outreach_sequences(contact_id, touch_number);`
**Index:** `CREATE INDEX idx_outreach_scheduled ON vista_outreach_sequences(scheduled_at, status);`

---

### 2.3 F-03: Outreach Templates

**CREATE `vista_outreach_templates`** — the 4 archetypes + follow-up variants:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | PK | |
| `name` | VARCHAR(100) | NOT NULL | "Sniper — Personal Intro" |
| `bucket` | VARCHAR(20) | NOT NULL | sniper / trojan_horse / farmer / weiqi |
| `touch_number` | SMALLINT | NOT NULL | Which touch this template is for (1-4) |
| `subject_line` | TEXT | NULL | For email channel |
| `body_template` | TEXT | NOT NULL | Mustache-style: {{first_name}}, {{company}}, {{mutual_connection}}, etc. |
| `channel` | VARCHAR(20) | NOT NULL | linkedin / email / intro |
| `send_window` | VARCHAR(30) | 'Tue-Thu 9-10am' | Optimal send time |
| `variables` | JSONB | NULL | {"first_name": "string", "company": "string", ...} |
| `is_active` | BOOLEAN | true | |
| `created_at` | TIMESTAMPTZ | NOW() | |

**Seed Data (8 templates):**

1. **Sniper Touch 1** — "Mutual connection suggested I reach out..." (LinkedIn, Tue-Thu 9-10am)
2. **Trojan Horse Touch 1** — "I host Leaders in Motion podcast..." (LinkedIn, Tue-Thu 9-10am)
3. **Farmer Touch 1** — "I write about talent strategy..." (LinkedIn connect request)
4. **Farmer Touch 2** — "Thanks for connecting. I just published..." (LinkedIn follow-up Day 2-3)
5. **Weiqi Touch 1** — "I'm building a network of PE operating partners..." (LinkedIn/email)
6. **Sniper Touch 3** — "Sharing a relevant article..." (Day 7, different angle)
7. **Trojan Horse Touch 3** — "New episode just dropped..." (Day 7, podcast content)
8. **Universal Touch 4** — "Final touch — webinar/roundtable invite..." (Day 14)

---

### 2.4 F-05: Nurture Router

**CREATE `vista_nurture_routes`** — "No Dead End" tracking:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | PK | |
| `contact_id` | UUID | FK → vista_contacts | |
| `route_type` | VARCHAR(20) | NOT NULL | newsletter / podcast / webinar / linkedin / workshop |
| `entered_at` | TIMESTAMPTZ | NOW() | When they entered nurture |
| `entered_reason` | VARCHAR(40) | NOT NULL | max_touches / not_interested / no_budget / timing_off / low_score |
| `reengage_date` | DATE | NULL | Next re-engagement attempt |
| `reengage_count` | SMALLINT | 0 | How many re-engagements sent |
| `last_engagement_date` | DATE | NULL | Last time they engaged with any content |
| `status` | VARCHAR(20) | 'active' | active / reengaged / converted / unsubscribed |
| `notes` | TEXT | NULL | |
| `created_at` | TIMESTAMPTZ | NOW() | |

**Nurture Timing Rules:**
- Week 1: Personal note + newsletter add
- Week 2-4: Passive (they receive content, Kevin engages with their LinkedIn 2x/month)
- Month 2: Webinar invitation
- Month 3: Workshop invitation or new content piece
- Ongoing: Monthly podcast episode share (top 50 nurtures only)

**Index:** `CREATE INDEX idx_nurture_contact ON vista_nurture_routes(contact_id, status);`
**Index:** `CREATE INDEX idx_nurture_reengage ON vista_nurture_routes(reengage_date, status);`

---

### 2.5 F-06: Opportunity Scoring

**ALTER `vista_opportunities`** — add scoring fields:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `score_named_problem` | SMALLINT | 0 | +3 if they named a specific, urgent problem |
| `score_budget_authority` | SMALLINT | 0 | +3 if they have budget authority |
| `score_pricing_ask` | SMALLINT | 0 | +2 if they asked about pricing |
| `score_product_fit` | SMALLINT | 0 | +2 if problem maps to PRISM/BRIDGE/MOSAIC/SPARK/FORGE |
| `score_timeline` | SMALLINT | 0 | +2 if timeline < 6 months |
| `score_competitor_ref` | SMALLINT | 0 | +1 if they referenced a competitor |
| `total_score` | SMALLINT | 0 | Sum of above (computed) |
| `score_tier` | VARCHAR(20) | NULL | 'opportunity' (7+) / 'warm_nurture' (4-6) / 'early' (1-3) |
| `product_recommendation` | VARCHAR(30) | NULL | PRISM / BRIDGE / MOSAIC / SPARK / FORGE |
| `first_step_price` | DECIMAL(10,2) | NULL | Diagnostic price (8-25K) |
| `full_engagement_price` | DECIMAL(10,2) | NULL | Full service price (30-120K) |

**Computed column trigger:**
```sql
-- Auto-compute total_score and score_tier on UPDATE
CREATE OR REPLACE FUNCTION fn_compute_opportunity_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score = COALESCE(NEW.score_named_problem, 0)
    + COALESCE(NEW.score_budget_authority, 0)
    + COALESCE(NEW.score_pricing_ask, 0)
    + COALESCE(NEW.score_product_fit, 0)
    + COALESCE(NEW.score_timeline, 0)
    + COALESCE(NEW.score_competitor_ref, 0);
  
  NEW.score_tier = CASE
    WHEN NEW.total_score >= 7 THEN 'opportunity'
    WHEN NEW.total_score >= 4 THEN 'warm_nurture'
    ELSE 'early'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunity_score
  BEFORE INSERT OR UPDATE ON vista_opportunities
  FOR EACH ROW EXECUTE FUNCTION fn_compute_opportunity_score();
```

---

## 3. API Contracts

### 3.1 Outreach Sequences

```
GET /api/outreach?status=scheduled&limit=20
  → Today's planned outreaches

POST /api/outreach
  Body: { contact_id, template_id, channel, scheduled_at }
  → Creates sequence entry, updates vista_contacts.outreach_count + last_outreach_date + next_action_date

PATCH /api/outreach/:id
  Body: { status, response_text, response_sentiment, notes }
  → Marks touch as sent/replied. If replied → auto-advance funnel_stage to 'conversation'

GET /api/outreach/overdue
  → Touches past scheduled_at with status='scheduled'
```

### 3.2 Nurture Router

```
POST /api/nurture/route
  Body: { contact_id, route_type, entered_reason }
  → Creates nurture route, sets funnel_stage='nurture'

GET /api/nurture?status=active&reengage_before=2026-07-15
  → Nurtures needing re-engagement

PATCH /api/nurture/:id
  Body: { status, reengage_date, notes }
  → Update nurture status or schedule next re-engagement
```

### 3.3 Funnel Dashboard

```
GET /api/funnel/summary
  → { outreach: 120, conversation: 18, opportunity: 5, paid: 1, nurture: 89 }
  → { conversion_rates: { outreach_to_conversation: 15%, ... } }
  → { today_actions: { outreaches_due: 8, follow_ups: 3, meetings: 2 } }
  → { weekly_target: { sent: 12, target: 20, progress: 60% } }

GET /api/funnel/next-actions
  → Top 10 contacts needing action today, sorted by priority
  → [ { contact, funnel_stage, next_action_type, next_action_date, days_overdue } ]
```

### 3.4 Opportunity Scoring

```
PATCH /api/opportunities/:id/score
  Body: { score_named_problem: 3, score_budget_authority: 3, ... }
  → Auto-computes total_score + score_tier via trigger

GET /api/opportunities?score_tier=opportunity&sort=total_score.desc
  → High-priority opportunities
```

---

## 4. UI Components

### 4.1 F-04: Outreach Tracking Panel

**Location:** Contact Detail page — new tab "Outreach"

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ OUTREACH TIMELINE                               │
│                                                 │
│  Touch 1 ✅ Sent Jul 8 (LinkedIn)               │
│    Template: Sniper — Personal Intro            │
│    Status: No response                          │
│                                                 │
│  Touch 2 ⏳ Scheduled Jul 11 (LinkedIn)         │
│    Template: Sniper Touch 3 — Article Share     │
│    Status: Pending                              │
│    [Send Now] [Reschedule] [Skip to Touch 3]    │
│                                                 │
│  Touch 3 🔲 Planned Jul 18                      │
│  Touch 4 🔲 Planned Jul 29                      │
│                                                 │
│  ─── After Touch 4 ───                          │
│  If no reply → Auto-route to Nurture            │
│                                                 │
│  [Compose Custom Message]                       │
└─────────────────────────────────────────────────┘
```

### 4.2 F-04: Outreach Queue (Dashboard Widget)

**Location:** Dashboard — "Today's Actions" widget

```
┌─────────────────────────────────────────────────┐
│ TODAY'S OUTREACH (8 due)                        │
│                                                 │
│  🔴 OVERDUE (2)                                 │
│  ▸ Zhang Wei — Touch 2 (3 days late)            │
│  ▸ Li Ming — Touch 3 (1 day late)               │
│                                                 │
│  🟡 DUE TODAY (4)                               │
│  ▸ Wang Fang — Touch 1 (Sniper)                 │
│  ▸ Chen Hao — Touch 2 (Farmer)                  │
│  ▸ Liu Yan — Touch 1 (Trojan Horse)             │
│  ▸ Zhao Peng — Touch 3 (Weiqi)                  │
│                                                 │
│  🔵 UPCOMING (2)                                │
│  ▸ Sun Lei — Touch 1 (Tomorrow)                 │
│  ▸ Zhou Jun — Touch 2 (Tomorrow)                │
│                                                 │
│  [Open Queue →]                                 │
└─────────────────────────────────────────────────┘
```

### 4.3 F-07: Weekly Rhythm Widget

**Location:** Dashboard — sidebar or below KPICards

```
┌─────────────────────────────────────────────────┐
│ WEEKLY RHYTHM (Jul 7-11)                        │
│                                                 │
│  Outreach Sent    ████████░░░░ 12/20 (60%)      │
│  Follow-ups       ██████░░░░░░  6/10            │
│  Conversations    ██░░░░░░░░░░  2/5             │
│  Content Engage   ████░░░░░░░░  4/8             │
│                                                 │
│  90-DAY PROGRESS                                │
│  Week 3 of 13  ████████░░░░░░ 23%              │
│  Milestones: ✅ Hit list built                   │
│              ✅ First outreaches sent            │
│              🔄 First conversations (in progress)│
│              ○ Opportunities identified          │
│              ○ First proposals                   │
│              ○ First closes                      │
└─────────────────────────────────────────────────┘
```

### 4.4 F-01: Funnel Stage Badge (Contact Table)

**Location:** Contacts table — new column "Stage"

```
| Stage Badge Design                           |
|                                               |
|  Outreach    → Blue dot ●                     |
|  Conversation → Green dot ●                   |
|  Opportunity  → Orange diamond ◆              |
|  Paid         → Gold star ★                   |
|  Nurture      → Gray circle ○                 |
```

### 4.5 F-06: Opportunity Score Card

**Location:** Opportunity Detail page

```
┌─────────────────────────────────────────────────┐
│ OPPORTUNITY SCORE: 9/13 — 🔥 OPPORTUNITY       │
│                                                 │
│  ☑ Named urgent problem        +3               │
│  ☑ Budget authority            +3               │
│  ☐ Asked about pricing          0               │
│  ☑ Maps to BRIDGE              +2               │
│  ☑ Timeline < 6 months         +2               │
│  ☐ Referenced competitor        0               │
│                                                 │
│  Recommended: BRIDGE Diagnostic                 │
│  First Step: ¥250,000 → Full: ¥800,000         │
│                                                 │
│  [Send Proposal] [Schedule Follow-up]           │
└─────────────────────────────────────────────────┘
```

### 4.6 F-05: Nurture Panel

**Location:** Contact Detail — "Nurture" section (visible when funnel_stage = 'nurture')

```
┌─────────────────────────────────────────────────┐
│ NURTURE STATUS: Active                          │
│ Entered: Jul 21 (max touches reached)           │
│                                                 │
│  Routes:                                        │
│  ✅ Newsletter (weekly)                         │
│  ✅ LinkedIn (passive follow)                   │
│  ○ Webinar (next: Aug 15)                       │
│  ○ Workshop (next: Q3)                          │
│                                                 │
│  Last Engagement: Jul 28 (opened newsletter)    │
│  Re-engage: Aug 5 (webinar invite)              │
│                                                 │
│  [Send Re-engagement] [Move Back to Outreach]   │
│  [Mark as Unsubscribed]                         │
└─────────────────────────────────────────────────┘
```

---

## 5. Funnel Automation Rules

### 5.1 Auto-Advance Rules

| Trigger | Action |
|---------|--------|
| Outreach touch marked "replied" (positive) | `funnel_stage` → 'conversation', create follow-up task |
| 4th touch completed, no reply | `funnel_stage` → 'nurture', create nurture route |
| Opportunity score ≥ 7 | Auto-tag as "Hot Opportunity", create proposal task |
| Nurture contact opens newsletter / engages content | Log engagement, consider re-engagement |
| Nurture contact replies to re-engagement | `funnel_stage` → 'conversation' |

### 5.2 Daily Automation

| Time | Action |
|------|--------|
| 8:00 AM | Compute `next_action_date` for all contacts with scheduled touches |
| 8:00 AM | Flag overdue actions (scheduled_at < today, status = 'scheduled') |
| 8:00 AM | Send Kevin daily digest: "X outreaches due, Y follow-ups, Z conversations" |
| 9:00 PM | Auto-move: touches > 21 days old with no reply → nurture |

---

## 6. Acceptance Criteria

### F-01: Contact Extensions
- [ ] All 8 new columns present on `vista_contacts`
- [ ] Existing contacts default to `funnel_stage = 'outreach'`
- [ ] Index on `(funnel_stage, next_action_date)` created
- [ ] Contacts table UI shows funnel stage badge

### F-02: Outreach Sequences
- [ ] Table created with all columns
- [ ] Can create sequence linked to contact + template
- [ ] Updating sequence status auto-updates contact's `outreach_count` and `last_outreach_date`
- [ ] Overdue query returns touches past scheduled date

### F-03: Templates
- [ ] Table created
- [ ] 8 templates seeded (4 archetypes × 2 touches each)
- [ ] Templates have mustache variables that render with contact data
- [ ] Template editor allows creating new templates

### F-04: Outreach UI
- [ ] Outreach timeline visible on Contact Detail
- [ ] Each touch shows status, template used, channel, date
- [ ] "Send Now" / "Reschedule" / "Skip" actions work
- [ ] Dashboard widget shows today's queue with overdue/due/upcoming grouping

### F-05: Nurture Router
- [ ] Route creation sets `funnel_stage = 'nurture'`
- [ ] Nurture panel shows all routes per contact
- [ ] Re-engagement dates are computed based on timing rules
- [ ] Can move contact back to 'outreach' or 'conversation' from nurture

### F-06: Opportunity Scoring
- [ ] All 6 scoring fields present
- [ ] `total_score` auto-computes on update
- [ ] `score_tier` auto-assigns (opportunity/warm_nurture/early)
- [ ] Score card UI shows checklist with running total
- [ ] Product recommendation field visible

### F-07: Weekly Rhythm
- [ ] Dashboard widget shows weekly progress bars
- [ ] Counts are computed from actual outreach/sequence data
- [ ] 90-day milestone tracker shows progress

### F-08: 90-Day Milestones
- [ ] Milestone definitions stored (week 1-2, 3-4, etc.)
- [ ] Progress computed from funnel data
- [ ] Visual progress bars on dashboard

---

## 7. Dependencies

- **Requires:** Migration V2 (service catalog tables) — already committed
- **Requires:** VISTA contacts table (exists)
- **Requires:** VISTA opportunities table (exists)
- **Blocks:** Wave 3 (Kanban-First), Wave 4 (Action-Pushing), Wave 7 (Funnel)
- **External:** None (pure Supabase + frontend)

---

## 8. Migration SQL

See: `schema_migration_wave1.5_funnel_core.sql`

---

*Spec generated: 2026-07-11 | James/AI for Kevin Hong | LYC Partners*
