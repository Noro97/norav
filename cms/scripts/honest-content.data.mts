/**
 * The copy and visibility changes applied by `honest-content.mts`, kept apart
 * so they can be checked against the schemas without a database.
 *
 * Every claim here traces to docs/plan/facts.md or to code in this repository.
 */
export type Content = Record<string, unknown>

const GITHUB = 'https://github.com/Noro97'
const LINKEDIN = 'https://www.linkedin.com/in/norayravetisyan'
const TELEGRAM = 'https://t.me/antarber'

const socials = [
  { icon: 'github', label: 'GitHub', href: GITHUB },
  { icon: 'linkedin', label: 'LinkedIn', href: LINKEDIN },
  { icon: 'telegram', label: 'Telegram', href: TELEGRAM },
]

/** Tools that aren't claimed, whatever a pending migration wrote. */
const NOT_CLAIMED = new Set(['n8n', 'Make', 'Zapier', 'LangChain'])

/** Top-level fields to overwrite on a block; the function form sees the current content. */
export type Patch = Content | ((current: Content) => Content)

export interface BlockChange {
  page: string
  type: string
  patch?: Patch
  visible?: boolean
}

export const changes: BlockChange[] = [
  // ─── Home ────────────────────────────────────────────────────────────────
  {
    page: 'home',
    type: 'bento_grid',
    patch: (current) => ({
      // The numbers nobody measured go, and what the code does stays.
      tiles: (current.tiles as Content[]).map((tile) => {
        switch (tile.title) {
          case 'Performance Audit':
            return {
              ...tile,
              title: 'Stress Test',
              description:
                "NexusRoute's stress test adds 40 simulated markers and their routes to a Leaflet map in batches, one batch per animation frame.",
            }
          case 'Type-Safe Architecture':
            return {
              ...tile,
              description:
                'At Fendr: typed API clients generated from OpenAPI with Orval, so a renamed field fails the build.',
            }
          case 'User Experience':
            return {
              ...tile,
              description: 'FilterGraph keeps every filter in the URL, so any view is a link you can send.',
            }
          case 'AI Liveness':
            return {
              ...tile,
              description: "One Gemini 2.5 Flash pass judges reps, form and liveness from a user's video in Proof App.",
            }
          case 'Cache Hit-Rate':
            return {
              ...tile,
              title: 'Cached, then fresh',
              description:
                'A 100-row data grid. TanStack Query serves the cached rows at once and refetches them in the background.',
            }
          default:
            return tile
        }
      }),
      // These are the four habits from the About page, where each one is
      // explained.
      principles: [
        { text: 'Understand first' },
        { text: 'Decide in writing' },
        { text: 'Ship in slices' },
        { text: 'Leave it operable' },
      ],
      // Approved numbers only, each one named with where it happened.
      dashboard: {
        ...(current.dashboard as Content),
        metrics: [
          { key: 'lcp', color: '#22c55e', label: 'LCP', value: 1.3, prefix: '', suffix: 's', detail: 'Vizogen, down from 4.1s' },
          { key: 'components', color: '#22c55e', label: 'Design system', value: 200, prefix: '', suffix: '+', detail: 'Components at MTS Web Services' },
          { key: 'sessions', color: '#eab308', label: 'Concurrent sessions', value: 50, prefix: '', suffix: 'K+', detail: 'Appfox, zero state-desync incidents' },
          { key: 'testCoverage', color: '#22c55e', label: 'Unit-test coverage', value: 78, prefix: '', suffix: '%', detail: 'Vizogen, up from 22% in three months' },
        ],
      },
    }),
  },
  { page: 'home', type: 'contact_cta', patch: { socials } },

  // ─── About ───────────────────────────────────────────────────────────────
  {
    page: 'about',
    type: 'kit_tool_stack',
    patch: (current) => ({
      tools: (current.tools as Content[]).filter((tool) => !NOT_CLAIMED.has(tool.name as string)),
    }),
  },
  {
    page: 'about',
    type: 'kit_faq',
    patch: {
      items: [
        {
          q: 'What level are you looking for?',
          a: 'Senior fullstack, at remote EU/US product companies. The work I am best at is owning a platform other engineers build on, and being the person who is called when it is slow.',
        },
        {
          q: 'Where do you work from?',
          a: 'Yerevan, Armenia (UTC+4), remotely, with EU/US overlap.',
        },
        {
          q: 'How much backend do you actually do?',
          a: "Enough to own it when nobody else does: Postgres schemas and row-level security, Node APIs, queues. Proof App's backend and this site's CMS are both mine end to end.",
        },
        {
          q: 'How do you use AI in your work?',
          a: 'Two ways. In the product: Gemini checks workout videos in Proof App, and a Claude-backed terminal answers questions on this site. In the workflow: Claude Code every day for the mechanical parts, with a human review wherever a mistake would ship.',
        },
        {
          q: 'Can I see code?',
          a: 'The repository behind this site and its CMS is private, but I am glad to walk you through it on a call, or share access for a review.',
        },
      ],
    },
  },

  // ─── Work ────────────────────────────────────────────────────────────────
  {
    page: 'work',
    type: 'kit_stats_marquee',
    patch: {
      items: [
        { label: '8+ YEARS IN JS AND TS' },
        { label: '10M+ MAU ECOSYSTEM' },
        { label: '200+ DESIGN-SYSTEM COMPONENTS' },
        { label: '50K+ CONCURRENT SESSIONS' },
        { label: 'LCP 4.1S TO 1.3S' },
        { label: '1 CMS WRITTEN FROM SCRATCH' },
      ],
    },
  },
  // Nothing real to show yet. Hidden, not deleted: each comes back when it has
  // a true line in it — a reference someone actually wrote, a talk given.
  { page: 'work', type: 'testimonials', visible: false },
  { page: 'work', type: 'kit_press', visible: false },
  { page: 'work', type: 'kit_awards', visible: false },
  { page: 'work', type: 'kit_show_reel', visible: false },

  // ─── Writing ─────────────────────────────────────────────────────────────
  { page: 'writing', type: 'kit_writing', visible: false },

  // ─── Contact ─────────────────────────────────────────────────────────────
  {
    page: 'contact',
    type: 'contact_cta',
    patch: {
      availability: 'Open to senior fullstack roles',
      label: 'Get in touch',
      title: "Let's talk about your team.",
      body: 'Email is fastest. LinkedIn and Telegram work too.',
      socials,
    },
  },
  {
    page: 'contact',
    type: 'terminal_footer',
    patch: {
      whoami: {
        visitor: 'visitor: someone reading a portfolio, probably with a job opening in mind.',
        exploring: 'You are looking at the work of a senior fullstack engineer.',
        welcome: 'Glad you found the terminal. Most people scroll past it.',
        hint: 'Try `sudo hire`, or `ask` a question about my experience.',
      },
      hire: {
        message: 'Good call. Here is how to reach me:',
        openTo: 'Open to senior fullstack roles.',
        location: 'Yerevan, Armenia · UTC+4 · remote',
        burst: 'Hired. Well, almost: email me and it becomes true.',
        niceTry: 'Nice try. This terminal cannot delete anything, not even as root.',
      },
    },
  },
]

/** Pages that should not be reachable: the kit showroom and a typo'd duplicate. */
export const pagesToUnpublish = ['test', 'projects/logisticss']

/** A claim the CMS content made that nobody could confirm; the replacement is from the Proof case study. */
export const experienceFixes = [
  {
    slug: 'proof-app',
    from: 'Designed an AI-augmented build pipeline with custom agents, MCP servers, and Claude Code',
    to: 'Put Gemini video verification on a queue, so nothing in the app waits on the model',
  },
]
