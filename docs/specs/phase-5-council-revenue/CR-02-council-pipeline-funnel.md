# CR-02: Council Pipeline & Membership Funnel

> **Phase**: 5 — Council Revenue | **Depends on**: CR-01 (Schema), Phase 1 (M-02 Pipeline)
> **Effort**: 2 days | **Priority**: 🟡 Medium

---

## 1. Objective

Add a **parallel pipeline view** for Council membership applications. The current VISTA Pipeline page tracks BD contacts through 8 stages (Prospect → Closed). Council memberships follow a different funnel (Prospect → Applied → Active → Renewed/Churned). This spec defines the Council pipeline stages, UI, and integration with the existing pipeline page.

---

## 2. Current Pipeline Architecture

### Existing Pipeline (BD Contacts)
- **Table**: `vista_contacts` filtered by `pipeline_stage` column
- **Stages**: `Prospect → Contacted → Engaged → Meeting Booked → Proposal Sent → Negotiation → Closed Won → Closed Lost`
- **UI**: Kanban board (dnd-kit) or Table view
- **API**: `GET /api/pipeline` returns contacts grouped by stage
- **Intelligence**: Stuck contacts, conversion rates

### Gap
The current pipeline is designed for **BD deal flow** (contacting prospects → closing deals). Council membership applications are a different process:
- Invitations vs. cold outreach
- Application approval vs. deal negotiation
- Recurring membership vs. one-time deal
- Churn tracking vs. closed-lost

---

## 3. Council Pipeline Stages

```
Council Membership Funnel
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Invited  │ →  │ Applied  │ →  │ Approved │ →  │  Active  │ →  │ Renewed  │
│          │    │          │    │          │    │          │    │          │
│          │    │          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                       ↓               ↓              ↓
                 ┌──────────┐    ┌──────────┐   ┌──────────┐
                 │ Rejected │    │ Waitlist │   │ Churned  │
                 └──────────┘    └──────────┘   └──────────┘
```

### Stage Definitions

| Stage | Description | Exit Condition |
|-------|-------------|----------------|
| **Invited** | Contact identified as Council prospect, invitation sent or planned | Contact applies or no response after 30 days |
| **Applied** | Contact submitted application / expressed interest | Reviewed by Kevin |
| **Waitlist** | Approved but no capacity (60 individual / 10 corp / 5 PE) | Capacity opens up |
| **Approved** | Application approved, awaiting payment/onboarding | Registration fee paid |
| **Active** | Membership active, credits allocated | Renewal date reached or churn signal |
| **Renewed** | Membership renewed for another year | Next cycle |
| **Churned** | Membership expired without renewal | Re-engage campaign triggered |
| **Rejected** | Application not approved | No further action |

### Stage Mapping to `council_memberships.status`

| Pipeline Stage | `council_memberships.status` |
|---------------|------------------------------|
| Invited | `prospect` |
| Applied | `applied` |
| Approved | `approved` (new status to add) |
| Waitlist | `waitlist` (new status to add) |
| Active | `active` |
| Renewed | `renewed` |
| Churned | `churned` |
| Rejected | `rejected` (new status to add) |

---

## 4. Schema Changes

### 4.1 Update `council_memberships.status` enum

```sql
ALTER TABLE council_memberships DROP CONSTRAINT IF EXISTS council_memberships_status_check;
ALTER TABLE council_memberships ADD CONSTRAINT council_memberships_status_check
  CHECK (status IN ('prospect', 'applied', 'approved', 'waitlist', 'active', 'renewed', 'expired', 'churned', 'rejected'));
```

### 4.2 Add pipeline tracking fields

```sql
ALTER TABLE council_memberships ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'prospect'
  CHECK (pipeline_stage IN ('invited', 'applied', 'approved', 'waitlist', 'active', 'renewed', 'churned', 'rejected'));
ALTER TABLE council_memberships ADD COLUMN IF NOT EXISTS stage_entered_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE council_memberships ADD COLUMN IF NOT EXISTS stage_history JSONB DEFAULT '[]'::jsonb;
-- stage_history: [{stage: 'invited', entered_at: '2026-08-01', exited_at: '2026-08-15', reason: 'applied'}]
```

---

## 5. UI Design

### 5.1 Pipeline Page — Dual Funnel

Add a **funnel selector** to the existing Pipeline page:

```
┌────────────────────────────────────────────────────┐
│ Pipeline                        [BD Pipeline ▾]    │
│                                 │ Council Pipeline │ │
├────────────────────────────────────────────────────┤
│                                                     │
│  (Existing BD Kanban OR Council Kanban)             │
│                                                     │
└────────────────────────────────────────────────────┘
```

### 5.2 Council Kanban Board

Same dnd-kit engine as BD pipeline, but with:
- **Columns**: 8 stages (Invited → Rejected)
- **Cards**: Council membership application cards
  - Contact name + company
  - Membership type badge (Individual / Corporate / PE Partner)
  - Days in current stage
  - Annual fee
  - Registration fee status (paid/pending)
- **Card colors**: By membership type (blue=Individual, purple=Corporate, gold=PE Partner)
- **Drag-to-advance**: Same as BD pipeline
- **Intelligence panel** (bottom):
  - Active members / Capacity (e.g., "48/60 Individual — 80% full")
  - Average time in pipeline
  - Conversion rate (Invited → Active)
  - Churn rate (Active → Churned)

### 5.3 Council Table View

Same TanStack Table engine, with columns:
| Column | Type |
|--------|------|
| Contact Name | Link to contact detail |
| Company | Text |
| Membership Type | Badge (Individual/Corporate/PE) |
| Pipeline Stage | Select (inline edit) |
| Annual Fee | Currency |
| Registration Paid | Checkbox |
| Join Date | Date |
| Days Active | Number |
| Loyalty Tier | Badge (Bronze/Silver/Gold/Platinum) |
| MRR Contribution | Currency |
| Next Renewal | Date |

---

## 6. API Routes

### 6.1 `GET /api/council/pipeline`

```typescript
// Request
GET /api/council/pipeline?view=kanban|table

// Response
{
  stages: {
    invited: { count: 12, contacts: [...] },
    applied: { count: 5, contacts: [...] },
    approved: { count: 3, contacts: [...] },
    waitlist: { count: 2, contacts: [...] },
    active: { count: 48, contacts: [...] },
    renewed: { count: 15, contacts: [...] },
    churned: { count: 4, contacts: [...] },
    rejected: { count: 1, contacts: [...] }
  },
  intelligence: {
    capacity: {
      individual: { used: 48, max: 60, pct: 80 },
      corporate: { used: 7, max: 10, pct: 70 },
      pe_partner: { used: 3, max: 5, pct: 60 }
    },
    conversion_rates: {
      invited_to_applied: 0.42,
      applied_to_active: 0.85,
      active_to_renewed: 0.92,
      active_to_churned: 0.08
    },
    avg_days_in_pipeline: 23,
    mrr: 89250 // total monthly recurring revenue from active members
  }
}
```

### 6.2 `POST /api/council/pipeline/[membershipId]/advance`

```typescript
// Request
POST /api/council/pipeline/{membershipId}/advance
{
  "target_stage": "active",
  "reason": "Registration fee paid, credits allocated"
}

// Response
{
  "success": true,
  "previous_stage": "approved",
  "new_stage": "active",
  "stage_history": [...]
}
```

### 6.3 `POST /api/council/pipeline/[membershipId]/reject`

```typescript
// Request
POST /api/council/pipeline/{membershipId}/reject
{
  "reason": "Does not meet seniority criteria"
}
```

---

## 7. Entity Config for Universal Data Grid

```typescript
// council-pipeline.config.ts
export const councilPipelineConfig: EntityConfig = {
  entity: 'council_pipeline',
  table: 'council_memberships',  // joined with vista_contacts
  label: 'Council Pipeline',
  icon: 'Crown',

  views: ['table', 'kanban'],  // no calendar or chart for pipeline

  // Kanban = pipeline stage
  kanban: {
    groupBy: 'pipeline_stage',
    columnOrder: ['invited', 'applied', 'approved', 'waitlist', 'active', 'renewed', 'churned', 'rejected'],
    columnColors: {
      invited: 'bg-blue-100',
      applied: 'bg-yellow-100',
      approved: 'bg-green-100',
      waitlist: 'bg-orange-100',
      active: 'bg-emerald-100',
      renewed: 'bg-teal-100',
      churned: 'bg-red-100',
      rejected: 'bg-gray-100',
    },
    cardFields: ['contact_name', 'company', 'membership_type', 'annual_fee_cny', 'days_in_stage'],
  },

  columns: [
    { key: 'contact_name', label: 'Contact', type: 'relation_link', relation: 'vista_contacts' },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'membership_type', label: 'Type', type: 'select', options: ['individual', 'corporate', 'pe_partner'] },
    { key: 'pipeline_stage', label: 'Stage', type: 'select', inlineEdit: true },
    { key: 'annual_fee_cny', label: 'Annual Fee', type: 'currency', currency: 'CNY' },
    { key: 'registration_fee_paid', label: 'Reg. Fee Paid', type: 'boolean' },
    { key: 'join_date', label: 'Join Date', type: 'date' },
    { key: 'loyalty_tier', label: 'Loyalty', type: 'select', options: ['bronze', 'silver', 'gold', 'platinum'] },
    { key: 'current_credit_balance', label: 'Credits', type: 'number' },
    { key: 'renewal_date', label: 'Renewal', type: 'date' },
  ],

  defaultSort: { property: 'pipeline_stage', direction: 'asc' },
  defaultFilters: [],
};
```

---

## 8. Acceptance Criteria

- [ ] Pipeline page has funnel selector (BD / Council)
- [ ] Council kanban shows 8 stages with correct columns
- [ ] Cards display: name, company, membership type, fee, days in stage
- [ ] Drag-to-advance works (with API call to update stage)
- [ ] Capacity indicator shown (X/60 Individual, Y/10 Corporate, Z/5 PE)
- [ ] Conversion rates calculated and displayed
- [ ] MRR displayed as total Council monthly recurring revenue
- [ ] Table view with all columns, inline edit on pipeline_stage
- [ ] Stage history tracked in `stage_history` JSONB
- [ ] API routes working: GET pipeline, POST advance, POST reject

---

## 9. Relationship to Existing Pipeline (M-02)

| Aspect | BD Pipeline (M-02) | Council Pipeline (CR-02) |
|--------|-------|-------|
| Data source | `vista_contacts` | `council_memberships` JOIN `vista_contacts` |
| Stages | 8 (Prospect → Closed) | 8 (Invited → Churned/Rejected) |
| Revenue model | One-time deal value | Recurring MRR |
| Kanban columns | BD stages | Council stages |
| Intelligence | Stuck contacts, conversion rates | Capacity, MRR, churn rate, renewal forecast |
| Shared engine | ✅ Same UniversalDataGrid | ✅ Same UniversalDataGrid |

**Key insight**: Both pipelines use the **same engine** (UniversalDataGrid + kanban view), just different configs and data sources. This validates the config-driven architecture decision.

---

## 10. Dependencies

| Upstream | What | Status |
|----------|------|--------|
| CR-01 | `council_memberships` table | Must be done first |
| Phase 0 (E-03) | Kanban view component | Must be done first |
| Phase 1 (M-02) | Pipeline page structure | Reference for dual funnel UI |
| CD-11 | Council membership application process | Need Kevin to confirm flow |
