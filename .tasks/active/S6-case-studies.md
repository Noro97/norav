# S6: Case studies

- **Status:** In progress. Stage 1 (drafts) written, waiting on the owner's footage and answers
- **Origin:** `docs/plan/prompts/S6-case-studies.md`, started from `main` at `7a0bdbe`, after #128
- **Branch:** `claude/reverent-carson-df7387`
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

All match `facts.md`. Nothing there needed correcting; the new numbers go in when the copy is approved.

## Decisions

**Media live in the site's `public/` folder.** `/about`'s photo does the same. The library's direct upload goes to the production Blob store, and the only script that writes there is `import:media:production`, which the runbook rules out. A path needs no script, no owner step, and survives a local database. A replaced clip is a commit. Each file name carries a version, so a replacement never meets a cached copy.

**Nova Prism runs on its own fresh database.** `apps/api/data/nova.db` already exists and may hold the owner's own test data, so the capture sets `DATABASE_PATH` to a new file in the scratchpad and seeds it. Nothing in the Nova repo is written.

## How it'll be verified

- Rehearsal on a copy of production: 0035 applies twice, `release --dry-run` passes validation, and the dry run shows only the expected changes.
- The site built on that dry run's snapshot: the three pages and the two lists at 1440 and 375, video loading and posters, reduced motion, keyboard, Lighthouse.
- The site built on version 28 with the new code, for the window between merge and release.
- After the release, the three pages live.
