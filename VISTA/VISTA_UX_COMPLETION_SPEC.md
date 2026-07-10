# VISTA UX Completion — Consolidated Spec

**Status:** Ready for Implementation
**Author:** James/AI (PM)
**Date:** 2026-07-10
**Executor:** Trae
**Priority:** P0 — This is the final push to make VISTA look and feel like a product, not a developer demo.

---

## Problem Statement

After 5 waves of backend development and 2 waves of frontend components, VISTA still looks and behaves like a generic admin panel. Bugs in core pages (Contacts, Dashboard) undermine trust. The design system exists (navy sidebar, fuchsia accent, Libre Baskerville headings) but is inconsistently applied. Intelligence is bolted on rather than foundational.

**This spec consolidates 5 workstreams into one ticket:**
1. Bug fixes (ContactDetail + Contacts list)
2. Design system cleanup (consistent visual language)
3. Dashboard Intelligence Briefing (paradigm shift)
4. Data visualization (charts instead of progress bars)
5. AI-generated recommendations (replace hardcoded logic)

---

## Design System Rules — ENFORCE THESE EVERYWHERE

These are non-negotiable. Every component must follow them.

### Colors
```
Primary:   #1C1C1E (navy) — sidebar, text headings
Accent:    #C108AB (fuchsia) — CTAs, active states, highlights only
Background: #FFFFFF — page background, cards
Surface:   #F8F8F8 — subtle section backgrounds (not colored tints)
Border:    #E5E5E5 — card borders, dividers
Text:      #1C1C1E (primary), #6B7280 (secondary), #9CA3AF (tertiary)
```

**BANNED:** `bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-indigo-50`, `bg-slate-50`, `bg-red-50`, `bg-green-50` — these colored card backgrounds clash with the design system. Use `bg-surface` (#F8F8F8) with colored LEFT BORDER or colored ICON instead.

### Typography
```
Headings (h1-h4): font-heading (Libre Baskerville), font-bold
Body: font-sans (DM Sans), font-normal
Labels/captions: font-sans, text-xs, text-secondary, uppercase tracking-wide
```

### Spacing
```
Page sections: space-y-8
Card content: p-6
Grid gaps: gap-4 (standard), gap-6 (between major sections)
Button padding: h-10 (default), h-8 (small)
```

### Card Style
```
Default: bg-white border border-[#E5E5E5] rounded-xl shadow-sm
Hover: shadow-md transition-shadow
NO colored backgrounds. Use left-border accent for category distinction:
  border-l-4 border-l-accent-fuchsia (intelligence/AI)
  border-l-4 border-l-tier-hot (urgent/hot)
  border-l-4 border-l-tier-warm (active)
```

### Score Display — ONE WAY ONLY
Use the existing `<ScoreGauge>` component. Never use Progress bars, never raw numbers, never colored text for scores. ScoreGauge everywhere a score appears.

### Status/Tier Badges
Use the existing `<TierBadge>` component. Custom badges should follow:
```
Hot:        bg-tier-hot/10 text-tier-hot border-tier-hot/20
Engaged:    bg-tier-engaged/10 text-tier-engaged border-tier-engaged/20
Warm:       bg-tier-warm/10 text-tier-warm border-tier-warm/20
Cold:       bg-tier-cold/10 text-tier-cold border-tier-cold/20
Committed:  bg-tier-committed/10 text-tier-committed border-tier-committed/20
```
All badges: `px-2.5 py-0.5 rounded-full text-xs font-medium border`

---

## Part 1: Bug Fixes (P0 — Fix First)

### Bug 1.1: ContactDetail Score Breakdown is Fake

**File:** `app/contacts/[id]/ContactDetail.tsx` (lines ~430-510)

**Current:** Shows "Value Score", "Function Score", "Engagement Score", "Cluster Fit Score" with hardcoded `Math.round(vista_v * 30 / 100)` formulas. The "Total" doesn't sum the displayed items.

**Fix:** Replace the entire Score Breakdown section with the actual V/I/S/T/A breakdown from the database:

```tsx
<div className="space-y-3">
  <h4 className="text-sm font-heading font-bold">VISTA Score Breakdown</h4>
  {[
    { label: 'V — Value', value: contact.vista_v, desc: 'Company size, revenue, strategic fit' },
    { label: 'I — Intensity', value: contact.vista_i, desc: 'Signal frequency, engagement momentum' },
    { label: 'S — Strategic', value: contact.vista_s, desc: 'Seniority, decision-making power' },
    { label: 'T — Timing', value: contact.vista_t, desc: 'Recent triggers, urgency signals' },
    { label: 'A — Ecosystem', value: contact.vista_a, desc: 'Cluster membership, network position' },
  ].map((item) => (
    <div key={item.label} className="flex items-center gap-3">
      <span className="text-xs font-medium w-24 text-secondary">{item.label}</span>
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent-fuchsia rounded-full transition-all"
          style={{ width: `${(item.value || 0)}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right">{item.value || 0}</span>
    </div>
  ))}
  <div className="flex justify-between pt-2 border-t border-border">
    <span className="text-sm font-bold">Composite</span>
    <ScoreGauge score={contact.vista_composite || 0} size="sm" />
  </div>
</div>
```

### Bug 1.2: "Next Best Action" is Hardcoded if/else

**File:** `app/contacts/[id]/ContactDetail.tsx` — `getNextBestAction()` function (lines ~40-110)

**Fix:** Replace `getNextBestAction()` with a call to the existing DeepSeek-powered recommendations API:

```tsx
// Replace the entire getNextBestAction function
const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])

useEffect(() => {
  fetch(`/api/intelligence/contact/${contact.id}/recommendations`)
    .then(res => res.json())
    .then(data => setRecommendations(data.recommendations || []))
    .catch(() => {})
}, [contact.id])
```

Display recommendations in a card:
```tsx
{recommendations.length > 0 && (
  <Card className="border-l-4 border-l-accent-fuchsia">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-accent-fuchsia" />
        AI Recommendations
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {recommendations.map((rec, i) => (
        <div key={i} className="p-4 bg-surface rounded-lg">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold">{rec.action}</h4>
            <Badge className="text-xs">{rec.urgency}</Badge>
          </div>
          <p className="text-sm text-secondary mt-1">{rec.why}</p>
          <p className="text-xs text-tertiary mt-1">Impact: {rec.impact}</p>
          <div className="flex gap-2 mt-3">
            {rec.channels?.includes('email') && (
              <Button size="sm" variant="outline" onClick={() => setEmailComposerOpen(true)}>
                <Mail className="h-3 w-3 mr-1" /> Email
              </Button>
            )}
            {rec.channels?.includes('linkedin') && (
              <Button size="sm" variant="outline">
                <ExternalLink className="h-3 w-3 mr-1" /> LinkedIn
              </Button>
            )}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

### Bug 1.3: "Recommended Action" Text in Overview is Hardcoded

**File:** `app/contacts/[id]/ContactDetail.tsx` — Overview tab (lines ~480-500)

**Fix:** Remove the hardcoded if/else "Recommended Action" blue box entirely. The AI Recommendations card above replaces it. If the API call fails, show nothing (don't fall back to hardcoded text).

### Bug 1.4: Edit Button Does Nothing

**File:** `app/contacts/[id]/ContactDetail.tsx` (line ~345)

**Fix:** Add onClick handler:
```tsx
<Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
  <Edit3 className="h-4 w-4 mr-2" />
  {editMode ? 'Cancel' : 'Edit'}
</Button>
```
For now, just toggle edit mode state. Full edit form can be a follow-up ticket.

### Bug 1.5: Campaigns Tab Shows UUIDs

**File:** `app/contacts/[id]/ContactDetail.tsx` — Campaigns tab (lines ~600-640)

**Current:** `Campaign #{campaign.campaign_id}` — shows UUID.

**Fix:** Fetch campaign name from the campaigns table:
```tsx
// In fetchCampaigns(), join with campaigns table to get name
const fetchCampaigns = async () => {
  const res = await fetch(`/api/campaigns/contacts/${contact.id}`)
  const data = await res.json()
  setCampaigns(data.campaigns || [])
}

// In the render, if campaign has a name field:
<span className="font-medium">{campaign.name || campaign.campaign_name || `Campaign #${campaign.campaign_id.slice(0, 8)}`}</span>
```

If the API doesn't return campaign name, update `app/api/campaigns/contacts/[id]/route.ts` to JOIN with the `campaigns` table and include the campaign name.

### Bug 1.6: Contacts "Create Contact" Button is Hardcoded

**File:** `app/contacts/page.tsx` (lines ~60-75)

**Fix:** Replace the inline onClick with a proper modal:
```tsx
const [createModalOpen, setCreateModalOpen] = useState(false)

<Button onClick={() => setCreateModalOpen(true)} className="bg-accent-fuchsia hover:bg-accent-hover text-white">
  + Create Contact
</Button>

{/* Add a simple CreateContactModal component */}
<CreateContactModal 
  isOpen={createModalOpen} 
  onClose={() => setCreateModalOpen(false)}
  onCreated={() => router.refresh()}
/>
```

Create `components/contacts/CreateContactModal.tsx` with fields: name, company, email, role, phone, location, function (dropdown).

### Bug 1.7: Score Column Shows "Stain" in Tooltip

**File:** `components/contacts/ContactsTable.tsx` (score column tooltip, lines ~220-240)

**Fix:** Remove "Stain" from the tooltip. Replace with the 5 VISTA components:
```tsx
<TooltipContent side="right" className="w-48 p-3 space-y-2">
  <div className="font-semibold text-white">VISTA Score Breakdown</div>
  <div className="space-y-1 text-xs">
    <div className="flex justify-between">
      <span className="text-white/70">V — Value</span>
      <span className="font-medium">{contact.vista_v ?? '-'}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-white/70">I — Intensity</span>
      <span className="font-medium">{contact.vista_i ?? '-'}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-white/70">S — Strategic</span>
      <span className="font-medium">{contact.vista_s ?? '-'}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-white/70">T — Timing</span>
      <span className="font-medium">{contact.vista_t ?? '-'}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-white/70">A — Ecosystem</span>
      <span className="font-medium">{contact.vista_a ?? '-'}</span>
    </div>
    <div className="border-t border-white/20 pt-1 flex justify-between">
      <span className="text-white/70">Composite</span>
      <span className="font-medium">{contact.vista_composite ?? '-'}</span>
    </div>
  </div>
</TooltipContent>
```

### Bug 1.8: No AgentTriggerButton on ContactDetail

**File:** `app/contacts/[id]/ContactDetail.tsx`

**Fix:** Add AgentTriggerButton below the header, next to the action buttons:
```tsx
import { AgentTriggerButton } from "@/components/intelligence/agent-trigger-button"

// In the header area, after the Edit button:
<div className="flex gap-2">
  <AgentTriggerButton 
    agent="LENS" 
    contactIds={[contact.id]}
    label="Re-score"
    variant="outline"
    size="sm"
  />
  <AgentTriggerButton 
    agent="PROBE" 
    contactIds={[contact.id]}
    label="Detect Signals"
    variant="outline"
    size="sm"
  />
</div>
```

---

## Part 2: Design System Cleanup (Apply Consistently)

### Rule: Every card uses the same base style

**Create `components/ui/vista-card.tsx`:**
```tsx
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function VistaCard({ 
  children, 
  className, 
  accent, // 'fuchsia' | 'hot' | 'warm' | 'none'
  ...props 
}: React.ComponentProps<typeof Card> & { accent?: string }) {
  return (
    <Card 
      className={cn(
        "border border-[#E5E5E5] rounded-xl shadow-sm bg-white",
        accent === 'fuchsia' && "border-l-4 border-l-accent-fuchsia",
        accent === 'hot' && "border-l-4 border-l-tier-hot",
        accent === 'warm' && "border-l-4 border-l-tier-warm",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
```

Then update ALL pages to use `<VistaCard>` instead of raw `<Card>`.

### Rule: Page headers follow a consistent pattern

Every page should have:
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-2xl font-heading font-bold text-primary-navy">Page Title</h1>
    <p className="text-sm text-secondary mt-1">Subtitle description</p>
  </div>
  <div className="flex items-center gap-2">
    {/* Action buttons */}
  </div>
</div>
```

Currently some pages have this, some don't. Enforce it everywhere.

### Rule: Tables have consistent styling

All tables (Contacts, Signals, Pipeline, Campaigns, Clusters) should use:
```tsx
<Table>
  <TableHeader>
    <TableRow className="border-b-2 border-[#E5E5E5] hover:bg-transparent">
      <TableHead className="text-xs font-semibold uppercase tracking-wide text-secondary">
        Column Name
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-surface transition-colors">
      ...
    </TableRow>
  </TableBody>
</Table>
```

### Rule: Empty states are informative

Replace all generic empty states with:
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="h-16 w-16 rounded-full bg-surface flex items-center justify-center mb-4">
    <Icon className="h-8 w-8 text-tertiary" />
  </div>
  <h3 className="text-lg font-heading font-bold text-primary">No {thing} yet</h3>
  <p className="text-sm text-secondary mt-2 max-w-sm">
    {Helpful description of what goes here and how to get started}
  </p>
  <Button className="mt-4 bg-accent-fuchsia hover:bg-accent-hover text-white">
    {Action to create first item}
  </Button>
</div>
```

### Specific Files to Update

| File | What to fix |
|------|-------------|
| `app/contacts/[id]/ContactDetail.tsx` | Remove bg-blue-50/amber-50/purple-50 cards, use VistaCard with accent borders |
| `app/contacts/page.tsx` | Enforce page header pattern |
| `app/dashboard/Dashboard.tsx` | Use VistaCard, consistent KPI card style |
| `app/signals/SignalsPage.tsx` | Page header + table styling + empty state |
| `app/pipeline/PipelinePage.tsx` | Page header + card styling |
| `app/campaigns/CampaignsPage.tsx` | Page header + table styling + empty state |
| `app/clusters/ClustersPage.tsx` | Page header + card styling + empty state |
| `components/layout/Header.tsx` | See Part 3 (Intelligence Ticker) |

---

## Part 3: Dashboard Intelligence Briefing (Paradigm Shift)

This is the most important deliverable. When Kevin opens VISTA, he should immediately see what happened, what changed, and what to do — without clicking anything.

### 3.1 New API: Intelligence Briefing

**File:** `app/api/dashboard/intelligence-briefing/route.ts`

**Purpose:** Aggregate overnight changes, new signals, score movements, and agent activity into a structured briefing.

**Logic:**
```
1. Query vista_contacts for score changes in last 24h (compare current vs. previous score)
2. Query signals for new signals detected in last 24h
3. Query agent_activity_log for agent runs in last 24h
4. Calculate top movers (biggest score increases)
5. Calculate at-risk contacts (biggest score decreases)
6. Return structured JSON with:
   - headlines: string[] (3-5 key events)
   - top_movers: { contact_name, company, score_change, direction }[]
   - at_risk: { contact_name, company, score_change }[]
   - new_signals: { signal_type, company, contact_name }[]
   - agent_activity: { agent, action, timestamp, results_summary }[]
   - pipeline_summary: { hot: number, warm: number, cold: number, deltas }
```

Use DeepSeek (`callDeepSeekJSON`) to generate natural-language headlines from the raw data:
```
Given this data:
- 47 contacts rescored, 3 jumped to Hot tier
- Zhang Wei (BYD) signal score +23 — funding detected
- Sarah Chen (CATL) score -15 — no activity 30 days
- PROBE detected 3 new signals
- LENS completed scoring run at 06:00

Generate 3-5 concise headlines for a morning briefing. Each headline should be one sentence, name specific people/companies, and suggest an action.
```

### 3.2 Intelligence Briefing Component

**File:** `components/dashboard/IntelligenceBriefing.tsx`

**Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ VISTA Intelligence Briefing              Today, July 10     │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ 🔥 LENS scored 47 contacts overnight. 3 jumped to Hot.     │
│    Zhang Wei (BYD) signal spiked +23pts — funding round.    │
│    Sarah Chen (CATL) decayed 15pts — no activity 30 days.  │
│                                                              │
│ [Review Score Changes]  [Contact Zhang Wei]  [Re-engage]   │
│                                                              │
│ ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│ │ 🔢 Top      │ │ 📡 Signals   │ │ 🤖 Agent Activity      │ │
│ │ Movers      │ │ (24h)        │ │                        │ │
│ │             │ │              │ │ LENS: Scored 47 (2m)  │ │
│ │ +23 Zhang W │ │ 3 new        │ │ PROBE: 3 signals (1h) │ │
│ │ +18 Li Wei  │ │ Funding: 1   │ │ CARL: Clusters (3h)   │ │
│ │ +12 Chen X  │ │ Job change:1 │ │ MARIA: 0 campaigns     │ │
│ │ +8 Wang F   │ │ Engagement:1 │ │                        │ │
│ └─────────────┘ └──────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
export function IntelligenceBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/intelligence-briefing')
      .then(r => r.json())
      .then(data => { setBriefing(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <BriefingSkeleton />
  if (!briefing) return null

  return (
    <VistaCard accent="fuchsia" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold">
          VISTA Intelligence Briefing
        </h2>
        <span className="text-xs text-secondary">Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Headlines */}
      <div className="space-y-2 mb-6">
        {briefing.headlines.map((headline, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="text-accent-fuchsia font-bold mt-0.5">•</span>
            <span>{headline}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <Button size="sm" variant="outline" onClick={() => router.push('/contacts?sort=score_change')}>
          Review Changes
        </Button>
        {briefing.at_risk?.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => router.push('/contacts?filter=at_risk')}>
            Re-engage At-Risk
          </Button>
        )}
      </div>

      {/* Three-column stats */}
      <div className="grid grid-cols-3 gap-4">
        <BriefingColumn title="Top Movers" icon={TrendingUp}>
          {briefing.top_movers?.map((m, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span>+{m.score_change} {m.contact_name}</span>
              <span className="text-secondary">{m.company}</span>
            </div>
          ))}
        </BriefingColumn>
        <BriefingColumn title="New Signals" icon={Activity}>
          {briefing.new_signals?.map((s, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{s.signal_type}</span> — {s.company}
            </div>
          ))}
        </BriefingColumn>
        <BriefingColumn title="Agent Activity" icon={Cpu}>
          {briefing.agent_activity?.map((a, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{a.agent}:</span> {a.results_summary}
            </div>
          ))}
        </BriefingColumn>
      </div>
    </VistaCard>
  )
}
```

### 3.3 Dashboard Reorganization

**File:** `app/dashboard/Dashboard.tsx`

**New layout order (top to bottom):**
1. **Intelligence Briefing** (new — replaces static KPI welcome)
2. **KPI Cards** (keep but restyle with VistaCard, add sparklines)
3. **Pipeline Funnel Chart** (recharts — see Part 4)
4. **Agent Status Panel** (existing — keep)
5. **Quick Actions** (existing — keep)
6. **Agent Output Feed** (existing — keep)
7. **Priority Actions** (existing — keep but restyle)

Remove: The static "Welcome back, Kevin" greeting. The briefing replaces it.

---

## Part 4: Data Visualization (Charts)

### 4.1 Pipeline Funnel Chart

**File:** `app/dashboard/Dashboard.tsx` — replace the ProgressBar pipeline section

Use recharts (already installed):
```tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'

const funnelData = pipelineStages.map(stage => ({
  name: stage.name,
  count: stage.count,
  delta: stage.count - stage.previousCount,
}))

<ResponsiveContainer width="100%" height={200}>
  <BarChart data={funnelData} layout="vertical">
    <XAxis type="number" hide />
    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
      {funnelData.map((entry, i) => (
        <Cell key={i} fill={funnelColors[i]} />
      ))}
      <LabelList dataKey="count" position="right" fontSize={12} />
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

Funnel colors (gradient from hot to cold):
```
Prospect:     #94a3b8 (slate)
Contacted:    #3b82f6 (blue)
Engaged:      #22c55e (green)
Meeting:      #a855f7 (purple)
Proposal:     #f97316 (orange)
Negotiation:  #ef4444 (red)
Closed Won:   #22c55e (green)
```

Show delta next to each bar: "+3 ↑" or "-2 ↓"

### 4.2 KPI Sparklines

On each KPI card, add a small 7-day trend sparkline below the number:

```tsx
<div className="mt-2">
  <Sparkline data={kpi.last7Days} color={delta > 0 ? '#22c55e' : '#ef4444'} />
  <span className={`text-xs ${delta > 0 ? 'text-success' : 'text-error'}`}>
    {getKPIChange(kpi.value, kpi.delta)}
  </span>
</div>
```

Create `components/ui/sparkline.tsx`:
```tsx
// Simple SVG sparkline — no external library needed
export function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => 
    `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`
  ).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="h-8 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  )
}
```

---

## Part 5: AI Recommendations (Replace Hardcoded Logic)

### 5.1 Contact Detail — Next Best Action

Already covered in Bug 1.2 above. Uses `/api/intelligence/contact/[id]/recommendations`.

### 5.2 Dashboard — Executive Brief

**File:** `app/api/intelligence/dashboard/executive-brief/route.ts` — already exists.

Ensure it's called by the Intelligence Briefing API to generate natural-language headlines.

### 5.3 Cluster Narrative

**File:** `app/api/intelligence/cluster/[id]/insights/route.ts` — already exists.

Ensure the Clusters page calls this API and displays the AI-generated narrative above the cluster detail table.

### 5.4 Remove All Remaining Hardcoded If/Else

Search for these patterns across the codebase and replace:
```bash
# Find all hardcoded intelligence logic
grep -rn "score >= 70\|score >= 50\|score < 50\|daysSinceActivity > 30" app/ components/ --include="*.tsx" --include="*.ts"
```

Replace each with a call to the appropriate DeepSeek-powered API route.

---

## Implementation Order

| # | Task | Impact | Est. |
|---|------|--------|------|
| 1 | Part 1: All bug fixes (1.1-1.8) | 🔥 CRITICAL | 1 day |
| 2 | Part 2: VistaCard + design system (2.1-2.4) | 🔥 CRITICAL | 1 day |
| 3 | Part 3: Intelligence Briefing (3.1-3.3) | 🔥 CRITICAL | 2 days |
| 4 | Part 4: Charts (4.1-4.2) | High | 1 day |
| 5 | Part 5: AI recommendations cleanup | Medium | 1 day |

**Total: ~6 days**

## Acceptance Criteria

1. ✅ All 8 contact page bugs fixed
2. ✅ No colored background cards (bg-blue-50 etc.) anywhere in the app
3. ✅ Dashboard opens → first thing visible is Intelligence Briefing with AI-generated headlines
4. ✅ Pipeline funnel is a visual chart, not progress bars
5. ✅ KPI cards show trend sparklines
6. ✅ Contact Detail shows real V/I/S/T/A breakdown, not fake scores
7. ✅ Contact Detail "Next Best Action" is AI-generated, not hardcoded
8. ✅ Score displayed consistently via ScoreGauge component everywhere
9. ✅ All empty states are informative with action buttons
10. ✅ `npm run build` passes with zero errors
11. ✅ Deployed to Vercel and live on `vista-azure-delta-theta.vercel.app`

## Git Workflow

- Branch: `trae/ux-completion`
- Commit after each Part (5 commits minimum)
- Push to GitHub after each Part
- James reviews, approves, merges to main
- **DO NOT delete spec files. DO NOT force push. DO NOT put test files outside tests/ directory.**
