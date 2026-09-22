# Site redesign — one story, one page, five live demos

Design for the September 2026 rebuild of norav.dev. Approved in conversation on
2026-09-22; the audit, the full copy and the SVG prompts live in the brief at
<https://claude.ai/artifact/Jn3Se1kLhN6vToytzj9DvT>. This document is the
engineering contract: what changes in the content model, the migrations, the
code, and in what order.

## Summary

Production serves snapshot v25: eight pages, a hollow home, four ambient
background layers, entrance animations that keep every page unreadable for
4–11 seconds, and skill percentage bars. The September 21 plan (migrations
0016–0026, PRs #70–#80) added a recruiter card, testimonials, a writing page and
placed the imported kit sections across the subpages — additively, keeping the
eight-page skeleton. It is merged to `main` and applied to the local database
(version 40), not to production.

This rebuild goes further and supersedes parts of that plan:

- **Twelve routes become eight.** The home page carries the whole pitch; five
  case-study pages carry the evidence; About carries the answers. Experience,
  Skills, Work, Automation and Contact pages are removed (301 → home anchors).
- **The ambient layer is cut.** No three.js, no constellation, no grid, no grain,
  no floating debug strings, no custom cursor, no magnetic buttons, no scramble
  text. Entrance motion is a 300 ms fade, and nothing above the fold starts
  invisible.
- **The five case-study widgets are the signature.** Everything else is still.
- **The kit shrinks to six sections.** ~47 imported sections and the
  `portfolio_section` block are deleted.
- **Copy is rewritten** to one label ("frontend-focused fullstack engineer") and
  one thesis ("Interfaces at scale, and the systems under them"), in the README
  register. Every number carries its source.

Approach: rebuild inside the existing architecture. The CMS, the snapshot
pipeline, the design tokens, the block registry and the widgets stay. Content
moves by numbered migration (0027+), exactly as 0016–0026 did.

## Decisions (Norayr, 2026-09-22)

| Decision | Choice |
| --- | --- |
| Goal | Hybrid: senior/staff roles first, contract work as a secondary door |
| Tone | Quiet confidence, one signature flourish |
| Flourish | The live case-study widgets; the terminal becomes a footer easter egg |
| Structure | Long home + 5 case studies + About (+ Writing when posts exist) |
| Kit | Keep `kit_process`, `kit_faq`, `kit_compare_table`, `kit_tool_stack`, `kit_cta_banner`, `kit_writing`; delete the rest |
| Russian | Kept; translated last |
| Employer 2024–25 | MTS Web Services (the AI prompt's "BlazeIT" is a bug) |
| Numbers | 10M+ MAU · 50K+ events/s across 18 hubs · −70% scripting / 60 FPS · 92% coverage, 27 migrations. "42 KB bundle" and "sub-millisecond" are dropped |
| Material coming | 2–3 real testimonials, 1–2 posts. No press/awards/talks |
| Location | Remote from Yerevan (GMT+4), full EU overlap, working US-East overlap, relocation possible |
| Palette | v40's crimson `#B51A2B` / cyan `#22d3ee` on `#0a0a1a`; cyan only for "live" states inside widgets |

### What this supersedes from the September 21 plan

| Migration / PR | What it did | Now |
| --- | --- | --- |
| 0016 `recruiter_cta` (#70) | Card on home with role target + 3 proof points | **Removed.** The hero carries the target and the proof strip the points. Block type deleted; row soft-deleted |
| 0017 case-study decisions (#71) | Filled the five `*_detail` blocks, EN+RU | **Kept and extended.** The schema gains context / problem / retro; the copy is revised per the brief |
| 0018 testimonials (#72) | Placeholders on `work` | **Moved to home**, hidden until two real quotes exist |
| 0019 founder story (#73) | `vibecoding` hidden; `cta_banner` on `experience` | `vibecoding` row soft-deleted with its type; the `cta_banner` goes with the experience page |
| 0020 writing page (#74) | `/writing` with `kit_writing` placeholders | **Kept.** Nav item hidden until a post is real |
| 0021 skills `provenIn` (#75) | Proficiency provenance per skill | **Dropped with the `skills` block.** The tool stack and the compare table replace it |
| 0022 hero/about voice (#76) | Copy | **Superseded** by the brief's copy |
| 0023 footer + contact page (#77) | `site_footer` on `site`; `/contact` with `kit_cta_banner` + the terminal | `site_footer` kept and extended. `/contact` removed; the terminal returns to `site`, hidden behind a footer toggle |
| 0024 illustrations (#78) | Generated SVGs in `public/assets/illustrations/` | **Kept** as the source for case-study covers until the §5 assets exist |
| 0025 home + about (#79) | `kit_big_marquee`, `kit_services` on home; `kit_process`, `kit_tool_stack`, `kit_faq` on about | Marquee and services deleted. Process moves to home; tool stack and FAQ stay on About |
| 0026 work/skills/experience (#80) | `kit_stats_marquee`, `kit_show_reel`, `kit_visual_feed`, `kit_press`, `kit_awards` on work; `kit_compare_table` on skills; `kit_timeline` on experience | All deleted except the compare table, which moves to About |

## Goals

1. A screener reaches "what, at what level, what proof, how to contact" in one
   viewport of the home page.
2. Every page is readable the moment it paints. LCP ≤ 1.5 s on simulated 4G;
   main chunk ≤ 150 KB gzipped; no three.js anywhere.
3. One label, one thesis, one set of numbers — identical on the site, in the
   CV, in the terminal's AI prompt.
4. The five widgets run exactly as they do today, on pages that explain the
   decisions behind them.
5. Nothing that ships is a placeholder. A block with no real content hides.

## Non-goals

- A new frontend, a new CMS, or a change to the token names in
  `packages/design-tokens/tokens.json`.
- A light theme, a blog taxonomy, RSS, a pricing or services page, analytics.
- Touching production content from a development machine. Step 9 below is
  Norayr's.
- Redesigning the five widgets.

## Architecture — what stays

Everything in the root README's "How a page reaches the screen" section is
unchanged: CMS edit → publish → immutable snapshot → baked by `prebuild` →
revalidated by checksum at idle → previews via `#preview=`. `BlockRenderer`,
`BLOCK_COMPONENTS`, `BLOCK_REGISTRY`, `PageHead`, the sitemap generator, the
`/api/chat` edge handler and the i18n split (CMS for copy, `src/i18n` for
chrome) all stay.

Content changes are numbered SQL migrations in `db/migrations/`, idempotent and
guarded, applied to the local PGlite by `dev:local` on boot. The committed
snapshots under `src/content` are **never** pulled from the local database; they
track production and are refreshed in step 9.

## Pages

| Route | Blocks, in order | Notes |
| --- | --- | --- |
| `/` | hero · proof_strip · work_index · capabilities · kit_process · experience (compact) · testimonials · kit_writing · contact_cta | testimonials and kit_writing hidden until real |
| `/about` | about · kit_compare_table · experience (full) · kit_tool_stack · kit_faq · contact_cta | FAQ has anchor `faq` |
| `/work/nexusroute` | logistics · logistics_detail · case_study_next | was `work/logistics` |
| `/work/omnigrid` | omnigrid · omnigrid_detail · case_study_next | unchanged slug |
| `/work/filtergraph` | ecommerce · ecommerce_detail · case_study_next | was `work/ecommerce` |
| `/work/merchforge` | merch · merch_detail · case_study_next | was `work/merch` |
| `/work/proof` | proof · proof_detail · case_study_next | unchanged slug |
| `/writing` | kit_writing | page hidden from nav until a post is real |
| `/site` | site_footer · terminal_footer | terminal hidden behind the footer toggle |

Removed pages: `experience`, `skills`, `work`, `automation`, `contact`, `test`.
Their rows are soft-deleted (`deleted_at`), not dropped. `vercel.json` gains
301s: `/experience → /#experience`, `/skills → /#capabilities`,
`/work → /#work`, `/automation → /#capabilities`, `/contact → /#contact`, and
the three slug renames with their `/ru/` twins.

Navigation collection: Work (`home#work`) · About (`about`) · Writing
(`writing`, hidden until a post exists) · Email (external `mailto:`). The
language toggle stays in the nav chrome.

## Content model

Block schemas live in `packages/content-schema/src/blocks`. Changes:

### Revised

- **`hero`** — content: `eyebrow`, `headline` (rich text with one accent span,
  same shape as today's `tagline`), `sub`, `primaryLabel`, `secondaryLabel`,
  `availability`. settings: `primaryHref` (anchor), `secondaryHref`
  (`mailto:`). `showScrollHint` and `enableParticleBurst` removed. The name
  fields go: the headline is the thesis, the eyebrow carries the name.
- **`impact_strip` → `proof_strip`** — new type name; each stat gains
  `source: string.max(80)`. The old type is removed from both registries and
  its row soft-deleted; the migration inserts a `proof_strip` row in its place.
- **`experience`** — settings gain `compact: boolean` (default `false`).
  Compact renders six rows of period · company · role · one line and a link to
  `/about#experience`. The same collection feeds both. The block appears on two
  pages, so the definition drops `singleton: true` and `ExperienceTimeline`
  passes `blockId` to `useBlock`, as `Testimonials` already does — without
  that, `findBlock` returns the home page's compact row on About.
- **`capabilities`** — shape unchanged; copy only.
- **`contact_cta`** — content gains `secondaryLabel` (CV) and `tertiaryLabel`
  + `tertiaryHref` (FAQ link); settings gain `cvHref`. Placed on home and
  About, so it drops `singleton: true` and `ContactCTA` passes `blockId`. The
  About copy is the same block content; only the tertiary link differs (About
  points at `#faq` on its own page, home at `/about#faq`).
- **`site_footer`** — content gains `nowLine`, `colophon`, `terminalLabel`;
  settings gain `showTerminalToggle: boolean`.
- **`terminal_footer`** — settings gain `hiddenByDefault: boolean`. When true
  the section renders collapsed; the footer toggle and the backtick key open it.
- **The five `*_detail` types** — content gains `context` (≤ 600), `problem`
  (≤ 600), `retro` (≤ 400), `widgetCaption` (≤ 120). `decisions` stays at max 6
  (the brief uses 3). `metrics` stays. All optional, all default `''`, so the
  block hides rows it has no copy for, as it does today.

### New

- **`work_index`** — content: `sectionLabel`, `title`, `intro`, `cards[]` of
  `{ page: slug, title, oneLiner, didLine, outcomeLine, stack: [{name}] }`,
  `ctaLabel`. settings: none. The card's link is derived from `page` via
  `hrefFor`; the cover image is derived from the case-study page's header block
  (`settings.image` on the widget block, falling back to
  `/assets/illustrations/<slug>.svg`). Singleton, tier 1.
- **`case_study_next`** — no content; settings `{ next: slug }`. Renders "Next:
  <title of that page's header block> →". Five rows, one per study.

### Removed

Types deleted from `BLOCK_REGISTRY` and `BLOCK_COMPONENTS`, their rows
soft-deleted by migration **before** the code that removes the type merges
(publish validates every block against the registry, so an orphaned row would
refuse the next publish):

`vibecoding` · `tech_marquee` · `skills` · `projects_intro` · `bento_grid` ·
`workflow` · `recruiter_cta` · `gallery` · `metrics` · `cta_banner` (the native
one; `kit_cta_banner` stays) · `portfolio_section` · every `kit_*` except
`kit_process`, `kit_faq`, `kit_compare_table`, `kit_tool_stack`,
`kit_cta_banner`, `kit_writing`.

`settings.site` loses `grain`, `dynamicGrid`, `cursor`.

## Migrations

One per PR, numbered from 0027, each idempotent (guarded inserts, `WHERE
deleted_at IS NULL`, positions selected not assumed), each with a test block in
`db/tests/schema.test.mjs` at its own anchor. Content rows carry EN and RU;
until day 11 the RU row carries the English copy with a `[RU pending]` prefix
on the first field so nothing reads as translated when it is not.

| # | Name | What it does |
| --- | --- | --- |
| 0027 | `the_ambient_layer_is_gone` | `settings.site` drops `grain`, `dynamicGrid`, `cursor` |
| 0028 | `pages_that_are_now_anchors` | Soft-deletes `experience`, `skills`, `work`, `automation`, `contact`, `test` pages and their blocks; renames three case-study slugs; rewrites the navigation collection |
| 0029 | `the_home_page_carries_the_pitch` | Replaces `impact_strip` with `proof_strip`; inserts `work_index`; moves `kit_process` from about to home; moves `testimonials` and `kit_writing` (as a home section) onto home, hidden; inserts compact `experience`; rewrites hero, capabilities, contact copy |
| 0030 | `about_carries_the_answers` | Rewrites bio; moves `kit_compare_table` onto about; full `experience` on about; FAQ rows; tool-stack copy; soft-deletes `vibecoding`, `tech_marquee` |
| 0031 | `case_studies_say_why_in_full` | Extends the five `*_detail` rows with context / problem / retro / caption; inserts `case_study_next` rows |
| 0032 | `the_footer_and_the_terminal` | `site_footer` gains now / colophon / toggle; `terminal_footer` returns to `site`, hidden by default |
| 0033 | `what_nothing_places_any_more` | Soft-deletes every row of a removed block type (list above) |
| 0034 | `the_site_in_russian` | RU rows for everything 0029–0032 wrote |

0033 must merge before the PR that deletes the types from the registries.

## Code

### Removed

- `src/components/canvas/*` (R3F scene, shaders, `SceneController`, `HeroMonolith`)
- `src/components/ui/AnimatedGrain.tsx`, `DynamicGrid.tsx`,
  `FloatingArtifacts.tsx`, `MagneticButton.tsx`; `src/hooks/useAnimationLoop.ts`
  if nothing else reads it
- Sections for the removed types, and `src/components/portfolio-kit/sections/*`
  except the six kept; `scripts/port-portfolio-kit-css.mjs` regenerates
  `src/styles/portfolio-kit.css` from what remains
- Dependencies: `three`, `@types/three`, `@react-three/fiber`,
  `@react-three/drei`, `@splinetool/*`, `simplex-noise`, `canvas-confetti`,
  `@types/canvas-confetti` — after `grep` confirms no widget imports them.
  `framer-motion` and `gsap` stay (widgets and the 300 ms fades)
- The `three`, `spline` manual chunks in `vite.config.ts`

### Added or changed

- `src/components/sections/HeroSection.tsx` — static: eyebrow, headline,
  sub, two buttons, availability line. Stays in the entry chunk. A static SVG
  mark (brief §5, asset 01) replaces the monolith; the route-graph backdrop
  (asset 04) is an `<img>` at 12% opacity, `loading="eager"`, `decoding="async"`.
- `ProofStrip.tsx` (from `ImpactStrip`): counters run once, ≤ 800 ms, from
  value × 0.8, only when in view; static under reduced motion.
- `WorkIndex.tsx`, `CaseStudyNext.tsx` — new.
- `ExperienceTimeline.tsx` — reads `settings.compact`.
- `CaseStudyDetail.tsx` — renders the four new fields in the brief's order:
  caption (under the widget) · context · problem · decisions · outcome · retro.
- `SiteFooter.tsx` — now line, colophon, terminal toggle (button +
  backtick key), `aria-expanded`.
- `TerminalFooter.tsx` — collapsed state; unchanged commands; welcome text
  from the CMS as today.
- `Navigation.tsx` — four items + language toggle; a sheet below 900 px;
  never truncates. The current-page dropdown on mobile goes.
- `PageHead.tsx` — adds `Person` and `WebSite` JSON-LD; per-page `og:image`
  from `public/og/<slug>.svg` (generated by a new `scripts/generate-og.mjs`
  from the brief's asset 06 template at `prebuild`, after the sitemap).
- `src/lib/portfolio-context.ts` — facts corrected (role label, MTS, Proof App
  added, contract stance, two-day reply, no "Lenis").
- `src/lib/motion.ts` — one exported `reveal` preset (300 ms, 8 px) used by
  every section; the per-section GSAP timelines go.
- `vercel.json` — the 301s above; `/cv` → the current PDF.

### Motion rules (enforced by the `reveal` preset and review)

1. Nothing above the fold starts at opacity 0.
2. Below-fold sections: one 300 ms fade + 8 px rise, once, on entering the viewport.
3. No text effects outside the terminal.
4. Hover: 150 ms border/colour change only.
5. Widgets keep their own motion.
6. `prefers-reduced-motion`: no fades, no counters; widgets still run.

## SEO and the head

Titles and descriptions per page are in the brief §3 "System strings". The
sitemap generator already skips `site` and pages with no visible blocks, and
the site renders such a page as a 404 — so `writing` stays out of the sitemap
and off the web by having its one block hidden (`is_visible = false`) until a
post is real, with no generator change. Its nav entry is hidden the same way.
`hreflang` pairs are unchanged.

## Russian

All copy is written in English first (0029–0032). 0034 supplies the RU rows.
Until it lands, RU rows carry the English text with a `[RU pending]` prefix on
the first field, so `content:check` and a reviewer can see what is untranslated
and the fallback-leak class (`/ru/work` showing English silently) cannot recur.
The `ContentProvider` fallback stays as is; the prefix is the honesty
mechanism, not a code change.

## Testing

- `db`: a test block per migration in `schema.test.mjs` — the rows exist,
  positions are monotonic, soft-deleted pages have no live blocks, every live
  block's type is in the registry.
- `content-schema`: a test that every block type in the committed snapshots is
  registered, and that the six kept kit types validate their v40 rows.
- Site: existing vitest suite; new tests for `WorkIndex` (derives href and
  cover from the page), `ProofStrip` (static under reduced motion), `SiteFooter`
  (toggle opens the terminal, `aria-expanded` flips), `Navigation` (four items,
  sheet below 900 px, no truncation), `PageHead` (JSON-LD present once).
- A type-scale test already fails if a kit section brings a pixel size back; it
  stays.
- Manual, before the production step: every page at 375 / 768 / 1280,
  `prefers-reduced-motion`, keyboard-only through the nav and the terminal
  toggle, Lighthouse against the budget on `/` and `/work/nexusroute`.

## Rollout

Each branch: migration → `dev:local` applies it → publish in the admin →
look at :5173 → `npm run lint && npm test && npm run build && npm --prefix db
test && npm --prefix cms test` → PR. Merge in migration order. Nothing touches
production until:

9. **Norayr runs** `npm --prefix db run migrate` against Neon (0016–0034),
   publishes in the admin, runs `CMS_URL=https://cms.norav.dev npm run
   content:pull`, commits the snapshot, and pushes — that push is the deploy.

The first branch (0027 + the code removals + the `reveal` preset) is shippable
alone and fixes both P1 defects. It goes first.

## Open questions

Answered by the brief's last section once Norayr replies; none blocks the
first two branches:

- Case-study context lines: client product, internal system, or demonstrator —
  marked `confirm` in the brief. Affects 0031 copy only.
- Whether the Proof widget is more than a guided replay. Affects its caption.
- Whether `ask` stays in the terminal (keeps the Anthropic key and the rate
  limiter). Default: stays.
- Whether Writing ships at launch or the nav item waits. Default: waits.
