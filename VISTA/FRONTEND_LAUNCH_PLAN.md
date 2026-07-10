# VISTA Frontend Launch Plan

**Status**: Ready for Implementation
**Author**: James/AI (PM)
**Date**: 2026-07-10
**Executor**: Trae

---

## Problem Statement

After 5 waves of backend development (AI scoring, email generation, campaign creation, signal detection, agent bridge), the VISTA frontend looks nearly identical to 3 days ago. Kevin opens the app and sees the same tables, same navigation, same layout. The intelligence exists in the backend but is invisible in the UI.

**Core Issue**: VISTA has the brain of an intelligent system inside the body of a CRM. Users must navigate to find intelligence. Intelligence should come to users.

**Goal**: Transform VISTA from a "navigate and find" CRM into an "intelligence comes to you" agentic experience. Every page Kevin opens should immediately show what's new, what changed, and what to do — without clicking.

---

## Implementation Principles

1. **Intelligence First**: Every page leads with AI-generated insights, not raw data
2. **Visible AI Activity**: Show what agents are doing, what they found, what they recommend
3. **Progressive Disclosure**: Summary/briefing at top, details available on scroll/click
4. **Visual Hierarchy**: Important things are big and prominent, not buried in tables
5. **Live Feel**: Realtime updates, animated transitions, "breathing" interface

---

## Phase 1: Dashboard Intelligence Briefing (PRIORITY: CRITICAL)

### Current State
Dashboard: KPI cards → AgentStatusPanel → Quick Actions → Priority Actions → Pipeline Funnel (progress bars) → Recent Activity

### Target State
Dashboard becomes an **Intelligence Briefing**:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🧠 VISTA Intelligence Briefing                          Today   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─ 🔥 Top Priority ────────────────────────────────────────────┐ │
│ │ LENS scored 47 contacts overnight. 3 jumped to Hot tier.    │ │
│ │ Zhang Wei (BYD) signal score +23pts — funding detected.     │ │
│ │ Sarah Chen (CATL) score decayed 15pts — no activity 30d.    │ │
│ │                                                               │ │
│ │ [Review Changes] [Send to Zhang Wei] [Re-engage Sarah]      │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ 📊 Pipeline Pulse ─────┐  ┌─ 🎯 Agent Activity ────────────┐ │
│ │ [CHART NOT BARS]        │  │ LENS: Scored 47 (2m ago)      │ │
│ │ Visual funnel with      │  │ PROBE: Detected 3 signals     │ │
│ │ trend arrows            │  │ MARIA: Generated 2 campaigns  │ │
│ │                         │  │ CARL: Reviewed clusters       │ │
│ │ Hot → 12 (+3 ↑)        │  │                                │ │
│ │ Warm → 34 (-2 ↓)       │  │ Next: LENS runs at 06:00      │ │
│ │ Cold → 156             │  │ [View Agent Log]               │ │
│ └─────────────────────────┘  └────────────────────────────────┘ │
│                                                                  │
│ ┌─ ⚡ Recommended Actions ─────────────────────────────────────┐ │
│ │ 1. Send intro to Zhang Wei — timing is perfect (funding)    │ │
│ │ 2. Re-engage Sarah Chen — score decaying, act this week     │ │
│ │ 3. Follow up with Li Wei — replied 3d ago, schedule call    │ │
│ │                                                              │ │
│ │ [Execute All] [Review Each]                                  │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ 📈 This Week ───────────────────────────────────────────────┐ │
│ │ Contacts: 17,359 (+12)    Signals: 8    Scored: 234         │ │
│ │ Conversions: 3            Campaigns: 2  Meetings: 5         │ │
│ └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Deliverables

**D1: Intelligence Briefing API**
- New: `app/api/dashboard/intelligence-briefing/route.ts`
- Aggregates: overnight score changes, new signals, priority actions, agent activity
- Cache 5 min TTL, invalidate on agent completion
- Returns structured briefing with headlines + actions

**D2: Intelligence Briefing Component**
- New: `components/dashboard/IntelligenceBriefing.tsx`
- Replaces Priority Actions section on Dashboard
- Top 3-5 headlines with one-click execute
- Real-time updates via Supabase Realtime

**D3: Pipeline Funnel Chart**
- Replace ProgressBar with recharts visualization
- Trend arrows (↑↓), week-over-week change
- Interactive: click stage to filter Pipeline

**D4: Agent Activity Timeline Enhancement**
- Enhance AgentOutputFeed visibility
- "Agent is working..." indicator
- Click to expand details

---

## Phase 2: Header Intelligence Ticker (PRIORITY: HIGH)

### Current State
Plain white bar with page title + avatar

### Target State
Live intelligence feed in header showing recent AI discoveries

### Deliverables

**D5: Header Redesign**
- Update `components/layout/Header.tsx`
- Intelligence ticker: recent AI discoveries
- Real-time badge counts (signals, score changes, completions)
- Click ticker → expand activity feed

**D6: Global Notification Badge**
- Unread count of important changes
- Real-time via Supabase Realtime
- Click → dropdown/modal with changes

---

## Phase 3: Page-Level Intelligence Surfaces (PRIORITY: CRITICAL)

### Current State
Each page shows a table. User must scan to find important items.

### Target State
Each page leads with intelligence summary card.

### Deliverables

**D7: Intelligence Summary Components**
- `components/contacts/ContactsIntelligence.tsx`
- `components/signals/SignalsIntelligence.tsx`
- `components/pipeline/PipelineIntelligence.tsx`
- `components/clusters/ClustersIntelligence.tsx`
- Each shows: key metrics, top changes, recommended actions
- Placed ABOVE the table on each page

**D8: Page Intelligence APIs**
- `app/api/contacts/intelligence/route.ts`
- `app/api/signals/intelligence/route.ts`
- `app/api/pipeline/intelligence/route.ts`
- `app/api/clusters/intelligence/route.ts`

---

## Phase 4: Contact Detail Intelligence (PRIORITY: HIGH)

### Current State
Basic info + tabs (Activities, Notes, Signals)

### Target State
AI insights at top: score, trend, key insights, recommended actions

### Deliverables

**D9: Contact Intelligence Panel**
- `components/contacts/ContactIntelligencePanel.tsx`
- Shows: VISTA score, trend, AI insights, recommended actions
- Top of ContactDetail page

**D10: Contact Intelligence API**
- `app/api/contacts/[id]/intelligence/route.ts`
- DeepSeek-generated insights based on score, signals, activities

---

## Phase 5: Visual Polish (PRIORITY: MEDIUM)

**D11**: Empty states — informative and actionable, not "No data"
**D12**: Loading states — skeleton screens, "Loading intelligence..."
**D13**: Card polish — subtle gradients, better shadows, visual hierarchy

---

## Implementation Order & Timeline

| # | Deliverable | Impact | Est. |
|---|-------------|--------|------|
| 1 | D1-D2: Dashboard Briefing | 🔥 CRITICAL | 2-3d |
| 2 | D7-D8: Page Intelligence | 🔥 CRITICAL | 2-3d |
| 3 | D5-D6: Header Ticker | High | 1d |
| 4 | D9-D10: Contact Intelligence | High | 1-2d |
| 5 | D3: Pipeline Chart | Medium | 1d |
| 6 | D4: Agent Timeline | Medium | 1d |
| 7 | D11-D13: Polish | Medium | 2d |

**MVP for visible change: D1-D2 + D7-D8 + D5-D6 = 5-7 days**

---

## Success Criteria

Kevin opens VISTA and within 5 seconds sees:
1. ✅ What happened overnight (Intelligence Briefing)
2. ✅ What needs attention (Priority Actions)
3. ✅ What changed (Header Ticker)
4. ✅ What to do next (Recommended Actions)

**No clicking required. Intelligence comes to him.**

---

## Technical Notes

- Intelligence APIs: cache 5-15 min TTL
- Supabase Realtime for live updates
- DeepSeek API for generating insights
- Reuse existing: AgentStatusPanel, AgentOutputFeed, AgentTriggerButton
- Design system: navy sidebar, fuchsia accent, Libre Baskerville + DM Sans

## Git Workflow

- Branch: `trae/frontend-launch`
- Commit after each deliverable, push to GitHub
- James reviews, approves, merges to main
- **DO NOT delete spec files. DO NOT force push.**

