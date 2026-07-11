# VISTA — Internal Platform Business Case & Operating Brief

**Version:** 2.0 | **Date:** 2026-07-11 | **Author:** James/AI for Kevin Hong
**Status:** Internal Draft — For Kevin Review
**Classification:** LYC Partners Internal — Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Specification](#2-platform-specification)
3. [Business Objectives — Operational ROI](#3-business-objectives)
4. [Internal User Profiles](#4-internal-user-profiles)
5. [Internal Brief — Partner Budget Approval](#5-internal-brief)
6. [Stakeholder Map & Adoption Plan](#6-stakeholder-map)

---

## 1. Executive Summary

**VISTA** (Visual Intelligence for Strategic Talent & Advisory) is LYC Partners' **internal AI-native business development platform**. It is not a product for sale — it is proprietary infrastructure that makes LYC's advisory and executive search practice systematically more effective.

**The problem it solves internally:**
LYC consultants currently manage BD through fragmented tools — spreadsheets, personal LinkedIn networks, email threads, WhatsApp messages, and scattered notes. There is no unified system to:
- Track all relationships across the firm's network
- Connect market signals to specific revenue actions
- Recommend the right service offering for each contact's situation
- Enforce a consistent outreach cadence across all consultants
- Measure and improve the firm's BD漏斗 (500→50→10→2)

**What VISTA does for LYC:**

| Capability | Before VISTA | With VISTA |
|-----------|-------------|------------|
| Contact intelligence | Each consultant maintains personal CRM | Firm-wide 360° contact views |
| Signal detection | Manual news monitoring | Auto-detected signals mapped to actions |
| Service matching | Consultant remembers all 24 services | AI recommends right service per contact |
| Outreach cadence | Ad-hoc, inconsistent | Systematic 500→50→10→2 funnel |
| Daily priorities | "I know I should call X" | Kanban board pushes next actions |
| Cross-team visibility | Silos between consultants | Shared pipeline, collaboration-ready |
| Performance tracking | None | Streaks, goals, deal velocity metrics |

**Current state:**
- 39 database tables live in production (Supabase)
- 479 feature tickets scoped across 12 execution waves
- Core infrastructure deployed on Vercel + Supabase
- Wave 1 (foundation) shipped and live
- Wave 1.5 (funnel engine) database migrated

---

## 2. Platform Specification

### 2.1 Five Core Engines

| Engine | What It Does for LYC |
|--------|---------------------|
| **Contact Intelligence** | 360° view of every relationship — profile, interaction history, market signals, engagement scoring, service fit — all in one place |
| **Signal Detection** | Monitors leadership changes, M&A activity, funding rounds, restructurings and automatically maps them to which LYC service is relevant |
| **Funnel Engine** | Manages the 500→50→10→2 outreach-to-engagement sequence with cadence tracking, auto-nurture, and stage progression |
| **Service Matching** | AI connects contact signals and needs to LYC's 24 service offerings — recommends the right pitch for each contact |
| **Action-Pushing UX** | Daily briefings, kanban boards, streaks, nudges, priority feeds — pushes every consultant to act on their highest-value next step |

### 2.2 The 24-Service Catalog

VISTA comes pre-loaded with LYC Partners' complete service portfolio:

**Diagnostics & Assessments:**
- LEAP — Leadership Entry Assessment Program
- QUEST — Qualitative Evaluation for Strategic Talent
- PRISM — 360° multi-rater feedback assessment
- SHIFT — Full leadership transition stack (LEAP → COACH → DRIVE → IMPACT)

**Coaching & Development:**
- COACH — Executive coaching programs (1:1 and group)
- DRIVE — High-performance leadership acceleration
- FORGE — Leadership development workshops

**Advisory & Consulting:**
- BRIDGE — M&A integration and leadership transition advisory
- MOSAIC — DEIB strategy consulting
- SPARK — Content, events, and thought leadership programs
- Signal Council — Strategic advisory board / peer network

**Programs & Platforms:**
- IMPACT — Measurable leadership outcomes program
- Advisory Services — Bespoke executive search and talent strategy

**Productized Offerings:**
- NEXUS — AI-powered BD platform (VISTA itself — proprietary tool)
- COACH Digital — Digital coaching platform
- DRIVE Digital — Digital leadership acceleration

### 2.3 Core User Journeys

**Journey 1: Signal → Service → Engagement**
1. VISTA detects: "CFO of Company X just resigned"
2. AI maps signal to services: "BRIDGE (transition advisory) + LEAP (assessment for replacement)"
3. VISTA surfaces affected contacts at Company X
4. Consultant gets one-click outreach template
5. Email sent → logged automatically → opportunity created

**Journey 2: Daily Briefing → Kanban → Action**
1. Consultant opens VISTA → sees today's priorities
2. Kanban board shows all active relationships by stage
3. System recommends: "3 contacts overdue for follow-up"
4. Consultant acts → system logs → streak counter increments

**Journey 3: Contact Deep-Dive → Cross-Sell**
1. Consultant opens contact profile
2. Sees: engagement history, signals, current service engagements
3. AI recommends: "This contact showed interest in AI readiness — suggest QUEST assessment"
4. Consultant triggers outreach → pipeline grows

---

## 3. Business Objectives

### 3.1 Operational ROI Model

VISTA's value is measured in **deal velocity and consultant productivity**, not in software revenue.

**Primary Metrics:**

| Metric | Current Baseline | 6-Month Target | 12-Month Target |
|--------|-----------------|----------------|-----------------|
| Monthly outreach volume per consultant | ~30 (ad-hoc) | 80 (systematic) | 120 (automated cadence) |
| Signal-to-outreach response time | 2-5 days (manual) | <4 hours (auto-alert) | <1 hour (real-time) |
| Cross-sell rate (contacts with 2+ services) | ~10% | 25% | 40% |
| Outreach-to-conversation conversion | ~10% | 18% | 25% |
| Conversation-to-opportunity conversion | ~20% | 30% | 35% |
| Opportunity-to-engagement close rate | ~25% | 35% | 40% |
| Average deal cycle (days) | 90-120 | 60-75 | 45-60 |

**Revenue Impact Model:**

Assuming 10 active consultants:

| Scenario | Monthly Engagements | Avg Deal Value | Monthly Revenue | Annual Revenue |
|----------|--------------------|----------------|-----------------|----------------|
| Conservative (current) | 5 | $50K | $250K | $3.0M |
| With VISTA (6-month) | 12 | $55K | $660K | $7.9M |
| With VISTA (12-month) | 22 | $60K | $1.32M | $15.8M |
| Upside (12-month) | 35 | $65K | $2.28M | $27.3M |

**The delta: VISTA drives an estimated $5M-$24M in incremental annual revenue** through systematic outreach, faster cycles, and higher conversion — on a development investment of ~$120K-$180K.

### 3.2 Efficiency Gains

| Time Saved | Estimate |
|-----------|----------|
| Daily: No more manual contact research | 30 min/consultant/day |
| Weekly: Auto-generated briefings replace manual prep | 2 hrs/consultant/week |
| Monthly: Automated cadence replaces manual tracking | 4 hrs/consultant/month |
| Quarterly: Signal detection replaces news monitoring | 8 hrs/consultant/quarter |
| **Annual per consultant** | **~300 hours** |
| **Annual firm-wide (10 consultants)** | **~3,000 hours** |
| **Equivalent FTEs recovered** | **~1.5 full-time consultants** |

### 3.3 Strategic Objectives

1. **Institutionalize BD** — Move from "star performer" dependence to firm-wide systematic capability
2. **Knowledge retention** — All relationship intelligence lives in the platform, not in individual consultants' heads
3. **Scalability** — New consultants ramp faster with VISTA's guided workflows and AI assistance
4. **Competitive moat** — Proprietary technology that external competitors cannot replicate
5. **Client outcomes** — Faster, more targeted service delivery through better pre-engagement intelligence

---

## 4. Internal User Profiles

### 4.1 Primary Users

**Partners (3-5 users)**
- Primary use: Pipeline oversight, strategic relationship management, team performance
- Key features: Portfolio view, team kanban, revenue dashboards, signal alerts
- Success metric: Revenue per partner, deal velocity

**Senior Consultants (5-8 users)**
- Primary use: Active deal management, outreach execution, client relationship depth
- Key features: Contact intelligence, signal detection, service matching, funnel management
- Success metric: Outreach volume, conversion rates, cross-sell rate

**Consultants & Analysts (5-10 users)**
- Primary use: Research, outreach preparation, relationship building
- Key features: Contact search, LinkedIn integration, briefing generator, task management
- Success metric: New relationships established, signals actioned

### 4.2 Secondary Users

**Operations / Coordinators (2-3 users)**
- Primary use: Campaign management, reporting, data maintenance
- Key features: Bulk operations, report generation, data import/export

**Leadership / Management (2-3 users)**
- Primary use: Strategic oversight, resource allocation, performance review
- Key features: Dashboards, trend analysis, team comparison

### 4.3 Permission Model

| Role | Access Level |
|------|-------------|
| **Admin** | Full platform access, user management, configuration |
| **Partner** | All contacts, all pipelines, team dashboards, revenue data |
| **Senior Consultant** | Own contacts + shared contacts, own pipeline, collaboration |
| **Consultant** | Own contacts, own pipeline, limited cross-team visibility |
| **Viewer** | Read-only dashboards, no editing |

---

## 5. Internal Brief — Partner Budget Approval

### Slide Deck Structure

**Slide 1: The Problem**
> "Our BD runs on spreadsheets and individual effort. Every consultant manages relationships differently. We lose intelligence when people leave. We miss signals daily."

**Slide 2: The Opportunity**
> "If every consultant systematically executed 500→50→10→2 each month, our pipeline would grow 3-4x. The bottleneck isn't talent — it's infrastructure."

**Slide 3: What VISTA Is**
> "A proprietary internal platform that wires AI intelligence directly into our daily BD workflow. Not a tool to learn — a system that pushes us to act."

**Slide 4: Five Core Engines**
> Contact Intelligence | Signal Detection | Funnel Engine | Service Matching | Action-Pushing UX

**Slide 5: The Funnel — Systematized**
> 500 targeted contacts → 50 conversations → 10 opportunities → 2 paid engagements per consultant per month. Tracked, measured, improved.

**Slide 6: ROI Projection**
> Development investment: ~$120K-$180K over 6 months
> Expected revenue lift: $5M-$24M annually
> ROI: 30x-130x on technology investment
> Time recovered: 3,000 consultant-hours/year = 1.5 FTE equivalent

**Slide 7: Current State**
> ✅ Core infrastructure deployed
> ✅ 39 database tables live
> ✅ Wave 1 shipped and operational
> ✅ Wave 1.5 database migrated
> ✅ 479 tickets scoped and prioritized
> 🔄 Ready to begin Wave 2-12 execution

**Slide 8: Execution Roadmap**
> 12 Waves over ~60 working days (with 2-3 developers)
> Wave 2: Context & Connectivity (17 days)
> Wave 3: Intelligence & Kanban (20 days) — transformative
> Wave 4-12: Progressive capability build (127 days)

**Slide 9: What We're Asking For**
> 1. Development budget: $120K-$180K over 6 months
> 2. Consultant participation: 30 min/week feedback during build
> 3. Data: Commitment to migrate contact data into VISTA
> 4. Mandate: All consultants adopt VISTA as primary BD tool

**Slide 10: Risk & Mitigation**
> | Risk | Mitigation |
> |------|-----------|
> | Low adoption | Partner mandate + daily briefing integration |
> | Data quality | Dedicated onboarding + coordinator support |
> | Scope creep | Strict 12-wave prioritization |
> | Key person dependency | Documented architecture + version control |

---

## 6. Stakeholder Map & Adoption Plan

### 6.1 Stakeholder Map

| Stakeholder | Interest | Influence | Engagement Strategy |
|------------|----------|-----------|-------------------|
| **Kevin Hong (Sponsor/CTO)** | Platform delivery, business impact | Decision-maker | Direct daily collaboration |
| **Partners** | Revenue growth, team efficiency | Budget approval | Monthly ROI briefings |
| **Senior Consultants** | Easier BD, better results | Early adopters | Beta testing, feedback loops |
| **Consultants** | Less admin, more closing | User base | Training, onboarding support |
| **Operations Team** | Data quality, reporting | Platform health | Weekly data reviews |
| **IT/Technical** | Security, integration | Technical gates | Architecture reviews |

### 6.2 Adoption Timeline

| Phase | Timeline | Activities |
|-------|----------|-----------|
| **Alpha** | Wave 1-3 (Months 1-2) | Kevin + James/AI only, core functionality |
| **Beta** | Wave 4-6 (Months 3-4) | 3-5 senior consultants, feedback integration |
| **Pilot** | Wave 7-9 (Months 4-5) | Full team (10-15 users), data migration begins |
| **Launch** | Wave 10-12 (Month 6) | Firm-wide adoption, all consultants onboarded |
| **Optimize** | Post-launch | Continuous improvement based on usage data |

### 6.3 Success Metrics

| Metric | How Measured | Target |
|--------|-------------|--------|
| **Adoption rate** | Daily active users / total users | >80% by Month 6 |
| **Outreach volume** | Emails/messages sent through VISTA | 80+/consultant/month |
| **Signal action rate** | Signals acted on / signals detected | >60% |
| **Pipeline growth** | New opportunities created | 3x current |
| **Deal velocity** | Days from opportunity to engagement | <60 days |
| **User satisfaction** | NPS survey | >40 NPS |

### 6.4 Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Low adoption | Medium | High | Partner mandate, integrate into daily standups |
| Poor data quality | High | High | Dedicated coordinator, import validation, weekly audits |
| Scope creep | High | Medium | Strict wave prioritization, 479-ticket backlog as boundary |
| Technical debt | Medium | Medium | ESLint fixes, proper CI/CD, code reviews |
| Key person risk | Medium | High | Full documentation, version control, knowledge sharing |
| Integration failures | Low | High | Staged integration (LinkedIn first, then email, then calendar) |

---

## Appendix: Technical Architecture

- **Frontend:** Next.js 15, deployed on Vercel
- **Database:** PostgreSQL on Supabase (39 tables, 222+ REST endpoints)
- **AI:** DeepSeek API (flash + pro models)
- **Auth:** Supabase Auth
- **Design:** Zero-border-radius, design token system, self-hosted fonts
- **Deployment:** GitHub push → Vercel auto-deploy
- **Production URL:** https://vista-azure-delta.vercel.app

---

*Document generated: 2026-07-11 | Author: James/AI for Kevin Hong | Classification: LYC Internal — Confidential*
