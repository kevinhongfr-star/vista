# A-01: AI Prompt Bar — Natural Language Queries

> **Phase**: 3 — AI Layer | **Effort**: 1.5 days | **Dependencies**: Phase 0 (engine)
> **Ticket**: Build the AI prompt bar that lets users type natural language to filter/sort/group data.

---

## Objective

Build `<AIPromptBar>` — a text input at the top of every entity page that accepts natural language queries and translates them into grid configurations (filters, sorts, groups, view switches) via DeepSeek.

## Acceptance Criteria

- [ ] Prompt bar visible at top of every entity page (if entity has aiPrompt: true)
- [ ] Placeholder text: "Ask anything... e.g., 'Show VP-level contacts in APAC sorted by score'"
- [ ] User types query → hits Enter or clicks "Apply"
- [ ] Loading state: spinner + "Thinking..."
- [ ] Result preview: shows the generated filter/sort/group config as human-readable chips
- [ ] "Apply" button applies the config to the grid
- [ ] "Edit" button lets user modify the generated config before applying
- [ ] "Cancel" clears the AI suggestion
- [ ] Suggestion chips below input: common queries for this entity
- [ ] Query history: last 10 queries stored in localStorage
- [ ] Error handling: "Couldn't understand that. Try rephrasing."
- [ ] Keyboard shortcut: Cmd+K opens prompt bar
- [ ] Works on mobile (responsive input)

## Component API

```typescript
interface AIPromptBarProps {
  config: EntityConfig;
  
  // Apply the generated config to the grid
  onApplyConfig: (update: {
    filters?: FilterConfig;
    sorts?: SortConfig[];
    groupBy?: GroupConfig;
    viewType?: ViewType;
  }) => void;
  
  currentViewState: {
    filters: FilterConfig;
    sorts: SortConfig[];
    groupBy?: GroupConfig;
    viewType: ViewType;
  };
}
```

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Ask anything...                                     [→]  │
│    "Show VP-level contacts in APAC sorted by VISTA score"    │
│                                                              │
│  Generated:                                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Filter: seniority = VP                                  │ │
│  │ Filter: region = APAC                                   │ │
│  │ Sort: vista_score ↓                                     │ │
│  │                                          [Apply] [Edit] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  💡 Try: "High tier contacts" "Signals this week"           │
│     "Group campaigns by status" "My recent activities"       │
└──────────────────────────────────────────────────────────────┘
```

## Suggestion Chips (per entity)

Contacts:
- "High priority contacts"
- "VPs in APAC"
- "Contacts not contacted in 30 days"
- "Top 10 by VISTA score"
- "Group by sector"

Signals:
- "Critical signals this week"
- "Unreviewed market signals"
- "Group by type"

## Query History

```typescript
// Stored in localStorage: ai_query_history_{entity}
interface QueryHistoryEntry {
  query: string;
  timestamp: number;
  resultSummary: string;  // Human-readable description of the generated config
}
// Show last 10, accessible via ↓ arrow or recent queries dropdown
```

## Implementation Flow

1. User types query → on Enter
2. Call `POST /api/ai/translate` with:
   ```json
   { "query": "Show VP-level contacts in APAC sorted by score", "entity": "contacts", "schema": <EntityConfig properties> }
   ```
3. DeepSeek returns generated config (see A-02)
4. Show preview of generated config
5. User clicks "Apply" → onApplyConfig(generatedConfig)
6. Grid updates with new filters/sorts/groups
