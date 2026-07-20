# M-01: Contacts Migration — ContactsTable 1441→Engine

> **Phase**: 1 — Migration | **Effort**: 1 day | **Dependencies**: Phase 0 complete
> **Ticket**: Replace the 1,441-line ContactsTable.tsx with UniversalDataGrid + contactsConfig.

---

## Objective

Delete `src/components/contacts/ContactsTable.tsx` (1,441 lines) and replace it with `<UniversalDataGrid config={contactsConfig} />`. Preserve ALL existing features: inline editing, bulk ops, filters, column visibility, grid/table view toggle, search.

## Acceptance Criteria

- [ ] Contacts page renders via UniversalDataGrid with contactsConfig
- [ ] All existing columns present and in correct order
- [ ] Inline edit works for all editable columns (pipeline_stage, tier, sector, etc.)
- [ ] Bulk select + bulk edit works
- [ ] Filter presets work (or better — FilterBar replaces them)
- [ ] Column visibility toggle works
- [ ] Grid view = Table view (grid was a redundant mode, merge into table)
- [ ] Search functionality works (filter by name/company/email)
- [ ] Row click navigates to /contacts/[id]
- [ ] Export to CSV works
- [ ] ScoreGauge renders in vista_score column
- [ ] Performance: 1000+ rows load in < 2 seconds
- [ ] Visual regression: looks same or better than before

## Migration Steps

1. Create `src/app/(dashboard)/contacts/page.tsx`:
   ```typescript
   'use client';
   import { UniversalDataGrid } from '@/components/data-grid/UniversalDataGrid';
   import { contactsConfig } from '@/configs/contacts.config';
   
   export default function ContactsPage() {
     return <UniversalDataGrid config={contactsConfig} />;
   }
   ```

2. Wire data fetching: ensure `/api/contacts` returns all 73 columns (or select subset defined in config)

3. Preserve existing features mapping:
   | Old Feature | Location in Engine |
   |---|---|
   | Inline pipeline_stage edit | InlineCellEditor (type='status') |
   | Bulk select + tier change | BulkActions + BulkEditor |
   | Filter presets (localStorage) | FilterBar + SavedViews (server-side) |
   | Column visibility | ColumnManager |
   | Grid/Table toggle | ViewSwitcher (table view only — grid was redundant) |
   | Search bar | FilterBar: add quick search filter on full_name |
   | ScoreGauge in row | Cell renderer for type='score' |

4. Migrate data transformations:
   - Old ContactsTable may compute derived fields → move to PropertyConfig.formulaExpression
   - Old search filtering → FilterBar contains filter

5. Delete old files:
   - `src/components/contacts/ContactsTable.tsx` (1,441 lines)
   - `src/components/contacts/ContactsGrid.tsx` (if exists)
   - Related hooks/components that are now handled by engine

6. Test with real data (1000+ contacts)

## Feature Parity Checklist

| Feature | Old (ContactsTable) | New (Engine) | Status |
|---------|---------------------|--------------|--------|
| Table view | ✅ | ✅ DataTableView | Must work |
| Grid view | ✅ | ✅ (same as table) | Merge |
| Inline edit | ✅ (pipeline_stage only) | ✅ (all editable props) | IMPROVED |
| Bulk select | ✅ | ✅ | Must work |
| Bulk tier change | ✅ | ✅ BulkEditor | Must work |
| Column hide | ✅ | ✅ ColumnManager | Must work |
| Filter | ✅ (presets) | ✅ (visual builder) | IMPROVED |
| Sort | ✅ | ✅ (multi-column) | IMPROVED |
| Search | ✅ | ✅ (filter on name) | Must work |
| Score display | ✅ | ✅ ScoreGauge renderer | Must work |
| CSV export | ⚠️ (basic) | ✅ (full) | IMPROVED |
| Saved views | ⚠️ (localStorage) | ✅ (server-side) | IMPROVED |
| Kanban view | 🔴 | ✅ | NEW |
| Chart view | 🔴 | ✅ | NEW |
| Relations panel | 🔴 | ✅ (Phase 2) | NEW |
| AI prompt bar | 🔴 | ✅ (Phase 3) | NEW |

## Risks

- **Data format mismatch**: Old ContactsTable may expect different field names than Supabase returns. Verify dbColumn mappings in contactsConfig match actual API response.
- **ScoreGauge component**: Ensure ScoreGauge.tsx is imported and used by the score cell renderer.
- **Realtime**: Old ContactsTable may not have realtime. Engine adds it via useRealtimeSync. Ensure no conflicts.
