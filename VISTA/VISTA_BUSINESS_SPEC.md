# VISTA — Internal Platform Business Case & Operating Brief

**Version:** 3.0 | **Date:** 2026-07-12 | **Author:** James/AI for Kevin Hong
**Status:** Internal Draft — For Kevin Review
**Classification:** LYC Partners Internal — Confidential
**Updated:** Incorporated Pricing Strategy & Market Penetration Playbook

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Specification](#2-platform-specification)
3. [Pricing Architecture — 7-Tier Revenue Model](#3-pricing-architecture)
4. [Business Objectives — Operational ROI](#4-business-objectives)
5. [Internal User Profiles](#5-internal-user-profiles)
6. [Internal Brief — Partner Budget Approval](#6-internal-brief)
7. [Stakeholder Map & Adoption Plan](#7-stakeholder-map)

---

## 1. Executive Summary

**VISTA** (Visual Intelligence for Strategic Talent & Advisory) is LYC Partners' **internal AI-native revenue operating system**. It is not a product for sale — it is proprietary infrastructure that systematizes LYC's entire revenue engine: from content-driven acquisition through 7 pricing tiers to recurring revenue.

**The problem it solves internally:**
LYC consultants currently manage BD through fragmented tools — spreadsheets, personal LinkedIn networks, email threads, and scattered notes. There is no unified system to:
- Track all relationships across the firm's network
- Connect market signals to specific revenue actions
- Recommend the right service offering for each contact's situation
- Enforce the tiered conversion path (Free → Workshop → Diagnostic → Advisory → Retainer)
- Measure and improve the firm's revenue velocity across 7 pricing tiers
- Apply pricing discipline (bundles, discounts, never-discount rules)

**What VISTA does for LYC:**

| Capability | Before VISTA | With VISTA |
|-----------|-------------|------------|
| Contact intelligence | Each consultant maintains personal CRM | Firm-wide 360° contact views |
| Signal detection | Manual news monitoring | Auto-detected signals mapped to actions |
| Service matching | Consultant remembers all 40+ services | AI recommends right service per contact |
| Revenue path | Ad-hoc, inconsistent | Systematic 7-tier conversion funnel |
| Pricing discipline | No rules, ad-hoc discounting | Enforced bundles, discount caps, never-discount rules |
| Daily priorities | "I know I should call X" | Kanban board pushes next actions |
| Content attribution | Unknown which content drives revenue | Full attribution: content → lead → deal |
| Cross-sell | Manual memory | 10 explicit "if bought X → recommend Y" paths |
| Performance tracking | None | Revenue by tier, conversion rates, deal velocity |

**Current state:**
- 39 database tables live in production (Supabase)
- 499 feature tickets scoped across 13 waves (including new Wave 1.6)
- Core infrastructure deployed on Vercel + Supabase
- Wave 1 (foundation) shipped and live
- Wave 1.5 (funnel engine) database migrated
- **Wave 1.6 (Revenue OS) spec + migration SQL ready**

---

## 2. Platform Specification

### 2.1 Five Core Engines

| Engine | What It Does for LYC |
|--------|---------------------|
| **Contact Intelligence** | 360° view of every relationship — profile, interaction history, market signals, engagement scoring, service fit, revenue potential score |
| **Signal Detection** | Monitors leadership changes, M&A activity, funding rounds, restructurings and automatically maps them to which LYC service is relevant |
| **Tiered Funnel Engine** | Manages the 7-tier conversion path (Free→Engagement→Validation→Investment→Transformation→Membership→Advocacy) with cadence tracking, auto-nurture, and tier progression |
| **Service Matching + Cross-Sell** | AI connects contact signals and needs to LYC's 40+ service offerings + 10 explicit cross-sell rules — recommends the right pitch for each contact |
| **Action-Pushing UX** | Daily briefings, kanban boards, streaks, nudges, priority feeds — pushes every consultant to act on their highest-value next step |

### 2.2 The Complete Service Portfolio (40+ offerings across 7 tiers)

**Tier 1 — FREE (Acquisition Layer):**
LinkedIn Content (3x/week), Newsletter (weekly), Podcast (weekly), Webinar (monthly), Diagnostic Teaser (15 min)

**Tier 2 — LOW-TICKET (Validation Layer):**
Workshop (2-3hr, ¥2-5K), Workshop (half-day, ¥5-8K), Insights Report (¥1.5-3K), Talent Market Map (¥3-8K), The Council (¥8-15K/yr), DEX AI Starter (¥500-2K)

**Tier 3 — MID-TICKET (Revenue Layer):**
Diagnostic (¥8-25K), Coaching 6-session (¥18-36K), Coaching 12-session (¥30-60K), Training (¥15-30K), Syndicate Intelligence (¥30-60K/yr), DEX AI Pro (¥5-15K/mo), Mapping Project (¥15-40K)

**Tier 4 — HIGH-TICKET (Proof Layer):**
Advisory single (¥40-80K), Advisory multi (¥80-150K), BRIDGE full (¥60-120K), SPARK full (¥80-150K), Retainer (¥15-30K/mo), PE Portfolio (¥80-150K/yr), DEX AI Enterprise (¥15-30K/mo)

**Tier 5 — SEARCH (Cash Engine):**
Retained Search (¥75-200K/role), Contingent (¥50-150K/role), Search+Diagnostic Bundle (¥90-215K), Mapping-to-Search (¥15-40K)

**Tier 6 — THE COUNCIL (Recurring):**
Individual (¥12K/yr, 60 max), Corporate (¥30K/yr, 10 max), PE Partner (¥50K/yr, 5 max)

**Tier 7 — PLATFORM (DEX AI):**
Starter (¥500/10 credits), Pro (¥5K/mo), Enterprise (¥15-30K/mo), Credit Top-Up (¥50/credit), METRIX Assessment (¥200-500), Team Diagnostic (¥3-8K)

### 2.3 The Tiered Conversion Path

```
Contact enters → Content/Webinar (T1) → Workshop (T2) → Diagnostic (T3) → Advisory (T4) → Retainer (T4)
                                                                    ↓                          ↓
                                                              Search (T5)              Platform (T7)
                                                                    ↓                          ↓
                                                              Council (T6) ←─────────────── Council (T6)
```

### 2.4 Cross-Sell Rules (Explicit Paths)

| If they bought | Recommend | Pitch |
|---------------|-----------|-------|
| Executive Search | Diagnostic | "We found your VP. Here's their leadership profile. Want to see team fit?" |
| Diagnostic (PRISM) | Coaching | "Your assessment shows X. Here's a 6-month coaching arc." |
| Diagnostic (BRIDGE) | Workshop | "Your HQ-China gap is clear. Bring your team to our workshop." |
| Diagnostic (SPARK) | Advisory | "Your AI readiness is 35/100. Here's a transformation roadmap." |
| Workshop | Diagnostic | "You saw the framework. Here's what it looks like for YOUR team." |
| Coaching | Retainer | "Coaching is going well. Want ongoing advisory access?" |
| Mapping Project | Search | "We mapped the market. Top 5 candidates. Want us to approach them?" |
| The Council | Workshop | "As a Council member, priority seating + 20% off." |
| DEX AI Starter | Pro | "You've used 8/10 credits. Here's what unlimited looks like." |
| Retainer | Search | "Your retainer includes talent reviews. Hard-to-fill roles?" |

### 2.5 Bundle Architecture

| Bundle | Components | Individual | Bundle | Savings |
|--------|-----------|-----------|--------|---------|
| Search + Diagnose | Search + Diagnostic | ¥100-220K | ¥110-200K | 8-10% |
| Diagnose + Develop | Diagnostic + 6mo Coaching | ¥26-61K | ¥21-49K | 20% |
| Diagnose + Transform | Diagnostic + Advisory | ¥48-105K | ¥39-84K | 19% |
| Full Program (ASCENT) | Diag + Coach + Workshop + Retainer | ¥51-121K | ¥41-97K | 20% |
| PE Portfolio | Annual review + 2 searches + Retainer | ¥260-490K | ¥228-402K | 18% |
| Council + Workshop | Membership + 2 workshop seats | ¥14-17K | ¥11.5-14K | 18% |

### 2.6 Pricing Discipline

**NEVER discount:**
- Executive search (signals desperation)
- Platform subscriptions (discounting before launch = death)
- Retainers after first 3 clients

**Discount rules:**
- First 3 diagnostics: up to 50% off → "Founding client rate"
- Annual retainer (12-month): up to 20% → "Annual partnership rate"
- Council founding members: up to 20% → "Founding member rate"
- Workshop early-bird (2+ weeks): up to 15% → "Early-bird pricing"

---

## 3. Pricing Architecture

### 3.1 The 4-Phase Revenue Ramp

| Phase | Timeline | Primary Wedge | Revenue Target |
|-------|----------|---------------|---------------|
| **Phase 1: WEDGE** | Month 1-2 | Executive Search + Free Diagnostic Teaser | ¥75-200K |
| **Phase 2: PROVE** | Month 2-4 | Paid Diagnostic + First Workshop | ¥40-80K |
| **Phase 3: SCALE** | Month 4-6 | Advisory Retainer + Platform Trial + Council Launch | ¥60-120K/mo |
| **Phase 4: PREMIUM** | Month 6-12 | Full pricing architecture active | ¥150-300K/mo |

### 3.2 Revenue Path by Quarter

| Quarter | Revenue Sources | Target |
|---------|---------------|--------|
| Q1 (Month 1-3) | Search placements + bundled diagnostics | ¥100-250K |
| Q2 (Month 4-6) | Retainers + workshops + Council + DEX trials | ¥180-360K |
| Q3 (Month 7-9) | Full pricing active + PE portfolio deals | ¥450-900K |
| Q4 (Month 10-12) | Recurring revenue dominant (retainers + subscriptions + Council) | ¥450-900K |
| **Year 1 Total** | | **¥1.2M-2.4M** |

### 3.3 90-Day Validation Milestones

| Week | Action | Revenue | Proof Generated |
|------|--------|---------|----------------|
| 1-2 | 20 outreach, 5 conversations | 0 | Pipeline data |
| 3-4 | 1 search mandate confirmed | ¥30-50K | Search case study |
| 5-6 | 1 diagnostic delivered (bundled) | 0 (bundled) | Diagnostic proof |
| 7-8 | First workshop delivered | 0-3K | Workshop recording |
| 9-10 | First paid diagnostic | ¥8-15K | Diagnostic case study |
| 11-12 | Advisory proposal sent | 0 (pipeline) | Advisory proof |
| 13 | First advisory close or second search | ¥20-50K | Full proof stack |

---

## 4. Business Objectives

### 4.1 Operational ROI Model

**Primary Metrics:**

| Metric | Current Baseline | 6-Month Target | 12-Month Target |
|--------|-----------------|----------------|-----------------|
| Monthly outreach volume per consultant | ~30 | 80 | 120 |
| Signal-to-outreach response time | 2-5 days | <4 hours | <1 hour |
| Cross-sell rate (contacts with 2+ services) | ~10% | 25% | 40% |
| Tier progression rate (contacts advancing) | ~5% | 20% | 35% |
| Bundle adoption rate | 0% | 30% | 50% |
| Average deal cycle | 90-120 days | 60-75 days | 45-60 days |

**Revenue Impact:**

| Scenario | Monthly Revenue | Annual Revenue |
|----------|----------------|----------------|
| Conservative (current) | ¥250K | ¥3.0M |
| With VISTA (6-month) | ¥660K | ¥7.9M |
| With VISTA (12-month) | ¥1.32M | ¥15.8M |

**ROI:** Development investment ~$120K-$180K (¥870K-1.3M) → ¥5M-24M incremental annual revenue.

### 4.2 Efficiency Gains

| Time Saved | Estimate |
|-----------|----------|
| Annual per consultant | ~300 hours |
| Annual firm-wide (10 consultants) | ~3,000 hours |
| Equivalent FTEs recovered | ~1.5 full-time consultants |

### 4.3 Strategic Objectives

1. **Institutionalize BD** — Move from "star performer" dependence to firm-wide systematic capability
2. **Pricing discipline** — Enforce bundles, discount rules, never-discount policies
3. **Knowledge retention** — All relationship intelligence lives in the platform
4. **Scalability** — New consultants ramp faster with guided workflows
5. **Competitive moat** — Proprietary technology competitors cannot replicate
6. **Revenue predictability** — Recurring revenue from retainers, subscriptions, Council membership

---

## 5. Internal User Profiles

### 5.1 Primary Users

| Role | Users | Primary Use | Key Features |
|------|-------|-------------|-------------|
| **Partners** | 3-5 | Pipeline oversight, strategic relationships | Portfolio view, revenue dashboards, team kanban |
| **Senior Consultants** | 5-8 | Active deal management, outreach | Contact intelligence, service matching, funnel |
| **Consultants** | 5-10 | Research, outreach prep | Contact search, briefing generator, tasks |

### 5.2 Secondary Users

| Role | Users | Primary Use |
|------|-------|-------------|
| **Operations** | 2-3 | Campaign management, reporting, data |
| **Leadership** | 2-3 | Strategic oversight, performance review |

---

## 6. Internal Brief — Partner Budget Approval

### Slide Deck Structure (13 slides)

1. **Cover** — VISTA: Internal Platform Brief
2. **The Problem** — Fragmented BD, manual processes, knowledge loss
3. **The Solution** — Proprietary AI-native revenue operating system
4. **Five Core Engines** — Contact Intel, Signal Detection, Tiered Funnel, Service Matching, Action-Pushing
5. **The 7-Tier Revenue Model** — Free → Low → Mid → High → Search → Council → Platform
6. **ROI Projection** — Revenue lift (¥3M → ¥15.8M), 3,000 hrs saved, 30x-130x ROI
7. **Current State** — 39 tables, Wave 1 shipped, 499 tickets scoped, Wave 1.6 ready
8. **Execution Roadmap** — 13 Waves, ~75 days with team
9. **What We Need** — Budget ($120-180K) + participation + data + mandate
10. **Risk & Mitigation** — 4 risks with mitigations
11. **User Profiles & Adoption** — Partners, Consultants, Ops + 4-phase timeline
12. **Success Metrics** — 6 KPIs (adoption, outreach, tier progression, pipeline, velocity, NPS)
13. **Closing** — "Let's Build Our Competitive Moat"

---

## 7. Stakeholder Map & Adoption Plan

### 7.1 Adoption Timeline (Aligned with Pricing Playbook Phases)

| Phase | Timeline | Activities | VISTA Milestone |
|-------|----------|-----------|----------------|
| **Alpha** | Wave 1-3 (Month 1-2) | Kevin + James/AI | Wave 1.6 Revenue OS built |
| **Beta** | Wave 4-6 (Month 3-4) | 3-5 senior consultants | Cross-sell + content attribution live |
| **Pilot** | Wave 7-9 (Month 4-5) | Full team, data migration | Council module + DEX tracking live |
| **Launch** | Wave 10-12 (Month 6) | Firm-wide adoption | Full platform operational |
| **Optimize** | Post-launch | Continuous improvement | Revenue analytics + AI optimization |

### 7.2 Success Metrics

| Metric | How Measured | Target |
|--------|-------------|--------|
| Adoption rate | DAU / total users | >80% by Month 6 |
| Outreach volume | Emails/messages per consultant | 80+/month |
| Tier progression | Contacts advancing tiers | >20% per quarter |
| Bundle adoption | % deals using bundles | >30% by Month 6 |
| Revenue per consultant | Monthly revenue / consultant | 3x current |
| User satisfaction | NPS survey | >40 NPS |

---

## Appendix: Technical Architecture

- **Frontend:** Next.js 15, deployed on Vercel
- **Database:** PostgreSQL on Supabase (39+ tables, Wave 1.6 adds ~15 more)
- **AI:** DeepSeek API (flash + pro models)
- **Auth:** Supabase Auth
- **Production URL:** https://vista-azure-delta.vercel.app

---

*Document generated: 2026-07-12 | V3 with Pricing Architecture | Author: James/AI for Kevin Hong*
*Previous versions: V2 (internal framing), V1 (SaaS framing — deprecated)*
