# A-02: DeepSeek Query Translator — NL → FilterConfig

> **Phase**: 3 — AI Layer | **Effort**: 1 day | **Dependencies**: A-01, E-01
> **Ticket**: Build the backend service that translates natural language to grid config using DeepSeek.

---

## Objective

Build the DeepSeek-powered query translation service. Takes a natural language query + entity schema → returns a FilterConfig + SortConfig + GroupConfig.

## Architecture

```
User NL Query → POST /api/ai/translate → DeepSeek API (flash) → Generated Config → UI Preview
```

## API Route

### POST /api/ai/translate

```typescript
// Request
interface TranslateRequest {
  query: string;           // "Show VP-level contacts in APAC sorted by score"
  entity: string;          // "contacts"
  properties: PropertyConfig[];  // Schema from entity config (id, label, type, options)
}

// Response
interface TranslateResponse {
  success: boolean;
  config: {
    filters?: FilterConfig;
    sorts?: SortConfig[];
    groupBy?: GroupConfig;
    viewType?: ViewType;
  };
  explanation: string;     // "Filtering by seniority=VP and region=APAC, sorting by VISTA score descending"
  confidence: number;      // 0-1 confidence score
}
```

## DeepSeek Prompt Template

```
You are a data query translator. Given a user's natural language query and the available data schema, generate a structured filter/sort/group configuration.

ENTITY: {entity}
AVAILABLE PROPERTIES:
{properties formatted as: id (label) [type] {options for select}}

USER QUERY: "{query}"

Respond in JSON only:
{
  "filters": { "groups": [{ "combinator": "AND", "conditions": [...] }] },
  "sorts": [{ "property": "...", "direction": "asc|desc" }],
  "groupBy": { "primary": "..." },
  "viewType": "table|kanban|calendar|chart",
  "explanation": "Human-readable explanation of what was generated"
}

Rules:
- Only use properties that exist in the schema
- For select types, use exact option values (not labels)
- For "top N" queries, add a limit (note: we don't support LIMIT in FilterConfig yet, so approximate with filter)
- For time-based queries ("this week", "last 30 days"), calculate actual dates
- If query is ambiguous, pick the most likely interpretation and note it in explanation
- If query cannot be translated, return { "success": false, "explanation": "reason" }
```

## Caching Strategy

```typescript
// src/lib/ai/queryCache.ts

// Cache key: hash(entity + normalized_query)
// Cache TTL: 1 hour
// Storage: in-memory LRU (50 entries max)
// Common queries cached: "high priority", "APAC contacts", etc.

const queryCache = new Map<string, { result: TranslateResponse; timestamp: number }>();
```

## DeepSeek API Call

```typescript
// src/lib/ai/deepseek.ts
export async function callDeepSeek(prompt: string, model: 'flash' | 'pro' = 'flash'): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: model === 'flash' ? 'deepseek-chat' : 'deepseek-reasoner',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,  // Low temperature for deterministic output
      response_format: { type: 'json_object' },
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

## Error Handling

| Error | Handling |
|-------|----------|
| DeepSeek API timeout (>5s) | Show "Taking too long. Try a simpler query." |
| Invalid JSON response | Retry once, then show "Couldn't understand. Try rephrasing." |
| No matching properties | Return partial match + explanation of what was understood |
| API key missing | Log error, return graceful fallback (no AI) |

## Acceptance Criteria

- [ ] API route POST /api/ai/translate works
- [ ] Correctly translates "VP contacts in APAC" → filters on seniority + region
- [ ] Correctly translates "sort by score" → sorts on vista_score desc
- [ ] Correctly translates "group by sector" → groupBy primary = sector
- [ ] Correctly translates "show as kanban" → viewType = 'kanban'
- [ ] Handles time queries: "this week" → date filter with calculated dates
- [ ] Handles "top 10" → explanation notes limit not supported, shows all filtered
- [ ] Caching works: same query returns cached result
- [ ] Error cases return graceful messages
- [ ] Response time < 3 seconds (flash model)

## Environment Variable

```
DEEPSEEK_API_KEY=sk-...  (from ./主对话/SECRET.md)
```
