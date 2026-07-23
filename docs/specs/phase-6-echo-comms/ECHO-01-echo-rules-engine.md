# ECHO-01: ECHO Rules Engine

**Status**: 📋 READY  
**Effort**: S (1 day)  
**Priority**: 🔴 Critical — Foundation for all other ECHO tickets  
**Dependencies**: None (must be completed first)

---

## Objective

Create a centralized ECHO compliance rules module at `lib/echo/rules.ts` that exports all ECHO writing constraints as structured data. This becomes the single source of truth for all communication touchpoints.

## Files

### New
- `lib/echo/rules.ts` — Rule definitions (banned patterns, tone map, structural rules)
- `lib/echo/validator.ts` — Compliance validation function
- `lib/echo/types.ts` — TypeScript interfaces for rules/validation results

### Modified
- None (additive only)

---

## Implementation

### `lib/echo/types.ts`

```typescript
export interface EchoRule {
  id: string
  category: 'banned_pattern' | 'tone' | 'structure' | 'positioning'
  severity: 'error' | 'warning'
  pattern: RegExp | string
  description: string
  suggestion?: string
}

export interface EchoValidationResult {
  compliant: boolean
  errors: EchoViolation[]
  warnings: EchoViolation[]
  score: number // 0-100
}

export interface EchoViolation {
  rule_id: string
  matched_text: string
  description: string
  suggestion?: string
  position?: { start: number; end: number }
}

export type EchoVoiceProfile = 'teacher' | 'connector' | 'observer'
```

### `lib/echo/rules.ts`

```typescript
import type { EchoRule, EchoVoiceProfile } from './types'

// ─── BANNED PATTERNS ───────────────────────────────────────────
export const BANNED_PATTERNS: EchoRule[] = [
  // Fear language
  {
    id: 'ECHO-BP-001',
    category: 'banned_pattern',
    severity: 'error',
    pattern: /\b(don'?t miss|fear of|afraid to|risk of losing|falling behind|don'?t get left behind|urgent opportunity)\b/gi,
    description: 'Fear-based language is banned. Position as insight, not urgency.',
    suggestion: 'Reframe as a neutral observation or factual development.'
  },
  // Invented/unverifiable statistics
  {
    id: 'ECHO-BP-002',
    category: 'banned_pattern',
    severity: 'error',
    pattern: /\b(\d+% of (CEOs|companies|executives)|research shows|studies indicate|according to experts)\b/gi,
    description: 'No invented statistics. Only use verifiable, sourced data.',
    suggestion: 'Remove the statistic or cite a specific, verifiable source.'
  },
  // "Not X but Y" pattern
  {
    id: 'ECHO-BP-003',
    category: 'banned_pattern',
    severity: 'warning',
    pattern: /\b(not .{3,30} but .{3,30}|rather than .{3,30} we .{3,30}|unlike .{3,30} we)\b/gi,
    description: '"Not X but Y" contrast pattern. Use sparingly — often unnecessary.',
    suggestion: 'State what you DO directly, without contrasting what you don\'t.'
  },
  // Commercial/salesy language
  {
    id: 'ECHO-BP-004',
    category: 'banned_pattern',
    severity: 'error',
    pattern: /\b(exclusive (offer|invitation|brief|access)|limited (time|seats|availability)|act now|don'?t miss out|special (offer|deal|rate)|free (consultation|assessment))\b/gi,
    description: 'Commercial/sales language is banned. LYC does not sell — it connects.',
    suggestion: 'Describe the actual value/content without promotional framing.'
  },
  // Marketing jargon
  {
    id: 'ECHO-BP-005',
    category: 'banned_pattern',
    severity: 'warning',
    pattern: /\b(leverag(e|ing)|synerg(y|ies|ize)|disrupt(ive|ion)?|game-chang(er|ing)|best-in-class|world-class|cutting-edge|revolutionary|paradigm shift|think outside the box)\b/gi,
    description: 'Marketing jargon dilutes authenticity. Use plain language.',
    suggestion: 'Replace with concrete, specific language.'
  },
  // Filler closings
  {
    id: 'ECHO-BP-006',
    category: 'banned_pattern',
    severity: 'error',
    pattern: /\b(I'?d love to (schedule|set up|arrange)|I think you'?ll find|Would (next week|a call|this) work|Happy to (find a time|connect|chat)|Looking forward to (hearing|connecting)|Hope this (finds you well|finds you)|I wanted to (reach out|follow up|check in))\b/gi,
    description: 'Filler closings are banned. End with a specific next step or stop.',
    suggestion: 'State the concrete next step, or simply end the email.'
  },
  // "I would like to invite" — classic salesy opener
  {
    id: 'ECHO-BP-007',
    category: 'banned_pattern',
    severity: 'error',
    pattern: /\bI (would like to|'?d like to) invite\b/gi,
    description: 'Direct invitation framing. State the event/context, not the invitation act.',
    suggestion: 'Open with the situation: "There is a [event] on [date]..."'
  },
  // Luxury/exclusivity language
  {
    id: 'ECHO-BP-008',
    category: 'banned_pattern',
    severity: 'error',
    pattern: /\b(luxury|exclusive|premium (experience|service)|VIP|elite (group|circle))\b/gi,
    description: '"Luxury" and "exclusive" are banned. LYC is peer-to-peer, not aspirational.',
    suggestion: 'Describe the actual content or participant profile instead.'
  },
]

// ─── TONE MAPPING ──────────────────────────────────────────────
export const TONE_MAP: Record<string, EchoVoiceProfile> = {
  'formal': 'observer',
  'warm': 'teacher',
  'direct': 'connector',
  'teacher': 'teacher',
  'connector': 'connector',
  'observer': 'observer',
}

export const VOICE_PROFILES: Record<EchoVoiceProfile, { description: string; traits: string[] }> = {
  teacher: {
    description: 'Explains with clarity. Assumes intelligence in the reader.',
    traits: ['situational context first', 'concrete examples', 'no condescension', 'factual tone'],
  },
  connector: {
    description: 'Draws lines between people and ideas. Peer-to-peer.',
    traits: ['mutual benefit framing', 'specific connections', 'peer language', 'no hierarchy'],
  },
  observer: {
    description: 'Reports what is happening. Neutral, factual, no agenda.',
    traits: ['neutral observation', 'data-backed', 'no interpretation push', 'respectful distance'],
  },
}

// ─── STRUCTURAL RULES ──────────────────────────────────────────
export const STRUCTURAL_RULES = {
  subjectLine: { minWords: 4, maxWords: 8, bannedPatterns: ['?', '!', '!!!', 'URGENT', 'IMPORTANT'] },
  bodyLength: { targetWords: 120, maxWords: 200, oneIdeaPerParagraph: true },
  signOff: { format: 'first_name_only', bannedTitles: true },
  opening: { banned: ['I hope this finds you well', 'I wanted to', 'I am reaching out'], preferred: 'situation_first' },
  closing: { banned: ['Looking forward to hearing from you', 'Please don\'t hesitate', 'Feel free to'], preferred: 'specific_next_step_or_nothing' },
}

// ─── POSITIONING RULES (from SOUL.md) ──────────────────────────
export const POSITIONING_RULES = {
  doubleLayer: {
    description: 'LYC operates on two layers: the visible executive search layer and the invisible intelligence layer. Communications should hint at depth without explaining the mechanism.',
    apply: 'subtle',
  },
  threeForces: {
    description: 'Three forces drive every LYC engagement: Market Intelligence, Network Access, Timing. Never name them explicitly. Let the reader feel them.',
    apply: 'implicit_only',
  },
  nineTest: {
    description: 'Before any communication goes out, it must pass 9 tests: (1) Would I send this to a friend? (2) Is there a specific situation referenced? (3) Is the next step clear? (4) Are there any banned patterns? (5) Is it under 200 words? (6) Is the sign-off first name only? (7) Does it feel peer-to-peer? (8) Would the recipient learn something? (9) Is there anything I could remove?',
    apply: 'pre_send_check',
  },
  substitutionRules: {
    description: 'Never claim outcomes. Substitute claims with observations: "We have seen" → "The market shows". "Our approach" → "What tends to work". Never guarantee results.',
    apply: 'always',
  },
  competitorNonMention: {
    description: 'Never name competitors. Reference "the market", "industry patterns", "what we observe". If asked about competitors, redirect to LYC\'s own approach.',
    apply: 'always',
  },
}
```

### `lib/echo/validator.ts`

```typescript
import type { EchoValidationResult, EchoViolation } from './types'
import { BANNED_PATTERNS, STRUCTURAL_RULES } from './rules'

export function validateEchoCompliance(text: string): EchoValidationResult {
  const errors: EchoViolation[] = []
  const warnings: EchoViolation[] = []

  for (const rule of BANNED_PATTERNS) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match
    while ((match = regex.exec(text)) !== null) {
      const violation: EchoViolation = {
        rule_id: rule.id,
        matched_text: match[0],
        description: rule.description,
        suggestion: rule.suggestion,
        position: { start: match.index, end: match.index + match[0].length },
      }
      if (rule.severity === 'error') errors.push(violation)
      else warnings.push(violation)
    }
  }

  const wordCount = text.split(/\s+/).length
  if (wordCount > STRUCTURAL_RULES.bodyLength.maxWords) {
    warnings.push({
      rule_id: 'ECHO-STRUCT-001',
      matched_text: `${wordCount} words`,
      description: `Email body exceeds ${STRUCTURAL_RULES.bodyLength.maxWords} word limit.`,
      suggestion: `Target ${STRUCTURAL_RULES.bodyLength.targetWords} words.`,
    })
  }

  const score = Math.max(0, Math.round(100 - (errors.length * 15 + warnings.length * 5)))

  return {
    compliant: errors.length === 0,
    errors,
    warnings,
    score,
  }
}
```

---

## Acceptance Criteria

- [ ] `lib/echo/rules.ts` exports all banned patterns from ECHO Email Guidelines v1.0
- [ ] `lib/echo/rules.ts` includes positioning rules from SOUL.md (Double Layer, Three Forces, 9-Test)
- [ ] `lib/echo/validator.ts` validates text against all rules and returns structured result
- [ ] `lib/echo/types.ts` defines all TypeScript interfaces
- [ ] Unit tests: validator catches all banned patterns from the audit findings
- [ ] Unit tests: validator passes clean ECHO-compliant text
- [ ] Score calculation works (0-100)

## BLAST RADIUS
- **New files only** — no existing code modified
- All subsequent tickets (ECHO-02 through ECHO-07) import from these files
- No database changes, no API changes, no UI changes
