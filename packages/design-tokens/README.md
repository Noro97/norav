# @norav/design-tokens

The design system as a file. `tokens.json` is the single source of truth —
colours, typography, spacing, breakpoints, radii, and the responsive variants
of the ones that change with the viewport. Everything else is generated from
it:

```
tokens.json                 ← the only file a person edits
  │  npm run tokens
  ├─► src/tokens.css        ← what the site's stylesheet imports: the palette on :root,
  │                            the Tailwind @theme blocks, the intent aliases, the media queries
  └─► src/index.ts          ← the same tokens for TypeScript: tokens, tokenNames, defaults
```

A test regenerates both and compares them to what is committed, so they cannot
drift from the JSON. Edit the JSON, run `npm run tokens`, commit all three.

## Names

`[category]-[property]-[variant][-tier]`, everywhere:

| Category | Examples |
| --- | --- |
| `color` | `color-text-primary`, `color-background-accent-subtle`, `color-border-focus`, `color-interactive-hover`, `color-status-danger`, `color-primary-500`, `color-tertiary-ink` |
| `typography` | `typography-heading-large-font-size`, `typography-heading-large-font-size-tablet`, `typography-body-regular-line-height`, `typography-label-letter-spacing` |
| `spacing` | `spacing-md`, `spacing-gutter-x`, `spacing-gutter-x-desktop`, `spacing-section-y-mobile` |
| `breakpoint` | `breakpoint-md` (768px), `breakpoint-lg` (1024px) |
| `radius` | `radius-2xl` |

Tiers: **mobile** is below `md`, **tablet** is `md` to `lg`, **desktop** is `lg`
and up. A token without a tier suffix is the live one — it switches at those
boundaries on its own.

The same token has one spelling per language:

| Where | Spelling | Example |
| --- | --- | --- |
| a Tailwind class | the role, Tailwind's prefix | `text-tertiary-fg` · `bg-primary-500/10` · `text-heading-large` · `px-gutter-x` |
| CSS | the custom property | `color: var(--color-text-primary)` |
| TypeScript | the `tokens` tree | `tokens.color.text.primary` |

The class spelling is the role (`tertiary-fg`), the CSS/TS spelling is the
intent (`text-primary`): the intent tokens are aliases onto the roles, so they
are one value under two names, and a theme change in the CMS repaints both.

## Using them

### In a Tailwind class — the default

```tsx
<h2 className="font-display text-heading-large font-black text-tertiary-ink">
<p className="text-body-regular text-tertiary-ink/60">
<span className="type-label text-tertiary-ink/40">Status</span>
<section className="px-gutter-x py-24">           // gutter follows the tier by itself
<div className="rounded-2xl border border-tertiary-line bg-tertiary-card p-card-padding">
<button className="bg-primary-500 hover:bg-primary-400 active:bg-primary-600 text-primary-fg">
<span className="bg-status-success/20 text-status-success">Delivered</span>
```

`md:` and `lg:` in a class are `breakpoint-md` and `breakpoint-lg`; use them
for layout, and the tiered tokens for size and space.

### In CSS

```css
.panel {
  background: var(--color-background-surface);
  border: 1px solid var(--color-border-default);
  padding: var(--spacing-card-padding);           /* 24px → 32px at md */
  color: var(--color-text-primary);
}
.panel h3 {
  font: var(--typography-heading-small-font-weight) var(--typography-heading-small-font-size) /
        var(--typography-heading-small-line-height) var(--typography-heading-small-font-family);
  letter-spacing: var(--typography-heading-small-letter-spacing);
}
.panel:hover { border-color: var(--color-border-accent); }
.panel[aria-disabled="true"] {
  color: var(--color-text-disabled);
  background: var(--color-background-disabled);
}
```

Responsive by hand, when a token has no live variable of its own:

```css
.hero { padding-block: var(--spacing-section-y-mobile); }
@media (min-width: 768px)  { .hero { padding-block: var(--spacing-section-y-tablet); } }
@media (min-width: 1024px) { .hero { padding-block: var(--spacing-section-y-desktop); } }
```

### In TypeScript — style objects, canvas, three.js, SVG

```ts
import { tokens, tokenNames, defaults, mediaQuery } from '@norav/design-tokens'
import { readToken } from '@/content/theme'

// A style object: the var() string is the value, and it follows the theme.
<div style={{ color: tokens.color.text.secondary, padding: tokens.spacing.cardPadding.css }} />

// A number for a canvas: read the token, with its default for the first frame.
ctx.strokeStyle = readToken(tokenNames.color.primary[500], defaults[tokenNames.color.primary[500]]!)

// A resolved size for layout maths, per tier.
const { mobile, tablet, desktop } = tokens.typography.heading.large.fontSizeAt   // '36px' '43px' '58.4px'
const tier = matchMedia(mediaQuery.desktop).matches ? 'desktop' : matchMedia(mediaQuery.tablet).matches ? 'tablet' : 'mobile'
const gutter = tokens.spacing.gutterX[tier]

// An SVG attribute: the variable works as it does in CSS.
<text fill={tokens.color.text.tertiary} fontFamily={tokens.typography.fontFamily.mono} />
```

`tokens` leaves are `var(--…)` strings; `tokenNames` leaves are the variable
names, for `readToken` / `useThemeColor`; `defaults` maps a variable name to
the value it has before the CMS theme arrives. Colours resolve at runtime —
the CMS repaints the physical palette every role aliases — so the default is
only for the render before there is a DOM.

## Adding a token

1. Add it to `tokens.json`. A colour is an alias onto a role (`"{color.primary.500}"`),
   with `"$extensions": { "norav.alpha": 0.1 }` for a tint. A size that should
   change with the viewport is `{ "mobile", "tablet", "desktop" }`; a fluid type
   size is a `clamp()` and the tiers are computed.
2. `npm run tokens`.
3. Use it. If it is a colour a class should reach, it is a role or a status —
   the intent names are for CSS and code.

What does not belong here: a hex that is content (a product's garment colour)
or a third-party brand mark. Those live in the component, behind a comment.
