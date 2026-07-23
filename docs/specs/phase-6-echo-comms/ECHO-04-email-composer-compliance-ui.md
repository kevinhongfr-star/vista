# ECHO-04: Email Composer Compliance UI

**Status**: 📋 READY  
**Effort**: M (1 day)  
**Priority**: 🟡 High  
**Dependencies**: ECHO-01 (rules engine), ECHO-02 (prompt rewrite)

---

## Objective

Add real-time ECHO compliance feedback to the Email Composer UI. Show a compliance indicator, word count, and auto-fix suggestions as the user types.

## Files

### Modified
- `components/modals/EmailComposer.tsx`

### New
- `components/modals/ECHOComplianceBadge.tsx` — Reusable compliance indicator component

---

## Current Issues

1. Tone selector options (formal/warm/direct) don't map to ECHO voice profiles
2. No compliance feedback — user can send non-compliant emails with no warning
3. No word count indicator
4. No banned pattern highlighting

## Implementation

### 1. Replace tone selector with ECHO voice profiles

```typescript
// BEFORE
const [tone, setTone] = useState<"formal" | "warm" | "direct">("warm")

// AFTER
import { VOICE_PROFILES, TONE_MAP } from '@/lib/echo/rules'
type EchoVoice = keyof typeof VOICE_PROFILES
const [voiceProfile, setVoiceProfile] = useState<EchoVoice>("teacher")
```

UI labels:
- Observer (was "formal") — factual, neutral
- Teacher (was "warm") — clear, context-first  
- Connector (was "direct") — peer-to-peer, specific

### 2. ECHOComplianceBadge component

```tsx
import { validateEchoCompliance } from '@/lib/echo/validator'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Props { subject: string; body: string }

export function ECHOComplianceBadge({ subject, body }: Props) {
  const validation = validateEchoCompliance(`${subject}\n${body}`)
  const color = validation.score >= 90 ? 'green' : validation.score >= 70 ? 'yellow' : 'red'
  
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant={color}>{validation.score >= 90 ? 'ECHO ✓' : `ECHO ${validation.score}`}</Badge>
      </TooltipTrigger>
      <TooltipContent>
        {validation.errors.length > 0 && (
          <div><p className="font-bold">Errors:</p>
            {validation.errors.map((e, i) => <p key={i}>• "{e.matched_text}": {e.description}</p>)}</div>
        )}
        {validation.warnings.length > 0 && (
          <div><p className="font-bold">Warnings:</p>
            {validation.warnings.map((w, i) => <p key={i}>• "{w.matched_text}": {w.description}</p>)}</div>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
```

### 3. Integrate into EmailComposer

Add compliance badge next to subject line and word count below body:

```tsx
<div className="flex items-center gap-2">
  <Input value={subject} onChange={e => setSubject(e.target.value)} />
  <ECHOComplianceBadge subject={subject} body={body} />
</div>

{/* Word count */}
<span className="text-xs text-muted-foreground">
  {body.split(/\s+/).length} / 200 words
</span>
```

### 4. Auto-fix button

```tsx
{validation.errors.length > 0 && (
  <Button variant="outline" size="sm" onClick={autoFix}>
    Auto-fix {validation.errors.length} issues
  </Button>
)}
```

Auto-fix highlights each violation and applies the suggestion from the rule.

---

## Acceptance Criteria

- [ ] Voice profile selector replaces legacy tone selector (Observer/Teacher/Connector)
- [ ] Compliance badge shows real-time score (debounced 500ms on keystroke)
- [ ] Badge color: green (≥90), yellow (70-89), red (<70)
- [ ] Tooltip shows specific violations and suggestions
- [ ] Word count indicator visible and accurate
- [ ] Auto-fix button proposes replacements for all errors
- [ ] Send button shows warning if score < 70 (does NOT block — Kevin is decision maker)
- [ ] Debounced to avoid performance issues during typing

## BLAST RADIUS
- **Files touched**: 1 modified + 1 new
- **Coupling**: Depends on `lib/echo/validator.ts` (ECHO-01)
- **Database**: None
- **Breaking changes**: Internal component change only
- **Risk**: LOW — UI-only changes
