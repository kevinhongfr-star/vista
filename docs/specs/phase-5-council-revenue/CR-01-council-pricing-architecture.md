# CR-01: Council Pricing & Revenue Architecture

> **Phase**: 5 — Council Revenue | **Depends on**: Phase 0 (E-01), Wave 1.6 (Revenue OS schema)
> **CD-11 Source**: Council Pricing & Membership Architecture PDF (Kevin 2026-07-21)
> **Effort**: 3 days | **Priority**: 🔴 High

---

## 1. Objective

Integrate CD-11 Council pricing details into VISTA's existing 7-tier Revenue OS (Wave 1.6 spec). The Wave 1.6 spec defines Tier 6 (The Council) with 3 membership tiers at annual rates. CD-11 adds granular pricing for every Council revenue stream: registration fees, diagnostic/interpretation rates, coaching packages, workshop pricing, welcome collection, loyalty program, and digital badges.

**Goal**: Every Council revenue stream is modeled, trackable, and forecastable in VISTA.

---

## 2. Current State (Wave 1.6 — What Exists)

### Tier 6 Already Defined in `vista_service_catalog`

| Service | Price (CNY) | Price Model | Capacity |
|---------|-------------|-------------|----------|
| Council Individual Member | 12,000 | per_year | 60 max |
| Council Corporate Member | 30,000 | per_year | 10 max |
| Council PE Partner Member | 50,000 | per_year | 5 max |

### What's Missing (CD-11 Gap)

| CD-11 Revenue Stream | In Wave 1.6? | Gap |
|----------------------|:---:|-----|
| Membership tiers (annual) | ✅ Yes | Need actual pricing from CD-11 (may differ from placeholder 12K/30K/50K) |
| Registration fees (one-time, per application) | ❌ No | New revenue stream |
| Diagnostic/interpretation rates | ❌ No | Council-specific pricing for diagnostics (may differ from Tier 3 rates) |
| Coaching packages | ❌ No | Council-specific coaching rates (may be included in membership or separate) |
| Workshop pricing | ❌ Partial | Tier 2 has workshops; Council may have preferential rates |
| Welcome collection (onboarding package) | ❌ No | New revenue stream — physical/digital welcome kit |
| Loyalty program (tier progression rewards) | ❌ No | New system — tenure-based benefits |
| Digital badges (certification/recognition) | ❌ No | New asset — verifiable credentials |
| 6-month revenue forecast ($122.5K / ~¥890K) | ❌ No | Needs forecast model |
| Credit economics (action-based pricing) | ❌ No | See `11_Council_Intelligence_Definition.md` — credits for DEX AI actions |

---

## 3. CD-11 Revenue Stream Model

### 3.1 Revenue Streams Taxonomy

```
Council Revenue
├── Recurring (subscription)
│   ├── Individual Membership — annual fee
│   ├── Corporate Membership — annual fee
│   └── PE Partner Membership — annual fee
├── One-time (transactional)
│   ├── Registration Fee — per application
│   ├── Welcome Collection — per new member (optional purchase)
│   └── Digital Badge Issuance — per credential
├── Per-Use (metered)
│   ├── Diagnostic Sessions — per assessment (Council rate vs. public rate)
│   ├── Interpretation Sessions — per debrief (Council rate vs. public rate)
│   ├── Coaching Sessions — per session (Council rate vs. public rate)
│   └── Workshop Attendance — per event (Council rate vs. public rate)
└── Loyalty / Credit-Based
    ├── Credit Allocation (monthly, included in membership)
    ├── Credit Top-Up (purchased separately)
    └── Credit Consumption (per action: assessment, report, chat, etc.)
```

### 3.2 Pricing Table Template (CD-11 → VISTA)

Each CD-11 revenue stream maps to a row in `vista_service_catalog`:

| CD-11 Item | `vista_service_catalog` mapping | `price_model` | Council vs Public |
|------------|------|------|------|
| Council Individual | `council_individual_membership` | `per_year` | Council-only |
| Council Corporate | `council_corporate_membership` | `per_year` | Council-only |
| Council PE Partner | `council_pe_partner_membership` | `per_year` | Council-only |
| Registration Fee | `council_registration_fee` | `one_time` | Council-only |
| Welcome Collection | `council_welcome_collection` | `one_time` | Optional |
| Diagnostic (Council rate) | Reference existing diagnostic services + `council_discount_pct` | `per_assessment` | Discounted vs T3 |
| Interpretation (Council rate) | `council_interpretation_session` | `per_session` | Council-only |
| Coaching (Council rate) | Reference existing coaching services + `council_discount_pct` | `per_session` | Discounted vs T3 |
| Workshop (Council rate) | Reference existing workshop services + `council_discount_pct` | `per_session` | Discounted vs T2 |
| Digital Badge | `council_digital_badge` | `per_issuance` | Council-only |
| Credit Top-Up | `council_credit_topup` | `per_unit` | Council-only |

### 3.3 Dual Pricing Model

Many services have **two prices**: public rate (Tier 2-5) and Council rate (discounted).

```typescript
// In vista_service_catalog, add:
council_price_cny: number | null;        // Council member price (null = same as public)
council_discount_pct: number | null;     // If calculated rather than fixed
council_included: boolean;               // true = included in membership (no extra charge)
```

**Examples:**
- Diagnostic assessment: Public ¥15,000 → Council ¥8,000 (or included in credit allocation)
- Coaching session: Public ¥5,000/session → Council ¥3,000/session
- Workshop: Public ¥5,000/session → Council ¥2,000/session or free (included)

---

## 4. Schema Changes

### 4.1 Extend `vista_service_catalog` (delta from Wave 1.6)

```sql
-- Council-specific columns (add to existing table)
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS council_price_cny NUMERIC;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS council_discount_pct INTEGER;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS council_included BOOLEAN DEFAULT false;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS is_council_product BOOLEAN DEFAULT false;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS council_tier_required TEXT; -- 'individual', 'corporate', 'pe_partner', or null (all tiers)
```

### 4.2 New Table: `council_memberships`

```sql
CREATE TABLE IF NOT EXISTS council_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES vista_contacts(id),

  -- Membership type
  membership_type TEXT NOT NULL CHECK (membership_type IN ('individual', 'corporate', 'pe_partner')),
  tier TEXT NOT NULL DEFAULT 'standard', -- can have sub-tiers within Council

  -- Financials
  annual_fee_cny NUMERIC NOT NULL,
  registration_fee_cny NUMERIC DEFAULT 0,
  registration_fee_paid BOOLEAN DEFAULT false,
  welcome_collection_cny NUMERIC DEFAULT 0,
  welcome_collection_purchased BOOLEAN DEFAULT false,

  -- Dates
  join_date DATE NOT NULL,
  renewal_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'prospect'
    CHECK (status IN ('prospect', 'applied', 'active', 'renewed', 'expired', 'churned')),

  -- Credits (monthly allocation)
  monthly_credit_allocation INTEGER DEFAULT 30,
  current_credit_balance INTEGER DEFAULT 0,
  last_credit_allocation_date TIMESTAMPTZ,

  -- Loyalty
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  years_as_member INTEGER DEFAULT 0,
  digital_badges_issued JSONB DEFAULT '[]'::jsonb,

  -- Revenue tracking
  lifetime_value_cny NUMERIC DEFAULT 0,
  total_credits_consumed INTEGER DEFAULT 0,
  total_credits_purchased INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_council_memberships_contact ON council_memberships(contact_id);
CREATE INDEX IF NOT EXISTS idx_council_memberships_status ON council_memberships(status);
```

### 4.3 New Table: `council_credit_ledger`

```sql
CREATE TABLE IF NOT EXISTS council_credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES council_memberships(id),
  contact_id UUID REFERENCES vista_contacts(id),

  -- Transaction
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'monthly_allocation', 'top_up_purchase', 'consumption', 'refund', 'expiry'
  )),
  credit_amount INTEGER NOT NULL,  -- positive = credit in, negative = credit out
  service_id UUID REFERENCES vista_service_catalog(id), -- which service consumed
  description TEXT,

  -- Financials
  cny_value NUMERIC DEFAULT 0, -- monetary value of this transaction

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_membership ON council_credit_ledger(membership_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_contact ON council_credit_ledger(contact_id);
```

### 4.4 New Table: `council_revenue_summary` (materialized view for dashboard)

```sql
CREATE OR REPLACE VIEW v_council_revenue AS
SELECT
  cm.membership_type,
  cm.status,
  COUNT(*) AS member_count,
  SUM(cm.annual_fee_cny) FILTER (WHERE cm.status = 'active') AS active_mrr_annual,
  ROUND(SUM(cm.annual_fee_cny) FILTER (WHERE cm.status = 'active') / 12.0, 2) AS monthly_mrr,
  SUM(cm.registration_fee_cny) FILTER (WHERE cm.registration_fee_paid) AS registration_revenue,
  SUM(cm.welcome_collection_cny) FILTER (WHERE cm.welcome_collection_purchased) AS welcome_revenue,
  SUM(cl.cny_value) FILTER (WHERE cl.transaction_type = 'top_up_purchase') AS credit_topup_revenue,
  SUM(cm.lifetime_value_cny) AS total_ltv,
  AVG(cm.years_as_member) AS avg_tenure_years
FROM council_memberships cm
LEFT JOIN council_credit_ledger cl ON cl.membership_id = cm.id
GROUP BY cm.membership_type, cm.status;
```

---

## 5. Acceptance Criteria

- [ ] `vista_service_catalog` extended with 5 Council-specific columns
- [ ] `council_memberships` table created with all fields
- [ ] `council_credit_ledger` table created for credit tracking
- [ ] `v_council_revenue` view created for dashboard consumption
- [ ] Seed data: 3 Council membership tiers in `vista_service_catalog` with CD-11 pricing
- [ ] Seed data: All Council-specific products (registration fee, welcome collection, digital badge, credit top-up)
- [ ] API route `GET /api/council/revenue` returns: MRR, active members by type, registration revenue, credit revenue
- [ ] API route `GET /api/council/memberships` returns: paginated membership list with status
- [ ] API route `POST /api/council/memberships` creates new membership record
- [ ] Dual pricing works: Council rate shown for members, public rate for non-members
- [ ] CD-11 pricing values confirmed by Kevin and locked (not placeholders)

---

## 6. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Council memberships in separate table vs. `vista_contacts` fields | Separate `council_memberships` table | Council is a relationship, not a contact field. A contact can have multiple memberships over time. |
| Credit system in `council_credit_ledger` vs. extending `vista_contact_service_engagements` | Separate ledger | Credit economics are fundamentally different from service engagements. Credits are fungible, transferable, and time-bound. |
| Council products in `vista_service_catalog` vs. separate table | Same table with `is_council_product = true` | Unified catalog simplifies the pricing engine. Council products are just services with a flag. |
| Dual pricing as separate columns vs. separate price table | Columns on `vista_service_catalog` | Simpler for now. If pricing gets complex (volume discounts, seasonal), refactor to price table later. |
| MRR calculation | Real-time from view | Council member count is small (< 75), real-time is fine. No need for materialized view yet. |

---

## 7. Dependencies

| Upstream | What | Status |
|----------|------|--------|
| Wave 1.6 | Service catalog schema, engagement tracking | ✅ Migrated |
| Phase 0 (E-01) | Core config types | In progress |
| CD-11 PDF | Final locked pricing numbers | ⏳ Need Kevin to confirm |
| Notion 11_Council_Intelligence_Definition | Credit economics, tier benefits | ✅ Referenced |

## 8. Open Questions for Kevin

1. **Final pricing**: Are the CD-11 PDF prices the locked numbers, or still subject to change?
2. **Capacity limits**: 60 individual / 10 corporate / 5 PE partner — confirmed?
3. **Credit allocation**: How many credits per month for each Council tier? (Currently assumed 30 for all)
4. **Welcome collection**: Is it a physical kit, digital, or both? What's the price point?
5. **Loyalty tiers**: Bronze/Silver/Gold/Platinum — what are the tenure thresholds? (e.g., 1yr = Silver, 2yr = Gold, 3yr+ = Platinum)
6. **Digital badges**: Blockchain-verified? PDF certificate? LinkedIn integration?
7. **Council discount on diagnostics/coaching**: Fixed Council rate, or percentage discount off public rate?
