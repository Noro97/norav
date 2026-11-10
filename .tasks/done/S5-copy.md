# S5 copy

Every word the new site shows, for the one review (D23). English only (D13).

**Reviewed by the owner on 2026-11-10:** approved as written, with one change: the Vizogen line about Cursor and custom MCP servers comes back (facts.md, timeline, Profile screen, FAQ). Every line marked as a new claim was confirmed.

**How to read it.** Numbers carry their source in brackets: `[facts: <row>]` is a row of `docs/plan/facts.md`, `[code: <file>]` is something I read in this repo. Nothing in "Do not use" appears. Lines marked **(new claim)** state something facts.md doesn't hold word for word, so they're the ones to read hardest.

The brief's overrides are applied: the D2 headline in the eyebrow, title and metadata, senior roles only, no contract door, no learning section, no relocation, three case studies plus Live demos, and no compare table (cut: the D2 headline needs no definition).

---

## Metadata

| Page | Title | Description |
| --- | --- | --- |
| `/` | Norayr Avetisyan — Senior Fullstack Engineer | Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js. 8+ years building interfaces at scale, and the systems under them. Based in Yerevan, working remotely. |
| `/work` | Work — Norayr Avetisyan | Case studies of products I built end to end, and four live demos you can run in the browser. |
| `/about` | About — Norayr Avetisyan | Senior Fullstack Engineer in Yerevan, writing JavaScript and TypeScript since 2018. Experience, stack, and the questions a hiring manager asks. |
| `/contact` | Contact — Norayr Avetisyan | Email, LinkedIn, GitHub, Telegram and the CV. Open to senior fullstack roles at remote EU/US product companies. |
| `/demos/nexusroute` | NexusRoute — logistics map demo | A demo: a Leaflet map with simulated shipments between 12 hub cities, and a stress test you can run in the browser. |
| `/demos/omnigrid` | OmniGrid — data grid demo | A demo: 100 sample shipments in a headless TanStack Table, cached by TanStack Query and checked by Zod. |
| `/demos/filtergraph` | FilterGraph — faceted search demo | A demo: faceted search that keeps its filters in the address, so any view is a link you can send. |
| `/demos/merchforge` | MerchForge — merch configurator demo | A demo: a merch configurator where the preview, the price and the JSON are all read from one configuration. |
| `/work/proof` | unchanged: Proof — AI fitness verification in Telegram | unchanged |

Sources: 8+ years and the headline [facts: Identity]; 12 hubs, the stress test [code: `LogisticsWidget.tsx`, `HUBS`, `total = 40`]; 100 shipments [code: `omnigrid.data.ts`, `generateShipments(100)`].

**Site description** (the default in `index.html`, JSON-LD and the share card): "Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js. Interfaces at scale, and the systems under them." It replaces facts.md's "Building high-performance interfaces at the intersection of engineering precision and visual storytelling", which the brief's voice section quotes as the thing not to write. **facts.md changes in this PR to match.**

**Share card** (1200×630 PNG): "Norayr Avetisyan" / "Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js" / "norav.dev".

## Navigation

- Logo → `/`. Then **Work** → `/work`, **About** → `/about`, **Contact** → `/contact`.
- First in the tab order, visible on focus: **Skip to content**.

## Home `/`

### Hero

- **Eyebrow:** Norayr Avetisyan · Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js
- **H1:** Interfaces at scale, *and the systems under them.* (the accent on the second half)
- **Sub:** I've written JavaScript and TypeScript since 2018. At MTS Web Services I built a design system of 200+ components that 15+ teams used. At Proof App I built the whole product alone, Postgres backend included.
  [facts: Experience "since August 2018"; MTS "200+ components, used by 15+ teams"; Proof App "Built as the only engineer"]
- **Primary button:** See the work → `/work`
- **Secondary button:** Email me → `mailto:noroavetisyan@gmail.com`
- **Status line:** Open to senior fullstack roles at remote EU/US product companies · Yerevan, UTC+4
  [facts: Availability, Location]

### Numbers

Eyebrow: **Evidence**. Each number, then what it counts, then where it's from.

| Number | Caption | Source line |
| --- | --- | --- |
| 8+ | years of JavaScript and TypeScript | Since August 2018 [facts: Experience] |
| 10M+ | monthly users in the ecosystem my design system served | MTS Web Services [facts: MTS] |
| 50K+ | concurrent sessions, with zero state-desync incidents | Appfox, iGaming portal [facts: Appfox] |
| 70+ | Postgres migrations, 40+ tables with row-level security | Proof App, built alone [facts: Proof App] |

### Case studies

- **Eyebrow:** Case studies
- **H2:** Products I built, end to end.
- **Card button:** Read the case study
- Each card shows its page's own title, description and stack, so there's one copy to keep right. A card whose page isn't published yet drops out. Until S6 publishes the other two, this section shows **Proof App only**.

**Proof App card** (the `/work/proof` header, rewritten):
- **Title:** Proof App
- **Description:** A Telegram fitness app I built as the only engineer and took to a closed beta. One Gemini 2.5 Flash pass judges reps, form and liveness. Under it: 40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues.
  [facts: Proof App, all of it]
- **Stack:** unchanged: Supabase Edge Functions, Google Gemini API, pgmq, FFmpeg.wasm, Telegram Mini App SDK

Nova Prism and norav.dev get their cards in S6, written from their own pages.

### Live demos

- **Eyebrow:** Live demos
- **H2:** Four demos you can run in the browser.
- **Intro:** These are demos, not client work. They run on sample data, and any number they show is measured as you use them.
  [facts: Live demos]
- **Card label:** Demo
- **Card button:** Open the demo
- Cards read their demo page's title, description and stack (below).

### Experience (compact)

- **Eyebrow:** Experience
- **H2:** Where I've worked.
- **Link:** Full experience → `/about`
- One row per role: dates, company, role, and the role's one-line summary (below).

### Contact

Same block on `/` and `/contact`; on `/contact` its title is the page's H1.

- **Status line:** Open to senior fullstack roles
- **Eyebrow:** Contact
- **Title:** Hiring a senior fullstack engineer?
- **Body:** Write a line about the team and the problem. Email reaches me fastest. I work from Yerevan (UTC+4), remotely, with EU and US hours overlapping.
  [facts: Location]
- **Email button:** Email me — shows `noroavetisyan@gmail.com` under it
- **CV link:** Download the CV (PDF) → `/cv`
- **Links:** GitHub, LinkedIn, Telegram [facts: Links]

## Work `/work`

- **Eyebrow:** Work
- **H1:** Products I built, end to end.
- Case-study cards, as on the home page (Proof App until S6).
- Then **Live demos**, as on the home page, with its H2.

## Live demo pages `/demos/*`

Each page: the demo's header (eyebrow **Live demo**, H1, description, stack), the running demo, then **How it works**. No number appears except what the demo measures on screen. All four were checked against their code.

### NexusRoute `/demos/nexusroute`

- **Description:** A logistics map on Leaflet: simulated shipments and routes between 12 hub cities, drawn from GeoJSON. The stress test adds 40 markers, ten per animation frame.
  [code: `LogisticsWidget.tsx` `HUBS` (12), `total = 40`, `batchSize = 10`, one `requestAnimationFrame` per batch]
- **Stack:** Leaflet, React, GeoJSON (unchanged)
- **How it works:**
  - **Markers arrive in batches.** The stress test adds ten markers per animation frame, so the map paints between batches instead of freezing until the last one.
  - **The map loads when it's needed.** Leaflet is its own chunk, fetched when this page opens, so no other page pays for it.
  - **The data is GeoJSON.** Hubs, markers and routes are plain feature collections, the format a real tracking feed would send.

### OmniGrid `/demos/omnigrid`

- **Description:** A data grid over 100 sample shipments. TanStack Table renders it without owning its markup, TanStack Query caches it, and Zod checks every response.
  [code: `omnigrid.data.ts` `generateShipments(100)`; `useShipments.ts` `useQuery`, `z.array(ShipmentRecordSchema)`]
- **Stack:** TanStack Query, TanStack Table, Zod (unchanged)
- **How it works:**
  - **Headless table.** TanStack Table owns sorting and filtering; the markup is mine, so the grid looks like the rest of the page.
  - **Cached, then fresh.** TanStack Query serves the rows it has at once and refetches in the background after 30 seconds. The panel beside the grid shows the cache's state.
    [code: `staleTime: 30_000`]
  - **Checked at the boundary.** Every response is parsed with Zod before the grid sees it, so a wrong shape fails in one place.

### FilterGraph `/demos/filtergraph`

- **Description:** Faceted search over a sample catalogue. Filters depend on each other, and the address bar holds them, so any view is a link you can send.
  [code: `EcommerceWidget.tsx` reads and writes `URLSearchParams`, `history.replaceState`]
- **Stack:** URL State, Faceted Search, Dependency Graph, React.useMemo, Modal, Multi-step Form, Confetti (unchanged)
- **How it works:**
  - **The address is the state.** Every filter is written to the query string and read back from it on load, so refresh and a shared link both land on the same view.
  - **Facets know their dependencies.** Choosing a category narrows what the other filters offer.
  - **Checkout is a mock.** The product modal walks through a three-step order with test fields. Nothing is charged or sent.
    [code: `ProductDetailModal.tsx` steps Details, Payment, Done]

### MerchForge `/demos/merchforge`

- **Description:** A merch configurator. Every control writes to one configuration, and the preview, the price and the JSON output are all read from it.
  [code: `AIMerchWidget.tsx` one `config` state, `fullOutput` and `fullJson` from `useMemo`]
- **Stack:** React State, JSON Sync, Derived Data, Typing Animation (unchanged)
- **How it works:**
  - **One source of truth.** Product, colour, size, text and quantity live in one object. Nothing else stores a copy.
  - **Derived, not stored.** The price and the output are computed from that object on every change, so they can't disagree with the preview.
  - **The output types itself out.** The JSON panel animates the new text in, so you can see what each change did.

## About `/about`

### Bio

- **Eyebrow:** About
- **H1:** Norayr Avetisyan
- **Role line:** Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js
- **Lead:** I build interfaces that many people use, and the systems they run on.
- **Paragraph 1:** I've written JavaScript and TypeScript since 2018. At MTS Web Services I built a design system of 200+ components used by 15+ teams across a 10M+ MAU ecosystem. At Vizogen I took a multi-tenant AI SaaS module's LCP from 4.1s to 1.3s, and designed its schemas, row-level security and REST contracts.
  [facts: Experience; MTS; Vizogen]
- **Paragraph 2:** In 2025 I founded Proof App and built it alone: the Telegram Mini App, a Postgres backend of 40+ tables with row-level security, 16 Edge Functions and the job queues behind them. It reached a closed beta. Now I work on two web apps at Fendr, from the monorepo up.
  [facts: Proof App; Fendr "Two web apps in a Turborepo monorepo set up from scratch"]
- **Paragraph 3:** I'm looking for a senior fullstack role at a remote EU or US product company, where the interface and the system under it are the same job.
  [facts: Availability] **(new claim: the last clause is how I'd say what you want; check it's yours)**
- **Facts:** Location — Yerevan, Armenia (UTC+4) · Experience — 8+ years · Languages — Armenian, Russian, English · Education — BSc Computer Science
  [facts: Identity]
- **Status badge on the photo:** Open to work
- **Buttons:** Download CV · GitHub · LinkedIn · Telegram · Email (a real `mailto:` link). Copy address is a separate button that says "Copied" when it works.
- **Photo alt:** Norayr Avetisyan

### Experience (full)

- **Eyebrow:** Experience
- **H2:** Since 2018, role by role.
- Each role: dates, company, role, where, one line, then the approved numbers as points, and the stack.

| Role | Line | Points | Stack |
| --- | --- | --- | --- |
| Fendr (via TIRSoft LLC) · Frontend Engineer · Sep 2026 — Present · Yerevan | Two web apps in a Turborepo monorepo, set up from scratch. | A design system of 35 components and 24 patterns · Typed API clients generated from OpenAPI with Orval · 47 test files | React, TypeScript, Turborepo, Orval |
| Proof App · Founder & Fullstack Engineer · Nov 2025 — Jun 2026 · Remote | A Telegram fitness app I built as the only engineer and took to a closed beta. | 40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues · One Gemini 2.5 Flash pass judges reps, form and liveness · A 20-level XP economy, Telegram Stars payments and TON wallet connection | React, Supabase, PostgreSQL, Gemini, Telegram Mini Apps |
| Vizogen · Lead Frontend Engineer (Fullstack Delivery) · Sep 2025 — Feb 2026 · Contract, remote | A multi-tenant AI SaaS module for 500+ enterprise users. | Designed the schemas, row-level security and REST contracts · LCP from 4.1s to 1.3s · Integration defects down 80% · Unit-test coverage from 22% to 78% in three months · Rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers | React, TypeScript, PostgreSQL, REST |
| MTS Web Services · Core Frontend Engineer / UI Architect · Feb 2024 — Jun 2025 · Remote | A design system and micro-frontend platform in a 10M+ MAU ecosystem. | 200+ components, used by 15+ teams · Time-to-market down 25% · 3–5 fewer release blockers per sprint across 8 micro-frontend verticals · Visual regression bugs down 60% across 180+ components | React, TypeScript, Module Federation, Storybook |
| Appfox · Senior Frontend Engineer · Sep 2023 — Jan 2024 · Contract, remote | A high-load iGaming portal at 50K+ concurrent sessions, with zero state-desync incidents. | WebSocket routing in a Node.js BFF · 4 payment and KYC providers behind one typed API layer with idempotency keys · Bundle size down 62% · Median time-to-root-cause from 2 hours to 25 minutes | Next.js, TypeScript, Node.js, WebSockets |
| TIRSoft LLC · Lead Frontend Developer · May 2020 — Sep 2023 · Yerevan | Frontend lead across 8+ SaaS products. | API latency down 40% with Apollo GraphQL batching · LCP down 68%, from 3.5s to 1.1s, on 3 flagship products · Project bootstrap from two weeks to three days · Mentored 5 developers, 2 promoted to senior | Next.js, React, GraphQL, Node.js |
| TIRSoft LLC · Frontend Developer · Aug 2018 — May 2020 · Yerevan | React interfaces for client products. | none | React, Redux, Sass |

[facts: Experience and Approved numbers, row by row. The stacks are the chips the live timeline already shows, minus "Fintech", "iGaming", "Generative AI" and "Design Systems", which aren't tools, plus PostgreSQL and Storybook from facts.md and the profile's skills.]

Dropped from the live timeline, because facts.md doesn't hold them: Appfox's "dynamic imports, Sentry, and PostHog", TIRSoft's "shared React / Redux form abstraction" and "API contracts with backend engineers". The owner kept them out on 2026-11-10. The Vizogen line about Cursor and MCP servers came back, confirmed by the owner, into facts.md first and then the timeline, the Profile screen and the FAQ.

### Stack

- **Eyebrow:** Stack
- **H2:** What I work with.
- The four groups of the profile's skills, as they are: Frontend · Backend and data · Infrastructure and testing · AI. [facts: the Profile screen's skills, the same list the terminal's `ask` reads]

### Questions

- **Eyebrow:** Questions
- **H2:** What a hiring manager asks first.

1. **What role are you looking for?** Senior fullstack, at a remote product company in the EU or the US. I'm most useful where the interface and the system under it meet: a design system, a performance budget, the API and schema a screen depends on.
2. **Where are you, and when do you work?** Yerevan, Armenia, at UTC+4. I work remotely, with hours that overlap EU and US teams.
   [facts: Location]
3. **How much backend do you do?** Enough to own it. At Proof App I designed the Postgres backend: 40+ tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues. At Vizogen I designed schemas, row-level security and REST contracts. This site's CMS is Next.js on raw PostgreSQL.
   [facts: Proof App; Vizogen; norav.dev]
4. **How do you use AI?** In products: at Proof App one Gemini 2.5 Flash pass judges reps, form and liveness. At Vizogen I rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers. In my own work I use Claude Code and Cursor, and I review what they write before it ships.
   [facts: Proof App; Vizogen; the last sentence confirmed by the owner on 2026-11-10]
5. **Are the demos client work?** No. NexusRoute, OmniGrid, FilterGraph and MerchForge are demos I built to show specific techniques. They run on sample data, and any number they show is measured in your browser.
   [facts: Live demos]

## Contact `/contact`

The contact block above, with **Hiring a senior fullstack engineer?** as the H1.

## Footer (every page)

- **Line under the logo:** Senior Fullstack Engineer. Yerevan, working remotely.
- **Columns:** Pages (Work, About, Contact) · Reach me (the email address, CV, GitHub, LinkedIn, Telegram)
- **Colophon:** React 19, Vite and Tailwind 4, prerendered. The content comes from a CMS I built on Next.js and PostgreSQL.
  [code: `package.json`; `cms/`]
- **Terminal toggle:** `$ open terminal` (and `$ close terminal` when open)

## Terminal (hidden until the footer toggle opens it)

- **Title:** Terminal (read by screen readers only) · no subtitle
- **Window title:** visitor@norav.dev ~ zsh · **Prompt:** visitor@norav.dev:~$ · **Placeholder:** type a command
- **Welcome:** "norav.dev terminal. Type 'help' for the commands."
- **whoami:** "visitor" / "You're reading Norayr Avetisyan's site." / "Everything here is also on the pages." / "Try: cat about.txt, ls, sudo hire"
- **sudo hire:** "Thanks. Email reaches me fastest: noroavetisyan@gmail.com" / "Open to: senior fullstack roles at remote EU/US product companies" / "Location: Yerevan, Armenia (UTC+4), remote" / the line that used to say "PARTICLE BURST ACTIVATED" now says "Or see /contact" / without sudo: "Permission denied. Try 'sudo hire'."
- **Unknown command:** "command not found: {{cmd}}. Type 'help' for the commands."
- `cat stack.txt` prints the profile's skills, the same list as About, instead of its own older one. `cat about.txt` prints the headline, the thesis, location and availability from the profile.
- `ask` stays switched off in the code (`ASK_ENABLED = false` in `src/lib/terminal-commands.ts`), so nothing here mentions it.

## 404

Unchanged from S4. Read it on the screenshots.

## Removed from the live site with this publish

- `/experience` and `/skills` (their content is on `/about`), and the sections `tech_marquee`, `projects_intro` and `bento_grid`.
- The menu items Home, Experience, Skills, Overview and Projects.
- The terminal as a full-height section at the bottom of every page.
- The old `/contact` draft's "senior or staff" banner, which never went live.
