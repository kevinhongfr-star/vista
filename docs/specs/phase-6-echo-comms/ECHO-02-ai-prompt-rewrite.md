# ECHO-02: Compliant DeepSeek Prompt Rewrite

**Status**: 📋 READY  
**Effort**: M (1 day)  
**Priority**: 🔴 Critical  
**Dependencies**: ECHO-01 (rules engine)

---

## Objective

Rewrite the AI email generation prompt in `generate-email/route.ts` to embed ECHO compliance rules. Reduce temperature from 0.7 to 0.4. Ensure all generated emails pass ECHO validation before returning to user.

## Files

### Modified
- `app/api/intelligence/generate-email/route.ts`

---

## Current Issues

1. **Prompt has zero ECHO constraints** — DeepSeek generates generic business email with no awareness of banned patterns
2. **Temperature 0.7** — Too high, increases chance of creative but non-compliant output
3. **Fallback templates are non-compliant** — When AI fails, fallback contains banned phrases:
   - "I'd love to schedule a brief 20-minute call"
   - "I think you'll find" / "I think would be highly relevant"
   - "Would next week work" / "Would you be available"
   - "I hope this note finds you well"
   - "I'd welcome the opportunity" / "I'd welcome the chance"
   - "Best regards" (should be just "Kevin")

## Implementation

### 1. Replace prompt construction

Replace the current inline prompt with a structured ECHO-aware prompt builder:

```typescript
import { TONE_MAP, VOICE_PROFILES, POSITIONING_RULES } from '@/lib/echo/rules'
import { validateEchoCompliance } from '@/lib/echo/validator'

function buildEchoPrompt(contact: any, signalSummary: string, templateType: string, tone: string, context: string): string {
  const voiceProfile = TONE_MAP[tone] || 'teacher'
  const voice = VOICE_PROFILES[voiceProfile]
  const lastTouch = contact.last_touch_date ? new Date(contact.last_touch_date).toLocaleDateString() : 'No prior contact'

  return `You are writing a business development email for Kevin Hong, Managing Partner at LYC Partners (executive search firm).

## LYC Positioning (CRITICAL)
- Kevin speaks as a PEER, not a vendor. Never position LYC as "serving" or "helping" the recipient.
- Position as someone who observes market patterns and connects people.
- Never claim outcomes. Substitute: "We have seen" → "The market shows", "Our approach" → "What tends to work"
- Never name competitors. Reference "the market", "industry patterns", "what we observe"
- Never use: "luxury", "exclusive", "premium experience", "VIP", "elite"
- ${POSITIONING_RULES.doubleLayer.description}
- ${POSITIONING_RULES.substitutionRules.description}

## Voice: ${voiceProfile}
${voice.description}
Traits: ${voice.traits.join(', ')}

## Hard Rules (VIOLATION = REJECT)
- NO fear language (don't miss, afraid to, risk of losing, falling behind)
- NO invented statistics (% of CEOs, research shows, studies indicate)
- NO "not X but Y" patterns
- NO commercial language (exclusive, limited time, act now, special deal, free consultation)
- NO marketing jargon (leverage, synergize, disruptive, game-changer, best-in-class, cutting-edge, paradigm shift)
- NO filler closings (I'd love to schedule, I think you'll find, Would next week work, Looking forward to hearing, Happy to connect, I hope this finds you well)
- NO "I would like to invite" — state the event directly
- NO emoji, NO exclamation marks
- NO "I wanted to..." / "I am reaching out..." as opening
- Sign-off: "Kevin" ONLY — no title, no company, no phone

## Structure
- Subject: 4-8 words, no punctuation tricks, no questions
- Opening: situation/context first (something about the contact's company/market), NOT self-referential
- Body: one idea per paragraph. Short sentences. Active voice. Under 200 words total.
- Close: specific next step or simply end. No filler.

## Contact
- Name: ${contact.name || 'Unknown'}
- Company: ${contact.company || 'Unknown'}
- Role: ${contact.role || 'Unknown'}
- Seniority: ${contact.seniority || 'Unknown'}
- Function: ${contact.function || 'Unknown'}
- Industry: ${contact.industry || 'Unknown'}
- Pipeline stage: ${contact.pipeline_stage || 'Prospect'}
- Last touch: ${lastTouch}
- Engagement tier: ${contact.engagement_tier || 'Unknown'}
- Recent signals: ${signalSummary}
- Email type: ${templateType}
- Context: ${context || 'None'}

Use {contact_name} and {company_name} as template variables.

Return JSON: { "subject": "...", "body": "..." }`
}
```

### 2. Lower temperature

```typescript
// BEFORE:
const result = await callDeepSeekJSON(prompt, { model: "pro", temperature: 0.7, maxTokens: 1024 })

// AFTER:
const result = await callDeepSeekJSON(prompt, { model: "pro", temperature: 0.4, maxTokens: 1024 })
```

### 3. Add post-generation validation with retry

```typescript
if (emailData) {
  const validation = validateEchoCompliance(`${emailData.subject}\n${emailData.body}`)
  
  if (!validation.compliant) {
    console.warn(`[generate-email] ECHO violation for ${contact.id}:`, validation.errors.map(e => e.matched_text))
    // One retry with stricter prompt
    const retryPrompt = prompt + '\n\nCRITICAL: Your previous output contained banned patterns. Strictly avoid ALL patterns listed in the Hard Rules section.'
    const retryResult = await callDeepSeekJSON(prompt, { model: "pro", temperature: 0.3, maxTokens: 1024 })
    // ... handle retry result
  }
  
  emails.push({
    ...emailData,
    compliance_score: validation.score,
    personalization: { contact_name: contact.name || 'there', company_name: contact.company || 'your company' },
  })
}
```

### 4. Replace all fallback templates with ECHO-compliant versions

Replace `generateFallbackEmail()` function — all fallback templates must:
- Use situation-first opening
- Contain zero banned patterns
- Sign off with "Kevin" only
- Stay under 200 words
- Use {contact_name} and {company_name} variables

---

## Acceptance Criteria

- [ ] DeepSeek prompt contains all ECHO rules as explicit constraints
- [ ] Temperature set to 0.4 (was 0.7)
- [ ] All fallback templates are ECHO-compliant (zero banned patterns)
- [ ] Post-generation validation runs on every AI-generated email
- [ ] Compliance score included in response object
- [ ] Retry logic: one retry on compliance failure with stricter prompt
- [ ] Sign-off is "Kevin" (no title, no company)
- [ ] Subject lines are 4-8 words

## BLAST RADIUS

| Category | Impact |
|----------|--------|
| **Files touched** | 1 file (`generate-email/route.ts`) |
| **Coupling** | Depends on `lib/echo/rules.ts` and `lib/echo/validator.ts` (ECHO-01) |
| **Database** | None |
| **Environment** | None |
| **Breaking changes** | None — output format unchanged, only content quality improves |
| **Risk** | LOW — additive constraints, no structural changes |
