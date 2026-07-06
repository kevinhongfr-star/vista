# BD Agent Architecture — Business Specifications v2.0
### LYC Partners | 2026-07-06 | Author: CARL/AI | Reconciled by: James/AI

---

## v2.0 Change Log (2026-07-06, James/AI)

| Change | Rationale |
|---|---|
| Main contact table changed from `campaign_contacts` → `vista_contacts` | Kevin decision: vista_contacts (17,359 records) is main BD table. campaign_contacts (4,310 records) retained but not used by BD Agents |
| Schema section rewritten: ALTER TABLE vista_contacts | vista_contacts already has scoring columns; 11 new columns added |
| signals table: added BD-specific columns (signal_type, signal_strength, etc.) | Existing signals table had different structure; BD columns added alongside |
| campaign_activities: added MARIA-specific columns | Existing table had basic columns; 7 columns added for campaign execution |
| `revenue_potial` typo fixed → `revenue_potential` | Spec DDL correction |
| FK references updated to `vista_contacts(id)` | program_assignments, strategic_notes now reference vista_contacts |
| Views updated to query `vista_contacts` | v_top_7, v_pipeline_summary, v_encirclement reference vista_contacts |
| Data migration section added | Existing scores reset; LENS will recalculate with new rules |
| LinkedIn Jobs API: NOT AVAILABLE | Phase 1 semi-auto: manual signal input + Google News RSS |
| Phase 1 execution mode: Semi-auto (Draft mode for all agents) | Kevin decision |
| `bd_*` tables retained but not used | Kevin decision: retain until further notice |

---

## Architecture Overview

```
                    ┌─────────────┐
                    │   CARL/AI   │
                    │ Orchestrator│
                    │ & Strategy  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │   LENS   │ │  MARIA   │ │  PROBE   │
        │ Signals  │ │ Outreach │ │ Pipeline │
        │ & Scoring│ │ & Campaign││ & Dashboard│
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
             └────────────┼────────────┘
                          ▼
                  ┌──────────────┐
                  │   Supabase   │
                  │  (Live Data) │
                  │              │
                  │ Main Table:  │
                  │ vista_contacts│
                  └──────┬───────┘
                          ▼
                  ┌──────────────┐
                  │ Live Dashboard│
                  │  (HTML+JS)   │
                  └──────────────┘
```

### Two Scoring Models (Coexist, No Conflict)

| Model | Dimensions | Purpose | Owner Agent |
|---|---|---|---|
| **Priority Score (0–100)** | Stain (25) + Cluster (25) + Signal (25) + Engagement (25) | BD prioritization: who to reach, when, how | LENS |
| **VISTA Score (0–100)** | Vision (20%) + Intelligence (20%) + Signal (25%) + Trust (20%) + Action (15%) | Program qualification: which engagement program fits | PROBE |

### Data Flow

```
LENS  → writes to: vista_contacts (stain_score, cluster_score, signal_score, engagement_score, priority_score, engagement_tier, encirclement_level, score_delta, last_score_update, last_engagement_date, decay_flag)
      → writes to: signals (new signal records)
MARIA → writes to: campaign_activities (sent, opened, replied, meeting booked)
PROBE → writes to: vista_contacts (vista_v, vista_i, vista_s, vista_t, vista_a, vista_composite, density_cluster_id)
      → writes to: density_clusters, programs, program_assignments
CARL  → reads: all tables; writes: strategic_notes; briefings via Feishu
```

---
---

# AGENT 1: LENS — Signal Detection & Priority Scoring

## Domain
Real-time signal detection, priority score calculation, engagement tier management, and encirclement level tracking.

## Mission
Ensure every contact in `vista_contacts` has an up-to-date Priority Score reflecting the latest market reality. Detect signals before competitors do. Flag threshold crossings immediately.

## Inputs

| Source | What LENS Extracts | Frequency |
|---|---|---|
| Google News RSS / industry feeds | M&A, expansion, leadership changes, funding | Semi-auto (Phase 1) |
| Company announcements | Press releases, earnings calls, org changes | Semi-auto (Phase 1) |
| Notion METRIX DB | Existing relationship data, conversation counts | On-demand |
| Supabase `vista_contacts` | Current scores, last engagement dates | Daily |
| Kevin's conversation logs | Meeting notes, interaction updates | After each interaction |
| **LinkedIn Jobs API** | **❌ NOT AVAILABLE in Phase 1** | **Manual input only** |

## Outputs (Written to Supabase `vista_contacts`)

| Field | Type | Description |
|---|---|---|
| `stain_score` (0–25) | INTEGER | LYC's industry footprint strength |
| `cluster_score` (0–25) | INTEGER | Industry expandability |
| `signal_score` (0–25) | INTEGER | Account-level market activity |
| `engagement_score` (0–25) | INTEGER | Contact relationship depth |
| `priority_score` (0–100) | INTEGER | Sum of 4 sub-scores |
| `engagement_tier` | TEXT | Cold/Warm/Engaged/Hot/Committed |
| `encirclement_level` | TEXT | Scout/Patrol/Encirclement/Siege/Occupation (per account) |
| `score_delta` | TEXT | Change from previous score (e.g., "+12 Signal: new CHRO") |
| `last_score_update` | TIMESTAMPTZ | Timestamp of last recalculation |
| `last_engagement_date` | DATE | Last meaningful interaction date |
| `decay_flag` | BOOLEAN | TRUE if 30+ days no engagement |
| New record in `signals` | — | Each detected signal logged |

## Scoring Calculation Rules

### Stain Score (0–25) — Weekly recalculation
Based on SCORING_FRAMEWORK.md §2.1 rubric:
- 0: No LYC presence in this industry
- 5: One peripheral contact, no revenue
- 10: One account with engagement, no closed deal
- 15: One closed deal or active mandate
- 20: 2–3 accounts in same stain, ≥1 closed deal
- 25: 3+ accounts with revenue + champion referral

**Data source:** `vista_contacts` grouped by `stain_group` + Business Proposals in Notion

### Cluster Score (0–25) — Monthly recalculation
Based on SCORING_FRAMEWORK.md §2.2 rubric:
- 0: Isolated company, no peer network
- 5: Small cluster (3–5 companies)
- 10: Moderate cluster (6–15 companies)
- 15: Good cluster (15–30 companies)
- 20: Large cluster (30–50 companies)
- 25: Massive cluster (50+ companies)

**Data source:** Count of companies in same Stain Group + Kevin's network density

### Signal Score (0–25) — Real-time recalculation
Based on SCORING_FRAMEWORK.md §2.3 rubric + §7 Signal Type Examples:
- 0: No signals
- 5: Minor signal (routine hiring)
- 10: Moderate signal (CHRO change, expansion)
- 15: Strong signal (M&A, restructuring)
- 20: Trigger event (active mandate, budget allocated)
- 25: Multiple simultaneous triggers (3+ signals in 30 days)

**Recency weighting:** This week = full score. 30 days ago = 60%. 6 months ago = 20%.

### Engagement Score (0–25) — After every interaction
Based on SCORING_FRAMEWORK.md §2.4 formula:
- Raw score (0–100) from: LinkedIn Connection (10) + Message Exchanges (20) + Meetings (25) + Content Interaction (15) + Referral Behavior (15) + Response to Outreach (15)
- **Divide by 4 → 0–25 scale**

**Data source:** Notion METRIX conversation counts + LinkedIn activity + email interaction data

## Engagement Tier Assignment

| Tier | Score Range | Rule |
|---|---|---|
| Cold | 0–20 | Automated content seeding only |
| Warm | 20–40 | Nurture sequences, event invitations |
| Engaged | 40–60 | Ecosystem invitation (Council, Roundtable, Workshop) |
| Hot | 60–80 | Kevin personal outreach, meeting request |
| Committed | 80–100 | Active deal pursuit, proposal drafting |

**Hard rules enforced by LENS:**
- No pitch until Engagement Tier ≥ Engaged (40+)
- No exec search pitch until Engagement Tier ≥ Hot (60+)
- Flag immediately when a contact crosses 40, 60, or 75

## Encirclement Level (per account/company, not per contact)

| Level | Criteria |
|---|---|
| Scout | 1 contact at any engagement level |
| Patrol | 2+ contacts known at same company |
| Encirclement | 2+ contacts at Engagement 30+ each |
| Siege | Decision-maker at 45+ AND 2+ influencers at 30+ |
| Occupation | Deal closed (Business Proposal signed) |

**Calculation:** Group `vista_contacts` by `company` → count contacts → check engagement scores → identify decision-makers.

## Schedule

| Trigger | Action |
|---|---|
| **Semi-auto** | New signal detected → recalculate Signal Score → check threshold crossings → notify CARL if score crossed 40/60/75 |
| **Weekly (Monday 07:00)** | Full scoring pass: recalculate all 4 sub-scores for all active contacts → update Supabase |
| **Weekly (Monday 08:00)** | Generate LENS Digest: all score movements, new threshold crossings, tier changes → push to CARL + PROBE |
| **Monthly (1st)** | Recalculate all Cluster Scores (industry structure changes slowly) |

## Notifications to Other Agents

| Event | Notify |
|---|---|
| Signal Score crosses threshold (→10, →15, →20, →25) | CARL + MARIA |
| Priority Score crosses 40/60/75 | CARL + MARIA |
| Engagement Tier changes (any direction) | CARL + MARIA + PROBE |
| New signal detected (high strength) | CARL |
| Decay flag triggered (30+ days no engagement) | MARIA (suggest re-engagement) |
| Weekly digest complete | PROBE (update dashboard) |

## ICP Exclusion Check (SCORING_FRAMEWORK.md §8)
Before scoring any new contact, LENS checks against exclusion list:
- AI-native / tech-first companies → SKIP
- Recruitment / HR tech firms → SKIP
- No APAC/China presence → SKIP
- Pre-Series A startups (<50 employees) → SKIP
- Sectors LYC doesn't cover → SKIP

---
---

# AGENT 2: MARIA — Outreach & Campaign Execution

## Domain
Campaign selection, message drafting, outreach execution, and activity logging. MARIA is the execution arm — she turns LENS's scoring into actual human contact.

## Mission
Ensure every contact who qualifies for outreach receives the right message, through the right channel, at the right time. Log every interaction. Never let a qualified contact go cold due to inaction.

## Inputs

| Source | What MARIA Reads | Trigger |
|---|---|---|
| LENS scoring output | Priority Score, Engagement Tier, Signal Score | After each LENS update |
| SCORING_FRAMEWORK.md §9 | 9-stage decision flow (Stages 5–9) | Every outreach decision |
| Supabase `vista_contacts` | Contact details, company, role, channel availability | Per contact |
| Supabase `signals` | Active signals for this contact | Per outreach |
| Service catalog | Exec Search / Talent Mapping / AI Advisory / China Advisory / Workshops | Per routing |
| Notion METRIX | Conversation history, past touches | Before drafting |
| Supabase `campaign_activities` | Previous outreach log (avoid duplicates) | Before sending |

## Outputs (Written to Supabase `campaign_activities`)

| Field | Column | Description |
|---|---|---|
| `activity_type` | `activity_type` | Email / LinkedIn / Call / Event Invite / Content |
| `activity_status` | `activity_status` | Drafted / Sent / Opened / Replied / Meeting Booked / No Response |
| `contact_id` | `campaign_contact_id` | FK to vista_contacts |
| `campaign_type` | `campaign_type` | Signal-triggered / Nurture / Ecosystem Invite / Kevin Intro / Re-engagement |
| `service_route` | `service_route` | Which service this outreach maps to |
| `message_template` | `message_template` | Which template was used |
| `message_content` | `body` | Full drafted/sent message |
| `conversation_angle` | `conversation_angle` | The strategic angle for this outreach |
| `next_action` | `next_action` | What should happen next + suggested date |
| `sent_date` | `sent_date` | When outreach was sent |
| `response_date` | `response_date` | When response received (if any) |

## Core Logic: 9-Stage Execution Flow (Stages 5–9)

MARIA executes Stages 5–9 of the decision flow (LENS handles Stages 1–4):

### Stage 5: Business Need Classification
Based on signals + contact role:
| Need Category | Signals That Trigger It |
|---|---|
| Leadership Hiring | Executive Departure, New Role Created, Succession Need |
| Market Expansion | Market Expansion, M&A Activity, Funding |
| Digital/AI Transformation | Digital/AI Transformation, Rapid Hiring |
| Talent Intelligence | Competitor Loss, Budget Cycle |
| Relationship Maintenance | No active signal but Engagement Tier ≥ Warm |

### Stage 6: Service Routing
| Need Category | Primary Service | Secondary Service |
|---|---|---|
| Leadership Hiring | Executive Search | Talent Mapping |
| Market Expansion | Talent Mapping | China Advisory |
| Digital/AI Transformation | AI Advisory / Workshops | Executive Search |
| Talent Intelligence | Talent Mapping | Workshops |
| Relationship Maintenance | Workshops / Events | Newsletter |

**Hard rules:**
- Priority Score < 40 → No service pitch. Nurture only.
- Priority Score 40–59 → Ecosystem invitation only (Workshops, Events). No exec search pitch.
- Priority Score ≥ 60 → Full service pitch permitted.

### Stage 7: Campaign Type Selection
| Campaign Type | When Used | Channel |
|---|---|---|
| Signal-triggered | New high-strength signal detected | LinkedIn message or email (reference the signal) |
| Nurture | Engagement Tier = Warm, no active signal | Email (ecosystem content) |
| Ecosystem Invite | Engagement Tier = Engaged, qualifies for Roundtable/Council | Email (formal invitation) |
| Kevin Intro | Engagement Tier = Hot+, Kevin's personal outreach | Email or LinkedIn (from Kevin's account) |
| Re-engagement | Decay flag = TRUE (30+ days no contact) | LinkedIn or email (warm, personal) |

### Stage 8: Message Drafting
Each message follows this structure:
1. **Personal hook** — Reference their specific signal or recent activity
2. **Value proposition** — What LYC brings (market intel, comp data, peer insight)
3. **Soft ask** — Not a pitch. A conversation starter.
4. **Tone** — Peer-to-peer, not vendor-to-prospect

**Message templates by campaign type:**
- Signal-triggered: "I noticed [signal]. Here's what we're seeing in [industry]..."
- Nurture: "Thought you'd find this [content] relevant given [context]..."
- Ecosystem Invite: "We're hosting a [event type] for [peer group] on [topic]..."
- Kevin Intro: "[Mutual context]. I'd like to discuss [specific topic]..."
- Re-engagement: "It's been a while since we connected. [Recent development] reminded me of you..."

### Stage 9: Next Best Action
After each outreach, MARIA determines:
| Outcome | Next Action | Timeline |
|---|---|---|
| No response (3 days) | Re-engage via different channel | Day 3–5 |
| No response (7 days) | Final nurture touch | Day 7–10 |
| No response (14 days) | Move to long-term nurture | Monthly check-in |
| Positive reply | Schedule meeting / send materials | Within 24h |
| Meeting completed | Log outcome → LENS recalculates Engagement Score | Same day |
| Rejected | Respect → schedule re-engagement in 90 days | 90 days |

## Outreach Cadence Rules

| Engagement Tier | Max Touches/Month | Channel Preference | Content Type |
|---|---|---|---|
| Cold | 0 (content seeding only) | Newsletter | Automated |
| Warm | 2 | Email | Ecosystem content, event invites |
| Engaged | 3 | Email + LinkedIn | Roundtable, Workshop, podcast invite |
| Hot | 4 | LinkedIn + Email + Call | Kevin personal outreach, meeting requests |
| Committed | Ongoing | All channels | Active deal management |

**Anti-spam rule:** Max 2 outreach messages per contact per week across all channels.

## Execution Mode

| Mode | Description | Authorization |
|---|---|---|
| **Draft** | MARIA prepares message, Kevin reviews before send | **Phase 1 default for ALL tiers** |
| Semi-auto | MARIA drafts + sends, Kevin notified after | For Engaged tier, template-based (Phase 2) |
| Auto | MARIA sends without review | For Warm tier, nurture sequences only (Phase 2) |

**Phase 1: Draft mode only. Kevin must explicitly authorize each outreach.**

## Schedule

| Trigger | Action |
|---|---|
| LENS score update (threshold crossing) | Check if contact now qualifies for outreach → draft message |
| New signal detected (high strength) | Draft signal-triggered outreach within 48h |
| Decay flag triggered | Draft re-engagement message |
| Daily (09:00) | Review all pending drafts → send approved messages → log activities |
| Weekly (Friday 16:00) | Generate weekly outreach report: sent, opened, replied, conversion rate |
| After each meeting | Log outcome → trigger LENS Engagement Score recalculation |

## Notifications to Other Agents

| Event | Notify |
|---|---|
| Outreach sent | PROBE (update activity feed) |
| Reply received | LENS (recalculate Engagement Score) + CARL |
| Meeting booked | LENS + PROBE + CARL |
| Outreach rejected | LENS (adjust Engagement Score) |
| Weekly outreach report | CARL + PROBE |

---
---

# AGENT 3: PROBE — Pipeline Visibility & Dashboard

## Domain
Dashboard maintenance, pipeline tracking, program qualification (VISTA scoring), density clustering, and reporting. PROBE makes the entire BD operation visible and measurable.

## Mission
Maintain a live, accurate dashboard that shows Kevin exactly where the pipeline stands — scores, activities, programs, conversions, and risks. No blind spots.

## Inputs

| Source | What PROBE Reads | Frequency |
|---|---|---|
| Supabase `vista_contacts` (LENS writes) | Priority Scores, sub-scores, engagement tiers, encirclement levels | Real-time |
| Supabase `campaign_activities` (MARIA writes) | Outreach activities, responses, meeting outcomes | Real-time |
| Supabase `signals` (LENS writes) | Detected signals with types and dates | Real-time |
| Notion METRIX DB | Conversation history, relationship context | Weekly |
| VISTA Activation Engine spec | Program qualification rules, density clustering formula | Static reference |

## Outputs (Written to Supabase)

### Written to `vista_contacts`:

| Field | Column | Description |
|---|---|---|
| `vista_v` (0–100) | `vista_v` | Vision: strategic alignment with LYC ICP |
| `vista_i` (0–100) | `vista_i` | Intelligence: data richness, engagement history |
| `vista_s` (0–100) | `vista_s` | Signal: active market signals (maps to LENS Signal Score) |
| `vista_t` (0–100) | `vista_t` | Trust: relationship depth, mutual connections |
| `vista_a` (0–100) | `vista_a` | Action: urgency, timing, conversion probability |
| `vista_composite` (0–100) | `vista_composite` | Weighted composite: V(20%)+I(20%)+S(25%)+T(20%)+A(15%) |
| `density_cluster_id` | `density_cluster_id` | FK to density_clusters |

### Written to new tables:

| Field | Table | Description |
|---|---|---|
| `cluster_id` | `density_clusters` | UUID |
| `industry` | `density_clusters` | Industry category |
| `geography` | `density_clusters` | Geographic region |
| `density_score` | `density_clusters` | Calculated density per VISTA spec §3.2 |
| `status` | `density_clusters` | Watch (<80) / Emerging (80–149) / Active (≥150) |
| `recommended_programs` | `density_clusters` | Array of program IDs matched to cluster |
| `program_id` | `programs` | UUID |
| `type` | `programs` | Webinar/Podcast/Newsletter/Roundtable/1:1/Advisory/MarketInsights |
| `tier` | `programs` | Free / Paid |
| `status` | `programs` | Planned / Inviting / Active / Completed |
| `assignment_id` | `program_assignments` | UUID |
| `contact_id` | `program_assignments` | FK to vista_contacts |
| `status` | `program_assignments` | Invited / Registered / Attended / Converted / Churned |

## VISTA Scoring Rules (from VISTA Activation Engine Spec)

### Vision (20%) — Strategic Alignment
How well does this contact's company align with LYC's practice areas and ICP?
- Source: Stain Group match, ICP fit assessment, industry relevance
- Proxy: LENS Stain Score × 4 (0–100 scale)

### Intelligence (20%) — Data Richness
How much do we know about this contact? How responsive have they been?
- Source: Conversation count in METRIX, email opens, LinkedIn engagement, data completeness
- Proxy: LENS Engagement Score raw components × scaling factor

### Signal (25%) — Market Activity
Same as LENS Signal Score, scaled to 0–100:
- Proxy: LENS Signal Score × 4

### Trust (20%) — Relationship Depth
How deep is the relationship? Referrals, meetings, mutual connections:
- Source: METRIX conversation depth, meeting count, referral behavior
- Proxy: LENS Engagement sub-components (Meetings + Referral + Response) × scaling

### Action (15%) — Urgency & Timing
How urgent is this opportunity? Signal recency, budget cycle, competitive pressure:
- Source: Signal recency, Engagement Tier trajectory (improving = higher Action)
- Proxy: Signal recency weight × Engagement Tier momentum

## Density Clustering (from VISTA spec §3.2)

```
Density = (Σ Signal Count × Signal Weight) + (Σ Contact VISTA Score) + Network Effect Multiplier
```

Signal Weights: Hiring (1.0), Leadership (1.2), Expansion (1.5), Market (0.8), Personal (0.6)
Network Effect: +20% if 3+ contacts in same cluster are mutually connected

Thresholds:
- **Active Cluster**: Density ≥ 150 → Eligible for paid programs
- **Emerging Cluster**: Density 80–149 → Free programs only
- **Watch Cluster**: Density < 80 → Monitor only

## Program Matching (from VISTA spec §6.1)

| Program | Min VISTA | Min Trust | Seniority | Signal Requirement |
|---|---|---|---|---|
| Newsletter | Any | Any | Any | None |
| Webinar | ≥ 30 | Any | Any | Any active signal |
| Podcast | ≥ 50 | ≥ 40 | VP+ | Leadership or Market |
| Roundtable | ≥ 60 | ≥ 50 | C-Suite/VP | Expansion or Hiring |
| 1:1 Coaching | ≥ 70 | ≥ 60 | C-Suite | Any active signal |
| Advisory | ≥ 80 | ≥ 70 | C-Suite/Board | Multiple signal types |
| Market Insights | ≥ 55 | ≥ 45 | VP+ | Expansion dominant |

## Dashboard Tabs & Live Data Mapping

| Tab | Data Source | Key Metrics |
|---|---|---|
| **Command** | `vista_contacts` + `signals` + `campaign_activities` | KPIs: Total contacts, Active signals, Hot contacts, Pipeline value, Conversion rate, Revenue |
| **Signal Map** | `vista_contacts` grouped by industry × geography | Heatmap with avg Priority Score per cell + contact count |
| **Action Queue** | `vista_contacts` WHERE engagement_tier ≥ Engaged + active signals | Top opportunities with Priority Score, signal tags, conversation angles |
| **Pipeline** | `campaign_activities` + `program_assignments` | Outreach funnel: Drafted → Sent → Opened → Replied → Meeting → Deal |
| **Signal Log** | `signals` table | Chronological feed of all detected signals with impact scores |
| **Activation** | `density_clusters` + `programs` + `program_assignments` | Density map, program board (Kanban), conversion funnel, ROI summary |
| **Agent Health** | All agent activity logs | LENS scoring accuracy, MARIA outreach conversion, PROBE data freshness |

## Reports Generated

| Report | Schedule | Recipients | Content |
|---|---|---|---|
| **Daily Dashboard Snapshot** | Daily 08:00 | CARL | Key metrics, score movements, new signals, decay alerts |
| **Weekly Pipeline Report** | Friday 15:00 | Kevin + CARL | Top 7 contacts, pipeline value, outreach conversion, program status |
| **Weekly Top 7 Ranking** | Friday 15:00 | Kevin | Top 7 contacts by Priority Score + signal strength + recommended action |
| **Stale Contact Alert** | Daily 08:00 | MARIA | Contacts with 30+ days no engagement + suggested re-engagement approach |
| **Monthly Program ROI** | 1st of month 09:00 | Kevin | Program revenue vs. cost, conversion rates, CLV by entry point |

## Schedule

| Trigger | Action |
|---|---|
| LENS writes new scores | Recalculate affected density clusters → update program recommendations |
| MARIA writes new activity | Update pipeline funnel → refresh dashboard |
| Daily 08:00 | Generate daily snapshot → push to CARL |
| Friday 15:00 | Generate weekly pipeline report + Top 7 → push to Kevin |
| 1st of month | Recalculate all density clusters from scratch |
| 1st of month | Generate monthly program ROI report |

---
---

# AGENT 4: CARL — Orchestration & Strategy

## Domain
Cross-agent coordination, strategic oversight, Kevin briefing generation, and system-level decision making. CARL is the command layer — it sees the full picture and ensures the other agents work together coherently.

## Mission
Keep the BD engine running at optimal efficiency. Surface what matters to Kevin. Make strategic calls that no single agent can make alone.

## Inputs

| Source | What CARL Reads | Frequency |
|---|---|---|
| LENS scoring output + digests | Score movements, threshold crossings, signal alerts | Real-time + weekly |
| MARIA outreach reports | Sent/opened/replied/meeting rates, pipeline progression | Daily + weekly |
| PROBE dashboard + reports | Pipeline status, density clusters, program status, ROI | Daily + weekly |
| SCORING_FRAMEWORK.md | All scoring rules, engagement tier rules, encirclement rules | Static reference |
| VISTA Activation Engine spec | Program qualification rules, conversion targets | Static reference |
| Notion METRIX / Task Tracker | Kevin's calendar, meeting schedule, task status | Real-time |
| Kevin's direct input | Strategic pivots, priority changes, relationship context | Ad-hoc |

## Outputs

| Output | Target | Description |
|---|---|---|
| **Kevin Briefing Card** | Kevin (via Feishu) | Pre-meeting one-pager: contact scores, signal history, relationship status, recommended angle |
| **Weekly Strategy Review** | Kevin | 30-min agenda: scores, priorities, pipeline health, next week focus |
| **Agent Task Assignment** | LENS / MARIA / PROBE | Redirect agent focus based on strategic priorities |
| **Stain Map Update** | LENS + PROBE | When new accounts/deals emerge, update Stain Group assignments |
| **ICP Adjustment** | LENS | When strategic direction changes, adjust ICP parameters |
| **Threshold Override** | LENS + MARIA | Exception: allow outreach to contact below threshold (with documented reason) |
| **Strategic Note** | Supabase `strategic_notes` | Record strategic decisions for future reference |

## Orchestration Rules

### Rule 1: LENS → MARIA Handoff
When LENS flags a threshold crossing (score crosses 40/60/75):
1. CARL receives the alert
2. CARL checks: Is this contact already in an active outreach campaign? (Check MARIA's activity log)
3. If NOT → instruct MARIA to prepare outreach (draft mode)
4. If YES → instruct MARIA to adjust messaging based on new score
5. If score dropped → instruct MARIA to pause outreach, reassess

### Rule 2: MARIA → LENS Feedback Loop
When MARIA reports a meeting outcome:
1. CARL receives the outcome
2. CARL instructs LENS to recalculate Engagement Score
3. If meeting was positive → check if contact qualifies for higher program (instruct PROBE)
4. If meeting was negative → check if Engagement Tier dropped → adjust outreach cadence

### Rule 3: PROBE → CARL Escalation
When PROBE detects pipeline risk:
1. Stale contacts > 20% of active pipeline → alert CARL
2. Conversion rate dropping below 15% → alert CARL
3. Density cluster going from Active → Emerging → alert CARL
4. CARL decides: instruct MARIA to re-engage, or accept the decay

### Rule 4: Kevin's Calendar Protection
- Max 5–6 meetings per week (hard cap from SOUL.md)
- Kevin only meets when his presence is the differentiator (Engagement Tier ≥ Hot)
- CARL reviews Kevin's calendar weekly and blocks/unblocks time for BD meetings
- If too many meeting requests → CARL prioritizes by Priority Score

### Rule 5: Strategic Override
CARL can override agent defaults when Kevin provides strategic direction:
- "Focus on Japan market this month" → CARL instructs LENS to prioritize Japan contacts, MARIA to prepare Japan-focused outreach
- "Pause outreach to [company]" → CARL instructs MARIA to hold all pending messages
- "Fast-track [contact]" → CARL overrides threshold rules for specific contact

## Kevin Briefing Card Format

Generated before every meeting Kevin has with a contact:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEETING BRIEF: [Contact Name]
[Role] · [Company] · [Date/Time]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES
  Priority Score: XX/100 (↑/↓ X from last week)
  ├── Stain: XX/25
  ├── Cluster: XX/25
  ├── Signal: XX/25
  └── Engagement: XX/25

  VISTA Score: XX/100
  Program Qualification: [Eligible Programs]

STATUS
  Engagement Tier: [Cold/Warm/Engaged/Hot/Committed]
  Encirclement Level: [Scout/Patrol/Encirclement/Siege/Occupation]
  Active Signals: [List with dates]
  Last Interaction: [Date + summary]
  Outreach History: [X touches, last Y days ago]

CONTEXT
  Key Conversation Points: [From METRIX]
  Mutual Connections: [Names]
  Recent Company News: [From signals]

RECOMMENDED ANGLE
  [One paragraph: what to open with, what to discuss, what to ask for]

RISK
  [What could go wrong. What to avoid. What the contact cares about.]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Schedule

| Trigger | Action |
|---|---|
| Threshold crossing alert from LENS | Review context → instruct MARIA → notify Kevin if ≥75 |
| Before each Kevin meeting | Generate Briefing Card → push to Kevin via Feishu |
| Daily 09:00 | Review daily snapshot from PROBE → flag issues |
| Weekly (Thursday 17:00) | Prepare Weekly Strategy Review agenda → push to Kevin |
| Weekly (Friday 15:00) | Conduct Weekly Strategy Review (with Kevin) |
| Monthly (1st) | Review program ROI from PROBE → recommend adjustments |
| Ad-hoc | Process Kevin's strategic directives → cascade to agents |

## Agent Performance Monitoring

CARL tracks:
| Metric | Source | Target |
|---|---|---|
| Scoring accuracy (LENS) | Do threshold crossings lead to successful outcomes? | >70% of Hot contacts → meeting |
| Outreach conversion (MARIA) | Sent → Opened → Replied → Meeting rate | >25% sent → opened, >10% opened → replied |
| Dashboard freshness (PROBE) | Time since last data update | <24h lag |
| Pipeline velocity | Days from first touch → meeting | <30 days for Hot contacts |
| Signal-to-outreach speed | Hours from signal detection → outreach sent | <48h for high-strength signals |

---
---

# Supabase Schema Changes (v2.0 — Reconciled)

## Table Architecture

```
Main contact table: vista_contacts (17,359 records)
├── Existing scoring columns (stain_score, cluster_score, etc.) — updated in place
├── New LENS metadata columns (score_delta, last_score_update, etc.) — added
├── New VISTA columns (vista_v/i/s/t/a/composite) — added
└── density_cluster_id FK → density_clusters

Supporting tables:
├── signals (existing, BD columns added)
├── campaign_activities (existing, MARIA columns added)
├── density_clusters (NEW)
├── programs (NEW)
├── program_assignments (NEW, FK → vista_contacts)
└── strategic_notes (NEW, FK → vista_contacts)

Retained but NOT used by BD Agents:
├── campaign_contacts (4,310 records)
├── bd_activities, bd_opportunities, bd_pipeline_metrics, bd_proposals
└── All retained until further notice per Kevin decision
```

## 1. ALTER TABLE vista_contacts — New Columns

```sql
-- LENS metadata
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS score_delta TEXT;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_score_update TIMESTAMPTZ;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_engagement_date DATE;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS decay_flag BOOLEAN DEFAULT FALSE;

-- VISTA 5-dimension scores (PROBE writes)
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_v INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_i INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_s INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_t INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_a INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_composite INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS density_cluster_id UUID;
```

## 2. ALTER TABLE signals — BD-Specific Columns

```sql
ALTER TABLE signals ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_type TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_strength TEXT CHECK (signal_strength IS NULL OR signal_strength IN ('Low','Medium','Medium-High','High'));
ALTER TABLE signals ADD COLUMN IF NOT EXISTS detected_date DATE;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS recency_weight DECIMAL DEFAULT 1.0;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS score_impact INTEGER DEFAULT 0;
```

## 3. ALTER TABLE campaign_activities — MARIA Columns

```sql
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS campaign_type TEXT CHECK (campaign_type IS NULL OR campaign_type IN ('Signal-triggered','Nurture','Ecosystem Invite','Kevin Intro','Re-engagement'));
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS service_route TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS message_template TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS conversation_angle TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS activity_status TEXT CHECK (activity_status IS NULL OR activity_status IN ('Drafted','Sent','Opened','Replied','Meeting Booked','No Response'));
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS sent_date TIMESTAMPTZ;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS response_date TIMESTAMPTZ;
```

## 4. New Table: density_clusters

```sql
CREATE TABLE IF NOT EXISTS density_clusters (
    cluster_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry TEXT NOT NULL,
    geography TEXT NOT NULL,
    density_score DECIMAL DEFAULT 0,
    status TEXT CHECK (status IN ('Watch','Emerging','Active')),
    contact_count INTEGER DEFAULT 0,
    signal_types TEXT[],
    recommended_programs UUID[],
    revenue_potential DECIMAL DEFAULT 0,
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(industry, geography)
);
```

## 5. New Table: programs

```sql
CREATE TABLE IF NOT EXISTS programs (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('Webinar','Podcast','Newsletter','Roundtable','1:1 Coaching','Advisory','Market Insights')),
    tier TEXT CHECK (tier IN ('Free','Paid')),
    name TEXT NOT NULL,
    description TEXT,
    cluster_id UUID REFERENCES density_clusters(cluster_id),
    capacity INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    price DECIMAL DEFAULT 0,
    status TEXT CHECK (status IN ('Planned','Inviting','Active','Completed')),
    start_date DATE,
    end_date DATE,
    revenue_actual DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 6. New Table: program_assignments

```sql
CREATE TABLE IF NOT EXISTS program_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    program_id UUID REFERENCES programs(program_id),
    status TEXT CHECK (status IN ('Invited','Registered','Attended','Converted','Churned')),
    assigned_date DATE DEFAULT CURRENT_DATE,
    conversion_date DATE,
    revenue_attributed DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 7. New Table: strategic_notes

```sql
CREATE TABLE IF NOT EXISTS strategic_notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_type TEXT CHECK (note_type IN ('Decision','Override','ICP Adjustment','Focus Shift','Review')),
    description TEXT,
    author TEXT DEFAULT 'CARL',
    contact_id UUID REFERENCES vista_contacts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 8. Views for Dashboard

```sql
-- Top 7 weekly ranking
CREATE OR REPLACE VIEW v_top_7 AS
SELECT id, name, company, role, seniority,
       stain_score, cluster_score, signal_score, engagement_score, priority_score,
       engagement_tier, encirclement_level, score_delta,
       vista_composite, last_engagement_date, decay_flag,
       stain_group, region, country
FROM vista_contacts
WHERE priority_score >= 40
ORDER BY priority_score DESC, signal_score DESC
LIMIT 7;

-- Pipeline summary
CREATE OR REPLACE VIEW v_pipeline_summary AS
SELECT 
    engagement_tier,
    COUNT(*) as contact_count,
    ROUND(AVG(priority_score)) as avg_score,
    COUNT(CASE WHEN decay_flag THEN 1 END) as stale_count
FROM vista_contacts
GROUP BY engagement_tier
ORDER BY MIN(priority_score);

-- Encirclement status by account
CREATE OR REPLACE VIEW v_encirclement AS
SELECT 
    company,
    COUNT(*) as contact_count,
    MAX(encirclement_level) as encirclement_level,
    ROUND(AVG(engagement_score)) as avg_engagement,
    ROUND(AVG(priority_score)) as avg_priority,
    ARRAY_AGG(name) as contacts
FROM vista_contacts
WHERE company IS NOT NULL
GROUP BY company
ORDER BY contact_count DESC;

-- Outreach activity summary (last 30 days)
CREATE OR REPLACE VIEW v_outreach_activity AS
SELECT 
    activity_type,
    COALESCE(activity_status, outcome) as activity_status,
    COUNT(*) as count,
    DATE_TRUNC('week', COALESCE(sent_date, activity_date)) as week
FROM campaign_activities
WHERE COALESCE(sent_date, activity_date) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY activity_type, COALESCE(activity_status, outcome), week
ORDER BY week DESC;
```

## 9. Data Migration (Post-Schema)

```sql
-- Reset all existing scores to 0 (LENS will recalculate with new rules)
UPDATE vista_contacts SET
    stain_score = 0, cluster_score = 0, signal_score = 0,
    engagement_score = 0, priority_score = 0,
    score_delta = NULL, last_score_update = NOW(), decay_flag = FALSE;

-- Reset engagement_tier and encirclement_level
UPDATE vista_contacts SET engagement_tier = 'Cold', encirclement_level = 'Scout';

-- Populate last_engagement_date from existing last_touch_date
UPDATE vista_contacts SET last_engagement_date = last_touch_date::DATE
WHERE last_touch_date IS NOT NULL AND last_touch_date != '';

-- Flag stale contacts
UPDATE vista_contacts SET decay_flag = TRUE
WHERE last_engagement_date IS NULL 
   OR last_engagement_date < CURRENT_DATE - INTERVAL '30 days';
```

---
---

# Agent Interaction Matrix

| Event | LENS | MARIA | PROBE | CARL |
|---|---|---|---|---|
| New signal detected | Recalculate Signal Score | — | Log to signal feed | Alert if high strength |
| Score crosses 40/60/75 | Flag threshold crossing | Prepare/adjust outreach | Update dashboard | Review + decide |
| Outreach sent | — | Log activity | Update pipeline | — |
| Reply received | Recalculate Engagement Score | Log outcome + determine next action | Update dashboard | Notify Kevin if significant |
| Meeting completed | Recalculate all scores | Log outcome | Update conversion funnel | Generate next steps |
| Decay flag (30+ days) | Flag stale contact | Prepare re-engagement | Alert on dashboard | Review if pattern |
| Weekly digest | Send to CARL + PROBE | Send report to CARL + PROBE | Generate pipeline report | Conduct strategy review |
| Kevin strategic directive | Adjust ICP/priorities | Pause/redirect outreach | Adjust program focus | Cascade to all agents |

---
---

# Phase 1 Execution Parameters

| Parameter | Value | Notes |
|---|---|---|
| LinkedIn Jobs API | **NOT AVAILABLE** | Manual signal input only |
| Signal detection | **Semi-auto** | Google News RSS + manual input |
| LENS scoring | **Manual trigger** | Kevin or CARL triggers recalculation |
| MARIA execution | **Draft mode only** | Kevin approves all outreach |
| PROBE dashboard | **Manual refresh** | Not real-time |
| CARL orchestration | **Manual trigger** | Kevin triggers strategy reviews |
| Scoring recalculation | **Weekly** | Not daily (Phase 1) |

---

*Document Version: 2.0 | Author: CARL/AI (v1) + James/AI (v2 reconciliation) | Date: 2026-07-06 | Status: Reconciled with Supabase, Ready for Migration*
*Next Step: Execute BD_Agent_Schema_Migration.sql → LENS first scoring pass*
