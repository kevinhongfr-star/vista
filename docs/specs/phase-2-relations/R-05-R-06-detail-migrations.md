# R-05 + R-06: Detail Page Migrations

> **Phase**: 2 — Relations | **Effort**: 1 day | **Dependencies**: R-04
> **Ticket**: Migrate contacts/[id], signals/[id], clusters/[id] to use the new detail template.

---

## R-05: Contact Detail Migration

### Current State
- `src/app/(dashboard)/contacts/[id]/page.tsx` exists but is basic
- Shows some contact fields, no related entities

### Target State
```typescript
// src/app/(dashboard)/contacts/[id]/page.tsx
'use client';
import { DetailPageTemplate } from '@/components/data-grid/DetailPageTemplate';
import { contactsConfig } from '@/configs/contacts.config';
import { useContact } from '@/lib/hooks/useContact';

export default function ContactDetail({ params }: { params: { id: string } }) {
  const { data: record, isLoading } = useContact(params.id);
  if (isLoading) return <DetailSkeleton />;
  return <DetailPageTemplate config={contactsConfig} record={record} />;
}
```

### Acceptance Criteria
- [ ] Contact detail shows all 73 columns organized in sections
- [ ] Tabs: Signals, Campaigns, Activities, Clusters, Programs
- [ ] Each tab shows related records as mini-table
- [ ] ScoreGauge + Radar visible in header
- [ ] Edit mode allows changing any editable field
- [ ] AI Summary (Phase 3) shows in overview section

---

## R-06: Signal Detail + Cluster Detail Migration

### Signal Detail
```typescript
// src/app/(dashboard)/signals/[id]/page.tsx
export default function SignalDetail({ params }: { params: { id: string } }) {
  const { data: record } = useSignal(params.id);
  return <DetailPageTemplate config={signalsConfig} record={record} />;
}
```

Tabs: Related Contacts, Campaigns

### Cluster Detail
```typescript
// src/app/(dashboard)/clusters/[id]/page.tsx
export default function ClusterDetail({ params }: { params: { id: string } }) {
  const { data: record } = useCluster(params.id);
  return <DetailPageTemplate config={clustersConfig} record={record} />;
}
```

Tabs: Contacts in Cluster

### Acceptance Criteria for Both
- [ ] Signal detail shows full signal data + related contacts tab
- [ ] Cluster detail shows full cluster data + contacts tab
- [ ] Both use DetailPageTemplate (no custom code)
- [ ] Navigation: click related record → navigate to that record's detail
