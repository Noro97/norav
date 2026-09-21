# Portfolio kit

The sections from the `Noro97/portfolio` project, imported whole. Fifty-three of
them, placeable from the CMS as the `portfolio_section` block.

The ones not yet promoted are kept as they arrived — `.jsx`, semantic class
names, their own copy — so that re-syncing from the source project stays a copy
rather than a merge. A promoted section is no longer a copy: its text has been
lifted into a schema and its header now comes from `section-head.jsx` here, so a
re-sync overwrites it and the promotion has to be redone. Promote a section
only once you mean to own it.

The source project's barrels, its tweaks panel and its `reveal` helper did not
make the trip: `registry.tsx` and `blocks.tsx` import each section's file
directly, so nothing here read them. A re-sync copies section files, not the
glue around them.

## Two ways a section reaches a page

**Promoted** — the section has a block type of its own (`kit_faq`,
`kit_pricing`, …), a schema in `@norav/content-schema/blocks/kit`, and an
editable form. Creating one pre-fills the form with the copy the section
arrived with, so an editor rewrites rather than invents. The component reads
`content` and falls back to its own `DEFAULTS` for anything left blank.

**Not yet promoted** — the section is only reachable through the
`portfolio_section` block, which can place it and colour it but cannot edit a
word of it. That block is tier 2 for exactly that reason.

Sections move from the second list to the first a folder at a time. Promoting
one means: lift its literals into an exported `DEFAULTS`, have it read `content`
through `withDefaults`, write its schema with `defineKitBlock`, register it in
`BLOCK_REGISTRY` and in `BLOCK_COMPONENTS` via `defineKitSection`, and add its
name to `PROMOTED` in `portfolio-section.ts` so it leaves the old dropdown. It
stays in that block's enum, so a block someone already placed keeps working.

## The palette is this site's, not the one that came with them

The kit paints from thirteen custom properties and nothing else, which is what
makes it themeable at all: repoint those and all fifty-three sections follow with
no component touched. So the port replaces the imported palette — a warm oklch
dark, its own serif, its own accent — with this site's `--color-*` and
`--font-family-*` tokens. Those are written onto `:root` at runtime by
`applyTheme`, so changing the accent or background in the CMS moves these
sections with the rest of the site.

The one value that is not CSS is the `accent` prop the sections take for their
inline highlights. `PortfolioSection` reads it back off the page with
`useThemeColor`, so it follows the theme too; the block's `accent` setting is an
override for a section that should stand apart, and empty means "the site's".

## Two things were changed on the way in

The source stylesheet was written to be the only one on the page: it styled
`body`, parked its palette on `:root`, and named keyframes `spin` and `pulse`,
which are Tailwind's. `scripts/port-portfolio-kit-css.mjs` moves every rule under
`.pf-kit` — the wrapper `PortfolioSection` renders — and prefixes every keyframe
`pfk-`. Its output, `src/styles/portfolio-kit.css`, is generated and committed;
edit the script, never the CSS.

Two more stylesheets load after it, in this order. `portfolio-kit-laptop.css`
is generated from it by `scripts/scale-portfolio-kit-for-laptop.mjs` — the kit
was designed on a large display, and under 1536px every type size of 20px and
up and every spacing of 32px and up is scaled to 0.8; re-run the script after
a re-sync. `portfolio-kit-mobile.css` is hand-written: what this site adds to
the kit under its 720px breakpoint lives there, never in the generated files.

`'use client'` directives were dropped (Vite has no use for them, and Rollup
warns on each).

The stylesheet is imported by `KitFrame`, which every section reaches through a
`lazy()` boundary. That placement is load-bearing: imported anywhere in the
eager graph, its 92 kB lands in the entry bundle and every page pays for it,
including the ones with no kit section on them.

## Re-syncing

0. Note which sections have been promoted (`BLOCK_REGISTRY`, the `kit_*` types).
   A straight copy overwrites them; re-apply the promotion afterwards, or copy
   only the sections that have not been promoted.
1. Copy `src/components/{sections,tweaks,ui/reveal.tsx}` and `src/types/index.ts`
   (as `types.ts`) over this directory, then strip `'use client'` and repoint the
   `@/types` import in `sections/index.ts`.
2. `node scripts/port-portfolio-kit-css.mjs <path>/src/app/globals.css`. It
   re-applies the palette mapping and reports any inline
   `style={{ animation: … }}` still naming an unprefixed keyframe; fix those by
   hand. If the source gained a custom property, add it to `THEME` in the script
   — one it does not know stays at the imported value and will not follow the
   site.
3. If sections were added or removed, update `registry.tsx` here and
   `PORTFOLIO_SECTION_OPTIONS` in
   `packages/content-schema/src/blocks/portfolio-section.ts`. `registry.test.ts`
   fails until the two agree.
