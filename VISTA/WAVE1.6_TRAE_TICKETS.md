# VISTA Wave 1.6 — Trae Execution Tickets

**Date:** 2026-07-16
**Spec:** `VISTA/spec_wave1.6_revenue_os.md` (full reference)
**DB Migration:** ✅ DONE — all tables exist, all seed data loaded
**Repo:** `kevinhongfr-star/vista` on `main`

---

## ⚠️ Rules for Trae

1. **Do NOT force push main.** Push to feature branch → create PR.
2. **Commit after each ticket.** Don't batch.
3. **No Vibe Coding.** Follow the spec exactly. Tables already exist — only build API routes + frontend.
4. **Stack:** Next.js App Router, TypeScript, Supabase REST (`@supabase/supabase-js`), Tailwind, shadcn/ui.
5. **Test on Vercel preview** before requesting merge.

---

## DB Schema Quick Reference (all tables already exist)

| Table | Key Columns |
|-------|-------------|
| `vista_service_catalog` | id, name, category, **tier (1-7), tier_name, price_min_cny, price_max_cny, price_model, target_buyer, is_discountable, discount_rules** |
| `vista_service_bundles` | id, bundle_name, bundle_code, component_service_names[], bundle_price_min/max_cny, discount_pct |
| `vista_discount_rules` | id, rule_name, applicable_tier, max_discount_pct, condition_type, condition_params, frame_as, **never_override** |
| `vista_cross_sell_rules` | id, source_service_name, target_service_name, priority, trigger_condition, trigger_delay_days, pitch_script, success_rate |
| `vista_proposals` | id, contact_id, proposal_number, service_ids[], bundle_id, total_value_cny, discount_applied_pct, status (draft→sent→accepted→in_progress→completed→declined) |
| `vista_payment_schedules` | id, opportunity_id, total_value_cny, payment_model (milestone/monthly/quarterly/annual/on_completion), schedule JSONB, paid_amount, outstanding_amount |
| `vista_contact_service_engagements` | id, contact_id, service_id, engagement_date, tier_at_engagement, price_paid_cny, was_discounted, discount_pct, status (scheduled/in_progress/completed/cancelled) |
| `vista_content_attribution` | id, content_type (linkedin/newsletter/podcast/webinar/workshop), content_title, contacts_reached/engaged/converted, revenue_attributed_cny |
| `vista_content_contact_interactions` | id, content_id, contact_id, interaction_type (viewed/attended/responded/shared/registered) |
| `vista_workshops` | id, title, workshop_type, scheduled_date, price_cny, max_capacity, registered/attended_count, status (planned/open_registration/full/delivered/cancelled) |
| `vista_workshop_attendees` | id, workshop_id, contact_id, attended, paid_amount_cny, feedback_score, follow_up_status |
| `vista_council_members` | id, contact_id, membership_tier (individual/corporate/pe_partner), annual_fee_cny, start/end_date, status, seats_included/used, is_founding_member |
| `vista_dex_subscriptions` | id, contact_id, subscription_tier (starter/pro/enterprise), monthly_fee_cny, total/used/remaining_credits, status |
| `vista_tier_progressions` | id, contact_id, from_tier, to_tier, triggered_by_service_name, progression_date, days_in_previous_tier |
| `vista_contacts` (new cols) | revenue_potential_score, current_tier, estimated_ltv_cny, recommended_next_service_name, bundle_eligible, funnel_stage |

---

## BATCH A — Revenue Core 🔴 PHASE 1 (Priority: do first)

### A1: Service Catalog API (R-01)
**Scope:** CRUD API for `vista_service_catalog` with tier filtering.
**API Routes:**
- `GET /api/service-catalog` — List all services. Query params: `?tier=3&category=Mid-Ticket&is_discountable=true`
- `GET /api/service-catalog/[id]` — Get single service
- `POST /api/service-catalog` — Create service (admin only)
- `PUT /api/service-catalog/[id]` — Update service
- **Response shape:** `{ id, name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer[], is_discountable, discount_rules, tier_positioning, competitor_anchor }`

**Acceptance criteria:**
- [ ] GET returns all 7 tiers with correct data
- [ ] Tier filtering works
- [ ] Target_buyer array serialized correctly (Postgres TEXT[])

---

### A2: Discount Rules Engine (R-03 + R-18)
**Scope:** API to check discount eligibility + enforce never-discount rules.
**API Routes:**
- `GET /api/discount-rules` — List all active rules
- `POST /api/discount-rules/check` — Validate discount request
  - Input: `{ service_id, requested_discount_pct, contact_id? }`
  - Logic: Look up service tier → find applicable rules → check if `never_override=true` → return max allowed
  - Output: `{ allowed: boolean, max_allowed_pct: number, frame_as: string, reason: string }`
- **Hard rule:** If `never_override=true` for that tier → `allowed: false`, discount field must be disabled in UI

**Frontend component:** `<DiscountField serviceId={id} />` — shows discount input, auto-caps at max%, shows warning for non-discountable services.

**Acceptance criteria:**
- [ ] Search (tier 5) → cannot discount, red warning shown
- [ ] Platform (tier 7) → cannot discount
- [ ] Diagnostic with founding_client → up to 50% off
- [ ] Post-founding retainer → cannot discount

---

### A3: Payment Schedule Tracker (R-06)
**Scope:** CRUD for payment schedules tied to opportunities.
**API Routes:**
- `GET /api/payment-schedules?opportunity_id=X` — Get schedule for opportunity
- `POST /api/payment-schedule` — Create schedule
  - Input: `{ opportunity_id, total_value_cny, payment_model, schedule: [{date, amount, description}] }`
  - Auto-calculate: `outstanding_amount = total - paid`
- `PUT /api/payment-schedule/[id]` — Update payment status
  - Input: `{ milestone_index, status: 'invoiced'|'paid' }`
  - Auto-update: paid_amount, outstanding_amount, next_payment_date

**Payment model templates (auto-generate schedule JSONB):**
- Search: 3 milestones (1/3 retainer, 1/3 shortlist, 1/3 start)
- Advisory: 2 milestones (50% kick-off, 50% delivery)
- Retainer: monthly installments
- Platform: monthly subscription

**Acceptance criteria:**
- [ ] Schedule auto-generated from payment_model template
- [ ] Status updates correctly recalculate outstanding
- [ ] Overdue detection (next_payment_date < today && status != 'paid')

---

### A4: Service Engagement Tracker (R-08)
**Scope:** Track which services each contact has engaged with.
**API Routes:**
- `GET /api/contacts/[id]/engagements` — Full service history for contact
- `POST /api/engagements` — Log new engagement
  - Input: `{ contact_id, service_id, engagement_date, price_paid_cny, was_discounted, discount_pct, status }`
- `PUT /api/engagements/[id]` — Update status/satisfaction
- `GET /api/engagements?service_id=X&status=completed` — All completed engagements for a service

**Acceptance criteria:**
- [ ] Engagement logged with correct tier_at_engagement (auto-pulled from service)
- [ ] Contact profile shows full service history timeline
- [ ] Stats: total engagements by service, by tier, by month

---

## BATCH B — Proposal Engine 🔴 PHASE 1

### B1: Bundle API (R-02)
**Scope:** CRUD for service bundles + pricing calculator.
**API Routes:**
- `GET /api/bundles` — List active bundles
- `POST /api/bundles/calculate` — Calculate bundle pricing
  - Input: `{ service_ids: string[] }`
  - Logic: Check if services match any bundle → return individual_total vs bundle_price vs savings
  - Output: `{ individual_total: number, bundle_price: number, savings_pct: number, recommended_bundle: { id, name } | null }`

**Acceptance criteria:**
- [ ] Calculator correctly identifies matching bundles
- [ ] "Add [X] to qualify for [Bundle Y]" suggestion when close
- [ ] Savings percentage calculated correctly

---

### B2: Proposal Generator (R-04)
**Scope:** Create, manage, and export pricing proposals.
**API Routes:**
- `GET /api/proposals` — List proposals (filter by contact, status)
- `POST /api/proposals` — Create proposal
  - Input: `{ contact_id, service_ids[], bundle_id?, discount_pct?, notes? }`
  - Auto: generate proposal_number (format: `PROP-YYYYMMDD-NNN`), calculate total, validate discount
- `GET /api/proposals/[id]` — Get proposal with full details
- `PUT /api/proposals/[id]/status` — Update status (enforce valid transitions)
- `GET /api/proposals/[id]/pdf` — Generate PDF (use `@react-pdf/renderer` or simple HTML→PDF)

**Proposal PDF contents:**
- Contact details
- Recommended services + rationale
- Individual pricing vs bundle comparison
- Applied discount with proper framing
- Payment schedule options
- Valid-until date

**Status flow:** draft → sent → accepted → in_progress → completed (or declined)

**Acceptance criteria:**
- [ ] Proposal auto-calculates total from services + bundle + discount
- [ ] Discount validated against rules (cannot exceed max, cannot discount never-discountable)
- [ ] PDF generation works
- [ ] Status transitions enforced

---

### B3: Bundle Suggestion Widget (R-17)
**Scope:** Frontend widget that suggests bundles when building proposals.
**Component:** `<BundleSuggestion serviceIds={string[]} />`
- Fetches matching bundles from `/api/bundles/calculate`
- Shows: "💡 Save 20% by bundling into [Bundle Name]"
- If no exact match: "Add [Service X] to qualify for [Bundle Y] at [Z%] savings"
- Click to auto-apply bundle to proposal

**Acceptance criteria:**
- [ ] Shows on proposal creation page
- [ ] Auto-calculates savings
- [ ] One-click apply

---

## BATCH C — Funnel + Attribution 🟡 PHASE 2

### C1: Tiered Funnel Model (R-09)
**Scope:** Replace linear funnel with 7-tier model on contact records.
**API Routes:**
- `PUT /api/contacts/[id]/funnel-stage` — Update contact's funnel stage
  - Stages: `awareness → engagement → validation → investment → transformation → membership → advocacy`
  - Auto-log tier progression when stage changes
- `GET /api/funnel/overview` — Aggregate funnel metrics
  - Output: `{ stages: [{ name, count, pct_of_total, avg_days_in_stage }] }`

**Acceptance criteria:**
- [ ] Stage change creates entry in `vista_tier_progressions`
- [ ] Funnel overview shows distribution across 7 stages
- [ ] Pipeline page shows tier-based columns

---

### C2: Tier Progression Analytics (R-10)
**Scope:** Dashboard showing tier movement analytics.
**API Routes:**
- `GET /api/analytics/tier-progressions` — Time-series data
  - Output: `{ progressions: [{ from_tier, to_tier, count, avg_days }], period }`
- `GET /api/analytics/tier-conversion` — Conversion rates per tier transition

**Frontend:** `<TierFunnelChart />` — Sankey-style or bar chart showing flow between tiers.

**Acceptance criteria:**
- [ ] Shows avg days per tier
- [ ] Shows conversion rate tier-to-tier
- [ ] Highlights drop-off points

---

### C3: Content Attribution (R-11)
**Scope:** Track content → lead → revenue attribution.
**API Routes:**
- `GET /api/content-attribution` — List content pieces with metrics
- `POST /api/content-attribution` — Log new content piece
- `POST /api/content-attribution/[id]/interactions` — Log contact interaction
- `GET /api/content-attribution/roi` — Content ROI dashboard data

**Frontend:** Content dashboard showing:
- Content ROI: revenue_attributed / estimated_production_cost
- Best-performing content types (bar chart)
- Content → conversation conversion rate
- Content → paid tier conversion rate

---

### C4: Workshop Management (R-12)
**Scope:** CRUD for workshops + attendee management.
**API Routes:**
- `GET /api/workshops` — List workshops (filter by status, date)
- `POST /api/workshops` — Create workshop
- `POST /api/workshops/[id]/attendees` — Register attendee
- `PUT /api/workshops/[id]/attendees/[contact_id]` — Update attendance/feedback/follow-up
- `GET /api/workshops/[id]/report` — Workshop report (registered, attended, conversion rate)

**Frontend:** Workshop management page with:
- Workshop list (calendar view)
- Attendee management (check-in, feedback)
- Post-workshop follow-up pipeline

---

## BATCH D — Membership + Platform 🟡 PHASE 2

### D1: Council Membership Module (R-13)
**Scope:** Manage Council as membership product.
**API Routes:**
- `GET /api/council/members` — List members (filter by tier, status)
- `POST /api/council/members` — Add member
  - Validate capacity: Individual 60 max, Corporate 10 max, PE Partner 5 max
- `PUT /api/council/members/[id]` — Update status/renewal
- `GET /api/council/dashboard` — Capacity visualization, renewal pipeline, referral tracking

**Frontend:** Council dashboard with:
- Capacity bars (47/60, 7/10, 3/5)
- Renewal pipeline (90-day lookahead)
- Founding member badges

---

### D2: DEX AI Subscription Tracking (R-14)
**Scope:** Track DEX AI usage and upgrade paths.
**API Routes:**
- `GET /api/dex/subscriptions` — List subscriptions
- `POST /api/dex/subscriptions` — Create subscription
- `PUT /api/dex/subscriptions/[id]` — Update usage/credits
- `GET /api/dex/subscriptions/[id]/alerts` — Low credit, trial ending, low engagement alerts

**Frontend:** Subscription management view with usage bars and upgrade prompts.

---

### D3: Contact Revenue Scoring (R-07)
**Scope:** Score contacts by revenue potential.
**API Routes:**
- `POST /api/contacts/[id]/revenue-score` — Calculate and update score
  - Factors: current_tier engagement, company size, role seniority, historical engagement, cross-sell potential
  - Output: `{ revenue_potential_score (0-100), recommended_next_tier, estimated_ltv_cny }`
- `GET /api/contacts?sort=revenue_potential_score` — Already supported via existing contacts API (just needs the column)

**Acceptance criteria:**
- [ ] Score auto-calculated when engagement is logged
- [ ] Contact profile shows revenue potential card
- [ ] Leaderboard view: top 50 contacts by revenue potential

---

## BATCH E — Cross-Sell + Dashboard 🟢 PHASE 3

### E1: Cross-Sell Rules API (R-15 + R-16)
**Scope:** CRUD for cross-sell rules + auto-recommendation engine.
**API Routes:**
- `GET /api/cross-sell-rules` — List rules
- `GET /api/contacts/[id]/cross-sell-recommendations` — Get recommendations for contact
  - Logic: Find completed engagements → look up rules where source matches → rank by priority × success_rate → return top 3
  - Output: `[{ target_service, pitch_script, priority, estimated_value }]`
- `POST /api/cross-sell-rules/[id]/success` — Update success_rate when cross-sell converts

**Frontend:** `<CrossSellCard contactId={id} />` on contact profile — shows "Recommended Next Step" with pitch script.

---

### E2: Revenue Dashboard (R-05)
**Scope:** Main revenue analytics dashboard.
**API Routes:**
- `GET /api/revenue/dashboard` — Aggregated revenue metrics
  - Revenue by tier (pie + trend)
  - Revenue by service (bar)
  - Bundle adoption rate
  - Avg deal size by tier
  - Tier conversion funnel
  - Discount utilization
  - Revenue per consultant
  - Pipeline value by tier/stage

**Frontend:** New page at `/app/revenue/page.tsx`:
- Monthly/Quarterly/Annual toggle
- Per-consultant breakdown
- Tier progression drill-down
- All charts using recharts or simple SVG

---

## Execution Order (recommended)

```
Week 1: A1 (Catalog API) + A2 (Discount Engine)
Week 2: A3 (Payment) + A4 (Engagements) + B1 (Bundles)
Week 3: B2 (Proposals) + B3 (Bundle Widget) → PHASE 1 COMPLETE
Week 4: C1 (Funnel) + C2 (Progression Analytics)
Week 5: C3 (Content Attribution) + C4 (Workshops)
Week 6: D1 (Council) + D2 (DEX) + D3 (Revenue Scoring)
Week 7: E1 (Cross-Sell) + E2 (Revenue Dashboard) → WAVE 1.6 COMPLETE
```

---

## Also: Frontend Polish (from NEXT_TICKETS.md, P1-P3)

These are independent of Wave 1.6 and can be done in parallel:

| Ticket | What | Est |
|--------|------|-----|
| P1-1 | Tooltips on ALL interactive elements | 2h |
| P1-2 | ConfirmDialog on destructive actions | 30m |
| P1-3 | Multi-select on Signals, Campaigns, Clusters | 1.5h |
| P2-1 | Saved filter presets + URL sync | 2h |
| P2-2 | KPI sparklines on Dashboard | 1.5h |
| P2-3 | Contact hover preview cards | 2h |
| P3-1 | Pipeline drag-and-drop | 3h |
| P3-2 | Score visualizations with explanations | 2h |

---

*Generated by James/AI | 2026-07-16 | Source: spec_wave1.6_revenue_os.md + NEXT_TICKETS.md*
