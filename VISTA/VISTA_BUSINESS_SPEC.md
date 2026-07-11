# VISTA — Business Specification & Investment Brief

**Version:** 1.0 | **Date:** 2026-07-11 | **Author:** James/AI for Kevin Hong
**Status:** Internal Draft — For Kevin Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Spec — What VISTA Is](#2-business-spec)
3. [Business Objectives](#3-business-objectives)
4. [Ideal Customer Profile (ICP)](#4-ideal-customer-profile)
5. [Pitch Deck for Investors](#5-pitch-deck)
6. [Internal Stakeholders](#6-internal-stakeholders)

---

## 1. Executive Summary

**VISTA** (Visual Intelligence for Strategic Talent & Advisory) is an AI-native business development platform built for the professional services industry. It transforms how advisory firms — executive search, leadership consulting, talent strategy — find, engage, convert, and retain high-value clients.

**The problem it solves:** BD in professional services is still run on spreadsheets, intuition, and scattered notes. Partners know *who* to call but lack the systems to systematically identify opportunities, time their outreach, track every touchpoint, and connect market signals to revenue actions.

**The funnel it operationalizes:**

```
500 targeted outreach → 50 conversations → 10 opportunities → 2 paid engagements
```

Every month. Every partner. Every quarter. Systematically.

**What makes VISTA different:**
- **Action-pushing, not data-display.** Every screen tells you what to do next, not what you already know.
- **Signal-to-revenue wiring.** Market events (leadership changes, M&A, restructurings) are automatically connected to specific outreach actions and service recommendations.
- **Service-aware intelligence.** The AI knows your 24 service offerings and recommends the right one for each contact's situation.
- **Built for the APAC advisory market** — culturally calibrated, multi-geography, relationship-first.

**Current state:** 39 database tables live in production. 479 feature tickets scoped across 12 execution waves. Core infrastructure deployed on Vercel + Supabase. Wave 1 (foundation) shipped. Wave 1.5 (funnel engine) database migrated.

---

## 2. Business Spec

### 2.1 What VISTA Does

VISTA is a **revenue operating system** for advisory firms. It has five core engines:

| Engine | What It Does | Business Value |
|--------|-------------|----------------|
| **Contact Intelligence** | 360° view of every relationship — profile, history, signals, scoring, service fit | Never approach a contact blind again |
| **Signal Detection** | Monitors market events (leadership changes, funding, restructuring) and maps them to revenue actions | Turn news into pipeline |
| **Funnel Engine** | Manages the 500→50→10→2 outreach sequence with cadence tracking, auto-nurture, and stage progression | Systematic BD, not random acts of outreach |
| **Service Matching** | Connects contact signals and needs to the firm's 24 service offerings with AI-generated positioning | Right offer, right person, right time |
| **Action-Pushing UX** | Daily briefings, kanban boards, streaks, nudges, and priority feeds that push partners to act | Eliminates the "I know I should call X" problem |

### 2.2 The 24-Service Catalog (Seeded)

VISTA comes pre-loaded with LYC Partners' complete service portfolio:

**Diagnostics & Assessments:**
- **LEAP** — Leadership Entry Assessment Program (behavioral wiring + career readiness)
- **QUEST** — Qualitative Evaluation for Strategic Talent (AI readiness + strategic thinking)
- **PRISM** — 360° multi-rater feedback assessment
- **SHIFT** — Full leadership transition stack (LEAP → COACH → DRIVE → IMPACT)

**Coaching & Development:**
- **COACH** — Executive coaching programs (1:1 and group)
- **DRIVE** — High-performance leadership acceleration
- **FORGE** — Leadership development workshops

**Advisory & Consulting:**
- **BRIDGE** — M&A integration and leadership transition advisory
- **MOSAIC** — DEIB (Diversity, Equity, Inclusion, Belonging) strategy
- **SPARK** — Content, events, and thought leadership programs
- **Signal Council** — Strategic advisory board / peer network

**Programs & Platforms:**
- **IMPACT** — Measurable leadership outcomes program
- **Advisory Services** — Bespoke executive search and talent strategy
- **Content & Events** — Podcasts (Leaders in Motion), webinars, roundtables, newsletters

Each service has: target audience, geographies, pricing model, signal triggers, cross-sell paths, ideal contact profile, and competitive positioning — all wired to the AI recommendation engine.

### 2.3 Core User Journeys

**Journey 1: Signal → Outreach → Meeting**
1. VISTA detects a signal: "Company X announced new CEO"
2. AI generates intelligence brief: why it matters, who's affected, what to do
3. LENS recommends: "Contact CFO Jane Doe — they'll need leadership assessment for the new CEO's team. Recommend LEAP + SHIFT package ($45K-$80K)"
4. AI drafts personalized outreach referencing the CEO transition
5. Kevin sends via LinkedIn. Touch tracked in sequence engine.
6. Jane replies → funnel advances from "outreach" to "conversation"
7. VISTA auto-generates meeting prep brief with full context

**Journey 2: Daily Rhythm**
1. Kevin opens VISTA at 9am
2. Dashboard shows: 3 follow-ups due today, 2 new signals overnight, 1 streak milestone (14-day outreach streak)
3. Priority feed: "Top action: Follow up with Marcus Chen (Day 7) — his company just raised Series B. Suggested angle: leadership scaling challenges post-funding."
4. Kevin clicks, reviews AI draft, sends. Next action auto-scheduled.

**Journey 3: Nurture → Opportunity**
1. Contact didn't respond after 4 touches → auto-routed to nurture track
2. 60 days later: they attend a VISTA-tracked webinar
3. Signal fires: "Webinar attendance detected — re-engage now"
4. AI generates: "They attended the 'AI-Ready Leadership' webinar. Suggested approach: invite for QUEST assessment to benchmark their AI readiness. Cross-sell: FORGE workshop."
5. Funnel advances from "nurture" back to "conversation"

### 2.4 Technical Architecture

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 + React 18 + Tailwind CSS | Fast, SEO-friendly, modern component model |
| Backend/API | Next.js API Routes + Supabase REST | Serverless, auto-scaling, real-time |
| Database | PostgreSQL (Supabase) | 39 tables, row-level security, full-text search |
| AI | DeepSeek API (flash + pro models) | Cost-effective, high-quality reasoning |
| Auth | Supabase Auth | Email + OAuth, role-based access |
| Deployment | Vercel (edge network) | Zero-config, auto-scaling, preview deployments |
| Integrations | MS Graph (email), LinkedIn, Notion | Full ecosystem connectivity |

### 2.5 Competitive Landscape

| Competitor | What They Do | What They Miss |
|-----------|-------------|----------------|
| Salesforce | Generic CRM, enterprise-grade | No advisory-specific workflows, no signal detection, no service matching |
| HubSpot | Marketing + sales automation | Built for product companies, not relationship-based advisory |
| Bullhorn | Recruiting ATS | Candidate-focused, not client BD. No strategic signal wiring |
| Notion/Asana | Project management | No CRM capabilities, no AI intelligence, no funnel engine |
| Custom spreadsheets | What most partners actually use | No automation, no intelligence, no accountability |

**VISTA's moat:** Purpose-built for the advisory industry's unique workflow — signal detection → strategic outreach → service matching → revenue. No generic CRM does this.

---

## 3. Business Objectives

### 3.1 Primary Objective

**Systematize and scale business development for LYC Partners to achieve predictable, recurring revenue growth.**

### 3.2 Measurable Targets

| Metric | Current State | 6-Month Target | 12-Month Target |
|--------|--------------|----------------|-----------------|
| Monthly outreach volume | ~50 (ad hoc) | 200+ (systematic) | 500+ (full funnel) |
| Outreach → conversation rate | ~10% | 15% | 20%+ |
| Conversation → opportunity rate | ~5% | 10% | 15%+ |
| Opportunity → paid engagement | ~10% | 15% | 20%+ |
| Average deal cycle (days) | 90+ | 60 | 45 |
| Cross-sell rate (multi-service) | ~5% | 15% | 25%+ |
| Partner daily actions taken | 2-3 | 5-7 | 8-10 |
| Signals acted on within 24h | ~0% | 50% | 80%+ |
| Nurture track re-engagement | ~0% | 10% | 20%+ |

### 3.3 Revenue Impact Model

```
Conservative scenario (6-month):
  200 outreach/month × 6 months = 1,200 touches
  15% conversation rate = 180 conversations
  10% opportunity rate = 18 opportunities  
  15% close rate = 2.7 paid engagements
  Average deal value: $50K
  → $135K incremental revenue attributable to VISTA

Aggressive scenario (12-month):
  500 outreach/month × 12 months = 6,000 touches
  20% conversation rate = 1,200 conversations
  15% opportunity rate = 180 opportunities
  20% close rate = 36 paid engagements
  Average deal value: $60K (with cross-sell)
  → $2.16M incremental revenue attributable to VISTA
```

### 3.4 Operational Objectives

| Objective | Success Criteria | Timeline |
|-----------|-----------------|----------|
| **Eliminate ad-hoc BD** | 100% of outreach tracked in VISTA, zero unlogged activities | Wave 3 (Week 8) |
| **Signal-to-action latency < 24h** | Every market signal generates a recommended action within 24 hours | Wave 4 (Week 12) |
| **Daily partner engagement** | Every partner opens VISTA daily, completes ≥5 actions | Wave 4 (Week 12) |
| **Full service catalog utilization** | Every service has ≥3 active cross-sell paths wired | Wave 5 (Week 16) |
| **Auto-logging** | 100% of emails, meetings, LinkedIn messages auto-recorded | Wave 9 (Week 28) |

### 3.5 Strategic Objectives

1. **Become the intelligence layer** for LYC Partners' entire client lifecycle — from first signal to ongoing advisory relationship
2. **Build institutional memory** — every relationship, every conversation, every insight stored and searchable, not trapped in individual partner heads
3. **Create a replicable BD playbook** — the system codifies what "good BD" looks like, enabling faster onboarding of new partners
4. **Establish data moat** — over time, VISTA accumulates proprietary signal-to-revenue data that no competitor can replicate
5. **Position for productization** — prove the model at LYC, then offer as SaaS to similar advisory firms (see Section 5)

---

## 4. Ideal Customer Profile

### 4.1 Primary ICP — LYC Partners (Internal Use)

**Firm Profile:**
- Executive search & leadership advisory firm
- 5-20 partners/consultants
- APAC-focused with global reach
- $2M-$20M annual revenue
- Service lines: assessment, coaching, advisory, events, content
- Relationship-driven, high-touch sales cycle

**Why VISTA fits:**
- High deal values ($30K-$200K+) justify systematic BD investment
- Long sales cycles (30-180 days) require cadence tracking
- Multiple service lines create cross-sell opportunities
- Signal-rich market (leadership changes, M&A, restructuring = buying triggers)
- Small team means every partner needs to be a rainmaker

### 4.2 Secondary ICP — Similar Advisory Firms (Productization)

If VISTA becomes a SaaS product, the target customer is:

**Firm Characteristics:**
| Dimension | Ideal Range |
|-----------|------------|
| **Industry** | Executive search, management consulting, leadership development, talent advisory, executive coaching |
| **Size** | 5-50 professionals (partners, consultants, coaches) |
| **Revenue** | $1M-$50M annually |
| **Geography** | APAC-first, or global with APAC presence |
| **Sales model** | Relationship-driven, high-touch, long cycles (30+ days) |
| **Deal size** | $10K-$500K per engagement |
| **Service lines** | 3+ distinct offerings (enables cross-sell engine) |
| **Tech maturity** | Currently using spreadsheets/basic CRM, ready for AI-native upgrade |
| **Pain point** | "We know we should be more systematic about BD but don't have the tools or discipline" |

**Buyer Persona:**
- **Title:** Managing Partner, Founder, or Head of BD
- **Age:** 38-55
- **Mindset:** "I'm a relationship builder, not a salesperson. I need technology that enhances my natural style, not replaces it."
- **Budget authority:** $500-$2,000/user/month for tools that directly drive revenue
- **Decision trigger:** "I lost a $100K deal because I forgot to follow up" or "I have no idea what my team is doing on BD"

### 4.3 Anti-ICP (Who VISTA Is NOT For)

| Not For | Why |
|---------|-----|
| Transactional sales (high volume, low value) | VISTA is designed for high-touch, strategic BD — not 1,000 cold emails/day |
| Product companies (SaaS, e-commerce) | Built for services/advisory, not product sales pipelines |
| Solo practitioners with <20 contacts | Overkill — use a simple CRM |
| Firms with no market signals to track | The signal engine is core value — if your market doesn't generate signals, you lose the key differentiator |
| Price-sensitive buyers (<$200/user/month) | Premium tool for premium firms |

### 4.4 ICP Validation Questions

Before building any sales motion, validate:
1. ✅ Does the firm sell high-value advisory services ($30K+ per engagement)?
2. ✅ Do they have 3+ service lines that could cross-sell?
3. ✅ Is their market signal-rich (leadership changes, funding, M&A)?
4. ✅ Are they currently using spreadsheets or basic CRM for BD?
5. ✅ Do they have 5+ professionals who need to do BD daily?
6. ✅ Are they willing to pay $500+/user/month for revenue-driving tools?

If 5+/6 → strong ICP fit.

---

## 5. Pitch Deck for Investors

### Slide 1: Title
**VISTA**
*The AI-Native Revenue Operating System for Advisory Firms*

Seed Round | 2026

---

### Slide 2: The Problem
**Advisory firms lose millions to unsystematic business development.**

- Executive search firms, leadership consultancies, and talent advisors rely on partner intuition for BD
- No system connects **market signals** (leadership changes, M&A, funding) to **revenue actions** (outreach, proposals, cross-sells)
- Partners know *who* to call but lack the infrastructure to call them *at the right time, with the right message, offering the right service*
- Result: 60-80% of potential revenue goes uncaptured. Follow-ups are forgotten. Cross-sells never happen.

**Market signals exist. Revenue opportunities exist. The bridge between them doesn't.**

---

### Slide 3: The Solution
**VISTA: Signal-to-Revenue Intelligence**

- Monitors market events and maps them to specific contacts, companies, and revenue actions
- AI recommends WHO to contact, WHAT to say, and WHICH service to offer — every day
- Manages the full funnel: 500 outreach → 50 conversations → 10 opportunities → 2 paid engagements (per partner, per month)
- Action-pushing UX ensures nothing falls through the cracks

**One platform. From signal detection to signed engagement.**

---

### Slide 4: Product Demo (Key Screens)

| Screen | What It Shows |
|--------|--------------|
| **Daily Briefing** | 3 follow-ups due, 2 new signals, priority action for today |
| **Signal Intelligence** | "Company X announced new CEO" → affected contacts → recommended actions → draft outreach |
| **Funnel Kanban** | Every contact in their stage (outreach → conversation → opportunity → paid), with next actions |
| **Service Match** | AI recommends LEAP assessment + SHIFT coaching package for this contact's situation ($45K-$80K) |
| **Contact Brief** | One-page AI-generated intel: who they are, company situation, how to approach, what to avoid |

---

### Slide 5: Market Size

| Segment | Size | Source |
|---------|------|--------|
| **TAM** — Global management consulting market | $350B+ | IBISWorld 2026 |
| **SAM** — Executive search + leadership advisory (APAC) | $12B | Industry reports |
| **SOM** — APAC advisory firms with 5-50 professionals, tech-ready | $800M service revenue | Bottom-up estimate |

**Conservative SaaS opportunity:**
- 500 firms × $15K ARR average = **$7.5M ARR** within 5 years
- At 70% gross margin = $5.25M gross profit
- At 8x revenue multiple = **$60M valuation potential**

---

### Slide 6: Business Model

**Phase 1: Internal Tool (Current)**
- VISTA built and used by LYC Partners
- Proves the model, generates revenue, refines the product
- Zero customer acquisition cost — eating our own dog food

**Phase 2: Managed Access (Month 12-18)**
- Offer VISTA to 3-5 partner firms (friends of LYC)
- White-glove onboarding, high-touch support
- $1,000-$2,000/user/month
- Target: 5 firms × 10 users × $1,500 = $75K MRR

**Phase 3: SaaS Launch (Month 18-24)**
- Self-serve + sales-assisted
- Tiered pricing:
  - **Essentials**: $500/user/month (contact mgmt + basic signals)
  - **Professional**: $1,200/user/month (full funnel + AI recommendations + service matching)
  - **Enterprise**: $2,500/user/month (unlimited signals + custom integrations + dedicated AI training)
- Target: 50 firms × 15 users × $1,200 avg = $900K MRR

---

### Slide 7: Traction & Validation

| Milestone | Status |
|-----------|--------|
| Product built and deployed | ✅ Live at vista-azure-delta.vercel.app |
| Database infrastructure | ✅ 39 tables, 222+ API endpoints |
| Service catalog seeded | ✅ 24 LYC services mapped with signal triggers |
| Funnel engine (DB) | ✅ Migrated, triggers active |
| First revenue impact | 🔜 Q3 2026 (first full quarter of VISTA-driven BD) |
| Design system + Wave 1 shipped | ✅ Dashboard, Contacts, Signals, Pipeline, Campaigns live |

**Built with < $500 in infrastructure costs (Supabase + Vercel free tiers + DeepSeek API).**

---

### Slide 8: Competitive Advantage

| Factor | VISTA | Salesforce | HubSpot | Bullhorn |
|--------|-------|-----------|---------|----------|
| Signal-to-revenue wiring | ✅ Native | ❌ None | ❌ None | ❌ None |
| Service catalog matching | ✅ 24 services pre-wired | ❌ Manual | ❌ Manual | ❌ None |
| Action-pushing UX | ✅ Daily briefings, nudges, kanban | ❌ Dashboard-only | ⚠️ Basic | ❌ None |
| APAC cultural calibration | ✅ Built-in | ❌ Western-first | ❌ Western-first | ❌ None |
| AI-native (not bolted-on) | ✅ Every screen | ⚠️ Einstein (add-on) | ⚠️ Breeze (add-on) | ❌ None |
| Advisory-specific workflows | ✅ Purpose-built | ❌ Generic | ❌ Product-focused | ⚠️ Recruiting-only |

**Moat:** 12 months of signal-to-revenue data, APAC service catalog, and advisory workflow patterns that no generic CRM can replicate.

---

### Slide 9: Go-to-Market Strategy

**Phase 1 — Prove It (Q3-Q4 2026)**
- Use VISTA internally at LYC Partners
- Document revenue impact: "VISTA drove $X in new business in Y months"
- Case study: before/after metrics

**Phase 2 — Warm Network (Q1 2027)**
- Offer to 5 peer firms in LYC's network
- Partner-led introductions (highest trust channel in advisory)
- Revenue share: 20% of incremental revenue for first 6 months

**Phase 3 — Thought Leadership (Q2-Q3 2027)**
- Publish "State of BD in APAC Advisory" report (powered by VISTA data)
- Podcast/webinar series: "Signal-Driven BD"
- Conference presence (SHRIEM, APAC HR Tech)

**Phase 4 — Scale (Q4 2027+)**
- Inside sales team (2-3 reps targeting APAC advisory firms)
- Self-serve trial → paid conversion
- Strategic partnerships (LinkedIn, MS Dynamics ecosystem)

---

### Slide 10: Team

| Role | Person | Background |
|------|--------|-----------|
| **CEO/Founder** | Kevin Hong | Managing Partner, LYC Partners. 15+ years in executive search & leadership advisory across APAC. Built and scaled advisory practice. Deep domain expertise. |
| **CTO/Product** | Kevin Hong | AI-native platform builder. Orchestrates multi-agent AI systems. Technical enough to spec, review, and ship production code with AI engineering agents. |
| **AI Engineering** | Agent Fleet (NEXUS) | AI-powered development team: PM agent, engineering agents, QA agents. Ships at 10x traditional speed. Cost: ~¥60/day vs. $500+/day for human engineers. |

**Advisory board:** [To be filled — 2-3 industry leaders for credibility]

---

### Slide 11: Financial Projections

| | Year 1 | Year 2 | Year 3 |
|--|--------|--------|--------|
| **Internal Revenue Impact** | $500K | $2M+ | $3M+ |
| **SaaS ARR** | — | $300K | $2.5M |
| **Total Revenue** | $500K (internal) | $2.3M | $5.5M |
| **Gross Margin** | 85% | 75% | 78% |
| **Headcount** | 3 (Kevin + 2 agents) | 8 | 15 |
| **Burn Rate** | $15K/mo | $80K/mo | $200K/mo |

---

### Slide 12: The Ask

**Raising: $500K Seed Round**

**Use of funds:**
| Category | Amount | % |
|----------|--------|---|
| Product Development (6 months) | $200K | 40% |
| Go-to-Market | $100K | 20% |
| Operations & Infrastructure | $50K | 10% |
| Working Capital (12-month runway) | $150K | 30% |

**Milestones to Series A:**
- 50 paying SaaS customers
- $300K+ ARR
- 3 documented case studies showing 2x+ BD productivity improvement
- Full APAC signal coverage (5 markets minimum)

---

## 6. Internal Stakeholders

### 6.1 Stakeholder Map

| Stakeholder | Role | What They Need from VISTA | Communication Cadence |
|-------------|------|--------------------------|---------------------|
| **Kevin Hong** | Managing Partner / Product Owner | Full platform ownership. Strategic direction. Daily user. | Real-time (builds it) |
| **Claire Jin** | Operations / Client Relations | Contact management, meeting tracking, client communication history | Weekly updates |
| **Partners/Consultants** | End Users (BD execution) | Daily briefings, action lists, contact briefs, service recommendations | Training at launch, then daily use |
| **BD Coordinator** (if exists) | Data entry, campaign management | Bulk operations, template management, campaign tracking | Daily use |
| **NEXUS (AI Agent Fleet)** | Technical infrastructure | Build, deploy, maintain, iterate. James/AI (PM), Marcus/AI (Eng Lead) | Continuous |

### 6.2 Internal Communication Plan

| Audience | Message | Channel | Frequency |
|----------|---------|---------|-----------|
| **Kevin** | Build progress, blockers, decisions needed | Feishu group (direct) | Daily |
| **Claire** | New features, data quality requests, process changes | Feishu DM + in-person | Weekly |
| **All Partners** | Platform launch, training schedule, expected workflows | Team meeting + documentation | At launch milestones |
| **External (investors)** | Traction metrics, revenue impact, product roadmap | Quarterly deck update | Quarterly |

### 6.3 Roles & Permissions (Planned)

| Role | Access Level | Key Capabilities |
|------|-------------|-----------------|
| **Admin** (Kevin) | Full access | All data, all settings, user management, service catalog management |
| **Partner** | Own contacts + shared clusters | Full BD workflow, AI recommendations, outreach sequences |
| **Consultant** | Assigned contacts only | View contact details, log activities, view assigned tasks |
| **BD Coordinator** | All contacts (edit) | Bulk operations, campaign management, data quality |
| **Viewer** (Board/Advisors) | Read-only, shared reports | View pipeline summaries, signal reports, performance dashboards |

### 6.4 Internal Success Metrics

| Metric | Owner | Target |
|--------|-------|--------|
| Daily active users (DAU) | Kevin | 100% of partners within 30 days of launch |
| Outreach actions logged | All users | ≥5 per user per day |
| Signal response time | All users | <24 hours for high-priority signals |
| Data completeness | Claire | 90%+ of contacts have: company, role, LinkedIn, warmth score |
| Cross-sell utilization | Kevin | ≥3 cross-sell paths activated per service line within 60 days |

### 6.5 Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Low partner adoption | Medium | High | Gamification, daily nudges, Kevin leads by example, make it 1-click |
| Data quality issues | High | Medium | Import validation, required fields, weekly data quality reports |
| AI recommendation accuracy | Medium | Medium | Start with human-in-the-loop, iterate on feedback, store corrections |
| Scope creep (too many features) | High | Medium | Wave-based execution, ship smallest useful slice first |
| Single point of failure (Kevin) | High | High | Document everything in VISTA, train Claire as backup admin |
| Infrastructure costs at scale | Low | Low | DeepSeek API is cost-effective, Supabase has generous free tier |

---

## Appendix A: VISTA Name Origin

**VISTA** = **V**isual **I**ntelligence for **S**trategic **T**alent & **A**dvisory

Also: a "vista" is a sweeping view of distant scenery — fitting for a platform that gives partners a panoramic view of their entire business development landscape.

## Appendix B: Key Documents

| Document | Location |
|----------|----------|
| Master Plan & 479 Tickets | `VISTA/VISTA_MASTER_PLAN.md` |
| Wave 1.5 Funnel Spec | `VISTA/spec_wave1.5_funnel_core.md` |
| V2 Service Catalog Gap | `VISTA/VISTA_V5_BACKEND_WIRING_GAP.md` |
| V4 Action-Pushing Platform | `VISTA/VISTA_V4_ACTION_PUSHING_PLATFORM.md` |
| Frontend Architecture | `VISTA/VISTA_MASTER_FRONTEND_SPEC.md` |
| Intelligence Layer | `VISTA/INTELLIGENCE_LAYER_SPEC.md` |
| Production URL | https://vista-azure-delta.vercel.app |

## Appendix C: 12-Wave Execution Roadmap

| Wave | Theme | Duration | Status |
|------|-------|----------|--------|
| 1 | Foundation (Design, Contacts, Dashboard) | 27d | ✅ DONE |
| 1.5 | Funnel Core (DB + Schema) | 8d | ✅ DB Migrated |
| 2 | Context & Connectivity (CV, search, integrations) | 17d | 🔜 Next |
| 3 | Qualitative Intelligence + Kanban-First | 20d | Planned |
| 4 | Action-Pushing + Gamification | 18d | Planned |
| 5 | New Portals — Companies, Mandates, Meetings | 18d | Planned |
| 6 | Contact Depth & CV | 13d | Planned |
| 7 | Funnel Management + Editable Everything | 16d | Planned |
| 8 | Products, Assessment, Communications | 15d | Planned |
| 9 | Auto-Logging + Shareable Outputs | 14d | Planned |
| 10 | Three-Platform Integration | 16d | Planned |
| 11 | AI Intelligence Layer | 14d | Planned |
| 12 | Design Craft & Polish | 15d | Planned |
| | **Total** | **~184 days** (sequential) / **~60 days** (3 devs parallel) | |

---

*Document generated 2026-07-11. For questions or updates, contact Kevin Hong.*
