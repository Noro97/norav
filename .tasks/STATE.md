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

Milestone 1. Next session: **S2, baseline and cleanup**.

| Session | Status |
| --- | --- |
| S1 Truth patch | Done, version 26 live |
| S2 Baseline and cleanup | Not started |
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
- About 910 KB of JavaScript referenced from the first page, before compression: main 536 KB, motion 153 KB, Leaflet 150 KB, GSAP 70 KB. Main dropped when Russian left the bundle.
- No Lighthouse baseline yet. The PageSpeed API quota was exhausted. S2 measures it locally.

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
- Doc conflicts: `README.md:62` (restore route that doesn't exist), `README.md:200`, `README.md:224`, `cms/DEPLOY.md:18`, `cms/README.md:79`. S2 fixes them.
- No prerendering, so metadata is the same on every route. S4 adds it.

## Decisions

See `docs/plan/README.md`.
