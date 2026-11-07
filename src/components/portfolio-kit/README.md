# Portfolio kit

Six sections kept from the `Noro97/portfolio` project: process, FAQ, compare table, tool stack, CTA banner and writing. S4 deleted the rest. None of the six is on a published page yet. S5 places them.

Each has its own block type (`kit_process`, `kit_faq`, ...), a schema in `@norav/content-schema/blocks/kit` and an editable form. Creating one pre-fills the form with the copy the section arrived with, so an editor rewrites it rather than starting empty. The component reads `content` and falls back to its own `DEFAULTS` for anything left blank.

## The stylesheet

- `src/styles/portfolio-kit.css` holds the sections' rules, scoped to `.pf-kit`, with keyframes prefixed `pfk-`. Edit it by hand. Its sizes come from the site's type scale, and `__tests__/type-scale.test.ts` holds that.
- `src/styles/portfolio-kit-laptop.css` is generated from it by `scripts/scale-portfolio-kit-for-laptop.mjs`.
- `src/styles/portfolio-kit-mobile.css` is written by hand and loads last.

`KitFrame.tsx` imports all three, and is only reached through a lazy boundary, so a page with no kit section loads none of it.

The kit paints from custom properties on `.pf-kit` that point at the site's tokens, so it follows the published theme.
