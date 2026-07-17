# Trae Task: Wave 1.6 Bug Fixes (9 issues)

**Branch:** `trae/wave1.5-frontend` (same branch, push new commit)
**Priority:** HIGH — 5 of these crash at runtime
**Estimated effort:** 1-2 days

---

## 🔴 CRITICAL — Runtime Errors (fix first)

### FIX-1: D1 Membership Dashboard — fake table `vista_memberships`
**File:** `app/api/membership/overview/route.ts`
**Problem:** Queries `vista_memberships` table which does NOT exist.
**Fix:** Use `vista_council_members` instead. The actual table has:
- `contact_id`, `member_type`, `membership_date`, `status`, `is_founding_member`, `annual_revenue_cny`, `engagement_score`, `last_interaction_date`
- Rewrite the GET handler to query `vista_council_members` with a join to `vista_contacts` for name/company.

### FIX-2: D2 Platform Settings — fake table `vista_platform_settings`
**File:** `app/api/platform/settings/route.ts`
**Problem:** Queries `vista_platform_settings` table which does NOT exist.
**Fix:** Two options:
- **Option A (preferred):** Store settings in `v2_model_config` table (already exists, has `parameter_name`, `parameter_value`, `category`). Use `category = 'platform_settings'`.
- **Option B:** Create a simple JSON config file or use `v2_model_config` as a key-value store.
- Rewrite both GET and PUT to use the chosen storage.

### FIX-3: B1 Bundle Matching — UUID vs TEXT type mismatch
**File:** `app/api/bundles/route.ts` (POST handler)
**Problem:** Code compares `service_ids` (UUID[]) from the request against `component_service_names` (TEXT[]) in `vista_service_bundles`. UUIDs will never match text names.
**Fix:** Before comparison, resolve UUIDs to names:
```
1. Fetch service names from vista_service_catalog WHERE id IN (provided UUIDs)
2. Compare resolved names against bundle.component_service_names (TEXT[])
3. Match = all component names are present in the resolved names
```

### FIX-4: C4 Workshop POST — wrong column names
**File:** `app/api/workshops/route.ts` (POST handler)
**Problem:** Inserts `workshop_name`, `workshop_date`, `workshop_time` — these columns don't exist.
**Actual schema of `vista_workshops`:** `title`, `workshop_type`, `scheduled_date`, `duration_hours`, `location`, `max_attendees`, `status`, `host_contact_id`, `notes`, `created_at`
**Fix:** Map the incoming fields to correct columns:
- `workshop_name` → `title`
- `workshop_date` + `workshop_time` → `scheduled_date` (combine into timestamp)
- Add required fields: `status: 'scheduled'`

### FIX-5: E1 Cross-Sell Success Rate — fake column `attempt_count`
**File:** `app/api/cross-sell-rules/[id]/success/route.ts`
**Problem:** Reads and updates `attempt_count` which does NOT exist on `vista_cross_sell_rules`.
**Actual columns:** `id, source_service_name, target_service_name, priority, trigger_condition, trigger_delay_days, pitch_script, success_rate, is_active, created_at`
**Fix:** Remove `attempt_count` logic. Just update `success_rate` using the EMA formula:
```
newRate = currentRate * 0.9 + (converted ? 100 : 0) * 0.1
```
Only write `{ success_rate: Math.round(newRate * 10) / 10 }` to the update call.

---

## 🟡 LOGIC — Quality Issues (fix second)

### FIX-6: A2 Discount Check — fake column `is_founding_client`
**File:** `app/api/discount-rules/check/route.ts`
**Problem:** References `vista_contacts.is_founding_client` which does NOT exist.
**Fix:** Query `vista_council_members.is_founding_member` instead:
```
1. Check if contact_id exists in vista_council_members
2. If yes, read is_founding_member from that table
3. Apply founding member discount exemption
```

### FIX-7: B2 Proposal Number — collision risk
**File:** `app/api/proposals/route.ts` (POST handler, `generateProposalNumber` function)
**Problem:** Uses `Math.random()` to generate the sequence part of proposal numbers. Collision risk under concurrent use.
**Fix:** Use a deterministic counter:
```
1. Query: SELECT COUNT(*) FROM vista_proposals WHERE proposal_number LIKE 'PROP-{YYYY}-'
2. Next number = count + 1
3. Format: `PROP-2026-{padded_number}`
```
Or use `created_at` timestamp as part of the sequence to guarantee uniqueness.

### FIX-8: C1 Funnel Overview — hardcoded `avg_days_in_stage`
**File:** `app/api/funnel/overview/route.ts`
**Problem:** `avg_days_in_stage` is hardcoded to `0` for all tiers.
**Fix:** Calculate from `vista_tier_progressions`:
```
1. For each tier, get all progressions FROM that tier
2. Calculate avg time spent = avg(updated_at - created_at) for progressions in that tier
3. If no progressions exist, return 0 (current behavior is acceptable as fallback)
```
Note: `vista_tier_progressions` is currently empty, so this will still return 0 until data flows in. But the code should be correct for when data arrives.

### FIX-9: E2 Revenue Dashboard — period param not filtering
**File:** `app/api/revenue/dashboard/route.ts`
**Problem:** Accepts `period` query param (monthly/quarterly/annual) but never uses it to filter data by date range.
**Fix:** Add date filtering based on period:
```
monthly: last 30 days
quarterly: last 90 days  
annual: last 365 days
```
Apply the date filter to the `vista_contact_service_engagements` query using `.gte('created_at', startDate)` and to the `vista_proposals` query similarly.

---

## Verification

After all fixes, run `npm run build` to confirm no type errors.

Then manually verify each fix:
1. FIX-1: `GET /api/membership/overview` → should return council member data (not 500)
2. FIX-2: `GET /api/platform/settings` → should return settings (not 500)
3. FIX-3: `POST /api/bundles` with service UUIDs → should match bundles correctly
4. FIX-4: `POST /api/workshops` with title/date → should insert (not column error)
5. FIX-5: `PUT /api/cross-sell-rules/{id}/success` → should update success_rate (not column error)
6. FIX-6: `POST /api/discount-rules/check` for founding member → should apply exemption
7. FIX-7: Create 2 proposals rapidly → proposal numbers should be sequential, not random
8. FIX-8: `GET /api/funnel/overview` → avg_days_in_stage should be calculated (not hardcoded 0)
9. FIX-9: `GET /api/revenue/dashboard?period=monthly` → should only include last 30 days

Commit message: `fix: Wave 1.6 bug fixes (FIX-1 through FIX-9)`
