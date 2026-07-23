# Phase 6: ECHO Communication Compliance

**Phase**: 6  
**Status**: 📋 READY FOR DEVELOPMENT  
**Author**: James/AI (PM) → Trae (Engineer)  
**Date**: 2026-07-23  
**Priority**: HIGH — All outbound communication must reflect LYC brand voice

---

## Background

VISTA's communication layer (email generation, templates, AI-powered drafting) currently operates without any ECHO branding rules. The AI email generator uses a generic prompt with no constraints on tone, banned patterns, or formatting. This means every AI-generated email risks violating LYC's carefully crafted communication standards.

### Audit Results (2026-07-23)

**7 communication touchpoints audited — 6 violations found:**

| # | File | Touchpoint | Status | Violation |
|---|------|-----------|--------|-----------|
| 1 | `app/api/intelligence/generate-email/route.ts` | AI Email Generator (DeepSeek prompt) | ❌ FAIL | Zero ECHO constraints. Temperature 0.7 = high chance of banned patterns |
| 2 | `app/api/intelligence/generate-email/route.ts` | Fallback email templates | ❌ FAIL | Contains "I'd love to schedule", "I think you'll find", "Would next week work" — all banned |
| 3 | `app/templates/page.tsx` | Default email templates | ❌ FAIL | "Exclusive Executive Brief", "I would like to invite" — salesy language |
| 4 | `app/api/trigger/maria/route.ts` | MARIA agent trigger | ❌ FAIL | No ECHO rules attached — agent operates unconstrained |
| 5 | `app/api/email/send/route.ts` | Email send pipeline | ⚠️ WARN | No ECHO compliance validation before send |
| 6 | `components/modals/EmailComposer.tsx` | Email Composer UI | ❌ FAIL | Tone options (formal/warm/direct) don't map to ECHO voice model |
| 7 | `app/api/campaigns/[id]/send/route.ts` | Campaign bulk send | ⚠️ WARN | No batch-level ECHO audit |

### ECHO Documents Referenced
- **ECHO Asset Production Rules v3.0** — Master production rules (HTML assets, formatting, design)
- **ECHO Email Guidelines v1.0** — Email-specific rules (voice, tone, banned patterns, templates)
- **SOUL.md Strategic Rules** — High-level positioning (Double Layer, Three Forces, 9-Test)

### Consistency Verdict
✅ **No conflicts** between ECHO docs and SOUL.md master rules.  
⚠️ **7 gaps identified**: Double Layer, Three Forces, 9-Test, substitution rules, "never say luxury", competitor non-mention, sign-off first-name-only — all absent from ECHO email guidelines but present in SOUL.md.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  ECHO COMPLIANCE LAYER                           │
│                                                                  │
│  lib/echo/                                                       │
│  ├── rules.ts          ← Central rule definitions               │
│  ├── validator.ts      ← Pre-send compliance check              │
│  └── prompt-builder.ts ← ECHO-aware AI prompt construction      │
│                                                                  │
├──────────┬──────────┬──────────┬──────────┬─────────────────────┤
│  Email   │ Template │  MARIA   │  Email   │    Campaign         │
│  Composer│ Library  │  Trigger │  Send    │    Batch Send       │
│  (UI)    │ (DB)     │  (API)   │  (API)   │    (API)            │
│          │          │          │          │                      │
│  ┌─────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────────┐       │
│  │Tone │ │ │ECHO  │ │ │Rules │ │ │Valid-│ │ │Batch     │       │
│  │Map  │ │ │compli│ │ │append│ │ │ate  │ │ │audit     │       │
│  │→ECHO│ │ │ant   │ │ │to    │ │ │befor-│ │ │before    │       │
│  │voice│ │ │templ-│ │ │msg   │ │ │e send│ │ │send      │       │
│  └─────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────────┘       │
└──────────┴──────────┴──────────┴──────────┴─────────────────────┘
```

---

## BLAST RADIUS

| Category | Impact |
|----------|--------|
| **Files touched** | 7 existing files modified + 5 new files created |
| **Coupling** | `lib/echo/rules.ts` becomes dependency for all communication paths |
| **Database** | No schema changes. Existing `email_templates` table reused |
| **Environment** | No new env vars required |
| **Breaking changes** | None — additive changes. Existing email generation continues but with better constraints |
| **Risk** | LOW — All changes are constraint additions, not structural changes |
| **Dependencies** | DeepSeek API (existing), no new external services |

---

## Ticket Summary

| Ticket | Title | Effort | Priority |
|--------|-------|--------|----------|
| [ECHO-01](./ECHO-01-echo-rules-engine.md) | ECHO Rules Engine | S | 🔴 Critical |
| [ECHO-02](./ECHO-02-ai-prompt-rewrite.md) | Compliant DeepSeek Prompt Rewrite | M | 🔴 Critical |
| [ECHO-03](./ECHO-03-template-library-overhaul.md) | Template Library Overhaul | M | 🔴 Critical |
| [ECHO-04](./ECHO-04-email-composer-compliance-ui.md) | Email Composer Compliance UI | M | 🟡 High |
| [ECHO-05](./ECHO-05-maria-echo-injection.md) | MARIA Trigger ECHO Injection | S | 🔴 Critical |
| [ECHO-06](./ECHO-06-resend-compliance-pipeline.md) | Resend Compliance Pipeline | S | 🟡 High |
| [ECHO-07](./ECHO-07-batch-compliance-audit.md) | Batch Compliance Audit | M | 🟢 Medium |

**Total estimated effort**: ~3-4 dev-days

---

## Execution Order

```
ECHO-01 (rules engine) ← must be first, all others depend on it
  ↓
ECHO-02 (prompt rewrite) ← uses rules from ECHO-01
ECHO-03 (template overhaul) ← uses rules from ECHO-01
ECHO-05 (MARIA injection) ← uses rules from ECHO-01
  ↓ (can be parallel)
ECHO-04 (composer UI) ← depends on ECHO-02 being done
ECHO-06 (send pipeline) ← depends on ECHO-01 validator
ECHO-07 (batch audit) ← depends on ECHO-01 validator
```

---

## ECHO Compliance Matrix

### Rule Source Cross-Reference

| Rule | ECHO Master v3.0 | ECHO Email v1.0 | SOUL.md | Merged in ECHO-01? |
|------|:---:|:---:|:---:|:---:|
| Short sentences, active voice | ✅ | ✅ | ✅ | ✅ |
| No filler words | ✅ | ✅ | ✅ | ✅ |
| No emoji / exclamation marks | ✅ | ✅ | — | ✅ |
| Teacher not salesperson | ✅ | ✅ | ✅ | ✅ |
| Situation-first opening | — | ✅ | ✅ | ✅ |
| Banned: fear language | ✅ | ✅ | — | ✅ |
| Banned: invented statistics | ✅ | ✅ | — | ✅ |
| Banned: "not X but Y" pattern | ✅ | ✅ | — | ✅ |
| Banned: commercial language | ✅ | ✅ | — | ✅ |
| Banned: marketing jargon | ✅ | ✅ | — | ✅ |
| Banned: filler closings | — | ✅ | — | ✅ |
| Subject line 4-8 words | — | ✅ | — | ✅ |
| Sign-off: first name only | — | ✅ | ✅ (gap) | ✅ |
| Temperature ≤ 0.4 | — | — | — | ✅ |
| Double Layer positioning | — | — | ✅ (gap) | ✅ |
| Three Forces framework | — | — | ✅ (gap) | ✅ |
| 9-Test pre-send validation | — | — | ✅ (gap) | ✅ |
| Substitution rules (substitute, don't claim) | — | — | ✅ (gap) | ✅ |
| Never say "luxury" | — | — | ✅ (gap) | ✅ |
| Competitor non-mention | — | — | ✅ (gap) | ✅ |
