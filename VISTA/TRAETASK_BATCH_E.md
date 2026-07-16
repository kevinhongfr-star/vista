# VISTA — Trae Task Brief: Batch E (Cross-Sell + Revenue Dashboard)
**Priority:** 🟢 PHASE 3 — final batch of Wave 1.6
**Spec reference:** `VISTA/spec_wave1.6_revenue_os.md` (R-05, R-15, R-16)
**Full tickets:** `VISTA/WAVE1.6_TRAE_TICKETS.md`
**Previous batches:** A-D already delivered on this branch

---

## Rules
1. Push to `trae/wave1.5-frontend` branch. **Never force push main.**
2. One commit per ticket.
3. Stack: Next.js App Router, TypeScript, Supabase REST (`@supabase/supabase-js`), Tailwind, shadcn/ui.
4. DB tables already exist — only build API routes + frontend components.
5. **IMPORTANT:** The `vista_cross_sell_rules` table uses `source_service_name` (TEXT) and `target_service_name` (TEXT), NOT UUID references. Match by name, not by ID.

---

## TASK 1: Cross-Sell Rules API (R-15 + R-16)

**Goal:** CRUD for cross-sell rules + auto-recommendation engine for contact profiles.

### DB Table (already exists, 576 rows seeded):
```
vista_cross_sell_rules
├── id (UUID)
├── source_service_name (TEXT)     ← NOTE: name, not UUID
├── target_service_name (TEXT)     ← NOTE: name, not UUID
├── priority (INT)                 ← 1-100, higher = recommend first
├── trigger_condition (TEXT)       ← 'on_completion', 'on_schedule', 'on_signal', 'manual'
├── trigger_delay_days (INT)
├── pitch_script (TEXT)            ← what consultant should say
├── success_rate (NUMERIC)         ← track conversion rate
├── is_active (BOOLEAN)
└── created_at (TIMESTAMPTZ)
```

### API Routes to create:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cross-sell-rules` | List all active rules. Query: `?source_service_name=X` |
| GET | `/api/contacts/[id]/cross-sell-recommendations` | Get recommendations for a specific contact |
| PUT | `/api/cross-sell-rules/[id]/success` | Update success_rate when cross-sell converts |

### GET `/api/contacts/[id]/cross-sell-recommendations` logic:
1. Find all **completed** engagements for this contact in `vista_contact_service_engagements`
2. Get the distinct service names from those engagements (join with `vista_service_catalog` to get names)
3. For each completed service, look up `vista_cross_sell_rules` where `source_service_name` matches
4. **Exclude** services the contact has already engaged with
5. Rank by `priority DESC, success_rate DESC`
6. Return top 3 recommendations

**Output:**
```json
{
  "recommendations": [
    {
      "target_service_name": "Diagnostic (comprehensive)",
      "source_service_name": "Retained Executive Search",
      "priority": 90,
      "pitch_script": "We found your VP. Here's their leadership profile...",
      "trigger_delay_days": 7,
      "estimated_value_range": { "min_cny": 8000, "max_cny": 25000 }
    }
  ]
}
```

### PUT `/api/cross-sell-rules/[id]/success`:
- Input: `{ converted: boolean }`
- If converted=true: increment success_rate (e.g., `success_rate = (success_rate * n + 100) / (n + 1)` where n is attempt count, or use a simple moving average)
- If converted=false: decrement or keep
- Simple approach: `success_rate = success_rate * 0.9 + (converted ? 100 : 0) * 0.1`

### Frontend component:
`<CrossSellCard contactId={id} />` — on contact detail page
- Shows "Recommended Next Step" cards
- Each card: target service name, pitch script (collapsible), priority badge
- "Mark as Converted" button to update success_rate
- If no recommendations: "No cross-sell recommendations yet"

---

## TASK 2: Revenue Dashboard (R-05)

**Goal:** Main revenue analytics dashboard page.

### API Route to create:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/revenue/dashboard` | Aggregated revenue metrics |

### GET `/api/revenue/dashboard`:
**Query params:** `?period=monthly|quarterly|annual`

**Returns aggregated data from these tables:**
- `vista_contact_service_engagements` (completed engagements = revenue)
- `vista_proposals` (pipeline value)
- `vista_service_catalog` (tier info)
- `vista_tier_progressions` (conversion data)

**Response shape:**
```json
{
  "revenue_by_tier": [
    { "tier": 1, "tier_name": "Free", "total_cny": 0, "count": 0 },
    { "tier": 3, "tier_name": "Mid-Ticket", "total_cny": 50000, "count": 2 },
    ...
  ],
  "revenue_by_service": [
    { "service_name": "Diagnostic", "total_cny": 30000, "count": 2 },
    ...
  ],
  "bundle_adoption_rate": 0.15,
  "avg_deal_size_by_tier": [
    { "tier": 3, "avg_cny": 15000 },
    ...
  ],
  "discount_utilization": {
    "total_deals": 10,
    "deals_with_discount": 3,
    "avg_discount_pct": 8.5
  },
  "pipeline_value": {
    "total_proposals_cny": 200000,
    "by_status": { "draft": 50000, "sent": 80000, "accepted": 70000 }
  },
  "tier_conversion": [
    { "from_tier": 1, "to_tier": 2, "count": 50, "pct": 30 },
    { "from_tier": 2, "to_tier": 3, "count": 15, "pct": 30 },
    ...
  ],
  "period": "monthly"
}
```

### Frontend page:
Create `app/revenue/page.tsx`:

**Layout:**
- Period toggle (Monthly / Quarterly / Annual) at top
- Row 1: Revenue by tier (pie chart) + Revenue by service (bar chart)
- Row 2: Bundle adoption rate (gauge) + Avg deal size by tier (bar)
- Row 3: Discount utilization (stats card) + Pipeline value by status (stacked bar)
- Row 4: Tier conversion funnel (horizontal bar chart showing flow)

**Chart library:** Use `recharts` (already in package.json) or simple SVG/div-based charts.

**Acceptance criteria:**
- [ ] All metrics calculated from real DB data
- [ ] Period toggle changes the date range filter
- [ ] Revenue by tier shows all 7 tiers (even with 0 revenue)
- [ ] Pipeline value breaks down by proposal status
- [ ] Tier conversion shows progression counts

---

## Suggested file structure:
```
app/
  api/
    cross-sell-rules/
      route.ts                    # GET list
      [id]/
        success/
          route.ts                # PUT update success_rate
    contacts/
      [id]/
        cross-sell-recommendations/
          route.ts                # GET recommendations
    revenue/
      dashboard/
        route.ts                  # GET aggregated metrics
  revenue/
    page.tsx                      # Revenue dashboard page
  components/
    revenue/
      cross-sell-card.tsx         # <CrossSellCard /> component
      revenue-charts.tsx          # Chart components
```

---

## Estimated effort: ~3-4 days

**This is the LAST batch of Wave 1.6.** After this, all 20 tickets (R-01 to R-20) will be complete.

*Generated by James/AI | 2026-07-16*
