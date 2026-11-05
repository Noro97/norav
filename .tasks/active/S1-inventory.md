# S1 inventory (gate G3)

Everything that has to change so the live site stops contradicting `docs/plan/facts.md`. Nothing here is live until the owner publishes.

The CMS list was tested on 2026-11-05: all 104 items applied through the real CMS on a local copy of v25, on the expected production schema, then published. A search of the result found no "Do not use" claim in either language. Production's own drafts weren't visible to this test.

## Owner decisions

The owner approved this inventory on 2026-11-05, with both recommendations:

1. **Russian is retired for now.** `/ru` redirects to the English page, the language switch is gone, and Russian has left the bundle and sitemap. Its rows stay in the CMS for S12.
2. **The CMS edits are applied by an owner-run script, `content:truth`,** which writes drafts only and refuses if a patched field has moved since v25. It is separate from `content:honest`, because S2 and S3 use that one after the migrations. `honest-content.data.mts` is corrected, not replaced.

Also removed while checking the pages: a hard-coded `<1ms` in the OmniGrid diagram and a hard-coded REAL-TIME badge on the dashboard. The hero now reserves room for its scroll hint on phones, because the longer headline collided with it at 375px.

## CMS edits

### `about`

| Field | Now | New |
| --- | --- | --- |
| about: role | Frontend-Focused Fullstack Engineer | Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js |
| about: bio.paragraphs[0].text | With 7+ years of experience shipping production code at scale, I've led frontend architecture at companies where performance budgets and pixel-perfect design aren't trade-offs — they're requirements. From building global component infrastructures for multi-million MAU ecosystems to architecting hybrid rendering strategies that dramatically boost retention. | With 8+ years in JavaScript and TypeScript, I've led frontend architecture at companies where performance budgets and pixel-perfect design aren't trade-offs — they're requirements. From a design system of 200+ components used by 15+ teams in a 10M+ MAU ecosystem, to a Next.js SSR/ISR migration that cut LCP from 3.5s to 1.1s on 3 flagship products. |
| about: bio.paragraphs[1].text | Currently seeking senior or staff-level roles at companies pushing the boundaries of modern web experiences. | Currently seeking senior fullstack roles at remote EU/US product companies. |
| about: facts[1].value | 7+ years | 8+ years |
| about: facts[2].value | Frontend, AI & Architecture | TypeScript, React, Next.js, Node.js |
| about: statusLabel | Available | Open to offers |
| about settings: cvHref | https://r36fhmjhstommjeh.public.blob.vercel-storage.com/media/acde6431-fbbe-4027-bf6d-8c1a239ae247.pdf | /cv |
| vibecoding block | Visible | Hide the block |
| tech_marquee: items[15] | AI Agents | Delete this row |

### `automation`

| Field | Now | New |
| --- | --- | --- |
| Page status | Published | Draft |
| Menu item: navigation/automation | Visible | Hide the entry |

### `home`

| Field | Now | New |
| --- | --- | --- |
| Search listing: en.title | Norayr Avetisyan — Frontend-Focused Fullstack Engineer | Norayr Avetisyan — Senior Fullstack Engineer |
| hero: subtitle | Fullstack Engineer | Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js |
| impact_strip: stats[0].value | 6 | 8 |
| impact_strip: stats[2].label | Companies | Teams on one design system |
| impact_strip: stats[2].value | 6 | 15 |
| impact_strip: stats[2].suffix | (empty) | + |
| contact_cta: body | I'm open to senior and staff-level frontend / fullstack roles — and the occasional ambitious product. The fastest way to reach me is email. | I'm open to senior fullstack roles at remote EU/US product companies. The fastest way to reach me is email. |
| contact_cta: availability | Available for new work | Open to senior fullstack roles |
| Search listing: ru.title | Норайр Аветисян — Frontend-focused fullstack-инженер | Норайр Аветисян — Senior Fullstack Engineer |

### `site`

| Field | Now | New |
| --- | --- | --- |
| terminal_footer: hire.openTo |   Open to: Senior / Staff roles |   Open to: Senior fullstack roles |

### `skills`

| Field | Now | New |
| --- | --- | --- |
| Search listing: en.description | Frontend architecture, AI and automation, design systems and performance — React, TypeScript, Next.js, Vue, Three.js, Supabase and the tooling around them. | Frontend architecture, AI features, design systems and performance — React, TypeScript, Next.js, Vue, Three.js, Supabase and the tooling around them. |
| capabilities: cards[1].title | AI & Automation | AI Features |
| capabilities: cards[1].body | Custom AI agents, LLM pipelines, and MCP-driven workflows that automate real product and engineering work. | Gemini video checks in Proof App, a Claude-backed terminal on this site, and AI-augmented team workflows with Cursor and custom MCP servers. |
| skills block | Visible | Hide the block |
| Search listing: ru.description | Фронтенд-архитектура, AI и автоматизация, дизайн-системы и производительность — React, TypeScript, Next.js, Vue, Three.js, Supabase и инструменты вокруг них. | Фронтенд-архитектура, AI-функции, дизайн-системы и производительность — React, TypeScript, Next.js, Vue, Three.js, Supabase и инструменты вокруг них. |

### `work`

| Field | Now | New |
| --- | --- | --- |
| Search listing: en.description | Shipped products — real-time logistics, faceted commerce search, an AI merch configurator, a virtualised operations console and a Telegram-native fitness platform. | Live demos — a logistics map, faceted commerce search, a merch configurator and a data grid — and Proof App, a Telegram fitness app taken to a closed beta. |
| projects_intro: label | Selected Work · 2024 — 2026 | Selected Work |
| projects_intro: heading[0].text | From zero to | Live demos, |
| projects_intro: heading[1].text | production | real code |
| projects_intro: body | Five years, six shipped products — logistics, commerce, merch AI, and an ops console powering thousands of daily users. | Four live demos — a logistics map, commerce search, a merch configurator and a data grid — plus Proof App, a Telegram fitness app taken to a closed beta. |
| projects_intro: imageAlt | A collage of shipped case studies — dashboards, mobile ops consoles, and commerce flows | A collage of the demos — dashboards, mobile ops consoles, and commerce flows |
| bento_grid: description | Micro case studies and measurable outcomes from real-world projects. | Live demos, Proof App, and measured outcomes from past roles. |
| bento_grid: tiles[0].title | Performance Audit | Stress Test |
| bento_grid: tiles[0].description | Standard Google Maps markers caused main-thread jank with 500+ real-time updates. Migrated to Advanced Markers with a rAF buffer — 70% scripting reduction, stable 60 FPS. | NexusRoute's stress test adds 40 simulated markers and their routes to a Leaflet map in batches, one batch per animation frame. |
| bento_grid: tiles[1].description | End-to-end type system between Node.js backend and React frontend, eliminating 99% of runtime API errors | At Fendr: typed API clients generated from OpenAPI with Orval, so a renamed field fails the build. |
| bento_grid: tiles[2].description | Predictive input system for complex forms, reducing shipment creation time by 15 seconds | FilterGraph keeps every filter in the URL, so any view is a link you can send. |
| bento_grid: tiles[3].description | Multi-modal AI verification pipeline achieving 98.4% confidence through Gemini vision analysis of user-submitted video proofs. | One Gemini 2.5 Flash pass judges reps, form and liveness from a user's video in Proof App. |
| bento_grid: tiles[4].title | Cache Hit-Rate | Cached, then fresh |
| bento_grid: tiles[4].description | Virtualized 10K+ row data grid with sub-millisecond cache lookups via TanStack Query stale-while-revalidate strategy. | A 100-row data grid. TanStack Query serves the cached rows at once and refetches them in the background. |
| bento_grid: projects[0].description | Real-time logistics optimization platform processing 50K+ WebSocket events/sec across 18 global hubs. | Live demo: a logistics map on Leaflet with 12 hubs, simulated routes and a stress test you can run. |
| bento_grid: projects[0].cta | View Case Study | View Demo |
| bento_grid: projects[1].description | AI-powered merchandise designer with real-time state synchronization and live configuration output. | Live demo: a merchandise configurator with real-time state synchronization and live configuration output. |
| bento_grid: projects[1].cta | View Case Study | View Demo |
| bento_grid: projects[2].description | Faceted search with dependency-aware filtering and URL-as-state architecture. | Live demo: faceted search with dependency-aware filtering and URL-as-state architecture. |
| bento_grid: projects[2].cta | View Case Study | View Demo |
| bento_grid: projects[3].description | Enterprise-grade data orchestration with headless table architecture and intelligent cache management. | Live demo: a data grid with headless table architecture and server-state caching. |
| bento_grid: projects[3].cta | View Case Study | View Demo |
| bento_grid: projects[4].description | AI-powered gamified achievement platform as a Telegram Mini App, featuring liveness detection, dual-economy reward system, and blockchain-integrated premium unlocks. | A gamified fitness app as a Telegram Mini App, taken to a closed beta: Gemini checks reps, form and liveness, with a 20-level XP economy, Telegram Stars payments and a TON wallet connection. |
| bento_grid: dashboard.metrics[0].value | 1.2 | 1.3 |
| bento_grid: dashboard.metrics[0].prefix | < | (empty) |
| bento_grid: dashboard.metrics[0].detail | Real-time tracking | Vizogen, down from 4.1s |
| bento_grid: dashboard.metrics[1].key | bundle | components |
| bento_grid: dashboard.metrics[1].label | Bundle Size | Design system |
| bento_grid: dashboard.metrics[1].value | 42 | 200 |
| bento_grid: dashboard.metrics[1].suffix | kb | + |
| bento_grid: dashboard.metrics[1].detail | Gzipped (Main thread) | Components at MTS Web Services |
| bento_grid: dashboard.metrics[2].key | gpsNodes | sessions |
| bento_grid: dashboard.metrics[2].label | GPS Nodes | Concurrent sessions |
| bento_grid: dashboard.metrics[2].suffix | + | K+ |
| bento_grid: dashboard.metrics[2].detail | Active per view | Appfox, zero state-desync incidents |
| bento_grid: dashboard.metrics[3].label | Test Coverage | Unit-test coverage |
| bento_grid: dashboard.metrics[3].value | 92 | 78 |
| bento_grid: dashboard.metrics[3].detail | Unit / E2E | Vizogen, up from 22% in three months |
| Search listing: ru.description | Выпущенные продукты — логистика реального времени, фасетный поиск, AI-конфигуратор мерча, операционная консоль с виртуализацией и фитнес-платформа в Telegram. | Живые демо — карта логистики, фасетный поиск, конфигуратор мерча и таблица данных — и Proof App, фитнес-приложение в Telegram, доведённое до закрытой беты. |

### `work/ecommerce`

| Field | Now | New |
| --- | --- | --- |
| ecommerce: sectionLabel | Case Study | Live Demo |
| Search listing: en.title | FilterGraph — faceted commerce search | FilterGraph — faceted commerce search demo |

### `work/logistics`

| Field | Now | New |
| --- | --- | --- |
| logistics: sectionLabel | Case Study | Live Demo |
| Search listing: en.title | NexusRoute — real-time logistics platform | NexusRoute — logistics map demo |
| Search listing: en.description | 50K+ WebSocket events per second across 18 hubs, GeoJSON streaming and high-frequency state reconciliation, drawn with Advanced Markers at a stable 60 FPS. | A logistics map demo on Leaflet: 12 hubs, simulated routes and markers, and a stress test you can run in the browser. |
| logistics: description | Real-time logistics optimization platform processing 50K+ WebSocket events/sec across 18 global hubs. GeoJSON streaming with high-frequency state reconciliation. | A logistics map demo on Leaflet: simulated shipments and routes around 12 hubs, drawn from GeoJSON. Run the stress test to add 40 markers in batches. |
| logistics: techStack[0].name | Google Maps API | Leaflet |
| logistics: techStack[1].name | WebSocket | React |
| logistics: techStack[4] | Zustand | Delete this row |
| logistics: techStack[3] | Advanced Markers | Delete this row |
| Search listing: ru.title | NexusRoute — платформа логистики реального времени | NexusRoute — демо карты логистики |
| Search listing: ru.description | 50K+ WebSocket-событий в секунду в 18 хабах, потоковый GeoJSON и высокочастотная сверка состояния, отрисованные Advanced Markers на стабильных 60 FPS. | Демо карты логистики на Leaflet: 12 хабов, симулированные маршруты и маркеры и стресс-тест, который можно запустить в браузере. |

### `work/merch`

| Field | Now | New |
| --- | --- | --- |
| merch: sectionLabel | Case Study | Live Demo |
| Search listing: en.title | MerchForge — AI merchandise configurator | MerchForge — merchandise configurator demo |
| merch: description | AI-powered merchandise designer with real-time state synchronization. Every UI interaction instantly reflects in the live configuration output. | A merchandise configurator with real-time state synchronization. Every UI interaction instantly reflects in the live configuration output. |
| Search listing: ru.title | MerchForge — AI-конфигуратор мерча | MerchForge — демо конфигуратора мерча |

### `work/omnigrid`

| Field | Now | New |
| --- | --- | --- |
| omnigrid: sectionLabel | Case Study | Live Demo |
| omnigrid: title | OmniGrid: Advanced Data Management System | OmniGrid |
| Search listing: en.title | OmniGrid — a virtualised operations console | OmniGrid — a data grid demo |
| omnigrid: description | High-density data grid with virtualized scrolling, headless table architecture, and server-state cache orchestration. Handling massive datasets with zero-latency UI interactions and complex server-side state synchronization. | High-density data grid with headless table architecture and server-state cache orchestration, running on 100 sample shipments. |
| Search listing: en.description | A high-density data grid: virtual scrolling, headless table architecture and server-state cache orchestration over TanStack Query, TanStack Table and Zod. | A high-density data grid demo: headless table architecture and server-state caching over TanStack Query, TanStack Table and Zod. |
| omnigrid: techStack[3] | Virtual Scroll | Delete this row |
| Search listing: ru.title | OmniGrid — операционная консоль с виртуализацией | OmniGrid — демо таблицы данных |
| Search listing: ru.description | Высокоплотная таблица данных: виртуальный скролл, headless-архитектура и оркестрация серверного кэша на TanStack Query, TanStack Table и Zod. | Демо таблицы данных высокой плотности: headless-архитектура и кэширование серверного состояния на TanStack Query, TanStack Table и Zod. |

### `work/proof`

| Field | Now | New |
| --- | --- | --- |
| proof: description | Telegram Mini App that gamifies fitness verification with real-time AI analysis. Gemini 2.5 Flash counts reps, verifies form, checks liveness — awarding Physio/Neuro points across 20 progression levels. | Telegram Mini App, taken to a closed beta, that gamifies fitness verification with AI analysis. One Gemini 2.5 Flash pass judges reps, form and liveness — awarding Physio/Neuro points across a 20-level XP economy. |

### Experience: `proof-app`

| Field | Now | New |
| --- | --- | --- |
| role | Founder & Technical Architect | Founder & Fullstack Engineer |
| type | Founder | Remote |
| period | Feb 2026 — Present | Nov 2025 — Jun 2026 |
| stack[4].name | AI Agents | Gemini |
| description | Founded and built a Telegram-native fitness platform end to end — a mobile-first Mini App and bot backed by an automated, AI-driven backend. | Built a Telegram-native fitness product end to end as the only engineer and took it to a closed beta — a mobile-first Mini App and bot on a Supabase backend. |
| achievements[0].text | Shipped a complete multi-tenant product solo — frontend, backend, and infrastructure | Designed the Postgres backend: 40+ tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues |
| achievements[1].text | Designed an AI-augmented build pipeline with custom agents, MCP servers, and Claude Code | One Gemini 2.5 Flash pass judges reps, form and liveness per video |
| achievements[2].text | Engineered a secure Supabase / PostgreSQL backend with realtime, server-authoritative logic | Built a 20-level XP economy with Telegram Stars payments and a TON wallet connection |

### Experience: `vizogen`

| Field | Now | New |
| --- | --- | --- |
| role | Lead Frontend Engineer | Lead Frontend Engineer (Fullstack Delivery) |
| type | Remote | Contract, remote |

### Experience: `appfox`

| Field | Now | New |
| --- | --- | --- |
| type | Remote | Contract, remote |

### Experience: `tirsoft-lead`

| Field | Now | New |
| --- | --- | --- |
| type | On-site | Yerevan |

### Experience: `tirsoft-frontend`

| Field | Now | New |
| --- | --- | --- |
| type | On-site | Yerevan |

### Experience: new `fendr` row, moved to the top

| Field | Value |
| --- | --- |
| slug | fendr |
| role | Frontend Engineer |
| company | Fendr (via TIRSoft LLC) |
| type | Yerevan |
| period | Sep 2026 — Present |
| description | Two web apps in a Turborepo monorepo set up from scratch. |
| achievements[0] | Built a design system of 35 components and 24 patterns |
| achievements[1] | Generated typed API clients from OpenAPI with Orval |
| achievements[2] | Backed the apps with 47 test files |
| stack | React, TypeScript, Turborepo, Orval |
| image | (none) |

## Code changes

| File | Now | Change |
| --- | --- | --- |
| `index.html` | Title, `og:title` and `twitter:title`: "Frontend-Focused Fullstack Engineer" | "Norayr Avetisyan — Senior Fullstack Engineer" |
| `index.html` | JSON-LD `jobTitle`: "Senior Frontend Engineer / UI Architect" | "Senior Fullstack Engineer" |
| `src/lib/portfolio-context.ts` | The `ask` terminal's prompt: BlazeIT, 7+ years, staff-level roles, no Fendr or Proof App, and a 3D constellation, custom cursor and magnetic buttons that are gone | Rewritten from `facts.md`: all roles and approved numbers, demos described as demos, Proof App as a closed beta, the site as it is now |
| `BentoMicroTile.tsx` | Hard-coded "60%", "99%", "15s", "98.4%", "10K+" | Remove the stat; the tile shows CMS text only |
| `ProofWidget.tsx` | "AI Confidence" counts up to 98.4% (written as `984 / 10`), "Processing" up to 1.2s | Remove both metrics. Add the caption "Simulated run with sample values." |
| `ProofVerificationTile.tsx`, `bento.json` | Log line "[AI CONFIDENCE: 98.4%]" | "[CHECKING FORM... OK]" |
| `ProofEconomyTile.tsx`, `bento.json` | "Economy & Blockchain", a 0.85 TON balance, "Transaction Flow" | "Economy & Wallet", no TON balance, "Telegram Stars Flow". The connect-wallet button stays |
| `bento.json` | "Real-time AI analysis of user-submitted challenge proofs" | "AI analysis of user-submitted challenge videos" |
| `bento.json` | "Exponential XP Curve & Trigger-based Badge System via PostgreSQL Functions" | "20-level XP economy" |
| `bento.json` | "Eliminated fraud in fitness challenges using AI-driven liveness detection and real-time video analysis within Telegram ecosystem." | "Checks fitness challenges with AI liveness detection and video analysis inside Telegram." |
| `bento.json` | "Managed complex DB schema with 27 migrations and real-time social feed with custom reaction engine." | "40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues." |
| `LogisticsWidget.tsx`, `projects.json` | Latency, WS Events and Throughput are `Math.random()`, with a frame-budget log line derived from them | Remove them. Show Nodes, Routes and Hubs, all counted from the demo |
| `projects.json` | "Run Stress Test — 500 Nodes", "Rendering... {{count}}/500" | "Run Stress Test — 40 Nodes", "Rendering... {{count}}/40". The code adds 40 |
| `projects.json` | "LIVE — {{count}} hubs" | "DEMO — {{count}} hubs" |
| `OmniGridWidget.tsx`, `projects.json` | Hard-coded "Hit Rate 98.7%" | Remove the row |
| `projects.json` | Engineering log: "reduced table bundle size by 40%", "0ms UI-lag filtering 5,000+ rows", "Unlike Redux used in the Proof project" | The same reasoning without those claims |
| `projects.json` | Unused keys that repeat claims, such as `logistics.description` | Delete them |
| `BentoProjectTile.tsx`, `OmniGridBentoTile.tsx` | Hard-coded "Case Study 01–04" on demos | "Live Demo 01–04" |
| `bento.data.ts` | NexusRoute stack: Google Maps API, WebSocket, Advanced Markers, Zustand. OmniGrid: Virtual Scroll | NexusRoute: Leaflet, React, GeoJSON. OmniGrid: no Virtual Scroll |
| `terminal.json` | `ls`: Google Maps, "AI merch", "Enterprise data grid (10K+ rows)", "TON Blockchain" | Leaflet demo, merch configurator demo, "Data grid demo (100 rows)", "closed beta" and "TON wallet" |
| `terminal.json` | `cat about.txt`: old title, 7+ years, senior / staff | The headline, 8+ years, senior fullstack roles at remote EU/US product companies |
| `terminal.json`, `terminal-commands.ts` | `cat experience.txt`: BlazeIT, and no Fendr, Proof App or Appfox | Every role and date from `facts.md` |
| `terminal.json` | `neofetch`: "GPU: Three.js + R3F + GLSL" | "GPU: CSS + SVG". The site no longer depends on `three` |
| `common.json` | "Built with React + Three.js + GSAP + TypeScript" | "Built with React + GSAP + TypeScript" |
| `ru/*.json` | The same strings in Russian, including BlazeIT | Same corrections, so S12 doesn't restore them |
| `hero.ts`, `about.ts`, `site-footer.ts`, `impact-strip.ts` | New-block defaults: "Frontend-Focused Fullstack Engineer", 7 years | The headline, 8 years |
| `cms/scripts/honest-content.data.mts` | 98.4%, 92%, 27 migrations, n8n, LangChain, staff-level wording | Corrected, or replaced by this list if the script option is chosen |
| `public/`, `vercel.json` | No `/cv` | Phone-free one-page CV PDF, with a `/cv` redirect above the rewrite |
| `vercel.json` | `/automation` would become a not-found page | Redirect to `/`, as the plan already specifies |
| `vercel.json`, `Navigation.tsx`, `PageHead.tsx`, `generate-sitemap.mjs`, `content/index.ts`, `ContentProvider.tsx`, `i18n/index.ts`, `index.html` | Russian served, linked, baked into the bundle and listed in the sitemap | Only if decision 1 is yes: `/ru` redirects to English, no switch or `hreflang`, and Russian leaves the bundle and sitemap |
| Tests | `page-head.test.ts` and others assert old strings | Updated to match |

## Left alone on purpose

- **Sample values in the Proof tiles:** Level 14 / 20, 15,000 XP, 72%, 58% and 2,450 Stars read as a mock of the app's UI, not as claims.
- **"Achievement Badges" on the Proof tile:** kept, because `facts.md` rules out badge minting, not in-app badges. The owner should say if the app has none.
- **"Fintech" wording:** the About intro and search text, and Appfox's stack. `facts.md` says iGaming with payment and KYC providers, so this isn't a contradiction. S5 rewrites it.
- **Employer achievements:** only their contradictions are fixed. Adding approved metrics is S5's copy.
- **Telegram link:** not in `facts.md`, but real, and contradicts nothing.
- **Hidden blocks' code:** the Vibe Coding and Workflow chunks stay deployed until S4, because block types are removed in two steps. No page loads them, but a search of `/assets` will still find their text.
- **Kit, seed and import data:** `portfolio-kit`, `seed.mts`, `import-content.mts` and `legacy-i18n` hold old copy that no published page uses. S4 removes the kit, and S8's scan should catch the rest.
- **Committed snapshots:** `src/content/snapshot.*.json` stay at v25 until after the publish, then get refreshed in a small follow-up PR.

## What stays public

- **Old publications:** `cms.norav.dev/api/public/content?v=25` keeps working by design. With Russian retired, `?locale=ru` also keeps returning the old Russian copy. Nothing on the site links to either.
- **Old CV:** the PDF on Vercel Blob stays reachable by direct link after `cvHref` moves. It has no phone number, but says "Frontend-Focused", "7+ years" and has no Fendr. Deleting it from the media library is the owner's call (G4).
