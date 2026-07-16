# Wave 1.6 — Full Production Fix Tickets (18 Issues)

**Date:** 2026-07-17  
**Author:** James/AI  
**Status:** Ready for Trae execution  
**Priority:** P0 — These fixes are BLOCKING production use  
**Context:** Full audit of 84 API routes against live Supabase schema (424 tables). 10/19 pages broken.

---

## IMPORTANT: Read Before Starting

1. **Check actual schema before every fix.** Run this query to verify column names:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'TABLE_NAME' ORDER BY ordinal_position;
```

2. **Table name mapping (WRONG → CORRECT):**
| Route uses | Actual table in Supabase |
|-----------|------------------------|
| `vista_memberships` | `vista_council_members` |
| `vista_platform_settings` | `platform_settings` |
| `vista_content_assets` | ❌ DOES NOT EXIST — needs new table |
| `vista_content_interactions` | `vista_content_contact_interactions` |
| `vista_membership_benefits` | ❌ DOES NOT EXIST — needs new table |
| `vista_membership_benefit_usage` | ❌ DOES NOT EXIST — needs new table |
| `outreach_assignments` | `vista_outreach_sequences` (or create new) |
| `email_templates` | `vista_outreach_templates` |

3. **After all fixes, merge `trae/wave1.5-frontend` → `main` and deploy.**

---

## FIX-01: Membership Overview (💥 500 crash)
**File:** `app/api/membership/overview/route.ts`  
**Problem:** Queries `vista_memberships` — table doesn't exist  
**Fix:** Change to `vista_council_members` and adjust column mapping.

**Steps:**
1. Check `vista_council_members` columns:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'vista_council_members';
```
2. Update all `.from("vista_memberships")` → `.from("vista_council_members")`
3. Adjust column references to match actual schema (may differ from what original code assumed)
4. Test: `GET /api/membership/overview` returns 200

---

## FIX-02: Membership Metrics (💥 500 crash)
**File:** `app/api/membership/metrics/route.ts`  
**Problem:** Same as FIX-01 — queries `vista_memberships`  
**Fix:** Change to `vista_council_members`

**Steps:**
1. Update `.from("vista_memberships")` → `.from("vista_council_members")`
2. Adjust all column references
3. Test: `GET /api/membership/metrics` returns 200

---

## FIX-03: Platform Overview (💥 500 crash)
**File:** `app/api/platform/route.ts`  
**Problem:** Queries `vista_platform_settings` — doesn't exist  
**Fix:** Change to `platform_settings` (no `vista_` prefix)

**Steps:**
1. Check `platform_settings` columns:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'platform_settings';
```
2. Update `.from("vista_platform_settings")` → `.from("platform_settings")`
3. Test: `GET /api/platform` returns 200

---

## FIX-04: Platform Settings (💥 500 crash)
**File:** `app/api/platform/settings/route.ts`  
**Problem:** Multiple queries to `vista_platform_settings` (GET, POST, PATCH, DELETE)  
**Fix:** Change all to `platform_settings`

**Steps:**
1. Replace ALL occurrences of `"vista_platform_settings"` with `"platform_settings"`
2. Adjust column names to match actual schema
3. Test all 4 HTTP methods (GET, POST, PUT/PATCH, DELETE)

---

## FIX-05: Bundles GET — Wrong status column (💥 500 crash)
**File:** `app/api/bundles/route.ts`  
**Problem:** `.eq("status", "active")` on `vista_service_bundles` — column is `is_active` (boolean), not `status` (text)  
**Actual schema:** `vista_service_bundles` has `is_active BOOLEAN`, no `status` column

**Fix:**
```typescript
// BEFORE (broken):
.from("vista_service_bundles").select("*").eq("status", "active")

// AFTER (fixed):
.from("vista_service_bundles").select("*").eq("is_active", true)
```

Apply to both GET (line ~10) and POST handler (line ~57).

---

## FIX-06: Bundles POST — UUID vs TEXT comparison (⚠️ Logic error)
**File:** `app/api/bundles/route.ts` (POST handler, ~line 40-80)  
**Problem:** Compares `service_ids` (UUID[]) with `component_service_names` (TEXT[]). These are different types — UUID vs service name string. The match will never succeed.

**Fix:** Need to look up service names from IDs first:
```typescript
// Get services by ID to get their names
const { data: services } = await supabase
  .from("vista_service_catalog")
  .select("id, name, price_min_cny, price_max_cny")
  .in("id", service_ids)

const serviceNames = services?.map(s => s.name) || []

// Then compare service names (not UUIDs) with bundle's component_service_names
for (const bundle of bundles || []) {
  const bundleServiceNames: string[] = Array.isArray(bundle.component_service_names) 
    ? bundle.component_service_names 
    : []
  
  const bundleServicesMatch = bundleServiceNames.length > 0 &&
    serviceNames.length === bundleServiceNames.length &&
    serviceNames.every((name: string) => bundleServiceNames.includes(name))
  // ...
}
```

---

## FIX-07: Workshops GET — Wrong order column (💥 500 crash)
**File:** `app/api/workshops/route.ts`  
**Problem:** `.order("workshop_date")` — column is `scheduled_date`  
**Actual schema:** `vista_workshops` has `scheduled_date`, not `workshop_date`

**Fix:**
```typescript
// BEFORE:
.order("workshop_date", { ascending: false })

// AFTER:
.order("scheduled_date", { ascending: false })
```

---

## FIX-08: Workshops POST — Multiple wrong column names (💥 500 crash)
**File:** `app/api/workshops/route.ts` (POST handler, ~line 30-50)  
**Problem:** Insert uses wrong column names. 7 fields wrong.  
**Actual schema:**
```
id, title, workshop_type, scheduled_date, duration_minutes, price_cny, 
max_capacity, registered_count, attended_count, status, recording_url, 
content_clips, follow_up_sequence_id, created_at
```

**Fix — rewrite the insert:**
```typescript
const { data, error } = await supabase
  .from("vista_workshops")
  .insert({
    title: body.workshop_name || body.title,        // was: workshop_name
    scheduled_date: body.workshop_date || body.scheduled_date,  // was: workshop_date
    duration_minutes: body.duration_minutes || 180,  // was: workshop_time (doesn't exist)
    max_capacity: body.max_attendees || body.max_capacity || 20,  // was: max_attendees
    status: body.status || "scheduled",              // ✅ correct
    workshop_type: body.workshop_type || "general",  // NEW
    price_cny: body.price_cny || 0,                  // NEW
    // DO NOT include: location, description, tier_access — these columns don't exist
  })
  .select()
  .single()
```

---

## FIX-09: Cross-Sell Success Rate (💥 500 crash)
**File:** `app/api/cross-sell-rules/[id]/success/route.ts`  
**Problem:** References `attempt_count` column — doesn't exist  
**Actual schema:** `vista_cross_sell_rules` has: `id, source_service_name, target_service_name, priority, trigger_condition, trigger_delay_days, pitch_script, success_rate, is_active, created_at` — NO `attempt_count`

**Fix:** Remove `attempt_count` logic. Track attempts in a separate field or just update success_rate:
```typescript
// BEFORE (broken):
const { data: rule } = await supabase
  .from("vista_cross_sell_rules")
  .select("success_rate, attempt_count")

const newAttempts = (rule.attempt_count || 0) + 1
// ...update attempt_count

// AFTER (fixed):
const { data: rule } = await supabase
  .from("vista_cross_sell_rules")
  .select("success_rate")

const currentRate = rule.success_rate || 0
const newRate = currentRate * 0.9 + (converted ? 100 : 0) * 0.1

const { data, error } = await supabase
  .from("vista_cross_sell_rules")
  .update({
    success_rate: Math.round(newRate * 10) / 10,
  })
  .eq("id", params.id)
  .select()
  .single()
```

---

## FIX-10: Content Assets Table (💥 500 crash — needs new table)
**Files:** `app/api/content/route.ts`, `app/api/content/roi/route.ts`, `app/api/content/interactions/route.ts`  
**Problem:** `vista_content_assets` table doesn't exist in Supabase

**Fix:** Create the table:
```sql
CREATE TABLE IF NOT EXISTS public.vista_content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL DEFAULT 'article',
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  url TEXT,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_assets_status ON vista_content_assets(status);
CREATE INDEX IF NOT EXISTS idx_content_assets_type ON vista_content_assets(content_type);
```

After creating, update route column references to match the new schema.

---

## FIX-11: Content Interactions — Wrong table name (💥 500 crash)
**Files:** `app/api/content/interactions/route.ts`, `app/api/content/roi/route.ts`  
**Problem:** References `vista_content_interactions` — actual table is `vista_content_contact_interactions`

**Fix:**
```typescript
// BEFORE:
.from("vista_content_interactions")

// AFTER:
.from("vista_content_contact_interactions")
```

Also fix the join in `content/interactions/route.ts`:
```typescript
// BEFORE:
.select("*, vista_content_assets(content_title)")

// AFTER (once vista_content_assets exists):
.select("*, vista_content_assets(title)")  // column is 'title' not 'content_title'
```

Check `vista_content_contact_interactions` columns and adjust all field references.

---

## FIX-12: Membership Benefits Tables (💥 500 crash — needs 2 new tables)
**Files:** `app/api/membership-benefits/route.ts`, `app/api/membership-benefits/usage/route.ts`  
**Problem:** `vista_membership_benefits` and `vista_membership_benefit_usage` don't exist

**Fix:** Create both tables:
```sql
-- Benefits definition table
CREATE TABLE IF NOT EXISTS public.vista_membership_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_name TEXT NOT NULL,
  benefit_type TEXT,
  description TEXT,
  tier_required TEXT,
  max_usage_per_period INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.vista_membership_benefit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_id UUID REFERENCES vista_membership_benefits(id),
  contact_id UUID REFERENCES vista_contacts(id),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  period TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then update route column references to match. Also note: the join `vista_membership_benefit_usage.benefit_name` via FK should reference `vista_membership_benefits.benefit_name`.

---

## FIX-13: Outreach — Wrong table + mock fallback (⚠️ Silent data issue)
**File:** `app/api/outreach/route.ts`  
**Problem:** Queries `outreach_assignments` — doesn't exist. Has fallback that returns FAKE data (phantom outreach assignments with made-up names like "Sarah Chen").

**Fix options:**
- **Option A (quick):** Use `vista_outreach_sequences` and adjust column mapping
- **Option B (proper):** Create `outreach_assignments` table matching the expected schema

Recommended: **Option B** since the code expects specific fields (contact_id, template_id, sequence_id, status, current_step, touches_sent, etc.)

```sql
CREATE TABLE IF NOT EXISTS public.outreach_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES vista_contacts(id),
  template_id UUID REFERENCES vista_outreach_templates(id),
  sequence_id UUID,
  status TEXT DEFAULT 'Active',
  current_step INT DEFAULT 0,
  start_date TIMESTAMPTZ,
  last_touch_date TIMESTAMPTZ,
  next_touch_date TIMESTAMPTZ,
  touches_sent INT DEFAULT 0,
  touches_total INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Also: **Remove the mock data fallback** — it's misleading. If the table is empty, return empty array.

---

## FIX-14: Templates — Wrong table name (💥 500 crash)
**Files:** `app/api/templates/route.ts`, `app/api/templates/[id]/route.ts`  
**Problem:** Queries `email_templates` — actual table is `vista_outreach_templates`

**Fix:**
```typescript
// BEFORE:
.from("email_templates")

// AFTER:
.from("vista_outreach_templates")
```

Check `vista_outreach_templates` columns and adjust all field references. The code may reference `template_name` which might be different in the actual table.

---

## FIX-15: Discount Rules — is_founding_client column missing (⚠️ Silent failure)
**File:** `app/api/discount-rules/check/route.ts`  
**Problem:** Queries `vista_contacts.is_founding_client` — column doesn't exist  
**Actual columns:** The contacts table doesn't track founding client status

**Fix options:**
- **Option A:** Add `is_founding_client BOOLEAN DEFAULT false` to `vista_contacts`
- **Option B:** Remove the founding_client discount condition from the check logic

Recommended: **Option A** (the business spec mentions founding clients as a real concept)

```sql
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS is_founding_client BOOLEAN DEFAULT false;
```

---

## FIX-16: Funnel Overview — avg_days_in_stage hardcoded (📉 Wrong data)
**File:** `app/api/funnel/overview/route.ts`  
**Problem:** `avg_days_in_stage: 0` hardcoded for all stages

**Fix:** Calculate actual average days from `vista_tier_progressions`:
```typescript
// Get progression data to calculate actual time in stage
const { data: progressions } = await supabase
  .from("vista_tier_progressions")
  .select("contact_id, from_stage, to_tier, entered_at, created_at")

// Group by current stage, calculate average days
// If no progression data exists yet, return null instead of 0
```

If `entered_at` or equivalent column doesn't exist in `vista_tier_progressions`, return `null` instead of `0` to indicate data not yet available.

---

## FIX-17: Revenue Dashboard — Period filter not applied (📉 Wrong data)
**File:** `app/api/revenue/dashboard/route.ts`  
**Problem:** `period` parameter is read but never used to filter data

**Fix:** Add date filtering based on period:
```typescript
const period = searchParams.get("period") || "monthly"

// Calculate date range
const now = new Date()
let startDate: Date
switch (period) {
  case "weekly":
    startDate = new Date(now.getTime() - 7 * 86400000)
    break
  case "quarterly":
    startDate = new Date(now.getTime() - 90 * 86400000)
    break
  case "yearly":
    startDate = new Date(now.getTime() - 365 * 86400000)
    break
  default: // monthly
    startDate = new Date(now.getTime() - 30 * 86400000)
}

// Apply to query
const { data: engagements } = await supabase
  .from("vista_contact_service_engagements")
  .select("*, vista_service_catalog(tier, tier_name, name)")
  .gte("created_at", startDate.toISOString())  // ADD THIS
```

---

## FIX-18: Vercel Deployment Fix (🔴 BLOCKING)
**Problem:** Last 3 deployments in ERROR state. Production unreachable.

**Steps:**
1. After all code fixes above are committed
2. Merge `trae/wave1.5-frontend` → `main`:
```bash
git checkout main
git merge trae/wave1.5-frontend
git push origin main
```
3. Check Vercel deployment logs for build errors
4. If build fails, fix compilation errors and redeploy
5. Smoke test all 19 pages

---

## Execution Order

**Batch 1 — Quick fixes (table name corrections, ~1 hour):**
FIX-01, FIX-02, FIX-03, FIX-04, FIX-14 (simple `.from()` replacements)

**Batch 2 — Column fixes (~1 hour):**
FIX-05, FIX-07, FIX-08, FIX-09 (column name corrections)

**Batch 3 — Logic fixes (~1 hour):**
FIX-06, FIX-15, FIX-16, FIX-17 (code logic changes)

**Batch 4 — New tables (~1 hour):**
FIX-10, FIX-11, FIX-12, FIX-13 (CREATE TABLE + adjust routes)

**Batch 5 — Deploy (~30 min):**
FIX-18 (merge + deploy + smoke test)

**Total estimate: ~4.5 hours**

---

## Commit After Each Batch
Push to `trae/wave1.5-frontend` branch after each batch. Do NOT batch all into one commit.
