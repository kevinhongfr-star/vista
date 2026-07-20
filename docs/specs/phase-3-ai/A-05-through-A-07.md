# A-05 through A-07: Signal Classification, Priority Engine, Weekly Priorities

> **Phase**: 3 — AI Layer | **Effort**: 2 days total | **Dependencies**: A-02, Phase 1
> **Ticket**: Build signal classification, priority computation engine, and weekly priorities view.

---

## A-05: Signal Auto-Classification (0.5 day)

### Objective

When signals are created (manually or via LENS agent), automatically classify them by type, impact level, and urgency using DeepSeek.

### Flow

```
New signal created → POST /api/ai/classify-signal → DeepSeek flash →
{ type, impact, urgency, suggested_sector, suggested_region }
→ Update signal record in Supabase → UI refreshes via realtime
```

### API Route

#### POST /api/ai/classify-signal

```typescript
// Request
{
  "signal_id": "uuid",
  "title": "Acme Corp announces Series B funding",
  "description": "The company raised $50M led by Sequoia...",
  "source_url": "https://..."
}

// Response
{
  "classification": {
    "signal_type": "company",
    "impact_level": "high",
    "urgency": "medium",
    "suggested_sector": "technology",
    "suggested_region": "americas",
    "reasoning": "Funding round indicates growth phase and potential hiring needs"
  }
}
```

### DeepSeek Prompt

```
Classify this business signal. Respond in JSON:

Title: "{title}"
Description: "{description}"

Available types: market, company, industry, regulatory, technology, people
Available impacts: critical, high, medium, low
Available urgencies: high, medium, low

Return:
{
  "signal_type": "...",
  "impact_level": "...",
  "urgency": "...",
  "suggested_sector": "...",
  "suggested_region": "...",
  "reasoning": "1 sentence explaining classification"
}
```

### Acceptance Criteria

- [ ] New signals auto-classified on creation
- [ ] Classification appears in signal row immediately (realtime)
- [ ] User can manually override classification (inline edit)
- [ ] Manual override is not overwritten by auto-classification
- [ ] Classification accuracy: >80% correct on test set of 50 signals

---

## A-06: Priority Engine (1 day)

### Objective

Compute an outreach priority score for each contact that combines VISTA scores, signal activity, recency, and strategic alignment.

### Priority Formula

```typescript
// src/lib/ai/priorityEngine.ts

function computePriority(contact: ContactData): number {
  const vistaScore = contact.priority_score || 0;           // 0-100
  const signalRecency = recencyScore(contact.last_signal);  // 0-100 (fresher = higher)
  const stageRecency = recencyScore(contact.last_outreach); // 0-100
  const pipelineUrgency = stageWeight(contact.pipeline_stage); // 0.5-2.0 multiplier
  
  // Weighted formula
  const basePriority = (
    vistaScore * 0.4 +           // 40% from VISTA score
    signalRecency * 0.25 +       // 25% from signal freshness
    stageRecency * 0.2 +         // 20% from outreach recency
    engagementScore(contact) * 0.15  // 15% from engagement history
  );
  
  return Math.round(basePriority * pipelineUrgency);
}

function recencyScore(dateStr: string | null): number {
  if (!dateStr) return 0;
  const daysAgo = differenceInDays(new Date(), parseISO(dateStr));
  if (daysAgo <= 1) return 100;
  if (daysAgo <= 7) return 80;
  if (daysAgo <= 14) return 60;
  if (daysAgo <= 30) return 40;
  if (daysAgo <= 60) return 20;
  return 5;
}

function stageWeight(stage: string): number {
  const weights: Record<string, number> = {
    'new': 1.0,
    'contacted': 1.2,
    'qualified': 1.5,
    'proposal': 1.8,
    'interview': 2.0,
    'closed_won': 0.0,
    'closed_lost': 0.0,
  };
  return weights[stage] || 1.0;
}
```

### Database

```sql
-- Add priority_score column if not exists
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS outreach_priority INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS priority_computed_at TIMESTAMPTZ;
```

### API Route

#### POST /api/priority/compute

```typescript
// Request
{
  "contact_ids": ["uuid-1", "uuid-2"],  // Optional: specific contacts
  // OR
  "filter": { "sector": "technology" },  // Filter-based computation
  // OR
  "all": true  // Recompute all
}

// Response
{
  "computed": 1000,
  "top_priority": { "id": "uuid-5", "name": "Jane Doe", "priority": 94 }
}
```

#### POST /api/priority/compute-all (batch, async)

```typescript
// For 1000+ contacts, run as background job
// 1. Fetch all contacts with relevant fields
// 2. Compute priority for each
// 3. Batch update Supabase (100 per batch)
// 4. Return job_id for tracking
```

### Acceptance Criteria

- [ ] Priority score computed for all 1000+ contacts in < 30 seconds
- [ ] Score ranges 0-100 (normalized)
- [ ] Top contacts have scores > 70
- [ ] Stale contacts (no activity 60+ days) score < 20
- [ ] Closed contacts (won/lost) excluded from priority ranking
- [ ] Score updates when: signal added, outreach logged, stage changes
- [ ] PriorityBadge component shows score with color coding

### PriorityBadge Component

```typescript
// src/components/data-grid/ai/PriorityBadge.tsx
// 🔴 90-100: Critical (red)
// 🟠 70-89: High (orange)
// 🟡 50-69: Medium (yellow)
// 🟢 30-49: Low (green)
// ⚪ 0-29: Dormant (gray)
```

---

## A-07: Weekly Priorities View (0.5 day)

### Objective

A dedicated view that shows "What should I focus on this week?" — an auto-generated priority list combining signals, pipeline stage, recency, and strategic importance.

### Implementation

Add a new view to contactsConfig:

```typescript
{
  type: 'table',
  label: '🎯 Weekly Priorities',
  icon: 'Target',
  // This is a special "computed view" that applies specific filters + sort
}
```

### Default Config for Weekly Priorities

```typescript
const weeklyPrioritiesView = {
  filters: {
    groups: [{
      combinator: 'AND',
      conditions: [
        { property: 'pipeline_stage', operator: 'not_equals', value: 'closed_won' },
        { property: 'pipeline_stage', operator: 'not_equals', value: 'closed_lost' },
        { property: 'outreach_priority', operator: 'greater_than', value: 50 },
      ]
    }]
  },
  sorts: [
    { property: 'outreach_priority', direction: 'desc' },
  ],
  // Show top 20 by default
  // Group by sector for context
  groupBy: { primary: 'sector' },
};
```

### UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 🎯 Weekly Priorities                          Week of Jul 14 │
│                                                              │
│ AI says: "Focus on APAC Technology sector this week.         │
│  3 contacts have new signals and are in Qualified stage."    │
│                                                              │
│ ─── Technology (5 contacts) ───                              │
│                                                              │
│ #1 John Smith    Acme Corp    Priority: 94  Stage: Qualified │
│    ⚡ Series B funding announced (2 days ago)                │
│    → Schedule follow-up call re: expansion needs             │
│                                                              │
│ #2 Jane Doe      TechStart    Priority: 87  Stage: Proposal  │
│    ⚡ New CTO hired (5 days ago)                             │
│    → Update proposal to reflect new decision-maker           │
│                                                              │
│ ─── Financial Services (3 contacts) ───                      │
│                                                              │
│ #3 ...                                                       │
│                                                              │
│ [Run LENS to refresh scores]  [Export this week's plan]      │
└──────────────────────────────────────────────────────────────┘
```

### AI Weekly Brief

```typescript
// Use DeepSeek pro model for the weekly brief
// Input: top 20 priorities with their signals + stages
// Output: 2-3 sentence strategic summary + per-contact suggested actions

POST /api/ai/weekly-brief
{
  "top_priorities": [ /* top 20 contacts with signals */ ],
  "week_start": "2026-07-14"
}

Response:
{
  "brief": "Focus on APAC Technology this week — 3 contacts have fresh signals and are in Qualified stage. John Smith's Series B is time-sensitive. Financial Services sector is quiet; use the week for research.",
  "per_contact_actions": {
    "uuid-1": "Schedule follow-up call re: Series B expansion",
    "uuid-2": "Update proposal for new CTO"
  }
}
```

### Acceptance Criteria

- [ ] Weekly Priorities view accessible from Contacts page
- [ ] Shows top 20 contacts filtered by priority > 50 + active pipeline
- [ ] Grouped by sector
- [ ] Each contact shows: name, company, priority score, stage, most recent signal
- [ ] AI brief at top: 2-3 sentence strategic summary
- [ ] Per-contact suggested next step
- [ ] "Run LENS to refresh" button triggers LENS agent
- [ ] "Export" generates a weekly plan document
- [ ] View updates in realtime when priorities change
