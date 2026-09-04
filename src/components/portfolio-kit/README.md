# Portfolio kit

The sections from the `Noro97/portfolio` project, imported whole. Fifty-three of
them, placeable from the CMS as the `portfolio_section` block.

They are kept as they arrived — `.jsx`, semantic class names, their own copy —
so that re-syncing from the source project stays a copy rather than a merge.
`sections/index.ts` and `tweaks/index.ts` are the source project's own typed
barrels and give the rest of this repo a checked surface over them.

## What the CMS owns

Which section, where on the page, and in what accent. Not the words inside it:
each section arrived with its text baked in, and fifty-three different shapes
would have meant fifty-three schemas — a rewrite, not an import. So the block is
tier 2, like the case-study widgets: placement is content, the insides are code.

A section worth keeping is worth promoting later — lift its copy into a schema of
its own and it becomes an ordinary tier-1 block.

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

`'use client'` directives were dropped (Vite has no use for them, and Rollup
warns on each).

## Re-syncing

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
