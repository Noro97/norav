# S2: Baseline and cleanup

- **Status:** In progress. Waiting on the owner for gate G4 and the copy of production
- **Origin:** `docs/plan/prompts/S2-baseline-and-cleanup.md`, started by the session that closed S1
- **Branch:** `claude/strange-sinoussi-0fecb9`

## What's being done

Measure the live site, put budgets in CI, archive the old plans, fix the known doc conflicts, propose a branch cleanup for the owner to decide, and rehearse the production catch-up on a copy of production.

## How it'll be verified

- Lighthouse: mobile preset, median of 3 runs, on the live site.
- Budgets: the script passes at the baseline and exits 1 when a limit is lowered below the real size.
- CI: the workflow's checks run on the PR.
- Rehearsal: a copy of production, all pending migrations, honest-content, publish validation, and a page-by-page comparison with version 26.

## Progress

### Checked at the start

- `/api/health`: 17 migrations, version 26, as `STATE.md` says.
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

The full list is in `S2-branches.md`, beside this file. Waiting on the owner.

### Stage 4: rehearsal

Route chosen: `pg_dump`.

- `pull:production` can't work yet. It refuses unless both databases have the same migrations, and the embedded one applies all 31 each time it opens.
- A Neon branch would be the closest copy, but the session would need its connection string, and creating one is the owner's call.
- A dump needs one read-only command from the owner. It leaves out `admin_users`, `sessions`, `login_attempts`, `preview_tokens` and `audit_log`, so no password hash or sign-in record reaches the laptop. The session then restores it into a private Postgres in its scratchpad, which doesn't touch the owner's server on port 5432.

The dump flags and restore sequence were tested on a throwaway database built with production's 17 migrations and a fake account: 0 accounts, 0 sessions and 0 audit rows came across, and the foreign keys went on.

Waiting for the owner to run the dump.
