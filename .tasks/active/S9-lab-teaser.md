# S9: Lab teaser and catalog

- **Status:** In progress, 2026-11-21. Code PR open; waiting for the owner's copy review (G3), then the publish and a closing PR; then the `creative-lab` stylesheet PR
- **Origin:** `docs/plan/prompts/S9-lab-teaser.md`, started from `main` at `5746560` (S8's state, #136), branch `claude/s9-lab-teaser-d53729`
- **Production at the start:** `cms.norav.dev/api/health` reports 35 migrations, `publishedVersion` 29. `norav.dev/lab/` answers 200.

## What's being done

1. A `lab` collection in the content schema (title, one line, link, poster, clip), edited by the CMS's generic collection editor, and migration 0036 that fills it and places the teaser on `/`.
2. A `lab_teaser` block and its section on the site: a lazy chunk, posters lazy below the fold, a clip only while a card is pointed at or focused, never under reduced motion or on a touch screen, plain links into `/lab/`.
3. Posters and clips captured from the live exhibits on `norav.dev/lab/` (D12).
4. This PR, then the owner's copy review (G3) and the publish through the runbook, then a closing PR with the snapshot, the size limit and the state.
5. A separate PR in `creative-lab`: each exhibit loads only its own stylesheet.

## Done so far

- **Schema.** `packages/content-schema/src/collections/lab.ts` and `blocks/lab-teaser.ts`, registered. A row's link must start with `/lab/` or `https://`; poster and clip are paths or library references, kept out of translation. The teaser shows the first `count` rows that have a poster (1–6, default 3).
- **Site.** `src/components/sections/LabTeaser.tsx`, lazy, in `blocks.tsx`. Cards are plain `<a>` links (a router link to `/lab/` would land on this app's 404). The poster is decorative (`alt=""`, the title names the link), 960×600 with its size set, `loading="lazy"`.
- **Migration 0036.** Nine rows, then the teaser between the home page's experience list and its contact block, at the midpoint of their positions as they are when it runs. Guarded on a live hero like 0034 and 0035.
- **Left out of the catalog: the inflatable wallet-onboarding exhibit.** Its title names a claim "Do not use" in `facts.md` bans, and `banned-claims.test.ts` scans the migrations for it. It stays in the Lab; a veto there is still the owner's call (S7's open item).
- **Media.** `public/assets/lab/`: nine posters (WebP, 960×600, 14–68 KB, 368 KB in all) from 1280×800 captures at DPR 1.5, and three clips (H.264, 800×500, 24 fps, 5 s, no audio: thermal 279 KB, globe 112 KB, axiom 246 KB). Captured with headless Chrome from `norav.dev/lab/#<id>` with no page errors; thermal's clip scrolls through its chapters, the others drift the pointer.
- **Order.** thermal, globe, axiom first (a simulation, a WebGL scene, an interface), then camera, avatar, tactile-glitch, legal, 2048, bomber. web3 is the slowest on a phone anyway (47 fps at 375 px in S7).

## Verified

| Check | Result |
| --- | --- |
| Site: `tsc`, lint, 53 files / 359 tests, build, `prerender:check` | Pass, Node 20 |
| Schema tests (in the site's run): `lab.test.ts`, `lab-copy.test.ts` (0036's rows and copy pass the schemas, every file exists), `LabTeaser.test.tsx` | Pass |
| CMS: typecheck, 92 tests, build | Pass |
| `db`: 194 checks, 0036 replayed on the fixtures and again | Pass |
| Rehearsal: today's backup restored into a private Postgres, 0036 applied, dry run | 40 changes, all the teaser in `pages[6].blocks[5]` (contact moves to `[6]`) and `collections.lab`, in `en` and in `ru` (which serves English until S12). Checksum `87587dc0a743…` |
| CMS editor, local embedded database | The Lab collection is listed; a new row saves (201); `/work` as a link is refused with "Starts with /lab/ or https://" under the field (422); fixed, it saves (200) |
| Browser, built site with the rehearsal's version 30 baked in, headless Chrome | Nothing from `/assets/lab/` at load. Posters load when the section nears the screen. No `.mp4` until a mouse points at a card or Tab reaches it; it plays muted and pauses when the pointer leaves. At 375 px (touch, DPR 3) a tap follows the link and loads no clip. Reduced motion: no clip. Three columns at 1440 px, one at 375 px, no sideways scroll, empty console |

**Lighthouse 13.6.0, mobile preset, median of 3, local `vite preview` of `dist`:**

| `/` | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Before: version 29 baked | 100 | 100 | 100 | 100 | 0.90s | 0.000 | 0 ms | 263 KB |
| After: version 30 from the rehearsal | 100 | 100 | 100 | 100 | 0.90s | 0.004 | 0 ms | 267 KB |

Before read CLS 0.004 in two of its three runs too. After, Lighthouse requested no poster and no clip; the 4 KB are the 1.3 KB `LabTeaser` chunk and the snapshot in the entry chunk.

**Entry bundle with version 30 baked, Node 20:** JS 362.4 KB raw (limit 362.0), 118.1 KB gzip (limit 119.0). The catalog adds about 2.8 KB raw to the snapshot, which sits in the entry chunk. The closing PR, which commits that snapshot, raises the raw limit, as `check-bundle-size.mjs` says to. Gzip has 0.9 KB left: the next sizeable publish needs the snapshot out of the entry chunk.

## Not done yet

- Owner's copy review (G3), the publish through the runbook, the closing PR (snapshot, sitemap, size limit, state).
- The `creative-lab` stylesheet split.

## Noticed, not in scope

- The CMS can't preview a path into the site's public folder: the poster's thumbnail is a broken image on `cms.norav.dev`, as the case studies' figures are. `mediaDisplaySrc` could prefix the site's origin for a root-relative path.
- `/work/norav` says "28 block types" and "35 numbered SQL migrations"; with this PR the code has 29 and 36.
- Two backups from S6 are still on the Desktop (`norav-content-2026-11-10.dump`, `norav-content-2026-11-12.dump`).
