# CR-03: Forecast Engine & Revenue Analytics

> **Phase**: 5 — Council Revenue | **Depends on**: CR-01 (Schema), CR-02 (Pipeline)
> **CD-11 Target**: 6-month revenue forecast $122.5K (~¥890K)
> **Effort**: 2 days | **Priority**: 🟡 Medium

---

## 1. Objective

Build a **revenue forecast engine** that generates probability-weighted 6-month revenue projections. CD-11 defines a $122.5K (≈¥890K) 6-month target. The forecast engine combines:
1. **Pipeline-weighted revenue** (probability of closing at each stage)
2. **Recurring MRR** (active Council memberships × monthly fee)
3. **Transactional revenue** (diagnostics, workshops, coaching, registration fees)

---

## 2. Forecast Architecture

### 2.1 Three Revenue Streams in Forecast

```
Total Forecast (6-month)
├── 1. Recurring Revenue (Council Memberships)
│   ├── Active members × monthly fee × 6 months
│   ├── Pipeline members (probability-weighted)
│   └── Renewals (probability-weighted)
├── 2. Transactional Revenue (Services)
│   ├── Diagnostics (Council + public rate)
│   ├── Workshops
│   ├── Coaching sessions
│   ├── Registration fees (new members)
│   └── Credit top-ups
└── 3. Pipeline Revenue (BD Deals)
    ├── Active proposals × stage probability
    └── 3 scenarios: Conservative / Expected / Optimistic
```

### 2.2 Forecast Algorithm

```typescript
interface ForecastInput {
  period: 'quarter' | 'half_year' | 'year';
  period_months: number; // 3, 6, or 12
}

interface CouncilForecast {
  // Recurring
  active_mrr: number; // sum of active memberships / 12
  recurring_6m: number; // active_mrr × period_months
  pipeline_recurring: number; // invited × conversion_rate × annual_fee / 12 × months_remaining
  renewal_revenue: number; // members expiring in period × renewal_rate × annual_fee

  // Transactional
  diagnostic_revenue: number; // avg_diagnostics_per_member × members × council_rate
  workshop_revenue: number; // avg_workshops_per_member × members × council_rate
  coaching_revenue: number; // avg_coaching_sessions × members × council_rate
  registration_revenue: number; // new_members × registration_fee
  credit_topup_revenue: number; // members × avg_topup_cny

  // Totals
  total_recurring: number;
  total_transactional: number;
  grand_total: number;
}

interface PipelineForecast {
  // BD pipeline (existing revenue dashboard)
  by_stage: {
    stage: string;
    total_value_cny: number;
    probability: number;
    weighted_value: number;
    expected_close_month: number;
  }[];

  // Scenarios
  conservative: number; // weighted × 0.6
  expected: number;     // weighted × 1.0
  optimistic: number;   // weighted × 1.3
}

interface TotalForecast {
  council: CouncilForecast;
  pipeline: PipelineForecast;
  grand_total_conservative: number;
  grand_total_expected: number;
  grand_total_optimistic: number;
  period: string;
  generated_at: string;
}
```

### 2.3 Stage Probabilities (from existing spec, validated against CD-11)

```typescript
// BD Pipeline stage probabilities (existing)
const STAGE_PROBABILITY: Record<string, number> = {
  'prospect': 0.02,
  'sourcing': 0.05,
  'screening': 0.12,
  'shortlist': 0.25,
  'interview': 0.45,
  'offer': 0.85,
  'closed_won': 1.0,
  'closed_lost': 0.0,
};

// Council pipeline probabilities (new from CD-11)
const COUNCIL_STAGE_PROBABILITY: Record<string, number> = {
  'invited': 0.40,    // 40% of invited contacts will apply
  'applied': 0.85,    // 85% of applicants will be approved
  'waitlist': 0.60,   // 60% will convert when capacity opens
  'approved': 0.90,   // 90% will pay registration fee
  'active': 1.0,      // already active
  'renewed': 1.0,     // already renewed
  'churned': 0.10,    // 10% chance of re-activation
  'rejected': 0.05,   // 5% chance of re-consideration
};

// Scenario weights
const SCENARIO_WEIGHTS = {
  conservative: 0.6,
  expected: 1.0,
  optimistic: 1.3,
};
```

---

## 3. Forecast Data Model

### 3.1 New Table: `revenue_forecasts`

```sql
CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT DEFAULT 'system', -- 'system', 'manual'

  -- Period
  period TEXT NOT NULL CHECK (period IN ('monthly', 'quarterly', 'half_year', 'annual')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Council recurring
  council_active_mrr NUMERIC DEFAULT 0,
  council_recurring_period NUMERIC DEFAULT 0,
  council_pipeline_recurring NUMERIC DEFAULT 0,
  council_renewal_revenue NUMERIC DEFAULT 0,

  -- Council transactional
  council_diagnostic_revenue NUMERIC DEFAULT 0,
  council_workshop_revenue NUMERIC DEFAULT 0,
  council_coaching_revenue NUMERIC DEFAULT 0,
  council_registration_revenue NUMERIC DEFAULT 0,
  council_credit_topup_revenue NUMERIC DEFAULT 0,

  -- BD pipeline
  pipeline_conservative NUMERIC DEFAULT 0,
  pipeline_expected NUMERIC DEFAULT 0,
  pipeline_optimistic NUMERIC DEFAULT 0,

  -- Totals
  council_total NUMERIC DEFAULT 0,
  grand_total_conservative NUMERIC DEFAULT 0,
  grand_total_expected NUMERIC DEFAULT 0,
  grand_total_optimistic NUMERIC DEFAULT 0,

  -- Snapshot of inputs (for audit)
  input_snapshot JSONB, -- {active_members: 48, avg_mrr: 1859, pipeline_contacts: 12, ...}

  -- CD-11 target comparison
  cd11_target_6m NUMERIC, -- $122.5K → ~¥890K
  variance_to_target NUMERIC, -- grand_total_expected - cd11_target_6m
  variance_pct NUMERIC -- variance as percentage
);
```

### 3.2 New Table: `forecast_monthly_breakdown`

```sql
CREATE TABLE IF NOT EXISTS forecast_monthly_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES revenue_forecasts(id),
  month_number INTEGER NOT NULL, -- 1-6 (or 1-3 for quarterly)
  month_label TEXT NOT NULL, -- e.g., "Aug 2026"

  -- Council
  council_mrr NUMERIC DEFAULT 0,
  council_transactional NUMERIC DEFAULT 0,

  -- BD pipeline
  pipeline_expected NUMERIC DEFAULT 0,

  -- Month total
  month_total NUMERIC DEFAULT 0
);
```

---

## 4. API Routes

### 4.1 `GET /api/council/forecast`

```typescript
// Request
GET /api/council/forecast?period=half_year

// Response
{
  period: "half_year",
  period_start: "2026-08-01",
  period_end: "2027-01-31",
  generated_at: "2026-07-21T10:00:00Z",

  council: {
    active_mrr: 89250,           // 48 individual × 12000/12 + 7 corporate × 30000/12 + 3 PE × 50000/12
    recurring_6m: 535500,        // 89250 × 6
    pipeline_recurring: 45000,   // 12 invited × 0.40 × 0.85 × avg_fee
    renewal_revenue: 180000,     // 15 renewing × avg_fee × 0.92 renewal_rate

    diagnostic_revenue: 96000,   // estimated
    workshop_revenue: 48000,
    coaching_revenue: 72000,
    registration_revenue: 24000, // new members × reg fee
    credit_topup_revenue: 36000,

    total_recurring: 760500,
    total_transactional: 276000,
    grand_total: 1036500
  },

  pipeline: {
    by_stage: [...],
    conservative: 312000,
    expected: 520000,
    optimistic: 676000
  },

  scenarios: {
    conservative: 846300,   // (760500 + 312000) × 0.6 + ...
    expected: 1556500,      // council + pipeline expected
    optimistic: 1712700
  },

  cd11_target: {
    target_6m_cny: 890000,  // $122.5K × 7.25
    variance: 666500,       // expected - target
    variance_pct: 74.9      // % above target
  },

  monthly_breakdown: [
    { month: 1, label: "Aug 2026", council_mrr: 89250, council_transactional: 46000, pipeline: 86667, total: 221917 },
    { month: 2, label: "Sep 2026", ... },
    // ... 6 months
  ]
}
```

### 4.2 `POST /api/council/forecast/generate`

```typescript
// Request — trigger a new forecast calculation
POST /api/council/forecast/generate
{
  "period": "half_year",
  "include_actuals": true  // blend actuals (past months) + forecast (future months)
}

// Response
{ forecast_id: "uuid", generated_at: "...", ... }
```

### 4.3 `GET /api/council/forecast/history`

```typescript
// Returns last 6 forecasts for trend analysis
{
  forecasts: [
    { id, generated_at, grand_total_expected, variance_to_target },
    ...
  ]
}
```

---

## 5. Dashboard Integration

### 5.1 New Dashboard Widget: Revenue Forecast

Add to Phase 4 Dashboard (D-01 widget system):

```
┌─────────────────────────────────────────────────────────┐
│ Revenue Forecast (6-month)                    [Generate] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CD-11 Target: ¥890,000                                  │
│  Current Forecast: ¥1,556,500 (174.9% of target)        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ████████████████████████████████████████  ¥1.5M    │ │
│  │  Target ████░░░░░░░░░░░░░░░░░░░░░░░░░░░  ¥890K    │ │
│  │                                                     │ │
│  │  Conservative ███░░░░░░░░░░░░░░░░░░░░░░  ¥846K    │ │
│  │  Expected     ████████████████████████████  ¥1.5M   │ │
│  │  Optimistic   █████████████████████████████████  ¥1.7M │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ Monthly Breakdown ─────────────────────────────────┐ │
│  │ Aug  Sep  Oct  Nov  Dec  Jan                        │ │
│  │ ██   ██   ██   ██   ██   ██   (stacked bar chart)  │ │
│  │ Council MRR | Transactional | Pipeline              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Last generated: 2026-07-21 10:00                        │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Revenue Dashboard Updates (Existing Page)

The existing `/revenue` page needs these additions:

| Current | Add (CD-11) |
|---------|-------------|
| Revenue by Tier (pie chart) | **Council vs Non-Council Revenue** (split) |
| Pipeline Value (bar chart) | **Council MRR** card (new KPI) |
| Bundle Adoption % | **Council Capacity** indicator (48/60, 7/10, 3/5) |
| Avg Discount % | **Churn Rate** card |
| — | **Forecast vs Target** comparison |
| — | **Monthly Revenue Trend** (actual + forecast) |

---

## 6. Acceptance Criteria

- [ ] `revenue_forecasts` table created
- [ ] `forecast_monthly_breakdown` table created
- [ ] Forecast calculation runs correctly with stage probabilities
- [ ] Council MRR calculated from active memberships
- [ ] Pipeline revenue weighted by stage probabilities
- [ ] 3 scenarios generated (conservative/expected/optimistic)
- [ ] CD-11 target comparison shown (¥890K target vs. forecast)
- [ ] Monthly breakdown for the period
- [ ] API routes working: GET forecast, POST generate, GET history
- [ ] Dashboard widget renders correctly
- [ ] Revenue dashboard updated with Council-specific KPIs

---

## 7. CD-11 Target Validation

### CD-11 Target: $122.5K in 6 months (~¥890K at 7.25 CNY/USD)

### Back-of-envelope check (current assumptions):

| Revenue Stream | Assumption | 6-month Value |
|---|---|---|
| Individual membership (48 active × ¥12K/yr) | 48 × ¥1,000/mo × 6 | ¥288,000 |
| Corporate membership (7 × ¥30K/yr) | 7 × ¥2,500/mo × 6 | ¥105,000 |
| PE Partner membership (3 × ¥50K/yr) | 3 × ¥4,167/mo × 6 | ¥75,000 |
| New member registrations (12 × ¥2,000) | One-time | ¥24,000 |
| Diagnostics (avg 2/member/6mo × ¥8K council rate) | 58 × 2 × ¥8,000 × 0.3 take-up | ¥27,840 |
| Workshops (avg 1/member/6mo × ¥2K council rate) | 58 × 1 × ¥2,000 × 0.4 take-up | ¥46,400 |
| Coaching (avg 3 sessions/member × ¥3K) | 58 × 3 × ¥3,000 × 0.2 take-up | ¥104,400 |
| Credit top-ups | ¥500/member/6mo × 58 × 0.3 | ¥8,700 |
| **Council subtotal** | | **¥679,340** |
| BD Pipeline (expected scenario) | | ¥520,000 |
| **Grand total (expected)** | | **¥1,199,340** |
| **CD-11 Target** | | **¥890,000** |
| **Variance** | | **+¥309,340 (+34.8%)** |

**Conclusion**: With current membership assumptions, the forecast **exceeds the CD-11 target by ~35%**. This provides comfortable buffer. However, the key risk is membership growth rate — if new member acquisition is slower than assumed, the council subtotal drops significantly.

---

## 8. Dependencies

| Upstream | What | Status |
|----------|------|--------|
| CR-01 | Council memberships table | Must be done first |
| CR-02 | Council pipeline stages | Must be done first |
| Phase 4 (D-01) | Dashboard widget system | Widget rendering depends on this |
| CD-11 | Final pricing numbers | Need Kevin confirmation |
| Supabase | Actual membership data | Empty — first data needed |
