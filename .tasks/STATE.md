# Project state

The working model of this project. Read first every session, update every session. Check it against the code and production before trusting it.

## Stack

- **Site:** Vite 6, React 19, Tailwind 4, on Vercel. Every route is prerendered at build time. framer-motion in two widgets and Leaflet in NexusRoute, none of them on the first page. GSAP is gone with `bento_grid`.
- **CMS:** Next.js 15 App Router, `pg`, TinyMCE, on Vercel at `cms.norav.dev`. Neon Postgres, Vercel Blob.
- **Shared:** `packages/content-schema` (Zod block registry), `packages/design-tokens`.
- **Pipeline:** CMS publish, immutable snapshot, baked by `prebuild`, prerendered by `scripts/prerender.mjs`, refreshed by checksum at idle.

## Commands

See `CLAUDE.md`.

## Definition of done

See "Session rules" in `docs/plan/README.md`.

## Current focus

**Milestone 1 is done, 2026-11-21. In Milestone 2, S9 is done, 2026-11-22, and S10 on 2026-11-23.** Next is S11 (`docs/plan/prompts/S11-media-and-motion.md`). The CMS restores any published version as a new one, shows a section's earlier texts, and gives each page a share image. Details are in `.tasks/done/S10-cms-depth.md`. The home page has a Lab teaser fed by a CMS catalog. The site wears the owner's new palette (D5). Each Lab exhibit loads only its own scene stylesheet. Details are in `.tasks/done/S9-lab-teaser.md`. Sessions start each other and run production themselves (D20–D24 in `docs/plan/README.md`).

| Session | Status |
| --- | --- |
| S1 Truth patch | Done |
| S2 Baseline and cleanup | Done. Nothing ran on production except the owner's read-only dump |
| S3 Facts and content model | Done, version 27 live |
| S4 Deletion and speed | Done. D11 met on the live site, version 27 unchanged |
| S5 New site structure | Done, version 28 live. D11 holds on the live site |
| S6 Case studies | Done, version 29 live. Proof App has no footage |
| S7 Creative-Lab | Done, live at `norav.dev/lab`. Ten exhibits. `creative-lab` stays private, the owner's call on 2026-11-21 (D18) |
| S8 Launch | Done. The repo is public since 2026-11-21, after a full-history scan of a mirror clone. Security headers on the site and the CMS |
| S9 Lab teaser | Done, version 31 live. Lab catalog and teaser, facts that drifted, the new palette. `creative-lab`'s page stylesheet went from 536 KB to 183 KB |
| S10 CMS depth | Done, 0039 on production, version 31 unchanged. History and restore in the admin and in `release`, a section's earlier texts, a share image and its alt per page |

## Lab, as of 2026-11-16

- **Live at `norav.dev/lab/`**, served by a rewrite in `vercel.json` (`/lab`, and `/lab/(.*)`, which is the form that also matches `/lab/`) to `https://creative-lab-rho.vercel.app/lab/`. The site loads none of the Lab's code: the entry files are `index-B8iELwjk.js` and `index-8nclQgAU.css`, before and after.
- **Repo and project:** `Noro97/creative-lab` (private), main at the merge of #2. Vercel project `creative-lab` in `noro97s-projects`: root `.`, Node 26.x, install `pnpm install --frozen-lockfile`, build `pnpm build:lab`, output `apps/portfolio/dist`, all from the repo's own `vercel.json`, Git connected, so a push to `main` deploys. Its unique deployment URLs sit behind Vercel Authentication; the production domain is public.
- **Public ten (D8):** thermal, camera, avatar, globe, tactile-glitch, web3, axiom, legal, 2048, bomber. Landing & Brand Sites and Components & Case Studies have none. The list is `packages/catalog/src/public-exhibits.json`; the other twenty stay in dev, Storybook and the plain build, and a plain `pnpm build` still builds them. The reasons are in the Lab's README and in `.tasks/done/S7-creative-lab.md`.
- **Measured** on the live site at 1440 px and 375 px (DPR 3, CPU throttled 6x, GPU not throttled, an Apple M5): see the done file. This is a floor for a mid-range phone, not proof of one.
- **Stylesheets, since S9 (`creative-lab` #3):** the page loads one sorted utilities sheet, 183 KB raw and 49 KB gzip (it was 536 KB and 94 KB). Each exhibit's scoped scene CSS, 290–2,713 B, loads with the exhibit through `withScene` in `packages/catalog/src/catalog.ts`. The public build leaves out the hidden exhibits' sources with `@source not`. Utilities can't be split per exhibit: a later sheet's duplicate class beats an earlier responsive one (see RETRO). `check-exhibits` and `check-public-build` enforce all of this.
- The Lab's CI runs lint, types, tests, both builds and `check:lab`, which reads the finished public build for `.glb` files and the hidden exhibits' titles. There is no `merge-when-green` there: read the checks and merge by hand with `--match-head-commit`.

## Production, as of 2026-11-23

- `cms.norav.dev/api/health`: 39 migrations applied of 39 in the repo, `publishedVersion` 31, published 2026-11-21 22:06 UTC. Checksum `ba5964f38581`. The site bakes version 31 from S9's closing PR.
- 0039 (S10) added `publications.restored_from`. Nothing was published with it. No version has been restored on production; the rehearsal restored 30 over 31 on a copy and put 31 back.
- A restore leaves the drafts as they were. While the live version is a restore, Publish asks and a release's dry run says so: fix the drafts first, or the release puts back what the restore removed.
- Version 31 is S9's, written by 0036–0038:
  - the Lab teaser on `/` and nine catalog rows;
  - on `/work/norav`, "590+" tests, "35+" migrations and no count of block types;
  - no Vue.js in `knowsAbout`;
  - palette B: `#338316`, `#C32C14`, `#010123`.
- Version 30 was the owner's own publish on 2026-11-21: a trailing space in the hero's `sub`.
- Before a release, read every line of the dry run. A theme draft the owner had saved and not published turned up in S9's dry run, and a release publishes every saved draft.
- Version 29 is S6's: `/work/proof` has its story under the widget, `/work/nova-prism` and `/work/norav` are new, and `/` and `/work` list all three. Copy in `.tasks/done/S6-copy.md`, approved by the owner. Media are files under `public/assets/case-studies/`, not library items.
- Version 28 is S5's site, written by migration 0034 and reviewed by the owner: home, `/work`, `/demos/nexusroute`, `/demos/omnigrid`, `/demos/filtergraph`, `/demos/merchforge`, `/work/proof`, `/about`, `/contact`. D5's palette of the time, crimson on near-black. The menu is Work, About, Contact. The live search for "Do not use" claims finds nothing in either locale.
- `/experience` and `/skills` are archived and redirect to `/about`. The four old demo URLs redirect to `/demos/*`, and `/site` to `/`.
- English only: `/ru` redirects to English until S12. The Russian rows of every block 0034 rewrote are deleted, so `?locale=ru` returns the English copy for those.

## Baseline, 2026-11-22, S9

Version 31 with palette B, built from the closing PR, Lighthouse 13.6.0, mobile preset, median of 3, local `vite preview`. On the live site, re-measure after the deploy.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 0.90s | 0.004 | 267 KB |
| `/work/norav` | 100 | 100 | 100 | 100 | 0.90s | 0.000 | 307 KB |

**Entry bundle with version 31 baked, Node 20:**
- JS: 362.4 KB raw against a 363 KB limit, raised from 362 in S9's closing PR; 118.1 KB gzip of 119.
- CSS: 96.5 KB raw, 14.3 KB gzip.

The gzip budget has 0.9 KB left, so the snapshot should leave the entry chunk before the next sizeable publish.

## Baseline, 2026-11-21, S8

Live site, content version 29, Lighthouse 13.6.0, mobile preset, median of 3 runs:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 0.92s | 0.000 | 267 KB |
| `/about` | 100 | 100 | 100 | 100 | 1.09s | 0.000 | 313 KB |
| `/work` | 100 | 100 | 100 | 100 | 0.92s | 0.000 | 262 KB |
| `/work/proof` | 99 | 100 | 100 | 100 | 2.14s | 0.000 | 293 KB |
| `/work/nova-prism` | 100 | 100 | 100 | 100 | 0.94s | 0.000 | 437 KB |
| `/work/norav` | 100 | 100 | 100 | 100 | 0.92s | 0.000 | 309 KB |

Entry bundle unchanged from S6: JS 359.5 KB raw, 117.0 KB gzip, of 119 KB.

## Baseline, 2026-11-12, after S6

Lighthouse 13.6.0, mobile preset, one run each, on a local build of the release's snapshot. Live numbers come after the snapshot PR deploys.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 0.9s | 0.004 | 264 KB |
| `/work` | 100 | 100 | 100 | 100 | 0.9s | 0 | 259 KB |
| `/work/proof` | 95 | 100 | 100 | 100 | 2.9s | 0 | 291 KB |
| `/work/nova-prism` | 100 | 100 | 100 | 100 | 0.9s | 0 | 434 KB |
| `/work/norav` | 100 | 100 | 100 | 100 | 0.9s | 0 | 306 KB |

`/work/proof` reads 96 and 2.7s locally on version 28 too, against 2.2s live. Its LCP is the widget, which renders after the entry chunk, and the snapshot in that chunk grew with the case studies.

**Entry bundle with version 29 baked in, Node 20:** JS 359.5 KB raw, 117.0 KB gzip, of a 119 KB limit; CSS 96.3 KB raw, 14.3 KB gzip. The next sizeable publish will need the limit raised, or the snapshot moved out of the entry chunk.

## Baseline, 2026-11-10, after S5

Measure later work against these. Content version 28, live site, Lighthouse 13.6.0, mobile preset, median of 3 runs:

| Page | Performance | Accessibility | Best practices | SEO | LCP | FCP | TBT | CLS | Speed Index | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 1.3s | 1.3s | 0 ms | 0.004 | 1.3s | 265 KB |
| `/about` | 99 | 100 | 100 | 100 | 1.6s | 1.4s | 0 ms | 0.000 | 1.7s | 312 KB |
| `/work` | 100 | 100 | 100 | 100 | 1.1s | 1.1s | 0 ms | 0.000 | 1.2s | 260 KB |
| `/work/proof` | 99 | 100 | 100 | 100 | 2.2s | 1.0s | 0 ms | 0.000 | 1.5s | 286 KB |

D11 holds: LCP under 1.5s on `/`, 95+ in every category, a skip link and one H1 on every page, no sideways scroll at 375px, nothing running under reduced motion. `/`'s LCP read 0.92s after S4 with the name as the H1; the thesis, set larger, is the LCP element now. Accessibility is 100 everywhere, so a contrast slip no longer lands on the CI threshold.

**Entry bundle after S5's cleanup, Node 20:** JS 347.3 KB raw, 112.6 KB gzip; CSS 96.7 KB raw, 14.3 KB gzip. The limits in `scripts/check-bundle-size.mjs` are unchanged.

## Baseline, 2026-11-07, after S4

Content version 27.

**Lighthouse 13.6.0, mobile preset, median of 3 runs, live site:**

| Page | Performance | Accessibility | Best practices | SEO | LCP | FCP | TBT | CLS | Speed Index | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 95 | 100 | 100 | 0.92s | 0.92s | 0 ms | 0.000 | 1.03s | 287 KB |
| `/about` | 76 | 95 | 100 | 92 | 7.59s | 1.00s | 0 ms | 0.000 | 2.39s | 1,124 KB |
| `/work` | 83 | 96 | 100 | 100 | 4.71s | 0.99s | 16 ms | 0.040 | 2.27s | 1,157 KB |
| `/work/proof` | 99 | 95 | 100 | 100 | 2.17s | 0.99s | 0 ms | 0.000 | 1.54s | 264 KB |

Before S4, on content version 26:

| Page | Performance | LCP | FCP | CLS | Transfer |
| --- | --- | --- | --- | --- | --- |
| `/` | 98 | 1.88s | 1.88s | 0.000 | 449 KB |
| `/about` | 71 | 9.07s | 1.90s | 0.000 | 1,307 KB |
| `/work` | 76 | 5.36s | 1.86s | 0.017 | 925 KB |
| `/work/proof` | 88 | 3.69s | 1.87s | 0.000 | 449 KB |

**D11 on the live site, measured 2026-11-07:**

| Target | Result |
| --- | --- |
| LCP under 1.5s on mobile | Met, 0.92s |
| Lighthouse 95+ | Met: performance 100, accessibility 95, best practices 100, SEO 100 |
| No WebGL on the hiring path | Met. No WebGL context on any of the 10 pages checked, demos included |
| Full keyboard use | Met on `/`: every control is reached by Tab at 1440px and 375px, with no trap and a focus style, and Enter follows a link and opens the phone menu. Keyboard use inside widgets isn't checked. There's no skip link yet, which is in S5: 8 stops before the content at 1440px |
| Reduced-motion support | Met on `/`: with the setting on, at 375px, no animation is running after scrolling to the end and nothing stays invisible. It reads the same with the setting off |
| Enforced in CI | Yes. Lighthouse fails the build at these targets, on the median of 3 runs, along with `size:check` and `prerender:check` |

Accessibility sits exactly on 95, so the first new contrast failure in S5 can turn CI red.

What the runs point at:

- `/about`: the LCP element is the 860 KB photo with `loading="lazy"`. S5 replaces it.
- `/work`: the collage is no longer lazy, but it's still what LCP waits for. Its 0.040 CLS coincides with Inter 400 arriving and the intro paragraph re-wrapping. S5 replaces the page.
- `/work/proof`: the demo replaces its placeholder, and that counts as the LCP.
- Accessibility: `color-contrast` is the only failure, on every page. SEO on `/about`: one link isn't crawlable (`crawlable-anchors`). Both are in S5.

**Entry bundle, Node 20, built from the committed snapshot.** `npm run size:check` enforces it in CI. Only what `index.html` loads up front counts:

| | Before S4 | After S4 |
| --- | --- | --- |
| JS raw | 629.1 KB | 360.4 KB |
| JS gzip | 215.3 KB | 117.7 KB |
| CSS raw | 150.1 KB | 125.8 KB |
| CSS gzip | 20.4 KB | 16.3 KB |
| Preloaded chunks | `motion`, `gsap` | none |

`scripts/check-bundle-size.mjs` holds these numbers, rounded up to a whole KB. KB here is 1,000 bytes, as in Vite's output. The snapshot sits inside `index`, so a rebake after a big publish can need a higher limit, and S5's copy will.

**Lighthouse CI.** On GitHub's runner the build reads performance 96–98 and LCP 0.92s, with TBT from 24 to 169 ms, and only the median run counts. It now fails the job. Each CI run keeps its reports in a `lighthouse` artifact, because a passing run prints no numbers. A CI pass still doesn't prove D11 on the live site, so measure there after a change that could move it.

## Audit, 2026-11-07

`web-quality-audit` on the live site, content version 27. Lighthouse 13.6.0, mobile preset, median of 3 runs: `/` 98 with LCP 1.92s, `/about` 71 with 8.89s, `/work` 78 with 5.24s, `/work/proof` 88 with 3.59s. No regression from the baseline above.

- **Passed:** reduced motion (no running animations at 375px, against 1–7 without it), no sideways scroll at 375px, no site errors in the console, source maps closed, admin APIs return 401 without a session.
- **Done in S4:** self-hosted fonts, no count-up on the numbers strip, real 404s, long cache on hashed files.
- **Done in S5:** H1 on every page, skip link, contrast, the Email link on `/about`, photo delivery, the sitemap check.
- **Done in S8:** `nosniff`, `Referrer-Policy` and `X-Frame-Options` on the site and the CMS. No CSP yet.
- **Paused:** `ask`, so its rate limit no longer matters. The limit is per instance, so if `ask` ever comes back, a spending cap would be the real limit.
- **Not checked:** field data, screen readers, real phones, and keyboard use inside widgets and modals. `ask` couldn't answer in S8, for lack of credit; its prompt matches `facts.md`, and `claude-sonnet-5` is still a valid id.

## Blocked

Nothing.

## Owner's open items

- `/work/norav` says the CMS has "28" API routes. S10 made it 32. S10 asked whether to make it "30+", a floor like the CV's, in S11's release; no answer yet, so nothing was published. "35+" migrations still holds at 39, and "590+" tests at 718.

- Collect two real testimonials. They don't block anything.
- Two content backups from S6 are still on the Desktop, `norav-content-2026-11-10.dump` and `norav-content-2026-11-12.dump`. Production has moved on since, so they can go whenever you like.

## Decided 2026-11-22

The owner's answers to S9's questions, asked with the `grilling` skill:

- **The teaser's copy and the catalog's nine lines:** published as written.
- **web3 in the site's catalog:** left out. Its title names a "Do not use" claim. It stays in the Lab.
- **`/work/norav`'s counts:** floors, like the CV. "35+" migrations, and no count of block types. Written by 0037 with S8's two fixes.
- **The theme:** a new one. The owner's CMS draft failed contrast, so B ships: the same hues and background, the green a step darker, the rust lighter. D5 is updated.

## Decided 2026-11-21

The owner's answers to S8's questions, asked with the `grilling` skill:

- **Content fixes:** "594 automated tests" on `/work/norav` becomes "590+", and "Vue.js" comes out of the profile's `knowsAbout`. Both texts are approved. S9 carries them in its own migration and release, so two releases don't compete for a migration number.
- **CV:** the norav.dev line now says "35+ migrations, 25+ API routes", which stays true as both counts grow. `public/Norayr_Avetisyan_CV.pdf` is re-exported from the source, without the phone, the way S1 did it. Its text differs from the last export only in those two numbers.
- **Branch protection on `main`:** on. See "Merging (D20)" in `docs/plan/README.md`.
- **Commit metadata:** the third person's e-mail and the "GenSpark Developer" commits stay. History isn't rewritten.
- **Worktrees:** the four finished ones are deleted, with their local branches.
- **`creative-lab`:** stays private (D18). Its scan found no secrets, but some images have no recorded source: neon-masks' 14 scans (24.5 MB), accordion's four generated images with Google C2PA credentials, and images in health, eyewear, coffee, olympus, prizma and tactile-material. Before it can go public, each image needs a confirmed source, or has to come out of the repo and its history.
- **Lab exhibits:** all ten stay (D8), web3 included at about 47 fps at 375 px under the throttle.
- **The old CV:** goes on its own with the sweep at version 35.
- **Proof App's footage:** dropped. The study stays as it is, and `docs/plan/proof-shot-list.md` is kept in case it's wanted later.
- **`ask`:** paused. The Anthropic account won't be topped up. The command stays hidden behind `ASK_ENABLED` in `src/lib/terminal-commands.ts`, and its code stays. Don't raise it with the owner again; it comes back only if the owner brings it up.

## Tech debt register

- **Lab:** the footer has no link to `/lab/`. The footer links are CMS content, so adding one takes a migration and a copy review, and it has to be a plain `<a href="/lab/">`, because a router `Link` would hit this SPA's NotFound. The home page's teaser links there now. Ten exhibits are Russian-first and stay out (aero, aether, black-hole, chronos, cyber-city, echoes, forma, nexus, and most of neon-os); translating them would widen the set. Auto-fix could not be turned on for Norav PRs from a session started in the `creative-lab` folder, so S7 watched them by hand.
- The CMS can't preview a path into the site's public folder: Lab posters, case-study figures and a share image typed as `/og/…` show as broken images in the admin. `mediaDisplaySrc` could prefix the site's origin for a root-relative path.
- Collection rows and settings keep revisions like sections do, with no screen to read them. Nobody has asked for one.
- **Lab, small:** the shell's status bar prints "WEBGL 2.0" whatever the browser has; `lab-tabs` rows in other exhibits may still overflow at 375 px (only the public ten were checked); the Lab's CI runs Node 26, this site's CI runs 20.

- `npm audit` still reports two causes in `cms/`, both pinned upstream and neither reachable here. Next 15 pins `postcss` 8.4.31, which only runs at build time on the CMS's own CSS. `@vercel/cli-config` pins `zod` 4.1.11, and only parses local CLI config files. Checked in S8: unchanged, and the fixes are now majors, Next 16 and `@vercel/blob` 2.4. The site's 10 moderate reports are `minimatch` inside `eslint` and `typescript-eslint`, which are dev tools, and `npm audit` only offers a major-version change.
- `npm run user:add` shows the password as it's typed. The runbook says to run it in the Mac's Terminal app. Hiding the input would be a small fix.
- `.env.example`'s comment on `CMS_URL` doesn't mention that `/api/chat` reads it at runtime too. Sessions don't open `.env*` files, so the owner or a rule change has to fix it.
- Block copy states facts in its own words, reviewed against `facts.md` in S5: the hero, the numbers, the timeline's experience rows, the FAQ. Nothing keeps it in step with the profile automatically; the About stack and the terminal's `cat stack.txt` and `cat about.txt` read the profile.
- The CMS's Experience collection and the profile's roles both hold the career. The timeline reads the collection, worded for a page; the terminal reads the profile, worded for `ask`. Change both, `facts.md` first.
- The seed data no longer holds banned claims, but `seed.mts`, `import-content.mts` and `legacy-i18n` still hold other old copy. No published page uses them, and S8's scan should catch the rest.
- No local setup has a blob store, so a change to direct upload can only be tested for real on production. The token, the checks and the recording have tests.
- Migrations 0016–0027 hold old copy, and they are append-only, so a brand-new database still gets it in its drafts. 0034 rewrites what the live pages show, and leaves a database with no hero untouched.
- Four kit sections have no placed row and no use: `kit_process`, `kit_compare_table`, `kit_tool_stack`, `kit_cta_banner`, and `kit_writing` waits for a post. Their stylesheet is still in a lazy chunk.
- Confetti bursts are the wrong colour. See `.tasks/bugs/confetti-colours.md`.
- A dead class that isn't a colour utility still passes. `colour-classes.test.ts` compiles every colour-prefixed class in `src/`, but a custom name nothing defines (`case-study-tertiary-card` until 2026-11-22) or a utility outside those prefixes compiles to nothing unnoticed. One is left: `scrollbar-thin` in `TerminalFooter`. The `useReveal` hooks (`omnigrid-sidebar`, `cap-card` and the like) are meant to have no rule.
- The shipment modal's tracking timeline needs 344px and gets 293px at 375px, so "Delivered" is clipped at the panel's edge.
- MerchForge's Premium switch has no accessible name, so `/demos/merchforge` scores 94 for accessibility in Lighthouse.
- `main` has been protected since 2026-11-21, admins included, so a merge past a red check is refused. A merge by the job's token doesn't run CI on `main`, because GitHub skips workflows for it, and the branch doesn't have to be up to date first. Vercel still deploys.
- Fonts are the Latin subsets only. Russian needs the Cyrillic ones in S12. `src/i18n/locales/ru` is unreachable until then too.
- A page published since the last build returns 404 with the right content until the rebuild finishes, and its `noindex` from `404.html` stays until the next full load. A publish triggers that rebuild, so the window is short.
- Every page shares one `og:image`, `/og.png`, drawn by `scripts/generate-share-card.mjs`. S11 adds per-page images on the same method.
- A release still reports `rebuild: not_configured`, so a publish from a session needs a snapshot PR before the first paint is current. S5's took about ten minutes from release to deploy.
- `npm --prefix cms run import` stops on `tech_marquee`, which #128 removed from the registry, so a fresh embedded database gets the seed but not the rest of the content. `cms/scripts/import-content.mts` still lists the removed types.
- Case-study figures reserve a 16:9 frame (9:16 for portrait) until the file arrives, then take its own ratio, so a 16:10 still moves what's below it by about 70px, off screen. Width and height in the `case_study` schema would remove even that.
- `/about`'s photo is the site's own file, `public/assets/img/norayr-avetisyan.webp`, not a library item. Replacing it is a commit, not a CMS upload. The owner was offered a new photo and kept this one.

## Decisions

See `docs/plan/README.md`.
