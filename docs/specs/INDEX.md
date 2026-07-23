# VISTA Universal Data Grid Engine — Complete Spec Library

> **Version**: 1.1 | **Date**: 2026-07-21 | **Author**: James/AI (PM) → Trae (Engineer)
> **Decision**: Option A — Full rebuild as Notion-class data platform (~4 weeks)
> **Architecture**: Config-driven. One UniversalDataGrid component + per-entity config files.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIVERSAL DATA GRID                       │
│                                                              │
│  <UniversalDataGrid config={entityConfig} />                 │
│                                                              │
│  Config: {                                                   │
│    entity: "contacts" | "signals" | "campaigns" | ...        │
│    table: "vista_contacts" | "signals" | ...                 │
│    views: ["table", "kanban", "calendar", "chart"]          │
│    columns: PropertyConfig[]                                 │
│    defaultSort: { property, direction }                      │
│    defaultFilters: FilterConfig[]                            │
│    relations: RelationConfig[]                               │
│    savedViews: Supabase (user_saved_views table)             │
│  }                                                           │
│                                                              │
│  Features (all inherited from engine):                       │
│  ✅ Inline editing (any property, type-aware)                │
│  ✅ Bulk editing (multi-select + batch action)               │
│  ✅ View switcher (table ↔ kanban ↔ calendar ↔ chart)       │
│  ✅ Column visibility + drag reorder                         │
│  ✅ Server-side saved views (per user, shareable)            │
│  ✅ Group by any property (2-level)                          │
│  ✅ Filter by any property (combinable, AND/OR)              │
│  ✅ Sort by any property (multi-column)                      │
│  ✅ Related entities panel (slide-in, lazy load)             │
│  ✅ Export (CSV, PDF)                                        │
│  ✅ AI prompt bar (NL → query via DeepSeek)                  │
│  ✅ Real-time sync (Supabase realtime)                       │
│                                                              │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Contacts│ │ Signals │ │Pipeline│ │Campaigns│ │ Clusters     │
│  Config  │ │ Config  │ │ Config │ │ Config  │ │ Config       │
│  ~50 ln  │ │ ~50 ln  │ │ ~50 ln │ │ ~50 ln  │ │ ~50 ln      │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

### Key Dependencies
- **TanStack Table v8** — headless table engine
- **@dnd-kit/core + sortable** — drag-and-drop (kanban cards, column reorder)
- **recharts** — chart views
- **date-fns** — date handling for calendar view
- **zod** — runtime validation of config schemas
- **DeepSeek API** — AI prompt translation (flash model), priority/recommendations (pro model)

### Existing Infrastructure (KEEP)
- Supabase realtime subscriptions
- VISTA V/I/S/T/A scoring model + ScoreGauge/Radar
- 4 Feishu Agents (LENS/MARIA/PROBE/CARL)
- 1000+ contacts in vista_contacts (73 columns)
- 408 Supabase tables

---

## Phase Summary

| Phase | Name | Tickets | Files | Week | Status |
|-------|------|---------|-------|------|--------|
| **0** | Foundation (Engine) | 6 | 6 | Week 1 | 🔴 Not started |
| **1** | Entity Migration | 10 | 4 | Week 2 | 🔴 Not started |
| **2** | Relations & Navigation | 6 | 5 | Week 3 | 🔴 Not started |
| **3** | AI Layer | 7 | 5 | Week 3-4 | 🔴 Not started |
| **4** | Dashboard Builder | 5 | 1 | Week 4 | 🔴 Not started |
| **5** | Council Revenue Architecture | 3 | 3 | Week 5 | 🔴 Not started |
| **6** | ECHO Communication Compliance | 7 | 8 | Week 5-6 | 🔴 Not started |
| | **TOTAL** | **44** | **32** | **~5-6 weeks** | |

---

## Phase 0: Foundation — "The Engine" (Week 1)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **E-01** | `E-01-core-config-schema.md` | Core config schema, TypeScript types, zod validators, Supabase `user_saved_views` table | 1 day |
| **E-02** | `E-02-table-view.md` | TanStack Table view: column rendering, inline edit, sorting, resizing, virtualization | 1 day |
| **E-03** | `E-03-kanban-view.md` | Kanban board view: dnd-kit, card config, drag-to-move between columns | 1 day |
| **E-04** | `E-04-calendar-chart-views.md` | Calendar grid view + Chart view (bar/line/donut via recharts) | 1 day |
| **E-05** | `E-05-filters-saved-views.md` | FilterBar, GroupBy, SavedViews sidebar, BulkActions toolbar | 1 day |
| **E-06** | `E-06-entity-configs.md` | UniversalDataGrid wrapper component + all 10 entity config files | 1 day |

## Phase 1: Entity Migration — "Every Page Becomes Configurable" (Week 2)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **M-01** | `M-01-contacts-migration.md` | Migrate ContactsTable (1441 lines) → engine config. Preserve all existing features. | 1 day |
| **M-02** | `M-02-pipeline-migration.md` | Pipeline = filtered contacts (status ≠ Closed) + default Kanban view | 0.5 day |
| **M-03** | `M-03-signals-migration.md` | Signals → engine + Calendar view + empty state | 1 day |
| **M-04** | `M-04-through-M-10.md` | Campaigns, Clusters, Activities, Programs, Strategy, Templates, Automation — all migrate to engine configs | 2 days |

## Phase 2: Relations & Navigation — "Everything Connected" (Week 3)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **R-01** | `R-01-relation-model.md` | Complete relation map, junction tables, FK map, Supabase schema | 1 day |
| **R-02** | `R-02-relation-panel.md` | 420px slide-in panel, relation tabs, lazy load, create new relation | 1 day |
| **R-03** | `R-03-cross-entity-links.md` | Clickable pills in grid cells, company auto-link, popover preview | 0.5 day |
| **R-04** | `R-04-detail-related-tabs.md` | Detail page template with relation tabs | 0.5 day |
| **R-05** | `R-05-R-06-detail-migrations.md` | Migrate detail pages to use relation system | 1 day |

## Phase 3: AI Layer — "Intelligent Views" (Week 3-4)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **A-01** | `A-01-ai-prompt-bar.md` | NL prompt bar, suggestion chips, query history | 1.5 days |
| **A-02** | `A-02-deepseek-query-translator.md` | DeepSeek flash: NL → FilterConfig, caching | 1 day |
| **A-03** | `A-03-ai-record-summary.md` | DeepSeek narrative brief per record | 1 day |
| **A-04** | `A-04-agent-integration.md` | LENS/MARIA/PROBE/CARL wired to UI | 1.5 days |
| **A-05** | `A-05-through-A-07.md` | Signal classification, Priority engine, Weekly priorities | 2 days |

## Phase 4: Dashboard Builder — "Customizable Command Center" (Week 4)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **D-01** | `D-01-through-D-05.md` | Widget system, drag-drop layout, chart builder, AI dashboard, Revenue, Settings | 4 days |

---

## Phase 5: Council Revenue Architecture — "Commercial Intelligence" (Week 5)

> Added 2026-07-21 per CD-11 (Council Pricing & Membership Architecture)
> Depends on: Phase 0 (E-01) + Wave 1.6 (Revenue OS schema)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **CR-01** | `CR-01-council-pricing-architecture.md` | Council revenue streams, dual pricing (Council/public rate), membership schema, credit ledger | 3 days |
| **CR-02** | `CR-02-council-pipeline-funnel.md` | Council membership pipeline (parallel to BD pipeline), 8-stage funnel, capacity tracking | 2 days |
| **CR-03** | `CR-03-forecast-engine-analytics.md` | Revenue forecast engine, MRR calculation, 6-month projection, CD-11 target comparison | 2 days |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| TanStack Table v8 API complexity | High | Start with E-02 extraction from existing ContactsTable |
| dnd-kit + kanban performance (1000+ cards) | Medium | Virtualize kanban columns, limit visible cards |
| DeepSeek query translation accuracy | Medium | Cache common queries, show preview before applying |
| Supabase realtime conflicts with bulk edits | Low | Optimistic UI, debounce during bulk ops |
| Migration breaks existing Contacts features | High | Feature parity checklist in M-01, visual regression test |
| CD-11 pricing numbers not confirmed | High | Kevin must confirm final prices before CR-01 seed data is locked |
| Council capacity limits (60/10/5) hit too fast | Medium | Waitlist stage in CR-02 handles overflow; monitor monthly |
| Forecast model accuracy (no historical data) | Medium | Start with conservative estimates; recalibrate after 3 months of actuals |

---

## File Index (32 files)

| # | Path | Size | Content |
|---|------|------|---------|
| 1 | `phase-0-engine/E-01-core-config-schema.md` | ~13KB | TypeScript types, zod validators, Supabase schema |
| 2 | `phase-0-engine/E-02-table-view.md` | ~7KB | TanStack Table view, inline edit, API routes |
| 3 | `phase-0-engine/E-03-kanban-view.md` | ~5KB | dnd-kit kanban, card config, drag-to-move |
| 4 | `phase-0-engine/E-04-calendar-chart-views.md` | ~6.5KB | recharts, date-fns, calendar grid |
| 5 | `phase-0-engine/E-05-filters-saved-views.md` | ~9.3KB | FilterBar, GroupBy, SavedViews, BulkActions |
| 6 | `phase-0-engine/E-06-entity-configs.md` | ~12KB | UniversalDataGrid wrapper, all 10 configs |
| 7 | `phase-1-migration/M-01-contacts-migration.md` | ~6.6KB | ContactsTable 1441→engine migration |
| 8 | `phase-1-migration/M-02-pipeline-migration.md` | ~3.7KB | Pipeline = filtered contacts + kanban |
| 9 | `phase-1-migration/M-03-signals-migration.md` | ~6.2KB | Signals + Calendar + empty state |
| 10 | `phase-1-migration/M-04-through-M-10.md` | ~6KB | 7 entity migrations combined |
| 11 | `phase-2-relations/R-01-relation-model.md` | ~4.7KB | Relation map, junction tables, FK map |
| 12 | `phase-2-relations/R-02-relation-panel.md` | ~4.8KB | Slide-in panel, tabs, lazy load |
| 13 | `phase-2-relations/R-03-cross-entity-links.md` | ~2.8KB | Clickable pills, company auto-link |
| 14 | `phase-2-relations/R-04-detail-related-tabs.md` | ~2.3KB | Detail page template |
| 15 | `phase-2-relations/R-05-R-06-detail-migrations.md` | ~3.4KB | Detail page migrations |
| 16 | `phase-3-ai/A-01-ai-prompt-bar.md` | ~5KB | NL prompt bar, chips, history |
| 17 | `phase-3-ai/A-02-deepseek-query-translator.md` | ~5.8KB | DeepSeek flash, NL→FilterConfig |
| 18 | `phase-3-ai/A-03-ai-record-summary.md` | ~4.2KB | DeepSeek narrative brief |
| 19 | `phase-3-ai/A-04-agent-integration.md` | ~6.2KB | Agents wired to UI |
| 20 | `phase-3-ai/A-05-through-A-07.md` | ~7.4KB | Signal classification + Priority engine |
| 21 | `phase-4-dashboard/D-01-through-D-05.md` | ~11.4KB | Widget system + Dashboard builder |
| 22 | `phase-5-council-revenue/CR-01-council-pricing-architecture.md` | ~10KB | Council pricing, dual rate, membership schema, credit ledger |
| 23 | `phase-5-council-revenue/CR-02-council-pipeline-funnel.md` | ~12KB | Council pipeline, 8-stage funnel, capacity tracking |
| 24 | `phase-5-council-revenue/CR-03-forecast-engine-analytics.md` | ~14KB | Forecast engine, MRR, 6-month projection, CD-11 target |

---

## Phase 6: ECHO Communication Compliance — "Brand Voice Enforcement" (Week 5-6)

> Added 2026-07-23 per communication audit of all 7 touchpoints
> Depends on: None (standalone phase, can run in parallel with Phase 5)

| Ticket | File | Description | Effort |
|--------|------|-------------|--------|
| **ECHO-01** | `ECHO-01-echo-rules-engine.md` | Centralized ECHO rules module (banned patterns, tone map, structural rules, positioning rules) | 1 day |
| **ECHO-02** | `ECHO-02-ai-prompt-rewrite.md` | Rewrite DeepSeek prompt with ECHO constraints, temperature 0.7→0.4, post-gen validation | 1 day |
| **ECHO-03** | `ECHO-03-template-library-overhaul.md` | Replace all 8 default templates with ECHO-compliant versions | 1 day |
| **ECHO-04** | `ECHO-04-email-composer-compliance-ui.md` | Real-time compliance badge, voice profile selector, word count, auto-fix | 1 day |
| **ECHO-05** | `ECHO-05-maria-echo-injection.md` | Inject ECHO rules into all MARIA agent trigger messages | 0.5 day |
| **ECHO-06** | `ECHO-06-resend-compliance-pipeline.md` | Pre-send validation, compliance headers, activity logging | 0.5 day |
| **ECHO-07** | `ECHO-07-batch-compliance-audit.md` | Batch audit API for templates, campaigns, and sent emails | 1 day |

| 25 | `phase-6-echo-comms/ECHO_Comms_Spec_v1.md` | ~7.9KB | Phase 6 master spec, architecture, compliance matrix |
| 26 | `phase-6-echo-comms/ECHO-01-echo-rules-engine.md` | ~10.5KB | Rules engine: banned patterns, tone map, validator |
| 27 | `phase-6-echo-comms/ECHO-02-ai-prompt-rewrite.md` | ~6.6KB | DeepSeek prompt rewrite with ECHO constraints |
| 28 | `phase-6-echo-comms/ECHO-03-template-library-overhaul.md` | ~6.2KB | 8 ECHO-compliant email templates |
| 29 | `phase-6-echo-comms/ECHO-04-email-composer-compliance-ui.md` | ~4.0KB | Compliance badge, voice selector, auto-fix UI |
| 30 | `phase-6-echo-comms/ECHO-05-maria-echo-injection.md` | ~3.0KB | MARIA trigger ECHO rule injection |
| 31 | `phase-6-echo-comms/ECHO-06-resend-compliance-pipeline.md` | ~2.1KB | Pre-send validation pipeline |
| 32 | `phase-6-echo-comms/ECHO-07-batch-compliance-audit.md` | ~4.2KB | Batch compliance audit API |
