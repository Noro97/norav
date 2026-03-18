# Content Saturation: Bento Grid, Impact Dashboard, Marquee & Full-Site i18n

## Context

The portfolio currently has rich interactive case studies but lacks an overview layer that communicates engineering density at a glance. A recruiter scanning the site needs to immediately see metrics, breadth of expertise, and technical depth — not just individual project demos. This upgrade adds a Bento Grid overview section, an Impact Dashboard with animated KPIs, a Bloomberg-style engineering principles marquee, and full-site bilingual support (EN/RU).

## Design Decisions (Locked)

| Decision | Choice |
|----------|--------|
| Bento Grid placement | NEW section above existing case studies (additive, not replacement) |
| Grid layout | Balanced Masonry — 3-column with varied spans |
| Dashboard style | Grafana-style dark cards with monospace numbers |
| i18n library | react-i18next |
| i18n scope | Entire site (all sections) |
| Languages | English (default) + Russian with navbar toggle |

---

## 1. New Components

### 1.1 BentoGrid Section (`src/components/sections/BentoGrid/`)

A new section with id `overview`, inserted between SkillsMatrix and the case study sections.

**Files:**
- `BentoGrid.tsx` — Main section orchestrator (follows existing pattern: useRef, useSectionObserver, GSAP ScrollTrigger entrance)
- `BentoProjectTile.tsx` — Large 2-col tiles for main projects (NexusRoute, MerchForge, FilterGraph)
- `BentoMicroTile.tsx` — Small 1-col tiles for micro-innovations
- `BentoImpactDashboard.tsx` — Grafana-style metrics panel with framer-motion count-up
- `BentoMarquee.tsx` — CSS-animated infinite scroll ticker
- `bento.data.ts` — Tile configuration (non-translatable data like tech stacks, target section IDs)

**Grid Layout (3-col balanced masonry):**
```
Row 1: [NexusRoute — 2col]     [Perf Audit — 1col]
Row 2: [Type-Safe — 1col]      [MerchForge — 2col]
Row 3: [Impact Dashboard — 2col] [UX Predict — 1col]
Row 4: [FilterGraph — 3col full width]
Row 5: [——————— Marquee ———————— full width]
```

On mobile: single column, all tiles stack vertically.

### 1.2 BentoProjectTile

- Glass card with glassmorphism styling
- Thumbnail area (static screenshot or short video loop)
- Project title + brief description (from i18n)
- Tech stack badges: `px-2 py-1 text-[10px] font-mono text-white/30 border border-white/8 rounded`
- Click scrolls to the full case study section below (using same `scrollIntoView()` pattern as Navigation)

### 1.3 BentoMicroTile

Three micro-innovation tiles:
1. **Performance Audit** — "Reduced map re-render time by 60% via GeoJSON-layer memoization"
2. **Type-Safe Architecture** — "End-to-end type system between Node.js backend and React frontend, eliminating 99% of runtime API errors"
3. **User Experience** — "Predictive input system for complex forms, reducing shipment creation time by 15 seconds"

Each tile: icon + bold title + description in `font-mono text-xs`.

### 1.4 BentoImpactDashboard

Grafana-style dashboard with 4 metric cards:

| Metric | Value | Status |
|--------|-------|--------|
| LCP | < 1.2s | Green |
| Bundle Size | 42kb Gzipped | Green |
| GPS Nodes | 500+ active | Yellow |
| Test Coverage | 92% | Green |

- Dark background with subtle green tint (`bg-[#0a0f0a]`)
- Monospace numbers (JetBrains Mono)
- Green/yellow status dots
- Animated count-up on scroll using framer-motion's `useMotionValue` + `useTransform` + `animate` + `useInView`
- Subtle micro-grid overlay

### 1.5 BentoMarquee

Bloomberg-style infinite ticker:
- Content: `Composition over Inheritance • DRY but not die • Performance is a Feature • Accessibility is Mandatory`
- Pure CSS animation (`translateX(-50%)` with duplicated content)
- `border-y border-white/5`, monospace, uppercase, letter-spacing

---

## 2. Visual Style Upgrades

### 2.1 Micro-grid background

New CSS class `micro-grid-bg` added to `src/index.css`:
```css
.micro-grid-bg {
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

Applied to the Bento Grid section container and optionally to `<main>`.

### 2.2 Glassmorphism enhancement

Update existing `glass-card` in `public/static/style.css`:
- Border: `rgba(255,255,255,0.1)` (from current 0.06)
- Add inner shadow: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.04)`

---

## 3. Full-Site Internationalization (EN/RU)

### 3.1 Setup

- Install: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Init file: `src/i18n/index.ts`
- Import in `src/main.tsx` before App renders

### 3.2 File Structure

```
src/i18n/
  index.ts
  locales/
    en/
      common.json    — nav labels, shared buttons, footer
      hero.json
      about.json
      experience.json
      skills.json
      bento.json
      projects.json  — logistics, merch, ecommerce strings
      education.json
      terminal.json
    ru/
      (same 9 files)
```

### 3.3 String Extraction (per component)

Every section component has hardcoded English strings. All must be extracted to i18n keys:

- **HeroSection.tsx** — name, title, tagline, scroll hint
- **AboutHero.tsx** — bio paragraphs, quick facts, social labels, status badge
- **ExperienceTimeline.tsx** — section header, all 4 experience entries (role, company, description, achievements)
- **SkillsMatrix.tsx** — section header, 4 category names, 20 skill names
- **LogisticsWidget.tsx** — case study label, title, description, metric labels, button text
- **AIMerchWidget.tsx** — case study label, title, description, product types, color names, size labels
- **EcommerceWidget.tsx** — case study label, title, description, filter labels, sort options
- **EducationCerts.tsx** — section header, degree info, 5 certifications
- **TerminalFooter.tsx** — section header, prompt text, status bar
- **constants.ts** — SECTIONS `label` field → `labelKey` with i18n lookup
- **useTerminal.ts** — all terminal command responses

### 3.4 Translation key pattern

Namespaced dot-notation: `t('hero.tagline')`, `t('experience.entries.0.role')`.

For styled inline spans (e.g., crimson/white text in tagline), use `<Trans>` component with custom components mapping.

For data arrays (EXPERIENCES, SKILL_DATA), keep non-translatable fields (tech stacks, dates, percentages) in data files, reference i18n keys for display text.

### 3.5 Language Toggle

Add to `Navigation.tsx` — a small button after the dot nav:
```tsx
<button onClick={toggleLang} className="font-mono text-[11px] ...">
  {i18n.language === 'en' ? 'RU' : 'EN'}
</button>
```

On mobile, position in the top-right area of the navbar.

---

## 4. Navigation Updates

### 4.1 New section in SECTIONS array

Add `{ id: 'overview', labelKey: 'nav.overview' }` before `logistics` in `src/lib/constants.ts`.

### 4.2 Label migration (simultaneous, breaking change)

This is an atomic migration — all entries change at once:
1. Update `SectionConfig` type in `src/types/index.ts`: change `label: string` to `labelKey: string`
2. Update ALL entries in `SECTIONS` array simultaneously (e.g., `{ id: 'hero', labelKey: 'nav.home' }`)
3. Update `Navigation.tsx` — both desktop dot nav (line 70) AND mobile label (line 79) to use `t(section.labelKey)`

### 4.3 App.tsx integration

Lazy-load `BentoGrid` in its own `<Suspense>` boundary, inserted between the Skills group and the Projects group:

```tsx
<Suspense fallback={<SectionLoader />}>
  <BentoGrid />
</Suspense>
```

---

## 5. Accessibility

- **Language toggle:** `aria-label="Switch language"` on the toggle button
- **Marquee:** `aria-hidden="true"` on the ticker (duplicated content would confuse screen readers); provide a static `<span className="sr-only">` with the principles list
- **Reduced motion:** Wrap marquee CSS animation and framer-motion count-up in `prefers-reduced-motion` checks. If reduced motion, show final values immediately with no animation. The codebase already checks this in `App.tsx` line 65.
- **BentoProjectTile scroll links:** Use `<button>` elements (not `<div onClick>`) with descriptive `aria-label`

---

## 6. Risk Areas

1. **i18n completeness** — Missing strings create mixed-language UI. Use `i18next.saveMissing` in dev to catch untranslated keys.
2. **Russian text overflow** — Russian is 15-30% longer. Test tight layouts (nav labels, metric cards) in both languages.
3. **ScrollTrigger recalc** — New section changes scroll height. Existing triggers use relative positions so should be fine, but call `ScrollTrigger.refresh()` if issues appear.
4. **framer-motion + GSAP** — Use on different elements (never same DOM node). Count-up uses framer-motion; section entrances use GSAP.

## 7. Note on Footer.tsx

`src/components/Footer.tsx` exists but is NOT rendered in App.tsx (legacy/unused). It does not need i18n coverage. If it gets wired in later, add translations then.
