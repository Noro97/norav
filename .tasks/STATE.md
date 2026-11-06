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

Milestone 1. Current session: **S2, baseline and cleanup**.

| Session | Status |
| --- | --- |
| S1 Truth patch | Done, version 26 live |
| S2 Baseline and cleanup | In progress. See `.tasks/active/S2-baseline-and-cleanup.md` |
| S3 Facts and content model | Not started |
| S4 Deletion and speed | Not started |
| S5 New site structure | Not started |
| S6 Case studies | Not started |
| S7 Creative-Lab | Not started |
| S8 Launch | Not started |

## Production, as of 2026-11-06

- `cms.norav.dev/api/health`: 17 migrations applied of 31 in the repo, `publishedVersion` 26, published 2026-11-06. The 17 are 0001–0015, 0028 and 0030, not the first 17.
- Drafts match version 26, except that `site_footer` is hidden on the `site` page with its default copy. See the S3 prompt.
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
| `index` (main) | 535.6 KB | 170.7 KB |
| `motion` | 153.5 KB | 51.1 KB |
| `leaflet` | 149.7 KB | 43.2 KB |
| `gsap` | 70.3 KB | 27.7 KB |
| **JS total** | **909.1 KB** | **292.7 KB** |
| **CSS** | **148.7 KB** | **20.3 KB** |

Limits are these rounded up to a whole KB, in `scripts/check-bundle-size.mjs`. KB here is 1,000 bytes, as in Vite's output. The snapshot sits inside `index` (45 KB raw, 10 KB gzip at version 26), so a rebake after a big publish can need a higher limit.

**Lighthouse CI.** The same build served locally reads 99 and 1.58s LCP on Lighthouse 13, three times running. It sits about 0.3s under the live number because local has almost no time to first byte, so compare CI runs with each other and not with the table above.

## Blocked

Nothing.

## Owner's open items

- Set a monthly spending cap on the terminal's Anthropic API key before launch.
- Decide whether to delete the old CV from the media library. It has no phone number, but it's out of date and reachable by direct link.
- Keep or delete `~/Desktop/norav-backup-2026-11-06.sql`. It holds password hashes and sessions.
- Collect two real testimonials. They don't block anything.

## Tech debt register

- `src/components/portfolio-kit`: 68 of 229 `src` files, plus a 2,564-line stylesheet, and some of it has invented copy. S4 removes it.
- Facts are hardcoded in many places, including `index.html`, `src/lib/portfolio-context.ts` and `src/i18n/locales`. S1 corrected them and S3 centralises them.
- `seed.mts`, `import-content.mts`, `legacy-i18n` and the kit still hold old claims. No published page uses them. S4 removes the kit, and S8's scan should catch the rest.
- `vibecoding` and `workflow` blocks are hidden or unpublished, and their code still ships as unused chunks until S4 removes them.
- Pending migrations 0016–0027 hold old copy. They are append-only, so correct what they write after they run.
- No prerendering, so metadata is the same on every route. S4 adds it.
- `og:image` is the SVG logo, which link unfurlers drop, so a shared link shows no image. S11 builds the OG images.

## Decisions

See `docs/plan/README.md`.
