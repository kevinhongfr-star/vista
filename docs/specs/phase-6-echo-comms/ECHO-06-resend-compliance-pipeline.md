# ECHO-06: Resend Compliance Pipeline

**Status**: 📋 READY  
**Effort**: S (0.5 day)  
**Priority**: 🟡 High  
**Dependencies**: ECHO-01 (rules engine)  
**Blocked by**: RESEND_API_KEY (needs Kevin to create at Resend.com)

---

## Objective

Add ECHO compliance validation to the email send pipeline. Log compliance scores with every sent email.

## Files Modified
- `app/api/email/send/route.ts`

---

## Current Issues
1. No validation before sending
2. From address is placeholder
3. No compliance score logged

## Implementation

Add validation before each send:

```typescript
import { validateEchoCompliance } from '@/lib/echo/validator'

// Inside the send loop, before calling resend.emails.send:
const compliance = validateEchoCompliance(`${personalizedSubject}\n${personalizedBody}`)

if (!compliance.compliant) {
  console.warn(`[email/send] ECHO violation for ${contact.name}:`, compliance.errors)
}

const { data: emailData, error: emailError } = await resend.emails.send({
  from: process.env.EMAIL_FROM_ADDRESS || 'VISTA <noreply@vista-azure-delta-theta.vercel.app>',
  to: [contact.email],
  subject: personalizedSubject,
  html: personalizedBody.replace(/\n/g, '<br>'),
  headers: {
    'X-ECHO-Score': String(compliance.score),
    'X-ECHO-Compliant': String(compliance.compliant),
  },
})
```

Also update the activity log to include compliance score:
```typescript
await supabase.from("activities").insert({
  ...activityData,
  notes: `ECHO score: ${compliance.score}/100 | Compliant: ${compliance.compliant}`,
})
```

---

## Acceptance Criteria

- [ ] Every email passes through `validateEchoCompliance()` before sending
- [ ] Compliance score logged in activity record
- [ ] Compliance score added to email headers
- [ ] Console warning on non-compliant sends
- [ ] From address configurable via env var
- [ ] (Future) Strict mode toggle to block sends below threshold

## BLAST RADIUS
- **Files touched**: 1 file
- **Coupling**: Depends on ECHO-01 validator
- **Database**: None (existing tables reused)
- **Breaking changes**: None
- **Risk**: LOW
