# S2: Baseline and cleanup

You're measuring where the site stands, clearing old noise out of the repo, and rehearsing the production publish so it stops being the scary last step. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, `docs/plan/runbook-publish.md`
- `cms/DEPLOY.md`, `db/README.md`

## 2. Where we are

- S1 corrected the live claims. Confirm with `.tasks/done/` and the live site.
- Committed snapshots in `src/content/` may still be older than production.
- `docs/superpowers/` holds a replaced spec and two stale checkbox plans.
- At last count: 92 merged remote branches, 4 unmerged (`feat/cms-media`, `feat/motion-that-can-be-grabbed`, `claude/react-components-animations-l7oltw`, `claude/relaxed-mccarthy-eqacxq`), and 5 worktrees. Recount them.
- Known doc conflicts are listed in the tech debt register in `STATE.md`.
- Production is behind on migrations. Some pending ones write placeholder content rows, and `cms/scripts/honest-content.mts` exists to hide those.

## 3. Goal and principles

- Real numbers to measure later work against.
- Budgets in CI, so speed can't quietly regress.
- A runbook someone has actually tested against a copy of production.
- A repo a stranger could read without tripping over abandoned plans.

## 4. Reference

- Run Lighthouse locally with `npx -y lighthouse`. Chrome is installed, and the PageSpeed API quota is unreliable.
- `npm --prefix cms run pull:production` reads production into local. It needs `cms/.env`, which only exists in the owner's main checkout, so the owner runs it.
- Current CI is `.github/workflows/ci.yml`, on Node 20.
- Project skills in `.claude/skills/` are gitignored, so worktrees don't have them. Read them from `~/Desktop/projects/webapp/.claude/skills/` when a prompt names one.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Deleting branches or worktrees is gate G4. Show the full list first.

## 6. Tasks in order

### Stage 0: baseline

1. Lighthouse, mobile preset, median of 3 runs, on the live `/`, `/about`, `/work` and one case-study page.
2. Build locally and record entry JS and CSS sizes, before and after gzip.
3. Put the numbers in `STATE.md`.

### Stage 1: documents

4. Refresh the committed snapshots from production: `CMS_URL=https://cms.norav.dev npm run content:pull`.
5. Move `docs/superpowers/` to `docs/archive/2026-09-redesign/`, and fix the paths in `docs/plan/README.md`.
6. Fix the doc conflicts in the tech debt register so the READMEs match the code. Where the README promises revision restore, say that it isn't built yet.
7. Read the tracked `.claude/settings.json` and `.claude/launch.json`, and flag anything that shouldn't be public.

### Stage 2: budgets in CI

8. Add a script that fails the build if entry JS or CSS grows past the current baseline. S4 lowers the limit.
9. Add Lighthouse CI against a local preview of `/`. Keep it warn-only for now. S4 turns it into a failure at the D11 targets.
10. Add `content:check` to CI only if it won't fail for unrelated publishes. If it would, say so and leave it out.

### Stage 3: branches

11. List every remote branch and worktree. Give each unmerged branch one line on what it holds and whether anything is worth keeping.

**Report to me and wait.** Delete only what the owner approves.

### Stage 4: rehearse the catch-up

12. Work out how to get a copy of production: `pull:production`, a Neon branch, or a `pg_dump`. Give the owner the exact command to run.
13. On the copy, apply all pending migrations, run the honest-content step, and run publish validation.
14. Compare the result with live content, page by page. What would appear, disappear or fail? Look hardest for `[Placeholder` text and anything from "Do not use" in `facts.md`.
15. Correct `docs/plan/runbook-publish.md` from what actually happened, and write the exact catch-up sequence for S3 into it.

**Report to me:** does the catch-up work on the copy, and what has to change first?

### Stage 5: PR

16. Open the PR.

## 7. At the end

Update `.tasks/`. Your final message gives the baseline numbers, the rehearsal result, and whether S3's catch-up looks safe. S7 can start any time after this merges.
