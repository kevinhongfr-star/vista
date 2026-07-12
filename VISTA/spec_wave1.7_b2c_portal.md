# Wave 1.7 — DEX AI B2C Career Advisory Portal

**Version:** 1.0 | **Date:** 2026-07-12 | **Author:** James/AI for Kevin Hong
**Depends on:** Wave 1.6 (Revenue Operating System — spec ready)
**Blocks:** Wave 2 (Context & Connectivity)
**Estimated Duration:** ~40 days sequential, ~15 days with 2 devs
**Trigger:** LYC Pricing Strategy V2 (2026-07-12)

---

## Why This Wave Exists

The V2 pricing strategy introduces an entirely new business line: a **B2C AI Career Advisory Portal** for individual professionals. This is not an iteration — it's a new product layer embedded inside VISTA that creates a completely new revenue stream (target: ¥1.2M/yr) and a new conversion funnel from B2C consumers to B2B enterprise clients.

**The strategic logic:**
```
B2C users discover LYC through AI career chat → hit the ceiling of self-service → 
get upgraded to Council/Workshop/Diagnostic/Advisory → become B2B clients
```

**Core principle:** B2C is a acquisition engine AND a revenue stream. Every free chat user is a potential Council member.

---

## Architecture Overview

### The New Tier 1.5 — B2C Portal

```
Tier 1:   FREE (Acquisition)     → Content, Newsletter, Podcast, Webinar, Teaser
Tier 1.5: B2C PORTAL (NEW)       → Explorer, Credit Packs, Member, Pro  ← THIS WAVE
Tier 2:   LOW-TICKET (Validation) → Workshops, Reports, Maps, Council starter
Tier 3:   MID-TICKET (Revenue)   → Diagnostics, Coaching, Training, DEX Pro
...
```

### B2C Product Ladder

| Product | Price | Credits | Gate | Monthly Revenue Potential |
|---------|-------|---------|------|--------------------------|
| Explorer | Free | 5 messages (lifetime) | Email only | ¥0 (acquisition) |
| Credit Pack Starter | ¥99 | 10 credits | None | Transactional |
| Credit Pack Professional | ¥399 | 50 credits | None | Transactional |
| Credit Pack Executive | ¥799 | 150 credits | None | Transactional |
| Member | ¥99/mo | 30 credits/mo | LinkedIn profile | ¥99/user |
| Pro | ¥299/mo | 100 credits/mo | LinkedIn + payment | ¥299/user |

### Credit Consumption Table

| Assessment/Feature | Credits | Description |
|-------------------|---------|-------------|
| PRISM Personality Assessment | 3 | Career personality profile |
| TRIDENT Skills Assessment | 5 | Skills gap analysis |
| CANVAS Career Path | 8 | Career trajectory mapping |
| Market Report | 10 | Industry talent market intelligence |
| Coaching Session Booking | 15 | 1:1 coaching session |
| CV Audit | 5 | AI-powered CV review |
| LinkedIn Audit | 5 | LinkedIn profile optimization |

### The Complete B2C → B2B Upgrade Path

```
Explorer (free chat)
    ↓ [hit 5 msg limit]
Credit Pack (¥99-799)
    ↓ [recurring usage detected]
Member (¥99/mo)
    ↓ [heavy usage, needs more]
Pro (¥299/mo)
    ↓ [hit ceiling of self-service]
Council (¥2,800-5,000/yr)
    ↓ [enterprise-grade needs]
Workshop (¥2-8K)
    ↓ [team/org challenges]
Diagnostic (¥8-25K)
    ↓ [transformation need]
Advisory (¥40-150K)
    ↓ [ongoing support]
Retainer (¥15-30K/mo)
    ↓ [full platform]
Platform (DEX AI B2B)
```

### B2C Revenue Math

| Scenario | Users | ARPU | Monthly | Annual |
|----------|-------|------|---------|--------|
| Conservative (Month 3) | 50 | ¥150 | ¥7,500 | ¥90K |
| Target (Month 9) | 500 | ¥200 | ¥100,000 | ¥1.2M |
| Stretch (Month 12) | 1,000 | ¥250 | ¥250,000 | ¥3.0M |

---

## Domain 1: B2C Auth & User Infrastructure (BC-01 to BC-04)

### BC-01: B2C User Registration & Authentication
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Separate authentication flow for B2C users. Email + LinkedIn registration, distinct from B2B Supabase Auth.

**Requirements:**
- Email/password registration with verification
- LinkedIn OAuth registration (extract name, headline, profile URL)
- Session management (JWT tokens, refresh tokens)
- Password reset flow
- Rate limiting on auth endpoints (prevent abuse)
- B2C users stored in separate table from B2B contacts
- Auto-create `vista_b2c_profiles` on registration

**UI:**
- Clean, minimal registration page (consumer-grade, not enterprise)
- "Sign up with Email" / "Sign up with LinkedIn" buttons
- Brand: DEX AI Career Advisory (sub-brand of LYC)
- Mobile-responsive

**Data model:**
```sql
-- vista_b2c_users (see migration SQL)
-- Separate from vista_contacts (B2B)
-- Linked via linkedin_url for cross-reference
```

**Acceptance criteria:**
- [ ] User can register with email + password
- [ ] User can register with LinkedIn OAuth
- [ ] Email verification sent and validated
- [ ] JWT session created, stored in localStorage
- [ ] Password reset flow works end-to-end
- [ ] Rate limiting prevents >10 registrations/hour/IP

---

### BC-02: B2C User Profile Management
**Priority:** 🔴 Critical | **Estimate:** 2 days

**What:** Profile page for B2C users — basic info, LinkedIn import, career context.

**Fields:**
- Name, email, avatar (auto from LinkedIn or uploaded)
- LinkedIn profile URL (auto-imported or manual)
- Current role, company, industry
- Career stage: Early / Mid / Senior / Executive / Transitioning
- Career goals (free text, AI-extractable)
- Subscription status, credit balance, membership tier

**UI:**
- Profile settings page
- LinkedIn import button (re-sync)
- Credit balance prominently displayed
- Current plan + upgrade CTA

**Acceptance criteria:**
- [ ] Profile page shows all fields
- [ ] LinkedIn data auto-populates on registration
- [ ] User can edit career stage and goals
- [ ] Credit balance updates in real-time
- [ ] Plan tier visible with upgrade CTA

---

### BC-03: Credit System & Ledger
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Complete credit management — purchase, consumption, ledger, expiry.

**Credit rules:**
- Credits never expire for paid packs (one-time purchase)
- Monthly subscription credits reset each billing cycle (use-it-or-lose-it)
- Free Explorer credits (5 messages) = lifetime, non-renewable
- Negative balance prevention: must have sufficient credits before starting assessment
- Partial credit usage: if assessment costs 5cr and user has 3cr, show "insufficient credits"

**Credit ledger entries:**
| Type | Description |
|------|-------------|
| `purchase` | Credits bought (pack or subscription renewal) |
| `subscription_grant` | Monthly credit allocation |
| `consumption` | Credits spent on assessment/feature |
| `refund` | Credits returned (failed assessment, support) |
| `expiry` | Monthly credits that expired unused |
| `bonus` | Promotional credits |

**UI:**
- Credit balance widget (always visible in header)
- Credit history/ledger page (filterable by type, date)
- "Buy Credits" page with 3 pack options
- Insufficient credits modal with purchase CTA

**Acceptance criteria:**
- [ ] Credit purchase adds to balance immediately
- [ ] Each assessment deducts correct credit amount
- [ ] Ledger records every credit movement
- [ ] Monthly credits reset on billing cycle date
- [ ] Cannot start assessment with insufficient credits
- [ ] Credit balance accurate across all views

---

### BC-04: Subscription Management (Member & Pro)
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Monthly subscription lifecycle — creation, renewal, cancellation, dunning.

**Plans:**
| Plan | Price | Credits/Month | Requirements |
|------|-------|---------------|--------------|
| Member | ¥99/mo | 30 | LinkedIn profile verified |
| Pro | ¥299/mo | 100 | LinkedIn + payment |

**Subscription states:**
```
trial → active → [renewal] → active
                  ↓ [failed payment]
              past_due → [3 retries over 7 days] → canceled
                  ↓ [user cancels]
              canceled → [end of period] → expired
```

**Payment integration:**
- Stripe-compatible payment interface (or local: WeChat Pay / Alipay)
- For MVP: manual payment confirmation (user uploads receipt, admin confirms)
- Future: automated payment processing

**UI:**
- Subscription settings page
- Current plan + usage bar (e.g., "23/30 credits used")
- Upgrade/downgrade buttons
- Cancel subscription flow (with confirmation + reason)
- Payment history

**Acceptance criteria:**
- [ ] User can subscribe to Member/Pro plan
- [ ] Monthly credits granted on subscription start
- [ ] Credits reset on each billing cycle
- [ ] User can cancel subscription (access continues until period end)
- [ ] Failed payment triggers dunning flow
- [ ] Upgrade pro-rates remaining credits

---

## Domain 2: Chat Engine & AI Interface (BC-05 to BC-08)

### BC-05: Chat Interface — Core UI
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** Chat-first AI career advisory interface. This is the primary product — everything else supports the chat.

**Design principles:**
- ChatGPT-style conversational UI
- Warm, professional tone (not clinical)
- Proactive suggestions (not just reactive)
- Assessment triggers embedded in conversation
- Mobile-first (most B2C users will be on phones)

**Chat flow:**
```
User: "I'm thinking about changing careers"
AI: "That's a big decision. Let me help you think through it. 
     To give you the best guidance, I'd like to understand your situation better.
     
     [Start PRISM Assessment - 3 credits] ← embedded CTA
     [Explore Career Options - free]
     [Talk to a Coach - 15 credits]"
```

**UI components:**
- Message list (user + AI messages, with timestamps)
- Input bar with character limit indicator
- Embedded assessment cards (CTAs within chat)
- Credit cost indicator before each paid action
- "X messages remaining" counter for free tier
- Typing indicator + streaming responses

**Technical:**
- WebSocket or SSE for streaming responses
- DeepSeek API integration (route through DeepSeek, NOT Coze compute)
- Conversation context window (last 20 messages)
- System prompt customized per user tier (Pro gets deeper analysis)

**Acceptance criteria:**
- [ ] Chat UI renders messages in real-time
- [ ] Streaming responses work (token-by-token)
- [ ] Free tier limited to 5 messages total
- [ ] Credit cost shown before paid actions
- [ ] Conversation history persists across sessions
- [ ] Mobile-responsive layout

---

### BC-06: Message Counting & Free Tier Enforcement
**Priority:** 🔴 Critical | **Estimate:** 1 day

**What:** Enforce the 5-message free limit. Track usage. Trigger upgrade prompts.

**Rules:**
- Explorer (free) = 5 messages LIFETIME (not per day, not per month)
- Each user message = 1 count (AI responses don't count)
- At message 4: show "1 message remaining. [Unlock unlimited →]"
- At message 5: show "You've used all free messages. [Buy credits] [Subscribe]"
- Paid users: no message limit (credit-gated instead)

**Upgrade prompts (contextual):**
- Message 3: soft prompt — "Enjoying DEX AI? Unlock full access →"
- Message 4: medium prompt — "1 message left. Pro members get 100 credits/month →"
- Message 5: hard wall — "Free trial complete. Choose your plan →"

**Acceptance criteria:**
- [ ] Free users limited to exactly 5 messages
- [ ] Counter decrements correctly
- [ ] Upgrade prompts appear at correct thresholds
- [ ] Hard wall at message 5 blocks further chat
- [ ] Paid users not subject to message limit

---

### BC-07: Conversation History & Context Management
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Persistent conversation history, session management, context for AI.

**Features:**
- Conversation list (like ChatGPT sidebar)
- New conversation button
- Rename/delete conversations
- Search within conversations
- Conversation summary (AI-generated)
- Context passing: AI remembers previous conversations for same user

**Data model:**
```sql
-- vista_b2c_chat_sessions
-- vista_b2c_chat_messages
-- Both in migration SQL
```

**AI context window:**
- Current session: full conversation
- Previous sessions: summaries (AI-generated, stored)
- User profile: career stage, goals, past assessments
- System prompt includes user context for personalized responses

**Acceptance criteria:**
- [ ] Conversations persist across browser sessions
- [ ] User can have multiple conversations
- [ ] AI references previous conversations when relevant
- [ ] Search finds messages across all conversations
- [ ] Conversation summaries generated automatically

---

### BC-08: DeepSeek AI Integration — Career Advisory Engine
**Priority:** 🔴 Critical | **Estimate:** 3 days

**What:** The AI brain. DeepSeek-powered career advisory with assessment-aware prompts.

**System prompt architecture:**
```
Base prompt: Career advisor persona (warm, professional, insightful)
+ User context: career stage, goals, past assessments, conversation history
+ Tier context: Pro users get deeper analysis, free users get surface-level
+ Assessment awareness: AI knows when to recommend PRISM/TRIDENT/CANVAS
+ Conversion awareness: AI knows when user is hitting ceiling → suggest Council/coaching
```

**AI response types:**
| Type | Description | Credit Cost |
|------|-------------|-------------|
| General career advice | Open conversation | Free (up to 5 msgs) / 1cr |
| Assessment recommendation | "Based on what you've shared, I recommend PRISM" | 0cr (just a suggestion) |
| Assessment execution | Running PRISM/TRIDENT/CANVAS | 3/5/8 credits |
| Market report generation | Industry/role analysis | 10 credits |
| CV/LinkedIn audit | Document review | 5 credits |
| Coaching session | Extended deep conversation | 15 credits |

**DeepSeek routing:**
- Use `deepseek-call.py` with flash model for chat (fast, cheap)
- Use pro model for assessments and reports (deeper reasoning)
- All compute through DeepSeek API (ZERO Coze compute)

**Acceptance criteria:**
- [ ] AI responses are career-relevant and personalized
- [ ] Assessment recommendations are contextually appropriate
- [ ] Pro users get noticeably deeper analysis
- [ ] Response time <3 seconds for chat, <10 for assessments
- [ ] AI correctly suggests upgrade when user hits ceiling
- [ ] All AI compute routed through DeepSeek API

---

## Domain 3: Credit Billing & Payment (BC-09 to BC-11)

### BC-09: Credit Pack Purchase Flow
**Priority:** 🔴 Critical | **Estimate:** 2 days

**What:** E-commerce flow for one-time credit pack purchases.

**Pack options:**
| Pack | Credits | Price | Per Credit |
|------|---------|-------|-----------|
| Starter | 10 | ¥99 | ¥9.90 |
| Professional | 50 | ¥399 | ¥7.98 |
| Executive | 150 | ¥799 | ¥5.33 |

**Flow:**
```
Credit balance = 0 or low
    → "Buy Credits" modal/page
    → Select pack (3 options)
    → Payment (WeChat Pay / Alipay / manual)
    → Confirmation
    → Credits added to balance
    → "Start your assessment" CTA
```

**Rules:**
- Credits never expire (one-time purchase)
- Volume discount visible (per-credit cost decreases with larger packs)
- Receipt/invoice generated
- "Most Popular" badge on Professional pack

**Acceptance criteria:**
- [ ] 3 pack options displayed with pricing
- [ ] Payment flow completes successfully
- [ ] Credits added to balance immediately after payment
- [ ] Receipt generated and accessible
- [ ] Per-credit cost visible for comparison

---

### BC-10: Payment Integration (MVP: Manual + Future Stripe)
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Payment processing. MVP = manual confirmation. V2 = Stripe/WeChat Pay/Alipay.

**MVP approach (Phase 1):**
- User selects product/credits
- System generates payment QR code (WeChat Pay / Alipay)
- User uploads payment screenshot
- Admin (Kevin/ops) manually confirms → credits/sub activated
- Notification sent to user

**Phase 2 (automated):**
- Stripe integration for international cards
- WeChat Pay API for domestic
- Alipay API for domestic
- Automated confirmation → instant credit activation

**Data model:**
```sql
-- vista_b2c_payments
-- vista_b2c_subscriptions
-- Both in migration SQL
```

**Acceptance criteria:**
- [ ] MVP: Payment request generates QR code
- [ ] MVP: User can upload payment proof
- [ ] MVP: Admin can confirm/reject payment
- [ ] Credits activate after admin confirmation
- [ ] Payment history accessible to user
- [ ] Phase 2 schema ready for Stripe integration

---

### BC-11: B2C Billing Dashboard (Admin)
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Internal admin view for managing B2C revenue — transactions, subscriptions, revenue metrics.

**Views:**
- Transaction feed (all credit purchases, subscription payments)
- Subscription status list (active, past_due, canceled, expired)
- Revenue summary (MRR, credit revenue, subscription revenue)
- Pending payment confirmations (MVP manual flow)
- Refund processing interface

**Metrics:**
- MRR (Monthly Recurring Revenue) from subscriptions
- Credit revenue (one-time purchases)
- ARPU (Average Revenue Per User)
- Credit burn rate (average credits consumed per user per month)
- Conversion rates (free → paid, pack → subscription)

**Acceptance criteria:**
- [ ] All B2C transactions visible in feed
- [ ] Subscription status filterable
- [ ] MRR calculated correctly
- [ ] Pending payments queue for admin action
- [ ] Revenue broken down by type (credit vs subscription)

---

## Domain 4: B2C Analytics & Funnel (BC-12 to BC-14)

### BC-12: B2C Conversion Funnel Tracking
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Track the B2C user journey from first visit to highest tier.

**Funnel stages:**
```
Visitor → Registered → First Chat → Free Limit Hit → 
Credit Buyer → Subscriber (Member) → Subscriber (Pro) → 
Assessment User → Council/Workshop Lead → B2B Client
```

**Tracking:**
- Each stage transition recorded with timestamp
- Time-in-stage calculated
- Drop-off points identified
- Cohort analysis (when did they join? what's their path?)

**Dashboard:**
- Funnel visualization (bar chart, conversion rates between stages)
- Stage duration heatmap
- Top drop-off points highlighted
- Cohort comparison (week over week)

**Acceptance criteria:**
- [ ] All stage transitions tracked automatically
- [ ] Funnel visualization renders correctly
- [ ] Conversion rates accurate between each stage
- [ ] Drop-off points clearly identified
- [ ] Cohort analysis available

---

### BC-13: B2C User Analytics Dashboard
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Internal dashboard for monitoring B2C portal health.

**Key metrics:**
- Total registered users (by tier: Explorer, Credit, Member, Pro)
- DAU/MAU (Daily/Monthly Active Users)
- Credit burn rate (avg credits consumed per user per month)
- MRR and credit revenue
- User acquisition (by channel: organic, LinkedIn, referral)
- Churn rate (subscription cancellations)
- LTV (Lifetime Value) by cohort
- B2C → B2B conversion count

**Visualizations:**
- User growth chart (daily signups, cumulative)
- Revenue chart (MRR trend, credit revenue trend)
- Tier distribution pie chart
- Credit consumption heatmap (which assessments are popular)
- B2C → B2B pipeline (how many B2C users converted to Council/workshop)

**Acceptance criteria:**
- [ ] All key metrics displayed and updating
- [ ] User growth trend visible
- [ ] Revenue breakdown by type
- [ ] Tier distribution accurate
- [ ] B2C → B2B conversion tracked

---

### BC-14: Credit Burn Analytics & Forecasting
**Priority:** 🟢 Medium | **Estimate:** 2 days

**What:** Understand how users consume credits. Predict when they'll need to buy more.

**Analytics:**
- Average credits consumed per user per week
- Credit consumption by assessment type (PRISM vs TRIDENT vs CANVAS)
- Users approaching zero credits (trigger auto-reminder)
- Predicted credit depletion date per user
- Revenue forecast based on credit burn patterns

**Automated actions:**
- User at <5 credits: "Running low. [Buy more]" prompt
- User at 0 credits: hard wall with purchase CTA
- User consistently burning 30+ credits/month: "Upgrade to Member for ¥99/mo (30 credits)" prompt

**Acceptance criteria:**
- [ ] Credit burn rate calculated per user
- [ ] Depletion prediction accurate within 3 days
- [ ] Low-credit prompts trigger correctly
- [ ] Upgrade suggestions contextually appropriate
- [ ] Revenue forecast within 20% of actual

---

## Domain 5: Assessment Module (BC-15 to BC-18)

### BC-15: Assessment Gateway (Credit-Gated Access)
**Priority:** 🔴 Critical | **Estimate:** 2 days

**What:** Unified assessment launchpad — shows available assessments, credit costs, and launches them.

**Assessment catalog:**
| Assessment | Credits | Description | Output |
|-----------|---------|-------------|--------|
| PRISM | 3 | Career personality profile | 10-page PDF report |
| TRIDENT | 5 | Skills gap analysis | Skills matrix + recommendations |
| CANVAS | 8 | Career path mapping | Visual career trajectory |
| Market Report | 10 | Industry talent intelligence | Market brief |
| CV Audit | 5 | AI CV review | Annotated CV + suggestions |
| LinkedIn Audit | 5 | LinkedIn profile optimization | Profile score + fixes |
| Coaching Session | 15 | 1:1 coaching booking | Session scheduled |

**UI:**
- Assessment grid/list view
- Each card: name, description, credit cost, "Start" button
- Credit balance shown
- "Insufficient credits" → purchase CTA
- Past assessments listed with "View Report" option

**Acceptance criteria:**
- [ ] All 7 assessment types displayed
- [ ] Credit cost shown before launch
- [ ] Insufficient credits blocks launch
- [ ] Past assessments accessible
- [ ] Reports downloadable

---

### BC-16: PRISM Assessment (Personality Profile)
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Career personality assessment — 3 credits. AI-powered, question-based.

**Flow:**
```
User clicks "Start PRISM" (3 credits deducted)
    → 20-30 questions (multiple choice + free text)
    → AI analyzes responses (DeepSeek pro model)
    → Generate 10-page PDF report:
        - Personality type (career-contextualized)
        - Strengths & blind spots
        - Ideal work environment
        - Career path recommendations
        - Communication style
        - Leadership potential
    → Report available in-app + PDF download
    → AI follow-up: "Want to explore these career paths? Try CANVAS (8 credits)"
```

**Question design:**
- Mix of Likert scale, multiple choice, and open-ended
- Career-contextualized (not generic personality test)
- Adaptive: later questions depend on earlier answers
- ~15 minutes to complete

**Acceptance criteria:**
- [ ] Assessment launches after credit deduction
- [ ] Questions render and accept answers
- [ ] AI generates coherent personality report
- [ ] Report available in-app and as PDF
- [ ] Follow-up assessment suggestions shown

---

### BC-17: TRIDENT Assessment (Skills Gap Analysis)
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Skills assessment — 5 credits. Maps current skills vs target role requirements.

**Flow:**
```
User clicks "Start TRIDENT" (5 credits deducted)
    → Select target role/industry
    → Skills self-assessment (rate yourself on 30+ skills)
    → AI validates against LinkedIn profile (if connected)
    → AI generates skills matrix:
        - Current skill levels
        - Target role requirements
        - Gap analysis (what's missing)
        - Learning recommendations
        - Timeline estimate to bridge gaps
    → Report: visual skills radar chart + narrative
```

**Output:**
- Skills radar chart (current vs target)
- Top 5 gaps with learning resources
- Estimated timeline to readiness
- Recommended LYC services (coaching, training)

**Acceptance criteria:**
- [ ] Skills assessment launches correctly
- [ ] Target role selection works
- [ ] AI generates meaningful gap analysis
- [ ] Visual radar chart renders
- [ ] Learning recommendations are relevant

---

### BC-18: CANVAS Assessment (Career Path Mapping)
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** Career trajectory mapping — 8 credits. The most comprehensive assessment.

**Flow:**
```
User clicks "Start CANVAS" (8 credits deducted)
    → Input: current role, experience, goals, constraints
    → AI analyzes:
        - Current position in career lifecycle
        - Possible trajectories (3-5 paths)
        - Market demand for each path
        - Required skills/experience for each
        - Timeline and milestones
        - Risks and opportunities
    → Generate visual career map:
        - Timeline visualization (now → 5 years)
        - Multiple paths with probability
        - Key decision points
        - Recommended next steps
    → 15-page comprehensive report
```

**Output:**
- Visual career timeline (multiple paths)
- Market data for each path
- Decision framework
- Action plan (next 90 days)
- Recommended LYC services at each stage

**Acceptance criteria:**
- [ ] CANVAS launches after credit deduction
- [ ] Career paths are realistic and data-informed
- [ ] Visual timeline renders correctly
- [ ] Market data integrated where available
- [ ] Action plan is specific and actionable

---

## Domain 6: Upgrade Path & Cross-Sell (BC-19 to BC-21)

### BC-19: B2C → B2B Upgrade Pipeline
**Priority:** 🟡 High | **Estimate:** 3 days

**What:** When B2C users hit the ceiling of self-service, automatically flag them for B2B upgrade.

**Trigger conditions (any of):**
- Pro subscriber for 3+ months with high engagement
- Completed 3+ assessments (PRISM + TRIDENT + CANVAS)
- AI conversation reveals enterprise-level needs (team, org, company challenges)
- User explicitly asks about team/company solutions
- Credit spend > ¥2,000 in 3 months (heavy user)

**Automated actions:**
- Flag user in VISTA as "B2B Upgrade Candidate"
- Create record in `vista_b2c_upgrade_candidates`
- Notify Kevin/ops team
- In-chat: AI suggests Council membership or coaching
- Email: personalized upgrade invitation

**UI (user-facing):**
- "You've outgrown self-service" message when triggers hit
- Council membership CTA in chat
- "Talk to an advisor" button
- Workshop/diagnostic suggestion

**UI (admin-facing):**
- Upgrade candidate queue in VISTA admin
- Candidate details: usage history, triggers, suggested next step
- One-click: send upgrade invitation / create Council application / schedule call

**Acceptance criteria:**
- [ ] Trigger conditions detected automatically
- [ ] Candidates appear in admin queue
- [ ] Notification sent to ops team
- [ ] In-chat upgrade suggestions appear contextually
- [ ] Admin can take one-click actions

---

### BC-20: Council Pricing Restructure (V2 Model)
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Update Council module from V1 (3 tiers, ¥12K-50K) to V2 (4 tiers, ¥2.8K-50K).

**New Council structure:**
| Tier | Price | Capacity | Target |
|------|-------|----------|--------|
| Founding (first 20) | ¥2,800/yr | 20 seats | Early adopters, B2C upgrades |
| Regular | ¥3,800/yr | 60 seats | Standard membership |
| Premium | ¥5,000/yr | 10 seats | High-engagement members |
| Enterprise | ¥30,000-50,000/yr | 5 seats | Corporate/PE partnerships |

**Logic:**
- Founding tier: auto-close after 20 members
- Seat tracking: remaining capacity per tier
- Annual renewal with price lock for founding members
- B2C Pro subscribers get Founding tier priority access

**Updates to existing R-13 (Council Module):**
- Price points changed
- New Founding tier added
- B2C upgrade path integrated
- Capacity tracking UI

**Acceptance criteria:**
- [ ] 4 Council tiers configured correctly
- [ ] Founding tier capacity enforced (max 20)
- [ ] Pricing displayed correctly on Council page
- [ ] B2C Pro users see Founding tier priority
- [ ] Renewal pricing respects founding lock

---

### BC-21: B2C Cross-Sell Paths (4 Paths)
**Priority:** 🟡 High | **Estimate:** 2 days

**What:** Implement the 4 explicit B2C cross-sell paths from the pricing playbook.

**Path 1: Free → Credits**
```
Trigger: User hits 5-message free limit
Action: Hard wall + credit pack purchase CTA
Frame: "You've seen what AI career advisory can do. 
        Unlock full access with a credit pack starting at ¥99."
```

**Path 2: Credits → Member**
```
Trigger: User buys 2nd credit pack OR burns 20+ credits in 30 days
Action: "You're spending ¥X on credits. Member gets 30 credits/month for just ¥99. 
        You'd save ¥X."
Frame: Cost comparison + savings calculation
```

**Path 3: Pro → Council**
```
Trigger: Pro subscriber 3+ months OR completed 3+ assessments
Action: "You're getting serious about your career. Council members get exclusive 
        access to workshops, diagnostics, and peer networking. Starting at ¥2,800/yr."
Frame: Exclusive access + community + progression
```

**Path 4: B2C User → Workshop/Diagnostic**
```
Trigger: CANVAS assessment reveals team/org challenge
         OR AI conversation detects company-level needs
Action: "Based on your assessment, your challenges go beyond individual career. 
         Our [Workshop/Diagnostic] is designed for leaders facing exactly this. 
         [Learn more] [Talk to an advisor]"
Frame: Personalized relevance from assessment data
```

**Implementation:**
- Rule engine in `vista_b2c_cross_sell_rules` (seeded)
- Trigger evaluation runs after each chat session + assessment completion
- Cross-sell messages rendered in chat + email

**Acceptance criteria:**
- [ ] All 4 paths trigger correctly
- [ ] Messages are contextually relevant
- [ ] Cost savings calculated accurately (Path 2)
- [ ] Council capacity checked before CTA (Path 3)
- [ ] Assessment data informs Path 4 triggers

---

## Domain 7: Existing Ticket Modifications (BC-22 to BC-25)

### BC-22: Update R-01 Service Catalog — Add B2C Products
**Priority:** 🟢 Medium | **Estimate:** 1 day

**What:** Add B2C products to the 7-tier service catalog from Wave 1.6.

**New entries in `vista_service_catalog`:**
| Service | Tier | Price | Price Model |
|---------|------|-------|-------------|
| DEX AI Explorer (Free Chat) | 1.5 | 0 | free |
| Credit Pack Starter (10cr) | 1.5 | 99 | one_time |
| Credit Pack Professional (50cr) | 1.5 | 399 | one_time |
| Credit Pack Executive (150cr) | 1.5 | 799 | one_time |
| DEX AI Member (30cr/mo) | 1.5 | 99 | per_month |
| DEX AI Pro (100cr/mo) | 1.5 | 299 | per_month |

**Also add B2C Career Accelerator bundle:**
- 3-month Pro + PRISM + CANVAS + 1 coaching session
- Individual: ¥1,496 | Bundle: ¥1,200 (20% off)

**Acceptance criteria:**
- [ ] 6 B2C products visible in service catalog
- [ ] Tier 1.5 displayed correctly
- [ ] B2C Career Accelerator bundle configured
- [ ] Pricing matches V2 playbook

---

### BC-23: Update Funnel Core — Add Tier 1.5
**Priority:** 🟢 Medium | **Estimate:** 1 day

**What:** Insert Tier 1.5 into the 7-tier funnel model from Wave 1.5/1.6.

**Changes:**
- Funnel now has 8 stages (was 7): Add "B2C Portal" between "Free" and "Low-Ticket"
- Tier progression tracking includes B2C stages
- Revenue dashboard shows B2C MRR
- Funnel visualization updated

**Acceptance criteria:**
- [ ] Tier 1.5 visible in funnel visualization
- [ ] B2C users tracked through funnel stages
- [ ] Revenue dashboard includes B2C revenue
- [ ] Conversion rates calculated for B2C stages

---

### BC-24: Update Revenue Dashboard — B2C Revenue Lines
**Priority:** 🟢 Medium | **Estimate:** 1 day

**What:** Add B2C revenue metrics to the Wave 1.6 Revenue Dashboard.

**New metrics:**
- B2C MRR (subscription revenue)
- B2C credit revenue (one-time purchases)
- B2C total revenue (MRR + credits)
- B2C user count by tier
- B2C ARPU
- B2C → B2B conversion count and value

**Acceptance criteria:**
- [ ] B2C revenue displayed separately from B2B
- [ ] MRR trend chart includes B2C line
- [ ] B2C user tier distribution visible
- [ ] ARPU calculated correctly

---

### BC-25: Update R-13 Council Module — V2 Pricing + B2C Path
**Priority:** 🟢 Medium | **Estimate:** 1 day

**What:** Update the Council module (R-13) with V2 pricing and B2C upgrade integration.

**Changes:**
- Council pricing: ¥2,800 / ¥3,800 / ¥5,000 / ¥30-50K (was ¥8-15K / ¥30K / ¥50K)
- Founding tier with 20-seat cap
- B2C Pro subscribers get priority Founding access
- Council application form accessible from B2C portal

**Acceptance criteria:**
- [ ] Council pricing matches V2 model
- [ ] Founding tier capacity enforced
- [ ] B2C users can apply for Council from portal
- [ ] Pro subscribers see Founding priority badge

---

## Migration SQL Summary

> **File:** `run_this_wave1.7_migration.sql`
> **Location:** `VISTA/run_this_wave1.7_migration.sql`

| Object | Count | Details |
|--------|-------|---------|
| New tables | 10 | b2c_users, b2c_profiles, credit_ledger, credit_packs, b2c_payments, b2c_subscriptions, chat_sessions, chat_messages, assessment_results, b2c_events |
| New tables (analytics) | 3 | b2c_upgrade_candidates, b2c_cross_sell_rules, b2c_revenue_metrics |
| ALTER tables | 3 | vista_service_catalog (tier 1.5), vista_contacts (b2c_link), existing funnel tables |
| Seed: credit packs | 3 | Starter (10cr/¥99), Professional (50cr/¥399), Executive (150cr/¥799) |
| Seed: assessments | 7 | PRISM(3cr), TRIDENT(5cr), CANVAS(8cr), Market Report(10cr), Coaching(15cr), CV Audit(5cr), LinkedIn Audit(5cr) |
| Seed: cross-sell rules | 4 | Free→Credits, Credits→Member, Pro→Council, B2C→Workshop |
| Seed: B2C service catalog | 6 | Explorer, 3 packs, Member, Pro |
| Seed: B2C bundle | 1 | Career Accelerator (¥1,200) |

---

## Execution Phases

### Phase 1 (Week 1-2): Infrastructure + Chat MVP
**Tickets:** BC-01, BC-02, BC-03, BC-05, BC-06, BC-07, BC-08
**Goal:** User can register, chat with AI, hit free limit, see upgrade prompt
**Duration:** ~15 days sequential, ~6 days with 2 devs

### Phase 2 (Week 3-4): Payments + Assessments
**Tickets:** BC-09, BC-10, BC-11, BC-15, BC-16, BC-17, BC-18
**Goal:** User can buy credits, take assessments, view reports
**Duration:** ~18 days sequential, ~7 days with 2 devs

### Phase 3 (Week 5-6): Analytics + Upgrade Path + Modifications
**Tickets:** BC-04, BC-12, BC-13, BC-14, BC-19, BC-20, BC-21, BC-22, BC-23, BC-24, BC-25
**Goal:** Full analytics, B2C→B2B pipeline, existing ticket updates, soft launch ready
**Duration:** ~17 days sequential, ~6 days with 2 devs

**Total: ~40 days sequential / ~15 days with 2 devs**

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| B2C auth conflicts with B2B auth | High | Separate tables, separate auth flow, LinkedIn URL cross-reference |
| Payment integration complexity (WeChat/Alipay) | Medium | MVP: manual confirmation. Phase 2: Stripe + local |
| AI quality insufficient for paid product | High | Use DeepSeek pro model for assessments, rigorous prompt engineering |
| B2C cannibalizes B2B attention | Medium | B2C is separate portal, admin view integrated into VISTA (not separate app) |
| Credit pricing too low/high | Medium | Start conservative, A/B test after 50 users |
| Assessment report quality | High | Template-based + AI narrative. QA first 50 reports manually |

---

*Document generated: 2026-07-12 | Wave 1.7 — DEX AI B2C Career Advisory Portal | Author: James/AI for Kevin Hong*
