# Every colour class in the site's source compiles

- **Found:** 2026-11-22, listed by `.tasks/done/S9-chosen-state.md` in `STATE.md`'s tech-debt register
- **Fixed:** 2026-11-22, a side session started from S9. Code only: no migration, no production step, no copy

## Cause

`tokens.css` resets Tailwind's palette (`--color-*: initial`), so any colour outside the roles compiles to nothing and the build stays green. The lint only read string literals inside a `className` attribute, and its prefix list didn't match directional forms like `border-t-`. Scanning `src/` with Tailwind's own scanner (`@tailwindcss/oxide`) and compiling every colour-prefixed candidate against `src/index.css` found twelve dead classes, not the four the register named:

- `border-t-crimson-500` on both spinners (`SectionLoader`, `LogisticsWidget`). The ring turned with no highlighted segment.
- All eight of OmniGrid's tones in `omnigrid.data.ts`. Priority used `text-white/40`, `text-amber-400`, `text-orange-400` and `text-red-400`. Status used `text-warning`, `text-info`, `text-success` and `text-danger`: bare names, not `status-*`, so they were dead too. Every status and priority rendered in the body colour.
- `bg-black/80`, the default in `ModalShell`. `ProductDetailModal` (FilterGraph) is the caller that relies on it, so its scrim only blurred. `ShipmentDetailModal` passes its own.
- In `ShipmentDetailModal`, `text-gold-400` on the cost and `text-display-sm` on the heading. They sat beside two dead custom names, `label-mono-gold` and `case-study-tertiary-card`. 645f99f, in September, wrote those four over the design-system classes the colour migration had given them, probably in a rebase.

## Fix

- Spinners: `border-t-primary-500`.
- Status: `text-status-{warning,info,success,danger}`.
- Priority climbs. Low is `text-tertiary-ink/50`, the tone of every other cell in the row, because ink/40 misses 4.5:1. Medium is `text-tertiary-fg`, High `text-status-warning`, Critical `text-status-danger`. Status has no orange, and Medium in `status-info` would read as "In Transit" next to it.
- `ModalShell`'s default scrim is `bg-tertiary-shade/80 backdrop-blur-md`.
- The shipment modal gets back what 645f99f overwrote. The eyebrow is `type-label text-secondary-300`, the heading `font-display text-heading-small font-black`, and the cost `text-secondary-300`. The panel has `rounded-2xl border border-tertiary-line` in place of the dead name. It doesn't take `case-study-card`, whose unlayered background would override the panel's `bg-tertiary-bg/95`.
- The lint's colour, hex and type rules read every literal and template under `src/`, not only a `className`. The prefixes cover `border-{t,r,b,l,x,y,s,e}-`, `ring-offset-`, `inset-ring-`, `inset-shadow-`, `drop-shadow-` and `text-shadow-`. Bare role and status names (`text-warning`, `bg-primary`) are errors. The kit and the tests stay excluded.
- `src/__tests__/colour-classes.test.ts` scans `src/` with Tailwind's scanner and fails on any colour-prefixed class that compiles to nothing, so a mistyped role fails too. `src/__tests__/design-system-lint.test.ts` runs the lint on snippets. `src/__tests__/stylesheet.ts` holds the compiler `selection.test.ts` used to build itself.
- `@tailwindcss/oxide` is a direct dev dependency now, at the version already locked: one line in `package-lock.json`.

## Verified

- `colour-classes.test.ts` failed on exactly the twelve before the fix. `design-system-lint.test.ts` failed 10 of 10 positive cases against the old `eslint.config.js`. Both pass after. The widened lint flagged the same eleven colour classes and nothing else in `src/`.
- Contrast on the live palette (`/api/public/content`, version 31: primary `#338316`, secondary `#C32C14`, background `#010123`), each surface at its lightest. Table rows are the page, the section's 3% rust glow, the card's 3% ink, and a hovered row's 4% rust. Low 5.28:1, Medium 14.29, warning 9.84, danger 5.01, info 8.81, success 8.28. Modal fields: cost 10.88, danger 5.25, the rest higher. Eyebrow 11.24 on the panel. Spinner segment 4.27:1 on the page and 4.07 on the map card, against a 3:1 bar. Palette B is now the default in `tokens.css`, so these hold before the theme loads too.
- `site-built`, built with `CMS_URL` so version 31 was baked, at 1440 and 375px. On `/demos/omnigrid` the table's eight tones compute to the status colours and white at 50%, and the shipment modal has a 28px radius, the hairline, a mono rust eyebrow and the 30px display heading. On `/demos/filtergraph` the product modal's scrim computes black at 80%. The two spinners were rendered from their source markup in place, because the chunks load locally before a screenshot can catch them. Their top border computes `rgb(51, 131, 22)`. Console empty, and no sideways scroll at 375.
- On the merged tree: `npx tsc --noEmit`, `npm run lint`, `npm test` (383), `npm run build`, `npm run size:check` (JS 362.4 of 363 KB, 117.9 of 119 KB gzip), `npm run prerender:check` (11 routes).

## Left

- At 375px the shipment modal's tracking timeline needs 344px and has 293px, so "Delivered" is clipped. It was like this before, with or without the new border.
- `scrollbar-thin` in `TerminalFooter` compiles to nothing. It isn't a colour, so the test's prefixes don't reach it.
