# A-04: Agent Integration — LENS/MARIA/PROBE/CARL Wired to UI

> **Phase**: 3 — AI Layer | **Effort**: 1.5 days | **Dependencies**: Phase 1, R-01
> **Ticket**: Wire the 4 Feishu agents to the VISTA UI so users can trigger them from any page.

---

## Objective

Each entity page gets an "Agent Actions" bar that lets users trigger agent operations directly from the UI. Agents execute asynchronously via Feishu messaging API and write results back to Supabase. UI updates via realtime.

## Agent Capabilities (UI-facing)

| Agent | Chat ID | Triggered From | Action |
|-------|---------|----------------|--------|
| **LENS** | `oc_a61e78ff28a98b1cba03b6c48b1fc02f` | Contacts page, Pipeline page | "Re-score selected contacts", "Score all in Sector X" |
| **MARIA** | `oc_c7f53702baeaa6fae1df9e414b29abc6` | Campaigns page, Contacts page | "Generate campaign for cluster", "Add selected to campaign" |
| **PROBE** | `oc_1ff6972d43573e6a9ba3da2cbe71af4a` | Pipeline page | "Review pipeline", "Flag stale deals" |
| **CARL** | `oc_ba0972a363702b1829a52461558bf34b` | Clusters page, Strategy page | "Generate clusters", "Strategic brief for sector X" |

## UI Component — AgentActionBar

```typescript
interface AgentActionBarProps {
  config: EntityConfig;
  selectedRows?: Set<string>;
  currentFilters?: FilterConfig;
}

// Renders as a dropdown or button group in the toolbar:
// [🤖 Agent Actions ▼]
//   → LENS: Re-score selected (5) contacts
//   → LENS: Score all contacts in APAC
//   → MARIA: Create campaign from selection
//   → PROBE: Review pipeline health
//   → CARL: Generate strategic brief
```

## Trigger Flow

```
1. User clicks agent action
2. UI shows confirmation: "This will run LENS scoring on 5 contacts. Continue?"
3. User confirms
4. UI sends message to Feishu agent chat:
   POST https://open.feishu.cn/open-apis/im/v1/messages
   {
     "receive_id": "oc_a61e78ff28a98b1cba03b6c48b1fc02f",  // LENS chat
     "msg_type": "text",
     "content": "{\"text\":\"Score these contacts: [uuid-1, uuid-2, uuid-3, uuid-4, uuid-5]\"}"
   }
5. UI shows "Agent running..." toast with progress indicator
6. Agent processes → writes results to Supabase
7. Supabase realtime → UI auto-updates with new scores
8. Toast: "LENS scoring complete. 5 contacts updated."
```

## Progress Tracking

```typescript
// Track agent runs in a table
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,           // 'LENS', 'MARIA', 'PROBE', 'CARL'
  action TEXT NOT NULL,          // 'score_contacts', 'generate_campaign', etc.
  status TEXT DEFAULT 'running', // 'running', 'completed', 'failed'
  input JSONB,                   // { contact_ids: [...], filters: {...} }
  output JSONB,                  // { updated: 5, errors: 0 }
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  triggered_by TEXT              // user_id
);
```

## API Route

### POST /api/agents/trigger

```typescript
// Request
{
  "agent": "LENS",
  "action": "score_contacts",
  "params": {
    "contact_ids": ["uuid-1", "uuid-2"],
    // OR
    "filter": { "sector": "apac" }
  }
}

// Response
{
  "run_id": "uuid-run-1",
  "status": "running",
  "message": "LENS scoring started for 2 contacts"
}
```

### GET /api/agents/runs?status=running

```typescript
// Response
{
  "runs": [
    { "id": "uuid-run-1", "agent": "LENS", "status": "running", "started_at": "..." }
  ]
}
```

## Acceptance Criteria

- [ ] Agent Actions dropdown visible on Contacts, Pipeline, Campaigns, Clusters, Strategy pages
- [ ] Click action → confirmation dialog
- [ ] Confirm → Feishu message sent to correct agent chat
- [ ] "Agent running..." toast appears
- [ ] Agent completes → Supabase updated → UI refreshes via realtime
- [ ] Toast: "Complete. N records updated."
- [ ] agent_runs table tracks all runs
- [ ] Failed runs show error toast
- [ ] Works with selected rows AND with filter-based selection ("all in APAC")

## Feishu Bot Config

- Bot App ID: `cli_a969600ff738dcc4`
- Must be member of all 4 agent chats
- Uses tenant_access_token for API calls
- Token refresh handled by existing Feishu integration
