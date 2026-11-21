# S8: Launch

- **Status:** Done, 2026-11-21. `Noro97/norav` is public. Milestone 1 is done
- **Origin:** `docs/plan/prompts/S8-launch.md`, started from `origin/main` at `bd7088a` (#134)
- **Branches and PRs:** `claude/s8-launch` (#135, the checks, headers and README), `claude/s8-state` (this record)
- **Measured on:** production at migration 35, content version 29 (checksum `4db01156478c`), entry `index-B8iELwjk.js`

## Results, item by item

| # | Item | Result | How it was checked |
| --- | --- | --- | --- |
| 1 | Every live page read as a hiring manager | Pass | The prerendered HTML of all 11 pages, as text |
| 2 | Claims against `facts.md`; "Do not use" | Pass on the pages. Two things fail outside the visible copy: see below | `grep -E` for each "Do not use" item in the live HTML, the live entry chunk, `/api/public/content` in both locales and `src/`. The only hits are "It has not been in production" (a negation, in the profile for `ask`) and a CSS `92%` |
| 3 | Code-derived numbers | One stale: "594 automated tests" on `/work/norav`, 597 today (323 site, 92 CMS, 183 schema, after this PR's one new test). 35 migrations, 28 API routes, 28 block types, 12 hubs, 40 markers ten per frame, 100 shipments, 30 s, three checkout steps all match | `ls db/migrations`, `cms/src/app/**/route.ts`, `BLOCK_REGISTRY`, the three test runners on Node 20, the widgets' source. Nova Prism and Proof App numbers come from other repos and were recounted by S6 on 2026-11-10; this session may not read them |
| 4 | Lighthouse, live | Pass. See the table below | Lighthouse 13.6.0, mobile preset, median of 3, from this Mac |
| 5 | Links, `/cv`, redirects, `/lab` | Pass. LinkedIn answers bots with 999, as always. `/favicon.ico` is a 404; the pages name `/norav-logo.svg` | `curl` on every `href`, `src` and media path in the HTML and the snapshot; all 11 redirects; `/lab`, `/lab/`, the Lab's own assets |
| 6 | Metadata and link previews | Pass, with one claim to fix: JSON-LD `knowsAbout` lists "Vue.js", which isn't in `facts.md`, the About stack or the CV. One shared `og.png`, 1200×630, as planned until S11 | `<title>`, description, canonical, `og:*`, `twitter:*` and JSON-LD on every page; `robots.txt`, `sitemap.xml` |
| 7 | Keyboard, reduced motion, 375 px, slow connection | Pass | puppeteer-core with the system Chrome, every page: no sideways scroll at 375 px; no running animation under reduced motion (OmniGrid's four transitions run 0.01 s); Tab reaches every control at 1440 and 375 px and ends on the page, the skip link lands in `main`; no console error or failed request; every page has its text with JavaScript off. Slow 3G (400 ms, 50 KB/s, CPU 4x): text paints in 1.5–1.9 s, no spinner, CLS at most 0.02 |
| 8 | `ask` | Fail, and not in code: every call returns 502 because the Anthropic account's credit balance is too low (Vercel log, `invalid_request_error`). The command stays hidden (`ASK_ENABLED = false`). Its system prompt matches `facts.md` line for line. `claude-sonnet-5` is still a valid model id | Four questions to `/api/chat` on production, the reason from `vercel logs`, the prompt printed from `buildPortfolioContext` on the committed snapshot |
| 9 | Committed snapshots | Current: version 29. What a reader finds first in them is the profile, with "Vue.js" in it | `npm run content:check` |
| 10 | Secrets, full history | Pass. gitleaks 8.30.1 over a mirror clone (148 refs, 444 commits, including the 134 `refs/pull/*/head` GitHub keeps), and a pattern scan for database URLs with passwords, private keys and tokens: only code, placeholders and one fake test token. gitleaks' four hits are its generic rule matching the words "API layer" in an i18n file. No `.env` file has ever been committed | `gitleaks git --log-opts=--all`, `scan.py` in the scratchpad, masked output only |
| 11 | Personal data | Pass for phone numbers: none in any commit, file or past CV. Found: the owner's gmail as author of most commits (it's on the site anyway); one commit by a third person, "Gurgen", with a gmail address, and two by "GenSpark Developer"; local paths under `~/Desktop/noro/` in `.tasks/` and `docs/plan/`, and S5's description of the owner's photo. Old CVs in history say "7+ years" and "Frontend-Focused", and carry no phone | `pii.py` over the mirror, `pypdf` on the four past CVs, `git grep` in `.tasks/` and `docs/` |
| 12 | `README.md` | Fixed: it now says whose site this is, links to it and the case study, lists `design-tokens`, `docs/plan` and `.tasks`, says the code is all rights reserved, explains why old copy sits in old migrations, and no longer describes GSAP, `bento_grid` or a working `ask` | Read as a stranger |
| 13 | Branches and worktrees | All 13 remote branches were merged, and are deleted, so GitHub has only `main`. 11 merged local branches deleted. Four worktrees of finished sessions remain, all clean: `festive-shannon-03cb22` (S4), `intelligent-bhaskara-a0722d` (S5), `reverent-carson-df7387` (S6), `skills-in-session-prompts`. The main checkout is on `main` with only the untracked `norav-logo.svg` | `git branch -r --merged`, `git worktree list`, `git status` in each |
| 14 | No licence file | Done: none added, and `README.md` says all rights reserved | |

### Lighthouse, live, 2026-11-21

Lighthouse 13.6.0, mobile preset, median of 3 runs, content version 29:

| Page | Performance | Accessibility | Best practices | SEO | LCP | FCP | TBT | CLS | Speed Index | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 0.92s | 0.92s | 0 ms | 0.000 | 1.01s | 267 KB |
| `/about` | 100 | 100 | 100 | 100 | 1.09s | 0.94s | 0 ms | 0.000 | 1.13s | 313 KB |
| `/work` | 100 | 100 | 100 | 100 | 0.92s | 0.92s | 8 ms | 0.000 | 1.16s | 262 KB |
| `/work/proof` | 99 | 100 | 100 | 100 | 2.14s | 0.94s | 17 ms | 0.000 | 1.54s | 293 KB |
| `/work/nova-prism` | 100 | 100 | 100 | 100 | 0.94s | 0.94s | 0 ms | 0.000 | 1.01s | 437 KB |
| `/work/norav` | 100 | 100 | 100 | 100 | 0.92s | 0.92s | 0 ms | 0.000 | 1.03s | 309 KB |

D11 holds. The norav.dev study says the home page's LCP is 1.3 s, S5's figure; it reads 0.92 s now, so the claim understates.

## Fixed in this branch

- **Security headers.** The site and the CMS sent only HSTS. Both now send `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: SAMEORIGIN`: the site from `vercel.json`, with a test, the CMS from `next.config.ts`, checked with `curl` on `dev:local`. Nothing frames either one. `SAMEORIGIN` rather than `DENY` in case the Lab, which the site's rules may also reach through the rewrite, frames its own pages. No CSP and no `Permissions-Policy`: see follow-ups.
- **`README.md`**, as in item 12.
- **Branches**, as in item 13.

## Going public

- The owner said yes on 2026-11-21, "after the PR". #135 merged at `b79f1e8` once `Merge when green` reported every check passed on `787315f`, pinned with `--match-head-commit`.
- `gh repo edit Noro97/norav --visibility public --accept-visibility-change-consequences`: `PRIVATE` before, `PUBLIC` after.
- Checked without signing in, with `curl`: the repo page answers 200 and renders the README (its tables and the "all rights are reserved" line); the API reports `private: false`, no licence; the raw README, `docs/plan/facts.md` and #135 answer 200; `/blob/main/.env` is a 404.
- Headers on production after the deploy (about a minute): `nosniff`, `Referrer-Policy` and `X-Frame-Options: SAMEORIGIN` on `/`, `/work/proof`, a hashed asset and `/lab/` (the site's rules reach the Lab through the rewrite), and on `cms.norav.dev`. Four Lab pages (`/lab/`, `#globe`, `#thermal`, `#2048`) load in headless Chrome with no console error and no failed request; the Lab uses no iframes. The entry file is still `index-B8iELwjk.js`.

## For the owner

The owner answered all of them on 2026-11-21, with every recommendation accepted. The answers are under "Decided 2026-11-21" in `STATE.md`, and `ask` waits on credit:

1. **Going public (G5).** Yes, done.
2. **Two content fixes (G3), one small release:** "594 automated tests" to "590+", and "Vue.js" out of the profile's `knowsAbout`.
3. **The CV's norav.dev line** says "31 migrations, 26 API routes"; it's 35 and 28 now.
4. **`ask`:** credit on the Anthropic account and a monthly spending cap, or launch with it off.
5. **Branch protection on `main` (G6)**, free once the repo is public.
6. **Commit metadata** of a third person (one commit), visible once public.
7. **The four finished worktrees** (G4).

## Follow-ups, not blocking

- A Content-Security-Policy: it needs hashes for React's inline scripts and the JSON-LD, the CMS origin, and the map's tile host. `Permissions-Policy` waits on knowing what the Lab's exhibits use.
- `npm audit` in `cms/`: the same two causes as before (PostCSS inside Next 15, zod inside `@vercel/cli-config`). The fixes are majors now: Next 16 and `@vercel/blob` 2.4.
- When `ask` comes back: `claude-sonnet-5-5` costs the same as `claude-sonnet-5`, but it thinks by default, so turn thinking off to keep the 512-token cap for the answer.
- OmniGrid's and MerchForge's text inputs show focus only as a faint border change.
- A `/favicon.ico` for crawlers that ask for it.
- `web-design-guidelines` wasn't run over the UI code; Lighthouse, the keyboard walk and the 375 px pass covered what it would check first.
