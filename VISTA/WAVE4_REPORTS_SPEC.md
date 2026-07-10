# Wave 4: Reports — Spec

**Target branch:** `trae/agent-Kqk5cW`
**Estimated time:** 2-3 hours
**Prerequisite:** Wave 1 + Wave 2 merged to main

---

## Overview

Wave 4 adds AI-generated intelligence reports across VISTA. Kevin can generate cluster narratives, signal digests, and pipeline reviews with one click. Reports are AI-written, editable, and exportable as PDF or email.

**Existing:** `GET /api/intelligence/dashboard/executive-brief` (Wave 1) — daily executive summary. This is already live. Wave 4 adds the other report types.

---

## Deliverables

### Deliverable 14: Cluster Intelligence Report

**Route:** `GET /api/intelligence/reports/cluster/[id]`

**What it does:**
- Takes a cluster_id
- Queries cluster metadata from `density_clusters` + top contacts + recent signals
- Calls DeepSeek pro to generate a narrative intelligence report
- Returns formatted report with narrative, strategy, key contacts, risks, opportunities

**DeepSeek prompt structure:**
```
You are writing a cluster intelligence brief for Kevin Hong, Managing Partner at LYC Partners.

Cluster: {cluster_name}
Sector: {sector}
Geography: {geography}
Contacts: {top 10 contacts with roles, companies, scores}
Recent signals: {last 5 signals related to this cluster}
Cluster stats: {contact count, avg score, pipeline distribution}

Write a 500-800 word intelligence brief covering:
1. **Cluster Narrative** — What is this cluster about? Why does it matter now?
2. **Key Players** — Top 3-5 contacts to watch and why
3. **Market Signals** — What's moving in this space (based on recent signals)
4. **Strategic Opportunity** — Where is the white space for LYC Partners?
5. **Recommended Actions** — Top 3 next moves with timeline
6. **Risks** — What could go wrong or be missed

Tone: Board-level briefing. Data-driven. No fluff.

Return JSON: {
  "cluster_id": "...",
  "cluster_name": "...",
  "generated_at": "ISO timestamp",
  "narrative": "full markdown text",
  "key_players": [{"name": "...", "company": "...", "reason": "..."}],
  "recommended_actions": [{"action": "...", "priority": "high|medium|low", "timeline": "..."}],
  "risks": ["..."],
  "word_count": number
}
```

**Response:**
```typescript
{
  success: true,
  report: ClusterIntelligenceReport
}
```

---

### Deliverable 15: Signal Digest

**Route:** `GET /api/intelligence/reports/signal-digest`

**Query params:**
- `days` — lookback window (default: 7)
- `signal_type` — optional filter (e.g., "funding", "leadership-change")

**What it does:**
- Queries signals from the last N days
- Groups by signal_type
- Calls DeepSeek pro to synthesize into a readable digest

**DeepSeek prompt structure:**
```
You are compiling a daily/weekly signal digest for Kevin Hong, Managing Partner at LYC Partners.

Time period: Last {days} days
Total signals: {count}
By type: {breakdown by signal_type}

Signals:
{list of signals with title, type, company, insights, detected_date}

Write a 400-600 word signal digest:
1. **Headline** — The single most important signal and why it matters
2. **By Category** — Group insights by signal type (funding, leadership, M&A, etc.)
3. **Pattern Analysis** — Any cross-cutting themes or emerging trends?
4. **Action Items** — Top 3 contacts to reach out to based on these signals
5. **Watch List** — Signals that need monitoring but not immediate action

Tone: Morning briefing. Concise. Actionable.

Return JSON: {
  "period": "Last N days",
  "generated_at": "ISO timestamp",
  "headline": { "signal_id": "...", "title": "...", "why_it_matters": "..." },
  "digest_markdown": "full text",
  "action_items": [{"contact_id": "...", "contact_name": "...", "reason": "...", "signal_id": "..."}],
  "watch_list": [{"signal_id": "...", "title": "...", "monitor_by": "date"}],
  "total_signals_analyzed": number
}
```

---

### Deliverable 16: Pipeline Review

**Route:** `GET /api/intelligence/reports/pipeline-review`

**Query params:**
- `weeks` — lookback window (default: 4)

**What it does:**
- Queries pipeline stage distribution, movement, conversion rates
- Calls DeepSeek pro to generate a weekly/monthly pipeline health report

**DeepSeek prompt structure:**
```
You are writing a pipeline health review for Kevin Hong, Managing Partner at LYC Partners.

Time period: Last {weeks} weeks
Pipeline stats:
- Total contacts: {count}
- Stage distribution: {Prospect: N, Contacted: N, Qualified: N, ...}
- Stage movements: {how many moved forward/back in period}
- Conversion rate: {from X to Y}
- Top movers (score changes): {list}
- Stale contacts (no activity > 30 days): {count and examples}

Write a 400-600 word pipeline review:
1. **Pipeline Health Score** — 1-10 with rationale
2. **Movement Summary** — What moved, what didn't
3. **Bottlenecks** — Where are contacts stuck?
4. **Wins** — Best conversions or score improvements
5. **At Risk** — Contacts losing momentum
6. **Recommended Actions** — Top 3 priorities for next week

Return JSON: {
  "period": "Last N weeks",
  "generated_at": "ISO timestamp",
  "health_score": number,
  "review_markdown": "full text",
  "bottlenecks": [{"stage": "...", "count": number, "recommendation": "..."}],
  "at_risk_contacts": [{"id": "...", "name": "...", "company": "...", "reason": "..."}],
  "recommended_actions": [{"action": "...", "priority": "high|medium|low", "expected_impact": "..."}]
}
```

---

### Deliverable 17: Reusable "Generate Report" Button Component

**Component:** `components/intelligence/generate-report-button.tsx`

**Props:**
```typescript
interface GenerateReportButtonProps {
  reportType: "cluster" | "signal-digest" | "pipeline-review" | "executive-brief"
  resourceId?: string          // cluster_id for cluster reports
  label?: string               // Custom button label
  variant?: "default" | "outline" | "ghost"
  onComplete?: (report: any) => void  // Callback with generated report
}
```

**Behavior:**
1. Button click → calls appropriate API endpoint
2. Shows loading spinner during generation (typically 5-15s)
3. On success → opens a ReportViewer modal with the generated content
4. ReportViewer has: Edit (markdown), Copy, Export PDF, Email buttons

**Pages to add the button:**

| Page | Report Type | Position |
|---|---|---|
| `app/clusters/page.tsx` | cluster | Each cluster row → "Generate Brief" |
| `app/clusters/[id]/ClusterDetail.tsx` | cluster | Header area |
| `app/signals/page.tsx` | signal-digest | Page header → "Generate Digest" |
| `app/pipeline/page.tsx` | pipeline-review | Page header → "Generate Review" |
| `app/dashboard/Dashboard.tsx` | executive-brief | Already exists (Wave 1) |

---

### Deliverable 18: Report Viewer + Export

**Component:** `components/intelligence/report-viewer.tsx`

**Features:**
- Renders AI-generated markdown content
- Edit mode — allows Kevin to edit the text before export
- Copy button — copies markdown to clipboard
- Export PDF — uses browser `window.print()` with print-optimized CSS
- Email button — opens EmailComposer with report content pre-filled as body

**Export PDF implementation:**
```typescript
const handleExportPDF = () => {
  // Create a print-friendly version
  const printWindow = window.open('', '_blank')
  printWindow?.document.write(`
    <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: 'Libre Baskerville', serif; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { color: #1C1C1E; }
          h2 { color: #C108AB; }
          .metadata { color: #666; font-size: 0.9em; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${report.title}</h1>
        <p class="metadata">Generated: ${new Date(report.generated_at).toLocaleString()} | LYC Partners</p>
        <div>${renderMarkdown(report.content)}</div>
      </body>
    </html>
  `)
  printWindow?.document.close()
  printWindow?.print()
}
```

**Email button implementation:**
```typescript
const handleEmailReport = () => {
  // Open EmailComposer with report as body
  setEmailComposerOpen(true)
  setPrefilledSubject(`[LYC Intelligence] ${report.title}`)
  setPrefilledBody(report.content)
}
```

---

## Execution Order

1. **14** — Cluster Intelligence Report endpoint (most used report type)
2. **15** — Signal Digest endpoint
3. **16** — Pipeline Review endpoint
4. **17** — GenerateReportButton component
5. **18** — ReportViewer + Export component

---

## Existing Code to Modify/Create

| File | Change |
|---|---|
| `app/api/intelligence/reports/cluster/[id]/route.ts` | NEW |
| `app/api/intelligence/reports/signal-digest/route.ts` | NEW |
| `app/api/intelligence/reports/pipeline-review/route.ts` | NEW |
| `components/intelligence/generate-report-button.tsx` | NEW |
| `components/intelligence/report-viewer.tsx` | NEW |
| `app/clusters/page.tsx` | ADD GenerateReportButton per cluster |
| `app/signals/page.tsx` | ADD GenerateReportButton in header |
| `app/pipeline/page.tsx` | ADD GenerateReportButton in header |
| `lib/types.ts` | ADD report interfaces |

---

## Rules

1. **Use `callDeepSeekJSON<T>()`** from `lib/deepseek.ts`
2. **Pro model for reports** — these are board-level documents, quality matters
3. **Cache reports in `generated_reports` table** — avoid re-generating same report within 24h
4. **Log generation to `activities` table** — track who generated what, when
5. **Brand colors in PDF export** — navy (#1C1C1E) headings, fuchsia (#C108AB) accents
6. **Don't delete any spec docs** (INTELLIGENCE_LAYER_SPEC.md, NEXT_TICKETS.md, WAVE2_BULK_OPS_SPEC.md, WAVE3_ACTION_ENGINE_SPEC.md)
7. **Test files go in `tests/`** — not repo root
8. **Push to GitHub** before saying "done"
