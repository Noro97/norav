# S11: Media and motion

**Status:** in progress, started 2026-11-27.
**Origin:** `docs/plan/prompts/S11-media-and-motion.md`, started by S10's closing session under D24. Branch `claude/stoic-hopper-bc43eb`, cut from `main` at `c64df2b`.

## What the prompt assumed, checked

- Production, 2026-11-27: 39 migrations of 39, `publishedVersion` 31, published 2026-11-21 22:06 UTC (`api/health`). Matches `STATE.md`.
- Per-page share images: S10 lets a page choose its own in the CMS, and the prerender writes it. No published page has one, so every page unfurls with `og.png`. What's open is a card drawn per page, not the field.
- The brief's generated plates were for an AI-track Lab that's gone (D6). The only placement it allowed that still exists is the home page's Lab section.
- `/work/norav` says "28" CMS API routes; `main` has 32. The owner chose "30+" on 2026-11-27 (PR #148). It ships in S11's migration.
- Entry bundle: 0.9 KB of gzip budget left (S9).

## Plan

1. `docs/plan/asset-prompts.md`: what's needed, what's cut, one generated plate, per-page share cards in code. Done.
2. The owner generates the plate; the session reviews, duotones and integrates it into the Lab teaser behind an optional block field, so it appears only when published.
3. Per-page share cards drawn at build time from each page's published title and description.
4. Migration 0040: "28" becomes "30+", and the plate and its caption go into the Lab teaser's drafts.
5. Motion: review the site's motion with `emil-design-eng`, `animation-performance` and `review-animations`; change only what earns it.
6. Lighthouse before and after, on `/` and `/work/norav`.
7. PR, merge, the release through the runbook with the owner's yes (G2, G3).

## Where it stands, 2026-11-27

- Done on the branch, draft PR #149: the asset sheet; share cards for 10 pages; the plate fields and their rendering; the reveal cascade and curve; the scroll bar off React state; `scripts/duotone-plate.mjs`; 0040's "30+".
- Waiting on the owner: round 1 (what to generate, the subject, the tool, the hand-over folder) and then the images in `~/Desktop/norav-plates/`.
- Then: review and duotone the plate, add its rows to 0040 (path and caption), Lighthouse after, the copy review of the caption on the finished page, label the PR, merge, the runbook.
- Lighthouse before, local build of `main` at `c64df2b`: `/` 100/100/100/100, LCP 0.90s, 267 KB; `/work/norav` 100/100/100/100, 0.90s, 307 KB; `/work/proof` 95/100/100/100, 2.86s (as in S6, its widget is the LCP).

## Verification

- Site, CMS and schema checks; `size:check`, `prerender:check`.
- Every built page's `og:image` points at its own card, and the cards render at 1200×630.
- Browser at 1440 and 375 px, with reduced motion on and off, and an empty console.
- Lighthouse 13.6.0, mobile preset, median of 3, before and after.
