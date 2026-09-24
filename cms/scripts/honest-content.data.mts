/**
 * The copy and visibility changes applied by `honest-content.mts`, kept apart
 * so they can be checked against the schemas without a database.
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
      // The two claims nobody measured go; the facts behind them stay.
      tiles: (current.tiles as Content[]).map((tile) => {
        switch (tile.title) {
          case 'Type-Safe Architecture':
            return {
              ...tile,
              description:
                'One type system across a Node.js backend and a React frontend: a renamed field fails the build instead of blanking a column.',
            }
          case 'User Experience':
            return {
              ...tile,
              description: 'Predictive inputs for long shipment forms, so the common case takes a few keystrokes.',
            }
          case 'Cache Hit-Rate':
            return {
              ...tile,
              title: 'Cached, then fresh',
              description:
                'A virtualised 10K-row grid. TanStack Query serves the cached page at once and refreshes it in the background.',
            }
          default:
            return tile
        }
      }),
      // "DRY but not die" read as a joke to a staff-level panel. These are the
      // four habits from the About page, where each one is explained.
      principles: [
        { text: 'Understand first' },
        { text: 'Decide in writing' },
        { text: 'Ship in slices' },
        { text: 'Leave it operable' },
      ],
      // Every number here now has a source on the site. The 42 KB bundle and
      // the LCP figure did not.
      dashboard: {
        ...(current.dashboard as Content),
        metrics: [
          { key: 'markers', color: '#22c55e', label: 'Live markers', value: 500, prefix: '', suffix: '+', detail: 'NexusRoute, at 60 FPS' },
          { key: 'scripting', color: '#22c55e', label: 'Scripting time', value: 70, prefix: '−', suffix: '%', detail: 'Advanced Markers migration' },
          { key: 'migrations', color: '#eab308', label: 'DB migrations', value: 27, prefix: '', suffix: '', detail: 'Proof App' },
          { key: 'testCoverage', color: '#22c55e', label: 'Test coverage', value: 92, prefix: '', suffix: '%', detail: 'Proof App' },
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
      tools: (current.tools as Content[]).map((tool) =>
        tool.name === 'n8n' ? { ...tool, note: 'learning now' } : tool,
      ),
    }),
  },
  {
    page: 'about',
    type: 'kit_faq',
    patch: {
      items: [
        {
          q: 'What level are you looking for?',
          a: 'Senior, frontend-focused or fullstack. The work I am best at is owning a platform other engineers build on, and being the person who is called when it is slow.',
        },
        {
          q: 'When can you start?',
          a: 'Right away. I am not tied to a notice period, so I can start as soon as we agree on the details.',
        },
        {
          q: 'Remote, hybrid, relocation?',
          a: 'Remote by default, from Yerevan (GMT+4), with full overlap for European teams and a working overlap for the US East Coast. Relocation is on the table for the right role.',
        },
        {
          q: 'How much backend do you actually do?',
          a: "Enough to own it when nobody else does: Postgres schemas and migrations, Node APIs, queues. Proof App's backend and this site's CMS are both mine end to end. Frontend is still where I am strongest, and backend is where I am growing.",
        },
        {
          q: 'How do you use AI in your work?',
          a: 'Two ways. In the product: Gemini checks workout videos in Proof App, and a Claude-backed terminal answers questions on this site. In the workflow: Claude Code every day for the mechanical parts, with a human review wherever a mistake would ship.',
        },
        {
          q: 'Are you moving into AI engineering?',
          a: 'Toward it, from where I am strong. I have shipped AI features inside products; now I am learning what sits under them: agents with LangChain, local models with Ollama, automation with n8n. I am not applying for ML research roles.',
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
        { label: '8 YEARS SHIPPING' },
        { label: '10M+ MONTHLY USERS' },
        { label: '50K EVENTS A SECOND' },
        { label: '18 HUBS ON ONE MAP' },
        { label: '−70% SCRIPTING TIME' },
        { label: '98.4% VERIFICATION CONFIDENCE' },
        { label: '92% TEST COVERAGE' },
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
      availability: 'Open to frontend and fullstack roles',
      label: 'Get in touch',
      title: "Let's talk about your team.",
      body: 'Email is fastest, and you will hear back within two days. LinkedIn and Telegram work too.',
      socials,
    },
  },
  {
    page: 'contact',
    type: 'terminal_footer',
    patch: {
      whoami: {
        visitor: 'visitor: someone reading a portfolio, probably with a job opening in mind.',
        exploring: 'You are looking at the work of a frontend-focused fullstack engineer.',
        welcome: 'Glad you found the terminal. Most people scroll past it.',
        hint: 'Try `sudo hire`, or `ask` a question about my experience.',
      },
      hire: {
        message: 'Good call. Here is how to reach me:',
        openTo: 'Open to senior frontend and fullstack roles.',
        location: 'Yerevan, Armenia · GMT+4 · remote or relocation',
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
