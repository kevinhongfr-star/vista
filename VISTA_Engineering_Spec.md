# VISTA BD Intelligence App — Engineering Spec
### For: Trae (Engineer) | Author: James/AI (PM) | Date: 2026-07-07
### Repo: https://github.com/kevinhongfr-star/vista.git
### Deploy: https://vista-azure-delta.vercel.app/ (Vercel)
### Supabase: https://rnnlteyqmtxkzllbohuu.supabase.co

---

## 1. Overview

Build a BD (Business Development) Intelligence dashboard app that implements the 4-agent architecture (LENS, MARIA, PROBE, CARL) for managing Kevin's business development pipeline. The app reads from and writes to Supabase `vista_contacts` (17,359 records) and supporting tables.

**Phase 1 Mode: Semi-Auto** — All agent actions produce DRAFT output. Kevin approves everything manually through the dashboard.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Vercel deployment, SSR/SSG |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI |
| Database | Supabase (PostgreSQL) | Already provisioned |
| ORM/Client | @supabase/supabase-js v2 | Direct SQL via PostgREST |
| Auth | Supabase Auth (email OTP) | Kevin-only access for Phase 1 |
| Charts | Recharts | Pipeline visualizations |
| Tables | TanStack Table | Sortable, filterable data tables |
| Forms | React Hook Form + Zod | Validated inputs |
| State | Zustand | Lightweight client state |

---

## 3. Supabase Configuration

### Environment Variables (Vercel)
```
SUPABASE_URL=https://rnnlteyqmtxkzllbohuu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Vercel env — already configured>
NEXT_PUBLIC_SUPABASE_URL=https://rnnlteyqmtxkzllbohuu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Vercel env — already configured>
```

### Supabase Client Setup
```typescript
// lib/supabase/server.ts — Server-side client (service role)
import { createClient } from '@supabase/supabase-js'
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// lib/supabase/client.ts — Client-side (anon key)
import { createClient } from '@supabase/supabase-js'
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 4. CRITICAL: Schema Migration Required

**BEFORE building the app, the following SQL migration MUST be executed against Supabase.**
The migration script is at: `BD_Agent_Schema_Migration.sql` (provided separately).

### What the migration does:
1. Adds 11 new columns to `vista_contacts` (score_delta, last_score_update, last_engagement_date, decay_flag, vista_v/i/s/t/a/composite, density_cluster_id)
2. Adds 6 BD columns to `signals` (company, signal_type, signal_strength, detected_date, recency_weight, score_impact)
3. Adds 7 MARIA columns to `campaign_activities` (campaign_type, service_route, message_template, conversation_angle, activity_status, sent_date, response_date)
4. Creates 4 new tables: `density_clusters`, `programs`, `program_assignments`, `strategic_notes`
5. Creates 4 dashboard views: `v_top_7`, `v_pipeline_summary`, `v_encirclement`, `v_outreach_activity`
6. Enables RLS on new tables
7. Resets all existing scores to 0 (LENS will recalculate)

**Status: NOT YET EXECUTED.** James/AI will execute this. Trae should build against the POST-migration schema.

---

## 5. Post-Migration Schema Reference

### vista_contacts (main table — 17,359 records)
**Existing columns (45):** id, name, company, role, seniority, function, industry, region, country, location, email, phone, headline, profile_url, avatar_url, stain_group, stain_score, stain_priority, cluster_score, signal_score, engagement_score, priority_score, engagement_tier, encirclement_level, advisory_tier, bd_pathway, bd_priority, pipeline_stage, funnel_stage, status, data_source, notion_id, notes, touch_count, last_touch_date, last_synced_at, last_conversation_recap, recommended_next, engagement_history, conversation_category, company_proximity, contact_proximity, years_experience, created_at, updated_at

**New columns (to be added by migration):**
- `score_delta` TEXT — Change description (e.g., "+12 Signal: new CHRO")
- `last_score_update` TIMESTAMPTZ — Last recalculation timestamp
- `last_engagement_date` DATE — Last meaningful interaction
- `decay_flag` BOOLEAN — TRUE if 30+ days no engagement
- `vista_v` INTEGER (0-20) — Vision score
- `vista_i` INTEGER (0-20) — Intelligence score
- `vista_s` INTEGER (0-25) — Signal score (VISTA model)
- `vista_t` INTEGER (0-20) — Trust score
- `vista_a` INTEGER (0-15) — Action score
- `vista_composite` INTEGER (0-100) — Weighted VISTA total
- `density_cluster_id` UUID FK → density_clusters

### density_clusters (NEW)
cluster_id UUID PK, industry TEXT, geography TEXT, density_score DECIMAL, status TEXT (Watch/Emerging/Active), contact_count INT, signal_types TEXT[], recommended_programs UUID[], revenue_potential DECIMAL, last_calculated TIMESTAMPTZ, created_at, updated_at

### programs (NEW)
program_id UUID PK, type TEXT (Webinar/Podcast/Newsletter/Roundtable/1:1 Coaching/Advisory/Market Insights), tier TEXT (Free/Paid), name TEXT, description TEXT, cluster_id UUID FK, capacity INT, enrolled_count INT, price DECIMAL, status TEXT (Planned/Inviting/Active/Completed), start_date DATE, end_date DATE, revenue_actual DECIMAL, created_at, updated_at

### program_assignments (NEW)
assignment_id UUID PK, contact_id UUID FK → vista_contacts(id), program_id UUID FK → programs(program_id), status TEXT (Invited/Registered/Attended/Converted/Churned), assigned_date DATE, conversion_date DATE, revenue_attributed DECIMAL, created_at, updated_at

### strategic_notes (NEW)
note_id UUID PK, note_type TEXT (Decision/Override/ICP Adjustment/Focus Shift/Review), description TEXT, author TEXT DEFAULT 'CARL', contact_id UUID FK → vista_contacts(id), created_at, updated_at

### signals (existing — BD columns added)
New: company TEXT, signal_type TEXT, signal_strength TEXT (Low/Medium/Medium-High/High), detected_date DATE, recency_weight DECIMAL, score_impact INTEGER

### campaign_activities (existing — MARIA columns added)
New: campaign_type TEXT (Signal-triggered/Nurture/Ecosystem Invite/Kevin Intro/Re-engagement), service_route TEXT, message_template TEXT, conversation_angle TEXT, activity_status TEXT (Drafted/Sent/Opened/Replied/Meeting Booked/No Response), sent_date TIMESTAMPTZ, response_date TIMESTAMPTZ

### Dashboard Views
- `v_top_7` — Top 7 contacts by priority_score (≥40)
- `v_pipeline_summary` — Contact count + avg score by engagement_tier
- `v_encirclement` — Encirclement status by company/account
- `v_outreach_activity` — Outreach activity last 30 days by week

---

## 6. App Architecture

### Page Structure (App Router)
```
app/
├── layout.tsx                    # Root layout + sidebar nav
├── page.tsx                      # Dashboard home (redirect to /dashboard)
├── (auth)/
│   └── login/page.tsx            # Login page (email OTP)
├── (dashboard)/
│   ├── layout.tsx                # Dashboard layout + auth check
│   ├── dashboard/page.tsx        # Overview: pipeline summary + top 7 + alerts
│   ├── contacts/
│   │   ├── page.tsx              # Full contacts table (vista_contacts)
│   │   └── [id]/page.tsx         # Contact detail + scores + signals + notes
│   ├── signals/
│   │   ├── page.tsx              # Signal feed + manual signal entry
│   │   └── [id]/page.tsx         # Signal detail + affected contacts
│   ├── campaigns/
│   │   ├── page.tsx              # Campaign activity list + draft manager
│   │   └── [id]/page.tsx         # Campaign detail + message preview
│   ├── clusters/
│   │   ├── page.tsx              # Density clusters map + list
│   │   └── [id]/page.tsx         # Cluster detail + member contacts
│   ├── programs/
│   │   ├── page.tsx              # Program list + enrollment
│   │   └── [id]/page.tsx         # Program detail + assigned contacts
│   ├── strategy/
│   │   ├── page.tsx              # Strategic notes + ICP adjustments
│   │   └── review/page.tsx       # Weekly strategy review view
│   └── settings/
│       └── page.tsx              # Scoring config + notification prefs
```

### Component Structure
```
components/
├── layout/
│   ├── Sidebar.tsx               # Main navigation
│   ├── Header.tsx                # Top bar + search + notifications
│   └── AgentStatusBar.tsx        # Shows agent activity (LENS/MARIA/PROBE/CARL)
├── dashboard/
│   ├── PipelineSummary.tsx       # Engagement tier distribution chart
│   ├── Top7Ranking.tsx           # Top 7 contacts this week
│   ├── EncirclementMap.tsx       # Company-level encirclement view
│   ├── AlertFeed.tsx             # Threshold crossings + decay flags
│   └── QuickActions.tsx          # Draft outreach, add signal, adjust score
├── contacts/
│   ├── ContactsTable.tsx         # TanStack table with all contacts
│   ├── ContactCard.tsx           # Summary card for contact
│   ├── ScoreBreakdown.tsx        # Visual 4-dimension score breakdown
│   ├── VistaScoreRadar.tsx       # Radar chart for VISTA 5 dimensions
│   ├── EngagementTimeline.tsx    # Timeline of interactions
│   └── SignalList.tsx            # Signals affecting this contact
├── signals/
│   ├── SignalFeed.tsx            # Real-time signal feed
│   ├── ManualSignalForm.tsx      # Manual signal entry form
│   └── SignalImpactCard.tsx      # Shows score impact of a signal
├── campaigns/
│   ├── CampaignList.tsx          # List of campaign activities
│   ├── DraftManager.tsx          # MARIA draft approval queue
│   ├── MessagePreview.tsx        # Email/LinkedIn message preview
│   └── CampaignFunnel.tsx        # Sent→Opened→Replied→Meeting funnel
├── clusters/
│   ├── ClusterList.tsx           # Density cluster list
│   ├── ClusterMap.tsx            # Geographic/industry visualization
│   └── ClusterMembers.tsx        # Contacts in a cluster
├── programs/
│   ├── ProgramList.tsx           # Program catalog
│   ├── EnrollmentTable.tsx       # Program assignments
│   └── ProgramROI.tsx            # Revenue attribution
├── strategy/
│   ├── NotesList.tsx             # Strategic notes feed
│   ├── NoteForm.tsx              # Add/edit strategic note
│   └── ICPAdjustment.tsx         # ICP configuration
├── scoring/
│   ├── ScoreGauge.tsx            # Circular gauge for priority score
│   ├── TierBadge.tsx             # Colored badge for engagement tier
│   ├── EncirclementBadge.tsx     # Badge for encirclement level
│   └── DeltaIndicator.tsx        # Score change indicator (↑↓)
└── ui/                           # shadcn/ui components
```

---

## 7. Core Features (Phase 1)

### 7.1 Dashboard Home (`/dashboard`)
**Purpose:** Kevin's daily overview of the BD pipeline.

**Data sources:**
- `v_pipeline_summary` view → Pipeline summary chart
- `v_top_7` view → Top 7 ranking table
- `v_encirclement` view → Company encirclement summary
- `vista_contacts WHERE decay_flag = TRUE` → Stale contact alerts
- `vista_contacts WHERE score_delta IS NOT NULL ORDER BY last_score_update DESC LIMIT 10` → Recent score changes
- `campaign_activities WHERE activity_status = 'Drafted'` → Pending draft count

**Layout:**
- Top row: 4 KPI cards (Total Hot, New Signals, Drafts Pending, Stale Contacts)
- Middle left: Pipeline Summary (horizontal bar chart by engagement_tier)
- Middle right: Top 7 Ranking (compact table)
- Bottom left: Recent Score Changes (list with delta indicators)
- Bottom right: Alerts (decay flags + threshold crossings)

### 7.2 Contacts Table (`/contacts`)
**Purpose:** Full vista_contacts table with sorting, filtering, and inline actions.

**Features:**
- TanStack Table with server-side pagination (50 per page)
- Sort by any column (default: priority_score DESC)
- Filter by: engagement_tier, encirclement_level, stain_group, region, industry, decay_flag
- Search by name, company, role
- Inline actions: View Detail, Draft Outreach (MARIA), Add Signal (LENS)
- Bulk actions: Export CSV, Bulk score trigger

**Supabase query:**
```typescript
const query = supabase
  .from('vista_contacts')
  .select('*')
  .order('priority_score', { ascending: false })
  .range(page * 50, (page + 1) * 50 - 1)
// Apply filters dynamically
```

### 7.3 Contact Detail (`/contacts/[id]`)
**Purpose:** Deep view of a single contact with full scoring context.

**Sections:**
1. **Header:** Name, role, company, avatar, engagement_tier badge, encirclement_level badge
2. **Score Panel:**
   - Priority Score (0-100) with 4-dimension breakdown bar
   - VISTA Score (0-100) with radar chart (5 dimensions)
   - Score delta + last update timestamp
3. **Signals:** List of signals affecting this contact
4. **Engagement Timeline:** Chronological interaction history
5. **Campaign History:** Past outreach activities
6. **Strategic Notes:** Notes from CARL about this contact
7. **Actions:** Draft Outreach, Adjust Score, Add Signal, Add Note

### 7.4 Signal Management (`/signals`)
**Purpose:** View and manually enter market signals.

**Features:**
- Signal feed (chronological, newest first)
- Manual signal entry form:
  - Company (text)
  - Contact (search/select from vista_contacts)
  - Signal Type (dropdown: 11 categories from spec)
  - Signal Strength (Low/Medium/Medium-High/High)
  - Description (text)
  - Detected Date (date picker)
- Signal detail: shows affected contacts and score impact

**Signal Types (from spec §7):**
1. Hiring (new role posted)
2. Leadership Change (C-suite/VP change)
3. M&A Activity
4. Restructuring/Reorganization
5. Market Expansion
6. Funding/Investment
7. Partnership Announcement
8. Product Launch
9. Earnings/Financial Results
10. Regulatory Change
11. Competitor Movement

### 7.5 Campaign Manager (`/campaigns`)
**Purpose:** MARIA's draft outreach queue + activity history.

**Features:**
- Draft queue: All campaign_activities with status='Drafted'
  - Each draft shows: contact name, campaign type, message preview, angle
  - Actions: Approve (→ Sent), Edit, Discard
- Activity history: All activities with filtering
  - Filter by: campaign_type, activity_status, date range
- Campaign funnel visualization: Sent → Opened → Replied → Meeting Booked
- New campaign creation: Select contacts → choose campaign type → draft message

### 7.6 Density Clusters (`/clusters`)
**Purpose:** PROBE's industry/geography cluster analysis.

**Features:**
- Cluster list with density_score, contact_count, status
- Cluster detail: member contacts, associated signals, recommended programs
- Manual cluster creation (for Phase 1 — PROBE would auto-generate later)

### 7.7 Programs (`/programs`)
**Purpose:** Engagement program catalog and enrollment management.

**Features:**
- Program list with type, tier, status, enrolled count
- Program detail: enrolled contacts, revenue attribution
- Enrollment: select contacts → assign to program

### 7.8 Strategy Hub (`/strategy`)
**Purpose:** CARL's strategic notes and ICP management.

**Features:**
- Strategic notes feed (chronological)
- Add note: type (Decision/Override/ICP Adjustment/Focus Shift/Review), description, optional contact link
- Weekly review view: aggregated metrics for strategy session

---

## 8. Agent Logic Implementation (Phase 1: Server-Side Functions)

### 8.1 LENS Scoring Engine
**Location:** `app/api/lens/score/route.ts`

**Trigger:** Manual (button click) or API call.

**Logic:**
```
For each contact in vista_contacts:
  1. stain_score (0-25): Based on stain_group density + business proposals
  2. cluster_score (0-25): Count of companies in same stain_group
  3. signal_score (0-25): Active signals in last 90 days, recency-weighted
  4. engagement_score (0-25): Raw engagement (0-100) / 4
  5. priority_score = sum of 4 sub-scores (0-100)
  6. engagement_tier = tier based on priority_score thresholds
  7. encirclement_level = max level across all contacts in same company
  8. decay_flag = last_engagement_date < 30 days ago
  9. Write score_delta if scores changed
```

**API Endpoint:**
```
POST /api/lens/score — Trigger full scoring pass
POST /api/lens/score/:contactId — Trigger single contact scoring
POST /api/lens/signal — Log a new signal
GET /api/lens/alerts — Get threshold crossing alerts
```

### 8.2 MARIA Campaign Engine
**Location:** `app/api/maria/draft/route.ts`

**Trigger:** Manual (from contact detail) or threshold-based.

**Logic:**
```
When triggered for a contact:
  1. Read contact's engagement_tier, encirclement_level, signals
  2. Select campaign_type based on tier:
     - Cold → Nurture
     - Warm → Ecosystem Invite
     - Engaged → Signal-triggered
     - Hot → Kevin Intro
  3. Generate conversation_angle based on recent signals
  4. Draft message_template (Phase 1: template with placeholders)
  5. Insert into campaign_activities with status='Drafted'
```

**API Endpoint:**
```
POST /api/maria/draft — Create draft outreach
POST /api/maria/draft/:contactId — Create draft for specific contact
PATCH /api/maria/activity/:id — Update activity status (approve/reject)
GET /api/maria/drafts — Get all pending drafts
GET /api/maria/activities — Get all activities (with filters)
```

### 8.3 PROBE Pipeline Engine
**Location:** `app/api/probe/route.ts`

**Trigger:** Manual refresh or dashboard load.

**Logic:**
```
1. Calculate density_clusters from vista_contacts grouping by (industry, region)
2. Calculate vista_v/i/s/t/a scores for contacts with sufficient data
3. Calculate vista_composite = weighted sum
4. Assign density_cluster_id to contacts
5. Recommend programs based on cluster status
```

**API Endpoint:**
```
POST /api/probe/refresh — Refresh all pipeline data
GET /api/probe/clusters — Get density clusters
GET /api/probe/pipeline — Get pipeline summary
POST /api/probe/program — Create/update program
POST /api/probe/assign — Assign contact to program
```

### 8.4 CARL Strategy Engine
**Location:** `app/api/carl/route.ts`

**Trigger:** Manual notes or threshold alerts.

**Logic:**
```
1. Monitor for threshold crossings (score ≥ 40/60/75)
2. Generate strategic notes for significant events
3. Prepare meeting briefs on demand
4. Cascade Kevin's directives to scoring parameters
```

**API Endpoint:**
```
POST /api/carl/note — Create strategic note
GET /api/carl/notes — Get all strategic notes
GET /api/carl/brief/:contactId — Generate meeting brief
GET /api/carl/review — Generate weekly review data
PATCH /api/carl/icp — Update ICP parameters
```

---

## 9. Supabase Query Patterns

### High-Frequency Queries (optimize with indexes)
```typescript
// Top 7 contacts
const { data } = await supabase.from('v_top_7').select('*')

// Pipeline summary
const { data } = await supabase.from('v_pipeline_summary').select('*')

// Contacts by tier
const { data } = await supabase
  .from('vista_contacts')
  .select('id, name, company, role, priority_score, engagement_tier, encirclement_level, score_delta')
  .eq('engagement_tier', tier)
  .order('priority_score', { ascending: false })

// Signals for contact
const { data } = await supabase
  .from('signals')
  .select('*')
  .eq('contact_id', contactId)
  .order('detected_date', { ascending: false })

// Draft campaigns
const { data } = await supabase
  .from('campaign_activities')
  .select('*, vista_contacts!campaign_contact_id(name, company)')
  .eq('activity_status', 'Drafted')
  .order('created_at', { ascending: false })

// Stale contacts (decay)
const { data } = await supabase
  .from('vista_contacts')
  .select('id, name, company, last_engagement_date, priority_score')
  .eq('decay_flag', true)
  .order('priority_score', { ascending: false })
  .limit(20)
```

---

## 10. Engineering Tasks — Build Order

### Wave 0: Project Setup (Priority: CRITICAL)
- [ ] `npx create-next-app@latest . --typescript --tailwind --app --eslint`
- [ ] Install deps: `@supabase/supabase-js`, `@supabase/ssr`, `shadcn/ui`, `recharts`, `@tanstack/react-table`, `zustand`, `zod`, `react-hook-form`
- [ ] Configure env vars in Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Create `lib/supabase/server.ts` and `lib/supabase/client.ts`
- [ ] Set up Tailwind theme (LYC brand colors: navy #1a2332, gold #c9a961, white)
- [ ] Create root layout with sidebar navigation

### Wave 1: Core Dashboard (Priority: HIGH)
- [ ] `/dashboard` page with 4 KPI cards + pipeline chart + top 7 table
- [ ] `PipelineSummary.tsx` — horizontal bar chart by engagement_tier
- [ ] `Top7Ranking.tsx` — compact sortable table
- [ ] `AlertFeed.tsx` — threshold crossings + decay flags
- [ ] `ScoreGauge.tsx` — circular gauge component
- [ ] `TierBadge.tsx` — colored engagement tier badge
- [ ] `EncirclementBadge.tsx` — encirclement level badge

### Wave 2: Contacts (Priority: HIGH)
- [ ] `/contacts` page with TanStack table
- [ ] Server-side pagination, sorting, filtering
- [ ] Search by name/company/role
- [ ] `/contacts/[id]` detail page
- [ ] `ScoreBreakdown.tsx` — 4-dimension bar
- [ ] `VistaScoreRadar.tsx` — 5-dimension radar chart
- [ ] `EngagementTimeline.tsx` — interaction history

### Wave 3: Signals (Priority: MEDIUM)
- [ ] `/signals` page with signal feed
- [ ] `ManualSignalForm.tsx` — signal entry form
- [ ] `SignalImpactCard.tsx` — score impact visualization
- [ ] `/api/lens/signal` endpoint

### Wave 4: Campaigns (Priority: MEDIUM)
- [ ] `/campaigns` page with draft queue
- [ ] `DraftManager.tsx` — approve/reject/edit drafts
- [ ] `MessagePreview.tsx` — message preview card
- [ ] `CampaignFunnel.tsx` — conversion funnel chart
- [ ] `/api/maria/draft` endpoint

### Wave 5: Clusters & Programs (Priority: LOW)
- [ ] `/clusters` page with cluster list
- [ ] `/programs` page with program catalog
- [ ] Enrollment management
- [ ] `/api/probe/refresh` endpoint

### Wave 6: Strategy (Priority: LOW)
- [ ] `/strategy` page with notes feed
- [ ] `NoteForm.tsx` — add/edit notes
- [ ] Weekly review view
- [ ] `/api/carl/note` endpoint

---

## 11. BLAST RADIUS & Constraints

### What this app does NOT do in Phase 1:
- ❌ No real-time signal detection (manual only)
- ❌ No LinkedIn API integration
- ❌ No automated email sending (draft mode only)
- ❌ No automated scoring (manual trigger only)
- ❌ No multi-user access (Kevin only)
- ❌ No mobile app (web responsive only)

### Dependencies:
- ✅ Supabase schema migration must be executed FIRST (see Section 4)
- ✅ Vercel env vars must be configured
- ✅ GitHub repo `vista` must be initialized with this codebase

### Performance Constraints:
- Supabase free tier: 500MB database, 2GB bandwidth/month
- Vercel Hobby plan: 100GB bandwidth/month, 10s serverless function timeout
- Keep queries under 1s, use pagination everywhere
- vista_contacts has 17,359 records — always paginate, never select all

---

## 12. Testing & Deployment

### Before pushing code:
1. `npm run build` — must pass with zero TypeScript errors
2. `npm run lint` — must pass with zero errors
3. Test all Supabase queries against the live database
4. Verify all pages render correctly at `/dashboard`, `/contacts`, etc.

### Deployment:
- Push to `main` branch → auto-deploy to `vista-azure-delta.vercel.app`
- No separate staging environment in Phase 1
- Vercel deployment is automatic on push to main

### Git workflow:
- Work on feature branch: `trae/vista-phase1`
- Push frequently (at least daily)
- PR to main when each Wave is complete

---

## 13. Design Reference

### Color Palette (LYC Brand)
- Primary Navy: `#1a2332`
- Accent Gold: `#c9a961`
- Background: `#f8f9fa` (light) / `#0f1419` (dark)
- Surface: `#ffffff` (light) / `#1a2332` (dark)
- Text: `#333333` (light) / `#e8e8e8` (dark)
- Success: `#22c55e` | Warning: `#eab308` | Error: `#ef4444` | Info: `#3b82f6`

### Engagement Tier Colors
- Cold: `#94a3b8` (slate)
- Warm: `#3b82f6` (blue)
- Engaged: `#22c55e` (green)
- Hot: `#f97316` (orange)
- Committed: `#ef4444` (red)

### Encirclement Level Colors
- Scout: `#94a3b8` (slate)
- Patrol: `#3b82f6` (blue)
- Encirclement: `#a855f7` (purple)
- Siege: `#f97316` (orange)
- Occupation: `#ef4444` (red)

---

*Document Version: 1.0 | Author: James/AI (PM) | Date: 2026-07-07*
*Dependency: BD_Agent_Schema_Migration.sql must be executed before Wave 0*
*Reference: BD_Agent_Specs_v2.md for full business requirements*
