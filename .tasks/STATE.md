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

Milestone 1. **S3 is merged and waiting on the owner's production catch-up.** See `.tasks/active/S3-facts-and-content-model.md`. S4 starts after that. S7 can start any time.

| Session | Status |
| --- | --- |
| S1 Truth patch | Done, version 26 live |
| S2 Baseline and cleanup | Done. Nothing ran on production except the owner's read-only dump |
| S3 Facts and content model | Code merged. The catch-up and a follow-up PR are left |
| S4 Deletion and speed | Not started |
| S5 New site structure | Not started |
| S6 Case studies | Not started |
| S7 Creative-Lab | Not started |
| S8 Launch | Not started |

## Production, as of 2026-11-06

- `cms.norav.dev/api/health`: 17 migrations applied of 32 in the repo, `publishedVersion` 26, published 2026-11-06. The 17 are 0001–0015, 0028 and 0030, not the first 17.
- Drafts match version 26 exactly: on a copy taken 2026-11-06, a publish reproduced its checksum, `27bcc9657276`. `site_footer` is hidden on the `site` page, with its default copy.
- **The catch-up is rehearsed and written down in `docs/plan/runbook-publish.md`.** Don't run `npm --prefix db run migrate` on production any other way: it writes 72 search hits for claims and placeholders into the drafts, and publish validation passes them.
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
| `index` (main) | 402.4 KB | 135.4 KB |
| `motion` | 153.5 KB | 51.1 KB |
| `leaflet` | 149.7 KB | 43.2 KB |
| `gsap` | 70.3 KB | 27.7 KB |
| **JS total** | **775.9 KB** | **257.4 KB** |
| **CSS** | **150.1 KB** | **20.4 KB** |

These are S3's, measured 2026-11-07. S2's baseline read 535.6 KB for `index` and 909.1 KB in total. The difference is zod and the block schemas, which a logo constant had pulled into `index`, and `schema-imports.test.ts` now stops that coming back. The Lighthouse table above predates it.

`scripts/check-bundle-size.mjs` still holds S2's JS limits, because the rebake in S3's follow-up adds the profile to `index`. The follow-up sets them from the new size. KB here is 1,000 bytes, as in Vite's output. The snapshot sits inside `index` (45 KB raw, 10 KB gzip at version 26), so a rebake after a big publish can need a higher limit.

**Lighthouse CI.** The same build served locally reads 99 and 1.58s LCP on Lighthouse 13, three times running. It sits about 0.3s under the live number because local has almost no time to first byte, so compare CI runs with each other and not with the table above. On GitHub's runner, three runs on 2026-11-06 read LCP 1.39s, performance 85, 97 and 98, and TBT from 52 to 577 ms, so only the median run means anything, and that's what the assertions use. The live site reads 1.88s. **So a CI pass doesn't prove D11 on the live site. S4 still has to measure the live site.** Each CI run keeps its reports in a `lighthouse` artifact, because a passing run prints no numbers.

## Blocked

Nothing.

## Owner's open items

- Set a monthly spending cap on the terminal's Anthropic API key before launch.
- Decide whether to delete the old CV from the media library. It has no phone number, but it's out of date and reachable by direct link.
- Keep or delete `~/Desktop/norav-backup-2026-11-06.sql`. It holds password hashes and sessions.
- Collect two real testimonials. They don't block anything.
- Archive the S1 session, so its worktree `sweet-darwin-0ff567` and branch `claude/s1-after-publish` can go. The owner already approved removing them.
- Decide what to do with the old stash `WIP on feat/cms-theme`. Nothing has touched it.
- Consider OG images before S11. A link shared today shows no image, and Milestone 1 is meant to be shared.

## Tech debt register

- `src/components/portfolio-kit`: 68 of 229 `src` files, plus a 2,564-line stylesheet, and some of it has invented copy. S4 removes it.
- The facts source exists (`settings.profile`), and two copies remain until S3's follow-up: `DEFAULT_PROFILE`, which the site falls back to until production publishes a profile, and the `cat experience.txt` lines in `src/i18n/locales`, because replacing them changes what the terminal prints. The follow-up also makes a publish with no profile a refusal.
- `cat stack.txt` in `src/i18n/locales` keeps an older skills list than the profile's. It isn't an approved-numbers problem, so S3 left it to avoid a visible change. S5 should choose one.
- Block copy still states facts in its own words: the hero, the career timeline, `terminal_footer.hire`. S5 rewrites and reviews it from `facts.md`. Nothing keeps it in step with the profile.
- The `workflow` and `vibecoding` blocks still say n8n and "Vibe Coding". `banned-claims.test.ts` allows those exact hits until S4 deletes the blocks, and fails when one goes stale.
- The seed data no longer holds banned claims, but `seed.mts`, `import-content.mts` and `legacy-i18n` still hold other old copy, and so does the kit. No published page uses them. S4 removes the kit, and S8's scan should catch the rest.
- Direct upload to Blob has only been tested up to the browser's PUT. The token, the checks and the recording have tests, and no local setup has a blob store. Its first real run is the owner's test upload.
- `vibecoding` and `workflow` blocks are hidden or unpublished, and their code still ships as unused chunks until S4 removes them.
- Pending migrations 0016–0027 hold old copy. They are append-only, so `content:catch-up` puts the drafts back after they run. After S3 the rows stay hidden, and S4 soft-deletes most of them. S3 deletes the script.
- Confetti bursts are the wrong colour. See `.tasks/bugs/confetti-colours.md`.
- Nothing enforces CI on a merge, and sessions merge their own PRs (D20). Branch protection needs GitHub Pro or a public repo, so it becomes possible at S8. Turning it on then is gate G6.
- No prerendering, so metadata is the same on every route. S4 adds it.
- `og:image` is the SVG logo, which link unfurlers drop, so a shared link shows no image. S11 builds the OG images.

## Decisions

See `docs/plan/README.md`.
