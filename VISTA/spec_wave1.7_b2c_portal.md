# Wave 1.7 — B2C → B2B Conversion Intelligence

> **VISTA is an internal CRM platform. The DEX AI Career Advisory Portal is a separate product.**
> Wave 1.7 enables VISTA to ingest B2C user data, flag B2B potential, manage the conversion pipeline, and track B2C → B2B revenue attribution.

**Version:** 2.0 (CORRECTED) | **Date:** 2026-07-12 | **Author:** James/AI
**Supersedes:** v1.0 (998 lines — B2C portal built inside VISTA — WRONG SCOPE)
**Status:** Spec Ready | **Migration SQL:** `run_this_wave1.7_migration.sql`

---

## 1. Scope Correction

### What VISTA is NOT
- VISTA is NOT a client-facing app
- VISTA does NOT contain the B2C chat interface, credit billing, subscriptions, or assessments
- VISTA does NOT handle any B2C conversations
- The DEX AI Career Advisory Portal is a **separate product** with its own stack

### What VISTA DOES regarding B2C
- **Ingest** B2C user data from the DEX AI portal via API/webhook
- **Flag** B2C users who show B2B potential (executive title, decision-maker, company context, high spend)
- **Track** B2C → B2B conversion pipeline (Kanban stages)
- **Measure** conversion rates, pipeline value, revenue attribution
- **Enable** BD team to act when the situation is ripe

### What's OUT of scope (DEX AI Portal product)
- User registration/authentication
- Chat interface & AI engine
- Credit packs & billing
- Subscription management
- Assessment modules (PRISM/TRIDENT/CANVAS)
- Payment processing

---

## 2. Business Context

The V2 pricing strategy introduces a B2C DEX AI Career Advisory Portal as a new revenue stream:

| B2C Product | Price | Purpose |
|-------------|-------|---------|
| Explorer | Free (5 msgs) | Acquisition |
| Credit Packs | ¥99 / ¥399 / ¥799 | Engagement |
| Member | ¥99/mo (30 credits) | Retention |
| Pro | ¥299/mo (100 credits) | Active transformation |

**B2C → B2B conversion thesis:** Some B2C users are executives, founders, or decision-makers who start with personal career advisory but represent B2B opportunities (team diagnostics, executive coaching, advisory retainers, search mandates). VISTA's job is to identify these people and manage the conversion.

**Target conversion signals:**
- C-suite / VP / Director title on LinkedIn
- Company size > 50 employees
- B2C user buys Executive credit pack (¥799)
- B2C user completes CANVAS assessment (career path mapping — strategic thinker)
- B2C user books coaching (serious about development — potential org-level need)
- B2C user reaches Pro tier (high engagement, high value)
- B2C user's LinkedIn shows team leadership signals

---

## 3. Data Flow Architecture

```
┌─────────────────────────────────┐
│  DEX AI Career Advisory Portal   │
│  (Separate Product)              │
│                                  │
│  Users, Chat, Credits, Payments  │
│  Assessments, Subscriptions      │
└──────────┬───────────────────────┘
           │
           │ Webhooks + API pushes
           │ (user signup, purchase,
           │  assessment, tier change,
           │  LinkedIn data)
           │
           ▼
┌─────────────────────────────────┐
│  VISTA — B2C Intelligence Layer  │
│  (This Wave)                     │
│                                  │
│  1. Ingest B2C user data         │
│  2. Score B2B potential          │
│  3. Flag high-potential users    │
│  4. Manage conversion pipeline   │
│  5. Track revenue attribution    │
└──────────┬───────────────────────┘
           │
           │ When B2C lead converts
           │ → Promote to full VISTA contact
           │ → Link B2C history as context
           │
           ▼
┌─────────────────────────────────┐
│  VISTA — B2B CRM Engine          │
│  (Existing)                      │
│                                  │
│  Contact Intelligence            │
│  Pipeline Management             │
│  Outreach & Conversations        │
│  Service Matching                │
└──────────────────────────────────┘
```

---

## 4. Ticket Breakdown (10 tickets: BC-01 → BC-10)

### Domain 1: B2C Data Ingestion (BC-01, BC-02)

#### BC-01: B2C Lead Ingestion API
**Priority:** 🔴 P0 | **Estimate:** 2 days

**What:** REST API endpoint for the DEX AI portal to push B2C user data into VISTA.

**Endpoint:** `POST /api/b2c/ingest`

**Payload:**
```json
{
  "event_type": "user_signup | purchase | assessment | tier_change | profile_update",
  "b2c_user_id": "dex_xxxxx",
  "email": "user@example.com",
  "name": "Jane Smith",
  "linkedin_url": "https://linkedin.com/in/janesmith",
  "title": "VP of Operations",
  "company": "Acme Corp",
  "company_size": 120,
  "industry": "Technology",
  "location": "Shanghai, China",
  "current_tier": "Pro",
  "total_credits_purchased": 150,
  "total_credits_consumed": 87,
  "total_spend_cny": 799,
  "assessments_completed": ["PRISM", "CANVAS"],
  "signup_date": "2026-07-01T10:00:00Z",
  "metadata": {}
}
```

**Behavior:**
- If user doesn't exist in `vista_b2c_leads` → INSERT
- If user exists → UPDATE with latest data
- After INSERT/UPDATE → trigger B2B potential scoring (BC-03)
- Log event in `vista_b2c_events`
- Return 200 with `{ status: "ok", b2c_lead_id: "xxx", b2b_score: 72, flagged: true }`

**Auth:** API key (shared between DEX AI portal and VISTA, stored in env vars)

**Acceptance criteria:**
- [ ] Endpoint accepts payload and stores in `vista_b2c_leads`
- [ ] Idempotent — same user_id updates existing record
- [ ] Events logged in `vista_b2c_events`
- [ ] API key authentication
- [ ] Rate limiting (100 req/min)

---

#### BC-02: B2C Event Stream
**Priority:** 🔴 P0 | **Estimate:** 1.5 days

**What:** Webhook handler for real-time events from DEX AI portal. Separate from the bulk ingestion API — this is for event-driven updates.

**Endpoint:** `POST /api/b2c/webhook`

**Events to handle:**
| Event | Action in VISTA |
|-------|----------------|
| `user.signup` | Create B2C lead record, initial B2B score |
| `purchase.credit_pack` | Update spend, check if threshold triggers flag |
| `purchase.subscription` | Update tier, high-value signal |
| `assessment.completed` | Update assessment history, re-score |
| `tier.upgrade` | Tier change signal (esp. → Pro) |
| `coaching.booked` | High-value signal — re-score immediately |
| `linkedin.verified` | Update professional context — re-score |

**Behavior:**
- Validate webhook signature (HMAC-SHA256)
- Process event → update `vista_b2c_leads` → log in `vista_b2c_events`
- Trigger B2B potential re-scoring
- If score crosses threshold → create alert (BC-04)

**Acceptance criteria:**
- [ ] Webhook signature validation
- [ ] All 7 event types handled
- [ ] Idempotent (deduplicate by event_id)
- [ ] Re-scoring triggered after each event
- [ ] < 200ms response time

---

### Domain 2: B2B Potential Signal Engine (BC-03, BC-04)

#### BC-03: B2B Potential Scoring Rules
**Priority:** 🔴 P0 | **Estimate:** 2 days

**What:** Configurable rule engine that scores each B2C user's B2B potential (0-100).

**Scoring dimensions:**

| Signal | Weight | Trigger |
|--------|--------|---------|
| **Title seniority** | 0-25 | C-suite=25, VP=20, Director=15, Manager=5, Other=0 |
| **Company size** | 0-20 | >500=20, >100=15, >50=10, >20=5, <20=0 |
| **Industry fit** | 0-15 | Target industries (tech, finance, manufacturing, healthcare)=15, Adjacent=8, Other=0 |
| **Spend level** | 0-15 | >¥2000=15, >¥500=10, >¥100=5, <¥100=0 |
| **Assessment depth** | 0-10 | CANVAS=10, TRIDENT=7, PRISM=5, None=0 |
| **Engagement tier** | 0-10 | Pro=10, Member=5, Credit buyer=3, Free=0 |
| **Coaching booked** | 0-5 | Yes=5, No=0 |

**Score interpretation:**
| Score | Label | Action |
|-------|-------|--------|
| 80-100 | 🔴 High Priority | Auto-flag + immediate alert to BD team |
| 60-79 | 🟡 Watch | Flag + daily digest |
| 40-59 | 🟢 Monitor | Track only, no alert |
| 0-39 | ⚪ Low | No action |

**Configuration:**
- Rules stored as JSONB in `vista_b2c_signal_rules` (or hardcoded v1, configurable v2)
- Admin can adjust weights via `/api/admin/b2c-signals`
- Default thresholds: 80/60/40

**Acceptance criteria:**
- [ ] Scoring algorithm implemented
- [ ] Score calculated on every ingest/webhook event
- [ ] Scores stored on `vista_b2c_leads.b2b_potential_score`
- [ ] Admin endpoint to view/adjust weights
- [ ] Score history tracked (so we can see score progression)

---

#### BC-04: B2C Lead Flagging & Alerts
**Priority:** 🔴 P0 | **Estimate:** 1 day

**What:** When a B2C user's B2B score crosses the threshold (80+), auto-flag them and alert the BD team.

**Behavior:**
- Score ≥ 80: Auto-set `pipeline_stage = 'flagged'`, create alert
- Score 60-79: Auto-set `pipeline_stage = 'monitoring'`, add to daily digest
- Alert delivery: In-app notification (VISTA alerts table) + optional webhook to Feishu/email
- Alert content: B2C user name, title, company, score, key signals, suggested action

**Alert template:**
```
🔴 B2B Potential Detected

B2C User: Jane Smith
Title: VP of Operations @ Acme Corp (120 employees)
B2B Score: 87/100
Key Signals: C-suite title, ¥799 spent, CANVAS completed, Pro subscriber
Suggested Action: Research company needs → Prepare outbound → Offer Diagnostic

[View in VISTA] [Start Outreach] [Add Note]
```

**Acceptance criteria:**
- [ ] Auto-flag on score threshold
- [ ] Alert created in VISTA alerts system
- [ ] Pipeline stage auto-updated
- [ ] Daily digest for 60-79 scores
- [ ] Alert includes actionable context

---

### Domain 3: B2C → B2B Conversion Pipeline (BC-05, BC-06, BC-07)

#### BC-05: B2C Lead Pipeline (Kanban)
**Priority:** 🔴 P0 | **Estimate:** 2 days

**What:** Dedicated Kanban view for managing B2C → B2B conversions.

**Pipeline stages:**
```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  B2C     │──▶│ Flagged  │──▶│ Research │──▶│ Outreach │──▶│    In    │──▶│ Promoted │
│  User    │   │ (Score   │   │ (BD team │   │ Ready    │   │ Convers- │   │ to B2B   │
│ (All)    │   │  80+)    │   │  checks) │   │          │   │  ation   │   │ Contact  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │                                                                       │
     │                      STAGE COUNTS                                     │
     │                      Avg. score per stage                             │
     │                      Time in stage                                    │
     └───────────────────────────────────────────────────────────────────────┘
```

**Default filters:**
- "High Priority" = score ≥ 80, stage = flagged
- "Ready for Outreach" = stage = research done + outreach ready
- "In Progress" = stage = in conversation
- "Converted" = stage = promoted (last 30 days)

**Kanban features:**
- Card shows: name, title, company, B2B score, B2C tier, total spend, assessments done
- Drag-and-drop between stages
- Stage change auto-logged
- Inline notes per card

**Acceptance criteria:**
- [ ] Kanban view accessible from sidebar
- [ ] All 6 stages visible with counts
- [ ] Drag-and-drop stage changes
- [ ] Card preview with key B2C data
- [ ] Filter by score range, tier, industry
- [ ] Stage change logged with timestamp

---

#### BC-06: B2C Lead Profile & Context Panel
**Priority:** 🟡 P1 | **Estimate:** 1.5 days

**What:** Detailed profile view for a B2C lead — combining B2C activity history with VISTA's BD context.

**Sections:**
1. **Header:** Name, title, company, LinkedIn link, B2B score (with history chart), pipeline stage
2. **B2C Activity Timeline:** Chronological feed of all events (signup, purchases, assessments, tier changes)
3. **Professional Context:** LinkedIn data, company info, industry, team size
4. **Credit & Spend Summary:** Total purchased, consumed, remaining, total spend
5. **Assessment Results:** PRISM/TRIDENT/CANVAS scores and key findings (if shared by DEX AI portal)
6. **B2B Potential Signals:** Breakdown of score (which signals contributed, how score changed over time)
7. **BD Notes:** Internal notes from BD team
8. **Actions:** [Start Outreach] [Log Conversation] [Promote to B2B Contact] [Add Note]

**Acceptance criteria:**
- [ ] All 8 sections rendered
- [ ] Activity timeline auto-populated from events
- [ ] Score history chart (line graph over time)
- [ ] Notes CRUD
- [ ] Quick actions functional

---

#### BC-07: B2C → B2B Promotion Engine
**Priority:** 🔴 P0 | **Estimate:** 2 days

**What:** When a B2C lead converts to a B2B relationship, promote them to a full VISTA contact with all B2C history preserved as context.

**Promotion flow:**
1. BD team clicks [Promote to B2B Contact] on B2C lead profile
2. System creates new record in `vista_contacts` (or links to existing contact if email/LinkedIn match)
3. B2C activity history attached as context (not in main activity feed, but visible in "B2C History" section)
4. B2C lead record updated: `pipeline_stage = 'promoted'`, `linked_contact_id = <new_contact_id>`
5. Conversion logged in `vista_b2c_conversions`
6. Alert to team: "B2C lead Jane Smith promoted to B2B contact"

**Matching logic:**
- Check if email already exists in `vista_contacts` → link to existing
- Check if LinkedIn URL already exists → link to existing
- No match → create new contact
- Existing contact with same name but different email → flag for manual review

**Post-promotion:**
- B2C lead moves to "Promoted" stage (terminal state)
- New B2B contact enters normal VISTA pipeline
- B2C revenue (credits, subscriptions) still tracked for attribution
- B2C → B2B conversion metrics updated

**Acceptance criteria:**
- [ ] Promotion creates/links VISTA contact
- [ ] B2C history preserved as context
- [ ] Duplicate detection (email + LinkedIn)
- [ ] Conversion logged with timestamps
- [ ] Post-promotion: lead in terminal state, contact in active pipeline

---

### Domain 4: B2C → B2B Analytics (BC-08, BC-09)

#### BC-08: B2C → B2B Conversion Analytics Dashboard
**Priority:** 🟡 P1 | **Estimate:** 2 days

**What:** Analytics dashboard tracking the B2C → B2B conversion pipeline.

**Metrics:**
| Metric | Description |
|--------|-------------|
| **Total B2C Leads** | All B2C users ingested |
| **Flagged (B2B Potential)** | Count and % with score ≥ 60 |
| **Conversion Rate** | Promoted / Flagged (target: 15-25%) |
| **Pipeline Value** | Sum of potential deal value for flagged/research/outreach leads |
| **Avg. Time to Convert** | Days from flag → promotion |
| **Score Distribution** | Histogram of B2B scores |
| **Source Analysis** | Which B2C products lead to most conversions (credit pack vs subscription vs assessment) |
| **Revenue Attribution** | B2C revenue from users who later converted to B2B |

**Views:**
- Funnel: B2C Users → Flagged → Research → Outreach → In Conversation → Promoted
- Timeline: Conversions per week/month
- Score distribution chart
- Top converts (highest value B2C → B2B conversions)

**Acceptance criteria:**
- [ ] Dashboard accessible from sidebar
- [ ] All 8 metrics displayed
- [ ] Funnel visualization
- [ ] Date range filter
- [ ] Export to CSV

---

#### BC-09: B2C Revenue Attribution
**Priority:** 🟡 P1 | **Estimate:** 1 day

**What:** Track B2C revenue that preceded B2B conversion — to understand the ROI of the B2C portal as a B2B lead gen channel.

**Metrics:**
| Metric | Description |
|--------|-------------|
| **Pre-conversion B2C spend** | Total credits/subscriptions purchased before promotion |
| **B2C revenue from converters** | Total B2C revenue from users who eventually became B2B |
| **B2C revenue from non-converters** | Revenue from users who stayed B2C only |
| **B2B revenue from converts** | Deal value from B2C → B2B promotions |
| **ROI ratio** | B2B revenue from converts / Total B2C portal cost |
| **Average pre-conversion journey** | Avg. credits purchased, assessments taken, time as B2C before converting |

**Acceptance criteria:**
- [ ] Revenue tracked per B2C lead
- [ ] Post-promotion B2B deal value linked
- [ ] ROI calculations
- [ ] Part of analytics dashboard

---

#### BC-10: DEX AI Integration Configuration
**Priority:** 🟡 P1 | **Estimate:** 0.5 days

**What:** Admin settings page for configuring the DEX AI portal integration.

**Settings:**
- API key for ingestion endpoint (generate/rotate)
- Webhook secret (generate/rotate)
- DEX AI portal URL (for linking back)
- B2B scoring weights (adjust per dimension)
- Alert thresholds (80/60/40 defaults)
- Alert delivery (in-app, Feishu, email)
- Auto-promotion rules (e.g., if score ≥ 90 + coaching booked → auto-create contact)

**Acceptance criteria:**
- [ ] Admin-only access
- [ ] API key generation and rotation
- [ ] Webhook secret management
- [ ] Scoring weight adjustment
- [ ] Threshold configuration
- [ ] Settings persisted and applied immediately

---

## 5. Migration Summary

| Item | Count |
|------|-------|
| New tables | 3 |
| Modified tables | 1 (vista_service_catalog — add B2C product entries) |
| Seed data | 3 B2C signal rule presets + service catalog entries |
| Triggers | 2 (updated_at, auto-score on insert) |
| API endpoints | 4 (ingest, webhook, admin config, analytics) |
| **New tickets** | **10 (BC-01 → BC-10)** |
| **Estimated effort** | **~15 days sequential / ~5 days with 2 devs** |

### New Tables

1. **`vista_b2c_leads`** — B2C users with B2B scoring, pipeline stage, professional context
2. **`vista_b2c_events`** — Event stream from DEX AI portal
3. **`vista_b2c_conversions`** — Conversion log: B2C lead → B2B contact promotion

### Modified Tables

- **`vista_service_catalog`** — Add B2C product entries (credit packs, subscriptions) for revenue tracking. VISTA needs to know these products exist to attribute revenue correctly.

### What's NOT in the migration (compared to v1.0)

| v1.0 (WRONG — removed) | Reason |
|---|---|
| vista_b2c_users | Separate product's concern |
| vista_b2c_profiles | Separate product's concern |
| vista_b2c_credit_ledger | Separate product's concern |
| vista_b2c_credit_packs | Separate product's concern |
| vista_b2c_payments | Separate product's concern |
| vista_b2c_subscriptions | Separate product's concern |
| vista_b2c_chat_sessions | Separate product's concern |
| vista_b2c_chat_messages | Separate product's concern |
| vista_b2c_assessment_results | Separate product's concern |
| vista_b2c_upgrade_candidates | Replaced by conversion pipeline |
| vista_b2c_cross_sell_rules | Replaced by signal rules |
| vista_b2c_revenue_metrics | Replaced by analytics queries |

---

## 6. Execution Phases

### Phase 1: Foundation (Week 1, ~5 days)
- BC-01: Ingestion API
- BC-02: Event webhook
- BC-03: B2B scoring engine
- Migration SQL execution

### Phase 2: Pipeline (Week 2, ~5 days)
- BC-04: Flagging & alerts
- BC-05: Kanban pipeline
- BC-06: Lead profile panel
- BC-07: Promotion engine

### Phase 3: Analytics (Week 3, ~5 days)
- BC-08: Conversion analytics
- BC-09: Revenue attribution
- BC-10: Integration config
- Testing + DEX AI portal integration

---

## 7. Integration Contract with DEX AI Portal

The DEX AI portal team needs to implement:

**Outbound webhooks to VISTA:**
```
POST https://vista-azure-delta.vercel.app/api/b2c/webhook
Headers: X-Webhook-Signature: <HMAC-SHA256>
Body: { event_type, event_id, b2c_user_id, timestamp, payload }
```

**Events to send:**
| Event | When |
|-------|------|
| `user.signup` | New user registers |
| `purchase.credit_pack` | Credit pack purchased |
| `purchase.subscription` | Member/Pro subscription started |
| `assessment.completed` | PRISM/TRIDENT/CANVAS completed |
| `tier.upgrade` | User tier changes (esp. → Pro) |
| `coaching.booked` | Coaching session booked |
| `linkedin.verified` | LinkedIn profile verified/imported |

**Optional bulk sync endpoint:**
```
POST https://vista-azure-delta.vercel.app/api/b2c/ingest
Headers: X-API-Key: <key>
Body: { users: [...full user snapshots...] }
```
For initial data load and periodic reconciliation.

---

## 8. Ticket Summary

| # | Ticket | Domain | Priority | Estimate |
|---|--------|--------|----------|----------|
| BC-01 | B2C Lead Ingestion API | Ingestion | 🔴 P0 | 2d |
| BC-02 | B2C Event Webhook Handler | Ingestion | 🔴 P0 | 1.5d |
| BC-03 | B2B Potential Scoring Rules | Signals | 🔴 P0 | 2d |
| BC-04 | B2C Lead Flagging & Alerts | Signals | 🔴 P0 | 1d |
| BC-05 | B2C Lead Pipeline (Kanban) | Pipeline | 🔴 P0 | 2d |
| BC-06 | B2C Lead Profile & Context Panel | Pipeline | 🟡 P1 | 1.5d |
| BC-07 | B2C → B2B Promotion Engine | Pipeline | 🔴 P0 | 2d |
| BC-08 | B2C → B2B Conversion Analytics | Analytics | 🟡 P1 | 2d |
| BC-09 | B2C Revenue Attribution | Analytics | 🟡 P1 | 1d |
| BC-10 | DEX AI Integration Config | Config | 🟡 P1 | 0.5d |
| | | **Wave 1.7 Total:** | | **~15.5d** |

### Updated Grand Totals

| Version | Tickets | Description |
|---------|---------|-------------|
| V1 — Original Gap | 51 | UX, visual design, dashboard |
| V2 — Gap Analysis | 100 | T-01→T-100: CV, search, integrations |
| V3 — Exhaustive Feature Map | 193 | T-101→T-293: 20 domains, 16 portals |
| V4 — Action-Pushing Platform | 89 | T-294→T-382: intelligence, gamification, kanban |
| Wave 1.5 — Funnel Core | 8 | F-01→F-08: outreach engine, scoring |
| Wave 1.6 — Revenue OS | 20 | R-01→R-20: pricing, tiered funnel, cross-sell |
| **Wave 1.7 — B2C→B2B Intelligence** | **10** | **BC-01→BC-10: ingestion, scoring, pipeline, analytics** |
| **GRAND TOTAL** | **471** | **(was 524, reduced by 15 irrelevant tickets)** |

---

*Wave 1.7 v2.0 — CORRECTED SCOPE | VISTA = Internal CRM Intelligence | B2C Portal = Separate Product*
*Generated: 2026-07-12 | Author: James/AI for Kevin Hong*
