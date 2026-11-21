# The chosen state in the widgets paints in the secondary colour

- **Found:** 2026-11-22, by the S9 session, while measuring the new palette
- **Where:** `src/components/ui/selection.ts`, used by `ProofWidget` (activity) and `AIMerchWidget` (product type, size)
- **Fixed:** 2026-11-22, a side session started from S9. Code only: no migration, no production step, no copy

## Cause

`CHOSEN` was `border-cyan-500 bg-cyan-500/10 text-cyan-400`, and `UNCHOSEN` was `border-white/10 text-white/40 …`. None of the seven classes compiled. `tokens.css` resets Tailwind's palette with `--color-*: initial`, puts the physical `--color-cyan-*` scale on `:root` only, and exposes it to utilities through the `secondary-*` role. That is by design (`docs/DESIGN_SYSTEM.md`: "no component uses them"). The lint enforces it, but only inside a `className` attribute, and these classes sit in a constant. So the buttons fell back to the body colour and to the `currentColor` border from preflight. On the live site the chosen "Squats" computes `color` and `border-color` as `rgb(224, 224, 224)`, like its neighbours.

## Fix

- `CHOSEN` is `border-secondary-500 bg-secondary-500/10 text-secondary-400`. The role is `@theme inline` over `--color-cyan-*`, so the built rule is `border-color: var(--color-cyan-500)` and it follows the theme. Token names are unchanged (D5).
- `UNCHOSEN` is `border-tertiary-ink/10 text-tertiary-ink/55 hover:border-tertiary-ink/20 hover:text-tertiary-ink/70`. The text is at /55, the site's usual muted tone, not the /40 that was written, because ink/40 is 3.81:1 on the card.
- The Proof activity icon (`SQ`, `PU`…) lost its `opacity-60`. It multiplied the label's alpha down to 3.00:1 unchosen and 4.46:1 chosen. Now it matches the label.
- Putting `cyan` into `@theme` instead would have made the three original classes compile, but it reopens the physical names the design system keeps out of classes, and the lint would still reject them in a `className`.

## Verified

- `src/components/ui/__tests__/selection.test.ts` compiles `src/index.css` with Tailwind's own `compile` and checks that every class in `CHOSEN` and `UNCHOSEN` produces a rule, and that the chosen rules read `--color-cyan-500` and `--color-cyan-400`. It failed 8 of 8 before the fix and passes after.
- The built `dist/assets/index-*.css` has all seven role classes, and no `cyan-*` utility.
- Contrast on the live palette (`/api/public/content`, version 30: secondary `#22d3ee`, cyan-400 `#69e1f3`, background `#0a0a1a`), with the card lit at its lightest (page, ink 3%, ink 2%): chosen text on its tint 9.66:1, border on the card 9.87:1, unchosen text 6.09:1. On S9's palette from 0038 (`#C32C14` on `#010123`, derived with `deriveThemeTokens`): 5.40:1, 3.30:1 and 6.15:1.
- `site-built` at 1440 and 375 px, on `/work/proof` and `/demos/merchforge`: chosen buttons compute `rgb(105, 225, 243)` text and `rgb(34, 211, 238)` border, the choice moves on click, no sideways scroll, and the console is empty.
- Lighthouse 13.6.0 accessibility: `/work/proof` 100. `/demos/merchforge` 94, from `button-name` on the Premium switch, which this change doesn't touch. Lighthouse can't check contrast over the card's gradient, so the ratios above were computed.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (367), `npm run build`, `npm run size:check`, `npm run prerender:check`, and the CMS's typecheck, tests (92) and build, because a comment in `packages/content-schema` changed.
