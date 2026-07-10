# Wave 3: Action Engine — Spec

**Target branch:** `trae/agent-Kqk5cW`
**Estimated time:** 4-5 hours
**Prerequisite:** Wave 1 + Wave 2 merged to main

---

## Overview

Wave 3 turns VISTA from an intelligence tool into an action engine. AI doesn't just analyze — it generates actionable content (emails, campaigns) and wires Execute buttons so Kevin can act directly from the dashboard.

**Critical constraint:** Email sending requires explicit Kevin approval. No auto-send. AI prepares → Kevin reviews → Kevin clicks "Execute" → email goes out via MS Graph.

---

## Deliverables

### Deliverable 10: AI Email Generation Endpoint

**Route:** `POST /api/intelligence/generate-email`

**What it does:**
- Takes a contact_id (or array of contact_ids) + optional template_type
- Queries contact data from Supabase (name, company, role, industry, pipeline_stage, last_touch_date, recent_signals)
- Calls DeepSeek pro to generate personalized email subject + body
- Returns draft email for preview in EmailComposer

**Request body:**
```typescript
interface GenerateEmailRequest {
  contact_ids: string[]
  template_type?: string  // "Executive Brief" | "Webinar Invite" | "Podcast Invite" | "Newsletter" | "Event Invite" | "Follow-up" | "Re-engagement" | "Custom"
  context?: string        // Optional additional context for AI
  tone?: "formal" | "warm" | "direct"  // Default: "warm"
}
```

**DeepSeek prompt structure:**
```
You are writing a business development email for Kevin Hong, Managing Partner at LYC Partners (executive search firm).

Contact profile:
- Name: {name}
- Company: {company}  
- Role: {role}
- Industry: {industry}
- Pipeline stage: {pipeline_stage}
- Last touch: {last_touch_date}
- Recent signals: {signals}

Template type: {template_type}
Tone: {tone}
Additional context: {context}

Generate:
1. A compelling subject line (max 60 chars)
2. Email body (150-250 words) that:
   - References something specific about the contact (company news, role change, signal)
   - Positions LYC Partners value without being salesy
   - Has a clear but low-pressure CTA
   - Uses {contact_name} and {company_name} as template variables for personalization

Return JSON: { "subject": "...", "body": "..." }
```

**Response:**
```typescript
{
  success: true,
  emails: Array<{
    contact_id: string
    subject: string
    body: string
    personalization: { contact_name: string, company_name: string }
  }>
}
```

**Fallback:** If DeepSeek fails, return template-based email with contact name/company filled in.

---

### Deliverable 11: AI Campaign Sequence Generation

**Route:** `POST /api/intelligence/generate-campaign`

**What it does:**
- Takes a cluster_id or contact_ids array + campaign objective
- Calls DeepSeek pro to generate a multi-touch campaign sequence
- Returns an array of campaign steps with timing, email drafts, and action descriptions

**Request body:**
```typescript
interface GenerateCampaignRequest {
  scope: "cluster" | "contacts"
  cluster_id?: string
  contact_ids?: string[]
  objective: string  // e.g., "Book 5 discovery calls for APAC tech practice"
  touches?: number   // Default: 3 (max 5)
  channel_mix?: ("email" | "linkedin" | "phone" | "event")[]
}
```

**DeepSeek prompt structure:**
```
You are designing a BD campaign for LYC Partners executive search.

Campaign objective: {objective}
Target audience: {cluster_or_contacts summary}
Number of touches: {touches}
Channel mix: {channel_mix}

Generate a {touches}-touch campaign sequence. For each touch:
1. Day offset (when to execute)
2. Channel (email/linkedin/phone/event)
3. Action description (what to do)
4. If email: subject line + body draft (150-200 words)
5. Success criteria (what counts as a positive response)

Return JSON: {
  "campaign_name": "...",
  "objective": "...",
  "duration_days": number,
  "touches": [
    {
      "day_offset": 0,
      "channel": "email",
      "action": "Initial outreach",
      "subject": "...",
      "body": "...",
      "success_criteria": "Reply or calendar booking"
    },
    ...
  ]
}
```

**Response:**
```typescript
{
  success: true,
  campaign: {
    campaign_name: string
    objective: string
    duration_days: number
    touches: CampaignTouch[]
    target_contacts: number
  }
}
```

After generation, user can review/edit each touch before saving to `campaign_activities` table.

---

### Deliverable 12: Wire "Execute" Buttons on Next Best Action Cards

**What it does:**
- The Dashboard and ContactDetail pages already show "Next Best Action" recommendations
- Add an "Execute" button on each action card
- Clicking Execute triggers the appropriate action:
  - If action = "Send email" → opens EmailComposer with AI-generated draft pre-filled
  - If action = "Create campaign" → opens CampaignWizard with AI-generated sequence pre-filled
  - If action = "Schedule meeting" → opens a meeting scheduler (future, for now just logs intent)

**UI changes:**

1. **Dashboard.tsx** — In the Priority Actions section, add Execute button:
```tsx
<Button 
  size="sm" 
  onClick={() => handleExecute(action)}
  className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
>
  <Play className="h-3 w-3 mr-1" /> Execute
</Button>
```

2. **handleExecute function:**
```typescript
const handleExecute = (action: PriorityAction) => {
  switch (action.type) {
    case "email":
      setEmailComposerOpen(true)
      setEmailTarget(action.contact)
      // Trigger AI email generation
      generateEmailDraft(action.contact.id, action.template_type)
      break
    case "campaign":
      setCampaignWizardOpen(true)
      setCampaignTarget(action.cluster_id)
      generateCampaignDraft(action.cluster_id, action.objective)
      break
    case "meeting":
      addToast("info", "Meeting scheduling coming in Wave 4")
      break
  }
}
```

3. **ContactDetail page** — Same pattern on the recommendations section.

---

### Deliverable 13: "AI Draft" Button in EmailComposer

**What it does:**
- Add an "AI Draft" button in the EmailComposer toolbar
- Clicking it calls `POST /api/intelligence/generate-email` with the selected contact(s)
- Populates subject and body fields with AI-generated content
- User can edit before sending

**UI changes to `components/modals/EmailComposer.tsx`:**
```tsx
<Button
  variant="outline"
  onClick={handleGenerateAIDraft}
  disabled={isGenerating || contacts.length === 0}
>
  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
  AI Draft
</Button>
```

**handleGenerateAIDraft:**
```typescript
const handleGenerateAIDraft = async () => {
  setIsGenerating(true)
  try {
    const res = await fetch("/api/intelligence/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_ids: contacts.map(c => c.id),
        template_type: templateType || undefined,
        tone: "warm",
      }),
    })
    const data = await res.json()
    if (data.success && data.emails[0]) {
      setSubject(data.emails[0].subject)
      setBody(data.emails[0].body)
    }
  } finally {
    setIsGenerating(false)
  }
}
```

---

## Execution Order

1. **10** — AI Email Generation endpoint (foundational, everything else depends on it)
2. **13** — AI Draft button in EmailComposer (immediate visual validation)
3. **11** — AI Campaign Sequence generation
4. **12** — Wire Execute buttons on Dashboard/ContactDetail

---

## Existing Code to Modify

| File | Change |
|---|---|
| `app/api/intelligence/generate-email/route.ts` | NEW — AI email generation |
| `app/api/intelligence/generate-campaign/route.ts` | NEW — AI campaign generation |
| `components/modals/EmailComposer.tsx` | ADD "AI Draft" button + handler |
| `app/dashboard/Dashboard.tsx` | ADD Execute buttons on Priority Actions |
| `app/contacts/[id]/ContactDetail.tsx` | ADD Execute buttons on recommendations |
| `lib/types.ts` | ADD GenerateEmailRequest, GenerateCampaignRequest, CampaignTouch |

---

## Rules

1. **Use `callDeepSeekJSON<T>()`** from `lib/deepseek.ts` — not raw fetch
2. **Pro model for generation** — flash is too low quality for email copy
3. **Never auto-send emails** — AI generates draft, Kevin reviews, Kevin clicks send
4. **Log everything to activities table** — every AI generation and every execution
5. **Don't delete INTELLIGENCE_LAYER_SPEC.md, NEXT_TICKETS.md, or WAVE2_BULK_OPS_SPEC.md**
6. **Don't scatter test files in repo root** — put them in `tests/`
7. **Push to GitHub** before saying "done"

---

## Email Sending Note

The current `POST /api/email/send` logs activities to Supabase but does NOT actually send emails. Actual MS Graph sending requires OAuth credentials configured in Vercel env vars. This is a separate infrastructure task — for Wave 3, focus on AI generation + Execute button wiring. The "send" action should log to activities and show a "Email drafted — ready to send" toast. Actual MS Graph integration can be done as a follow-up once auth is configured.
