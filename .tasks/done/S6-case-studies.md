# S6: Case studies

- **Status:** Done, 2026-11-12. Version 29 is live. Proof App's footage was never recorded, so its study runs without it
- **Origin:** `docs/plan/prompts/S6-case-studies.md`, started from `main` at `7a0bdbe`, after #128
- **Branches:** `claude/s6-case-studies` (#129), `claude/s6-snapshot` (this record and the snapshot)
- **Copy:** `.tasks/active/S6-copy.md`, for the one review (D23)

## What's being done

- Three case studies on the `case_study` block: Proof App under its widget at `/work/proof`, and two new pages, `/work/nova-prism` and `/work/norav`. `/` and `/work` already list all three, and show a card once its page is published.
- Media: the owner's Proof App footage, screenshots of Nova Prism and the norav.dev CMS taken locally, compressed, each with alt text and every clip with a poster.
- Migration 0035 writes the copy and the pages as drafts. The release publishes them after the owner's yes (G3).
- The Proof App widget loses what the Proof App code doesn't support.

## Facts recounted from the code, 2026-11-10

| Claim | Count | Where |
| --- | --- | --- |
| Proof App tables, with row-level security | 42 tables, 41 with RLS | `~/Desktop/projects/Proof/supabase/migrations`, replayed in order |
| Proof App migrations | 73 | same folder |
| Proof App Edge Functions | 16 | `supabase/functions`, without `_shared` |
| Proof App pgmq queues | 3: `video_processing`, `verification_jobs`, `badge_mint_queue` | `pgmq.create` in the migrations |
| Proof App levels | 20 | `level_thresholds` seed |
| Proof App tests | none | no `*.test.*`, `*.spec.*` or `__tests__` |
| Nova Prism test files | 58 | `apps`, `packages` |
| Nova Prism REST operations | 70 on 59 paths, 23 of them host panel | `packages/contracts/openapi.yaml` |
| Nova Prism Socket.IO events | 25: 18 server to client, 7 client to server | `packages/contracts/socket-events.ts` |
| Nova Prism tables, migrations | 19 tables, 7 migrations | `apps/api/src/db/schema.ts`, `apps/api/drizzle` |
| norav.dev migrations | 34, and 35 with this session's | `db/migrations` |
| norav.dev CMS API routes | 28 route files, 39 handlers | `cms/src/app/**/route.ts` |
| norav.dev block types | 28 | `BLOCK_REGISTRY` |
| norav.dev automated checks | 311 site and package tests, 92 CMS tests, 167 schema checks | Node 20, before this session's changes |

All match `facts.md`. Nothing there needed correcting. The new code-derived numbers for Nova Prism and norav.dev are added to its rows, for the review.

## Decisions

**Media live in the site's `public/` folder.** `/about`'s photo does the same. The library's direct upload goes to the production Blob store, and the only script that writes there is `import:media:production`, which the runbook rules out. A path needs no script, no owner step, and survives a local database. A replaced clip is a commit. Each file name carries a version, so a replacement never meets a cached copy.

**Nova Prism runs on its own fresh database.** `apps/api/data/nova.db` already exists and may hold the owner's own test data, so the capture sets `DATABASE_PATH` to a new file in the scratchpad and seeds it. Nothing in the Nova repo is written.

**Nova Prism's captures leave out the host panel.** Its client page has "Adjust virtual balance" and per-trade edit buttons, which read badly without context and say something about how the product is run, which the owner keeps out (2026-11-07).

**The case_study block, after `break-ui`.** It had never been published, so this is its first real use. Worst cases at 320, 1440 and 200% zoom, plus one-of-each and title-only:

| # | Severity | What broke | Fix |
| --- | --- | --- | --- |
| 1 | Broken | A long compound word in the H1 was cut off at 320px | `break-words` on the heading, decision titles, chips and metric values |
| 2 | Broken | Two chips or two links with the same text collided on React keys | Index keys |
| 3 | Ugly | Opening a page, the eyebrow sat under the fixed menu (`py-24`) | `pt-36 md:pt-44`, as `WorkIndex` does when first |
| 4 | Ugly | Under the Proof widget, a ~280px gap | No top padding when not first; the widget's padding is the gap |
| 5 | Ugly | Portrait footage stacked one per row, ~720px each | Three to a row from md; landscape takes the row |
| 6 | Ugly | Decision bodies ran ~150 characters a line | `max-w-[68ch]` |
| 7 | Fragile | The title was always H1, so a study under a demo with a title would make two | H1 when first, H2 otherwise |
| 8 | Fragile | Metrics put `<dd>` before `<dt>` | `<dt>` first, shown under the value with `flex-col-reverse` |
| 9 | Broken (keyboard) | Pressing play, or an autoplay clip starting, removed the focused button and dropped focus to the page | Focus moves to the `<video>` |

Held up: an empty study renders nothing, a title-only one only its header, newlines show, long emails and URLs wrap, 12 chips wrap, nothing scrolls sideways at 320 or 200% zoom. Left as is: figure images have no intrinsic size. They lazy-load well before the viewport, and Lighthouse reads CLS 0, but a fast scroll on a slow connection could still shift. Fixing it needs width and height in the schema.

## How it'll be verified

- Rehearsal on a copy of production: 0035 applies twice, `release --dry-run` passes validation, and the dry run shows only the expected changes.
- The site built on that dry run's snapshot: the three pages and the two lists at 1440 and 375, video loading and posters, reduced motion, keyboard, Lighthouse.
- The site built on version 28 with the new code, for the window between merge and release.
- After the release, the three pages live.

## Checked before the review

- **Rehearsal** on a backup of production taken 2026-11-10 22:22, in a private Postgres on port 55471 (database `rehearsal`): 0035 applies, another run changes no row, and `release:production --dry-run` passes validation. It shows only the expected changes: two new pages, the Proof story, three SEO entries, and `/work/proof`'s Russian SEO gone, as 0034 did for every page it rewrote. The diff is by index, so the new pages read as `pages[9]` changing.
- **The site built on that snapshot:** 11 routes prerendered, `prerender:check` clean, `size:check` JS 117.5 of 119 KB gzip (112.6 on version 28). `/`, `/work` and the three studies at 1440 and 375: one H1, skip link first, no sideways scroll, no console errors or warnings.
- **Lighthouse 13.6, mobile preset, one run each, local build:** `/work/nova-prism`, `/work/norav`, `/work` and `/` 100/100/100/100, LCP 0.9s, CLS 0 (`/` 0.004). `/work/proof` 95/100/100/100, LCP 2.9s three times; the same page on version 28 reads 96 and 2.7s locally, against 2.2s live. The widget is that page's LCP and renders after the entry chunk, which carries the snapshot, now 4.9 KB gzip heavier.
- **Video:** at load only the poster and stills are requested, no `<video>` and no mp4. On screen the clip plays muted and loops; under reduced motion it waits for a click, and nothing animates. Enter on the play button starts it with focus on the player.
- **Keyboard:** skip link, logo, menu, the clip's button, footer, each with a focus ring.
- **The site built on version 28 with this code:** 9 routes, `prerender:check` clean, JS 112.6 KB gzip. This is what deploys between the merge and the release.
- `tsc`, lint, 319 site and package tests in 50 files, 183 schema checks, on Node 20. The CMS isn't changed.

## What was done

- **#129** wrote migration 0035, the media, the widget fixes and the `case_study` fixes. The owner approved the copy as written on 2026-11-12, which also accepted the recommendation on each of the ten questions. Merged at `7ea5e1b` with every check green on its last commit.
- **The release.** Fresh backup at 16:48 Yerevan, a new private Postgres (the scratchpad had been cleared), rehearsal: 0035 applies, `release:production --dry-run` validates with 56 changes. 0035 on production, then a production dry run identical to the rehearsal's line for line with UUIDs masked. The release waited for the merge's deploy, so the files were live first (about 20 seconds). Version 29, published 2026-11-12 12:50 UTC, checksum `4db01156478c`, `rebuild: not_configured`.
- **This PR** bakes version 29 and regenerates `sitemap.xml` (11 pages).

## The test count is already out of date

The norav.dev study says "594 automated tests". That was the count on the code that merged, with version 28 baked in. On version 29 the site's suite counts 321, not 319, because some tests run once per published page. So the published number drifts with content, not only with code. Next time the copy changes, write "590+" or drop the count.

## How it was verified

- Before the merge: everything under "Checked before the review", and all six CI checks on #129's last commit.
- On version 29 baked in: 11 routes prerendered, `prerender:check` clean, `size:check` JS 117.0 of 119 KB gzip, CSS 14.3 of 17, 321 site and package tests on Node 20.
- The live check after this PR deploys is in the session's final report.

## Not verified

- Screen readers and real phones. Lighthouse on the live site for the two new pages until this PR deploys.
- Proof App's footage, which doesn't exist.
