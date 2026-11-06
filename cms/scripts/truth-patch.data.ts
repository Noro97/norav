/**
 * The truth patch: every draft edit that stops the live site contradicting
 * docs/plan/facts.md, against the content published as version 25. Applied by
 * truth-patch.mts, and reviewed by the owner in .tasks/done/S1-inventory.md.
 *
 * Kept apart so a test can check the copy without a database.
 */
const HEADLINE = 'Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js'

export interface CreateEntry {
  kind: 'entry-create'
  collection: string
  slug: string
  data: Record<string, unknown>
  content: Record<string, unknown>
}

export type TruthEdit =
  | { kind: 'block'; page: string; type: string; path: string; from: unknown; to: unknown }
  | { kind: 'block-setting'; page: string; type: string; path: string; from: string; to: string }
  /** Deletes a row of a list, by its name. */
  | { kind: 'block-remove'; page: string; type: string; path: string; from: string }
  | { kind: 'block-hide'; page: string; type: string }
  | { kind: 'seo'; page: string; path: string; from: string; to: string }
  | { kind: 'page-unpublish'; page: string }
  | { kind: 'entry'; collection: string; slug: string; path: string; from: unknown; to: unknown }
  | { kind: 'entry-hide'; collection: string; slug: string }
  | CreateEntry

const b = (page: string, type: string, path: string, from: unknown, to: unknown): TruthEdit => ({ kind: 'block', page, type, path, from, to })
const rm = (page: string, type: string, path: string, from: string): TruthEdit => ({ kind: 'block-remove', page, type, path, from })
const seo = (page: string, path: string, from: string, to: string): TruthEdit => ({ kind: 'seo', page, path, from, to })
const e = (collection: string, slug: string, path: string, from: unknown, to: unknown): TruthEdit => ({ kind: 'entry', collection, slug, path, from, to })

export const edits: TruthEdit[] = [
  // About
  b('about', 'about', 'role', 'Frontend-Focused Fullstack Engineer', HEADLINE),
  b('about', 'about', 'bio.paragraphs.0.text',
    "With 7+ years of experience shipping production code at scale, I've led frontend architecture at companies where performance budgets and pixel-perfect design aren't trade-offs — they're requirements. From building global component infrastructures for multi-million MAU ecosystems to architecting hybrid rendering strategies that dramatically boost retention.",
    "With 8+ years in JavaScript and TypeScript, I've led frontend architecture at companies where performance budgets and pixel-perfect design aren't trade-offs — they're requirements. From a design system of 200+ components used by 15+ teams in a 10M+ MAU ecosystem, to a Next.js SSR/ISR migration that cut LCP from 3.5s to 1.1s on 3 flagship products."),
  b('about', 'about', 'bio.paragraphs.1.text',
    'Currently seeking senior or staff-level roles at companies pushing the boundaries of modern web experiences.',
    'Currently seeking senior fullstack roles at remote EU/US product companies.'),
  b('about', 'about', 'facts.1.value', '7+ years', '8+ years'),
  b('about', 'about', 'facts.2.value', 'Frontend, AI & Architecture', 'TypeScript, React, Next.js, Node.js'),
  b('about', 'about', 'statusLabel', 'Available', 'Open to offers'),
  { kind: 'block-setting', page: 'about', type: 'about', path: 'cvHref', from: 'https://r36fhmjhstommjeh.public.blob.vercel-storage.com/media/acde6431-fbbe-4027-bf6d-8c1a239ae247.pdf', to: '/cv' },
  { kind: 'block-hide', page: 'about', type: 'vibecoding' },
  rm('about', 'tech_marquee', 'items', 'AI Agents'),

  // Automation
  { kind: 'page-unpublish', page: 'automation' },
  { kind: 'entry-hide', collection: 'navigation', slug: 'automation' },

  // Home
  seo('home', 'en.title', 'Norayr Avetisyan — Frontend-Focused Fullstack Engineer', 'Norayr Avetisyan — Senior Fullstack Engineer'),
  b('home', 'hero', 'subtitle', 'Fullstack Engineer', HEADLINE),
  b('home', 'impact_strip', 'stats.0.value', 6, 8),
  b('home', 'impact_strip', 'stats.2.label', 'Companies', 'Teams on one design system'),
  b('home', 'impact_strip', 'stats.2.value', 6, 15),
  b('home', 'impact_strip', 'stats.2.suffix', '', '+'),
  b('home', 'contact_cta', 'body',
    "I'm open to senior and staff-level frontend / fullstack roles — and the occasional ambitious product. The fastest way to reach me is email.",
    "I'm open to senior fullstack roles at remote EU/US product companies. The fastest way to reach me is email."),
  b('home', 'contact_cta', 'availability', 'Available for new work', 'Open to senior fullstack roles'),

  // Terminal copy
  b('site', 'terminal_footer', 'hire.openTo', '  Open to: Senior / Staff roles', '  Open to: Senior fullstack roles'),

  // Skills
  seo('skills', 'en.description',
    'Frontend architecture, AI and automation, design systems and performance — React, TypeScript, Next.js, Vue, Three.js, Supabase and the tooling around them.',
    'Frontend architecture, AI features, design systems and performance — React, TypeScript, Next.js, Vue, Three.js, Supabase and the tooling around them.'),
  b('skills', 'capabilities', 'cards.1.title', 'AI & Automation', 'AI Features'),
  b('skills', 'capabilities', 'cards.1.body',
    'Custom AI agents, LLM pipelines, and MCP-driven workflows that automate real product and engineering work.',
    'Gemini video checks in Proof App, a Claude-backed terminal on this site, and AI-augmented team workflows with Cursor and custom MCP servers.'),
  { kind: 'block-hide', page: 'skills', type: 'skills' },

  // Work: intro
  seo('work', 'en.description',
    'Shipped products — real-time logistics, faceted commerce search, an AI merch configurator, a virtualised operations console and a Telegram-native fitness platform.',
    'Live demos — a logistics map, faceted commerce search, a merch configurator and a data grid — and Proof App, a Telegram fitness app taken to a closed beta.'),
  b('work', 'projects_intro', 'label', 'Selected Work · 2024 — 2026', 'Selected Work'),
  b('work', 'projects_intro', 'heading.0.text', 'From zero to', 'Live demos,'),
  b('work', 'projects_intro', 'heading.1.text', 'production', 'real code'),
  b('work', 'projects_intro', 'body',
    'Five years, six shipped products — logistics, commerce, merch AI, and an ops console powering thousands of daily users.',
    'Four live demos — a logistics map, commerce search, a merch configurator and a data grid — plus Proof App, a Telegram fitness app taken to a closed beta.'),
  b('work', 'projects_intro', 'imageAlt',
    'A collage of shipped case studies — dashboards, mobile ops consoles, and commerce flows',
    'A collage of the demos — dashboards, mobile ops consoles, and commerce flows'),

  // Work: bento grid
  b('work', 'bento_grid', 'description',
    'Micro case studies and measurable outcomes from real-world projects.',
    'Live demos, Proof App, and measured outcomes from past roles.'),
  b('work', 'bento_grid', 'tiles.0.title', 'Performance Audit', 'Stress Test'),
  b('work', 'bento_grid', 'tiles.0.description',
    'Standard Google Maps markers caused main-thread jank with 500+ real-time updates. Migrated to Advanced Markers with a rAF buffer — 70% scripting reduction, stable 60 FPS.',
    "NexusRoute's stress test adds 40 simulated markers and their routes to a Leaflet map in batches, one batch per animation frame."),
  b('work', 'bento_grid', 'tiles.1.description',
    'End-to-end type system between Node.js backend and React frontend, eliminating 99% of runtime API errors',
    'At Fendr: typed API clients generated from OpenAPI with Orval, so a renamed field fails the build.'),
  b('work', 'bento_grid', 'tiles.2.description',
    'Predictive input system for complex forms, reducing shipment creation time by 15 seconds',
    'FilterGraph keeps every filter in the URL, so any view is a link you can send.'),
  b('work', 'bento_grid', 'tiles.3.description',
    'Multi-modal AI verification pipeline achieving 98.4% confidence through Gemini vision analysis of user-submitted video proofs.',
    "One Gemini 2.5 Flash pass judges reps, form and liveness from a user's video in Proof App."),
  b('work', 'bento_grid', 'tiles.4.title', 'Cache Hit-Rate', 'Cached, then fresh'),
  b('work', 'bento_grid', 'tiles.4.description',
    'Virtualized 10K+ row data grid with sub-millisecond cache lookups via TanStack Query stale-while-revalidate strategy.',
    'A 100-row data grid. TanStack Query serves the cached rows at once and refetches them in the background.'),
  b('work', 'bento_grid', 'projects.0.description',
    'Real-time logistics optimization platform processing 50K+ WebSocket events/sec across 18 global hubs.',
    'Live demo: a logistics map on Leaflet with 12 hubs, simulated routes and a stress test you can run.'),
  b('work', 'bento_grid', 'projects.0.cta', 'View Case Study', 'View Demo'),
  b('work', 'bento_grid', 'projects.1.description',
    'AI-powered merchandise designer with real-time state synchronization and live configuration output.',
    'Live demo: a merchandise configurator with real-time state synchronization and live configuration output.'),
  b('work', 'bento_grid', 'projects.1.cta', 'View Case Study', 'View Demo'),
  b('work', 'bento_grid', 'projects.2.description',
    'Faceted search with dependency-aware filtering and URL-as-state architecture.',
    'Live demo: faceted search with dependency-aware filtering and URL-as-state architecture.'),
  b('work', 'bento_grid', 'projects.2.cta', 'View Case Study', 'View Demo'),
  b('work', 'bento_grid', 'projects.3.description',
    'Enterprise-grade data orchestration with headless table architecture and intelligent cache management.',
    'Live demo: a data grid with headless table architecture and server-state caching.'),
  b('work', 'bento_grid', 'projects.3.cta', 'View Case Study', 'View Demo'),
  b('work', 'bento_grid', 'projects.4.description',
    'AI-powered gamified achievement platform as a Telegram Mini App, featuring liveness detection, dual-economy reward system, and blockchain-integrated premium unlocks.',
    'A gamified fitness app as a Telegram Mini App, taken to a closed beta: Gemini checks reps, form and liveness, with a 20-level XP economy, Telegram Stars payments and a TON wallet connection.'),

  // Work: dashboard, approved numbers only
  b('work', 'bento_grid', 'dashboard.metrics.0.value', 1.2, 1.3),
  b('work', 'bento_grid', 'dashboard.metrics.0.prefix', '<', ''),
  b('work', 'bento_grid', 'dashboard.metrics.0.detail', 'Real-time tracking', 'Vizogen, down from 4.1s'),
  b('work', 'bento_grid', 'dashboard.metrics.1.key', 'bundle', 'components'),
  b('work', 'bento_grid', 'dashboard.metrics.1.label', 'Bundle Size', 'Design system'),
  b('work', 'bento_grid', 'dashboard.metrics.1.value', 42, 200),
  b('work', 'bento_grid', 'dashboard.metrics.1.suffix', 'kb', '+'),
  b('work', 'bento_grid', 'dashboard.metrics.1.detail', 'Gzipped (Main thread)', 'Components at MTS Web Services'),
  b('work', 'bento_grid', 'dashboard.metrics.2.key', 'gpsNodes', 'sessions'),
  b('work', 'bento_grid', 'dashboard.metrics.2.label', 'GPS Nodes', 'Concurrent sessions'),
  b('work', 'bento_grid', 'dashboard.metrics.2.suffix', '+', 'K+'),
  b('work', 'bento_grid', 'dashboard.metrics.2.detail', 'Active per view', 'Appfox, zero state-desync incidents'),
  b('work', 'bento_grid', 'dashboard.metrics.3.label', 'Test Coverage', 'Unit-test coverage'),
  b('work', 'bento_grid', 'dashboard.metrics.3.value', 92, 78),
  b('work', 'bento_grid', 'dashboard.metrics.3.detail', 'Unit / E2E', 'Vizogen, up from 22% in three months'),

  // Demo pages
  b('work/ecommerce', 'ecommerce', 'sectionLabel', 'Case Study', 'Live Demo'),
  seo('work/ecommerce', 'en.title', 'FilterGraph — faceted commerce search', 'FilterGraph — faceted commerce search demo'),

  b('work/logistics', 'logistics', 'sectionLabel', 'Case Study', 'Live Demo'),
  seo('work/logistics', 'en.title', 'NexusRoute — real-time logistics platform', 'NexusRoute — logistics map demo'),
  seo('work/logistics', 'en.description',
    '50K+ WebSocket events per second across 18 hubs, GeoJSON streaming and high-frequency state reconciliation, drawn with Advanced Markers at a stable 60 FPS.',
    'A logistics map demo on Leaflet: 12 hubs, simulated routes and markers, and a stress test you can run in the browser.'),
  b('work/logistics', 'logistics', 'description',
    'Real-time logistics optimization platform processing 50K+ WebSocket events/sec across 18 global hubs. GeoJSON streaming with high-frequency state reconciliation.',
    'A logistics map demo on Leaflet: simulated shipments and routes around 12 hubs, drawn from GeoJSON. Run the stress test to add 40 markers in batches.'),
  b('work/logistics', 'logistics', 'techStack.0.name', 'Google Maps API', 'Leaflet'),
  b('work/logistics', 'logistics', 'techStack.1.name', 'WebSocket', 'React'),
  rm('work/logistics', 'logistics', 'techStack', 'Zustand'),
  rm('work/logistics', 'logistics', 'techStack', 'Advanced Markers'),

  b('work/merch', 'merch', 'sectionLabel', 'Case Study', 'Live Demo'),
  seo('work/merch', 'en.title', 'MerchForge — AI merchandise configurator', 'MerchForge — merchandise configurator demo'),
  b('work/merch', 'merch', 'description',
    'AI-powered merchandise designer with real-time state synchronization. Every UI interaction instantly reflects in the live configuration output.',
    'A merchandise configurator with real-time state synchronization. Every UI interaction instantly reflects in the live configuration output.'),

  b('work/omnigrid', 'omnigrid', 'sectionLabel', 'Case Study', 'Live Demo'),
  b('work/omnigrid', 'omnigrid', 'title', 'OmniGrid: Advanced Data Management System', 'OmniGrid'),
  seo('work/omnigrid', 'en.title', 'OmniGrid — a virtualised operations console', 'OmniGrid — a data grid demo'),
  b('work/omnigrid', 'omnigrid', 'description',
    'High-density data grid with virtualized scrolling, headless table architecture, and server-state cache orchestration. Handling massive datasets with zero-latency UI interactions and complex server-side state synchronization.',
    'High-density data grid with headless table architecture and server-state cache orchestration, running on 100 sample shipments.'),

  seo('work/omnigrid', 'en.description',
    'A high-density data grid: virtual scrolling, headless table architecture and server-state cache orchestration over TanStack Query, TanStack Table and Zod.',
    'A high-density data grid demo: headless table architecture and server-state caching over TanStack Query, TanStack Table and Zod.'),
  rm('work/omnigrid', 'omnigrid', 'techStack', 'Virtual Scroll'),

  b('work/proof', 'proof', 'description',
    'Telegram Mini App that gamifies fitness verification with real-time AI analysis. Gemini 2.5 Flash counts reps, verifies form, checks liveness — awarding Physio/Neuro points across 20 progression levels.',
    'Telegram Mini App, taken to a closed beta, that gamifies fitness verification with AI analysis. One Gemini 2.5 Flash pass judges reps, form and liveness — awarding Physio/Neuro points across a 20-level XP economy.'),

  // Search text in Russian, stored on the same pages
  seo("home", "ru.title", "Норайр Аветисян — Frontend-focused fullstack-инженер", "Норайр Аветисян — Senior Fullstack Engineer"),
  seo("skills", "ru.description", "Фронтенд-архитектура, AI и автоматизация, дизайн-системы и производительность — React, TypeScript, Next.js, Vue, Three.js, Supabase и инструменты вокруг них.", "Фронтенд-архитектура, AI-функции, дизайн-системы и производительность — React, TypeScript, Next.js, Vue, Three.js, Supabase и инструменты вокруг них."),
  seo("work", "ru.description", "Выпущенные продукты — логистика реального времени, фасетный поиск, AI-конфигуратор мерча, операционная консоль с виртуализацией и фитнес-платформа в Telegram.", "Живые демо — карта логистики, фасетный поиск, конфигуратор мерча и таблица данных — и Proof App, фитнес-приложение в Telegram, доведённое до закрытой беты."),
  seo("work/logistics", "ru.title", "NexusRoute — платформа логистики реального времени", "NexusRoute — демо карты логистики"),
  seo("work/logistics", "ru.description", "50K+ WebSocket-событий в секунду в 18 хабах, потоковый GeoJSON и высокочастотная сверка состояния, отрисованные Advanced Markers на стабильных 60 FPS.", "Демо карты логистики на Leaflet: 12 хабов, симулированные маршруты и маркеры и стресс-тест, который можно запустить в браузере."),
  seo("work/merch", "ru.title", "MerchForge — AI-конфигуратор мерча", "MerchForge — демо конфигуратора мерча"),
  seo("work/omnigrid", "ru.title", "OmniGrid — операционная консоль с виртуализацией", "OmniGrid — демо таблицы данных"),
  seo("work/omnigrid", "ru.description", "Высокоплотная таблица данных: виртуальный скролл, headless-архитектура и оркестрация серверного кэша на TanStack Query, TanStack Table и Zod.", "Демо таблицы данных высокой плотности: headless-архитектура и кэширование серверного состояния на TanStack Query, TanStack Table и Zod."),

  // Experience
  e('experience', 'proof-app', 'role', 'Founder & Technical Architect', 'Founder & Fullstack Engineer'),
  e('experience', 'proof-app', 'type', 'Founder', 'Remote'),
  e('experience', 'proof-app', 'period', 'Feb 2026 — Present', 'Nov 2025 — Jun 2026'),
  e('experience', 'proof-app', 'stack.4.name', 'AI Agents', 'Gemini'),
  e('experience', 'proof-app', 'description',
    'Founded and built a Telegram-native fitness platform end to end — a mobile-first Mini App and bot backed by an automated, AI-driven backend.',
    'Built a Telegram-native fitness product end to end as the only engineer and took it to a closed beta — a mobile-first Mini App and bot on a Supabase backend.'),
  e('experience', 'proof-app', 'achievements.0.text',
    'Shipped a complete multi-tenant product solo — frontend, backend, and infrastructure',
    'Designed the Postgres backend: 40+ tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues'),
  e('experience', 'proof-app', 'achievements.1.text',
    'Designed an AI-augmented build pipeline with custom agents, MCP servers, and Claude Code',
    'One Gemini 2.5 Flash pass judges reps, form and liveness per video'),
  e('experience', 'proof-app', 'achievements.2.text',
    'Engineered a secure Supabase / PostgreSQL backend with realtime, server-authoritative logic',
    'Built a 20-level XP economy with Telegram Stars payments and a TON wallet connection'),
  e('experience', 'vizogen', 'role', 'Lead Frontend Engineer', 'Lead Frontend Engineer (Fullstack Delivery)'),
  e('experience', 'vizogen', 'type', 'Remote', 'Contract, remote'),
  e('experience', 'appfox', 'type', 'Remote', 'Contract, remote'),
  e('experience', 'tirsoft-lead', 'type', 'On-site', 'Yerevan'),
  e('experience', 'tirsoft-frontend', 'type', 'On-site', 'Yerevan'),
  {
    kind: 'entry-create', collection: 'experience', slug: 'fendr',
    data: { period: 'Sep 2026 — Present', stack: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Turborepo' }, { name: 'Orval' }], image: '' },
    content: {
      role: 'Frontend Engineer',
      company: 'Fendr (via TIRSoft LLC)',
      type: 'Yerevan',
      description: 'Two web apps in a Turborepo monorepo set up from scratch.',
      achievements: [
        { text: 'Built a design system of 35 components and 24 patterns' },
        { text: 'Generated typed API clients from OpenAPI with Orval' },
        { text: 'Backed the apps with 47 test files' },
      ],
    },
  },
]
