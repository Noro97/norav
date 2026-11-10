# S5: New site structure

- **Status:** Done, 2026-11-10. Version 28 is live, D11 holds on the live site
- **Origin:** `docs/plan/prompts/S5-new-site-structure.md`, started from `main` at `3fd4394`
- **Branches:** `claude/s5-new-site-structure` (#126), `claude/s5-snapshot` (#127), `claude/s5-cleanup` (this record and the code deletion)
- **Copy:** `.tasks/done/S5-copy.md`, as the owner approved it

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

**The review.** The owner answered every open question on 2026-11-10: keep the current photo, the new site description, Proof App alone until S6, delete the Russian rows, keep three unlisted claims out, keep every new claim. The Vizogen line about Cursor and custom MCP servers went into facts.md, the timeline, the Profile screen and the FAQ.

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

## What was done

- **#126** built the site and migration 0034. The owner reviewed the copy and screenshots once (D23), answered every open question in one grilling round, and asked for one change, the Vizogen line. Merged at `752bdc8`.
- **The release.** Fresh backup, rehearsal on it with `db/scripts/migrate.mjs`, dry run, then 0034 on production and `release:production`. Version 28, published 2026-11-10 17:29 UTC, checksum `7b1319a858c2`.
- **#127** baked version 28 into the site, so the first paint is the new site, and regenerated `sitemap.xml`.
- **This PR** deletes the code of `tech_marquee`, `projects_intro` and `bento_grid`, with `gsap`, `@gsap/react`, `MagneticButton`, `useMagneticEffect`, `useOpenSection`, the bento i18n namespace, the kit FAQ that the site's `Faq` replaced, and the old hero shape the code read until the release. Their rows were soft-deleted in 0034 and version 28 holds none.

## The checksum that didn't match

The runbook expects the production dry run to repeat the rehearsal's checksum. It didn't: `36057824212a` rehearsed, `7b1319a858c2` on production. With every UUID masked the two dry runs were identical line for line, 734 changes each. The difference was the ids of the seven blocks 0034 inserts, which Postgres generates per database. I released the production checksum. See `RETRO.md`.

## How it was verified

- Before the merge: `tsc`, lint, site and package tests, db checks, CMS typecheck, tests and build on Node 20, `size:check`, `prerender:check`, and all six CI checks on #126's last commit.
- The site built on the rehearsed snapshot: 10 routes at 1440 and 375, screenshots for the review, keyboard, reduced motion, Lighthouse locally.
- The site built on version 27 with the new code, for the window between the merge and the release.
- **On production, after #127 deployed:** every old URL redirects (308, `/site` 307), every page answers 200 and `/nope` 404, one H1 on each page at 375 and 1440, the skip link first, no sideways scroll, no console errors, nothing running under reduced motion. `sitemap.xml` lists the 9 pages, none redirected. `og:image` is `/og.png`, a 200 `image/png`, with width, height and alt. The live content in both locales has nothing from "Do not use"; the one match for "in production" is the profile's "It has not been in production".
- Lighthouse on production: see `STATE.md`.

## Not verified

- A pasted link's card in Telegram or LinkedIn: the tags and the PNG are right, but no unfurler was asked.
- Screen readers and real phones. Keyboard use inside the demos.
- The terminal's `ask`, which stays switched off.
