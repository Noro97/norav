# norav.dev

Portfolio site and the custom CMS that runs it. One repository, separate deployables.

## Start here

1. Read `.tasks/STATE.md`, then `.tasks/RETRO.md`.
2. Check what they claim against the code and production. The tracker can lag or overclaim.
3. Work from `docs/plan/README.md`. It overrides older docs, including the September brief and spec.

## Layout

| Path | What it is |
| --- | --- |
| `src/`, `api/`, `server/` | The site: Vite, React 19, Tailwind 4. `server/chat.ts` backs the terminal's `ask` command |
| `cms/` | Admin UI and content API: Next.js App Router, `pg`, Zod. Own lockfile, deployed separately |
| `db/` | PostgreSQL schema: numbered SQL migrations, tested on PGlite. Own lockfile |
| `packages/content-schema/` | Block registry and snapshot contract shared by site and CMS |
| `packages/design-tokens/` | Design tokens, source of truth for colour and type |
| `docs/plan/` | The current plan, session prompts, facts and publish runbook |
| `.tasks/` | Working state: `STATE.md`, `RETRO.md`, one file per task in `active/`, `done/`, `bugs/` |

## Commands

```bash
# Site
npm ci
npm run dev
npx tsc --noEmit
npm run lint
npm test
npm run build
npm run size:check

# CMS, on the embedded database
npm --prefix cms install
npm --prefix cms run dev:local
npm --prefix cms run typecheck
npm --prefix cms test
npm --prefix cms run build

# Schema tests
npm --prefix db install
npm --prefix db test
```

CI runs all of these on Node 20. `.claude/launch.json` defines the `site` (5173) and `cms` (3300) dev servers.

## Rules

- **One session, one branch, one PR.** Commit, push, open the PR and merge it without asking, once CI passes on its latest commit. If it only works after a production step, hold the merge and give the owner the order. See "Session rules" in `docs/plan/README.md`.
- **Stop for the owner's "yes"** before anything in the approval gates in `docs/plan/README.md`.
- **Merging to `main` deploys the site.** Every change must render correctly with the content that is published right now. Check it with `curl https://cms.norav.dev/api/health`.
- **Never run a `:production` script or touch production content.** The owner does that, using `docs/plan/runbook-publish.md`.
- **Migrations are append-only.** Never edit one that has shipped. Number new ones after the highest in `db/migrations`, and add a test block in `db/tests/schema.test.mjs`.
- **Removing a block type is two steps.** Its rows are soft-deleted and published first. Only then can the code go, because publish validates every block against the registry.
- **Facts come from `docs/plan/facts.md` or from code you have read.** No invented numbers, testimonials, clients or results.
- **This repo goes public.** No secrets, phone numbers, job-search notes or employer internals in anything tracked. Don't open `.env*` files.
- **Delete rather than comment out.** No `console.log` left behind, and comments only where the reason isn't obvious.
- **Commit messages** follow the history: a plain sentence saying what is now true.
