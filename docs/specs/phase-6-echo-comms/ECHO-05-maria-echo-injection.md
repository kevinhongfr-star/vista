# ECHO-05: MARIA Trigger ECHO Injection

**Status**: 📋 READY  
**Effort**: S (0.5 day)  
**Priority**: 🔴 Critical  
**Dependencies**: ECHO-01 (rules engine)

---

## Objective

Inject ECHO compliance rules into every MARIA agent trigger message. Currently MARIA receives task instructions with zero writing constraints.

## Files

### Modified
- `app/api/trigger/maria/route.ts`

### New
- `lib/echo/maria-injection.ts` — Helper to build ECHO-prefixed trigger messages

---

## Current State

Current trigger message:
```
[VISTA][MARIA] Trigger: Draft outreach sequence for 5 contact(s):
John Smith
Jane Doe
Objective: Generate personalized email campaign
```

No ECHO rules attached. MARIA operates unconstrained.

## Implementation

### `lib/echo/maria-injection.ts`

```typescript
const ECHO_CONSTRAINT_BLOCK = `

## ECHO COMPLIANCE RULES (MANDATORY)

### Voice
- Peer-to-peer. Teacher not salesperson. Situation-first.
- Short sentences. Active voice. No filler. No emoji. No exclamation marks.

### Banned Patterns (DO NOT USE)
- Fear language: don't miss, afraid to, risk of losing, falling behind
- Invented statistics: % of CEOs, research shows, studies indicate
- "Not X but Y" contrast patterns
- Commercial language: exclusive, limited time, act now, special offer, free consultation
- Marketing jargon: leverage, synergize, disruptive, game-changer, best-in-class, cutting-edge
- Filler closings: I'd love to schedule, I think you'll find, Would next week work, Looking forward to hearing, Happy to connect, I hope this finds you well
- "I would like to invite" — state the event directly
- Never use: "luxury", "exclusive", "premium", "VIP", "elite"

### Structure
- Subject: 4-8 words, no punctuation tricks
- Opening: situation/context first, NOT "I wanted to..." or "I am reaching out"
- Body: one idea per paragraph, under 200 words
- Sign-off: FIRST NAME ONLY — "Kevin" (never title or company)

### Positioning
- Never claim outcomes. "We have seen" → "The market shows"
- Never name competitors
- Position as peer/observer, never as vendor/service provider`

export function buildMARIAEchoPrompt(baseMessage: string): string {
  return baseMessage + ECHO_CONSTRAINT_BLOCK
}
```

### Apply to all trigger paths in `maria/route.ts`

```typescript
import { buildMARIAEchoPrompt } from '@/lib/echo/maria-injection'

// Apply to all 3 trigger paths:
const echoMessage = buildMARIAEchoPrompt(message)
await sendMentionMessage(chatId, echoMessage)
```

---

## Acceptance Criteria

- [ ] Every MARIA trigger appends ECHO constraint block
- [ ] Constraint block includes all banned patterns
- [ ] Constraint block includes positioning rules
- [ ] No change to trigger routing logic
- [ ] Unit test: `buildMARIAEchoPrompt()` appends correctly
- [ ] Log entry notes ECHO rules were injected

## BLAST RADIUS
- **Files touched**: 1 modified + 1 new
- **Coupling**: Depends on ECHO-01
- **Database**: None
- **Breaking changes**: None — message content changes only
- **Risk**: LOW
