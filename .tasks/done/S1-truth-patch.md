# S1: Truth patch

- **Status:** Done. Production is on content version 26, published 2026-11-06
- **Origin:** `docs/plan/prompts/S1-truth-patch.md`, started by the planning session
- **Branches:** `claude/sweet-darwin-0ff567` (Noro97/norav#106), `claude/s1-after-publish`

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

The owner approved the copy, retiring `/ru` and the script on 2026-11-05.

### Stage 2: the code PR

- Code strings, widgets, `/ru` retirement, redirects, CV and `content:truth` are done.
- CV: one page, no phone number in its text or links, all links respond.
- `content:truth` rehearsed on a local v25: `--check`, apply, rerun, a draft moved inside and outside the patch. Its result matches the admin-API run, ignoring ids and timestamps.
- Pages checked at 1440px and 375px, console empty. Vercel redirects can only be checked on a deployment.

### Publish, 2026-11-06

On the owner's instruction in chat ("do and check everything yourself", then "decide yourself"), the session ran the production steps. This was for S1 only: the rule that the owner runs them still stands.

1. `--check` refused: drafts differed from v25 in 32 fields per locale. An unpublished change of 2026-09-22 had soft-deleted `terminal_footer` and created `site_footer` on the `site` page, using the block's default copy, including "Frontend-focused fullstack engineer".
2. The session decided to restore the terminal (D17, and migration 0023 moves it only if it isn't deleted) and hide `site_footer`. Nothing was deleted.
3. Backup: `~/Desktop/norav-backup-2026-11-06.sql`, outside the repo, mode 600.
4. `--check` then reported that drafts matched v25 and listed 104 edits. `content:truth:production` wrote them. Publishing from those drafts would have matched the rehearsal in all 508 English values.
5. Chrome had no CMS session and the session enters no passwords, so it published from `cms/.env` with a one-off script running the same steps as the publish route. No Preview was opened, and the rehearsal comparison stood in for it. The hook URL exists only on the CMS project, so `rebuild` came back `not_configured`.

### Stage 3: verify

- Manifest and health: version 26, 2026-11-06 09:04 UTC, checksum `27bcc9657276`.
- Published English equals the rehearsal, with 0 differences and no "Do not use" claim. Russian, which the site no longer serves, still has 15 hits at `?locale=ru`.
- Ten live pages at 1440px and 375px: no claim in the rendered text, no sideways scroll. The only `98.4` is a sample weight in OmniGrid, "6,598.4 kg". The only console error came from a browser extension.
- `/cv` redirects to the PDF, identical to the committed file. `/automation` and `/ru` redirect as intended, and the sitemap has no Russian addresses.
- The live bundle still carried v25 at this point, because nothing had rebuilt the site. This PR rebakes it. A local build with v26 leaves only `92%` (a CSS `color-mix` value) and registry metadata for `vibecoding` and `workflow`, which S4 removes.

Found during Stage 3 and fixed in the follow-up PR:

- The impact strip showed 80% of each number until scrolled into view, so a screenshot or unfurl read "6+ years".
- New-block defaults in `case-study.ts` still named Google Maps and Virtual Scroll.

`truth-patch` is deleted now that it has run. It's in the history at `19646c5` if it's ever needed.
