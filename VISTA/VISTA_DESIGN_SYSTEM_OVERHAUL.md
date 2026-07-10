# VISTA Design System Overhaul — Trae Implementation Spec

**Based on:** `LYC_Intelligence_Design_Spec.md` (sister app, v1.0, 2026-07-10)
**Scope:** Full visual overhaul of VISTA to match LYC brand spec
**Branch:** `trae/design-overhaul`
**Estimated effort:** 5–7 days

---

## 🔴 NON-NEGOTIABLE BRAND RULES (read first)

1. **ZERO border radius everywhere** — `border-radius: 0 !important` on all elements except:
   - Avatar/profile images → `border-radius: 50%`
   - Badge pills → `border-radius: 9999px`
   - Chat bubbles → specific radii
2. **No colored backgrounds** — Banned: `bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-red-50`, `bg-green-50`, `bg-yellow-50`, etc.
3. **No emoji in UI copy** — Zero tolerance
4. **No Google Fonts CDN** — Fonts are self-hosted in `/fonts/`
5. **Warm neutral backgrounds** — Page BG is `#FAFAFA` or `#F7F6F4`, NEVER pure white
6. **Dark mode = warm purple-black** — `#0D0A14`, NOT cold grey-black

---

## PART 1: Design Tokens (Day 1) — HIGHEST PRIORITY

### 1.1 Update `tailwind.config.ts`

Replace the current color config with the full LYC brand palette:

```typescript
colors: {
  // Primary
  primary: { DEFAULT: '#1A1A1A', navy: '#1C1C1E' },
  
  // Accent — Fuchsia with opacity scale
  accent: {
    DEFAULT: '#C108AB',
    fuchsia: '#C108AB',
    hover: '#A00790',
    5: '#c108ab08',
    10: '#c108ab1a',
    15: '#c108ab26',
    20: '#c108ab33',
    40: '#c108ab66',
    60: '#c108ab99',
    80: '#c108abcc',
    90: '#c108abe6',
  },
  
  // Secondary palette
  teal: { DEFAULT: '#00897B', light: '#4DB6AC' },
  ocean: { DEFAULT: '#4FC3F7', deep: '#0288D1' },
  slate: { DEFAULT: '#607D8B' },
  blueGrey: { DEFAULT: '#B0BEC5' },
  
  // Semantic
  success: '#2d8a4e',
  warning: '#b8860b',
  error: '#c0392b',
  info: '#2c5282',
  
  // Neutrals / Backgrounds
  bg: { DEFAULT: '#FAFAFA', warm: '#F7F6F4', alt: '#F5F5F5', tertiary: '#EDEDED' },
  border: { DEFAULT: '#E5E5E5', warm: '#E8E6E3' },
  text: { primary: '#1A1A1A', secondary: '#555555', muted: '#999999' },
  
  // Tier & Encirclement (keep existing)
  tier: { cold: '#94a3b8', warm: '#3b82f6', engaged: '#22c55e', hot: '#f97316', committed: '#ef4444' },
  encirclement: { scout: '#94a3b8', patrol: '#3b82f6', encirclement: '#a855f7', siege: '#f97316', occupation: '#ef4444' },
  
  // shadcn/ui — keep existing CSS variable references
  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  // ... rest of shadcn mappings
}
```

### 1.2 Update `app/globals.css`

Add the zero-radius rule and update base styles:

```css
@layer base {
  /* 🔴 ZERO RADIUS — NON-NEGOTIABLE */
  *, *::before, *::after {
    border-radius: 0 !important;
  }
  /* Exceptions */
  .avatar, [class*="avatar"] { border-radius: 50% !important; }
  .badge, .badge-pill, [class*="badge"] { border-radius: 9999px !important; }
  
  * { border-color: #E5E5E5; }
  
  body {
    background-color: #FAFAFA;
    color: #1A1A1A;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Libre Baskerville', Georgia, serif;
    color: #1A1A1A;
  }
}
```

### 1.3 Dark Theme CSS Variables

Add to `globals.css`:

```css
[data-theme="dark"] {
  --bg-primary: #0D0A14;
  --bg-secondary: #1A0F1E;
  --bg-tertiary: #281530;
  --bg-hover: #3A2040;
  --text-primary: #FFFFFF;
  --text-secondary: #CCCCCC;
  --text-muted: #888888;
  --border: #281530;
}

[data-theme="dark"] body {
  background-color: #0D0A14;
  color: #FFFFFF;
}
```

---

## PART 2: Component Overhaul (Day 2–3)

### 2.1 VistaCard Component

Create `components/ui/VistaCard.tsx` — the standard card for the entire app:

```tsx
// Props: children, className, borderLeftColor?, hoverable?, onClick?
// Styles:
//   bg-white, border border-[#E5E5E5], p-4 to p-6
//   shadow: 0 1px 3px rgba(0,0,0,0.08)
//   radius: 0 (via global override)
//   hoverable: translateY(-4px) + shadow increase on hover
//   borderLeftColor: optional colored left border (replaces bg-blue-50 etc.)
```

**Replace ALL usages of:**
- `<Card className="bg-blue-50 ...">` → `<VistaCard borderLeftColor="accent-fuchsia">`
- `<Card className="bg-amber-50 ...">` → `<VistaCard borderLeftColor="amber-500">`
- `<Card className="bg-purple-50 ...">` → `<VistaCard borderLeftColor="teal">`
- Any `bg-*-50` colored background → VistaCard with colored left border

### 2.2 Button Standard

Update `components/ui/button.tsx`:
- Min-height: 44px (primary), 36px (secondary/ghost)
- Border-radius: 0 (via global override)
- Primary: bg-accent-fuchsia, text-white, hover:bg-accent-hover
- Hover: `translateY(-1px)` + shadow increase
- Add `.cta-glow` animation for primary CTAs (fuchsia pulse)

### 2.3 Table Headers

Global CSS or component update for tables:
```css
th, [role="columnheader"] {
  font-size: 10px !important;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #999 !important;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
}
```

### 2.4 Badge Standard

Update badge component:
- Background: `rgba(color, 0.1)` — 10% opacity of semantic color
- Text: semantic color at full value
- Padding: 4px 8px
- Font: 10px, bold, uppercase
- Border-radius: 9999px (pill — only exception)

### 2.5 Input Standard

- Border-radius: 0
- Border: 1px solid #E5E5E5
- Padding: 14px 16px
- Focus: `box-shadow: 0 0 0 2px rgba(193, 8, 171, 0.4); border-color: #C108AB;`

### 2.6 Nav/Header

Update `components/layout/Header.tsx`:
- Sticky with `backdrop-filter: blur(12px)`
- Background: `rgba(255,255,255,0.92)`
- Height: 60px
- Scroll shadow: `0 1px 8px rgba(0,0,0,0.06)` appears when scrolled

### 2.7 Remove all `rounded-*` classes

Search and remove ALL `rounded-lg`, `rounded-md`, `rounded-sm`, `rounded-xl`, `rounded-2xl` from every `.tsx` file (43 files affected). The global CSS `!important` override handles it, but removing the classes keeps the code clean.

**Script to automate:**
```bash
find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./.next/*" \
  -exec sed -i '' 's/rounded-lg//g; s/rounded-md//g; s/rounded-sm//g; s/rounded-xl//g; s/rounded-2xl//g; s/rounded-full/rounded-full/g' {} +
```
Keep `rounded-full` only for avatars and badge pills.

---

## PART 3: Page-Level Updates (Day 3–4)

### 3.1 All pages — background color
Every page wrapper: change `bg-white` or no bg class → `bg-[#FAFAFA]`

### 3.2 ContactDetail.tsx
- Replace all `<Card className="bg-blue-50 ...">` → `<VistaCard borderLeftColor="...">`
- Score display: Use ScoreGauge only (remove progress bars and raw numbers)
- Remove all colored background sections

### 3.3 SignalDetail.tsx
- Already updated in previous commit — verify border-l-4 cards match the new token names

### 3.4 Dashboard.tsx
- KPI cards: Use VistaCard with subtle shadow, not colored backgrounds
- Stats grid: `grid-cols-4 gap-24px` per spec
- Add warm neutral section backgrounds where appropriate

### 3.5 ContactsTable.tsx
- Table headers: uppercase 10px tracking (handled by global CSS)
- Row hover: `bg-[#F5F5F5]` (not bg-gray-50)
- Remove any remaining rounded-* on table cells

### 3.6 All other pages (clusters, pipeline, campaigns, programs, etc.)
- Same pattern: VistaCard instead of colored Card, bg-[#FAFAFA] page background
- Audit each page for `bg-*-50` violations

---

## PART 4: Dark Mode (Day 5)

### 4.1 Theme toggle
Add to Settings or Header:
- Toggle stored in `localStorage` key `lyc-theme`
- Applied via `data-theme="dark"` on `<html>`
- System preference `prefers-color-color: dark` as initial default

### 4.2 Dark mode overrides
- All cards: border `#281530`, no shadow
- Sidebar: `#1A0F1E` background
- Input focus ring: fuchsia
- Text colors: per dark theme tokens

---

## PART 5: Polish (Day 5–6)

### 5.1 CTA Glow Animation
```css
@keyframes cta-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(193, 8, 171, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(193, 8, 171, 0); }
}
.cta-glow { animation: cta-glow 2.5s ease-in-out infinite; }
```
Apply to primary CTA buttons.

### 5.2 Card hover lift
```css
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### 5.3 Voice & Tone pass
Review all UI text:
- Numbers over adjectives
- Active voice
- No exclamation marks (unless celebrating a placement)
- No emoji
- Front-load important info

### 5.4 Data visualization colors
Update any charts to use the spec sequence:
1. Fuchsia `#C108AB`
2. Teal `#00897B`
3. Ocean `#4FC3F7`
4. Amber `#F59E0B`
5. Red `#c0392b`
6. Slate `#607D8B`

---

## VERIFICATION CHECKLIST

Before submitting PR, verify:

- [ ] `border-radius: 0` on ALL elements (inspect in browser)
- [ ] No `bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-red-50`, `bg-green-50` anywhere
- [ ] Page background is `#FAFAFA` (not pure white)
- [ ] Cards use VistaCard component with left-border accents (not colored backgrounds)
- [ ] All buttons have 0 radius, min-height 44px
- [ ] Table headers are uppercase 10px
- [ ] Fuchsia is the ONLY accent color for CTAs
- [ ] No emoji in any UI text
- [ ] Dark mode works (toggle in settings)
- [ ] All pages responsive at 768px and 1024px breakpoints
- [ ] No Google Fonts CDN calls (check `layout.tsx`)
- [ ] `npm run build` passes with zero errors
- [ ] Push to GitHub and confirm Vercel deployment is READY

---

## FILES TO MODIFY (full list)

**Core tokens:**
- `tailwind.config.ts`
- `app/globals.css`

**New component:**
- `components/ui/VistaCard.tsx` (new)

**Layout:**
- `components/layout/Header.tsx`
- `components/layout/Sidebar.tsx`
- `app/layout.tsx`

**Pages (all need bg + card audit):**
- `app/dashboard/Dashboard.tsx`
- `app/contacts/page.tsx`
- `app/contacts/[id]/ContactDetail.tsx`
- `app/signals/SignalsPage.tsx`
- `app/signals/[id]/SignalDetail.tsx`
- `app/clusters/ClustersPage.tsx`
- `app/pipeline/page.tsx`
- `app/campaigns/page.tsx`
- `app/programs/page.tsx`
- `app/strategy/page.tsx`
- `app/automation/page.tsx`
- `app/settings/page.tsx`
- `app/activities/page.tsx`
- `app/conversions/page.tsx`

**Shared components (audit for rounded-* and bg colors):**
- `components/contacts/ContactsTable.tsx`
- `components/scoring/ScoreGauge.tsx`
- `components/intelligence/*.tsx`
- `components/modals/*.tsx`
- `components/ui/button.tsx`
- `components/ui/badge.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`

**Total: ~40+ files**

---

*This spec overrides all previous design decisions. The sister app's `LYC_Intelligence_Design_Spec.md` is the source of truth.*
