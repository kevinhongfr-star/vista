# Wave 5: Agent Bridge

## Goal

Connect VISTA to the Feishu agent group chats. The trigger routes exist but send hardcoded messages. Wave 5 makes them dynamic, adds "Trigger Agent" buttons to the UI, receives agent responses, and displays agent-generated content in real-time.

## Current State (Post-Wave 4)

| Component | Status |
|-----------|--------|
| `app/api/trigger/lens/route.ts` | ✅ Exists — hardcoded message |
| `app/api/trigger/maria/route.ts` | ✅ Exists — hardcoded message |
| `app/api/trigger/probe/route.ts` | ✅ Exists — hardcoded message |
| `app/api/trigger/carl/route.ts` | ✅ Exists — hardcoded message |
| `lib/feishu/client.ts` | ✅ Exists — `sendMessage(chatId, text)` only |
| Feishu event subscription | ❌ Not implemented |
| Agent response storage | ❌ Not implemented |
| "Trigger Agent" UI buttons | ❌ Not implemented |
| Agent output display | ❌ Not implemented |

**Feishu Agent Chat IDs (env vars):**
- `FEISHU_CHAT_LENS` → LENS scoring agent
- `FEISHU_CHAT_MARIA` → MARIA campaign agent
- `FEISHU_CHAT_PROBE` → PROBE pipeline agent
- `FEISHU_CHAT_CARL` → CARL strategy agent

---

## Deliverable 19: Dynamic Trigger Routes

### Current Problem

All 4 trigger routes send hardcoded messages. They don't accept context (which contact, which cluster, what scope).

### Upgrade Each Route

#### `POST /api/trigger/lens`
```typescript
// Request body
{
  contactIds?: string[]      // Specific contacts to score
  clusterId?: string         // Score all contacts in cluster
  scope?: 'all' | 'unscored' | 'decayed'  // Broad trigger
}

// Message sent to LENS chat
// If contactIds: list specific contacts
// If clusterId: "Score all contacts in cluster [name] (X contacts)"
// If scope=decayed: "Re-score all contacts with decay_flag=true"
```

#### `POST /api/trigger/maria`
```typescript
// Request body
{
  contactIds?: string[]      // Generate campaigns for specific contacts
  clusterId?: string         // Generate campaigns for cluster
}

// Message sent to MARIA chat
// "Generate campaign sequence for: [contact1], [contact2]..."
// OR "Generate outreach plan for cluster [name]"
```

#### `POST /api/trigger/probe`
```typescript
// Request body
{
  type: 'refresh' | 'specific' | 'at-risk'
  contactIds?: string[]
}

// Message sent to PROBE chat
```

#### `POST /api/trigger/carl`
```typescript
// Request body
{
  type: 'strategic-review' | 'cluster-analysis' | 'market-scan'
  clusterId?: string
  context?: string  // Free-form context from Kevin
}

// Message sent to CARL chat
```

### Add Logging

Every trigger writes to `activities` table:
```typescript
{
  type: 'agent_trigger',
  details: {
    agent: 'LENS' | 'MARIA' | 'PROBE' | 'CARL',
    trigger_type: 'contact' | 'cluster' | 'scope',
    target_ids: string[],
    message_sent: string,
    triggered_by: 'kevin'  // or user id
  }
}
```

---

## Deliverable 20: "Trigger Agent" Buttons in UI

### Design Principles

- Buttons are contextual — they know what data is on screen
- One click triggers agent, shows confirmation toast
- No polling — Supabase Realtime shows when agent responds
- Buttons use the existing fuchsia accent color for "action" states

### Button Placement

#### Dashboard Page (`app/dashboard/page.tsx`)
```
┌─────────────────────────────────────────────────────┐
│ Executive Dashboard                                  │
├─────────────────────────────────────────────────────┤
│ Priority Actions                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🔴 3 contacts need re-engagement                │ │
│ │ [Trigger MARIA] [View Contacts]                 │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🟡 Cluster "Shanghai Fintech" — high density    │ │
│ │ [Trigger CARL — Analyze] [View Cluster]         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Quick Actions                                       │
│ [Run LENS Scoring] [Trigger PROBE] [CARL Review]   │
└─────────────────────────────────────────────────────┘
```

#### Cluster Detail Page (`app/clusters/[id]/page.tsx`)
```
┌─────────────────────────────────────────────────────┐
│ Cluster: Shanghai Fintech                           │
│ 12 contacts · 8 signals · Score: 82                 │
├─────────────────────────────────────────────────────┤
│ [Run LENS — Score Cluster]  [Trigger CARL — Analyze]│
│ [Trigger MARIA — Campaigns] [Trigger PROBE — Scan]  │
└─────────────────────────────────────────────────────┘
```

#### Contact Detail Page (`app/contacts/[id]/page.tsx`)
```
┌─────────────────────────────────────────────────────┐
│ Zhang Wei — Senior Engineer at Ant Group            │
│ V:85 I:72 S:68 T:90 A:77 · Total: 78               │
├─────────────────────────────────────────────────────┤
│ [Rescore (LENS)] [Draft Email (MARIA)] [Deep Dive (CARL)]│
└─────────────────────────────────────────────────────┘
```

#### Pipeline Page (`app/pipeline/page.tsx`)
```
┌─────────────────────────────────────────────────────┐
│ Pipeline Overview                                    │
│ 124 active · $2.3M potential · 47 at risk            │
├─────────────────────────────────────────────────────┤
│ [Refresh Pipeline (PROBE)] [CARL — Risk Analysis]   │
└─────────────────────────────────────────────────────┘
```

### Component: `<AgentTriggerButton>`

Reusable component at `components/intelligence/agent-trigger-button.tsx`:

```typescript
interface AgentTriggerButtonProps {
  agent: 'LENS' | 'MARIA' | 'PROBE' | 'CARL'
  triggerData: {
    contactIds?: string[]
    clusterId?: string
    scope?: string
    type?: string
    context?: string
  }
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  label: string
}

// Behavior:
// 1. onClick → POST /api/trigger/{agent} with triggerData
// 2. Show loading spinner on button
// 3. On success → toast "Triggered {agent}: {summary}"
// 4. On error → toast "Failed to trigger {agent}"
// 5. Auto-disable if triggered within last 5 minutes (cooldown)
```

### Cooldown Logic

```typescript
// Track last trigger time per agent in localStorage
const COOLDOWN_MS = 5 * 60 * 1000  // 5 minutes

function canTrigger(agent: string): boolean {
  const lastTrigger = localStorage.getItem(`trigger_${agent}`)
  if (!lastTrigger) return true
  return Date.now() - parseInt(lastTrigger) > COOLDOWN_MS
}
```

---

## Deliverable 21: Feishu Event Subscription

### Purpose

Agents respond in Feishu. VISTA needs to receive these responses and store them in Supabase so the UI can display them.

### New API Route: `POST /api/feishu/events`

This is the Feishu Event Subscription endpoint. Feishu sends all message events here.

```typescript
// app/api/feishu/events/route.ts

export async function POST(request: Request) {
  const body = await request.json()
  
  // 1. Verify challenge (Feishu URL verification)
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge })
  }
  
  // 2. Parse message event
  const event = body.event
  const chatId = event.message?.chat_id
  const messageText = event.message?.content
  
  // 3. Identify which agent sent the message
  const senderId = event.sender?.sender_id?.open_id
  
  // 4. Determine agent from chat_id
  let agent: string
  if (chatId === process.env.FEISHU_CHAT_LENS) agent = 'LENS'
  else if (chatId === process.env.FEISHU_CHAT_MARIA) agent = 'MARIA'
  else if (chatId === process.env.FEISHU_CHAT_PROBE) agent = 'PROBE'
  else if (chatId === process.env.FEISHU_CHAT_CARL) agent = 'CARL'
  else return NextResponse.json({ ok: true })  // Unknown chat, ignore
  
  // 5. Parse agent response for structured data
  const parsed = parseAgentResponse(agent, messageText)
  
  // 6. Store in Supabase
  await supabase.from('agent_outputs').insert({
    agent,
    chat_id: chatId,
    raw_message: messageText,
    parsed_data: parsed,
    triggered_by: 'agent',  // vs 'kevin' for triggers
    status: 'received'
  })
  
  return NextResponse.json({ ok: true })
}
```

### Feishu App Configuration (Kevin Manual Step)

In Feishu Developer Console → VISTA app → Event Subscription:
1. Set Request URL to `https://vista-azure-delta-theta.vercel.app/api/feishu/events`
2. Subscribe to events: `im.message.receive_v1`
3. Verify and save

### Parse Agent Responses

Each agent outputs in a known format. Parse for structured data:

```typescript
function parseAgentResponse(agent: string, rawText: string): any {
  // Try to extract JSON blocks from markdown code blocks
  const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]) } catch {}
  }
  
  // Fallback: return raw text with agent metadata
  return { raw: rawText, agent, timestamp: new Date().toISOString() }
}
```

---

## Deliverable 22: Agent Output Display

### New Table: `agent_outputs`

Already exists in schema (from initial setup). Verify columns:
```sql
CREATE TABLE IF NOT EXISTS agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,  -- LENS/MARIA/PROBE/CARL
  chat_id TEXT,
  raw_message TEXT,
  parsed_data JSONB,
  triggered_by TEXT DEFAULT 'agent',
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
```

### New API: `GET /api/agents/[agent]/outputs`

```typescript
// Returns recent outputs from a specific agent
// Query params: ?limit=10&since=2026-07-09
```

### Component: `<AgentOutputFeed>`

Shows latest agent outputs. Placed on Dashboard and as a tab on each page.

```typescript
// components/intelligence/agent-output-feed.tsx
interface AgentOutputFeedProps {
  agent?: 'LENS' | 'MARIA' | 'PROBE' | 'CARL'  // Filter to one agent
  limit?: number
  showAgent?: boolean  // Show agent name in output
}

// Renders:
// ┌─────────────────────────────────────────────┐
// │ LENS · 2 minutes ago                         │
// │ "Scored 47 contacts. 12 updated:             │
// │  • Zhang Wei: V:85→88, S:68→72              │
// │  • Li Ming: V:72→75, I:65→68               │
// │  3 flagged for decay..."                     │
// │ [View Full Report]                           │
// ├─────────────────────────────────────────────┤
// │ CARL · 15 minutes ago                        │
// │ "Strategic analysis of Shanghai Fintech:     │
// │  High concentration risk — 60% at 3 firms.   │
// │  Recommendation: diversify to Hangzhou..."   │
// │ [Apply Recommendations]                      │
// └─────────────────────────────────────────────┘
```

### Supabase Realtime on `agent_outputs`

Enable Realtime so new agent outputs appear instantly:
```typescript
// In realtime.ts, add:
supabase
  .channel('agent-outputs')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_outputs' },
    (payload) => {
      // New agent output — show notification
      toast.success(`${payload.new.agent}: New output received`)
      // Refresh feed
      router.refresh()
    }
  )
  .subscribe()
```

---

## Deliverable 23: Agent Status Panel

### Component: `<AgentStatusPanel>`

Shows real-time status of all 4 agents on Dashboard:

```typescript
// components/intelligence/agent-status-panel.tsx

// ┌─────────────────────────────────────────────────┐
// │ Agent Status                                     │
// ├─────────────────────────────────────────────────┤
// │ 🟢 LENS    Last output: 2m ago  [Trigger]       │
// │ 🟢 MARIA   Last output: 15m ago [Trigger]       │
// │ 🟡 PROBE   Last output: 1h ago  [Trigger]       │
// │ 🔴 CARL    No recent output     [Trigger]       │
// └─────────────────────────────────────────────────┘
```

- 🟢 = output within 30 minutes
- 🟡 = output 30min–24h ago
- 🔴 = no output in 24h+
- Click [Trigger] → opens `<AgentTriggerButton>` with default context

---

## Implementation Order

1. **#19 Dynamic Trigger Routes** — upgrade existing routes to accept body, add context, log to activities
2. **#20 Trigger Agent Buttons** — `<AgentTriggerButton>` component, wire into Dashboard/Cluster/Contact/Pipeline pages
3. **#21 Feishu Event Subscription** — `/api/feishu/events` endpoint, parse agent responses, store in `agent_outputs`
4. **#22 Agent Output Display** — `<AgentOutputFeed>` component, API route, Realtime subscription
5. **#23 Agent Status Panel** — `<AgentStatusPanel>` on Dashboard

---

## API Reference

### Trigger Routes (Upgraded)

| Route | Method | Body | Response |
|-------|--------|------|----------|
| `/api/trigger/lens` | POST | `{ contactIds?, clusterId?, scope? }` | `{ success, agent, message_sent }` |
| `/api/trigger/maria` | POST | `{ contactIds?, clusterId? }` | `{ success, agent, message_sent }` |
| `/api/trigger/probe` | POST | `{ type, contactIds? }` | `{ success, agent, message_sent }` |
| `/api/trigger/carl` | POST | `{ type, clusterId?, context? }` | `{ success, agent, message_sent }` |

### New Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/feishu/events` | POST | Feishu event subscription webhook |
| `/api/agents/[agent]/outputs` | GET | Fetch agent outputs |

---

## Constraints

1. **No polling.** Use Supabase Realtime for agent output delivery.
2. **Feishu message rate limit.** Max 5 messages/sec to same chat. Batch trigger messages if needed.
3. **Agent response format is not guaranteed.** Parse defensively. Store raw text always, parsed data as best-effort.
4. **Event subscription verification.** Feishu requires URL verification before events flow. Kevin must configure this in Feishu Developer Console.
5. **No auto-execution of agent recommendations.** Agent outputs are displayed for Kevin to review. "Apply" buttons are manual confirmation steps.

---

## Kevin Manual Steps (Post-Implementation)

1. **Configure Feishu Event Subscription** in Developer Console:
   - URL: `https://vista-azure-delta-theta.vercel.app/api/feishu/events`
   - Event: `im.message.receive_v1`
2. **Enable Supabase Realtime** on `agent_outputs` table (I'll do this before merge)
3. **Test each trigger** — click button → verify Feishu message → wait for agent response → verify it appears in VISTA

---

## Testing Checklist

- [ ] Trigger LENS with contactIds → verify Feishu message contains contact names
- [ ] Trigger MARIA from cluster page → verify cluster name in message
- [ ] Feishu event endpoint receives challenge → returns challenge correctly
- [ ] Agent response stored in `agent_outputs` → appears in feed within 2s
- [ ] Agent status panel shows correct status (green/yellow/red)
- [ ] Cooldown prevents double-trigger within 5 minutes
- [ ] All triggers logged to `activities` table
