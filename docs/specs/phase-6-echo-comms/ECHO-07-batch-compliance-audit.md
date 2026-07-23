# ECHO-07: Batch Compliance Audit

**Status**: 📋 READY  
**Effort**: M (1 day)  
**Priority**: 🟢 Medium  
**Dependencies**: ECHO-01 (rules engine)

---

## Objective

Create a batch audit tool that scans all existing email templates, campaign drafts, and sent email logs for ECHO compliance. Generate a structured compliance report.

## Files

### New
- `app/api/echo/audit/route.ts` — API endpoint for batch audit

---

## Implementation

```typescript
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { validateEchoCompliance } from '@/lib/echo/validator'

export async function POST(request: Request) {
  const supabase = createServerClient()
  
  const results = {
    templates: { scanned: 0, compliant: 0, violations: [] },
    campaigns: { scanned: 0, compliant: 0, violations: [] },
    sentEmails: { scanned: 0, compliant: 0, violations: [] },
    summary: { totalScanned: 0, totalCompliant: 0, averageScore: 0 },
  }

  // 1. Audit email_templates table
  const { data: templates } = await supabase.from('email_templates').select('*')
  for (const t of (templates || [])) {
    results.templates.scanned++
    const v = validateEchoCompliance(`${t.subject_template || ''}\n${t.body_template || ''}`)
    if (v.compliant) results.templates.compliant++
    else results.templates.violations.push({ id: t.id, name: t.template_name, score: v.score, errors: v.errors, warnings: v.warnings })
  }

  // 2. Audit campaign drafts
  const { data: campaigns } = await supabase.from('campaigns').select('*').is('status', 'draft')
  for (const c of (campaigns || [])) {
    results.campaigns.scanned++
    const v = validateEchoCompliance(`${c.subject || ''}\n${c.body || c.content || ''}`)
    if (v.compliant) results.campaigns.compliant++
    else results.campaigns.violations.push({ id: c.id, name: c.name, score: v.score, errors: v.errors, warnings: v.warnings })
  }

  // 3. Audit recent sent emails (30 days)
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: activities } = await supabase
    .from('activities').select('*')
    .eq('activity_type', 'Email Sent')
    .gte('activity_date', thirtyDaysAgo.toISOString())
  
  for (const a of (activities || [])) {
    results.sentEmails.scanned++
    const v = validateEchoCompliance(`${a.subject || ''}\n${a.content || ''}`)
    if (v.compliant) results.sentEmails.compliant++
    else results.sentEmails.violations.push({ id: a.id, subject: a.subject, date: a.activity_date, score: v.score, errors: v.errors, warnings: v.warnings })
  }

  // Summary
  const allScores = [
    ...results.templates.violations.map(v => v.score),
    ...results.campaigns.violations.map(v => v.score),
    ...results.sentEmails.violations.map(v => v.score),
  ]
  results.summary = {
    totalScanned: results.templates.scanned + results.campaigns.scanned + results.sentEmails.scanned,
    totalCompliant: results.templates.compliant + results.campaigns.compliant + results.sentEmails.compliant,
    averageScore: allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 100,
  }

  return NextResponse.json({ success: true, results })
}
```

## Response Format

```json
{
  "success": true,
  "results": {
    "templates": { "scanned": 12, "compliant": 8, "violations": [...] },
    "campaigns": { "scanned": 5, "compliant": 3, "violations": [...] },
    "sentEmails": { "scanned": 47, "compliant": 31, "violations": [...] },
    "summary": { "totalScanned": 64, "totalCompliant": 42, "averageScore": 78 }
  }
}
```

---

## Acceptance Criteria

- [ ] API scans all 3 sources: templates, campaigns, sent emails (30d)
- [ ] Returns structured JSON with scores and violation details
- [ ] Each violation includes rule_id, matched_text, description, suggestion
- [ ] Summary includes totalScanned, totalCompliant, averageScore
- [ ] Handles empty tables gracefully
- [ ] Performance: < 5 seconds for < 1000 records

## BLAST RADIUS
- **Files touched**: 1 new file
- **Coupling**: Depends on ECHO-01 validator
- **Database**: Read-only on existing tables
- **Breaking changes**: None — new endpoint
- **Risk**: LOW
