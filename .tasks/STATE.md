# Project state

The working model of this project. Read first every session, update every session. Check it against the code and production before trusting it.

## Stack

- **Site:** Vite 6, React 19, Tailwind 4, on Vercel. GSAP and framer-motion in widgets, Leaflet in NexusRoute.
- **CMS:** Next.js 15 App Router, `pg`, TinyMCE, on Vercel at `cms.norav.dev`. Neon Postgres, Vercel Blob.
- **Shared:** `packages/content-schema` (Zod block registry), `packages/design-tokens`.
- **Pipeline:** CMS publish, immutable snapshot, baked by `prebuild`, refreshed by checksum at idle.

## Commands

See `CLAUDE.md`.

## Definition of done

See "Session rules" in `docs/plan/README.md`.

## Current focus

Milestone 1. **S3 is done and production is current.** S4 is next. S7 can start any time.

| Session | Status |
| --- | --- |
| S1 Truth patch | Done |
| S2 Baseline and cleanup | Done. Nothing ran on production except the owner's read-only dump |
| S3 Facts and content model | Done, version 27 live |
| S4 Deletion and speed | Not started |
| S5 New site structure | Not started |
| S6 Case studies | Not started |
| S7 Creative-Lab | Not started |
| S8 Launch | Not started |

## Production, as of 2026-11-07

- `cms.norav.dev/api/health`: 32 migrations applied of 32 in the repo, `publishedVersion` 27, published 2026-11-07. Checksum `ea9a635bbe9a`.
- Version 27 differs from 26 only by `settings.profile` and 10 values per language that nothing reads: 7 menu anchors and 3 ambient-layer settings. The live search for "Do not use" claims and `[Placeholder` finds nothing.
- The September copy is in the database but not in the drafts that publish. Its sections and pages are hidden or unpublished. S4 soft-deletes most of them, and S5 brings the new copy with the owner's review.
- English only: `/ru` redirects to English until S12. The CMS keeps Russian rows, and `?locale=ru` still returns the old Russian copy.

## Baseline, 2026-11-06

Measure later work against these. Content version 26.

**Lighthouse 13.6.0, mobile preset, median of 3 runs, live site:**

| Page | Performance | Accessibility | Best practices | SEO | LCP | FCP | TBT | CLS | Speed Index | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 98 | 95 | 100 | 100 | 1.88s | 1.88s | 0 ms | 0.000 | 2.75s | 449 KB |
| `/about` | 71 | 95 | 100 | 92 | 9.07s | 1.90s | 0 ms | 0.000 | 4.47s | 1,307 KB |
| `/work` | 76 | 96 | 100 | 100 | 5.36s | 1.86s | 11 ms | 0.017 | 4.12s | 925 KB |
| `/work/proof` | 88 | 95 | 100 | 100 | 3.69s | 1.87s | 0 ms | 0.000 | 2.90s | 449 KB |

D11's targets for `/` are LCP under 1.5s, which it misses by 0.38s, and Lighthouse 95+, which it meets.

What the runs point at:

- `/about`: the LCP element is an 860 KB photo with `loading="lazy"`. Lighthouse estimates 771 KiB of savings from image delivery alone.
- `/work`: the LCP element is the collage image, also `loading="lazy"`, with 332 KiB of estimated savings.
- `/` and `/work/proof`: the LCP element is text, held back by render-blocking CSS and fonts. Lighthouse estimates 550–970 ms of savings across all four pages.
- Accessibility: `color-contrast` is the only failure, on 4–8 elements per page, starting with a `text-tertiary-ink/40` button.
- SEO on `/about`: one link isn't crawlable (`crawlable-anchors`).

**Entry bundle, Node 20, built from the committed snapshot.** `npm run size:check` enforces it in CI. Only what `index.html` loads up front counts:

| File | Raw | Gzip |
| --- | --- | --- |
| `index` (main) | 405.4 KB | 136.5 KB |
| `motion` | 153.5 KB | 51.1 KB |
| `leaflet` | 149.7 KB | 43.2 KB |
| `gsap` | 70.3 KB | 27.7 KB |
| **JS total** | **778.9 KB** | **258.4 KB** |
| **CSS** | **150.1 KB** | **20.4 KB** |

These are S3's, measured 2026-11-07 with version 27 baked. S2's baseline read 535.6 KB for `index` and 909.1 KB in total. The difference is zod and the block schemas, which a logo constant had pulled into `index`, and `schema-imports.test.ts` now stops that coming back. The Lighthouse table above predates it.

The security update of 2026-11-07 moved Vite to 6.4.5, and the build stopped preloading `leaflet`, so the entry total is now 629.1 KB raw and 215.3 KB gzip on Node 20. The map still loads where it's needed. The limits stay where they are until S4 lowers them.

`scripts/check-bundle-size.mjs` holds these numbers, rounded up to a whole KB. KB here is 1,000 bytes, as in Vite's output. The snapshot sits inside `index`, so a rebake after a big publish can need a higher limit.

**Lighthouse CI.** The same build served locally reads 99 and 1.58s LCP on Lighthouse 13, three times running. It sits about 0.3s under the live number because local has almost no time to first byte, so compare CI runs with each other and not with the table above. On GitHub's runner, three runs on 2026-11-06 read LCP 1.39s, performance 85, 97 and 98, and TBT from 52 to 577 ms, so only the median run means anything, and that's what the assertions use. The live site reads 1.88s. **So a CI pass doesn't prove D11 on the live site. S4 still has to measure the live site.** Each CI run keeps its reports in a `lighthouse` artifact, because a passing run prints no numbers.

## Audit, 2026-11-07

`web-quality-audit` on the live site, content version 27. Lighthouse 13.6.0, mobile preset, median of 3 runs: `/` 98 with LCP 1.92s, `/about` 71 with 8.89s, `/work` 78 with 5.24s, `/work/proof` 88 with 3.59s. No regression from the baseline above.

- **Passed:** reduced motion (no running animations at 375px, against 1–7 without it), no sideways scroll at 375px, no site errors in the console, source maps closed, admin APIs return 401 without a session.
- **Now in S4:** self-hosted fonts, no count-up on the numbers strip, real 404s, long cache on hashed files.
- **Now in S5:** H1 on every page, skip link, contrast, the Email link on `/about`, photo delivery, the sitemap check.
- **Still open:** no security headers beyond HSTS on the site or the CMS, for S8. The terminal's rate limit is per instance, so the spending cap is the real limit.
- **Not checked:** field data, screen readers, real phones, keyboard use inside widgets and modals, and `ask`, because it spends the API key. S8 should confirm that `claude-sonnet-5` in `server/chat.ts:14` still answers.

## Blocked

Nothing.

## Owner's open items

- Delete `~/Desktop/norav-content-2026-11-07.dump`, now that the catch-up has been checked, and the two test videos beside it.
- Set a monthly spending cap on the terminal's Anthropic API key before launch.
- Decide whether to delete the old CV from the media library. It has no phone number, but it's out of date and reachable by direct link.
- Keep or delete `~/Desktop/norav-backup-2026-11-06.sql`. It holds password hashes and sessions.
- Collect two real testimonials. They don't block anything.
- Archive the S1 session, so its worktree `sweet-darwin-0ff567` and branch `claude/s1-after-publish` can go. The owner already approved removing them.
- Decide what to do with the old stash `WIP on feat/cms-theme`. Nothing has touched it.

## Tech debt register

- `npm audit` still reports two causes in `cms/`, both pinned upstream and neither reachable here. Next 15 pins `postcss` 8.4.31, which only runs at build time on the CMS's own CSS. `@vercel/cli-config` pins `zod` 4.1.11, and only parses local CLI config files. Later releases of those packages clear them, so check again at S8. The site's 10 moderate reports are `minimatch` inside `eslint` and `typescript-eslint`, which are dev tools, and `npm audit` only offers a major-version change.
- `src/components/portfolio-kit`: 68 of 229 `src` files, plus a 2,564-line stylesheet, and some of it has invented copy. S4 removes it.
- `cat experience.txt` prints every highlight in the profile, 76 lines in a box that doesn't wrap, so at 375px its longest lines scroll sideways inside the box. So do `cat about.txt` and `sudo hire`. S5 can decide what the terminal should say.
- `npm run user:add` shows the password as it's typed. The runbook says to run it in the Mac's Terminal app. Hiding the input would be a small fix.
- `.env.example`'s comment on `CMS_URL` doesn't mention that `/api/chat` reads it at runtime too. Sessions don't open `.env*` files, so the owner or a rule change has to fix it.
- `cat stack.txt` in `src/i18n/locales` keeps an older skills list than the profile's. It isn't an approved-numbers problem, so S3 left it to avoid a visible change. S5 should choose one.
- Block copy still states facts in its own words: the hero, the career timeline, `terminal_footer.hire`. S5 rewrites and reviews it from `facts.md`. Nothing keeps it in step with the profile.
- The `workflow` and `vibecoding` blocks still say n8n and "Vibe Coding". `banned-claims.test.ts` allows those exact hits until S4 deletes the blocks, and fails when one goes stale.
- The seed data no longer holds banned claims, but `seed.mts`, `import-content.mts` and `legacy-i18n` still hold other old copy, and so does the kit. No published page uses them. S4 removes the kit, and S8's scan should catch the rest.
- No local setup has a blob store, so a change to direct upload can only be tested for real on production. The token, the checks and the recording have tests.
- `vibecoding` and `workflow` blocks are hidden or unpublished, and their code still ships as unused chunks until S4 removes them.
- Migrations 0016–0027 hold old copy, and they are append-only, so a brand-new database still gets it in its drafts. Production's rows are hidden, and S4 soft-deletes most of them.
- Confetti bursts are the wrong colour. See `.tasks/bugs/confetti-colours.md`.
- Nothing enforces CI on a merge, and sessions merge their own PRs (D20). Branch protection needs GitHub Pro or a public repo, so it becomes possible at S8. Turning it on then is gate G6.
- No prerendering, so metadata is the same on every route. S4 adds it.
- `og:image` is the SVG logo, which link unfurlers drop, so a shared link shows no image. The owner moved one static PNG up to S5, because Milestone 1 is meant to be shared. S11 adds per-page images.

## Decisions

See `docs/plan/README.md`.
