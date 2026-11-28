# S11: Media and motion

**Status:** done, 2026-11-28. PR #149, merged at `761236f`. Migration 0040 on production, version 32 live. The closing PR rebakes the snapshot.
**Origin:** `docs/plan/prompts/S11-media-and-motion.md`. Branch `claude/stoic-hopper-bc43eb`, cut from `main` at `c64df2b`; this record on `claude/s11-close`.

## What the prompt assumed, checked

- Production, 2026-11-27: 39 migrations of 39, `publishedVersion` 31. Matched `STATE.md`.
- Per-page share images: S10 already let a page choose its own in the CMS, and no published page had one. What was open was a card drawn for each page, not the field.
- The brief's generated plates were for an AI-track Lab that's gone (D6). The only placement it allowed that still exists is the home page's Lab section.
- `/work/norav` said "28" CMS API routes, with 32 in the code. The owner chose "30+" on 2026-11-27 (#148).
- Entry bundle: 0.9 KB of gzip budget left.

## Done

1. **Asset sheet,** `docs/plan/asset-prompts.md`: what the site needs, what's cut and why, one generated plate with its prompt, the review rules and the processing steps. Hero backdrop, case-study covers and the 404 illustration are cut (D5, D11, D12). The owner said yes to all four recommendations on 2026-11-28.
2. **No plate shipped.** No images came, and on 2026-11-28 the owner told the session to finish without waiting. Sessions can't run generators. The Lab teaser's plate fields (`settings.plate`, `content.plateCaption`) and `scripts/duotone-plate.mjs` stay for a plate added later; without a caption the site shows none.
3. **Share card per page,** drawn at build time by `scripts/share-cards.mjs` (satori and resvg, new dev dependencies) from each page's published title and description, in Inter Tight 900 and Inter, Latin and Cyrillic. `prerender.mjs` writes them to `dist/og/` and keeps the 1200×630 size tags; a failure leaves that page on `og.png` and the build goes on. `resolveSeo` points the head at the card after hydration too. `/` keeps `og.png`. A share image chosen in the CMS still wins. `check-prerender.mjs` checks each card.
4. **Motion,** reviewed with `emil-design-eng`, `animation-performance` and `review-animations`:
   - the reveal uses the site's strong ease-out, `cubic-bezier(0.22, 1, 0.36, 1)`, and cascades things that arrive together 60 ms apart, at most four steps; the delay is removed when the entrance ends, so hover transitions aren't held up;
   - the Lab teaser's cards use it. The hiring sections stay still (D5);
   - the scroll bar wrote React state on every frame of a scroll. It now writes its own transform; `useScrollTracking` and the store's `scrollProgress` are gone;
   - not done: SPA page transitions, which would slow every navigation; hover motion on the work index, which the brief limits to colour.
5. **0040,** `/work/norav`'s "28" API routes become "30+".

## Verification

- Site: `tsc`, `lint`, 405 tests (13 new), `build` on Node 20 (11 routes, 10 cards), `prerender:check`, `size:check`.
- `db`: 216 checks, 5 new for 0040. CMS: `typecheck`, 118 tests.
- Cards: every page, and worst cases: a title that needs an ellipsis, an unbroken word, Cyrillic, no description. The PR's Vercel preview drew all 10 on Linux.
- Headless Chrome on the built site at 1440 and 375 px: cascade 0, 60 and 120 ms, delays cleared after, the scroll bar follows, no animation running at rest, no sideways scroll, empty console. Under reduced motion, no entrance at all. The browser pane couldn't check this: hidden, it runs no animation frames.
- The Lab teaser with a stand-in plate at 1440 and 375 px, not committed.
- Live, after the merge: `/work/norav`, `/work/proof`, `/about` and `/demos/omnigrid` point at their own cards, served as 1200×630 PNGs; `/` keeps `og.png`.

### Lighthouse 13.6.0, mobile preset, median of 3

| Page | Where | Performance | Accessibility | Best practices | SEO | LCP | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | local, before (`c64df2b`) | 100 | 100 | 100 | 100 | 0.90s | 0.004 | 267 KB |
| `/` | local, after | 100 | 100 | 100 | 100 | 0.91s | 0.004 | 270 KB |
| `/work/norav` | local, before | 100 | 100 | 100 | 100 | 0.90s | 0.000 | 307 KB |
| `/work/norav` | local, after | 100 | 100 | 100 | 100 | 0.90s | 0.000 | 308 KB |
| `/` | live, version 32 | 100 | 100 | 100 | 100 | 0.95s | 0.000 | 273 KB |
| `/work/norav` | live, version 32 | 100 | 100 | 100 | 100 | 0.98s | 0.000 | 312 KB |

`/work/proof` read 95 and 2.86s locally before, as in S6: its widget is the LCP.

## Production, 2026-11-28

Through the runbook, with the owner's standing instruction of 2026-11-28 to finish without waiting; "30+" was approved on 2026-11-27:

1. Backup `~/Desktop/norav-content-2026-11-28.dump`, 498 KB, at 39 migrations and version 31.
2. Rehearsal on a private Postgres restored from it (see the runbook's new notes on Neon's `pg_attver`): 0040 applied; the dry run showed 2 changes, `metrics[1].value` "28" to "30+" in `en` and in the `ru` fallback, checksum `1ddb1069d878`; the release wrote version 32 with it, and a dry run after showed 0 changes.
3. 0040 on production: 40 of 40. The production dry run matched the rehearsal line for line, same checksum.
4. Released: version 32, `rebuild: not_configured`, published 2026-11-28 07:52 UTC. The content API serves "30+".

## Left

- The plate, whenever the owner generates one: sections 3 and 5 of the asset sheet, then the two fields on the Lab teaser and a publish.
- A second session titled "S11: Media and motion" was started from S10's session on 2026-11-28 and never ran: no commits, no branch on GitHub. It duplicates this one and can be archived.
