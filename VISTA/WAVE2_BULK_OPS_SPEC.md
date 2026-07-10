# Wave 2: Bulk Operations + Realtime Reactivity

**For:** Trae  
**From:** James/AI (PM)  
**Date:** 2026-07-10  
**Depends on:** Wave 1 (merged to main, DeepSeek API live)  
**Estimate:** 4-5 hours

---

## Rules

1. Branch from `main`. Do NOT force push.
2. One commit per deliverable minimum.
3. Push to your branch when done. Do NOT merge to main yourself.
4. All AI calls go through `lib/deepseek.ts` — import `callDeepSeekJSON` from `@/lib/deepseek`.
5. Test each endpoint before committing.

---

## Deliverable 6: `POST /api/intelligence/bulk-assess`

**File:** `app/api/intelligence/bulk-assess/route.ts`

**Purpose:** AI scores N contacts in one batch. Writes results directly to Supabase. VISTA UI updates in real-time.

### Request Body
```typescript
interface BulkAssessRequest {
  scope: "all" | "filter" | "cluster" | "ids"
  filter?: { industry?: string; seniority?: string; pipeline_stage?: string }
  cluster_id?: string
  contact_ids?: string[]
  assessment_type?: "full" | "score_only" | "recommendations_only"
}
```

### Backend Logic
```
1. Fetch contacts from Supabase based on scope:
   - "all" → SELECT * FROM vista_contacts WHERE status != 'Archived' LIMIT 500
   - "filter" → apply filter conditions
   - "cluster" → WHERE density_cluster_id = cluster_id
   - "ids" → WHERE id IN (contact_ids)

2. Process in batches of 10:
   For each batch:
   a. Build prompt with contact data (company, role, seniority, industry, current scores, recent signals)
   b. Call callDeepSeekJSON with scoring prompt
   c. For each result:
      - UPDATE vista_contacts SET vista_v, vista_i, vista_s, vista_t, vista_a, vista_composite, priority_score WHERE id = contact_id
      - INSERT INTO strategic_notes (contact_id, note_type, content, created_at) if rationale exists
   d. Yield progress: { assessed: N, total: M, current_batch: B }

3. Return final: { assessed: N, updated: N, errors: N, duration_ms: number }
```

### DeepSeek Prompt Template
```
You are a BD scoring engine. Score each contact on V/I/S/T/A dimensions (0-30 each).

Scoring criteria:
- V (Value): Company size, revenue, industry tier, strategic fit. Larger/more strategic = higher.
- I (Intensity): Signal frequency, engagement momentum, response rate. More active = higher.
- S (Strategic): Seniority level, decision-making power, network position. C-suite = higher.
- T (Timing): Recent triggers (funding, hiring, expansion), urgency signals. Recent trigger = higher.
- E (Ecosystem/A): Cluster membership, referral proximity, event overlap. More connected = higher.

Composite = sum of all 5 scores (max 150).

Contacts to score:
{batch_json}

Output JSON array:
[
  {
    "id": "contact_uuid",
    "scores": { "v": 22, "i": 18, "s": 25, "t": 15, "a": 20 },
    "composite": 100,
    "rationale": "One sentence explaining the score",
    "recommended_action": "Specific next action"
  }
]
```

### Rate Limiting
- 10 contacts per DeepSeek call
- Max 5 concurrent batches (use Promise.all with chunking)
- For 17K contacts: ~1,700 calls, ~30 min with concurrency

### Acceptance Criteria
- [ ] POST with scope:"ids" and 3 contact IDs returns scores for all 3
- [ ] vista_contacts rows are updated with new vista_v/i/s/t/a/composite values
- [ ] strategic_notes rows are inserted with AI rationale
- [ ] Errors don't crash the batch — they're counted and returned
- [ ] Response includes { assessed, updated, errors, duration_ms }

---

## Deliverable 7: `POST /api/intelligence/bulk-detect-signals`

**File:** `app/api/intelligence/bulk-detect-signals/route.ts`

**Purpose:** AI scans contacts for new signals and writes to signals table.

### Request Body
```typescript
interface BulkDetectSignalsRequest {
  scope: "all" | "recent" | "cluster" | "ids"
  days_back?: number  // default 7
  cluster_id?: string
  contact_ids?: string[]
}
```

### Backend Logic
```
1. Fetch contacts + their recent activity (last N days):
   - Join vista_contacts with signals (to avoid re-detecting existing signals)
   - Include: company, role, recent activities, last engagement date

2. Process in batches of 10:
   For each batch:
   a. Build prompt with contact activity data
   b. Call callDeepSeekJSON with signal detection prompt
   c. For each detected signal:
      - INSERT INTO signals (contact_id, signal_type, title, content, impact, recommended_action, urgency, detected_date, company)
   d. Yield progress

3. Return: { signals_detected: N, contacts_scanned: M, errors: N }
```

### DeepSeek Prompt Template
```
You are a signal detection engine. For each contact, analyze their recent activity and context to identify new signals.

Signal types:
- funding: Company raised capital
- job_change: Person changed role/company
- expansion: Company entering new market/hiring
- engagement_shift: Change in response patterns
- market_event: Industry shift affecting the contact
- partnership: New partnership or integration announced

Contacts and recent activity:
{batch_json}

Output JSON array (only include contacts where a signal IS detected):
[
  {
    "contact_id": "uuid",
    "signal_type": "funding",
    "title": "Company raised $50M Series B",
    "content": "Their company announced Series B funding led by Sequoia",
    "impact": "high",
    "recommended_action": "Reach out with congratulations + schedule call",
    "urgency": "This week"
  }
]

IMPORTANT: Only output signals you're confident about. Do NOT fabricate signals. If no signal is detected for a contact, omit them from the output.
```

### Acceptance Criteria
- [ ] POST with scope:"recent" and days_back:7 scans recent contacts
- [ ] New rows appear in signals table with correct columns
- [ ] Duplicate signals are not created (check existing signal_type + contact_id)
- [ ] Returns { signals_detected, contacts_scanned, errors }

---

## Deliverable 8: Supabase Realtime Subscriptions

**Files to create/modify:**
- `lib/supabase/realtime.ts` — NEW: shared Realtime subscription helper
- `app/dashboard/page.tsx` — ADD: Realtime subscription
- `app/contacts/page.tsx` — ADD: Realtime subscription
- `app/signals/page.tsx` — ADD: Realtime subscription

### Implementation

**lib/supabase/realtime.ts:**
```typescript
"use client"
import { createBrowserClient } from "@supabase/ssr"

export function subscribeToVistaChanges(
  onContactChange?: (payload: any) => void,
  onSignalChange?: (payload: any) => void,
  onClusterChange?: (payload: any) => void
) {
  const supabase = createBrowserClient()
  
  const channel = supabase
    .channel("vista_changes")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "vista_contacts" },
      (payload) => onContactChange?.(payload))
    .on("postgres_changes",
      { event: "*", schema: "public", table: "signals" },
      (payload) => onSignalChange?.(payload))
    .on("postgres_changes",
      { event: "*", schema: "public", table: "density_clusters" },
      (payload) => onClusterChange?.(payload))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
```

### Supabase SQL Required
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE vista_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE signals;
ALTER PUBLICATION supabase_realtime ADD TABLE density_clusters;
```

### Acceptance Criteria
- [ ] Realtime subscription connects without errors
- [ ] When a contact score is updated in Supabase, UI updates within 2 seconds
- [ ] When a new signal is inserted, it appears in Signals page immediately
- [ ] Subscription cleans up on unmount (no memory leaks)
- [ ] Works on Dashboard, Contacts, and Signals pages

---

## Deliverable 9: "Run Bulk Assessment" UI

**File:** `app/dashboard/page.tsx` (add to existing) or `components/intelligence/bulk-assess-button.tsx` (new)

### UI Requirements
- Button: "Run Bulk Assessment" — positioned on Dashboard near KPI cards
- On click: modal/drawer with options:
  - Scope: All Contacts | By Filter | By Cluster | Selected IDs
  - Type: Full | Score Only | Recommendations Only
  - Start button
- Progress:
  - Progress bar (0-100%)
  - Text: "Assessing 150/17,359 contacts..."
  - Cancel button
- On completion:
  - Summary: "150 contacts assessed, 148 updated, 2 errors"
  - Auto-refresh dashboard KPIs
  - Toast notification

### Acceptance Criteria
- [ ] Button visible on Dashboard
- [ ] Click opens scope/type selector
- [ ] Progress bar updates during assessment
- [ ] Completion shows summary
- [ ] Dashboard KPIs refresh after completion

---

## Execution Order

1. Deliverable 8 (Realtime) — foundation for live updates
2. Deliverable 6 (bulk-assess) — core intelligence operation
3. Deliverable 9 (UI button) — makes bulk-assess accessible
4. Deliverable 7 (bulk-detect-signals) — independent, can be parallel

---

## What This Unlocks

After Wave 2:
- AI writes scores to Supabase → VISTA UI updates instantly (no refresh)
- AI detects signals → they appear in Signals feed in real-time
- Click "Run Bulk Assessment" → watch 17K contacts get AI-scored live
- Charts move, scores change, pipeline rearranges — all automatically

This is where VISTA stops being a static dashboard and becomes intelligent.
