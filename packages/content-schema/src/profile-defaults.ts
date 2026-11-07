import type { Profile } from './profile'

/**
 * The facts until production publishes its first `settings.profile`.
 *
 * The site deploys on merge, and version 26 has no profile, so it needs something
 * to read until the catch-up has run. The same values are what migration 0032 seeds,
 * and a test holds the two together. S3's follow-up deletes this file, which leaves
 * the CMS as the only source.
 *
 * Kept apart from `profile.ts` so the site can import it without pulling zod in.
 */
export const DEFAULT_PROFILE: Profile = {
  name: 'Norayr Avetisyan',
  headline: 'Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js',
  jobTitle: 'Senior Fullstack Engineer',
  thesis: 'Interfaces at scale, and the systems under them.',
  description:
    'Building high-performance interfaces at the intersection of engineering precision and visual storytelling.',
  location: {
    city: 'Yerevan',
    country: 'Armenia',
    countryCode: 'AM',
    timezone: 'UTC+4',
    workMode: 'Remote, EU/US overlap',
  },
  experience: {
    summary: '8+ years in JavaScript and TypeScript',
    since: 'August 2018',
  },
  availability: 'Open to senior fullstack roles at remote EU/US product companies',
  email: 'noroavetisyan@gmail.com',
  links: {
    site: 'https://norav.dev',
    github: 'https://github.com/Noro97',
    linkedin: 'https://www.linkedin.com/in/norayravetisyan/',
    telegram: 'https://t.me/antarber',
  },
  education: {
    degree: 'BSc Computer Science',
    school: 'Armenian State University of Economics',
  },
  languages: [
    { name: 'Armenian', level: 'native' },
    { name: 'Russian', level: 'fluent' },
    { name: 'English', level: 'professional' },
  ],
  knowsAbout: [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'TypeScript' },
    { name: 'Vue.js' },
    { name: 'Design Systems' },
    { name: 'Micro-frontends' },
    { name: 'Storybook' },
    { name: 'Telegram Mini Apps' },
  ],
  roles: [
    {
      role: 'Frontend Engineer',
      company: 'Fendr (via TIRSoft LLC)',
      dates: 'Sep 2026 – Present',
      type: 'Yerevan',
      highlights: [
        { text: 'Two web apps in a Turborepo monorepo set up from scratch' },
        { text: 'Design system of 35 components and 24 patterns' },
        { text: 'Typed API clients generated from OpenAPI with Orval' },
        { text: '47 test files' },
      ],
    },
    {
      role: 'Founder & Fullstack Engineer',
      company: 'Proof App',
      dates: 'Nov 2025 – Jun 2026',
      type: 'Remote',
      highlights: [
        { text: 'Built as the only engineer and taken to a closed beta. It has not been in production' },
        { text: '40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions, 3 pgmq job queues' },
        { text: 'One Gemini 2.5 Flash pass judges reps, form and liveness' },
        { text: '20-level XP economy, Telegram Stars payments, TON wallet connection. It has no TON transaction code' },
      ],
    },
    {
      role: 'Lead Frontend Engineer (Fullstack Delivery)',
      company: 'Vizogen',
      dates: 'Sep 2025 – Feb 2026',
      type: 'Contract, remote',
      highlights: [
        { text: 'Multi-tenant AI SaaS module for 500+ enterprise users' },
        { text: 'Designed schemas, row-level security and REST contracts' },
        { text: 'LCP 4.1s to 1.3s, integration defects down 80%' },
        { text: 'Unit-test coverage 22% to 78% in three months' },
      ],
    },
    {
      role: 'Core Frontend Engineer / UI Architect',
      company: 'MTS Web Services',
      dates: 'Feb 2024 – Jun 2025',
      type: 'Remote',
      highlights: [
        { text: 'Design system of 200+ components, used by 15+ teams in a 10M+ MAU ecosystem' },
        { text: 'Time-to-market down 25%' },
        { text: '3–5 fewer release blockers per sprint across 8 micro-frontend verticals' },
        { text: 'Visual regression bugs down 60% across 180+ components' },
      ],
    },
    {
      role: 'Senior Frontend Engineer',
      company: 'Appfox',
      dates: 'Sep 2023 – Jan 2024',
      type: 'Contract, remote',
      highlights: [
        { text: 'High-load iGaming portal at 50K+ concurrent sessions with zero state-desync incidents' },
        { text: 'WebSocket routing in a Node.js BFF' },
        { text: '4 payment and KYC providers behind one typed API layer with idempotency keys' },
        { text: 'Bundle size down 62%, median time-to-root-cause 2 hours to 25 minutes' },
      ],
    },
    {
      role: 'Lead Frontend Developer',
      company: 'TIRSoft LLC',
      dates: 'May 2020 – Sep 2023',
      type: 'Yerevan',
      highlights: [
        { text: '8+ SaaS products' },
        { text: 'API latency down 40% with Apollo GraphQL batching' },
        { text: 'LCP down 68% (3.5s to 1.1s) on 3 flagship products' },
        { text: 'Bootstrap two weeks to three days' },
        { text: 'Mentored 5 developers, 2 promoted to senior' },
      ],
    },
    {
      role: 'Frontend Developer',
      company: 'TIRSoft LLC',
      dates: 'Aug 2018 – May 2020',
      type: 'Yerevan',
      highlights: [],
    },
  ],
  projects: [
    {
      name: 'Nova Prism',
      summary:
        'Trading platform of 4 apps in a monorepo. Fastify and Socket.IO API, trading engine, price feeds, OpenAPI-validated contracts, Drizzle on SQLite, React and Astro front ends, Docker, 58 test files',
    },
    {
      name: 'norav.dev',
      summary: 'This site, on a custom CMS built with Next.js and raw PostgreSQL',
    },
    {
      name: 'Nor Events',
      summary: 'In development. NestJS, Neon Postgres with pgvector, Drizzle, Better Auth, Inngest',
    },
  ],
  skills: [
    {
      group: 'Frontend',
      items:
        'React 19, Next.js 16, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui, Storybook, design systems, Module Federation, Core Web Vitals',
    },
    {
      group: 'Backend and data',
      items:
        'Node.js, NestJS, Fastify, Hono, REST, GraphQL, OpenAPI, WebSockets, SSE, PostgreSQL, Drizzle, Supabase (Edge Functions, RLS, pgmq), Better Auth, Inngest',
    },
    {
      group: 'Infrastructure and testing',
      items: 'Docker, Vercel, Cloudflare Workers, GitHub Actions, Turborepo, Vitest, Playwright, MSW',
    },
    {
      group: 'AI',
      items: 'Gemini API, Anthropic API, MCP, Claude Code, Cursor',
    },
  ],
}
