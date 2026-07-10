# VISTA Master Frontend Spec — COMPLETE OVERHAUL

**Status:** Ready for Implementation
**Author:** James/AI (PM)
**Date:** 2026-07-10
**Executor:** Trae
**Supersedes:** VISTA_UX_COMPLETION_SPEC.md, VISTA_DESIGN_SYSTEM_OVERHAUL.md, NEXT_TICKETS.md, FRONTEND_LAUNCH_PLAN.md
**Branch:** `trae/master-frontend`
**Estimated:** 8–10 days total

---

## 📋 What This Spec Covers

| Previous Spec | Status |
|---|---|
| `VISTA_UX_COMPLETION_SPEC.md` | Absorbed into Phase 1–2 |
| `VISTA_DESIGN_SYSTEM_OVERHAUL.md` | Absorbed into Phase 0–1 |
| `NEXT_TICKETS.md` | Absorbed into Phase 3–4 |
| `FRONTEND_LAUNCH_PLAN.md` | Absorbed into Phase 2 |

**All previous frontend specs are DEPRECATED. This is the single source of truth.**

---

## 🔴 NON-NEGOTIABLE BRAND RULES

1. **ZERO border radius** — `border-radius: 0 !important` on ALL elements except avatars (50%) and badge pills (9999px)
2. **No colored backgrounds** — BANNED: `bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-red-50`, `bg-green-50`, `bg-yellow-50`, `bg-indigo-50`, `bg-slate-50`
3. **No emoji in UI copy** — zero tolerance
4. **No Google Fonts CDN** — fonts must be self-hosted woff2
5. **Warm neutral backgrounds** — `#FAFAFA` / `#F7F6F4`, never pure white for page BG
6. **Dark mode = warm purple-black** — `#0D0A14`, NOT cold grey-black
7. **Numbers over adjectives** in all UI text
8. **Active voice** — "The system matched 12 candidates" not "12 candidates were matched"
9. **No exclamation marks** unless celebrating a placement
10. **Score displayed ONE way only** — `ScoreGauge` component. Never progress bars, never raw numbers, never colored text

---

## PHASE 0: Foundation — Design Tokens & Performance Base (Day 1)

### 0.1 Design Token Overhaul

**File: `tailwind.config.ts`**

Replace color config with full LYC brand palette:

```typescript
colors: {
  primary: { DEFAULT: '#1A1A1A', navy: '#1C1C1E' },
  accent: {
    DEFAULT: '#C108AB',
    fuchsia: '#C108AB',
    hover: '#A00790',
    5: '#c108ab08',    // barely-there tint
    10: '#c108ab1a',   // hover backgrounds
    15: '#c108ab26',   // selection highlight
    20: '#c108ab33',   // active indicators
    40: '#c108ab66',   // disabled accent
    60: '#c108ab99',   // muted accent
    80: '#c108abcc',   // semi-emphasis
    90: '#c108abe6',   // near-full accent
  },
  teal: { DEFAULT: '#00897B', light: '#4DB6AC' },
  ocean: { DEFAULT: '#4FC3F7', deep: '#0288D1' },
  slate: { DEFAULT: '#607D8B' },
  blueGrey: { DEFAULT: '#B0BEC5' },
  success: '#2d8a4e',
  warning: '#b8860b',
  error: '#c0392b',
  info: '#2c5282',
  bg: { DEFAULT: '#FAFAFA', warm: '#F7F6F4', alt: '#F5F5F5', tertiary: '#EDEDED' },
  border: { DEFAULT: '#E5E5E5', warm: '#E8E6E3' },
  text: { primary: '#1A1A1A', secondary: '#555555', muted: '#999999' },
  // Keep existing tier + encirclement colors
  tier: { cold: '#94a3b8', warm: '#3b82f6', engaged: '#22c55e', hot: '#f97316', committed: '#ef4444' },
  encirclement: { scout: '#94a3b8', patrol: '#3b82f6', encirclement: '#a855f7', siege: '#f97316', occupation: '#ef4444' },
  // Keep shadcn CSS variable mappings
  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  // ... (preserve existing shadcn mappings)
}
```

### 0.2 Global CSS Override

**File: `app/globals.css`** — prepend to `@layer base`:

```css
@layer base {
  /* 🔴 ZERO RADIUS — NON-NEGOTIABLE */
  *, *::before, *::after {
    border-radius: 0 !important;
  }
  .avatar, [class*="avatar"], img.rounded-full { border-radius: 50% !important; }
  .badge, .badge-pill { border-radius: 9999px !important; }
  
  * { border-color: #E5E5E5; }
  
  body {
    background-color: #FAFAFA !important;
    color: #1A1A1A;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Libre Baskerville', Georgia, serif;
    color: #1A1A1A;
  }
  
  /* Table headers — premium uppercase style */
  th, [role="columnheader"] {
    font-size: 10px !important;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #999 !important;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
  }
}
```

### 0.3 Dark Theme Variables

Add to `app/globals.css`:

```css
/* Dark mode */
[data-theme="dark"] body {
  background-color: #0D0A14;
  color: #FFFFFF;
}
[data-theme="dark"] .vista-card {
  background-color: #1A0F1E;
  border-color: #281530;
  box-shadow: none;
}
[data-theme="dark"] .sidebar { background-color: #1A0F1E; }
[data-theme="dark"] th { color: #888888 !important; }
/* ... additional dark mode overrides */
```

### 0.4 Self-Host Fonts

1. Download woff2 files:
   - `LibreBaskerville-Regular.woff2`
   - `LibreBaskerville-Bold.woff2`
   - `DMSans-Regular.woff2`
   - `DMSans-Medium.woff2`
   - `DMSans-SemiBold.woff2`
2. Place in `public/fonts/`
3. Add `@font-face` declarations to `globals.css`
4. **Remove** `next/font/google` imports from `app/layout.tsx`
5. Update `layout.tsx` to use CSS variable font classes instead

### 0.5 Remove All `rounded-*` Classes

```bash
# Run this to strip rounded classes from all .tsx files
find app components -name "*.tsx" \
  -exec sed -i 's/rounded-lg//g; s/rounded-md//g; s/rounded-sm//g; s/rounded-xl//g; s/rounded-2xl//g; s/rounded-3xl//g' {} +
# Keep rounded-full ONLY for avatars and badges
```

### 0.6 Update `app/layout.tsx`

- Change `style={{ backgroundColor: '#FFFFFF' }}` → `style={{ backgroundColor: '#FAFAFA' }}`
- Remove `className="light"` from `<html>` (let dark mode toggle control it)
- Remove Google font imports, use CSS variable classes

---

## PHASE 1: Visual Overhaul — Components (Day 2–3)

### 1.1 VistaCard Component (NEW)

**Create `components/ui/VistaCard.tsx`:**

```tsx
interface VistaCardProps {
  children: React.ReactNode
  className?: string
  borderLeftColor?: string  // e.g. "accent-fuchsia", "teal", "tier-hot"
  hoverable?: boolean
  onClick?: () => void
}

// Styles:
//   bg-white, border border-[#E5E5E5], p-6
//   shadow: 0 1px 3px rgba(0,0,0,0.08)
//   radius: 0 (via global override)
//   hoverable: translateY(-4px) + shadow-md on hover, transition 0.3s ease-out
//   borderLeftColor: border-l-4 with the specified color
```

**Replace ALL usages of:**
- `<Card className="bg-blue-50 ...">` → `<VistaCard borderLeftColor="accent-fuchsia">`
- `<Card className="bg-amber-50 ...">` → `<VistaCard borderLeftColor="warning">`
- `<Card className="bg-purple-50 ...">` → `<VistaCard borderLeftColor="teal">`
- Any `bg-*-50` colored background → VistaCard with colored left border

**Files to update (13 files with colored backgrounds):**
- `app/dashboard/Dashboard.tsx`
- `app/contacts/[id]/ContactDetail.tsx`
- `app/signals/SignalsPage.tsx`
- `app/signals/[id]/SignalDetail.tsx`
- `app/clusters/ClustersPage.tsx`
- `app/clusters/[id]/ClusterDetail.tsx`
- `app/pipeline/PipelinePage.tsx`
- `app/campaigns/CampaignsPage.tsx`
- `app/programs/ProgramsPage.tsx`
- `app/strategy/StrategyPage.tsx`
- `app/automation/AutomationDashboard.tsx`
- `app/activities/ActivitiesPage.tsx`
- `app/conversions/ConversionsPage.tsx`

### 1.2 Button Standard

Update `components/ui/button.tsx`:
- Primary: `bg-accent-fuchsia text-white hover:bg-accent-hover`, min-height 44px
- Secondary: `bg-[#EDEDED] text-[#555555]`, min-height 44px
- Ghost: `transparent text-[#555555]`, min-height 44px
- Danger: `bg-error text-white`, min-height 44px
- All: `border-radius: 0`, hover `translateY(-1px)` + shadow increase
- Add `.cta-glow` class for primary CTAs (fuchsia pulse animation)
- Disabled: `opacity: 0.5 cursor-not-allowed`

### 1.3 Badge Standard

Update `components/ui/badge.tsx`:
- Background: `rgba(color, 0.1)` — 10% opacity of semantic color
- Text: semantic color at full value
- Padding: `px-2 py-1`
- Font: `text-[10px] font-bold uppercase tracking-wider`
- Border-radius: `9999px` (pill — only exception to zero rule)

### 1.4 Input Standard

Update `components/ui/input.tsx`:
- Border-radius: 0 (global override)
- Border: `1px solid #E5E5E5`
- Padding: `14px 16px`
- Focus: `ring-0 border-accent-fuchsia shadow-[0_0_0_2px_rgba(193,8,171,0.4)]`
- Placeholder: `text-[#999999]`

### 1.5 Sidebar Update

**File: `components/layout/Sidebar.tsx`**
- Background: white (light) / `#1A0F1E` (dark)
- Active item: `bg-accent-5 text-accent-fuchsia` (not bg-blue-50)
- Hover: `bg-[#F5F5F5]`
- Zero radius on all items

### 1.6 Header/Nav Update

**File: `components/layout/Header.tsx`**
- Sticky with `backdrop-filter: blur(12px)`
- Background: `rgba(255,255,255,0.92)` (light) / `rgba(13,10,20,0.92)` (dark)
- Height: 60px
- Scroll shadow: `0 1px 8px rgba(0,0,0,0.06)` appears when scrolled
- Add scroll detection in useEffect

### 1.7 Page Backgrounds

All page wrappers: `bg-white` or no bg → `bg-bg` (#FAFAFA)

### 1.8 Data Visualization Colors

Update any charts/graphs to use the spec sequence:
1. Fuchsia `#C108AB`
2. Teal `#00897B`
3. Ocean `#4FC3F7`
4. Amber `#F59E0B`
5. Red `#c0392b`
6. Slate `#607D8B`

---

## PHASE 2: Intelligence UI (Day 3–5)

### 2.1 Dashboard Intelligence Briefing (CRITICAL)

**File: `app/dashboard/Dashboard.tsx`** — complete rewrite of the top section.

**Current:** Static KPI cards → AgentStatusPanel → Quick Actions → Priority Actions → Pipeline Funnel → Recent Activity

**Target:** Intelligence Briefing → KPI Stats → Agent Activity → Priority Actions → Pipeline Funnel (recharts) → Recent Activity

**Briefing Section (new):**
- New API endpoint: `/api/intelligence/dashboard/executive-brief` (already exists)
- DeepSeek generates natural-language headlines from overnight changes
- Display as a prominent banner card at top
- 3 action buttons derived from AI recommendations

**KPI Stats (redesign):**
- 4-column grid with trend indicators
- Each KPI card shows: number + delta vs last week + sparkline (7-day trend)
- Use VistaCard with subtle shadow
- Sparklines: simple SVG, fuchsia for up, slate for down

**Pipeline Funnel (replace progress bars):**
- Use recharts BarChart (horizontal)
- Stages: Sourcing → Screening → Interview → Offer → Placed
- Color per stage from data viz palette
- Show count + change vs last week

**Agent Activity (keep, refine):**
- Show last action per agent with timestamp
- "Next scheduled" info
- Trigger buttons for each agent

### 2.2 ContactDetail Bug Fixes

**File: `app/contacts/[id]/ContactDetail.tsx`**

**Bug: Fake score breakdown** — Replace hardcoded `Math.round(vista_v * 30 / 100)` with real V/I/S/T/A from database.

**Bug: Hardcoded recommendations** — Replace with `/api/intelligence/contact/[id]/recommendations` call (DeepSeek-powered).

**Bug: Broken Edit button** — Wire up to actual edit modal.

**Bug: Create Contact uses hardcoded modal** — Replace with proper form modal.

**Design: Score display** — Use ScoreGauge only. Remove all other score visualizations.

**Design: AgentTriggerButton** — Add to ContactDetail for each agent (LENS/PROBE/MARIA/CARL).

### 2.3 Signal Intelligence Upgrade (DONE — commit 1d1e854)

Already implemented in previous commit:
- DeepSeek-powered BD strategist analysis
- Market context, campaign angle, risk factors
- Recommended actions with channel + timing

**Verify:** Check that the deployed version at `vista-azure-delta-theta.vercel.app` shows real AI output, not fallback text.

### 2.4 Replace All Hardcoded AI with DeepSeek Calls

Search for remaining hardcoded if/else patterns that simulate AI:
- `app/api/intelligence/contact/[id]/recommendations/route.ts` — verify DeepSeek call
- `app/api/intelligence/contact/[id]/summary/route.ts` — verify DeepSeek call
- `app/api/intelligence/generate-email/route.ts` — verify DeepSeek call
- `app/api/intelligence/generate-campaign/route.ts` — verify DeepSeek call
- Any component with "TODO: integrate AI" or hardcoded recommendation strings

---

## PHASE 3: Performance & Caching (Day 5–6)

### 3.1 Install SWR

```bash
npm install swr
```

Create `lib/hooks/useSWR.ts` — global SWR config:
```typescript
import { SWRConfig } from 'swr'

export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 min
  errorRetryCount: 3,
}
```

Wrap app in `ClientLayout` with `<SWRConfig value={swrConfig}>`.

### 3.2 Dashboard — SWR + API Consolidation

**Current problem:** 4 separate fetch calls on mount, no caching, refetches everything on navigation.

**Fix:**
1. Create single endpoint: `app/api/dashboard/brief/route.ts` that returns ALL dashboard data in one response (KPIs + funnel + priority actions + recent activity + agent status)
2. Replace the 4 `fetch()` calls with single `useSWR('/api/dashboard/brief', fetcher)`
3. Keep realtime subscription for live updates (debounced)
4. Remove the 5-minute interval (SWR handles revalidation)

### 3.3 Contacts Table — Pagination

**Current:** Loads ALL contacts at once.

**Fix:**
1. Update `app/api/contacts/route.ts` to support `?page=1&limit=50&sort=score&order=desc`
2. Update `ContactsTable.tsx` to use `useSWR` with pagination params
3. Add pagination controls at bottom (prev/next + page numbers)
4. Default: 50 per page

### 3.4 Signals Table — Pagination

Same pattern as contacts:
1. Update `app/api/signals/route.ts` with pagination
2. Update `SignalsPage.tsx` with `useSWR` + pagination
3. Default: 25 per page

### 3.5 Remove `force-dynamic` from Static Pages

Pages that DON'T need `force-dynamic`:
- `app/(auth)/login/page.tsx` — static
- `app/settings/page.tsx` — static (client component already)

Keep `force-dynamic` on pages that fetch Supabase data server-side.

### 3.6 API Response Caching

For API routes that don't change frequently:
- KPI data: `revalidate: 300` (5 min)
- Contact list: `revalidate: 60` (1 min)
- Signal list: `revalidate: 60`
- Agent outputs: `revalidate: 30` (30 sec)

### 3.7 Font Optimization

After self-hosting fonts (Phase 0.4):
- Add `font-display: swap` to all `@font-face`
- Preload critical fonts in `<head>`:
  ```html
  <link rel="preload" href="/fonts/DMSans-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/LibreBaskerville-Bold.woff2" as="font" type="font/woff2" crossorigin>
  ```

---

## PHASE 4: Polish & Interactions (Day 6–8)

### 4.1 Tooltips on ALL Interactive Elements

**Every** icon button, action button, and KPI card needs a `<Tooltip>` wrapper.

**Priority files:**
1. `components/layout/Header.tsx` — all icon buttons
2. `app/dashboard/Dashboard.tsx` — KPI cards, action buttons
3. `app/pipeline/PipelinePage.tsx` — stage headers, card actions
4. `app/signals/SignalsPage.tsx` — signal type icons, filters
5. `app/contacts/[id]/ContactDetail.tsx` — score items, actions
6. All other pages — same pattern

**Pattern:**
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Settings</TooltipContent>
</Tooltip>
```

`TooltipProvider` already at root level in `client-layout.tsx`.

### 4.2 ConfirmDialog on Destructive Actions

**Create `components/ui/confirm-dialog.tsx`:**
- Styled modal (not browser `confirm()`)
- VistaCard styling (zero radius, proper shadow)
- Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `onConfirm`, `variant` (default/danger)

**Apply to:**
- Delete contact
- Delete signal
- Bulk delete contacts
- Any destructive action

### 4.3 Multi-Select on Signals, Campaigns, Clusters

**Copy pattern from `ContactsTable.tsx`:**
- Add checkbox column
- Add bulk action toolbar (appears when items selected)
- Signals: bulk archive/dismiss
- Campaigns: bulk activate/pause
- Clusters: bulk assign program

### 4.4 Saved Filter Presets with URL Sync

On Contacts, Signals, Campaigns, Clusters:
1. "Save current filter" button → localStorage (`vista_filters_{page}`)
2. Active filter → URL query params (`?stage=Engaged&score_min=70`)
3. Saved presets as clickable chips above table
4. On load: restore from URL params → then localStorage

### 4.5 Contact Hover Preview Cards

**Create `components/contacts/ContactHoverCard.tsx`:**
- Hover over contact name for 500ms → preview card
- Shows: name, title, company, VISTA score mini-bar, last activity
- Quick actions: View Profile, Log Activity, Send Email

### 4.6 CTA Glow Animation

```css
@keyframes cta-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(193, 8, 171, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(193, 8, 171, 0); }
}
.cta-glow { animation: cta-glow 2.5s ease-in-out infinite; }
```
Apply to primary CTA buttons only (not all buttons).

### 4.7 Card Hover Lift (global)

```css
.vista-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### 4.8 Voice & Tone Pass

Review ALL UI text across the app:
- Numbers over adjectives: "3 of 5 candidates scored" not "Most candidates scored well"
- Active voice: "The system matched 12 candidates" not "12 candidates were matched"
- Front-load info: "Search completed: 47 candidates found" not "We have completed..."
- One idea per sentence
- No emoji
- No exclamation marks (except placement confirmed)

---

## PHASE 5: Dark Mode (Day 8–9)

### 5.1 Theme Toggle

Add to Settings page or Header dropdown:
- Toggle stored in `localStorage` key `lyc-theme`
- Applied via `data-theme="dark"` on `<html>`
- System preference `prefers-color-scheme: dark` as initial default
- Remove hardcoded `className="light"` from layout

### 5.2 Dark Mode Color Mapping

| Token | Light | Dark |
|---|---|---|
| Page BG | `#FAFAFA` | `#0D0A14` |
| Card BG | `#FFFFFF` | `#1A0F1E` |
| Card border | `#E5E5E5` | `#281530` |
| Text primary | `#1A1A1A` | `#FFFFFF` |
| Text secondary | `#555555` | `#CCCCCC` |
| Text muted | `#999999` | `#888888` |
| Sidebar BG | `#FFFFFF` | `#1A0F1E` |
| Input BG | `#FFFFFF` | `#1A0F1E` |
| Hover BG | `#F5F5F5` | `#3A2040` |

### 5.3 Dark Mode Rules
- Cards: subtle border only, NO shadow
- Fuchsia accent stays constant
- No cold grey-black anywhere — always warm purple-black
- Images: slight brightness reduction if needed

---

## PHASE 6: Bug Fixes from UX Completion Spec (Day 9–10)

### 6.1 ContactDetail Score Breakdown

Replace fake `Math.round(vista_v * 30 / 100)` with real V/I/S/T/A from `contact.vista_v`, `contact.vista_i`, etc.

### 6.2 ContactDetail Hardcoded Recommendations

Replace with DeepSeek API call to `/api/intelligence/contact/[id]/recommendations`.

### 6.3 Edit Button Wiring

Connect Edit button to actual edit modal with form fields.

### 6.4 Create Contact Modal

Replace hardcoded modal with proper form: name, company, title, email, phone, linkedin.

### 6.5 AgentTriggerButton

Add to ContactDetail — 4 buttons (LENS/PROBE/MARIA/CARL) that trigger agent actions on the specific contact.

### 6.6 Pipeline Funnel Chart

Replace progress bars with recharts horizontal BarChart.

---

## VERIFICATION CHECKLIST

Before submitting PR, verify ALL:

- [ ] `border-radius: 0` on ALL elements (inspect every page in browser)
- [ ] Zero instances of `bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-red-50`, `bg-green-50`, `bg-yellow-50`, `bg-indigo-50`, `bg-slate-50`
- [ ] Page background is `#FAFAFA` (not pure white)
- [ ] All cards use VistaCard with left-border accents
- [ ] All buttons: 0 radius, min-height 44px, hover lift
- [ ] Table headers: uppercase 10px tracking
- [ ] Fuchsia is the ONLY accent color for CTAs
- [ ] Zero emoji in any UI text
- [ ] No Google Fonts CDN calls (fonts self-hosted)
- [ ] Dashboard loads SWR-cached data (check Network tab — no repeated fetches on navigation)
- [ ] Contacts table paginated (50/page)
- [ ] Signals table paginated (25/page)
- [ ] Tooltips on every icon button
- [ ] ConfirmDialog on all destructive actions
- [ ] Dark mode toggle works
- [ ] Responsive at 768px and 1024px
- [ ] ScoreGauge used everywhere (no progress bars for scores)
- [ ] DeepSeek-powered recommendations on ContactDetail (not hardcoded)
- [ ] `npm run build` — zero errors
- [ ] Push to GitHub → Vercel deployment READY
- [ ] Signal page shows real AI analysis (not fallback text)

---

## FILE MANIFEST — Complete List of Files to Modify

**Core tokens (Phase 0):**
- `tailwind.config.ts`
- `app/globals.css`
- `app/layout.tsx`
- `app/client-layout.tsx`
- `public/fonts/` (new directory, 5 woff2 files)

**New components (Phase 1–4):**
- `components/ui/VistaCard.tsx` (new)
- `components/ui/confirm-dialog.tsx` (new)
- `components/contacts/ContactHoverCard.tsx` (new)
- `lib/hooks/useSWR.ts` (new)
- `app/api/dashboard/brief/route.ts` (new — consolidated endpoint)

**Component updates (Phase 1):**
- `components/ui/button.tsx`
- `components/ui/badge.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx` — deprecate in favor of VistaCard, or redirect
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`

**Page updates (Phase 1–2, all pages):**
- `app/dashboard/Dashboard.tsx`
- `app/contacts/page.tsx`
- `app/contacts/[id]/ContactDetail.tsx`
- `app/signals/page.tsx` (or SignalsPage.tsx)
- `app/signals/[id]/SignalDetail.tsx`
- `app/clusters/page.tsx` (or ClustersPage.tsx)
- `app/clusters/[id]/ClusterDetail.tsx`
- `app/pipeline/PipelinePage.tsx`
- `app/campaigns/CampaignsPage.tsx`
- `app/programs/ProgramsPage.tsx`
- `app/strategy/StrategyPage.tsx`
- `app/automation/AutomationDashboard.tsx`
- `app/activities/ActivitiesPage.tsx`
- `app/conversions/ConversionsPage.tsx`
- `app/settings/page.tsx`

**Table components (Phase 3–4):**
- `components/contacts/ContactsTable.tsx`

**API routes to update (Phase 3):**
- `app/api/contacts/route.ts` — add pagination
- `app/api/signals/route.ts` — add pagination
- `app/api/dashboard/brief/route.ts` — new consolidated endpoint

**Total: ~45 files**

---

## EXECUTION ORDER

| Day | Phase | What |
|---|---|---|
| 1 | Phase 0 | Tokens, global CSS, zero radius, self-host fonts, layout.tsx |
| 2 | Phase 1 | VistaCard, button/badge/input standard, remove all rounded-* |
| 3 | Phase 1 | Update all 13+ pages to use VistaCard, fix backgrounds |
| 4 | Phase 2 | Dashboard intelligence briefing, KPI sparklines, funnel chart |
| 5 | Phase 2 | ContactDetail bug fixes, signal verification, AI replacement |
| 6 | Phase 3 | SWR install, dashboard API consolidation, pagination |
| 7 | Phase 4 | Tooltips, ConfirmDialog, multi-select, hover cards |
| 8 | Phase 4 | Voice & tone pass, CTA glow, filter presets |
| 9 | Phase 5 | Dark mode implementation |
| 10 | Phase 6 | Remaining bug fixes, final verification |

---

## RULES FOR TRAE

1. **Do NOT force push main.** Push to `trae/master-frontend`, then PR.
2. **Commit after each phase.** Not one mega-commit.
3. **Do NOT delete spec documents.** They stay on main.
4. **Test on Vercel preview** before merging.
5. **Do NOT use Google Fonts CDN.** Self-hosted only.
6. **Zero radius is non-negotiable.** Don't add `rounded-*` back.
7. **No `bg-*-50` colored backgrounds.** Use VistaCard + left border.
8. **ScoreGauge everywhere.** Never progress bars for scores.
9. **Numbers over adjectives** in all UI text.
10. **If a DeepSeek API call exists, use it.** Don't add new hardcoded if/else.

---

*This spec supersedes all previous frontend specs. It is the single source of truth for VISTA's visual identity, performance, and UX.*
