# Approved facts

Every claim on the site, in the CMS, in the terminal's prompt and in page metadata comes from this file or from code a session has read. If a fact isn't here, ask the owner. Don't infer it.

The facts the site reads live in the CMS, in the Profile screen (`settings.profile`). Migration 0032 seeded them from this file. This file stays as the review record, so change it first and the Profile screen second.

## Identity

| Fact | Value |
| --- | --- |
| Name | Norayr Avetisyan |
| Headline | Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js |
| Thesis (H1) | Interfaces at scale, and the systems under them. |
| Location | Yerevan, Armenia (UTC+4). Remote, EU/US overlap |
| Experience | 8+ years in JavaScript and TypeScript, since August 2018 |
| Email | noroavetisyan@gmail.com |
| Links | linkedin.com/in/norayravetisyan, github.com/Noro97, t.me/antarber, norav.dev |
| Availability | Open to senior fullstack roles at remote EU/US product companies |
| Education | BSc Computer Science, Armenian State University of Economics |
| Languages | Armenian (native), Russian (fluent), English (professional) |
| Site description | Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js. Interfaces at scale, and the systems under them. |

Phone numbers don't go on the site or in this repo.

## Experience

| Role | Company | Dates | Type |
| --- | --- | --- | --- |
| Frontend Engineer | Fendr (via TIRSoft LLC) | Sep 2026 – Present | Yerevan |
| Founder & Fullstack Engineer | Proof App | Nov 2025 – Jun 2026 | Remote |
| Lead Frontend Engineer (Fullstack Delivery) | Vizogen | Sep 2025 – Feb 2026 | Contract, remote |
| Core Frontend Engineer / UI Architect | MTS Web Services | Feb 2024 – Jun 2025 | Remote |
| Senior Frontend Engineer | Appfox | Sep 2023 – Jan 2024 | Contract, remote |
| Lead Frontend Developer | TIRSoft LLC | May 2020 – Sep 2023 | Yerevan |
| Frontend Developer | TIRSoft LLC | Aug 2018 – May 2020 | Yerevan |

## Approved numbers

| Where | Claim |
| --- | --- |
| Fendr | Two web apps in a Turborepo monorepo set up from scratch. Design system of 35 components and 24 patterns. Typed API clients generated from OpenAPI with Orval. 47 test files. No backend or CI/CD claims |
| Proof App | Built as the only engineer, taken to a closed beta. 40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions, 3 pgmq job queues. One Gemini 2.5 Flash pass judges reps, form and liveness. 20-level XP economy. Telegram Stars payments, TON wallet connection |
| Vizogen | Multi-tenant AI SaaS module, 500+ enterprise users. Designed schemas, row-level security and REST contracts. LCP 4.1s to 1.3s. Integration defects down 80%. Unit-test coverage 22% to 78% in three months. Rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers |
| MTS Web Services | Design system of 200+ components, used by 15+ teams in a 10M+ MAU ecosystem. Time-to-market down 25%. 3–5 fewer release blockers per sprint across 8 micro-frontend verticals. Visual regression bugs down 60% across 180+ components |
| Appfox | High-load iGaming portal at 50K+ concurrent sessions with zero state-desync incidents. WebSocket routing in a Node.js BFF. 4 payment and KYC providers behind one typed API layer with idempotency keys. Bundle size down 62%. Median time-to-root-cause 2 hours to 25 minutes |
| TIRSoft | 8+ SaaS products. API latency down 40% with Apollo GraphQL batching. LCP down 68% (3.5s to 1.1s) on 3 flagship products. Bootstrap two weeks to three days. Mentored 5 developers, 2 promoted to senior |
| Nova Prism | Trading platform of 4 apps in a monorepo. Fastify and Socket.IO API, trading engine, price feeds, OpenAPI-validated contracts, Drizzle on SQLite, React and Astro front ends, Docker, 58 test files. 70 REST operations in the contract, each registered and called in a test, and 25 typed Socket.IO events (recounted 2026-11-10) |
| norav.dev | Custom CMS on Next.js and raw PostgreSQL. Recount migrations and API routes from the code at publish time. On 2026-11-22: 37 migrations, 28 CMS API routes, 29 block types, 653 automated tests (359 site, 92 CMS, 202 schema). The site gives floors that stay true as these grow: 35+ migrations, 590+ tests, and no count of block types |
| Nor Events | In development. NestJS, Neon Postgres with pgvector, Drizzle, Better Auth, Inngest |

Re-verify code-derived numbers before publishing them, because they change.

## Do not use

These appear in older content and don't have evidence behind them. They must not return.

| Claim | Why |
| --- | --- |
| 98.4% verification confidence | Nothing in the Proof App repo supports it |
| 92% test coverage, 27 migrations (Proof App) | The repo has no test files and 70+ migrations |
| "In production" or "Shipped" for Proof App | It reached a closed beta and is described that way |
| TON payments, Web3 (TON), blockchain-integrated unlocks | Only wallet connection exists. There's no transaction code, and badge minting is off |
| Feb 2026 – Present for Proof App | Dates are Nov 2025 – Jun 2026 |
| Staff, in any title or target | Not claimed |
| Frontend-focused fullstack engineer, Senior Frontend Engineer / UI Architect | Replaced by the headline above |
| BlazeIT | The employer is MTS Web Services |
| Production-ready n8n, Make, Zapier, LangChain, "Vibe Coding" | Not claimed |
| 6+ years, 7+ years, six companies | Use 8+ years. Don't count companies |
| 42 KB bundle, sub-millisecond | Dropped in the September review |

## Live demos

NexusRoute, OmniGrid, FilterGraph and MerchForge are demos. They are labelled as demos, and any number shown with them is one measured in the demo itself. Don't present them as shipped client or employer work.
