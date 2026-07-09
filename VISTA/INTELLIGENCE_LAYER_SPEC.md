# VISTA Intelligence Layer — Full Specification

**Version:** 1.0
**Date:** 2026-07-09
**Status:** Ready for implementation
**Priority:** P0 — This is the brain. Without it, VISTA is a static dashboard.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VISTA (Next.js App)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard │  │ Contacts │  │ Signals  │  │ Pipeline │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
│        │              │              │              │         │
│  ┌─────▼──────────────▼──────────────▼──────────────▼────┐  │
│  │              Intelligence Layer (NEW)                   │  │
│  │  ┌─────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │ DeepSeek API │  │ Action     │  │ Report         │  │  │
│  │  │ Integration  │  │ Engine     │  │ Generator      │  │  │
│  │  └──────┬──────┘  └─────┬──────┘  └───────┬────────┘  │  │
│  └─────────┼───────────────┼─────────────────┼────────────┘  │
│            │               │                 │               │
│  ┌─────────▼───────────────▼─────────────────▼────────────┐  │
│  │              Supabase (Data Layer)                       │  │
│  │  vista_contacts | signals | density_clusters |          │  │
│  │  campaigns | activities | programs | strategic_notes    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Agent Bridge (Feishu ↔ Supabase)            │  │
│  │  LENS (scoring) | PROBE (signals) | CARL (strategy) |   │  │
│  │  MARIA (campaigns)                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. DeepSeek API Integration

### 2.1 Configuration

**Environment variables (Vercel):**
```
DEEPSEEK_API_KEY=sk-xxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL_FLASH=deepseek-chat        # Fast responses (< 3s)
DEEPSEEK_MODEL_PRO=deepseek-reasoner       # Complex reasoning (< 30s)
```

**Helper module:** `lib/deepseek.ts`
```typescript
export async function callDeepSeek(
  prompt: string,
  options?: { model?: 'flash' | 'pro'; maxTokens?: number; temperature?: number }
): Promise<string>
```

### 2.2 Intelligence Routes — Replace All Hardcoded Logic

Every `/api/intelligence/*` route must call DeepSeek instead of if/else.

#### Route: `GET /api/intelligence/contact/[id]/summary`
**Purpose:** AI-generated executive summary of a contact.
**Prompt template:**
```
You are a BD intelligence analyst. Given this contact data, generate a 3-sentence executive summary covering:
1. Who they are and why they matter
2. Current engagement state and momentum
3. Recommended next action with rationale

Contact: {name}, {role} at {company}
Industry: {industry}
VISTA Scores: V={v} I={i} S={s} T={t} A={a} (Composite: {composite})
Pipeline Stage: {stage}
Last Activity: {last_contact_date}
Signals (last 30 days): {recent_signals}
Cluster: {cluster_name} ({cluster_size} contacts)
```
**Output:** JSON `{ summary: string, confidence: number }`

#### Route: `GET /api/intelligence/contact/[id]/recommendations`
**Current state:** Hardcoded if/else.
**Required:** DeepSeek generates contextual recommendations.
**Prompt:**
```
You are a BD strategy advisor. Given this contact's full profile, recommend the top 3 actions in priority order. For each action, explain WHY and estimate impact.

Contact data: {full_contact_json}
Recent signals: {signals_json}
Cluster context: {cluster_json}
Company news (last 30 days): {company_signals}

Output format:
{
  "recommendations": [
    {
      "action": "Schedule discovery call",
      "why": "Their company just raised Series B — budget approval window is open",
      "impact": "High — 70% probability of meeting booked within 2 weeks",
      "urgency": "This week",
      "channels": ["email", "linkedin"]
    }
  ]
}
```

#### Route: `GET /api/intelligence/cluster/[id]/narrative`
**Current state:** Returns raw data.
**Required:** AI-generated cluster narrative.
**Prompt:**
```
You are a market intelligence analyst. Given this density cluster of contacts, generate:
1. A 2-sentence narrative describing who they are as a group
2. Why they cluster together (common signals, industry, geography)
3. Recommended engagement strategy for the cluster as a whole
4. Top 3 priority contacts to engage first and why
5. Recommended program/campaign for the cluster

Cluster: {cluster_name}
Contacts ({count}): {contacts_summary_json}
Signals: {cluster_signals_json}
```
**Output:** JSON `{ narrative: string, strategy: string, priority_contacts: string[], recommended_program: string }`

#### Route: `GET /api/intelligence/signal/[id]/impact`
**Current state:** Returns raw signal data.
**Required:** AI-generated impact analysis.
**Prompt:**
```
You are a signal analyst. Given this signal and the contacts it affects, assess:
1. What this signal means in plain English
2. Which contacts are most affected and how
3. Recommended actions for each affected contact
4. Time sensitivity (how long is the window?)
5. Overall opportunity score (1-100)

Signal: {signal_json}
Affected contacts: {contacts_summary_json}
```

#### Route: `GET /api/intelligence/dashboard/executive-brief`
**NEW ROUTE.** Daily executive brief for the dashboard.
**Prompt:**
```
You are a chief of staff preparing a morning brief for the BD director. Based on today's data, generate:
1. Top 3 priorities for today (with rationale)
2. Key changes since yesterday (new signals, score changes, pipeline movement)
3. Risks or warnings (stale contacts, declining scores, missed follow-ups)
4. Opportunities (hot signals, cluster momentum, upcoming windows)

Keep it under 200 words. Use bullet points. Be specific — name people and companies.

Current data:
- Active contacts: {count}
- New signals (24h): {new_signals}
- Pipeline changes (24h): {pipeline_changes}
- Top movers (score delta): {top_movers}
- Stale contacts (>30 days): {stale_count}
```
**Output:** JSON `{ brief: string, priorities: string[], risks: string[], opportunities: string[] }`

---

## 3. Bulk AI Operations — The Core Requirement

### 3.1 Bulk Score Assessment

**Route:** `POST /api/intelligence/bulk-assess`

**Purpose:** AI assesses and scores N contacts in one batch. Writes results directly to Supabase.

**Request body:**
```json
{
  "scope": "all" | "filter" | "cluster" | "ids",
  "filter": { "industry": "Fintech", "seniority": "C-Level" },
  "cluster_id": "uuid",
  "contact_ids": ["id1", "id2", ...],
  "assessment_type": "full" | "score_only" | "recommendations_only"
}
```

**Backend logic:**
```
1. Fetch contacts from Supabase based on scope
2. For each contact (batch of 10):
   a. Call DeepSeek with contact data + signals + context
   b. Parse AI response into structured scores/recommendations
   c. Write back to Supabase:
      - vista_contacts: update vista_v, vista_i, vista_s, vista_t, vista_a, vista_composite
      - strategic_notes: insert AI-generated notes
      - signals: insert AI-detected signals if any
3. Return progress: { assessed: N, updated: N, errors: N }
```

**DeepSeek prompt for bulk scoring:**
```
You are a BD scoring engine. For each contact, output V/I/S/T/A scores (0-30 each) based on:
- V (Value): Company size, revenue, industry tier, strategic fit
- I (Intensity): Signal frequency, engagement momentum, response rate
- S (Strategic): Seniority level, decision-making power, network position
- T (Timing): Recent triggers (funding, hiring, expansion), urgency signals
- E (Ecosystem): Cluster membership, referral proximity, event overlap

Contacts:
{batch_of_10_contacts_json}

Output format (JSON array):
[
  {
    "id": "contact_id",
    "scores": { "v": 22, "i": 18, "s": 25, "t": 15, "a": 20 },
    "composite": 100,
    "rationale": "C-suite at Series B fintech. Active signals: 3 in 14 days.",
    "recommended_action": "Schedule discovery call — funding window open"
  }
]
```

**Rate limiting:** Process 10 contacts per DeepSeek call. Max 5 concurrent batches. For 17,000 contacts: ~1,700 API calls, ~30 minutes with concurrency.

**UI:** 
- Dashboard "Run Bulk Assessment" button
- Progress bar showing X/Y contacts assessed
- Results appear in real-time (Supabase Realtime subscription)

### 3.2 Bulk Signal Detection

**Route:** `POST /api/intelligence/bulk-detect-signals`

**Purpose:** AI scans all contacts for new signals and writes to `signals` table.

**DeepSeek prompt:**
```
Given this batch of contacts and their recent activity/history, identify any new signals:
- Job changes, promotions, company news, funding, expansion
- Engagement changes (stopped responding, increased activity)
- Market signals (competitor activity, industry shifts)

For each signal detected, output:
{
  "contact_id": "uuid",
  "signal_type": "funding|job_change|engagement_shift|market_event",
  "description": "Their company raised $50M Series B",
  "impact": "high|medium|low",
  "recommended_action": "Reach out with congratulations + schedule call",
  "urgency": "This week"
}
```

**Writes to:** `signals` table in Supabase → VISTA UI auto-refreshes

### 3.3 Bulk Cluster Intelligence

**Route:** `POST /api/intelligence/bulk-cluster-analyze`

**Purpose:** AI generates narratives, strategies, and recommended programs for ALL clusters.

**Writes to:**
- `density_clusters`: signal_types, recommended_programs, narrative, strategy
- `programs`: auto-generate program outlines based on cluster needs

### 3.4 Real-Time Reactivity

**Supabase Realtime subscriptions:**
```typescript
// In Dashboard, Contacts, Signals pages:
supabase.channel('vista_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'vista_contacts' }, (payload) => {
    // Update UI in real-time
    updateContact(payload.new)
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'signals' }, (payload) => {
    addSignal(payload.new)
  })
  .subscribe()
```

**Result:** When AI writes to Supabase (bulk assess, signal detect), the VISTA UI updates instantly — charts move, scores change, new signals appear, pipeline rearranges. No manual refresh needed.

---

## 4. Action Engine — Execute Buttons That Actually Work

### 4.1 Email Sending

**Route:** `POST /api/actions/send-email`

**Integration:** MS Graph API (existing: `kevin.hong@lyc-partners.ai`)

**Flow:**
```
1. User clicks "Send Email" on contact(s)
2. Frontend opens EmailComposer with AI-pre-filled content:
   - DeepSeek generates subject + body based on contact profile + signals + recommended action
   - User reviews/edits
3. User clicks "Send"
4. Backend calls MS Graph API to send email
5. Logs activity to `activities` table
6. Updates `vista_contacts.last_contact_date`
7. Triggers score recalculation (engagement signal)
```

**DeepSeek prompt for email generation:**
```
Write a personalized outreach email for this contact. Context:
- Contact: {name}, {role} at {company}
- Last interaction: {last_activity}
- Recent signals: {signals}
- Recommended action: {recommended_action}
- Sender: Kevin Hong, LYC Partners

Tone: Professional but warm. 3-4 sentences max. Include a specific reason for reaching out based on their recent signals. Include a clear CTA.
```

### 4.2 Campaign Creation

**Route:** `POST /api/actions/create-campaign`

**Flow:**
```
1. User selects cluster or contact group
2. Clicks "Create Campaign"
3. DeepSeek generates:
   - Campaign name
   - Target audience description
   - 3-email sequence (subject + body for each)
   - Recommended send cadence
4. User reviews/approves
5. Creates record in `campaigns` table
6. Creates linked `activities` for each contact
```

### 4.3 Meeting Scheduling

**Route:** `POST /api/actions/schedule-meeting`

**Flow:**
```
1. User clicks "Schedule Meeting" on a contact
2. Opens a modal with:
   - AI-suggested meeting purpose (based on signals + stage)
   - AI-suggested agenda (3-4 bullet points)
   - Calendar availability (from MS Graph Calendar API)
   - Auto-generated meeting invite template
3. User selects time + confirms
4. Sends calendar invite via MS Graph
5. Logs activity + updates pipeline stage
```

### 4.4 Bulk Actions

**Route:** `POST /api/actions/bulk-execute`

**Supported bulk actions:**
- Bulk email (send same template to N contacts, personalized per contact by AI)
- Bulk stage change (move N contacts to new pipeline stage)
- Bulk score reassessment (trigger AI re-scoring)
- Bulk campaign assignment (assign N contacts to a campaign)
- Bulk archive/dismiss (signals)

---

## 5. Report Generator

### 5.1 Report Types

| Report | Trigger | Output |
|--------|---------|--------|
| Executive Daily Brief | Dashboard load + daily at 8am | 200-word summary + 3 priorities |
| Weekly Pipeline Review | Manual trigger | Pipeline movement, stuck contacts, recommended actions |
| Cluster Intelligence Report | Per cluster | Narrative, strategy, priority contacts, recommended program |
| Signal Digest | Daily | All new signals + impact analysis + affected contacts |
| Contact Deep Dive | Per contact | Full AI assessment + history + recommended next 30 days |
| Campaign Performance | Per campaign | Response rates, pipeline impact, AI recommendations |

### 5.2 Report UI

**Route:** `GET /api/reports/[type]`

**UI:**
- "Generate Report" button on every page
- Report renders as a rich card with:
  - Markdown-formatted content
  - Key metrics highlighted
  - "Copy to clipboard" button
  - "Export as PDF" button
  - "Email to..." button (sends via MS Graph)

### 5.3 Scheduled Reports

**Via Vercel Cron or Supabase Edge Functions:**
- Daily 8am: Executive Brief → auto-generated + visible on Dashboard
- Weekly Monday: Pipeline Review → auto-generated
- On new cluster: Cluster Intelligence → auto-generated

---

## 6. Agent ↔ App Bridge

### 6.1 How Agents Write to Supabase

Each agent (LENS, PROBE, CARL, MARIA) writes to Supabase via the Supabase Management API or Edge Functions. The VISTA app reads the same tables — so when agents write, the app updates.

| Agent | Writes to | VISTA displays |
|-------|-----------|----------------|
| LENS | `vista_contacts` scores (V/I/S/T/A) | ScoreGauge, score breakdown, KPIs |
| PROBE | `signals` table | Signals page, signal detail, dashboard alerts |
| CARL | `density_clusters` narratives + strategies | Cluster detail, cluster narratives |
| MARIA | `campaigns` + `activities` | Campaigns page, activity timeline |

### 6.2 Trigger Routes → Agent Group Chats

**Existing routes:** `/api/trigger/probe`, `/api/trigger/carl`, `/api/trigger/lens`, `/api/trigger/maria`

**Required implementation:**
```
POST /api/trigger/probe → calls Feishu Messaging API → sends message to PROBE group chat
PROBE agent reads message → executes signal detection → writes to Supabase
VISTA Realtime subscription detects change → UI updates
```

**Payload to agent:**
```json
{
  "action": "detect_signals",
  "scope": "all_contacts_not_scanned_in_24h",
  "callback": "write_to_supabase"
}
```

### 6.3 UI Triggers

Each page gets a "Trigger Agent" button:
- Signals page → "Detect New Signals" (triggers PROBE)
- Clusters page → "Analyze Clusters" (triggers CARL)
- Contacts page → "Re-score All" (triggers LENS)
- Campaigns page → "Generate Campaign" (triggers MARIA)

---

## 7. Implementation Priority

### Wave 1: Brain (3-4 hours)
1. `lib/deepseek.ts` — API helper with flash + pro models
2. Replace `/api/intelligence/contact/[id]/summary` with DeepSeek call
3. Replace `/api/intelligence/contact/[id]/recommendations` with DeepSeek call
4. Replace `/api/intelligence/cluster/[id]/narrative` with DeepSeek call
5. Add `/api/intelligence/dashboard/executive-brief` route

### Wave 2: Bulk Operations (4-5 hours)
6. `POST /api/intelligence/bulk-assess` — AI scores N contacts, writes to Supabase
7. `POST /api/intelligence/bulk-detect-signals` — AI detects signals, writes to Supabase
8. Supabase Realtime subscriptions on Dashboard + Contacts + Signals
9. UI: "Run Bulk Assessment" button with progress bar

### Wave 3: Action Engine (4-5 hours)
10. `POST /api/actions/send-email` — MS Graph integration
11. AI email generation (DeepSeek prompt → pre-filled EmailComposer)
12. `POST /api/actions/create-campaign` — AI generates campaign sequence
13. Wire "Execute" buttons on Next Best Action cards

### Wave 4: Reports (2-3 hours)
14. `GET /api/reports/executive-brief` — daily AI summary
15. `GET /api/reports/cluster-intelligence` — per-cluster narrative
16. `GET /api/reports/signal-digest` — daily signal summary
17. "Generate Report" button on every page
18. "Export as PDF" / "Email to..." buttons

### Wave 5: Agent Bridge (3-4 hours)
19. Implement `/api/trigger/*` routes → Feishu Messaging API
20. "Trigger Agent" buttons on each page
21. Real-time display of agent-generated content

**Total: ~18-22 hours of focused implementation.**

---

## 8. Technical Constraints

1. **DeepSeek API only** — No Coze LLM for compute. All AI calls go through DeepSeek.
2. **Rate limits:** DeepSeek flash = 10 req/sec, pro = 3 req/sec. Batch operations must respect limits.
3. **Cost:** ~$0.01 per 1000 tokens (flash), ~$0.03 per 1000 tokens (pro). Bulk assessing 17K contacts ≈ $5-10 per run.
4. **Vercel limits:** Serverless functions timeout at 10s (Hobby) or 60s (Pro). Bulk operations must use streaming or chunked responses.
5. **Supabase Realtime:** Free tier supports 200 concurrent connections. Sufficient for single-user BD tool.

---

## 9. Acceptance Criteria

- [ ] Every "intelligence" route calls DeepSeek — zero hardcoded if/else logic
- [ ] Bulk assessment updates 100+ contacts in under 5 minutes
- [ ] Supabase changes appear in VISTA UI within 2 seconds (Realtime)
- [ ] "Send Email" button actually sends via MS Graph
- [ ] "Generate Report" produces a coherent AI-written summary
- [ ] "Trigger PROBE" sends a message to the Feishu group chat
- [ ] Executive Daily Brief auto-generates and displays on Dashboard
- [ ] All AI-generated content is editable before execution
- [ ] Every AI action is logged to `activities` table for audit trail
