# S5: New site structure

- **Status:** Built and checked locally on the S5 content, waiting for the owner's one review (D23). Nothing published
- **Origin:** `docs/plan/prompts/S5-new-site-structure.md`, started from `main` at `3fd4394`
- **Branch:** `claude/s5-new-site-structure`
- **Copy:** `.tasks/active/S5-copy.md`

## What's being done

- The home page: hero, numbers with sources, case studies, live demos, compact experience, contact.
- `/work` as the index, `/demos/*` for the four demos, `/about` with the timeline, stack and questions, `/contact`.
- The D5 palette, the logo as favicon, the About photo at display size, a 1200×630 share card.
- Migration 0034 writes the copy, the slug changes, the menu and the palette, and soft-deletes `tech_marquee`, `projects_intro` and `bento_grid` with what else the new pages replace.
- Redirects for the old addresses, and the terminal behind a footer button.

## Decisions

**Cards read their page.** `work_index` holds only which pages, in order. Each card shows its page's first section's title, description and stack, so a demo is described once. A page that isn't published drops out of the list, the way a menu item does. That's how Nova Prism and norav.dev appear: S6 publishes their pages and they show up on `/` and `/work` with no other change. Until then the case-study list shows Proof App only.

**`impact_strip` stays, with an optional `source`.** The spec renamed it `proof_strip`. A new optional field with no default changes nothing a publish writes for the old row, and a rename would have been one more type to delete later.

**The hero changed shape.** The new copy needs an eyebrow, the thesis as H1, a proof line, two buttons and availability, none of which the old hero had. The component reads the old shape too, as a name over its tagline, for the minutes between the merge and the release. The follow-up PR removes that.

**Experience reads the collection, rewritten from facts.md.** The profile's role highlights are written for the terminal's prompt ("It has no TON transaction code"), so the timeline keeps its own copy, now limited to approved numbers. Four claims facts.md doesn't hold were dropped; they're listed in the copy.

**The stack reads the profile.** A new `stack` block draws the profile's skill groups, the same list `cat stack.txt` and `ask` read. It replaces the marquee.

**The FAQ is drawn by the site.** `kit_faq` keeps its fields and form. Its imported accordion showed one answer at a time, painted the numbers in the accent, and had no `aria-expanded`. The site now shows every answer.

**The palette's 400 step moved from lightness 0.51 to 0.6.** On the D5 background the crimson read 2.9:1 at 500 and 4.1:1 at 400, so accent text failed. At 0.6 the 400 step is `#e54b5c`, 5.1:1. Accent text uses 400, eyebrows went to ink, and filled buttons take `primary-fg`, which the theme derives.

**The photo stays.** `~/Desktop/noro/photo_2026-09-17_13-30-40.jpg` is full length, on a cinematic street with a car, in a branded tee. At 325px wide the face is a few pixels. The current portrait is re-encoded at 680×902, 46 KB without metadata, and loads at once with `fetchpriority="high"`. Raised in the review.

**The logo.** `public/norav-logo.svg` already held the untracked file's paths, cropped and without its metadata, and `brand.ts` draws from it. It's now the favicon, in D5 colours on a dark plate so it reads on a light tab. The old `logo-new.svg` mark is gone.

**`ask` stays off.** `ASK_ENABLED` is false in `terminal-commands.ts`, so no copy mentions it, including the FAQ.

**Russian rows of rewritten blocks are deleted.** They overlaid the new English with old Russian that still said "50K+ WebSocket events/sec across 18 hubs". `/ru` redirects to English until S12.

**`/site` redirects home** and isn't prerendered. Nothing links to it now.

## How it'll be verified

- Rehearsal on a copy of production: 0034 applies, twice, and `release --dry-run` passes validation.
- The site built on the snapshot that dry run would publish: every page at 1440 and 375, one H1, skip link first, no sideways scroll, no console errors, reduced motion, Lighthouse.
- The site built on version 27, as it will be between the merge and the release.
- After the release, on production: redirects, pages, the "Do not use" search, `sitemap.xml`, `og:image`.

## Checked so far

- `tsc`, lint, 320 site and package tests, 166 db checks, CMS typecheck, 92 CMS tests and the CMS build, on Node 20.
- On the S5 snapshot built from the rehearsal: Lighthouse 13.6 mobile, one run each: `/` 100/100/100/100, LCP 0.9s. `/about` 96/100/100/100, LCP 2.7s. `/work` and `/contact` 100 across. `/demos/nexusroute` 90/100/96/100.
- On version 27 with the new code: `/` 100/100/100/100.
- `size:check`: JS 116.3 of 119 KB gzip on version 27, 113.8 on the S5 snapshot. `prerender:check` clean on both.
