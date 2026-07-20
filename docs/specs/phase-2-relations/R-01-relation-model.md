# R-01: Relation Model — Complete Schema + FK Map

> **Phase**: 2 — Relations | **Effort**: 1 day | **Dependencies**: Phase 1 complete
> **Ticket**: Define the complete relation map between all entities, create junction tables, establish FK map.

---

## Objective

Map all cross-entity relationships, create missing junction tables in Supabase, and document the FK map that the RelationPanel and RelationLink components will use.

## Complete Relation Map

```
vista_contacts ←→ signals          (many-to-many via signal_contacts)
vista_contacts ←→ campaigns        (many-to-many via campaign_contacts)
vista_contacts ←→ campaign_activities (one-to-many: contact_id FK in activities)
vista_contacts ←→ density_clusters (many-to-many via cluster_contacts)
vista_contacts ←→ programs         (many-to-many via program_assignments)
vista_contacts ←→ strategic_notes  (one-to-many: contact_id FK in notes)
vista_contacts ←→ outreach_assignments (one-to-many: contact_id FK)

signals ←→ vista_contacts          (many-to-many, reverse)
signals ←→ campaigns               (many-to-many via campaign_signals)

campaigns ←→ vista_contacts        (many-to-many, reverse)
campaigns ←→ signals               (many-to-many, reverse)
campaigns ←→ programs              (many-to-many via program_campaigns)

density_clusters ←→ vista_contacts (many-to-many, reverse)

programs ←→ vista_contacts         (many-to-many, reverse)
programs ←→ campaigns              (many-to-many, reverse)
```

## Existing Tables (verify in Supabase)

| Table | Type | Key Columns |
|-------|------|-------------|
| `signal_contacts` | junction | signal_id, contact_id |
| `campaign_contacts` | junction | campaign_id, contact_id |
| `cluster_contacts` | junction | cluster_id, contact_id |
| `program_assignments` | junction | program_id, contact_id, role |
| `campaign_activities` | child | contact_id, campaign_id, activity_type |
| `outreach_assignments` | child | contact_id, template_id, status |
| `strategic_notes` | child | contact_id (may not exist), related_entity_type |

## Missing Tables / Columns to Create

```sql
-- 1. campaign_signals junction (if missing)
CREATE TABLE IF NOT EXISTS campaign_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, signal_id)
);

-- 2. program_campaigns junction (if missing)
CREATE TABLE IF NOT EXISTS program_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, campaign_id)
);

-- 3. Add contact_id to strategic_notes if missing
-- Check first: SELECT column_name FROM information_schema.columns WHERE table_name = 'strategic_notes' AND column_name = 'contact_id';
ALTER TABLE strategic_notes ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES vista_contacts(id);

-- 4. Indexes for relation lookups
CREATE INDEX IF NOT EXISTS idx_signal_contacts_contact ON signal_contacts (contact_id);
CREATE INDEX IF NOT EXISTS idx_signal_contacts_signal ON signal_contacts (signal_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact ON campaign_contacts (contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign ON campaign_contacts (campaign_id);
CREATE INDEX IF NOT EXISTS idx_cluster_contacts_contact ON cluster_contacts (contact_id);
CREATE INDEX IF NOT EXISTS idx_cluster_contacts_cluster ON cluster_contacts (cluster_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_contact ON program_assignments (contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_activities_contact ON campaign_activities (contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_activities_campaign ON campaign_activities (campaign_id);
```

## FK Map (for code generation)

```typescript
// src/lib/relations/relationMap.ts
export const RELATION_MAP = {
  contacts: {
    signals: { type: 'm2m' as const, junction: 'signal_contacts', localKey: 'contact_id', foreignKey: 'signal_id', targetTable: 'signals', displayField: 'title' },
    campaigns: { type: 'm2m' as const, junction: 'campaign_contacts', localKey: 'contact_id', foreignKey: 'campaign_id', targetTable: 'campaigns', displayField: 'name' },
    activities: { type: '1tm' as const, foreignKey: 'contact_id', targetTable: 'campaign_activities', displayField: 'activity_type' },
    clusters: { type: 'm2m' as const, junction: 'cluster_contacts', localKey: 'contact_id', foreignKey: 'cluster_id', targetTable: 'density_clusters', displayField: 'name' },
    programs: { type: 'm2m' as const, junction: 'program_assignments', localKey: 'contact_id', foreignKey: 'program_id', targetTable: 'programs', displayField: 'name' },
  },
  signals: {
    contacts: { type: 'm2m' as const, junction: 'signal_contacts', localKey: 'signal_id', foreignKey: 'contact_id', targetTable: 'vista_contacts', displayField: 'full_name' },
  },
  campaigns: {
    contacts: { type: 'm2m' as const, junction: 'campaign_contacts', localKey: 'campaign_id', foreignKey: 'contact_id', targetTable: 'vista_contacts', displayField: 'full_name' },
    signals: { type: 'm2m' as const, junction: 'campaign_signals', localKey: 'campaign_id', foreignKey: 'signal_id', targetTable: 'signals', displayField: 'title' },
  },
  clusters: {
    contacts: { type: 'm2m' as const, junction: 'cluster_contacts', localKey: 'cluster_id', foreignKey: 'contact_id', targetTable: 'vista_contacts', displayField: 'full_name' },
  },
  programs: {
    contacts: { type: 'm2m' as const, junction: 'program_assignments', localKey: 'program_id', foreignKey: 'contact_id', targetTable: 'vista_contacts', displayField: 'full_name' },
    campaigns: { type: 'm2m' as const, junction: 'program_campaigns', localKey: 'program_id', foreignKey: 'campaign_id', targetTable: 'campaigns', displayField: 'name' },
  },
};
```

## API Routes for Relations

### GET /api/relations/{entity}/{id}/{relation}
```
// Get all related records for a specific entity instance
// Example: GET /api/relations/contacts/uuid-123/signals

Response 200:
{
  "data": [
    { "id": "signal-uuid-1", "title": "Market shift in APAC fintech", "signal_type": "market", ... }
  ],
  "count": 5
}
```

### POST /api/relations/{entity}/{id}/{relation}
```json
// Create a new relation
// Example: POST /api/relations/contacts/uuid-123/signals
{ "target_id": "signal-uuid-2" }

// Response 201
{ "id": "junction-uuid", "contact_id": "uuid-123", "signal_id": "signal-uuid-2" }
```

### DELETE /api/relations/{entity}/{id}/{relation}/{targetId}
```
// Remove a relation
// Response 204
```

## Acceptance Criteria

- [ ] All junction tables exist in Supabase
- [ ] All indexes created
- [ ] RELATION_MAP TypeScript object defined and type-safe
- [ ] API routes for GET/POST/DELETE relations work
- [ ] Each relation query returns in < 200ms for 1000+ contacts
- [ ] Relation counts accurate (verify against raw SQL)
