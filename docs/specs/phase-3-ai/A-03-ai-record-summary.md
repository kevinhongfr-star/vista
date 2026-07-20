# A-03: AI Record Summary — Narrative Brief per Record

> **Phase**: 3 — AI Layer | **Effort**: 1 day | **Dependencies**: E-06, A-02
> **Ticket**: Build DeepSeek-powered narrative summaries for each record, displayed in detail views.

---

## Objective

Generate a natural-language brief for each record (contact, signal, etc.) that summarizes key information, patterns, and suggested next steps. Like HubSpot Breeze but powered by DeepSeek.

## Acceptance Criteria

- [ ] Detail page shows "AI Summary" section below header
- [ ] Summary includes: who this person is, key signals, pipeline status, suggested next step
- [ ] Generated on first view, cached in database
- [ ] "Refresh" button to regenerate
- [ ] Loading state: skeleton text animation
- [ ] Summary is 3-5 sentences, max 200 words
- [ ] If no data (0 signals, no activities): summary says "Limited data available"
- [ ] Summary appears in contact list as a tooltip on hover (optional, Phase 3+)

## API Route

### POST /api/ai/summary

```typescript
// Request
{
  "entity": "contacts",
  "record_id": "uuid-123",
  "record_data": { /* all fields */ },
  "related_counts": { "signals": 5, "campaigns": 2, "activities": 8 },
  "recent_signals": [ /* top 3 most recent signals */ ]
}

// Response
{
  "summary": "John Smith is a VP of Engineering at Acme Corp (Technology sector, APAC region). He has been in the 'Qualified' pipeline stage for 12 days with 5 related market signals, including a recent funding round. Suggested next step: Schedule a follow-up call to discuss their Series B expansion needs, referencing the APAC fintech market shift.",
  "generated_at": "2026-07-20T14:30:00Z",
  "cached": false
}
```

## DeepSeek Prompt

```
Generate a concise executive brief (3-5 sentences, max 200 words) for this contact:

Name: {full_name}
Title: {job_title}
Company: {company_name}
Sector: {sector}
Region: {region}
Pipeline Stage: {pipeline_stage} (days in stage: {days_in_stage})
VISTA Score: {priority_score}/100 (V:{value_score} I:{insight_score} S:{signal_score} T:{trust_score} A:{access_score})
Recent Signals: {recent_signals_summary}
Related Campaigns: {campaign_names}
Last Activity: {last_outreach_date} ({days_since} days ago)

Include:
1. Who they are and why they matter
2. Current status and momentum
3. Key signals or patterns
4. Suggested next step with specific reasoning
```

## Database Schema

```sql
-- Add to vista_contacts (or separate table)
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS ai_summary_generated_at TIMESTAMPTZ;

-- Or separate table for all entities
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity TEXT NOT NULL,
  record_id UUID NOT NULL,
  summary TEXT NOT NULL,
  model TEXT DEFAULT 'deepseek-chat',
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity, record_id)
);
```

## Caching Strategy

- Summary cached in DB after first generation
- Auto-regenerate if: record updated (updated_at changed) AND summary is > 24h old
- Manual refresh: always regenerates regardless of cache
- Cache invalidation: on bulk update, clear summaries for affected records

## UI Component

```typescript
// src/components/data-grid/ai/RecordSummary.tsx
interface RecordSummaryProps {
  entity: string;
  recordId: string;
  recordData: Record<string, unknown>;
}

// Renders:
// ┌──────────────────────────────────────────────┐
// │ 🤖 AI Summary                          [↻]  │
// │                                              │
// │ John Smith is a VP of Engineering at Acme    │
// │ Corp (Technology, APAC). He has 5 recent     │
// │ market signals including a Series B funding  │
// │ round. Currently Qualified for 12 days.      │
// │ → Schedule follow-up re: Series B expansion. │
// │                                              │
// │ Generated 2 hours ago                        │
// └──────────────────────────────────────────────┘
```
