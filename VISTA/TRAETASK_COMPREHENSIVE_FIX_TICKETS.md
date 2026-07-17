# VISTA — Comprehensive Fix Tickets (Post Go-Live Audit)

**Date:** 2026-07-17
**Context:** Page-by-page deep audit revealed 24 issues across all 14 pages.
**Priority order:** Critical (security/broken) → High (missing core functionality) → Medium (polish)

---

## 🔴 CRITICAL PRIORITY (Batch 1 — Week 1, ~7 hours)

### FIX-20: Enable Auth Middleware
**Page:** Global (all pages)
**Issue:** `middleware.ts` has `matcher: []` — ZERO routes are protected. Login page exists but is decorative.
**Impact:** Anyone with the URL has full access to all 17k contacts, pipeline, strategy data.
**Fix:** Update `middleware.ts` to check Supabase session. Protected paths: /dashboard, /contacts, /signals, /pipeline, /campaigns, /clusters, /activities, /strategy, /programs, /conversions, /automation, /settings, /revenue, /templates. Redirect to /login if no session.
**Files:** `middleware.ts`
**Effort:** 30 min

### FIX-21: Wire Real Email Sending
**Page:** Email Composer (Contact Detail, Campaigns)
**Issue:** `/api/email/send` logs activity to DB but doesn't actually send. No email provider.
**Impact:** Users compose emails, click Send, nothing happens.
**Fix:** Integrate Microsoft Graph API (kevin.hong@lyc-partners.ai) or Resend. After logging activity, actually send the email.
**Files:** `lib/email/graph.ts` (new), `app/api/email/send/route.ts` (update)
**Effort:** 2 hours

### FIX-22: Create Contact Button (Not Fake)
**Page:** `/contacts`
**Issue:** `CreateContactButton` shows `alert("Create contact coming soon")`. TODO comment.
**Impact:** Can't add contacts — most basic CRUD missing on the most important page.
**Fix:** Create `CreateContactModal` with form fields (name, company, role, email, etc). POST to `/api/contacts`.
**Files:** `components/contacts/CreateContactModal.tsx` (new), `components/contacts/CreateContactButton.tsx` (update)
**Effort:** 1 hour

### FIX-23: Empty States for All Empty Pages
**Pages:** Activities, Strategy, Conversions, Revenue
**Issue:** Pages with 0 data show blank tables. No guidance.
**Impact:** Users confused — don't know if it's a bug.
**Fix:** Create `EmptyState` component. For each empty page show: icon + title + description + action button. Examples: "No activities yet. Log your first activity to track interactions."
**Files:** `components/ui/EmptyState.tsx` (new), all affected pages
**Effort:** 1 hour

### FIX-24: Remove Fake Automation Data
**Page:** `/automation`
**Issue:** `recentRuns` array is HARDCODED with fake pipeline run logs. `config` is all null.
**Impact:** Shows automation working when nothing has ever run. Misleading.
**Fix:** Remove hardcoded array. Show empty state: "No automation runs yet. Configure LENS, PROBE, and CARL agents in Settings." Config should fetch from `settings` table.
**Files:** `app/automation/page.tsx`
**Effort:** 30 min

### FIX-25: Add Templates & Revenue to Sidebar Nav
**Issue:** Both pages exist but aren't in sidebar.
**Files:** `components/layout/Sidebar.tsx`
**Effort:** 10 min

### FIX-26: Fix Template Table Mismatch
**Issue:** Page queries `email_templates` (128 records). API queries `vista_outreach_templates` (8 records). Different tables!
**Fix:** Standardize on `vista_outreach_templates`.
**Files:** `app/templates/page.tsx`
**Effort:** 30 min

### FIX-19: Notes Formatting (already created separately)
**Effort:** 10 min

---

## 🟡 HIGH PRIORITY (Batch 2 — Week 2, ~9 hours)

### FIX-27: Contact Edit Capability
**Page:** Contact Detail
**Issue:** All contact fields read-only. `Edit3` icon imported but never used.
**Fix:** Add Edit button → modal with pre-filled fields → PUT to `/api/contacts/[id]`.
**Files:** `components/contacts/EditContactModal.tsx` (new), `app/contacts/[id]/ContactDetail.tsx`, `app/api/contacts/[id]/route.ts` (PUT handler)
**Effort:** 1.5 hours

### FIX-28: Contact Delete with Confirmation
**Pages:** Contact Detail, Contacts List
**Issue:** No delete capability anywhere.
**Fix:** Add Delete button with ConfirmDialog. DELETE handler on API. Bulk delete on list page.
**Files:** ContactDetail.tsx, `app/api/contacts/[id]/route.ts` (DELETE handler), contacts/page.tsx
**Effort:** 1 hour

### FIX-29: Signal-to-Contact Linking
**Page:** Signals
**Issue:** Signals have `contact_id` field but no UI showing related contact.
**Fix:** Join with `vista_contacts` in API. Show clickable contact name in signals list.
**Files:** `app/api/signals/route.ts`, SignalsPage component
**Effort:** 1 hour

### FIX-30: Cluster Drill-Down
**Page:** Clusters
**Issue:** Can't see which contacts are in a cluster.
**Fix:** Click cluster → navigate to `/clusters/[id]` → show contacts in that cluster + bulk actions (Score All, Create Campaign).
**Files:** `app/clusters/[id]/page.tsx` (new), ClustersPage.tsx
**Effort:** 1.5 hours

### FIX-31: Activities Page — Add Activity Button
**Page:** Activities (EMPTY)
**Issue:** No way to log activities from global page.
**Fix:** Add "Log Activity" button → open ActivityLog modal → POST to `/api/activities`.
**Files:** `app/activities/page.tsx`
**Effort:** 30 min

### FIX-32: Strategy Page — Create Note Button
**Page:** Strategy (EMPTY)
**Issue:** No way to create strategic notes.
**Fix:** Add "Create Note" button → modal (title, content, category, contact_id optional) → POST to `/api/strategic-notes`.
**Files:** `components/strategy/CreateNoteModal.tsx` (new), `app/strategy/page.tsx`
**Effort:** 1 hour

### FIX-33: Pipeline Stage Transition Logging
**Page:** Contact Detail
**Issue:** Stage changes don't create `pipeline_history` records.
**Fix:** When `handleStageChange` fires, also POST to `/api/pipeline/history` with from_stage, to_stage, contact_id, changed_by.
**Files:** ContactDetail.tsx, `app/api/pipeline/history/route.ts` (new)
**Effort:** 1 hour

### FIX-34: Dashboard KPI Deltas — Real Comparison
**Page:** Dashboard
**Issue:** "vs last week" shows absolute count, not delta. Misleading.
**Fix:** Query TWO periods (current week + previous week). Return actual delta.
**Files:** `app/api/dashboard/kpis/route.ts`, Dashboard.tsx
**Effort:** 1 hour

---

## 🟢 MEDIUM PRIORITY (Batch 3 — Week 3, ~11 hours)

### FIX-35: CSV Export for Core Tables
**Pages:** Contacts (exists), Signals, Pipeline, Campaigns
**Issue:** Only Settings + Contacts have export.
**Fix:** Create export API endpoints for signals/pipeline/campaigns. Add buttons.
**Files:** 3 new API routes + 3 page updates
**Effort:** 2 hours

### FIX-37: Breadcrumbs for Deep Pages
**Pages:** Contact Detail, Signal Detail, Cluster Detail
**Fix:** Create Breadcrumbs component. Add to all detail pages.
**Files:** `components/ui/Breadcrumbs.tsx` (new), detail pages
**Effort:** 30 min

### FIX-38: Bulk Actions on Contacts
**Page:** Contacts
**Issue:** Can't select multiple contacts.
**Fix:** Checkbox column → floating action bar → Score All (bulk-assess API), Export, Reassign.
**Files:** ContactsTable.tsx, `components/contacts/BulkActionBar.tsx` (new)
**Effort:** 2 hours

### FIX-39: Pipeline Kanban Drag-and-Drop
**Page:** Pipeline
**Issue:** Kanban view exists but may not have drag-drop library.
**Fix:** Install `@hello-pangea/dnd`, wire drag handlers, update pipeline_stage on drop.
**Files:** PipelinePage kanban component, package.json
**Effort:** 1 hour

### FIX-40: Settings — Preview Threshold Impact
**Page:** Settings
**Fix:** Add Preview button. Query how many contacts would change tier with new thresholds.
**Files:** Settings page, new API endpoint
**Effort:** 1.5 hours

### FIX-41: Contact Search Performance
**Page:** Contacts
**Issue:** ILIKE search slow on 17k records.
**Fix:** Add PostgreSQL full-text search index on name/company/email.
**Files:** SQL migration, contacts API
**Effort:** 1 hour

### FIX-42: Campaign Approval Notification
**Fix:** When campaign submitted for approval, notify approver (in-app toast + email + Feishu).
**Files:** Campaigns API, notification logic
**Effort:** 1 hour

### FIX-43: Revenue Page — Populate Data
**Issue:** `vista_contact_service_engagements` = 0 rows. Revenue page empty.
**Fix:** Add "Record Service" button to contact detail. Or import historical data.
**Files:** New API endpoint, contact detail UI
**Effort:** 2 hours

---

## 📋 Data Status Summary

| Table | Rows | Status |
|-------|------|--------|
| vista_contacts | 17,359 | ✅ Working |
| signals | 2,829 | ✅ Working |
| density_clusters | 466 | ✅ Working |
| campaign_activities | 61 | ✅ Working |
| programs | 35 | ✅ Working |
| vista_service_catalog | 2,895 | ✅ Working |
| vista_proposals | 197 | ✅ Working |
| email_templates | 128 | ⚠️ Table mismatch |
| vista_outreach_templates | 8 | ✅ Working |
| campaign_contacts | 4,332 | ✅ Working |
| activities | **0** | 🔴 Empty |
| strategic_notes | **0** | 🔴 Empty |
| vista_contact_service_engagements | **0** | 🔴 Empty |
| outreach_assignments | **0** | 🔴 Empty |
| vista_tier_progressions | **0** | 🔴 Empty |

---

## ✅ Definition of Done (All batches)

- [ ] Auth enforced — no unauthenticated access
- [ ] Email actually sends — test email arrives
- [ ] Full CRUD on contacts — create, read, update, delete
- [ ] All pages have data OR helpful empty states
- [ ] No fake/hardcoded data anywhere
- [ ] Templates + Revenue visible in sidebar
- [ ] Bulk operations on contacts
- [ ] CSV export on all core tables
- [ ] Pipeline drag-and-drop works
- [ ] Audit trail (pipeline_history) works

**Total effort:** ~27 hours across 3 batches
