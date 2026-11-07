# Project state

The working model of this project. Read first every session, update every session. Check it against the code and production before trusting it.

## Stack

- **Site:** Vite 6, React 19, Tailwind 4, on Vercel. Every route is prerendered at build time. framer-motion in two widgets and `bento_grid`, GSAP in `bento_grid`, Leaflet in NexusRoute, none of them on the first page.
- **CMS:** Next.js 15 App Router, `pg`, TinyMCE, on Vercel at `cms.norav.dev`. Neon Postgres, Vercel Blob.
- **Shared:** `packages/content-schema` (Zod block registry), `packages/design-tokens`.
- **Pipeline:** CMS publish, immutable snapshot, baked by `prebuild`, prerendered by `scripts/prerender.mjs`, refreshed by checksum at idle.

## Commands

See `CLAUDE.md`.

## Definition of done

See "Session rules" in `docs/plan/README.md`.

## Current focus

Milestone 1. **S4 is done and production is current.** S5 is next. Sessions now start each other, in the order S4, S5, S6, S7, S8, and run production themselves (D20–D24 in `docs/plan/README.md`).

| Session | Status |
| --- | --- |
| S1 Truth patch | Done |
| S2 Baseline and cleanup | Done. Nothing ran on production except the owner's read-only dump |
| S3 Facts and content model | Done, version 27 live |
| S4 Deletion and speed | Done. D11 met on the live site, version 27 unchanged |
| S5 New site structure | Not started |
| S6 Case studies | Not started |
| S7 Creative-Lab | Not started |
| S8 Launch | Not started |

## Production, as of 2026-11-07

- `cms.norav.dev/api/health`: 33 migrations applied of 33 in the repo, `publishedVersion` 27, published 2026-11-07. Checksum `ea9a635bbe9a`. 0033 changed no published value, so the release came back `unchanged: true`.
- Version 27 differs from 26 only by `settings.profile` and 10 values per language that nothing reads: 7 menu anchors and 3 ambient-layer settings. The live search for "Do not use" claims and `[Placeholder` finds nothing.
- The September copy is in the database but not in the drafts that publish. Rows of the 17 removed block types are soft-deleted. The other sections and pages are hidden or unpublished, and S5 brings the new copy with the owner's review.
- English only: `/ru` redirects to English until S12. The CMS keeps Russian rows, and `?locale=ru` still returns the old Russian copy.

## Baseline, 2026-11-07, after S4

Measure later work against these. Content version 27.

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
- **Now in S5:** H1 on every page, skip link, contrast, the Email link on `/about`, photo delivery, the sitemap check.
- **Still open:** no security headers beyond HSTS on the site or the CMS, for S8. The terminal's rate limit is per instance, so the spending cap is the real limit.
- **Not checked:** field data, screen readers, real phones, keyboard use inside widgets and modals, and `ask`, because it spends the API key. S8 should confirm that `claude-sonnet-5` in `server/chat.ts:14` still answers.

## Blocked

Nothing.

## Owner's open items

- Set a monthly spending cap on the terminal's Anthropic API key before launch.
- The old CV: its row in the media library is deleted, and nothing in the drafts or settings names it. The file still answers by direct link, because versions 18–25 name it and files are kept while the last 10 publications do. It goes on its own with the sweep at version 35. It has no phone number. Say if it should go sooner.
- Collect two real testimonials. They don't block anything.

## Tech debt register

- `npm audit` still reports two causes in `cms/`, both pinned upstream and neither reachable here. Next 15 pins `postcss` 8.4.31, which only runs at build time on the CMS's own CSS. `@vercel/cli-config` pins `zod` 4.1.11, and only parses local CLI config files. Later releases of those packages clear them, so check again at S8. The site's 10 moderate reports are `minimatch` inside `eslint` and `typescript-eslint`, which are dev tools, and `npm audit` only offers a major-version change.
- `cat experience.txt` prints every highlight in the profile, 76 lines in a box that doesn't wrap, so at 375px its longest lines scroll sideways inside the box. So do `cat about.txt` and `sudo hire`. S5 can decide what the terminal should say.
- `npm run user:add` shows the password as it's typed. The runbook says to run it in the Mac's Terminal app. Hiding the input would be a small fix.
- `.env.example`'s comment on `CMS_URL` doesn't mention that `/api/chat` reads it at runtime too. Sessions don't open `.env*` files, so the owner or a rule change has to fix it.
- `cat stack.txt` in `src/i18n/locales` keeps an older skills list than the profile's. It isn't an approved-numbers problem, so S3 left it to avoid a visible change. S5 should choose one.
- Block copy still states facts in its own words: the hero, the career timeline, `terminal_footer.hire`. S5 rewrites and reviews it from `facts.md`. Nothing keeps it in step with the profile.
- The seed data no longer holds banned claims, but `seed.mts`, `import-content.mts` and `legacy-i18n` still hold other old copy. No published page uses them, and S8's scan should catch the rest.
- No local setup has a blob store, so a change to direct upload can only be tested for real on production. The token, the checks and the recording have tests.
- Migrations 0016–0027 hold old copy, and they are append-only, so a brand-new database still gets it in its drafts. 0033 soft-deletes the rows of the removed types, and the six kit sections keep theirs until S5 rewrites them.
- Confetti bursts are the wrong colour. See `.tasks/bugs/confetti-colours.md`.
- CI guards a merge only through the `merge-when-green` job (D20). A session can still merge by hand, and nothing stops a merge past a red check until branch protection, which needs GitHub Pro or a public repo. It becomes possible at S8, and turning it on then is gate G6. A merge by the job's token doesn't run CI on `main`, because GitHub skips workflows for it, and the branch doesn't have to be up to date first. Vercel still deploys.
- `tech_marquee`, `projects_intro` and `bento_grid` stay until S5 replaces them, by the owner's decision. `bento_grid` still has framer-motion, GSAP and `MagneticButton`, lazy and only on `/work`. S5's prompt removes them.
- Fonts are the Latin subsets only. Russian needs the Cyrillic ones in S12. `src/i18n/locales/ru` is unreachable until then too.
- The `/site` page is prerendered because the menu's Contact links to it. S5's navigation removes that link.
- A page published since the last build returns 404 with the right content until the rebuild finishes, and its `noindex` from `404.html` stays until the next full load. A publish triggers that rebuild, so the window is short.
- `og:image` is the SVG logo, which link unfurlers drop, so a shared link shows no image. The owner moved one static PNG up to S5, because Milestone 1 is meant to be shared. S11 adds per-page images.

## Decisions

See `docs/plan/README.md`.
