# Design system

Three colour roles, one type scale, and a lint rule that says so. Everything a
component on this site paints or sets type with is a name from this page.

The system lives in two files: `src/index.css` (the tokens and the two `@theme`
blocks) and `eslint.config.js` (the rules that keep components inside it).
`packages/content-schema/src/theme.ts` is where the CMS derives the palette
the tokens alias — see [How a colour reaches the screen](#how-a-colour-reaches-the-screen).

## Colour

### The three roles

| Role | Token | Default | What it is for |
| --- | --- | --- | --- |
| **Primary** | `primary-{50…900}`, `primary-fg` | `#B51A2B` at 500 (the CMS accent) | The brand, and the one colour of emphasis on a view: the active nav item, the primary button, the highlighted word in a heading, the glow behind a card, the section eyebrow. Once per view. |
| **Secondary** | `secondary-{50…900}` | `#22d3ee` at 500 (the CMS second accent) | The supporting accent: the case studies and the interactive widgets, a second thing that wants attention beside a primary one. Also the *categorical* colour — a tag, a chart series, a node type, a syntax token — where the old code reached for a random Tailwind hue. |
| **Tertiary** | `tertiary-bg` · `tertiary-card` · `tertiary-raised` · `tertiary-fg` · `tertiary-muted` · `tertiary-line` · `tertiary-line-soft` · `tertiary-ink` · `tertiary-shade` | derived from the CMS background (`#0a0a1a`) | The neutral role: every surface, every hairline, every tone of text that is not an accent, every disabled state. Named by what it is for, not by a step, because the same name is white on a dark theme and black on a light one. |

Each accent role is a ten-step scale, 500 being the colour the owner typed in
the CMS and the rest a ramp derived from it. Steps to reach for:

| Step | Use |
| --- | --- |
| 300 | a light tint of the accent on text — a number, a highlighted token |
| 400 | accent text and icons on dark surfaces (the readable step) |
| 500 | fills, borders, glows — the accent itself |
| 700–900 | deep tints behind content (`from-primary-900/40`) |

The tertiary names, from back to front:

| Token | Default (dark) | Use |
| --- | --- | --- |
| `tertiary-bg` | `#0a0a1a` | the page |
| `tertiary-card` | `#0d0d1f` | a card on it |
| `tertiary-raised` | `#1a1a2e` | a panel above that |
| `tertiary-line` | 8 % ink | hairline borders |
| `tertiary-line-soft` | 6 % ink | input borders, dividers inside a card |
| `tertiary-fg` | `#e0e0e0` | body text |
| `tertiary-muted` | `#888888` | secondary text |
| `tertiary-ink` | `#ffffff` | **the pole.** Every neutral alpha is mixed from it: `text-tertiary-ink/40` is 40 % text, `bg-tertiary-ink/[0.03]` a surface tint, `border-tertiary-ink/10` a hairline. On a light theme the same classes mix from black. |
| `tertiary-shade` | `#000000` | the other pole, and it does not flip: modal scrims, code panels, anything that must be dark on any theme. |

### Status — the one set outside the roles

| Token | Value | Use |
| --- | --- | --- |
| `status-success` | `#22c55e` | delivered, verified, in stock, available, done |
| `status-warning` | `#eab308` | pending, running, low stock, stale |
| `status-danger` | `#ef4444` | delayed, out of stock, failed |
| `status-info` | `#38bdf8` | in transit, informational |

These carry meaning, not brand: a delayed shipment is red whatever accent the
owner chose. They are for **state a reader has to read correctly** and for
nothing else. A window-chrome dot, a category tint, a diagram node, a syntax
token, a star icon — none of these is a state, and all of them were status
colours before this pass. They are roles now.

> The brief for this pass asked for exactly three colours. Status is kept as a
> deliberate, fenced exception because collapsing it into the roles would make
> a shipment table lie — "Delayed" in the brand colour reads as emphasis, not
> as a problem. Four tokens, one job, never decoration.

### What is not a colour

Two kinds of hex are allowed to remain in a component, each behind an
`eslint-disable` comment that says why:

- **Third-party brand marks** — GitHub, LinkedIn and Telegram icons in their
  own colours, the "open in Telegram" button. `AboutHero.tsx`, `ProofWidget.tsx`.
- **Content** — the five garment colours a product comes in. `AIMerchWidget.tsx`.

A `readToken('--color-…', '#fallback')` call is not a hex in a component: the
fallback is the token's own default, for the one render before the DOM exists.

### How a colour reaches the screen

```
CMS: accent, secondary, background
        │  deriveThemeTokens()  (packages/content-schema/src/theme.ts)
        ▼
physical palette on :root      --color-crimson-*  --color-cyan-*  --color-background
                               --color-card  --color-foreground  --color-ink  …
        │  @theme inline        (src/index.css)
        ▼
semantic roles                 primary-*  secondary-*  tertiary-*  status-*
        │  Tailwind
        ▼
utilities in components        bg-primary-500/10  text-tertiary-ink/40  …
```

The physical names are an implementation detail. A snapshot published last
year carries them, so they cannot change — and **no component uses them**.
The roles are `@theme inline` aliases onto them, so a theme change in the CMS
repaints every role without a component knowing. Tailwind's own palette is
removed with `--color-*: initial`: `bg-emerald-500` and `text-white` do not
compile here.

## Typography

### Families

| Utility | Token | Face | For |
| --- | --- | --- | --- |
| `font-display` | `--font-display` | Inter Tight (900 only) | display sizes — headings |
| `font-sans` | `--font-sans` | Inter | body — the default on `body` |
| `font-mono` | `--font-mono` | JetBrains Mono | labels, numbers, code, anything tabular |

Before this pass `font-mono` compiled to Tailwind's Menlo stack — the token was
defined under a name Tailwind does not read — so 240 uses rendered in the
system monospace while `.label-mono` and the SVG text rendered in JetBrains
Mono. `font-display` compiled to nothing at all.

### Weights

Four. `--font-weight-*: initial` removes the rest.

| Utility | Weight | Use |
| --- | --- | --- |
| `font-normal` | 400 | body |
| `font-medium` | 500 | labels, emphasis inside body text |
| `font-semibold` | 600 | UI — buttons, table cells, card titles at body sizes |
| `font-black` | 900 | display sizes, and the big mono numbers |

There is no 700: it read as a second, softer headline next to the 900 display
face. What was `font-bold` on a heading is `font-black`; on body text it is
`font-semibold`.

### Scale

Fluid, `clamp()`-based, one leading and one tracking per size — tracking
tightens and leading closes as the size grows, never one value for all.

| Utility | Size | Leading | Tracking | Family | Use |
| --- | --- | --- | --- | --- | --- |
| `text-display-2xl` | 56 → 112 px | 0.98 | −0.03em | display | the hero name |
| `text-display-xl` | 44 → 80 px | 1.02 | −0.02em | display | a page title |
| `text-display-lg` | 36 → 60 px | 1.05 | −0.015em | display | **the section heading** |
| `text-display-md` | 28 → 44 px | 1.1 | −0.01em | display | a sub-heading, a big number |
| `text-display-sm` | 22 → 30 px | 1.2 | −0.01em | display | a card title, a metric |
| `text-body-lg` | 17 → 20 px | 1.6 | 0 | sans | lead paragraphs |
| `text-body-md` | 16 px | 1.6 | 0 | sans | body |
| `text-body-sm` | 14 px | 1.55 | 0 | sans | dense UI, table cells |
| `text-body-xs` | 12 px | 1.5 | 0 | sans | captions, badges |
| `text-label` | 11.2 px | 1.4 | 0.2em | mono | see `type-label` |

Display sizes carry their own leading and tracking; do not add `leading-tight`
or `tracking-tight` next to them — the migration stripped 30 of those.
Tailwind's `text-xs…text-9xl` and any `text-[11px]` are removed and linted.

### Type roles

Two named combinations, so a component says what a run of text *is*:

```
type-label   font-mono · text-label · uppercase · tracking 0.2em · medium — no colour
label-mono   type-label in primary-500 — the section eyebrow
```

`type-label` replaced 71 copies of `font-mono text-xs uppercase tracking-wider`.
Give it a tone: `type-label text-tertiary-ink/40` for a table header,
`type-label text-secondary-400` for a badge on a widget.

## Radius, spacing

Unchanged by this pass and already consistent: `rounded-full` for pills and
dots, `rounded-lg` (12 px) for inputs and small tiles, `rounded-xl` (20 px)
for icon wells, `rounded-2xl` (28 px) for cards. Spacing is Tailwind's 4 px
scale.

## Refactored examples

The section heading — the idiom that appeared thirteen times, three ways:

```tsx
// before
<h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
// after
<h2 className="font-display text-display-lg font-black text-tertiary-ink mt-3 mb-4">
```

A card surface:

```tsx
// before
<div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent
                hover:border-crimson-500/20 hover:shadow-[0_0_40px_-12px_color-mix(in_srgb,var(--color-crimson-500)_15%,transparent)]">
// after
<div className="rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent
                hover:border-primary-500/20 hover:shadow-[0_0_40px_-12px_color-mix(in_srgb,var(--color-primary-500)_15%,transparent)]">
```

A label and a status badge:

```tsx
// before
<span className="font-mono text-xs text-white/40 uppercase tracking-wider">Status</span>
<span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Fresh</span>
// after
<span className="type-label text-tertiary-ink/40">Status</span>
<span className="bg-status-success/20 text-status-success border border-status-success/30">Fresh</span>
```

A categorical colour that was a status colour by accident:

```tsx
// before — four categories, four Tailwind hues, none of them the brand's
Electronics: 'from-blue-900/40 to-blue-800/10',
Sports:      'from-emerald-900/40 to-emerald-800/10',
// after — the two accents and the neutral; the difference is the hue, not a fourth colour
Electronics: 'from-secondary-900/60 to-secondary-800/10',
Sports:      'from-secondary-700/40 to-secondary-900/10',
```

Where a class cannot reach — canvas, WebGL, SVG attributes, a library that
wants a resolved colour:

```tsx
fill="var(--color-tertiary-ink)"                       // SVG: the variable is fine
fontFamily="var(--font-mono)"
<pointLight color={readToken('--color-ink', '#ffffff')} />   // three.js: resolved, re-read on theme change
```

## Building a new component

1. **Colour is a role, never a value.** Ask what the thing *is*: brand emphasis
   → `primary`; supporting or categorical → `secondary`; surface, text, line,
   disabled → `tertiary`; a state the reader must read → `status`. If none
   fits, it is `tertiary`.
2. **Neutral alphas mix from ink.** `text-tertiary-ink/60`, not `text-white/60`
   — the former follows a light theme, the latter vanishes on it.
3. **One primary per view.** If two things are primary, one of them is
   secondary.
4. **Status is not decoration.** Green because it is *done*, never because
   green looks nice next to the amber one.
5. **Size from the scale, family from the size.** Display sizes take
   `font-display font-black`; body sizes take the default `font-sans`;
   numbers and labels take `font-mono`. Never `leading-*` or `tracking-*`
   next to a display size.
6. **Labels are `type-label`** plus a tone. Not five utilities.
7. **No hex, no font name.** In a class, a style object or an SVG attribute.
   The two exceptions above are the whole list; a third needs a comment that
   explains why it is content, not palette.
8. **Read the token where a class cannot reach.** `readToken` /
   `useThemeColor` from `@/content/theme` for canvas and three.js.

`npm run lint` enforces 1, 2, 5, 6 and 7: an off-system class, size, weight,
hex or font name is an error with the rule to follow in the message. The
stylesheet enforces the rest by omission — a class that is not in the system
compiles to nothing.

## What this pass changed

- 968 colour utilities moved onto the roles: 573 tertiary, 207 primary, 84
  secondary, 51 status. Seven Tailwind hues (`emerald`, `green`, `amber`,
  `yellow`, `red`, `sky`, `blue`, `violet`) and the gold scale are gone.
- `white` and `black` — 533 uses — became `tertiary-ink` and `tertiary-shade`,
  which is what makes a light theme possible at all.
- 40 hex literals in components became tokens, except the seven that are
  brand marks or content.
- `font-mono` renders JetBrains Mono for the first time; `font-display` renders
  at all. 13 section headings that were set three different ways are one.
- 260 raw Tailwind sizes became the scale; 71 label idioms became `type-label`.

Not touched: `src/components/portfolio-kit/**` and `src/styles/portfolio-kit.css`.
The kit is imported verbatim for re-sync and paints from the physical tokens
through its own thirteen variables, so it follows the theme already; it is
not held to the roles until a section is promoted.
