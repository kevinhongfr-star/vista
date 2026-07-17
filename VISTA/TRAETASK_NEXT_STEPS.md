# Trae — Next Steps Instructions

**Date:** 2026-07-17  
**From:** James/AI  
**Status:** Code fixes complete locally, need to push + deploy

---

## What You've Done ✅

Per your progress report, you completed **17/17 code fixes** from `TRAETASK_WAVE16_FULL_FIXES.md`:

**Batch 1 — Table Name Fixes:**
- FIX-01, FIX-02: `vista_memberships` → `vista_council_members`
- FIX-03, FIX-04: `vista_platform_settings` → `platform_settings`
- FIX-14: `email_templates` → `vista_outreach_templates`

**Batch 2 — Column Name Fixes:**
- FIX-05: `status="active"` → `is_active=true` (bundles)
- FIX-07: `order("workshop_date")` → `order("scheduled_date")`
- FIX-08: Workshops POST column rewrite
- FIX-09: Removed `attempt_count` references

**Batch 3 — Logic Fixes:**
- FIX-06: UUID/name comparison in bundles
- FIX-15: `is_founding_client` column reference
- FIX-16: Funnel `avg_days_in_stage` calculation
- FIX-17: Revenue dashboard period filter

**Batch 4 — New Tables / Schema Alignment:**
- FIX-10: Content assets → `vista_content_attribution`
- FIX-11: Content interactions table fix
- FIX-12: Membership benefits (2 new tables)
- FIX-13: Outreach mock data removal

Build compiled successfully. All good.

---

## What You Need To Do Now

### Step 1: Push Your Code

```bash
git add -A
git commit -m "Wave 1.6: Complete 17/17 production fixes (FIX-01 to FIX-17)

- 5 table name corrections
- 4 column name fixes  
- 4 logic bug fixes
- 4 new table/schema alignments
- Build verified: compiled successfully

Fixes 10/19 broken pages. All API routes now query correct tables/columns."

git push origin trae/wave1.5-frontend
```

**Important:** Push to `trae/wave1.5-frontend` branch, NOT `main`.

---

### Step 2: Verify Push Succeeded

After pushing, confirm your commit appears:
```bash
git log --oneline -3
```

You should see your new commit on top of `9eddade` (my audit commit).

---

### Step 3: Wait for James to Merge

Once your code is pushed, I (James) will:
1. Review your changes
2. Merge `trae/wave1.5-frontend` → `main`
3. Deploy to Vercel (FIX-18)
4. Smoke test all 19 pages

**Do NOT merge to main yourself. Do NOT deploy.**

---

## Database Migrations — Already Done ✅

I've already run all the SQL migrations your code depends on:

| Migration | Status |
|-----------|--------|
| `vista_membership_benefits` table | ✅ Created |
| `vista_membership_benefit_usage` table | ✅ Created |
| `outreach_assignments` table | ✅ Created |
| `vista_contacts.is_founding_client` column | ✅ Added |

Your code will work against the live database once deployed.

---

## After Deploy

Once deployed and smoke-tested, we move to **Wave 1.7** (B2C → B2B Conversion Intelligence):
- 10 tickets: BC-01 → BC-10
- Spec: `VISTA/TRAETASK_WAVE17_B2C_INTELLIGENCE.md`
- Database tables already live (`vista_b2c_leads`, `vista_b2c_events`, `vista_b2c_conversions`)

---

## Summary

| Task | Owner | Status |
|------|-------|--------|
| Code fixes (17/17) | Trae | ✅ Done locally |
| Push to GitHub | **Trae** | ⏳ **Waiting** |
| SQL migrations | James | ✅ Done |
| Merge to main | James | Pending Trae push |
| Deploy to Vercel | James | Pending merge |
| Smoke test | James | Pending deploy |

**Action required from you: Push your code.**

---

## Questions?

If anything is unclear or you hit issues during push, let James know. Don't make changes to `main` branch directly.
