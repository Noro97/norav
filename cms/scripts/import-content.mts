/**
 * Moves the content the site ships today out of the code and into the CMS.
 *
 *   npm run import
 *
 * Reads the English and Russian i18n namespaces straight from the site, pairs
 * them with the values that were hard-coded in the components (numbers, stacks,
 * colours, URLs — none of which were ever translatable), and writes one block
 * or entry per section.
 *
 * Idempotent: rerunning updates the same rows, so it can be replayed after a
 * schema change. Translations are stored as the localizable subset only — the
 * Russian row holds no proficiency levels or URLs, so editing those in English
 * keeps both languages correct.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  getBlockDefinition,
  mergeLocale,
  pickLocalized,
  validateBlockContent,
  validateEntryContent,
  validateEntryData,
  type Locale,
} from '@norav/content-schema'
import { assertExclusiveLocalDb, closeDb, query, queryOne } from '../src/lib/db'

/**
 * Frozen copies of the i18n namespaces this migration reads.
 *
 * They live here rather than in the site because the site retires each
 * namespace as its section moves to the CMS — the inputs to a migration have to
 * outlive the thing they were migrated out of, or a fresh database (a new Neon
 * project, say) could never be seeded again.
 */
const LEGACY = join(import.meta.dirname, 'legacy-i18n')

/** i18n ran with keySeparator disabled, so every key is flat: "entries.0.role". */
function namespace(locale: Locale, name: string): Record<string, string> {
  return JSON.parse(readFileSync(join(LEGACY, locale, `${name}.json`), 'utf8'))
}

/**
 * "entries.0.achievements.1" → nested objects and arrays.
 *
 * A node becomes an array only when *every* key under it is numeric. The extra
 * namespace mixes the two — `cap.label` sits next to `cap.0.title` — and
 * turning that node into an array would silently drop the named siblings.
 */
function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let node = root
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        node[part] = value
        return
      }
      if (typeof node[part] !== 'object' || node[part] === null) node[part] = {}
      node = node[part] as Record<string, unknown>
    })
  }
  return arrayify(root) as Record<string, unknown>
}

function arrayify(value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value

  const entries = Object.entries(value as Record<string, unknown>).map(
    ([key, item]) => [key, arrayify(item)] as const,
  )
  const isList = entries.length > 0 && entries.every(([key]) => /^\d+$/.test(key))

  if (isList) {
    const list: unknown[] = []
    for (const [key, item] of entries) list[Number(key)] = item
    return list
  }
  return Object.fromEntries(entries)
}

const wrap = (values: string[] | undefined, key: string) =>
  (values ?? []).map((text) => ({ [key]: text }))

// ---------------------------------------------------------------------------
// Values that lived in the components. They were never translatable — the CMS
// now stores them once, on the source locale.
// ---------------------------------------------------------------------------
const STAT_SHAPES = [
  { value: 7, prefix: '', suffix: '+' },
  { value: 10, prefix: '', suffix: 'M+' },
  { value: 6, prefix: '', suffix: '' },
  { value: 50, prefix: '', suffix: 'K+' },
]

const CAPABILITY_ICONS = ['Layers', 'Bot', 'Component', 'Gauge'] as const

const SKILL_SHAPES = [
  {
    color: '#B51A2B',
    skills: [
      { name: 'React.js', level: 95, years: 7 },
      { name: 'TypeScript', level: 95, years: 6 },
      { name: 'Next.js (SSR/ISR)', level: 90, years: 5 },
      { name: 'Vue.js / Nuxt.js', level: 85, years: 4 },
      { name: 'HTML5 / CSS3', level: 95, years: 7 },
      { name: 'Micro-frontends', level: 75, years: 2 },
    ],
  },
  {
    color: '#d63040',
    skills: [
      { name: 'Redux Toolkit', level: 90, years: 5 },
      { name: 'Zustand / Pinia', level: 85, years: 3 },
      { name: 'TanStack Query/Table', level: 85, years: 3 },
      { name: 'Context API / MobX', level: 80, years: 4 },
      { name: 'GraphQL / REST API', level: 90, years: 6 },
    ],
  },
  {
    color: '#8c1523',
    skills: [
      { name: 'Tailwind CSS', level: 95, years: 5 },
      { name: 'Styled Components', level: 90, years: 4 },
      { name: 'Material UI', level: 80, years: 3 },
      { name: 'Sass / Bootstrap', level: 85, years: 6 },
      { name: 'Design Systems', level: 85, years: 3 },
    ],
  },
  {
    color: '#541A2E',
    skills: [
      { name: 'Vite / Webpack', level: 90, years: 5 },
      { name: 'Storybook', level: 85, years: 3 },
      { name: 'Vitest / Jest', level: 80, years: 4 },
      { name: 'Docker / CI/CD', level: 70, years: 3 },
      { name: 'Git / GitHub', level: 90, years: 7 },
    ],
  },
  {
    color: '#6C3AED',
    skills: [
      { name: 'Telegram Mini Apps', level: 85, years: 2 },
      { name: 'Supabase / PostgreSQL', level: 75, years: 3 },
      { name: 'Node.js / Vercel', level: 80, years: 5 },
      { name: 'Claude Code', level: 70, years: 1 },
      { name: 'Feature-Sliced Design', level: 80, years: 3 },
    ],
  },
]

const TECH = [
  'React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'GraphQL',
  'Supabase', 'PostgreSQL', 'Zustand', 'GSAP', 'Three.js', 'Vite',
  'Module Federation', 'Design Systems', 'Docker', 'AI Agents', 'MCP', 'Claude Code',
]

/** The mosaic's metric table, which lived in bento.data.ts. */
const BENTO_METRICS = [
  { key: 'lcp', value: 1.2, prefix: '<', suffix: 's', color: '#22c55e' },
  { key: 'bundle', value: 42, prefix: '', suffix: 'kb', color: '#22c55e' },
  { key: 'gpsNodes', value: 50, prefix: '', suffix: '+', color: '#eab308' },
  { key: 'testCoverage', value: 92, prefix: '', suffix: '%', color: '#22c55e' },
]

/** Which slot of the designed layout each micro tile occupies. */
const BENTO_TILE_SLOTS = [0, 1, 2, 3, 4]

/** Chip rows that lived inline in each case-study component. */
const CASE_STUDY_TECH: Record<string, string[]> = {
  logistics: ['Google Maps API', 'WebSocket', 'GeoJSON', 'Advanced Markers', 'Zustand'],
  merch: ['React State', 'JSON Sync', 'Derived Data', 'Typing Animation'],
  ecommerce: [
    'URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo',
    'Modal', 'Multi-step Form', 'Confetti',
  ],
  omnigrid: ['TanStack Query', 'TanStack Table', 'Zod', 'Virtual Scroll'],
  proof: [
    'Supabase Edge Functions', 'Google Gemini API', 'pgmq', 'FFmpeg.wasm',
    'Telegram Mini App SDK',
  ],
}

const VIBE_SYSTEMS = [
  { name: 'TON / Web3', tone: 'sky' },
  { name: 'Gemini AI', tone: 'violet' },
  { name: 'Supabase', tone: 'emerald' },
]

const VIBE_STATS = ['92%', '27', '3']

const WORKFLOW_TECH = ['n8n', 'Claude API', 'Webhooks', 'SSE Streaming', 'Slack API', 'GitHub Actions']

const SOCIAL_HREFS = {
  github: 'https://github.com/Noro97',
  linkedin: 'https://www.linkedin.com/in/norayravetisyan/',
  telegram: 'https://t.me/antarber',
  email: 'mailto:noroavetisyan@gmail.com',
} as const

const EXPERIENCE_SHAPES = [
  { slug: 'proof-app', period: 'Feb 2026 — Present', image: '/assets/img/exp-startup.png', stack: ['React', 'Vite', 'Supabase', 'Telegram TMA', 'AI Agents'] },
  { slug: 'vizogen', period: 'Sep 2025 — Feb 2026', image: '/assets/img/exp-dataviz.png', stack: ['React', 'TypeScript', 'Generative AI', 'SSE', 'Vercel'] },
  { slug: 'mts-web-services', period: 'Feb 2024 — Jun 2025', image: '/assets/img/exp-logistics.png', stack: ['React', 'TypeScript', 'Design Systems', 'Module Federation'] },
  { slug: 'appfox', period: 'Sep 2023 — Jan 2024', image: '/assets/img/exp-merch.png', stack: ['Next.js', 'TypeScript', 'Fintech', 'iGaming'] },
  { slug: 'tirsoft-lead', period: 'May 2020 — Sep 2023', image: '/assets/img/exp-startup.png', stack: ['Next.js', 'React', 'GraphQL', 'Node.js'] },
  { slug: 'tirsoft-frontend', period: 'Aug 2018 — May 2020', image: '/assets/img/exp-dataviz.png', stack: ['React', 'Redux', 'Sass', 'REST API'] },
]

/**
 * The case-studies intro was hard-coded English in App.tsx and never reached
 * i18n, so there is nothing to import for Russian — the block inherits the
 * English copy until someone translates it in the CMS.
 */
const PROJECTS_INTRO = {
  label: 'Selected Work · 2024 — 2026',
  heading: [
    { text: 'From zero to', accent: 'none', lineBreakAfter: false },
    { text: 'production', accent: 'crimson', lineBreakAfter: true },
    { text: 'in every frame.', accent: 'none', lineBreakAfter: false },
  ],
  body: 'Five years, six shipped products — logistics, commerce, merch AI, and an ops console powering thousands of daily users.',
  imageAlt:
    'A collage of shipped case studies — dashboards, mobile ops consoles, and commerce flows',
}

// ---------------------------------------------------------------------------
// Build one locale's content for every block
// ---------------------------------------------------------------------------
function buildBlocks(locale: Locale): Record<string, unknown> {
  const about = namespace(locale, 'about')
  const extra = namespace(locale, 'extra')
  const skills = namespace(locale, 'skills')
  const experience = namespace(locale, 'experience')
  const common = namespace(locale, 'common')
  const workflow = namespace(locale, 'workflow')
  const vibe = namespace(locale, 'vibecoding')
  const projects = namespace(locale, 'projects')
  const bento = namespace(locale, 'bento')
  const terminal = namespace(locale, 'terminal')

  /** Each case study contributes its header; the demo's own labels stay in i18n. */
  const caseStudies = Object.fromEntries(
    Object.entries(CASE_STUDY_TECH).map(([key, tech]) => [
      key,
      {
        sectionLabel: projects[`${key}.sectionLabel`],
        title: projects[`${key}.title`],
        description: projects[`${key}.description`],
        techStack: wrap(tech, 'name'),
      },
    ]),
  )

  const aboutTree = unflatten(about) as {
    facts: Record<string, { label: string; value: string }>
    social: Record<string, string>
    bio: Record<string, string>
  }
  const extraTree = unflatten(extra) as {
    cap: Record<string, { title: string; body: string }> & { label: string; title: string; description: string }
    impact: Record<string, { label: string }> & { label: string }
    contact: Record<string, string>
  }
  const skillsTree = unflatten(skills) as { categories: { name: string }[] }

  return {
    about: {
      sectionLabel: about.sectionLabel,
      name: about.name,
      role: about.role,
      bio: {
        // The paragraph was five sibling keys concatenated verbatim, so the
        // spacing lived inside the values (" engineering rigor"). As runs, the
        // renderer owns the spacing — every run is trimmed, and one that opens
        // with punctuation attaches to the word before it.
        lead: [
          { text: about['bio.paragraph1.before'], accent: 'none' },
          { text: about['bio.paragraph1.highlight1'], accent: 'bright' },
          { text: about['bio.paragraph1.conjunction'], accent: 'none' },
          { text: about['bio.paragraph1.highlight2'], accent: 'crimson' },
          { text: about['bio.paragraph1.after'], accent: 'none' },
        ]
          .map((run) => ({ ...run, text: run.text?.trim() }))
          .filter((run) => run.text),
        paragraphs: [{ text: about['bio.paragraph2'] }, { text: about['bio.paragraph3'] }],
      },
      facts: ['location', 'experience', 'focus', 'status'].map((key) => ({
        label: aboutTree.facts[key]!.label,
        value: aboutTree.facts[key]!.value,
      })),
      statusLabel: common['status.available'],
      cvLabel: common['buttons.downloadCv'],
      socials: (['github', 'linkedin', 'telegram', 'email'] as const).map((icon) => ({
        icon,
        label: aboutTree.social[icon]!,
        href: SOCIAL_HREFS[icon],
      })),
    },

    impact_strip: {
      label: extraTree.impact.label,
      stats: STAT_SHAPES.map((shape, index) => ({
        ...shape,
        label: extraTree.impact[String(index)]!.label,
      })),
    },

    capabilities: {
      sectionLabel: extraTree.cap.label,
      title: extraTree.cap.title,
      description: extraTree.cap.description,
      cards: CAPABILITY_ICONS.map((icon, index) => ({
        icon,
        title: extraTree.cap[String(index)]!.title,
        body: extraTree.cap[String(index)]!.body,
      })),
    },

    experience: {
      sectionLabel: experience.sectionLabel,
      title: experience.title,
      description: experience.description,
    },

    skills: {
      sectionLabel: skills.sectionLabel,
      title: skills.title,
      description: skills.description,
      proficiencyOverview: skills.proficiencyOverview,
      skillsTracked: skills.skillsTracked,
      categories: SKILL_SHAPES.map((shape, index) => ({
        name: skillsTree.categories[index]!.name,
        color: shape.color,
        skills: shape.skills,
      })),
    },

    tech_marquee: {
      label: skills.marqueeLabel,
      items: TECH.map((name) => ({ name })),
    },

    ...caseStudies,

    terminal_footer: {
      sectionLabel: terminal.sectionLabel,
      title: terminal.title,
      subtitle: terminal.subtitle,
      titleBar: terminal.titleBar,
      prompt: terminal.prompt,
      placeholder: terminal.placeholder,
      welcome: wrap([terminal['welcome.0'], terminal['welcome.1']], 'text'),
      whoami: {
        visitor: terminal['whoami.visitor'],
        exploring: terminal['whoami.exploring'],
        welcome: terminal['whoami.welcome'],
        hint: terminal['whoami.hint'],
      },
      hire: {
        message: terminal['sudo.hire.message'],
        openTo: terminal['sudo.hire.openTo'],
        location: terminal['sudo.hire.location'],
        burst: terminal['sudo.hire.burst'],
        niceTry: terminal['sudo.niceTry'],
      },
      // i18next interpolation syntax survives the move; the terminal does the
      // substitution itself now.
      commandNotFound: terminal.commandNotFound,
    },

    bento_grid: {
      sectionLabel: bento.sectionLabel,
      title: bento.title,
      description: bento.description,
      projects: ['nexusroute', 'merchforge', 'filtergraph', 'omnigrid', 'proof'].map((project) => ({
        project,
        title: bento[`projects.${project}.title`],
        description: bento[`projects.${project}.description`],
        cta: bento[`projects.${project}.cta`],
      })),
      tiles: BENTO_TILE_SLOTS.map((slot) => ({
        slot,
        title: bento[`tiles.${slot}.title`],
        description: bento[`tiles.${slot}.description`],
      })),
      dashboard: {
        title: bento['dashboard.title'],
        metrics: BENTO_METRICS.map((metric) => ({
          ...metric,
          label: bento[`dashboard.metrics.${metric.key}`],
          detail: bento[`dashboard.metrics.${metric.key}Detail`],
        })),
      },
      principles: [0, 1, 2, 3].map((i) => ({ text: bento[`marquee.principles.${i}`] })),
    },

    vibecoding: {
      sectionLabel: vibe.sectionLabel,
      title: vibe.title,
      body: vibe.body,
      microCopy: vibe.microCopy,
      slider: {
        lowVibe: vibe['slider.lowVibe'],
        highVibe: vibe['slider.highVibe'],
        boringLabel: vibe['slider.boringLabel'],
        archLabel: vibe['slider.archLabel'],
      },
      systemsSyncedLabel: vibe.systemsSynced,
      systems: VIBE_SYSTEMS,
      stats: [
        { value: VIBE_STATS[0], label: vibe['stats.coverage'] },
        { value: VIBE_STATS[1], label: vibe['stats.migrations'] },
        { value: VIBE_STATS[2], label: vibe['stats.systems'] },
      ],
      archNodes: ['tma', 'auth', 'storage', 'edge', 'gemini', 'db', 'feed'].map((node) => ({
        node,
        label: vibe[`arch.${node}`],
      })),
    },

    workflow: {
      sectionLabel: workflow.sectionLabel,
      title: workflow.title,
      description: workflow.description,
      workflows: [
        ['lead-pipeline', 'lead'],
        ['content-gen', 'content'],
        ['ci-cd', 'cicd'],
      ].map(([diagram, key]) => ({
        diagram,
        title: workflow[`workflows.${key}.title`],
        description: workflow[`workflows.${key}.description`],
      })),
      techStack: wrap(WORKFLOW_TECH, 'name'),
    },

    projects_intro: PROJECTS_INTRO,

    contact_cta: {
      availability: extraTree.contact.availability,
      label: extraTree.contact.label,
      title: extraTree.contact.title,
      body: extraTree.contact.body,
      emailLabel: extraTree.contact.email,
      socials: (['github', 'linkedin', 'telegram'] as const).map((icon) => ({
        icon,
        label: aboutTree.social[icon]!,
        href: SOCIAL_HREFS[icon],
      })),
    },
  }
}

function buildEntries(locale: Locale) {
  const tree = unflatten(namespace(locale, 'experience')) as {
    entries: { role: string; company: string; type: string; description: string; achievements: string[] }[]
  }
  return EXPERIENCE_SHAPES.map((shape, index) => {
    const row = tree.entries[index]!
    return {
      slug: shape.slug,
      data: { period: shape.period, image: shape.image, stack: wrap(shape.stack, 'name') },
      content: {
        role: row.role,
        company: row.company,
        type: row.type,
        description: row.description,
        achievements: wrap(row.achievements, 'text'),
      },
    }
  })
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
/**
 * The page, in the order App.tsx renders it today. Anchors match the ids the
 * components already put in the DOM — the CMS does not invent new ones, so
 * existing links and the scroll-spy keep working.
 *
 * Widgets carry no content here: they are listed so the CMS owns where they sit
 * and whether they appear, which is what takes the page structure out of the
 * code.
 */
const BLOCK_ORDER: { type: string; anchor: string | null }[] = [
  { type: 'hero', anchor: 'hero' },
  { type: 'about', anchor: 'about' },
  { type: 'impact_strip', anchor: null },
  { type: 'capabilities', anchor: null },
  { type: 'experience', anchor: 'experience' },
  { type: 'skills', anchor: 'skills' },
  { type: 'tech_marquee', anchor: null },
  { type: 'bento_grid', anchor: 'overview' },
  { type: 'vibecoding', anchor: 'vibecoding' },
  { type: 'projects_intro', anchor: 'projects-intro' },
  { type: 'logistics', anchor: 'logistics' },
  { type: 'merch', anchor: 'merch' },
  { type: 'ecommerce', anchor: 'ecommerce' },
  { type: 'omnigrid', anchor: 'omnigrid' },
  { type: 'proof', anchor: 'proof' },
  { type: 'workflow', anchor: 'workflows' },
  { type: 'contact_cta', anchor: null },
  { type: 'terminal_footer', anchor: 'terminal' },
]

await assertExclusiveLocalDb()

const page = await queryOne<{ id: string }>(`select id from pages where slug = 'home'`)
if (!page) throw new Error('Run `npm run seed` first — the home page does not exist.')

const en = buildBlocks('en')
const ru = buildBlocks('ru')
const problems: string[] = []

for (const [index, { type, anchor }] of BLOCK_ORDER.entries()) {
  const definition = getBlockDefinition(type)
  if (!definition) throw new Error(`No registry entry for "${type}"`)

  const source = en[type] ?? definition.defaults.content
  const sourceCheck = validateBlockContent(type, source)
  if (!sourceCheck.ok) {
    problems.push(...sourceCheck.issues.map((i) => `${type} en: ${i.path} — ${i.message}`))
    continue
  }

  // Only the translatable leaves are stored for Russian; everything else is
  // inherited from English at publish time.
  const translation = pickLocalized(definition.form, ru[type] ?? sourceCheck.data)
  const mergedCheck = validateBlockContent(type, mergeLocale(sourceCheck.data, translation))
  if (!mergedCheck.ok) {
    problems.push(...mergedCheck.issues.map((i) => `${type} ru: ${i.path} — ${i.message}`))
    continue
  }

  const existing = await queryOne<{ id: string }>(
    `select id from blocks where page_id = $1 and type = $2 and deleted_at is null`,
    [page.id, type],
  )

  const position = (index + 1) * 1000
  const blockId =
    existing?.id ??
    (
      await queryOne<{ id: string }>(
        `insert into blocks (page_id, type, position, anchor_id, settings)
         values ($1, $2, $3, $4, $5) returning id`,
        [page.id, type, position, anchor, JSON.stringify(definition.defaults.settings)],
      )
    )?.id

  if (!blockId) throw new Error(`Could not create block "${type}"`)

  // Rerunning the import restores the canonical order and anchors.
  await query(`update blocks set position = $2, anchor_id = $3 where id = $1`, [
    blockId,
    position,
    anchor,
  ])

  for (const [locale, content] of [
    ['en', sourceCheck.data],
    ['ru', translation],
  ] as const) {
    await query(
      `insert into block_translations (block_id, locale, content, status)
       values ($1, $2, $3, 'ready')
       on conflict (block_id, locale) do update set content = excluded.content, status = 'ready'`,
      [blockId, locale, JSON.stringify(content)],
    )
  }

  console.log(`  block  ${type}${existing ? ' (updated)' : ''}`)
}

const entriesEn = buildEntries('en')
const entriesRu = buildEntries('ru')
const entryDefinitionForm = (await import('@norav/content-schema')).experienceCollection.form

for (const [index, entry] of entriesEn.entries()) {
  const dataCheck = validateEntryData('experience', entry.data)
  const contentCheck = validateEntryContent('experience', entry.content)
  if (!dataCheck.ok || !contentCheck.ok) {
    const issues = [...(dataCheck.ok ? [] : dataCheck.issues), ...(contentCheck.ok ? [] : contentCheck.issues)]
    problems.push(...issues.map((i) => `experience/${entry.slug}: ${i.path} — ${i.message}`))
    continue
  }

  const existing = await queryOne<{ id: string }>(
    `select id from entries where collection = 'experience' and slug = $1 and deleted_at is null`,
    [entry.slug],
  )

  const entryId =
    existing?.id ??
    (
      await queryOne<{ id: string }>(
        `insert into entries (collection, slug, position, data)
         values ('experience', $1, $2, $3) returning id`,
        [entry.slug, (index + 1) * 1000, JSON.stringify(entry.data)],
      )
    )?.id

  if (!entryId) throw new Error(`Could not create entry "${entry.slug}"`)
  if (existing) {
    await query(`update entries set data = $2 where id = $1`, [entryId, JSON.stringify(entry.data)])
  }

  const translation = pickLocalized(entryDefinitionForm, entriesRu[index]!.content)
  for (const [locale, content] of [
    ['en', entry.content],
    ['ru', translation],
  ] as const) {
    await query(
      `insert into entry_translations (entry_id, locale, data, status)
       values ($1, $2, $3, 'ready')
       on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready'`,
      [entryId, locale, JSON.stringify(content)],
    )
  }

  console.log(`  entry  experience/${entry.slug}${existing ? ' (updated)' : ''}`)
}

if (problems.length > 0) {
  console.error('\nRefused to import some content:')
  for (const problem of problems) console.error(`  ${problem}`)
  await closeDb()
  process.exit(1)
}

console.log('\nImport complete.')
await closeDb()
