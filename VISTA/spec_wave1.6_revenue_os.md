# Wave 1.6 — Revenue Operating System

**Version:** 1.0 | **Date:** 2026-07-12 | **Author:** James/AI for Kevin Hong
**Depends on:** Wave 1 (Foundation ✅), Wave 1.5 (Funnel Core — DB migrated)
**Blocks:** Wave 2 (Context & Connectivity)
**Estimated Duration:** 18 working days

---

## Why This Wave Exists

The Pricing Strategy & Market Penetration Playbook (2026-07-12) fundamentally restructures VISTA from a BD contact management tool into a **Revenue Operating System**. This wave implements the pricing architecture, tiered conversion funnel, cross-sell rules engine, and content attribution tracking that the business now requires.

**Core principle:** Every contact has a revenue path. VISTA tracks, recommends, and enforces it.

---

## Architecture Overview

### The Tiered Conversion Model

```
Tier 1: FREE (Acquisition)           → 5 products (Content, Newsletter, Podcast, Webinar, Teaser)
Tier 2: LOW-TICKET (Validation)      → 6 products (Workshops, Reports, Maps, Council starter, DEX Starter)
Tier 3: MID-TICKET (Revenue)         → 7 products (Diagnostics, Coaching, Training, Syndicate, DEX Pro, Mapping)
Tier 4: HIGH-TICKET (Proof)          → 7 products (Advisory projects, Retainers, PE deals, DEX Enterprise)
Tier 5: SEARCH (Cash Engine)         → 4 products (Retained, Contingent, Bundled, Mapping-to-Search)
Tier 6: THE COUNCIL (Recurring)      → 3 tiers (Individual, Corporate, PE Partner)
Tier 7: PLATFORM (DEX AI)            → 6 products (Starter, Pro, Enterprise, Credits, METRIX, Team Diagnostic)
```

### Revenue Path Per Contact

```
Contact enters → Content/Webinar (T1) → Workshop (T2) → Diagnostic (T3) → Advisory (T4) → Retainer (T4)
                                                                    ↓                          ↓
                                                              Search (T5)              Platform (T7)
                                                                    ↓                          ↓
                                                              Council (T6) ←─────────────── Council (T6)
```

---

## Domain 1: Service Catalog Overhaul (R-01 to R-08)

### R-01: Service Catalog Restructure — 7 Tier Architecture
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Restructure `vista_service_catalog` from flat 24-service list to 7-tier architecture.

**New schema additions to `vista_service_catalog`:**
```sql
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS tier INT DEFAULT 3;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS tier_name TEXT;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS price_min_cny NUMERIC;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS price_max_cny NUMERIC;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS price_model TEXT; -- 'per_project', 'per_month', 'per_year', 'per_role', 'per_assessment', 'free'
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS engagement_duration TEXT; -- '2-4 weeks', '3 months', '6-12 months', etc.
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS target_buyer TEXT[]; -- array of buyer personas
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS is_discountable BOOLEAN DEFAULT true;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS discount_rules JSONB; -- {max_discount_pct, conditions, frame_as}
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS tier_positioning TEXT; -- how to position this tier
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS competitor_anchor TEXT; -- what we're priced against
```

**Seed data — All 7 tiers:**

**Tier 1 (Free):**
| Service | Price | Price Model | Target Buyer |
|---------|-------|-------------|-------------|
| LinkedIn Content (3x/week) | 0 | free | All ICP contacts |
| Newsletter (weekly) | 0 | free | All contacts |
| Podcast (weekly) | 0 | free | Target guests + listeners |
| Webinar (monthly, 45 min) | 0 | free | Nurture list + workshop leads |
| Diagnostic Teaser (15 min) | 0 | free | Conversation-stage contacts |

**Tier 2 (Low-Ticket):**
| Service | Price Min | Price Max | Price Model |
|---------|-----------|-----------|-------------|
| Workshop (online, 2-3hr) | 2,000 | 5,000 | per_session |
| Workshop (half-day intensive) | 5,000 | 8,000 | per_session |
| Insights Report (single issue) | 1,500 | 3,000 | per_issue |
| Talent Market Map (one market/role) | 3,000 | 8,000 | per_project |
| The Council (annual) | 8,000 | 15,000 | per_year |
| DEX AI Starter Credits | 500 | 2,000 | one_time |

**Tier 3 (Mid-Ticket):**
| Service | Price Min | Price Max | Price Model |
|---------|-----------|-----------|-------------|
| Diagnostic (PRISM/BRIDGE/MOSAIC/SPARK/FORGE) | 8,000 | 25,000 | per_project |
| Executive Coaching (6 sessions) | 18,000 | 36,000 | per_engagement |
| Executive Coaching (12 sessions) | 30,000 | 60,000 | per_engagement |
| Training Program (custom, 3 sessions) | 15,000 | 30,000 | per_program |
| Syndicate Intelligence Subscription | 30,000 | 60,000 | per_year |
| DEX AI Pro Subscription | 5,000 | 15,000 | per_month |
| Mapping Project (full market scan) | 15,000 | 40,000 | per_project |

**Tier 4 (High-Ticket):**
| Service | Price Min | Price Max | Price Model |
|---------|-----------|-----------|-------------|
| Advisory Project (single product) | 40,000 | 80,000 | per_project |
| Advisory Project (multi-product) | 80,000 | 150,000 | per_project |
| HQ-China Alignment (BRIDGE full) | 60,000 | 120,000 | per_project |
| AI Transformation (SPARK full) | 80,000 | 150,000 | per_project |
| Retainer (monthly advisory) | 15,000 | 30,000 | per_month |
| PE Portfolio Talent Review (annual) | 80,000 | 150,000 | per_year |
| DEX AI Enterprise License | 15,000 | 30,000 | per_month |

**Tier 5 (Search):**
| Service | Price Min | Price Max | Price Model |
|---------|-----------|-----------|-------------|
| Retained Executive Search | 75,000 | 200,000 | per_role |
| Contingent Search | 50,000 | 150,000 | per_role |
| Search + Diagnostic Bundle | 90,000 | 215,000 | per_role |
| Mapping-to-Search Pipeline | 15,000 | 40,000 | per_role |

**Tier 6 (The Council):**
| Service | Price Min | Price Max | Price Model | Capacity |
|---------|-----------|-----------|-------------|----------|
| Council Individual Member | 12,000 | 12,000 | per_year | 60 max |
| Council Corporate Member | 30,000 | 30,000 | per_year | 10 max |
| Council PE Partner Member | 50,000 | 50,000 | per_year | 5 max |

**Tier 7 (Platform — DEX AI):**
| Service | Price Min | Price Max | Price Model |
|---------|-----------|-----------|-------------|
| DEX AI Starter (10 credits) | 500 | 500 | one_time |
| DEX AI Pro (100 credits/mo) | 5,000 | 5,000 | per_month |
| DEX AI Enterprise (unlimited) | 15,000 | 30,000 | per_month |
| DEX AI Credit Top-Up (per credit) | 50 | 50 | per_unit |
| METRIX Assessment (standalone) | 200 | 500 | per_assessment |
| Team Diagnostic (up to 10 people) | 3,000 | 8,000 | one_time |

**Acceptance criteria:**
- All 7 tiers seeded in `vista_service_catalog`
- Tier-based filtering works in API
- Each service has price range, model, target buyer, discountability

---

### R-02: Bundle Definitions & Pricing Engine
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Create bundle definitions table and pricing calculation engine.

**New table: `vista_service_bundles`**
```sql
CREATE TABLE IF NOT EXISTS vista_service_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_name TEXT NOT NULL,
    bundle_code TEXT UNIQUE NOT NULL,
    component_service_ids UUID[] NOT NULL, -- references to vista_service_catalog
    individual_total_min NUMERIC,
    individual_total_max NUMERIC,
    bundle_price_min NUMERIC NOT NULL,
    bundle_price_max NUMERIC NOT NULL,
    discount_pct NUMERIC NOT NULL, -- e.g. 0.20 for 20%
    description TEXT,
    positioning TEXT, -- how to frame the bundle
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Seed bundles:**
| Bundle | Components | Individual Price | Bundle Price | Discount |
|--------|-----------|-----------------|-------------|---------|
| Search + Diagnose | Retained search + Diagnostic | 100-220K | 110-200K | 8-10% |
| Diagnose + Develop | Diagnostic + 6mo Coaching | 50-85K | 40-68K | 20% |
| Diagnose + Transform | Diagnostic + Advisory | 80-175K | 65-140K | 19% |
| Full Program (ASCENT) | Diag + Coach + Workshop + Retainer | 85-145K | 68-116K | 20% |
| PE Portfolio | Annual review + 2 searches + Retainer | 340-490K | 280-400K | 18% |
| Council + Workshop | Annual membership + 2 workshop seats | 22-45K | 18-36K | 18% |

**API endpoint:** `POST /api/bundles/calculate`
- Input: `{ service_ids: [], contact_tier: int }`
- Output: `{ individual_total, bundle_price, savings_pct, recommended_bundle }`

---

### R-03: Discount Rules Engine
**Priority:** 🔴 Critical | **Estimate:** 2 days

**What:** Encode discount rules as a configuration table + validation logic.

**New table: `vista_discount_rules`**
```sql
CREATE TABLE IF NOT EXISTS vista_discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    applicable_service_ids UUID[], -- null = all services
    applicable_tiers INT[], -- which pricing tiers this applies to
    max_discount_pct NUMERIC NOT NULL,
    condition_type TEXT NOT NULL, -- 'founding_client', 'annual_commitment', 'early_bird', 'bundle', 'volume'
    condition_params JSONB, -- {first_n_clients: 3, min_months: 12, etc.}
    frame_as TEXT NOT NULL, -- how to present the discount to client
    is_never_discountable BOOLEAN DEFAULT false, -- override: cannot discount regardless
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Seed rules:**
| Rule | Max Discount | Frame As | Never Override |
|------|-------------|----------|---------------|
| Founding Client (first 3 diagnostics) | 50% | "Founding client rate" | — |
| Annual Retainer (12-month commitment) | 20% | "Annual partnership rate" | — |
| Council Founding Members | 20% | "Founding member rate" | — |
| Workshop Early-Bird (2+ weeks before) | 15% | "Early-bird pricing" | — |
| Multi-Product Bundle | 30% | "Program rate" | — |
| Search — NEVER discount | 0% | N/A | ✅ SEARCH |
| Platform Subscriptions — NEVER | 0% | N/A | ✅ PLATFORM |
| Retainers after first 3 — NEVER | 0% | N/A | ✅ RETAINER |

**Validation function:** `check_discount_eligibility(service_id, requested_discount_pct, contact_history) → {allowed: bool, max_allowed: num, frame_as: text, reason: text}`

---

### R-04: Proposal & Quote Generator
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Auto-generate pricing proposals based on contact context, recommended services, and applicable bundles/discounts.

**Features:**
- Select services for a contact → auto-calculate pricing
- Show bundle savings vs. individual pricing
- Enforce discount rules (cannot exceed max %)
- Generate quote PDF with:
  - Contact details
  - Recommended services + rationale
  - Pricing (individual vs. bundle comparison)
  - Payment schedule options
  - Applicable discount with proper framing
- Payment schedule templates:
  - Search: 1/3 retainer, 1/3 shortlist, 1/3 start
  - Advisory: 50% on kick-off, 50% on delivery
  - Retainer: Monthly, quarterly, or annual
  - Platform: Monthly subscription

**API endpoints:**
- `POST /api/proposals/generate` — Generate proposal from service selection
- `GET /api/proposals/:id` — Get proposal details
- `GET /api/proposals/:id/pdf` — Download PDF
- `PUT /api/proposals/:id/status` — Draft → Sent → Accepted → In Progress → Completed

---

### R-05: Revenue Tracking Dashboard
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Dashboard showing revenue metrics aligned to the 7-tier model.

**Key metrics:**
- Revenue by tier (pie chart + trend line)
- Revenue by service (bar chart)
- Bundle adoption rate (% of deals that use bundles)
- Average deal size by tier
- Conversion rate between tiers (funnel visualization)
- Discount utilization (% of deals at max discount vs. below)
- Revenue per consultant
- Pipeline value by tier and stage

**Views:**
- Monthly/Quarterly/Annual toggle
- Per-consultant breakdown
- Tier progression drill-down (click tier → see contacts moving through it)

---

### R-06: Payment Schedule Tracker
**Priority:** 🟢 Medium | **Estimate:** 2 days

**What:** Track payment milestones for each engagement.

**New table: `vista_payment_schedules`**
```sql
CREATE TABLE IF NOT EXISTS vista_payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES vista_opportunities(id),
    total_value_cny NUMERIC NOT NULL,
    currency TEXT DEFAULT 'CNY',
    payment_model TEXT NOT NULL, -- 'milestone', 'monthly', 'quarterly', 'annual', 'on_completion'
    schedule JSONB NOT NULL, -- [{date, amount, description, status}]
    paid_amount NUMERIC DEFAULT 0,
    outstanding_amount NUMERIC,
    next_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Features:**
- Auto-generate schedule based on service type
- Payment status tracking (Pending → Invoiced → Paid → Overdue)
- Overdue alerts
- Revenue recognition tracking (for financial reporting)

---

### R-07: Contact Revenue Potential Scoring
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Score each contact by their potential revenue value based on tier progression.

**Scoring factors:**
- Current tier engagement (are they already buying?)
- Company size and industry fit
- Role seniority (C-suite = higher potential)
- Historical engagement (workshop → diagnostic → advisory progression)
- Cross-sell potential (how many additional services could they buy?)
- Bundle eligibility (are they a candidate for bundled deals?)

**Output:** `revenue_potential_score` (0-100) + `recommended_next_tier` + `estimated_lifetime_value_cny`

**New columns on `vista_contacts`:**
```sql
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS revenue_potential_score INT DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS current_tier INT DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS estimated_ltv_cny NUMERIC DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS recommended_next_service UUID;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS bundle_eligible BOOLEAN DEFAULT false;
```

---

### R-08: Service Engagement Tracker
**Priority:** 🟡 High | **Estimate:** 1 day

**What:** Track which services each contact has engaged with, and their progression.

**New table: `vista_contact_service_engagements`**
```sql
CREATE TABLE IF NOT EXISTS vista_contact_service_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    service_id UUID REFERENCES vista_service_catalog(id),
    engagement_date DATE,
    tier_at_engagement INT,
    price_paid_cny NUMERIC,
    was_discounted BOOLEAN DEFAULT false,
    discount_pct NUMERIC DEFAULT 0,
    discount_rule_applied TEXT,
    status TEXT DEFAULT 'completed', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    satisfaction_score INT, -- 1-5
    testimonial_obtained BOOLEAN DEFAULT false,
    converted_to_service_id UUID, -- what did this engagement lead to?
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Features:**
- Full service history per contact
- "Upgrade path" visualization (what they bought → what they could buy next)
- Cross-sell trigger: when service X is completed, auto-suggest service Y per the matrix
- Testimonial tracking (did we get a testimonial from this engagement?)

---

## Domain 2: Funnel Engine Rework — Tiered Conversion (R-09 to R-14)

### R-09: Tiered Funnel Stage Model
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Replace the linear 500→50→10→2 funnel with a 7-tier conversion model.

**New funnel stages (replaces old `vista_outreach_sequences.stages`):**

```
Stage 1: AWARENESS      → Contact is in network, receives free content
Stage 2: ENGAGEMENT     → Contact attended webinar/workshop/consumed content
Stage 3: VALIDATION     → Contact paid for low-ticket (workshop, report, DEX starter)
Stage 4: INVESTMENT     → Contact paid for mid-ticket (diagnostic, coaching, mapping)
Stage 5: TRANSFORMATION → Contact paid for high-ticket (advisory, retainer, search)
Stage 6: MEMBERSHIP     → Contact is Council member or platform subscriber
Stage 7: ADVOCACY       → Contact refers others, provides testimonials, case study subject
```

**Key change:** Each contact has a `current_funnel_stage` that can move FORWARD and BACKWARD. A diagnostic client (Stage 4) who doesn't convert to advisory stays at 4 but gets flagged for nurture.

**API changes:**
- Modify `vista_outreach_sequences` to support tier-based sequencing
- Each tier has its own nurture cadence
- Auto-progression rules (e.g., workshop attendee → automatically moves to Stage 3 if they paid)

---

### R-10: Tier Progression Tracking & Analytics
**Priority:** 🔴 Critical | **Estimate:** 2 days

**What:** Track and visualize how contacts move between tiers.

**New table: `vista_tier_progressions`**
```sql
CREATE TABLE IF NOT EXISTS vista_tier_progressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    from_tier INT,
    to_tier INT,
    triggered_by_service_id UUID, -- which service caused the tier move
    progression_date DATE NOT NULL,
    days_in_previous_tier INT,
    consultant_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Analytics:**
- Average days per tier
- Conversion rate tier-to-tier
- Drop-off points (where do contacts stall?)
- Fastest paths to high-value tiers
- Revenue per tier transition

---

### R-11: Content Attribution Engine
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Track which content pieces (LinkedIn, Newsletter, Podcast, Webinar) generated which leads and revenue.

**New table: `vista_content_attribution`**
```sql
CREATE TABLE IF NOT EXISTS vista_content_attribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL, -- 'linkedin', 'newsletter', 'podcast', 'webinar', 'workshop'
    content_title TEXT NOT NULL,
    content_date DATE,
    content_url TEXT,
    contacts_reached INT DEFAULT 0,
    contacts_engaged INT DEFAULT 0, -- clicked, attended, responded
    contacts_converted INT DEFAULT 0, -- moved to paid tier
    revenue_attributed_cny NUMERIC DEFAULT 0,
    attribution_model TEXT DEFAULT 'direct', -- 'direct', 'first_touch', 'last_touch', 'weighted'
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**New table: `vista_content_contact_interactions`**
```sql
CREATE TABLE IF NOT EXISTS vista_content_contact_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES vista_content_attribution(id),
    contact_id UUID REFERENCES vista_contacts(id),
    interaction_type TEXT NOT NULL, -- 'viewed', 'attended', 'responded', 'shared', 'registered'
    interaction_date TIMESTAMPTZ DEFAULT now(),
    resulted_in_conversation BOOLEAN DEFAULT false,
    conversation_id UUID -- link to outreach conversation if applicable
);
```

**Dashboard metrics:**
- Content ROI: revenue attributed / content production cost
- Best-performing content types
- Content → conversation conversion rate
- Content → paid tier conversion rate

---

### R-12: Workshop & Event Management
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Track workshops as tier-2 products with attendee management and follow-up automation.

**New table: `vista_workshops`**
```sql
CREATE TABLE IF NOT EXISTS vista_workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    workshop_type TEXT NOT NULL, -- 'online_2_3hr', 'half_day_intensive', 'webinar_45min'
    scheduled_date TIMESTAMPTZ,
    duration_minutes INT,
    price_cny NUMERIC,
    max_capacity INT,
    registered_count INT DEFAULT 0,
    attended_count INT DEFAULT 0,
    status TEXT DEFAULT 'planned', -- 'planned', 'open_registration', 'full', 'delivered', 'cancelled'
    recording_url TEXT,
    content_clips TEXT[], -- URLs to clips for content repurposing
    follow_up_sequence_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**New table: `vista_workshop_attendees`**
```sql
CREATE TABLE IF NOT EXISTS workshop_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID REFERENCES vista_workshops(id),
    contact_id UUID REFERENCES vista_contacts(id),
    registration_date TIMESTAMPTZ DEFAULT now(),
    attended BOOLEAN DEFAULT false,
    paid_amount_cny NUMERIC DEFAULT 0,
    feedback_score INT, -- 1-5
    follow_up_status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'meeting_booked', 'proposal_sent', 'converted'
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Automations:**
- Post-workshop: auto-send follow-up email within 24hrs
- Non-attendees: send recording + "sorry we missed you"
- All attendees: add to follow-up sequence for diagnostic upsell
- 7 days post: auto-suggest diagnostic to attendees who haven't engaged further

---

### R-13: The Council Membership Module
**Priority:** 🟡 Medium | **Estimate:** 3 days

**What:** Manage The Council as a membership product with tiers, capacity limits, and renewal tracking.

**New table: `vista_council_members`**
```sql
CREATE TABLE IF NOT EXISTS vista_council_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    membership_tier TEXT NOT NULL, -- 'individual', 'corporate', 'pe_partner'
    annual_fee_cny NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'renewed'
    auto_renew BOOLEAN DEFAULT false,
    seats_included INT DEFAULT 1,
    seats_used INT DEFAULT 0,
    roundtables_attended INT DEFAULT 0,
    workshop_seats_used INT DEFAULT 0,
    referral_count INT DEFAULT 0, -- how many people they've referred
    is_founding_member BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Capacity tracking:**
- Individual: 60 max (founding members get 20% off)
- Corporate: 10 max (2 seats + 1 workshop seat + quarterly 1:1)
- PE Partner: 5 max (unlimited seats + 2 portfolio reviews/year)

**Automations:**
- 90 days before renewal: auto-alert consultant
- 60 days before: send renewal proposal
- 30 days before: escalate to partner
- On expiry: flag contact, pause benefits

**Dashboard:**
- Membership count by tier (with capacity visualization: 47/60, 7/10, 3/5)
- Renewal pipeline (upcoming renewals in next 90 days)
- Referral tracking (which members are referring others?)
- Revenue from Council (recurring, annual)

---

### R-14: DEX AI Platform Tracking
**Priority:** 🟢 Medium (Month 4+) | **Estimate:** 2 days

**What:** Track DEX AI product usage, credits, and upgrade paths. Note: This is for tracking — the actual DEX AI platform may be separate.

**New table: `vista_dex_subscriptions`**
```sql
CREATE TABLE IF NOT EXISTS vista_dex_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    company_id UUID, -- link to company if applicable
    subscription_tier TEXT NOT NULL, -- 'starter', 'pro', 'enterprise'
    monthly_fee_cny NUMERIC,
    total_credits INT DEFAULT 0,
    used_credits INT DEFAULT 0,
    remaining_credits INT,
    subscription_start DATE,
    subscription_end DATE,
    status TEXT DEFAULT 'active', -- 'trial', 'active', 'paused', 'cancelled', 'upgraded'
    auto_renew BOOLEAN DEFAULT true,
    last_credit_usage_date DATE,
    upgrade_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Automations:**
- At 80% credit usage: "You've used 8 of 10 credits. Here's what unlimited looks like."
- Trial ending in 7 days: auto-email
- Low engagement (no usage in 30 days): re-engagement campaign
- Upgrade suggestion based on usage patterns

---

## Domain 3: Cross-Sell Rules Engine (R-15 to R-18)

### R-15: Cross-Sell Matrix Configuration
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Encode the explicit cross-sell paths from the pricing playbook.

**New table: `vista_cross_sell_rules`**
```sql
CREATE TABLE IF NOT EXISTS vista_cross_sell_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_service_id UUID REFERENCES vista_service_catalog(id),
    target_service_id UUID REFERENCES vista_service_catalog(id),
    priority INT DEFAULT 50, -- 1-100, higher = recommend first
    trigger_condition TEXT DEFAULT 'on_completion', -- 'on_completion', 'on_schedule', 'on_signal', 'manual'
    trigger_delay_days INT DEFAULT 0, -- days after trigger to show recommendation
    pitch_script TEXT, -- what to say when recommending
    success_rate NUMERIC DEFAULT 0, -- track how often this cross-sell converts
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Seed the 10 cross-sell paths:**
| If bought | Recommend | Pitch |
|-----------|-----------|-------|
| Executive Search | Diagnostic | "We found your VP. Here's their leadership profile. Want to see how they'll fit with your existing team?" |
| Diagnostic (PRISM) | Coaching | "Your brand assessment shows X. Here's a 6-month coaching arc to build it." |
| Diagnostic (BRIDGE) | Workshop | "Your HQ-China gap is clear. Bring your leadership team to our alignment workshop." |
| Diagnostic (SPARK) | Advisory | "Your AI readiness score is 35/100. Here's a 6-month transformation roadmap." |
| Workshop | Diagnostic | "You saw the framework in the workshop. Here's what it looks like for YOUR team specifically." |
| Coaching | Retainer | "Your coaching is going well. Want ongoing advisory access so you don't lose momentum?" |
| Mapping Project | Search | "We mapped the market. Here are the top 5 candidates. Want us to approach them?" |
| The Council | Workshop | "As a Council member, you get priority seating + 20% off workshops." |
| DEX AI Starter | Pro Subscription | "You've used 8 of 10 credits. Here's what unlimited looks like." |
| Retainer | Search | "Your retainer includes quarterly talent reviews. Found any hard-to-fill roles?" |

---

### R-16: Automated Cross-Sell Recommendations
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** When a service engagement completes, auto-generate cross-sell recommendations on the contact's profile.

**Logic:**
1. Service X completed → look up `vista_cross_sell_rules` where `source_service_id = X`
2. Rank by priority and success rate
3. Display on contact profile as "Recommended Next Step"
4. Include the pitch script for the consultant
5. Auto-create follow-up task with delay from `trigger_delay_days`

**UI:**
- On contact profile: "Recommended Next" card showing service + pitch
- On kanban: flag contacts who have pending cross-sell recommendations
- In daily briefing: "3 contacts ready for cross-sell follow-up"

---

### R-17: Bundle Suggestion Engine
**Priority:** 🟡 High | **Estimate:** 1 day

**What:** When a consultant is building a proposal, auto-suggest applicable bundles.

**Logic:**
1. Consultant selects 2+ services for a contact
2. System checks `vista_service_bundles` for any bundle containing those services
3. If match: show bundle with savings calculation
4. If no exact match: show nearest bundle + "add [service X] to qualify for [bundle Y] at [Z%] savings"

**UI:**
- Proposal builder: "💡 You could save 20% by bundling these into 'Diagnose + Develop'"
- Contact profile: "This contact qualifies for [Bundle Name] — saves ¥XX,XXX"

---

### R-18: "Never Discount" Enforcement
**Priority:** 🔴 Critical | **Estimate:** 1 day

**What:** Hard enforcement of discount rules — system physically prevents discounting search, post-founding retainers, and platform subscriptions.

**Logic:**
1. When proposal is created, check service against `vista_discount_rules`
2. If service has `is_never_discountable = true` → discount input disabled, tooltip explains why
3. If service has max_discount_pct → input capped at that value
4. If founding client rule applies → show "Founding client rate" option with proper frame

**UI:**
- Grayed-out discount field for non-discountable services
- Red warning: "Search fees cannot be discounted per LYC pricing policy"
- Green badge: "Founding client rate available — saves 40%"

---

## Domain 4: Phase-Aligned Build Priority (R-19 to R-20)

### R-19: Phase 1 (Month 1-2) Minimum Viable Revenue Stack
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Build the minimum VISTA capabilities needed to execute Phase 1 of the pricing playbook (WEDGE: Search as entry point).

**Must-haves for Phase 1:**
- ✅ Contact management (Wave 1 done)
- ✅ Outreach tracking (Wave 1.5 done)
- R-01: Service catalog with Tier 5 (Search) services priced
- R-08: Service engagement tracker (track search placements)
- R-06: Payment schedule tracker (track 1/3-1/3-1/3 search payments)
- R-03: Discount rules (search = never discount)
- Basic dashboard: search pipeline value, placements this month

**Phase 1 revenue target:** 75-200K from search

---

### R-20: Phase 2 (Month 2-4) Diagnostic + Workshop Stack
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Build capabilities needed for Phase 2 (PROVE: Diagnostic delivery + first workshop).

**Must-haves for Phase 2:**
- R-01: Service catalog with Tier 2-3 services
- R-02: Bundle definitions (Search + Diagnose bundle)
- R-04: Proposal generator (for diagnostic proposals)
- R-12: Workshop management (track first workshop)
- R-15: Cross-sell rules (Search → Diagnostic, Workshop → Diagnostic)
- R-09: Tiered funnel (track Tier 2 → Tier 3 progression)
- R-11: Content attribution (workshop → lead tracking)

**Phase 2 revenue target:** 40-80K (advisory + workshops)

---

## Summary

| # | Ticket | Domain | Estimate |
|---|--------|--------|----------|
| R-01 | Service Catalog Restructure — 7 Tier Architecture | Catalog | 3d |
| R-02 | Bundle Definitions & Pricing Engine | Catalog | 3d |
| R-03 | Discount Rules Engine | Catalog | 2d |
| R-04 | Proposal & Quote Generator | Catalog | 3d |
| R-05 | Revenue Tracking Dashboard | Catalog | 2d |
| R-06 | Payment Schedule Tracker | Catalog | 2d |
| R-07 | Contact Revenue Potential Scoring | Catalog | 2d |
| R-08 | Service Engagement Tracker | Catalog | 1d |
| R-09 | Tiered Funnel Stage Model | Funnel | 3d |
| R-10 | Tier Progression Tracking & Analytics | Funnel | 2d |
| R-11 | Content Attribution Engine | Funnel | 3d |
| R-12 | Workshop & Event Management | Funnel | 2d |
| R-13 | The Council Membership Module | Funnel | 3d |
| R-14 | DEX AI Platform Tracking | Funnel | 2d |
| R-15 | Cross-Sell Matrix Configuration | Cross-Sell | 2d |
| R-16 | Automated Cross-Sell Recommendations | Cross-Sell | 2d |
| R-17 | Bundle Suggestion Engine | Cross-Sell | 1d |
| R-18 | "Never Discount" Enforcement | Cross-Sell | 1d |
| R-19 | Phase 1 Minimum Viable Revenue Stack | Priority | 3d |
| R-20 | Phase 2 Diagnostic + Workshop Stack | Priority | 3d |
| | | **Wave 1.6 Total:** | **~48 days** |

**With 2-3 developers: ~18 working days (parallelizable)**

---

## Database Migration

All new tables use `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`.
Migration SQL available in companion file: `run_this_wave1.6_migration.sql`

---

*Document generated: 2026-07-12 | Wave 1.6 — Revenue Operating System*
