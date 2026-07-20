# D-01 through D-05: Dashboard Builder — Widget System, Drag-Drop, Charts, AI

> **Phase**: 4 — Dashboard | **Effort**: 4 days total | **Dependencies**: Phase 0-3
> **Ticket**: Build a fully customizable dashboard with drag-drop widgets, configurable charts, AI priorities, and settings.

---

## D-01: Widget System (1 day)

### Objective

Build the widget architecture — a pluggable system where each widget is a self-contained component that can be placed on the dashboard.

### Widget Types

| Widget | Description | Data Source |
|--------|-------------|-------------|
| **KPIWidget** | Single number + label + trend arrow | Supabase aggregate queries |
| **ChartWidget** | Bar/Line/Donut/Area chart | Supabase aggregate + group by |
| **TableWidget** | Mini table (top N records) | Supabase filtered query |
| **AIPrioritiesWidget** | AI-generated weekly priorities | DeepSeek + priority engine |
| **PipelineFunnelWidget** | Pipeline stage distribution | vista_contacts grouped by stage |
| **RecentSignalsWidget** | Last 5-10 signals | signals table, ordered by date |
| **ActivityTimelineWidget** | Recent activities timeline | campaign_activities, ordered by date |
| **ScoreDistributionWidget** | VISTA score histogram | vista_contacts priority_score |
| **SectorBreakdownWidget** | Contacts by sector (donut) | vista_contacts grouped by sector |
| **QuickActionsWidget** | Shortcut buttons to common actions | Static links |

### Widget Interface

```typescript
// src/types/dashboard.ts

export interface DashboardWidget {
  id: string;                    // UUID
  type: WidgetType;
  title: string;
  
  // Position (grid layout)
  layout: {
    x: number;                   // Column position (0-11, 12-col grid)
    y: number;                   // Row position
    w: number;                   // Width in columns (1-12)
    h: number;                   // Height in rows (1-6)
    minW?: number;               // Minimum width
    minH?: number;               // Minimum height
  };
  
  // Widget-specific config
  config: WidgetConfig;
  
  // Data refresh
  refreshInterval?: number;      // Seconds (0 = manual only)
  lastRefreshed?: string;        // ISO timestamp
}

export type WidgetType =
  | 'kpi'
  | 'chart'
  | 'table'
  | 'ai_priorities'
  | 'pipeline_funnel'
  | 'recent_signals'
  | 'activity_timeline'
  | 'score_distribution'
  | 'sector_breakdown'
  | 'quick_actions';

export interface WidgetConfig {
  // KPI config
  kpiConfig?: {
    metric: string;              // 'total_contacts', 'active_pipeline', 'avg_score', etc.
    entity: string;              // Which table to query
    filter?: FilterConfig;       // Optional filter
    comparison?: 'prev_week' | 'prev_month' | 'prev_quarter';
  };
  
  // Chart config
  chartConfig?: {
    chartType: 'bar' | 'line' | 'donut' | 'area';
    entity: string;
    xField: string;
    yField: string;
    yAggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    filter?: FilterConfig;
    limit?: number;
  };
  
  // Table config
  tableConfig?: {
    entity: string;
    columns: string[];           // Property ids to show
    filters?: FilterConfig;
    sorts?: SortConfig[];
    limit: number;               // Max rows (default 10)
  };
  
  // AI Priorities config
  aiPrioritiesConfig?: {
    topN: number;                // Show top N priorities
    groupBy: string;             // Group by property
    includeBrief: boolean;       // Show AI brief
  };
}
```

### Widget Registry

```typescript
// src/app/(dashboard)/dashboard/widgets/registry.ts

export const WIDGET_REGISTRY: Record<WidgetType, {
  component: React.ComponentType<WidgetProps>;
  defaultTitle: string;
  defaultLayout: { w: number; h: number };
  icon: string;
  description: string;
}> = {
  kpi: {
    component: KPIWidget,
    defaultTitle: 'KPI',
    defaultLayout: { w: 3, h: 2 },
    icon: 'Hash',
    description: 'Single metric with trend',
  },
  chart: {
    component: ChartWidget,
    defaultTitle: 'Chart',
    defaultLayout: { w: 6, h: 4 },
    icon: 'BarChart',
    description: 'Visualize data trends',
  },
  // ... etc for each type
};
```

### Acceptance Criteria

- [ ] Widget interface defined
- [ ] Widget registry maps types to components
- [ ] Each widget type renders with sample data
- [ ] Widgets are self-contained (fetch own data)
- [ ] Widgets handle loading/error states independently
- [ ] Widgets support configurable refresh intervals

---

## D-02: Drag-Drop Layout Editor (1.5 days)

### Objective

Build a drag-drop dashboard layout editor where users can add, remove, resize, and rearrange widgets.

### Layout Engine

Use `react-grid-layout` for the 12-column responsive grid:

```typescript
import { Responsive, WidthProvider } from 'react-grid-layout';
const ReactGridLayout = WidthProvider(Responsive);

// Dashboard layout is a 12-column grid
// Users can drag widgets to rearrange
// Users can drag edges to resize
// Layout persists per user in Supabase
```

### Database

```sql
CREATE TABLE IF NOT EXISTS user_dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT DEFAULT 'My Dashboard',
  is_default BOOLEAN DEFAULT false,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,  // Array of DashboardWidget
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);
```

### Edit Mode

```typescript
// Dashboard has two modes:
// 1. VIEW mode: widgets display data, no drag handles
// 2. EDIT mode: drag handles visible, widgets resizable/movable

// Toggle: [👁 View] [✏️ Edit] button top-right
// Edit mode:
// - Drag handle on each widget (top-left corner)
// - Resize handles on edges
// - "×" remove button on each widget
// - "+ Add Widget" button opens widget picker
// - "Save Layout" button persists to Supabase
```

### Widget Picker (Add Widget)

```
┌──────────────────────────────────────┐
│ Add Widget                           │
│                                      │
│ 🔢 KPI            📊 Chart          │
│ Single metric     Visualize data    │
│                                      │
│ 📋 Table          🎯 AI Priorities  │
│ Top records       Smart list        │
│                                      │
│ 📈 Pipeline       ⚡ Recent Signals │
│ Funnel view       Latest intel      │
│                                      │
│ 📅 Activities     🎯 Score Dist.    │
│ Timeline          Score histogram   │
│                                      │
│ 🔗 Quick Actions                    │
│ Shortcut buttons                    │
└──────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] Dashboard renders in view mode (no drag handles)
- [ ] Edit mode toggle works
- [ ] Widgets draggable in edit mode
- [ ] Widgets resizable in edit mode
- [ ] Remove widget with × button (confirmation for non-empty widgets)
- [ ] Add widget via picker
- [ ] Widget picker shows all available types with descriptions
- [ ] Configuring widget: click gear icon → modal with widget-specific settings
- [ ] Save layout → persists to user_dashboard_layouts
- [ ] Load layout on page load
- [ ] Default layout for first-time users (preset widgets)
- [ ] Multiple named layouts per user (tabs at top)
- [ ] Responsive: widgets reflow on narrow screens

---

## D-03: Chart Widget + Table Widget + KPI Widget (1 day)

### KPIWidget

```typescript
interface KPIWidgetProps extends WidgetProps {
  config: {
    metric: string;
    entity: string;
    filter?: FilterConfig;
    comparison?: 'prev_week' | 'prev_month' | 'prev_quarter';
  };
}

// Renders:
// ┌──────────────────────────┐
// │ Total Contacts           │
// │                          │
// │      1,247               │
// │      ▲ +12% vs last week │
// └──────────────────────────┘

// Metrics:
// - total_contacts: COUNT(*) from vista_contacts
// - active_pipeline: COUNT(*) WHERE stage NOT IN ('closed_won', 'closed_lost')
// - avg_score: AVG(priority_score) from vista_contacts
// - new_this_week: COUNT(*) WHERE created_at > now() - 7 days
// - signals_pending: COUNT(*) FROM signals WHERE status = 'new'
// - activities_this_week: COUNT(*) FROM campaign_activities WHERE date > now() - 7 days
```

### ChartWidget

Reuses DataChartView from E-04 but in a widget-sized container.

```typescript
// Renders configurable chart within widget bounds
// Supports: bar, line, donut, area
// Data source: any entity + aggregation
```

### TableWidget

Mini version of DataTableView showing top N records.

```typescript
// Renders:
// ┌──────────────────────────────────────┐
// │ Top Contacts by Score                │
// │                                      │
// │ Name           Company    Score      │
// │ John Smith     Acme       94    ▲   │
// │ Jane Doe       TechStart  87    ━   │
// │ ...                                  │
// │                                      │
// │ [View All →]                         │
// └──────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] KPIWidget shows correct numbers for all metrics
- [ ] KPI comparison arrows work (green ▲ for up, red ▼ for down)
- [ ] ChartWidget renders all 4 chart types
- [ ] ChartWidget configurable via gear icon
- [ ] TableWidget shows correct columns and data
- [ ] TableWidget "View All" links to full entity page
- [ ] All widgets handle empty data gracefully
- [ ] All widgets auto-refresh on configured interval

---

## D-04: AI Priorities Widget + AI Dashboard (0.5 day)

### AIPrioritiesWidget

```typescript
// Renders:
// ┌──────────────────────────────────────┐
// │ 🎯 This Week's Priorities            │
// │                                      │
// │ AI: Focus on APAC Tech this week.   │
// │ 3 contacts have fresh signals.       │
// │                                      │
// │ 1. John Smith    Acme     94  ⚡B   │
// │ 2. Jane Doe      TS       87  ⚡C   │
// │ 3. Bob Wilson    FinCo    76  ⚡M   │
// │                                      │
// │ [View Full Priorities →]             │
// └──────────────────────────────────────┘
```

Uses the same priority engine from A-06 and weekly brief from A-07.

### AI Dashboard Section

The dashboard can have an "AI Summary" widget at the top that provides a holistic overview:

```typescript
// DeepSeek pro model generates:
// "This week: 5 contacts moved forward in pipeline. 3 new signals need review. 
//  APAC Technology is the hottest sector. 2 deals at risk (stale > 14 days).
//  Recommended focus: Follow up with John Smith (Series B) and Jane Doe (new CTO)."
```

### Acceptance Criteria

- [ ] AI Priorities widget shows top 5 contacts with scores + signals
- [ ] AI brief at top of widget (2-3 sentences)
- [ ] "View Full Priorities" links to Weekly Priorities view
- [ ] Auto-refreshes daily (or on demand)
- [ ] AI Dashboard widget provides holistic summary

---

## D-05: Revenue Page + Settings + Polish (0.5 day)

### Revenue Page

A dedicated page showing revenue-related metrics (when data exists):

```typescript
// src/app/(dashboard)/revenue/page.tsx
// KPIs: Total pipeline value, weighted pipeline, avg deal size, win rate
// Chart: Pipeline value over time
// Table: Deals by stage with values
```

Note: Revenue data depends on deal values being added to contacts (new field). For now, show pipeline count by stage as placeholder.

### Dashboard Settings

```typescript
// Accessible via gear icon on dashboard
// Settings:
// - Default dashboard layout (for new users)
// - Auto-refresh interval (default: 5 minutes)
// - Date range for KPIs (default: this week)
// - Theme (light/dark — if supported)
```

### Final Polish

- [ ] Loading states for all widgets (skeleton)
- [ ] Error boundaries (one widget failure doesn't crash dashboard)
- [ ] Empty state: "Add widgets to build your dashboard"
- [ ] Keyboard shortcuts: E for edit mode, Cmd+S to save
- [ ] Print-friendly layout
- [ ] Mobile responsive (widgets stack vertically)

### Acceptance Criteria

- [ ] Revenue page renders with available data
- [ ] Dashboard settings persist per user
- [ ] All widgets have loading skeletons
- [ ] Widget errors are isolated (error boundary)
- [ ] Dashboard works on mobile (stacked layout)
- [ ] Keyboard shortcuts work
- [ ] First-time user sees default preset dashboard

---

## Dependency: react-grid-layout

```json
{
  "react-grid-layout": "^1.4.4",
  "@types/react-grid-layout": "^1.3.5"
}
```

## Default Dashboard Layout (First-Time Users)

```typescript
const DEFAULT_LAYOUT: DashboardWidget[] = [
  { id: 'w1', type: 'kpi', title: 'Total Contacts', layout: { x: 0, y: 0, w: 3, h: 2 },
    config: { metric: 'total_contacts', entity: 'contacts' }},
  { id: 'w2', type: 'kpi', title: 'Active Pipeline', layout: { x: 3, y: 0, w: 3, h: 2 },
    config: { metric: 'active_pipeline', entity: 'contacts' }},
  { id: 'w3', type: 'kpi', title: 'Avg Score', layout: { x: 6, y: 0, w: 3, h: 2 },
    config: { metric: 'avg_score', entity: 'contacts' }},
  { id: 'w4', type: 'kpi', title: 'New Signals', layout: { x: 9, y: 0, w: 3, h: 2 },
    config: { metric: 'signals_pending', entity: 'signals' }},
  { id: 'w5', type: 'pipeline_funnel', title: 'Pipeline Funnel', layout: { x: 0, y: 2, w: 6, h: 4 },
    config: {}},
  { id: 'w6', type: 'sector_breakdown', title: 'By Sector', layout: { x: 6, y: 2, w: 6, h: 4 },
    config: {}},
  { id: 'w7', type: 'ai_priorities', title: 'Weekly Priorities', layout: { x: 0, y: 6, w: 8, h: 4 },
    config: { topN: 10, groupBy: 'sector', includeBrief: true }},
  { id: 'w8', type: 'recent_signals', title: 'Recent Signals', layout: { x: 8, y: 6, w: 4, h: 4 },
    config: {}},
  { id: 'w9', type: 'activity_timeline', title: 'Recent Activity', layout: { x: 0, y: 10, w: 6, h: 4 },
    config: {}},
  { id: 'w10', type: 'quick_actions', title: 'Quick Actions', layout: { x: 6, y: 10, w: 6, h: 2 },
    config: {}},
];
```
