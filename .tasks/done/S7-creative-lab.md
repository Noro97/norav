# S7: Creative-Lab at /lab

- **Status:** Done, 2026-11-16. `norav.dev/lab/` serves ten exhibits. `creative-lab` is still private, waiting for the owner's yes (G5, D18)
- **Origin:** `docs/plan/prompts/S7-creative-lab.md`, started from `main` at `9fa855b`, in the `creative-lab` repo
- **Branches and PRs:** `Noro97/creative-lab` #1 (CI, merged first), #2 (`feat/lab-public`, the Lab); here #132 (the rewrite), #133 (the rewrite's trailing-slash fix) and this one (state)
- **Data:** the audit of all 30 exhibits, the harness and the hand-over are in the S7 session's notes folder: `audit/` (30 exhibits, 1440 px and 375 px, DPR 3, CPU 6x), `audit-final/` (the ten on the local `/lab/` build), `audit-vercel/` (on the Lab's own domain), `audit-live/` (on `norav.dev/lab`)

## What was done

- **Audit.** Every exhibit at 1440 px and 375 px: does it run, frame times over 6 s of pointer, keys and wheel, language of the visible text, console, failed requests, bytes by type, WebGL contexts, overflow; its assets' origin from image metadata (C2PA, EXIF), GLB headers, the sibling repository's history and the code's own URLs. Eight exhibits carry 54 binary files, 51.6 MB; the other 22 are procedural.
- **Public ten:** thermal, camera (Simulations); avatar, globe, tactile-glitch, web3 (WebGL & Motion); axiom, legal (Interfaces); 2048, bomber (Games). Four of the six groups. Landing and Components have none: every candidate there is Russian, hot-links photos, or has images of unknown origin.
- **Out, and why.** Russian text: aero (also 7.5 fps at 375 px under the throttle), aether, black-hole, chronos, cyber-city (42 fps), echoes, forma, nexus, and most of neon-os. Unclear rights: neon-masks (14 scans, 24.5 MB, no source or licence recorded, 120–190k triangles each), accordion (four of five images carry Google C2PA credentials: generated; 14 MB), health, eyewear, coffee, olympus, prizma and tactile-material (images with no recorded origin). Runtime hot-links or invented people: gallery and fashion (images.pexels.com; gallery's clients are invented), consulting (invented testimonials with i.pravatar.cc faces, against D19).
- **Lab build (`creative-lab#2`).** The allow-list `public-exhibits.json`; `pnpm build:lab` drops the other twenty from the catalog and a Vite plugin resolves their packages to an empty module, because dropping the entry alone still shipped the 14 `.glb` files. 6.4 MB instead of 61. `pnpm check:lab` verifies it on the build and runs in CI. `base: "/lab/"` with output in `dist/lab`, so the deployment answers at `/lab/` itself. Shell: the way back to norav.dev, title and metadata, canonical, favicon (every page logged a 404 for `favicon.ico`), a share image, reduced motion (an exhibit that moves on its own waits for "Run it anyway"), a message when WebGL is missing, a "No such exhibit" page. Fixes at 375 px: 2048 showed three of four columns, camera was 424 px wide (three rows now scroll or wrap), web3 set `data-grabbing` on `document.body`.
- **Vercel.** Project `creative-lab` in `noro97s-projects`, made with the CLI, already signed in as `noro97`: root `.`, Node 26.x, the install, build and output from the repo's `vercel.json`, Git connected. A deploy from the worktree failed to upload (`EPIPE`); the Git integration built the same commit in 31 seconds.
- **This repo.** `vercel.json` rewrites `/lab` and `/lab/(.*)` to `https://creative-lab-rho.vercel.app/lab/`. The first pattern, `/lab/:path*`, left `/lab/` itself on this site's 404 for about 15 minutes; #133 fixed it. The test allows exactly those two rewrites.

## Verified

| Check | Result |
| --- | --- |
| Lab, local: lint, typecheck, 82 tests, both builds, `check:lab` | Pass on Node 26, and in CI on the merged commit |
| Ten exhibits on `norav.dev/lab/`, 1440 px and 375 px | No console error, no failed request, no sideways scroll; 59–60 fps in 19 of 20 runs; web3 at 375 px 47 fps, p95 33 ms |
| The same ten on the Lab's own domain and on the local `/lab/` build | Same |
| Reduced motion (thermal waits, then runs; camera starts at once), no WebGL (avatar says so, camera runs), `#aero` ("No such exhibit"), home at 375 px | Checked in headless Chrome |
| Main site's entry files | `index-B8iELwjk.js` and `index-8nclQgAU.css` before and after: unchanged |
| History scan, 111 commits, every ref, masked | No keys, tokens, private keys, URLs with credentials or phone numbers. Three placeholder e-mails in demo exhibits. A regex scanner of mine, not gitleaks; it does not read stashes or dangling objects |

**What this does not show.** The machine is an Apple M5 and the throttle covers the CPU only, so 60 fps here is a floor for a mid-range phone, not proof of one. Nothing was checked on a real phone, with a screen reader, or by keyboard inside each exhibit.

## Decisions

- **No footer link yet.** The footer's page links are the menu's own list, which comes from CMS content, so a link is a content migration, a publish through the runbook and a copy review (G3). A router `Link` to `/lab` would also hit this SPA's NotFound: it has to be a plain `<a href="/lab/">`. Left for S9, with the landing teaser.
- **PR #1 in the Lab (CI)** was merged first, because it was green on its last commit and the prompt asked whether it was ready.
- **The Lab's CI keeps Node 26**, as its own commit chose, and the Vercel project runs 26.x too.

## For S9

The footer link and teaser; the 535 KB stylesheet (every exhibit's scene is imported whether it's public or not); translating the Russian exhibits if the set should grow; real-phone checks of web3 and axiom; the status bar's hard-coded "WEBGL 2.0"; the Lab catalog in the CMS.

## Owner's decisions still open

Whether `creative-lab` goes public, and on what terms, given the unconfirmed assets in its history (see `STATE.md`); and any veto on the ten.
