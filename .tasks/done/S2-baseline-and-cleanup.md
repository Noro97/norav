# S2: Baseline and cleanup

- **Status:** Done when its PR merges. Production content and schema are untouched: 17 migrations, version 26
- **Origin:** `docs/plan/prompts/S2-baseline-and-cleanup.md`, started by the session that closed S1
- **Branch:** `claude/strange-sinoussi-0fecb9`

## What's being done

Measure the live site, put budgets in CI, archive the old plans, fix the known doc conflicts, propose a branch cleanup for the owner to decide, and rehearse the production catch-up on a copy of production.

## How it'll be verified

- Lighthouse: mobile preset, median of 3 runs, on the live site.
- Budgets: the script passes at the baseline and exits 1 when a limit is lowered below the real size.
- CI: the workflow's checks run on the PR.
- Rehearsal: a copy of production, all pending migrations, the honest-content step, publish validation, and a page-by-page comparison with version 26.

## Progress

### Checked at the start

- `/api/health`: 17 migrations, version 26, as `STATE.md` says. The copy's `schema_migrations` confirms they're 0001–0015, 0028 and 0030.
- `content:check`: the committed snapshot already matches version 26, so task 4 changed nothing.

### Stage 0: baseline

Done. The numbers are in `STATE.md`.

### Stage 1: documents

- `docs/superpowers/` moved to `docs/archive/2026-09-redesign/`, and the paths fixed in `docs/plan/README.md` and the archive index.
- Register conflicts fixed: `README.md` (restore, `gmaps`, what CI runs), `cms/DEPLOY.md` (six pending, `migrations: 6`) and `cms/README.md` (react-three-fiber). Restore is now described as not built in all three documents.
- Also fixed, because they contradicted the code: Russian described as served, the one snapshot file described as two, WebGL, `npm --prefix cms run dev` where it would have edited the live site, PDFs missing from the upload list, and `pull:production` not saying it refuses while production is behind.
- `.claude/settings.json` lists three plugins, and `.claude/launch.json` lists two local dev servers. Neither holds anything that shouldn't be public.

### Stage 2: budgets in CI

- `scripts/check-bundle-size.mjs` runs as `npm run size:check`, as a CI step and not inside `npm run build`. Passes at the baseline, exits 1 with a lowered limit.
- Lighthouse CI: `lighthouserc.json` with D11's targets at warn level. Run locally with the pinned `@lhci/cli@0.16.0`: exit 0, with one warning, for LCP.
- `content:check` is left out of CI. It compares byte for byte against whatever is published, so any publish would fail every open PR until someone rebaked.

### Stage 3: branches

The full list and the result are in `S2-branches.md`, beside this file. The owner approved it as proposed (G4). Before deleting, the session confirmed the list still matched `origin`, no PR was open, and the worktrees were clean. Afterwards, `git ls-remote` shows only `main` and this branch. One worktree stays until the S1 session is archived.

### Stage 4: rehearsal

**The copy.** `pull:production` refuses while production is behind, because the embedded database always applies all 31 migrations. A Neon branch would have meant handing the session a connection string. So the owner ran one read-only `pg_dump`, leaving out accounts, sessions, preview tokens and the audit log. The session restored it into a private Postgres in its scratchpad, separate from the owner's server on 5432. Its version 26 is byte-identical to the live API in English, and a publish from its drafts reproduces the live checksum.

**Results, each on a fresh clone:**

| Step | Validation | Changed block fields, from v26 | Search hits, English |
| --- | --- | --- | --- |
| Nothing done | Passes | 0 | 4, all approved facts |
| All 14 migrations | Passes | 92, plus 15 new sections and 2 new pages | 72 |
| Then `content:honest` as it was | Refused: `home/bento_grid` and `contact/contact_cta` don't exist | | |
| Then `content:honest` with both names fixed | Passes | 97 | 34 |
| Then `content:catch-up` | Passes | 0 | 4, the same 4 |

The search also matches some harmless words ("Make it fast", "virtualised"), so a hit count is a measure of how much to read, not a count of false claims. The session read the migrated copy too, and found what the search can't: "Seven-plus years", "50K events a second", "−70% scripting time", "−99%", "Three.js" and "You will hear back within two days".

**What the migrations alone would do to the site:** see "Catch up production" in the runbook. The full field-by-field reports were written to the session's scratchpad and aren't kept.

**What changed as a result:**

- `content:honest` is deleted. `cms/scripts/catch-up.mts` and `cms/src/lib/restore-published.ts` replace it, with 14 tests. It puts drafts back to the latest publication and hides what the publication doesn't hold. It writes no new copy, and deletes nothing.
- `db/scripts/migrate.mjs` takes `--through=<number>`, so S3 can restore before its own migrations run.
- `docs/plan/runbook-publish.md` has the sequence, and the S3 prompt points at it. The prompt's "unhide and correct `site_footer`" step is replaced: the terminal returns to `site`, as it is now, and S5 does the footer.

**Checked on the copy with the final sequence, from a fresh clone, using the npm scripts the owner will run:**

- 14 migrations applied, 31 of 31. `--through=0031` stops there, and `--through=20`-style input is refused.
- `content:catch-up` refuses before the migrations and after a later one, with exit 1. Its dry run writes nothing, and a second run has nothing to do. It runs on Node 20 and 26.
- The result differs from version 26 in 20 values across two languages, all expected: menu anchors (0031) and ambient-layer settings (0027).
- The real CMS on the copy: signed in with a throwaway account, previewed, published. Version 27, `purged: 0`, `rebuild: not_configured`. Hook and Blob variables were forced empty.
- The site from that CMS, on `localhost`: swapped to version 27. The 11 published pages at 1440px and 375px: no claim, no broken image, no sideways scroll, except that `/work/omnigrid` went blank once at 1440px (below). `/contact` and `/writing` aren't published, as today. The search's only other hits were a sample weight ("6,598.4 kg") and the impact counter caught mid-count, which rests at 8+.
- `pullContent` refuses on the copy before the catch-up, and copies it after.

**Found on the way, not fixed in S2:** `.tasks/done/omnigrid-render-loop.md`. One blank `/work/omnigrid` in the dev build. Three live loads with real 4x CPU throttling had no error.

**Not rehearsed:** the deploy hook, because the session forced it empty, and storage on Blob. A publish that retires files has nothing to purge today: 0 files are awaiting purge.

### Stage 5: PR

Checks on Node 20: `tsc`, lint, 342 site tests, build, `size:check`, 142 schema tests, CMS typecheck, 73 CMS tests, `next build`.
