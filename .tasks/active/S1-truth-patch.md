# S1: Truth patch

- **Status:** Stage 1 reported, waiting on the owner at gate G3
- **Origin:** `docs/plan/prompts/S1-truth-patch.md`, started by the planning session
- **Branch:** `claude/sweet-darwin-0ff567`

## What's being done

Make the live site truthful: nothing contradicts `docs/plan/facts.md`, Fendr is in the experience list, and the phone-free CV is at `/cv`. Smallest change that makes it true, with no redesign and no new copy.

## How it'll be verified

- Local checks: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, plus CMS tests if `cms/` changes.
- The CV PDF: one page, no phone number in its extracted text, links working.
- After the owner publishes: new version in the manifest, "Do not use" search across published content and live JS bundles, changed pages at desktop and 375px, and `/cv`.

## Progress

### Stage 0: find the route

Checked on 2026-11-05 against `https://cms.norav.dev` and a local CMS.

- `/api/health` reports 17 migrations, version 25, published 2026-09-11.
- The 17 aren't 0001–0017. A note from 2026-09-23 says 0001–0015, 0028 and 0030 were applied, with 0028 and 0030 run singly. The owner's `migrate:status` output confirms or refutes this.
- All schema changes after 0015 are in 0028 and 0030. The other 14 pending files only write rows.
- That schema has the same columns as all 31 migrations. 0001–0017 lacks `media.purged_at`, `posts` and `post_translations`, and publishing fails there with `relation "posts" does not exist`.
- `/api/admin/posts` returns 401 and a made-up route returns 404, so the deployed CMS is at or after d3ea170 (23 Sep).
- All 23 published blocks in both locales pass today's registry.
- Rehearsal: real CMS on a local database with that schema and v25 loaded. Hide a block, change `cvHref`, unpublish a page, hide a menu item, add and fill an experience row, edit a row, edit SEO, preview and publish all succeeded.
- A re-publish with no edits differs from v25 only by the `--color-ink` token, empty `proof` fields on skills, and a dropped `mapFallback`.

The owner chose route A on 2026-11-05. Still open: the CMS commit, `migrate:status`, and whether production drafts changed after 11 Sep.

### Stage 1: inventory

The full table is in `S1-inventory.md`, beside this file.

- 104 CMS items were applied through the real CMS on a local copy of v25, then published. They passed the schema's limits, and a search of the result found no "Do not use" claim in either language.
- The search went past the "Do not use" list, because the demos carry more unsupported claims. NexusRoute's latency, event and throughput numbers are `Math.random()`, its "500 node" stress test adds 40, OmniGrid has 100 rows and no virtualisation, its 98.7% hit rate is hard-coded, and MerchForge has no AI.
- `ProofWidget` writes the 98.4% as `984 / 10`, so a plain search for the claim misses it.
- The Blob CV the site links to has no phone number, but it's out of date: old title, 7+ years, no Fendr.

Waiting on the owner to approve the copy (G3), and to decide on retiring `/ru` and on an owner-run script for the CMS edits.
