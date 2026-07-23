# ECHO-03: Template Library Overhaul

**Status**: 📋 READY  
**Effort**: M (1 day)  
**Priority**: 🔴 Critical  
**Dependencies**: ECHO-01 (rules engine)

---

## Objective

Replace all default email templates in `app/templates/page.tsx` with ECHO-compliant versions aligned to the 8 email types defined in ECHO Email Guidelines v1.0.

## Files Modified
- `app/templates/page.tsx`

## Current Issues
1. "Exclusive Executive Brief" — banned word "Exclusive"
2. "I would like to invite you" — banned pattern ECHO-BP-007
3. "You're Invited" — commercial framing
4. "Join us for an exclusive webinar" — double violation (exclusive + invitation framing)
5. "Dear {contact_name}" — should be "{contact_name}," (no "Dear")

## Implementation

Replace the `defaultTemplates` array with 8 ECHO-compliant templates:

```typescript
const defaultTemplates: EmailTemplate[] = [
  {
    id: "default-1",
    template_name: "Service Introduction",
    template_type: "Service Introduction",
    subject_template: "Market observations relevant to {company_name}",
    body_template: `{contact_name},

[Specific observation about their company/industry — a factual development, not a pitch].

This connects to executive talent dynamics in [specific area]. A pattern worth noting: [concrete insight].

[Specific next step — e.g., "A conversation might be useful if this connects to your current priorities."].

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-2",
    template_name: "Podcast Invitation",
    template_type: "Podcast Invite",
    subject_template: "Podcast: sharing your perspective on [topic]",
    body_template: `{contact_name},

We produce a podcast series on [topic area]. Your work on [specific thing at {company_name}] would add a perspective our audience — senior operators and investors — would find useful.

Format: [duration] conversation. No preparation needed.

[Specific detail: date range, audience size].

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-3",
    template_name: "Webinar Invitation",
    template_type: "Webinar Invite",
    subject_template: "{webinar_title} — session on [date]",
    body_template: `{contact_name},

There is a session on {webinar_title} on {webinar_date}. The focus is [specific topic] — relevant because [factual market context].

[1-2 sentences on what the attendee will observe/learn].

[Registration detail].

Kevin`,
    variables: ["{contact_name}", "{webinar_title}", "{webinar_date}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-4",
    template_name: "Workshop Invitation",
    template_type: "Workshop Invite",
    subject_template: "Workshop: [topic] — [date]",
    body_template: `{contact_name},

A working session on [topic] — [date]. Format: [e.g., "a working session with 12 senior operators"].

The working question: [specific question the workshop addresses].

[Logistics and next step].

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-5",
    template_name: "Coaching Program Introduction",
    template_type: "Coaching Program",
    subject_template: "1:1 advisory sessions — [topic area]",
    body_template: `{contact_name},

I run a limited number of 1:1 advisory sessions for [specific audience].

Structure: [format, frequency, duration]. Not coaching in the traditional sense — more a thinking partner with market context.

If relevant to what you're working through at {company_name}, I can share more detail.

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-6",
    template_name: "Advisory Introduction",
    template_type: "Advisory",
    subject_template: "Advisory work — [specific domain]",
    body_template: `{contact_name},

A note on advisory work. I advise [type of company] on [specific domain].

This is ongoing, strategic, and typically involves [structure].

[Specific connection to recipient's situation].

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-7",
    template_name: "Follow-up After Meeting",
    template_type: "Follow-up",
    subject_template: "{company_name} — continuing from our conversation",
    body_template: `{contact_name},

Following our conversation about [topic], one point worth adding:

[Specific insight, observation, or resource].

[Specific next step if applicable, or end].

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
  {
    id: "default-8",
    template_name: "Cold Outreach",
    template_type: "Cold Outreach",
    subject_template: "[Specific observation about {company_name}]",
    body_template: `{contact_name},

[Specific, factual observation about {company_name} — a recent development, market position, or pattern].

This connects to [specific market dynamic or talent pattern]. What I'm seeing in this space: [1-2 concrete observations].

[Soft close or end with the observation].

Kevin`,
    variables: ["{contact_name}", "{company_name}"],
    created_at: null, updated_at: null,
  },
]
```

---

## Acceptance Criteria

- [ ] All 8 template types from ECHO Email Guidelines v1.0 are represented
- [ ] Zero banned patterns in any template body or subject
- [ ] Sign-off is "Kevin" only (no title block)
- [ ] Subject lines are 4-8 words
- [ ] Body text under 200 words each
- [ ] Opening is situation-first (no "I wanted to..." / "I would like to...")
- [ ] No "Dear" — uses "{contact_name}," directly
- [ ] All templates pass `validateEchoCompliance()` with score ≥ 90

## BLAST RADIUS
- **Files touched**: 1 file (`app/templates/page.tsx`)
- **Coupling**: Templates loaded by EmailComposer — UI unchanged, only content changes
- **Database**: None (default templates are hardcoded)
- **Breaking changes**: None — template IDs remain the same
- **Risk**: LOW — content-only change
