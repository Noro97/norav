# S6 copy

**Reviewed by the owner on 2026-11-12:** approved as written, with the recommendation on each open question. Published as version 29. Proof App's footage wasn't recorded, so its study has no figures.

Every word the three case studies show, for the one review (D23). English only (D13).

**How to read it.** Numbers carry their source in brackets: `[facts: <row>]` is a row of `docs/plan/facts.md`, `[code: <place>]` is something I read in the repo named. **(inferred)** marks what I guessed about motive or history, which only the owner knows. **(new claim)** marks a statement facts.md doesn't hold word for word. Those are the lines to read hardest.

Each study answers what an interviewer asks: context, the problem, three decisions with what they cost, the outcome, and what I'd do differently. Nothing in "Do not use" appears. Proof App says plainly that it reached a closed beta and has no tests. Nova Prism says nothing about clients, volumes or regulatory status, and links nowhere (owner's decision, 2026-11-07).

Each card on `/` and `/work` shows its page's first section: title, description, stack. For Proof App that's the widget's header, approved in S5 and unchanged. For the other two it's the study's own header below.

---

## Proof App `/work/proof`

**Page title:** Proof App — a Telegram fitness app I built alone
**Page description:** A Telegram Mini App where one Gemini 2.5 Flash call counts reps and checks form and liveness. Built alone and taken to a closed beta.

**Header and card:** unchanged from S5: "A Telegram fitness app I built as the only engineer and took to a closed beta. One Gemini 2.5 Flash pass judges reps, form and liveness. Under it: 40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues."

Then the widget, then the story, which has no heading of its own.

### Context

Proof App is a fitness game inside Telegram. You film a set of squats or push-ups, a model judges it, and you earn points, a streak and a level. I built it alone, from November 2025 to June 2026: the Mini App, the Postgres backend, 16 Edge Functions, and payments in Telegram Stars. It reached a closed beta and went no further. It has no automated tests.

[facts: Proof App, Experience dates; code: `src/components/prove/useProveReducer.ts` activities, no test files in the repo]
**(inferred)** "went no further": the last commit is 27 Jun 2026 and the test environment may no longer run. Say if the beta is still open.

### The problem

The game is only worth playing if the check is honest. One Gemini 2.5 Flash call does it. It asks for a random gesture at the start, so the clip is live and not a replay, then counts only the reps with acceptable form. That call could take up to 90 seconds. It runs from a webview on a phone network, and every rule about points has to hold when the phone can't be trusted.

[code: `supabase/functions/_shared/gemini-liveness.ts`, `buildB2CActivityPrompt`; 90 seconds from `docs/superpowers/specs/2026-03-22-phase1-async-worker-design.md`]

### Decisions

**01 · Judge the video on a queue, not in the request**
At first the request waited for Gemini, up to 90 seconds, and Supabase cut it off with HTTP 546. Now the phone inserts a pending row. A trigger puts a job on a pgmq queue, a worker calls Gemini, and the verdict comes back over Realtime, with polling if that drops. The cost is a queue, a worker and retries to run. A failed job now marks the proof failed with a reason, because a silent retry looked like an endless spinner.

[code: the spec above; `20260322160000_b2c_async_video_processing.sql`; Proof's `CLAUDE.md`, "Worker Error-Handling Contract"; commit "add polling fallback for Realtime failures"]

**02 · Put the rules in Postgres, not in the app**
Points are computed in the worker, never on the phone. Energy, streaks, referral gates and subscription renewals are triggers and functions, and 41 of 42 tables have row-level security. The phone can't award itself points or set its own price. The cost: that logic sits in 73 SQL migrations with no tests. When a platform grant changed, a trigger running as the caller made every proof upload fail.

[code: Proof's `CLAUDE.md` "Key Rules"; 41 of 42 and 73 recounted from `supabase/migrations`; commit `63e0913`, "pgmq enqueue triggers must be SECURITY DEFINER"] **(new claim)** the grant incident.

**03 · Compress on the phone, before the upload**
Phones film large files, and the model needs far less. FFmpeg.wasm turns each clip into 480p at one frame a second, with no audio, aiming under 1 MB. It runs single-threaded: threads need cross-origin isolation, which I left out so the app kept working inside Telegram. So compression is slower, and Gemini judges one frame a second. If compression fails, the original uploads.

[code: `src/lib/videoCompression.ts`, Proof's `CLAUDE.md` "Client-Side Video Compression"]

### Outcome

In the closed beta the loop worked end to end: film a set, get a verdict, earn points, and buy Premium with Telegram Stars. Each video is deleted as soon as it's judged. Then, in June 2026, the free tier ran out. Two cron jobs polled the workers every 10 seconds, about 518,000 calls a month, and Supabase began refusing every function, sign-in included. Now the trigger that queues a job calls the worker directly, and polling is a five-minute safety net.

[code: zero-retention in `worker-analyze-video`; the incident and the fix in `20260627120000_event_driven_video_processing.sql`; 518,000 = 2 jobs × 6 a minute × 1,440 minutes × 30 days, as that file says]
**(inferred)** that testers used the whole loop, Stars purchase included. **(new claim)** the June 2026 incident. Say if you'd rather not tell it.

### Numbers

| Value | What |
| --- | --- |
| 40+ | Postgres tables with row-level security |
| 70+ | SQL migrations |
| 16 | Edge Functions |
| 3 | pgmq job queues |

[facts: Proof App]

### What I'd do differently

I'd test the database first. The rules that matter most, points, energy and payments, are SQL, and nothing checked them but people using the app. I'd start with the queue and an event-driven worker, instead of meeting the timeout and the quota one at a time. And I'd keep to the core loop until it had real users: seasonal events and a paywall A/B test went in first.

**(inferred)** all of it. Seasonal events and the paywall A/B harness are in the code; "before it had real users" is my reading of the dates.

### Footage

From your recording, when it arrives: the verification clip (shots 3–5), the home screen (2), and the Stars screen (7), each with a poster, alt text and a caption. If a shot can't be recorded, the study goes without it.

---

## Nova Prism `/work/nova-prism`

**Page title:** Nova Prism — a trading platform in four apps
**Page description:** A contract-first Fastify and Socket.IO API, a trading engine with stop-out and liquidation, and three front ends in one monorepo, with 58 test files.

### Header and card

- **Eyebrow:** Case study
- **H1:** Nova Prism
- **Summary:** A trading platform in four apps: a landing site with live prices, a client portal for leveraged trading, a host panel, and the API under them. Fastify and Socket.IO, a trading engine, contracts checked against OpenAPI, and 58 test files.
- **Stack:** Fastify · Socket.IO · OpenAPI · Drizzle · SQLite · React · Astro · TanStack Query · Vitest · Playwright · Docker

[facts: Nova Prism; code: `README.md`]

### Context

Nova Prism is a trading platform in one pnpm monorepo. A landing site shows live prices. In the client portal, people watch markets, open leveraged positions, set alerts and talk to support. In the host panel, the operator manages clients, balances and live positions. Under all three is one API on Node 24: REST, WebSocket, a trading engine and price feeds.

[code: `README.md`, `apps/*`]
**(inferred)** that I built it alone, which the copy doesn't say yet. The repo's history is two commits, so I can't tell. Say who built it and when, if you want either on the page. Nothing about who it was for goes in unless you write it.

### The problem

A trading screen is only as good as its numbers. Price, P/L, margin level and stop-out have to agree in the engine, the portal and the host panel, while prices move every second. Four apps on one API also drift apart fast: a renamed field becomes a blank column somewhere else.

### Decisions

**01 · The contract comes first, and a test enforces it**
One OpenAPI file describes all 70 REST operations, and one typed file describes all 25 Socket.IO events. The API registers its routes from the contract and refuses one that isn't in it. Outside production, it checks every response against it. A test fails unless every operation is registered and has been called successfully. The cost: every endpoint starts as YAML, and production skips the response check.

[code: `packages/contracts/openapi.yaml`, `socket-events.ts`; `apps/api/src/contract/router.ts`; `app.ts:176`; `test/contract.test.ts:1591–1596`]

**02 · One copy of the trading math, in decimals**
Margin, P/L and liquidation math live in one package. The engine settles trades with it, and the client portal draws its numbers with the same code. Money is a decimal string from the database to the screen, never a float. The cost: decimal.js in the portal's bundle, and a change to the math changes every app at once.

[code: `packages/trading-math`, used by `apps/api` and `apps/web`; `apps/api/src/lib/money.ts`; text columns in `schema.ts`]

**03 · Settle every tick in one process**
Open positions are held in memory. Each price tick checks stop-loss, take-profit and margin for the positions on that symbol. Below the stop-out level, the engine closes the worst-losing position, then checks again. SQLite through better-sqlite3 is synchronous, so a settlement can't interleave with an order. The cost: one API process and one database file. Scaling out means moving the engine out first.

[code: `apps/api/src/trading/engine.ts`, `onTicks` and `checkMargin`]
**(inferred)** that the synchronous database was chosen for that reason.

### Outcome

The four apps start with one command on a seeded local database, and ship as two Docker images behind Caddy. The API tests boot the real Fastify app on an in-memory database and replay recorded Binance data. Playwright runs the portal and the landing site at three widths, in light and dark, with axe, and fails on a console error or a sideways scroll.

[code: `README.md` "Testing", `deploy/`]
This says nothing about where it runs or who uses it, on purpose. Add a line only if you want one.

### Numbers

| Value | What |
| --- | --- |
| 4 | apps in one monorepo |
| 70 | REST operations, each called in tests |
| 25 | typed Socket.IO events |
| 58 | test files |

[facts: Nova Prism; code: the counts above] **(new claim)** 70 and 25.

### What I'd do differently

I'd split the engine from the API before adding anything else. Today the price feed, the engine, the sockets and the REST API share one Node process and one SQLite file. That kept it simple to build and to test. It's also the first thing to move if it ever needs a second machine.

**(inferred)** all of it. The repo holds a "Backend Split Review" PDF, which I didn't open; say if this contradicts it.

### Figures

Captured from `pnpm dev` on a fresh local database with the seeded sample account ("Alex Morgan" is seed data) and simulated prices. Nothing from any deployed host. Shown after "The problem".

| File | Alt text | Caption |
| --- | --- | --- |
| `nova-prism/landing-v1.webp` | Nova Prism's landing page: the headline "Five markets. One account." beside a panel of five prices, over a scrolling ticker. | The landing site. A local run, with simulated prices. |
| `nova-prism/trading-v1.webp` | The client portal's trading screen: a BTC/USD candle chart, the account's margin figures across the top, and an order form at 10x leverage showing the margin it needs. | The trading screen, on a seeded sample account. |
| `nova-prism/positions-v1.mp4`, poster `positions-poster-v1.webp` | The portfolio over ten seconds: equity, floating P/L, margin level and the P/L of two open positions change as each price tick arrives. | Ten seconds of ticks. Equity, P/L and margin level move with every one. |

The clip is 10 seconds, muted, and plays while on screen unless the visitor asks for less motion. **Left out on purpose:** the host panel. Its client page has "Adjust virtual balance" and per-trade edit buttons, which read badly without context and say something about how the product is run.

---

## norav.dev `/work/norav`

**Page title:** norav.dev — the site and the CMS behind it
**Page description:** How this site works: a CMS on Next.js and raw PostgreSQL, a snapshot baked into every build, and what it costs to run it alone.

### Header and card

- **Eyebrow:** Case study
- **H1:** norav.dev
- **Summary:** This site, and the CMS I wrote to run it. Next.js and raw PostgreSQL on one side, Vite and React 19 on the other, joined by a snapshot that's baked into every build and revalidated after the page loads.
- **Stack:** Next.js · PostgreSQL · Zod · PGlite · Vite · React 19 · Tailwind 4 · Vercel

### Context

norav.dev is my portfolio, and the CMS behind it is part of the portfolio. The site is Vite and React 19, prerendered at build time. The CMS is Next.js on raw PostgreSQL, with no ORM. The two share one package of block schemas. I wanted the site to show how I work, not just list it, and a CMS I can open in an interview does that. I built both, and I run both, alone.

[code: this repo; facts: norav.dev]
**(inferred)** "I wanted the site to show how I work": the reason for a custom CMS is yours to state.

### The problem

A portfolio has to be fast and must never break. A CMS adds a database, an admin and a deploy, and each of them can fail. The site has to paint without waiting for the CMS. And a publish must not be able to ship a page that renders broken.

### Decisions

**01 · Bake the content into the build, then revalidate**
Each build bakes the published snapshot into the bundle, and every route is prerendered to HTML. The first paint makes no request to the CMS, and a CMS outage can't break a deploy. Once the page is idle, it asks the CMS for a checksum and swaps in newer content only if it differs. The cost: two copies of the content, and a publish reaches the first paint only after a rebuild.

[code: `scripts/fetch-content.mjs`, `scripts/prerender.mjs`, `src/content/ContentProvider.tsx`]

**02 · One block registry for the admin, publish and the site**
Each of the 28 block types is a Zod schema in a shared package. The admin draws its forms from it, publish validates every block against it, and the site takes its types from it. A page that would render broken can't be published. The cost: validation checks shape, not truth, so a false claim passes. And removing a block type takes two releases: retire its rows, then its code.

[code: `packages/content-schema`, `BLOCK_REGISTRY`; `cms/src/app/api/admin/publish/route.ts`; RETRO 2026-11-06]

**03 · Raw SQL and append-only migrations, tested on an embedded Postgres**
There are 35 numbered SQL migrations, never edited once shipped. The schema tests apply them all to PGlite, Postgres compiled to WebAssembly, and local development runs on it with no database server. Each publication is an immutable row, so any version can be read back. The cost: no ORM writes a migration for me, and content changes are SQL written by hand.

[code: `db/migrations` (35 with this session's), `db/tests/schema.test.mjs`, `npm --prefix cms run dev:local`]

### Outcome

On the mobile preset, the home page scores 100 in all four Lighthouse categories, with LCP at 1.3 seconds. Owning it has a cost, and it's real. In early November 2026, production was 14 migrations behind main, and the September rebuild's copy had never gone live. A 4.5 MB request limit on Vercel had quietly broken larger uploads. Now every release runs one rehearsed sequence: backup, rehearsal on a copy, dry run, then the change.

[code: `.tasks/STATE.md` baseline, Lighthouse 13.6.0, median of 3, 2026-11-10; RETRO 2026-11-05 and 2026-11-07; `docs/plan/runbook-publish.md`]

### Numbers

| Value | What |
| --- | --- |
| 35 | SQL migrations, append-only |
| 28 | API routes in the CMS |
| 594 | automated tests: site, CMS and schema |
| 1.3s | LCP on mobile, home page |

[code: recounted; 594 = 319 site + 92 CMS + 183 schema checks with this session's tests, recounted again before publishing] **(new claim)** all four.

### What I'd do differently

Was it worth it? As a content tool, no: a hosted CMS would have cost far less time for a site that changes once a month. As evidence of how I work, yes: I can open any layer of it in an interview, from a migration to the first paint. I'd wire the site rebuild into the release script on day one, and publish early. The September rebuild merged 21 PRs, and none of its copy went live for six weeks.

[RETRO 2026-11-05, 2026-11-06]
**(inferred)** the verdict on whether it was worth it. It's yours to give.

### Figures

The CMS running locally on its embedded database, never `cms.norav.dev`. Nothing was saved or published.

| File | Alt text | Caption |
| --- | --- | --- |
| `norav/validation-v1.webp` | The CMS editor open on this case study. Above the form, "Validation failed" names one field, translations.en.decisions.3.body, as too short. | The CMS, running locally, refusing to save this page: a decision with no reasoning, and the field it's in. |

---

## Proof App widget, `/work/proof`

The widget is a simulation, captioned "Simulated run with sample values." Checked against the Proof App code, it still showed what the app doesn't do. Its behaviour stays the same.

| Was | Now | Why |
| --- | --- | --- |
| Six activities, with Reading | The five the app verifies: squats, push-ups, jumping jacks, plank, burpees | `ActivityType` and `BASE_POINTS` in `useProveReducer.ts` |
| Gestures: turn your head left, smile at the camera | The app's five: touch your nose, wave your hand, give a thumbs up, point to the camera, make a peace sign | `LIVENESS_GESTURES`; the two dropped are from the B2B API |
| Points per set: 35, 30, 25, 40, 45 | Points per rep × the sample's reps: 60, 70, 45, 600, 80 | `BASE_POINTS`, and `basePoints × count` in `worker-analyze-video` |
| +120 XP and a "2x Premium" pill on every run | Gone | The video worker awards physio points and a streak, not XP; the sample isn't Premium |
| Streak: a random 7–26 days | 1 day | `award_points_and_update_streak`: a first passing proof starts a streak at 1 |
| "Share to Telegram" button that did nothing | Gone | A control with no action |

---

## Shot lists for optional clips

You don't have to record these. Screenshots cover both studies; a clip only adds motion where motion is the point. Same rules as Proof App's list: no microphone, no notifications, nothing from production.

### Nova Prism

Run `pnpm dev` in `~/Desktop/projects/nova` on a fresh database (I can start it for you), sign in as the seeded client.

| # | Show | Length | Proves |
| --- | --- | --- | --- |
| 1 | Trading screen: pick an instrument, set leverage and a stop-loss, open a position | 10s | The order form and the contract |
| 2 | Open positions with P/L moving on each tick | 5s | Done: I recorded it locally, `positions-v1.mp4` |
| 3 | Host panel's live positions updating beside the portal, two windows side by side | 10s | Realtime to the host panel |

### norav.dev

Run the CMS locally (`npm --prefix cms run dev:local`), never `cms.norav.dev`. **Don't press Publish**: use Preview.

| # | Show | Length | Proves |
| --- | --- | --- | --- |
| 1 | Open a page, edit a block's field, see the form check it | 10s | One registry drives the form |
| 2 | Preview the draft on the site | 10s | Drafts render before they publish |
