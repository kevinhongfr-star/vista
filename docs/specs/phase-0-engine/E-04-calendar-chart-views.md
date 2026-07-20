# E-04: Calendar View + Chart View

> **Phase**: 0 — Foundation | **Effort**: 1 day | **Dependencies**: E-01, E-02
> **Ticket**: Build Calendar grid view and Chart view (bar/line/donut).

---

## Objective

Build two additional view renderers: `<DataCalendarView>` for date-based entities (Signals, Activities) and `<DataChartView>` for aggregated visualizations.

## Acceptance Criteria — Calendar View

- [ ] `DataCalendarView.tsx` renders month/week/day grid
- [ ] Events positioned by dateField value
- [ ] Multi-day events span across cells (if endDateField provided)
- [ ] Click event → navigates to detail page
- [ ] Click empty date cell → "Create new" action (if createRecord enabled)
- [ ] Navigation: prev/next month/week/day, "Today" button
- [ ] Event title shows titleField value
- [ ] Event shows color based on type/status selectOption color
- [ ] Today highlighted
- [ ] Handles 100+ events without performance issues
- [ ] Responsive: day names visible, cells show 2-3 event titles + "+N more"

## Component API — Calendar

```typescript
interface DataCalendarViewProps {
  config: EntityConfig;
  data: Record<string, unknown>[];
  calendarConfig: Required<ViewConfig>['calendarConfig'];
  
  // Navigation state (persisted in saved view)
  currentDate: Date;
  onDateChange: (date: Date) => void;
  mode: 'month' | 'week' | 'day';
  onModeChange: (mode: 'month' | 'week' | 'day') => void;
  
  onEventClick?: (row: Record<string, unknown>) => void;
  onCreateEvent?: (date: Date) => void;
  isLoading?: boolean;
}
```

## Acceptance Criteria — Chart View

- [ ] `DataChartView.tsx` renders bar, line, donut, area charts
- [ ] X-axis groups by xField property values
- [ ] Y-axis aggregates by yField using yAggregation
- [ ] Chart type switcher (user can toggle between bar/line/donut/area)
- [ ] Tooltips on hover showing exact values
- [ ] Legend when multiple series
- [ ] Responsive: resizes with container
- [ ] Click bar/segment → filters table to that group (drill-down)
- [ ] Empty state when no data

## Component API — Chart

```typescript
interface DataChartViewProps {
  config: EntityConfig;
  data: Record<string, unknown>[];
  chartConfig: Required<ViewConfig>['chartConfig'];
  
  // Allow user to change chart type
  onChartConfigChange?: (config: Partial<ViewConfig['chartConfig']>) => void;
  
  // Drill-down: click a bar/segment → filter
  onDrillDown?: (field: string, value: string) => void;
  
  isLoading?: boolean;
}
```

## Implementation Guidance

### Calendar
1. Install: `pnpm add date-fns`
2. Build month grid: 7 columns × 5-6 rows
3. Calculate event positions using date-fns
4. Handle events spanning multiple days
5. Navigation: addMonths/subMonths/addWeeks/subWeeks

### Chart
1. Install: `pnpm add recharts`
2. Aggregate data client-side (group by xField, compute yAggregation)
3. Render using recharts: BarChart, LineChart, PieChart (donut), AreaChart
4. Add Tooltip, Legend, ResponsiveContainer
5. Handle click → call onDrillDown

## Dependencies to Add

```json
{
  "date-fns": "^3.6.0",
  "recharts": "^2.12.0"
}
```
