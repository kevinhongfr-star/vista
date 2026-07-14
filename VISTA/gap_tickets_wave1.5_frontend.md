# VISTA Gap Tickets — Post-Audit (2026-07-14)

Audit found Waves 1-5 code in main, Wave 1.5 backend done but **no frontend UI**.
These tickets close the gap between "code exists" and "user can actually use it."

---

## Wave 1.5 Frontend Gaps (Backend Done, UI Missing)

### F-01: Template Management Page
**Priority**: P0 — blocks all outreach
**What**: Dedicated `/templates` page listing all outreach templates (email sequences, LinkedIn messages, follow-up cadences)
**Spec**:
- Table view with: name, type (email/linkedin/sequence), target persona, status (active/draft/archived)
- Inline edit: name, type, status
- Create new template button → opens template editor modal
- Delete/archive actions
- Filter by type, status, persona
- Links to existing `/api/templates` endpoint
**Acceptance**: User can view, create, edit, archive templates from UI

---

### F-02: Sequence Builder Interface
**Priority**: P0 — blocks multi-step outreach
**What**: Visual sequence builder for creating multi-step email/LinkedIn cadences
**Spec**:
- Drag-and-drop step builder (Day 0: Email → Day 3: LinkedIn → Day 7: Follow-up email)
- Each step: type, delay (days), content (rich text), conditional branching (if no reply → send follow-up)
- Save sequence → links to template_id in DB
- Preview sequence timeline
- Clone existing sequence
**Acceptance**: User can build a 5-step outreach sequence with conditional logic

---

### F-03: Outreach Tracking Dashboard
**Priority**: P0 — can't manage what you can't see
**What**: Central dashboard showing all active outreach campaigns and their status
**Spec**:
- Summary cards: active sequences, total contacts in outreach, response rate, meetings booked
- Active sequences list: name, contacts count, step progress, completion %
- Click sequence → drill into contact-level status (who got step 1, who replied, who went silent)
- Filters: by sequence, by persona, by date range, by status
- Export to CSV
**Acceptance**: User sees all active outreach with real-time status per contact

---

### F-04: Nurture Route Visualization
**Priority**: P1 — strategic planning
**What**: Visual map of how contacts flow through different nurture paths
**Spec**:
- Flow diagram showing: entry point (signal/source) → nurture path → conversion point
- Multiple parallel routes visible (cold outreach path, warm follow-up path, event follow-up path)
- Each route shows: # contacts, conversion rate, avg time to conversion
- Click route → see contacts in that path
- Color code by status (active/stalled/converted)
**Acceptance**: User sees all nurture paths with contact flow and conversion metrics

---

### F-05: Template-to-Contact Assignment
**Priority**: P0 — connects templates to actual outreach
**What**: UI to assign templates/sequences to contacts or contact groups
**Spec**:
- From contact detail page: "Start Outreach" button → select template/sequence → confirm → creates outreach record
- From templates page: "Apply to Contacts" → select contacts/groups → confirm
- Bulk assign: select multiple contacts → assign same sequence
- Shows assignment history per contact
- Unassign/pause capability
**Acceptance**: User can assign a sequence to 50 contacts in 3 clicks

---

### F-06: Outreach Activity Feed
**Priority**: P1 — visibility into what happened
**What**: Chronological feed of all outreach activities (emails sent, LinkedIn messages, replies, bounces)
**Spec**:
- Timeline view: newest first, grouped by day
- Each entry: type, contact name, subject/preview, status (sent/delivered/opened/replied/bounced)
- Filter by: type, contact, date range, status
- Click entry → full content + contact detail
- Integrates with existing `/api/activities` endpoint
**Acceptance**: User sees every outreach action with status in real-time feed

---

### F-07: Sequence Performance Analytics
**Priority**: P1 — optimization
**What**: Analytics page showing performance metrics per sequence/template
**Spec**:
- Per sequence: send count, open rate, reply rate, meeting rate, avg response time
- Comparison view: side-by-side sequence comparison
- Trend over time: weekly/monthly performance charts
- Best performing template highlight
- Underperforming template warning (<5% reply rate)
**Acceptance**: User can identify which sequences work and which need revision

---

### F-08: Email Composer Integration
**Priority**: P0 — daily workflow
**What**: Enhanced email composer that pulls from templates and contact context
**What exists**: Basic email composer in Wave 1
**Gap**: No template insertion, no contact context panel, no personalization tokens
**Spec**:
- Template dropdown: insert pre-built template into composer
- Personalization tokens: {{first_name}}, {{company}}, {{industry}}, {{last_signal}}
- Right panel: contact context (company, role, signals, previous interactions)
- Preview mode: see what recipient will see with tokens filled
- Send now / schedule for later options
**Acceptance**: User can compose personalized email using template + tokens in 30 seconds

---

## Wave 1.6 Revenue OS (Not Started — 20 tickets, separate spec)

Already specified in `spec_wave1.6_revenue_os.md` (R-01→R-20). SQL migration pushed but not yet executed in Supabase.

**Dependency**: Execute `run_this_wave1.6_migration.sql` first, then build frontend.

---

## Wave 1.7 B2C→B2B Intelligence (Not Started — 10 tickets, separate spec)

Already specified in `spec_wave1.7_b2c_portal.md` (BC-01→BC-10). SQL migration pushed but not yet executed.

**Dependency**: Execute `run_this_wave1.7_migration.sql` first, then build frontend.

---

## Infrastructure Gaps

### INFRA-01: Clean Up Trae Branches
**Priority**: P2
**What**: Delete 4 stale branches (`trae/agent-Kqk5cW`, `trae/wave2-bulk-ops`, `trae/wave3-action-engine`, `trae/wave4-reports`) — code is already in main

### INFRA-02: Fix ESLint Config
**Priority**: P2
**What**: Root cause fix for ESLint errors — remove `ignoreDuringBuilds: true` hack

### INFRA-03: Execute Pending Migrations
**Priority**: P0
**What**: Kevin needs to run in Supabase SQL Editor:
1. `fix_rpc_functions_wave1.5.sql` (142 lines)
2. `run_this_wave1.6_migration.sql` (453 lines)
3. `run_this_wave1.7_migration.sql` (309 lines)

---

## Priority Order

1. **INFRA-03** — Execute migrations (prerequisite for everything)
2. **F-01** — Template management (foundation for all outreach UI)
3. **F-05** — Template-to-contact assignment (connects templates to contacts)
4. **F-08** — Email composer integration (daily workflow tool)
5. **F-03** — Outreach tracking dashboard (visibility)
6. **F-02** — Sequence builder (multi-step outreach)
7. **F-06** — Activity feed (what happened)
8. **F-04** — Nurture route visualization (strategic)
9. **F-07** — Sequence analytics (optimization)
10. **INFRA-01** — Branch cleanup
11. **INFRA-02** — ESLint fix
12. **Wave 1.6** — Revenue OS (after Wave 1.5 frontend done)
13. **Wave 1.7** — B2C→B2B intelligence (after Wave 1.6)
