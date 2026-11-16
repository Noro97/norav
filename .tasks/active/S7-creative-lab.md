# S7: Creative-Lab at /lab

- **Status:** In progress, 2026-11-16. The Lab's own PR (`Noro97/creative-lab#2`) is open; this branch holds the rewrite.
- **Origin:** `docs/plan/prompts/S7-creative-lab.md`, started from `main` at `9fa855b`, in the `creative-lab` repo
- **Branches:** `feat/lab-public` in `creative-lab` (#2), `claude/s7-lab-rewrite` here
- **Notes:** the audit data, the harness and the hand-over are in the shared notes folder of the S7 session: `audit/` (all 30 exhibits, 1440 px and 375 px), `audit-final/` (the public ten on the `/lab/` build), `audit-vercel/` (the same on the live deployment)

## What's being done

- Audit of the 30 exhibits, a public list of ten, and a build that holds only those ten (6.4 MB instead of 61).
- A Vercel project, `creative-lab` (team `noro97s-projects`, Node 26.x, root `.`, build `pnpm build:lab`, output `apps/portfolio/dist`, Git connected to `Noro97/creative-lab`). Its production domain is `creative-lab-rho.vercel.app`; the unique deployment URLs sit behind Vercel Authentication.
- Here: `vercel.json` rewrites `/lab` and `/lab/:path*` to `https://creative-lab-rho.vercel.app/lab/`. No catch-all: `prerender.test.ts` now allows exactly those two.

## Decisions

- **No footer link yet.** The footer's page links are the menu's own list, which comes from CMS content, so a link is a content migration, a publish through the runbook and a copy review (G3). A router `Link` to `/lab` would also hit the SPA's NotFound: it has to be a plain `<a href="/lab/">`. Left for S9, with the landing teaser.
- **Public ten:** thermal, camera, avatar, globe, tactile-glitch, web3, axiom, legal, 2048, bomber. The reasons for the other twenty are in the Lab's README.

## How it will be verified

- `norav.dev/lab` and each public exhibit at 1440 px and 375 px, with an empty console.
- The main site's entry bundle unchanged: `npm run size:check`, and the entry file's hash before and after.
