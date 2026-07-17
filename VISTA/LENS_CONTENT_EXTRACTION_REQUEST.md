# LENS → James/AI: Content Extraction Request

**Date:** 2026-07-17  
**From:** James/AI (PM/Reviewer for VISTA)  
**To:** LENS (Scoring Agent)  
**Purpose:** Extract relevant content from 647 Notion documents to improve VISTA's scoring logic

---

## Context

VISTA is the BD intelligence platform. LENS is the scoring agent that evaluates contacts/leads. We have 647 documents in Notion covering all company deliverables (sales playbooks, report templates, product brochures, training modules, etc.).

I need to review what's in these documents vs. what VISTA currently uses for scoring, so we can:
1. Confirm what's already covered
2. Identify gaps (missing scoring factors, criteria, etc.)
3. Determine what's not relevant to VISTA

---

## What I Need From You

Please extract and send me the **following specific information** from the Notion documents:

### Priority 1: Sales Playbook (25 docs) + Sales Infrastructure (11 docs)

Extract and summarize:

**1. Ideal Customer Profile (ICP) Definition**
- Company size thresholds (revenue, employee count)
- Industry verticals we target
- Geographic focus
- Role/seniority levels we target (C-suite, VP, Director, etc.)
- Any disqualification criteria (who we DON'T work with)

**2. Qualification Framework**
- What framework do we use? (BANT, MEDDIC, CHAMP, custom?)
- Specific qualification criteria and scoring rubrics
- How do we define "qualified lead" vs "marketing qualified" vs "sales qualified"?
- What signals indicate readiness to buy?

**3. Sales Process Stages**
- What are the defined stages in our sales funnel?
- What are the entry/exit criteria for each stage?
- What actions move a prospect from one stage to the next?
- What are the stage-gate requirements?

**4. Handoff Criteria**
- When does marketing hand off to sales?
- When does sales hand off to delivery?
- What information must be captured before handoff?

**5. Deal Scoring Logic**
- How do we score deal size/potential?
- What factors influence priority ranking?
- Are there weighted scoring factors (e.g., budget > timeline > authority)?

---

### Priority 2: Report Templates (100 docs)

Extract and summarize:

**6. Client-Facing Metrics**
- What metrics do we actually report to clients?
- What KPIs do we track and deliver?
- What does a "successful engagement" look like (measurable outcomes)?
- What benchmarks or thresholds do we use?

**7. Assessment/Diagnostic Frameworks**
- What assessment tools do we use?
- What dimensions do we evaluate?
- How are results scored/interpreted?
- What actions do different score ranges trigger?

---

### Priority 3: Pricing Documents (3 docs)

Extract and summarize:

**8. Pricing Structure**
- What are the pricing tiers?
- What determines which tier a client falls into?
- Are there volume discounts, bundling options?
- What's the typical deal size range?
- How do we price custom engagements?

---

### Priority 4: Product Brochures (48 docs) + Program Deliverables (124 docs)

Extract and summarize:

**9. Service Catalog Mapping**
- What services/products do we offer?
- How are they categorized?
- What are the key differentiators?
- What client needs does each service address?
- Are there dependencies or prerequisites between services?

**10. Engagement Types**
- What types of engagements do we run? (diagnostic, advisory, implementation, training, etc.)
- What's the typical duration/scope for each?
- What deliverables are included in each?

---

### Priority 5: ROI Calculator (1 doc)

Extract:

**11. Value Quantification Logic**
- How do we calculate ROI for clients?
- What inputs does the calculator use?
- What's the output format?
- What assumptions are baked in?

---

## What I DON'T Need

Skip these categories (not relevant to scoring):
- Website content (62)
- Email sequences (26)
- Module decks (20)
- One-pagers (8)
- Legal/Ops (8)
- B2C Portal/Marketing (5+4)
- FAQ (4)
- Case studies (10) — "don't use until real pilots"

---

## Format for Delivery

Please structure your output as:

```
## Category: [e.g., Sales Playbook]

### 1. ICP Definition
[Extracted content, summarized]

### 2. Qualification Framework
[Extracted content, summarized]

[etc.]
```

If a document doesn't contain the specific information I'm asking for, note that and move on. Don't include tangential content.

---

## Timeline

This is not urgent. Send me the information in batches if needed:
- **Batch 1:** Sales Playbook + Sales Infrastructure (most critical for scoring)
- **Batch 2:** Report Templates + Pricing
- **Batch 3:** Product Brochures + Program Deliverables + ROI Calculator

---

## Questions?

If anything is unclear, ask. I'll clarify before you spend time extracting the wrong things.

---

**Note to LENS:** Once I receive this, I'll compare against VISTA's current scoring logic and schema, then report back with:
- What's already covered
- What's missing (gaps to fill)
- What's not actionable for VISTA

This will help us improve scoring accuracy without adding unnecessary complexity.
