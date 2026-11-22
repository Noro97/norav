import {
  getBlockDefinition,
  LOCALES,
  snapshotSchema,
  SOURCE_LOCALE,
  validateBlockContent,
  type Locale,
  type Snapshot,
} from '@norav/content-schema'
import { audit } from './audit'
import { query, queryOne } from './db'
import { ROOT_SLUG } from './pages'
import { checksumOf, profileProblems, type PublicationPayload, type PublishProblem } from './publish'
import { diffPublications } from './publish-diff'
import {
  afterPublication,
  livePublication,
  recordPublication,
  type LivePublication,
  type Rebuild,
} from './publish-run'

/**
 * Puts an older version back on the site by publishing it again.
 *
 * Nothing is moved or rewritten: the old row stays, the version it replaces
 * stays, and the restore is a new row that names its source. So a restore can
 * be undone the same way, by restoring the version it replaced.
 *
 * It leaves the drafts alone. They're the editor's work, and a publication
 * can't be turned back into them without losing what made them drafts: library
 * ids, hidden sections and untranslated fields are all resolved away by then.
 * Publishing again therefore puts the drafts back, which `publishDrafts` asks
 * about first.
 */

/** One line of what a restore changes, with both sides cut short for reading. */
export interface ChangeLine {
  path: string
  before: string | null
  after: string | null
}

export interface ChangeArea {
  /** `/work/proof`, `Settings: theme`, `Collection: lab`. */
  label: string
  kind: 'added' | 'removed' | 'changed'
  /** Every changed field, in every language. */
  count: number
  /** The first few, in the source language. */
  sample: ChangeLine[]
}

export interface RestorePlan {
  version: number
  publishedAt: string
  note: string | null
  live: LivePublication
  /** Of the content the restore would publish, which a later publish compares with. */
  checksum: string
  /** The site already shows exactly this content. */
  unchanged: boolean
  /** Why it can't go live again. A restore with any is refused. */
  problems: PublishProblem[]
  areas: ChangeArea[]
  payload?: PublicationPayload
}

export type RestoreOutcome =
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'moved'; live: number }
  | { ok: false; reason: 'refused'; problems: PublishProblem[] }
  | { ok: true; unchanged: true; version: number }
  | {
      ok: true
      unchanged: false
      version: number
      restoredFrom: number
      checksum: string
      publishedAt: string | undefined
      purged: number
      rebuild: Rebuild
    }

const SAMPLE = 8
const SHOWN = 160

/**
 * Checks an old publication against what the site can render today, and
 * returns it in today's shape.
 *
 * It passed publish validation when it was cut, against the registry and the
 * profile of that day. Since then block types have gone, fields have gained
 * defaults, and files have been swept from storage. Each of those would put a
 * broken page live, so each is a reason to refuse, named like a publish error.
 */
export async function checkRestorable(
  payload: unknown,
): Promise<{ payload?: PublicationPayload; problems: PublishProblem[] }> {
  const problems: PublishProblem[] = []
  const where = (locale: Locale, page: string, block: string) => ({ page, block, locale })
  const locales = {} as Record<Locale, Snapshot>
  const stored = (payload as { locales?: Record<string, unknown> } | null)?.locales ?? {}

  for (const locale of LOCALES) {
    const parsed = snapshotSchema.safeParse(stored[locale])
    if (!parsed.success) {
      problems.push({
        ...where(locale, '(publication)', 'locales'),
        path: locale,
        message: stored[locale]
          ? 'Is not in the shape the site reads today.'
          : `Has no ${locale.toUpperCase()} copy.`,
      })
      continue
    }

    const doc = parsed.data
    for (const page of doc.pages) {
      page.blocks = page.blocks.flatMap((block) => {
        if (!getBlockDefinition(block.type)) {
          problems.push({
            ...where(locale, page.slug, block.type),
            path: 'type',
            message: `"${block.type}" is no longer a block type, so this page would not render.`,
          })
          return []
        }
        const result = validateBlockContent(block.type, block.content)
        if (!result.ok) {
          for (const issue of result.issues) {
            problems.push({ ...where(locale, page.slug, block.type), ...issue })
          }
          return []
        }
        // Today's shape, as a publish would write it: a field added since
        // gets its default rather than arriving undefined.
        return [{ ...block, content: result.data as Record<string, unknown> }]
      })
    }
    locales[locale] = doc
  }

  const source = locales[SOURCE_LOCALE]
  if (source) problems.push(...profileProblems(source.settings.profile))

  // A file swept from storage is a hole in the page. Its URL can sit inside a
  // post's HTML as well as on its own, so this looks inside every string.
  const swept = await query<{ url: string }>(`select url from media where purged_at is not null`)
  if (swept.length > 0) {
    const strings: string[] = []
    const collect = (node: unknown) => {
      if (typeof node === 'string') strings.push(node)
      else if (Array.isArray(node)) node.forEach(collect)
      else if (node && typeof node === 'object') Object.values(node).forEach(collect)
    }
    collect(locales)
    for (const { url } of swept) {
      if (strings.some((value) => value.includes(url))) {
        problems.push({
          ...where(SOURCE_LOCALE, '(media)', url),
          path: 'url',
          message: 'Shows a file that has since been deleted from storage.',
        })
      }
    }
  }

  return problems.length > 0 ? { problems } : { payload: { locales }, problems }
}

/** What restoring `version` would do, without doing it. Null when there's no such version. */
export async function planRestore(version: number): Promise<RestorePlan | null> {
  const target = await queryOne<{ payload: unknown; published_at: string; note: string | null }>(
    `select payload, published_at, note from publications where version = $1`,
    [version],
  )
  const live = await livePublication()
  if (!target || !live) return null

  const current = await queryOne<{ payload: unknown }>(`select payload from publications where version = $1`, [
    live.version,
  ])
  const checked = await checkRestorable(target.payload)
  const checksum = checked.payload ? checksumOf(checked.payload) : ''

  return {
    version,
    publishedAt: new Date(target.published_at).toISOString(),
    note: target.note,
    live,
    checksum,
    unchanged: checksum === live.checksum,
    problems: checked.problems,
    areas: summarizeChanges(current?.payload, checked.payload ?? target.payload),
    payload: checked.payload,
  }
}

/**
 * Publishes `version` again, as a new version.
 *
 * `expectLive` is the version the confirmation was shown against. If anything
 * was published since, the list of changes on screen is no longer true, so
 * nothing happens.
 */
export async function restorePublication(options: {
  version: number
  expectLive: number
  note?: string
  actorId: string | null
  ip?: string | null
}): Promise<RestoreOutcome> {
  const plan = await planRestore(options.version)
  if (!plan) return { ok: false, reason: 'not_found' }
  if (plan.live.version !== options.expectLive) return { ok: false, reason: 'moved', live: plan.live.version }
  if (!plan.payload) return { ok: false, reason: 'refused', problems: plan.problems }
  if (plan.unchanged) return { ok: true, unchanged: true, version: plan.live.version }

  const publishedAt = new Date().toISOString()
  for (const locale of LOCALES) {
    const snapshot = plan.payload.locales[locale]
    if (snapshot) Object.assign(snapshot, { publishedAt, checksum: plan.checksum })
  }

  const recorded = await recordPublication({
    payload: plan.payload,
    checksum: plan.checksum,
    note: options.note?.trim() || `Restored version ${options.version}`,
    actorId: options.actorId,
    restoredFrom: options.version,
  })

  await audit({
    actorId: options.actorId,
    action: 'publication.restore',
    entityType: 'publication',
    ip: options.ip,
    diff: {
      version: recorded.version,
      restoredFrom: options.version,
      replaced: plan.live.version,
      checksum: plan.checksum,
    },
  })

  return {
    ok: true,
    unchanged: false,
    version: recorded.version,
    restoredFrom: options.version,
    checksum: plan.checksum,
    publishedAt: recorded.publishedAt,
    ...(await afterPublication()),
  }
}

/**
 * What changes, grouped the way an editor thinks of the site: by page, by
 * setting, by collection.
 *
 * Diffing the stored documents directly would be accurate and unreadable.
 * Pages and rows sit in arrays, so one page added near the top shifts every
 * index after it and reads as a hundred changes. Keying them by slug and
 * section first means a change is reported where it happened.
 */
export function summarizeChanges(before: unknown, after: unknown): ChangeArea[] {
  const areas = new Map<string, ChangeArea>()

  for (const locale of LOCALES) {
    const changes = diffPublications(keyed(docOf(before, locale)), keyed(docOf(after, locale)))
    for (const change of changes) {
      const [scope = '', name = ''] = change.path.split('.')
      const areaPath = name ? `${scope}.${name}` : scope
      const label = labelOf(scope, name)
      const area: ChangeArea = areas.get(label) ?? { label, kind: 'changed', count: 0, sample: [] }
      if (change.path === areaPath) area.kind = change.before === undefined ? 'added' : 'removed'
      area.count += 1
      if (locale === SOURCE_LOCALE && area.sample.length < SAMPLE) {
        area.sample.push({
          path: readable(change.path.slice(areaPath.length + 1)),
          before: shown(change.before),
          after: shown(change.after),
        })
      }
      areas.set(label, area)
    }
  }

  return [...areas.values()]
}

function docOf(payload: unknown, locale: Locale): Snapshot | undefined {
  return (payload as { locales?: Record<string, Snapshot> } | null | undefined)?.locales?.[locale]
}

function keyed(doc: Snapshot | undefined) {
  if (!doc) return undefined
  return {
    settings: doc.settings,
    pages: Object.fromEntries(
      doc.pages.map((page) => [
        page.slug,
        {
          seo: page.seo,
          sections: page.blocks.map((block) => block.type).join(', '),
          blocks: Object.fromEntries(
            page.blocks.map((block) => [
              `${block.type}#${block.id}`,
              { anchorId: block.anchorId, content: block.content, settings: block.settings },
            ]),
          ),
        },
      ]),
    ),
    collections: Object.fromEntries(
      Object.entries(doc.collections).map(([name, rows]) => [
        name,
        {
          order: rows.map((row) => row.slug || row.id).join(', '),
          rows: Object.fromEntries(rows.map((row) => [row.slug || row.id, row.data])),
        },
      ]),
    ),
  }
}

function labelOf(scope: string, name: string): string {
  if (scope === 'pages') return name === ROOT_SLUG ? '/' : `/${name}`
  if (scope === 'settings') return `Settings: ${name}`
  if (scope === 'collections') return `Collection: ${name}`
  return 'The whole site'
}

/** `blocks.case_study#<uuid>.content.title` reads as `case_study · content.title`. */
function readable(path: string): string {
  return path.replace(/^blocks\.([a-z0-9_]+)#[0-9a-f-]{36}\.?/i, (_, type: string) => `${type} · `).replace(/ · $/, '') || '(all of it)'
}

function shown(value: unknown): string | null {
  if (value === undefined) return null
  if (value === '') return '(empty)'
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > SHOWN ? `${text.slice(0, SHOWN)}…` : text
}
