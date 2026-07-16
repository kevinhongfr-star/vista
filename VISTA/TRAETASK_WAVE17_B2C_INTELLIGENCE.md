# Wave 1.7 — B2C → B2B Conversion Intelligence

**Date:** 2026-07-16  
**Author:** James/AI  
**Status:** Ready for Trae execution  
**Spec:** `VISTA/spec_wave1.7_b2c_portal.md` (full business spec)  
**Migration:** ✅ Already applied — all 3 tables, 3 triggers, 16 indexes live in Supabase

---

## Database Status (VERIFIED 2026-07-16 22:05 HKT)

### Tables Ready
| Table | Columns | Data |
|-------|---------|------|
| `vista_b2c_leads` | 29 columns | 0 rows (clean slate) |
| `vista_b2c_events` | 10 columns | 0 rows |
| `vista_b2c_conversions` | 14 columns | 0 rows |

### Triggers Active
- `trg_b2c_leads_updated_at` — auto-updates `updated_at`
- `trg_b2c_pipeline_stage_ts` — auto-updates `pipeline_stage_updated_at` when stage changes
- `trg_b2c_score_label` — auto-sets `b2b_score_label` from score, auto-promotes stage, appends score history

### Seed Data
- 10 B2C products in `vista_service_catalog` (is_b2c = true) — credit packs, subscriptions, assessments, coaching, bundle
- 1 conversion signal bundle in `vista_service_bundles` (`b2c-to-b2b-signal`)

### Key Column Reference
```
vista_b2c_leads:
  b2c_user_id TEXT UNIQUE -- DEX AI portal user ID
  email TEXT
  name TEXT
  linkedin_url TEXT
  title TEXT, company TEXT, company_size INT, industry TEXT, location TEXT
  current_tier TEXT DEFAULT 'free' -- free/starter/member/pro
  total_credits_purchased INT, total_credits_consumed INT, total_spend_cny NUMERIC(12,2)
  assessments_completed TEXT[] -- ['PRISM','TRIDENT','CANVAS']
  coaching_booked BOOLEAN, linkedin_verified BOOLEAN
  b2b_potential_score INT DEFAULT 0 -- 0-100
  b2b_score_label TEXT -- low/monitor/watch/high_priority (auto-set by trigger)
  b2b_score_breakdown JSONB -- {title:25, company_size:15, ...}
  b2b_score_history JSONB -- [{date, score, label, breakdown}]
  pipeline_stage TEXT DEFAULT 'b2c_user' -- b2c_user/flagged/monitoring/research/outreach_ready/in_conversation/promoted
  linked_contact_id UUID FK->vista_contacts(id)
  linked_contact_matched_via TEXT -- email/linkedin/manual
  bd_notes TEXT
  b2c_signup_date TIMESTAMPTZ, last_event_at TIMESTAMPTZ

vista_b2c_events:
  event_id TEXT UNIQUE -- dedup key from DEX AI portal
  event_type TEXT -- user.signup/purchase.credit_pack/purchase.subscription/assessment.completed/tier.upgrade/coaching.booked/linkedin.verified
  b2c_lead_id UUID FK->vista_b2c_leads(id)
  b2c_user_id TEXT
  payload JSONB
  score_before INT, score_after INT, score_delta INT
  event_timestamp TIMESTAMPTZ, ingested_at TIMESTAMPTZ

vista_b2c_conversions:
  b2c_lead_id UUID FK->vista_b2c_leads(id)
  b2c_user_id TEXT
  vista_contact_id UUID FK->vista_contacts(id)
  b2b_score_at_conversion INT
  pipeline_stage_before TEXT
  conversion_reason TEXT -- manual_promotion/auto_rule/score_threshold
  b2c_total_spend_cny NUMERIC(12,2), b2c_credits_purchased INT, b2c_assessments_completed TEXT[], b2c_days_as_user INT
  first_b2b_deal_value_cny NUMERIC(12,2), first_b2b_service TEXT, first_b2b_date DATE
  converted_at TIMESTAMPTZ
```

---

## Ticket Execution Order

**Phase 1 (Foundation):** BC-03 -> BC-01 -> BC-02  
**Phase 2 (Pipeline):** BC-04 -> BC-05 -> BC-06 -> BC-07  
**Phase 3 (Analytics):** BC-08 -> BC-09 -> BC-10

---

## BC-03: B2B Potential Scoring Engine

**Priority:** P0 | **Estimate:** 2 days  
**DO THIS FIRST** — BC-01 and BC-02 depend on it.

### Files to Create
- `lib/b2c/scoring.ts` — shared scoring logic (used by BC-01 and BC-02)
- `app/api/b2c/leads/[id]/rescore/route.ts` — manual re-score endpoint
- `app/api/admin/b2c-signals/route.ts` — admin config for scoring weights

### Scoring Rules
```typescript
const DEFAULT_WEIGHTS = {
  title_seniority: { max: 25, tiers: { 'c-suite': 25, 'vp': 20, 'director': 15, 'manager': 5 } },
  company_size: { max: 20, tiers: { 500: 20, 100: 15, 50: 10, 20: 5 } },
  industry_fit: { max: 15, targets: ['technology', 'finance', 'manufacturing', 'healthcare'], adjacent: 8 },
  spend_level: { max: 15, tiers: { 2000: 15, 500: 10, 100: 5 } },
  assessment_depth: { max: 10, scores: { 'CANVAS': 10, 'TRIDENT': 7, 'PRISM': 5 } },
  engagement_tier: { max: 10, scores: { 'pro': 10, 'member': 5, 'credit_buyer': 3, 'free': 0 } },
  coaching_booked: { max: 5, yes: 5, no: 0 },
};
```

### Scoring Function
```typescript
export function computeB2BScore(lead: Partial<B2CLead>): { score: number; breakdown: Record<string, number>; label: string } {
  // Compute each dimension
  // Sum to total (cap 100)
  // Determine label: >=80 = high_priority, >=60 = watch, >=40 = monitor, <40 = low
  // Return { score, breakdown, label }
}
```

### Acceptance Criteria
- [ ] Shared scoring function exported and importable
- [ ] Score 0-100 range, correctly capped
- [ ] Label auto-assigned correctly
- [ ] Breakdown shows per-dimension scores
- [ ] Admin can read/write weights
- [ ] Manual re-score endpoint works

---

## BC-01: B2C Lead Ingestion API

**Priority:** P0 | **Estimate:** 2 days

### Files to Create
- `app/api/b2c/ingest/route.ts`

### Endpoint
`POST /api/b2c/ingest`

### Logic
1. **Auth:** Check `X-API-Key` header against `process.env.B2C_INGEST_API_KEY`. Return 401 if missing.
2. **Validate:** Require `b2c_user_id` and `event_type`. Return 400 if missing.
3. **Upsert:** `SELECT * FROM vista_b2c_leads WHERE b2c_user_id = $1` -> INSERT or UPDATE
4. **Log event:** INSERT into `vista_b2c_events`
5. **Score:** Import `computeB2BScore` from `lib/b2c/scoring.ts`, update lead
6. **Response:** `200 { status: "ok", b2c_lead_id, b2b_score, flagged, b2b_score_label }`

### Pattern
Copy structure from `app/api/contacts/route.ts`.

### Acceptance Criteria
- [ ] API key auth working (401 without key)
- [ ] Creates new lead on first call
- [ ] Updates existing lead on subsequent calls (idempotent by b2c_user_id)
- [ ] Events logged in vista_b2c_events
- [ ] B2B score computed and stored

---

## BC-02: B2C Event Webhook Handler

**Priority:** P0 | **Estimate:** 1.5 days

### Files to Create
- `app/api/b2c/webhook/route.ts`

### Logic
1. **Validate HMAC signature** from `X-Webhook-Signature` header using `process.env.B2C_WEBHOOK_SECRET`
2. **Dedup:** Check `event_id` in `vista_b2c_events`. If exists -> 200 (already processed)
3. **Find/create lead** by `b2c_user_id`
4. **Process event by type** (update relevant lead fields)
5. **Re-score** using `computeB2BScore`
6. **Log event** with score_before/score_after/score_delta
7. **Response:** `200 { status: "processed", event_id }`

### Event Types
| Event | Fields to Update |
|-------|-----------------|
| `user.signup` | email, name, linkedin_url, title, company |
| `purchase.credit_pack` | total_credits_purchased, total_spend_cny |
| `purchase.subscription` | current_tier, total_credits_purchased |
| `assessment.completed` | assessments_completed (append to array) |
| `tier.upgrade` | current_tier |
| `coaching.booked` | coaching_booked = true |
| `linkedin.verified` | linkedin_verified = true, linkedin_url |

### Acceptance Criteria
- [ ] HMAC validation working
- [ ] All 7 event types handled
- [ ] Dedup by event_id
- [ ] Score recomputed after each event

---

## BC-04: B2C Lead Flagging & Alerts

**Priority:** P0 | **Estimate:** 1 day

### Files to Create
- `app/api/b2c/alerts/route.ts` — GET list active alerts
- `app/api/b2c/leads/[id]/alert/route.ts` — PATCH acknowledge alert

### Logic
- Query `vista_b2c_leads WHERE b2b_score_label = 'high_priority' AND pipeline_stage = 'flagged'`
- Feishu notification on new high-priority flag (POST to webhook)
- Alert acknowledged when pipeline_stage changes to 'research'

### Acceptance Criteria
- [ ] `GET /api/b2c/alerts` returns flagged high-priority leads
- [ ] Feishu notification on new flag
- [ ] Alert dismissed by stage change

---

## BC-05: B2C Lead Pipeline (Kanban)

**Priority:** P0 | **Estimate:** 2 days

### Files to Create
- `app/b2c-pipeline/page.tsx`
- `app/b2c-pipeline/B2CPipelinePage.tsx`
- `app/b2c-pipeline/B2CLeadCard.tsx`
- `app/api/b2c/leads/route.ts` — GET list leads with filters
- `app/api/b2c/leads/[id]/stage/route.ts` — PATCH update stage

### Pipeline Stages
```
b2c_user | flagged | research | outreach_ready | in_conversation | promoted
```

### Sidebar Update
Add to `components/layout/Sidebar.tsx`:
```
{ href: "/b2c-pipeline", label: "B2C Pipeline", icon: UserPlus, tooltip: "B2C to B2B conversion pipeline" }
```

### Acceptance Criteria
- [ ] 6-column Kanban renders
- [ ] Cards show name, title, company, score, tier, spend
- [ ] Drag-and-drop or click-to-move
- [ ] Stage change persists
- [ ] Column counts update
- [ ] Filter bar works
- [ ] Sidebar link added

---

## BC-06: B2C Lead Profile & Context Panel

**Priority:** P1 | **Estimate:** 1.5 days

### Files to Create
- `app/b2c-pipeline/[id]/page.tsx`
- `app/b2c-pipeline/[id]/B2CLeadProfile.tsx`
- `app/api/b2c/leads/[id]/route.ts` — GET full lead context
- `app/api/b2c/leads/[id]/notes/route.ts` — PATCH BD notes
- `app/api/b2c/leads/[id]/events/route.ts` — GET event history

### 8 Sections
1. Header (name, title, company, LinkedIn, score, stage)
2. B2C Activity Timeline (from vista_b2c_events)
3. Professional Context (LinkedIn, company, industry)
4. Credit & Spend Summary
5. Assessment Results
6. B2B Score Breakdown (per-dimension + history)
7. BD Notes (editable)
8. Actions ([Promote] [Start Outreach] [Log Conversation])

---

## BC-07: B2C -> B2B Promotion Engine

**Priority:** P0 | **Estimate:** 2 days

### Files to Create
- `app/api/b2c/leads/[id]/promote/route.ts`
- `lib/b2c/promotion.ts`

### Logic
1. Duplicate detection: match by email or LinkedIn URL in `vista_contacts`
2. If match -> link to existing contact. If no match -> create new `vista_contacts` record
3. Update lead: `pipeline_stage = 'promoted'`, `linked_contact_id = <id>`, `linked_contact_matched_via`
4. INSERT into `vista_b2c_conversions` with full context
5. **IMPORTANT:** Check actual `vista_contacts` column names before mapping:
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'vista_contacts' ORDER BY ordinal_position;
   ```

### Acceptance Criteria
- [ ] Creates/links VISTA contact
- [ ] Duplicate detection by email + LinkedIn
- [ ] Conversion logged
- [ ] Lead in terminal 'promoted' stage

---

## BC-08: B2C -> B2B Conversion Analytics

**Priority:** P1 | **Estimate:** 2 days

### Files to Create
- `app/b2c-analytics/page.tsx`
- `app/b2c-analytics/B2CAnalyticsPage.tsx`
- `app/api/b2c/analytics/route.ts`

### Metrics
Total leads, flagged %, conversion rate, pipeline value, avg time to convert, score distribution, source analysis, revenue attribution

### Sidebar
Add: `{ href: "/b2c-analytics", label: "B2C Analytics", icon: BarChart3 }`

---

## BC-09: B2C Revenue Attribution

**Priority:** P1 | **Estimate:** 1 day

### Files to Create
- `app/api/b2c/analytics/revenue/route.ts`

Pre-conversion B2C spend, revenue from converters vs non-converters, B2B deal value from converts, ROI ratio. Integrate into BC-08 analytics page.

---

## BC-10: DEX AI Integration Configuration

**Priority:** P1 | **Estimate:** 0.5 days

### Files to Create
- `app/settings/b2c-integration/page.tsx`
- `app/settings/b2c-integration/B2CIntegrationSettings.tsx`
- `app/api/admin/b2c-config/route.ts`

Admin page: API key (readonly/copy), webhook secret, scoring weights editor, alert thresholds, alert delivery config.

---

## Environment Variables (add to Vercel)
```
B2C_INGEST_API_KEY=<generate-uuid>
B2C_WEBHOOK_SECRET=<generate-uuid>
```

## Commit After Each Ticket
Push to `trae/wave1.5-frontend` branch. Do NOT batch commits.
