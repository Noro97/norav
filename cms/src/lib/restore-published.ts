import {
  getBlockDefinition,
  LOCALES,
  mergeLocale,
  SOURCE_LOCALE,
  validateBlockContent,
  type Locale,
  type Snapshot,
} from '@norav/content-schema'
import { mediaRefId, resolveMediaRefs, toMediaRef } from './media-refs'
import type { Queryable } from './pull-content'
import { canonical, type PublicationPayload } from './publish'

/**
 * Puts the drafts back to what is published, for the production catch-up.
 *
 * Migrations 0016-0027 write old copy: they overwrite the corrected text, and add
 * sections holding claims that must not return. They can't be edited once shipped,
 * and S5 replaces that copy anyway. So production runs them as written, and this
 * then makes the drafts match the latest publication again, so catching up changes
 * nothing a visitor can see:
 *
 * - Anything the publication holds comes back as it was published.
 * - Anything else is hidden or unpublished, and nothing is deleted.
 *
 * It writes no new copy. Files stay named by id (0029), and menu items stay without
 * their anchors (0031).
 */
export interface Restore {
  version: number
  /** Why the drafts can't be restored. Nothing should be written if there are any. */
  problems: string[]
  writes: { what: string; sql: string; params: unknown[] }[]
}

type Json = Record<string, unknown>

interface PageRow {
  id: string
  slug: string
  status: string
  seo: unknown
}

interface BlockRow {
  id: string
  type: string
  page_id: string
  position: number
  anchor_id: string | null
  is_visible: boolean
  settings: Json
}

interface EntryRow {
  id: string
  collection: string
  slug: string
  is_visible: boolean
  data: Json
}

/** 0031 removed these on purpose, and the site no longer reads them. */
const DEAD_ENTRY_KEYS: Record<string, string[]> = { navigation: ['anchor'] }

export async function planRestore(db: Queryable): Promise<Restore> {
  const [latest] = await db.query<{ version: string; payload: PublicationPayload }>(
    `select version::text, payload from publications order by publications.version desc limit 1`,
  )
  if (!latest) return { version: 0, problems: ['Nothing has been published.'], writes: [] }

  const docs = latest.payload.locales
  const source = docs[SOURCE_LOCALE]
  const others = LOCALES.filter((locale) => locale !== SOURCE_LOCALE && docs[locale])
  const problems: string[] = []
  const writes: Restore['writes'] = []

  const media = await db.query<{ id: string; url: string }>(`select id, url from media where deleted_at is null`)
  const urlOf = new Map(media.map((row) => [row.id, row.url]))
  const idOf = new Map(media.map((row) => [row.url, row.id]))
  const resolved = (value: unknown) => resolveMediaRefs(value, urlOf).value
  const same = (draft: unknown, published: unknown) => canonical(resolved(draft)) === canonical(published)
  /** What 0029 does: a string that is exactly a library file's URL names it by id. */
  const named = (value: unknown): unknown => {
    if (typeof value === 'string') {
      const id = idOf.get(value)
      return id && !mediaRefId(value) ? toMediaRef(id) : value
    }
    if (Array.isArray(value)) return value.map(named)
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, named(item)]))
    }
    return value
  }

  // ── Pages ───────────────────────────────────────────────────────────────────
  const pages = await db.query<PageRow>(`select id, slug, status, seo from pages`)
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  const publishedSlugs = new Set(source.pages.map((page) => page.slug))

  for (const page of pages) {
    if (publishedSlugs.has(page.slug)) continue
    if (page.status === 'published') {
      writes.push({
        what: `unpublish page ${page.slug}`,
        sql: `update pages set status = 'draft' where id = $1`,
        params: [page.id],
      })
    }
  }

  // ── Blocks ──────────────────────────────────────────────────────────────────
  const blocks = await db.query<BlockRow>(
    `select id, type, page_id, position::float8 as position, anchor_id, is_visible, settings
       from blocks where deleted_at is null`,
  )
  const blockById = new Map(blocks.map((block) => [block.id, block]))
  const translations = await db.query<{ block_id: string; locale: Locale; content: Json }>(
    `select block_id, locale, content from block_translations`,
  )
  const copyOf = (id: string, locale: Locale) =>
    translations.find((row) => row.block_id === id && row.locale === locale)?.content

  const publishedBlocks = new Set<string>()

  for (const doc of source.pages) {
    const page = pageBySlug.get(doc.slug)
    if (!page) {
      problems.push(`The publication has page ${doc.slug}, and the drafts don't.`)
      continue
    }
    if (page.status !== 'published') {
      writes.push({
        what: `publish page ${doc.slug}`,
        sql: `update pages set status = 'published' where id = $1`,
        params: [page.id],
      })
    }
    if (canonical(page.seo) !== canonical(doc.seo)) {
      writes.push({
        what: `search listing of ${doc.slug}`,
        sql: `update pages set seo = $2 where id = $1`,
        params: [page.id, JSON.stringify(doc.seo)],
      })
    }

    let previous: number | null = null
    for (const published of doc.blocks) {
      publishedBlocks.add(published.id)
      const label = `${doc.slug}/${published.type}`
      const block = blockById.get(published.id)
      if (!block) {
        problems.push(`The publication has ${label}, and the drafts have deleted it.`)
        continue
      }

      const moved = block.page_id !== page.id
      const outOfOrder: boolean = previous !== null && block.position <= previous
      const position: number = moved || outOfOrder ? (previous ?? 0) + 1000 : block.position
      previous = position
      if (moved || outOfOrder || !block.is_visible || block.anchor_id !== published.anchorId) {
        writes.push({
          what: `${moved ? 'move back' : 'place'} ${label}`,
          sql: `update blocks set page_id = $2, position = $3, anchor_id = $4, is_visible = true where id = $1`,
          params: [block.id, page.id, position, published.anchorId],
        })
      }

      if (!same(block.settings, published.settings)) {
        writes.push({
          what: `settings of ${label}`,
          sql: `update blocks set settings = $2 where id = $1`,
          params: [block.id, JSON.stringify(named(published.settings))],
        })
      }

      const definition = getBlockDefinition(block.type)
      const draft = copyOf(block.id, SOURCE_LOCALE) ?? (definition?.defaults.content as Json | undefined) ?? {}
      const checked = validateBlockContent(block.type, draft)
      const restoring = !checked.ok || !same(checked.data, published.content)
      if (restoring) writes.push(restoreCopy(`${label} (${SOURCE_LOCALE})`, block.id, SOURCE_LOCALE, named(published.content)))
      const nextSource = restoring ? published.content : draft

      for (const locale of others) {
        const translated = docs[locale].pages.find((p) => p.slug === doc.slug)?.blocks.find((b) => b.id === block.id)
        if (!translated) continue
        const merged = validateBlockContent(block.type, mergeLocale(nextSource, copyOf(block.id, locale)))
        if (!merged.ok || !same(merged.data, translated.content)) {
          writes.push(restoreCopy(`${label} (${locale})`, block.id, locale, named(translated.content)))
        }
      }
    }
  }

  for (const block of blocks) {
    if (publishedBlocks.has(block.id) || !block.is_visible) continue
    const page = pages.find((candidate) => candidate.id === block.page_id)
    // A page that was already a draft isn't something the migrations released.
    if (page?.status !== 'published') continue
    writes.push({
      what: `hide ${page.slug}/${block.type}`,
      sql: `update blocks set is_visible = false where id = $1`,
      params: [block.id],
    })
  }

  // ── Entries ─────────────────────────────────────────────────────────────────
  const entries = await db.query<EntryRow>(
    `select id, collection, slug, is_visible, data from entries where deleted_at is null`,
  )
  const entryCopies = await db.query<{ entry_id: string; locale: Locale; data: Json }>(
    `select entry_id, locale, data from entry_translations`,
  )
  const entryCopy = (id: string, locale: Locale) =>
    entryCopies.find((row) => row.entry_id === id && row.locale === locale)?.data ?? {}

  for (const entry of entries) {
    const label = `${entry.collection}/${entry.slug}`
    const published = source.collections[entry.collection]?.find((item) => item.slug === entry.slug)
    if (!published) {
      if (entry.is_visible) {
        writes.push({
          what: `hide ${label}`,
          sql: `update entries set is_visible = false where id = $1`,
          params: [entry.id],
        })
      }
      continue
    }
    if (!entry.is_visible) {
      writes.push({
        what: `show ${label}`,
        sql: `update entries set is_visible = true where id = $1`,
        params: [entry.id],
      })
    }

    const dead = DEAD_ENTRY_KEYS[entry.collection] ?? []
    const shared = { ...entry.data }
    const sourceCopy = { ...entryCopy(entry.id, SOURCE_LOCALE) }
    const sharedBefore = canonical(shared)
    const sourceBefore = canonical(sourceCopy)

    for (const [key, value] of Object.entries(published.data as Json)) {
      if (dead.includes(key) || same({ ...shared, ...sourceCopy }[key], value)) continue
      const target = key in sourceCopy ? sourceCopy : shared
      target[key] = named(value)
    }
    if (canonical(shared) !== sharedBefore) {
      writes.push({
        what: `data of ${label}`,
        sql: `update entries set data = $2 where id = $1`,
        params: [entry.id, JSON.stringify(shared)],
      })
    }
    if (canonical(sourceCopy) !== sourceBefore) writes.push(restoreEntryCopy(label, entry.id, SOURCE_LOCALE, sourceCopy))

    for (const locale of others) {
      const translated = docs[locale].collections[entry.collection]?.find((item) => item.slug === entry.slug)
      if (!translated) continue
      const copy = { ...entryCopy(entry.id, locale) }
      const before = canonical(copy)
      const merged: Json = { ...shared, ...mergeLocale(sourceCopy, copy) }
      for (const [key, value] of Object.entries(translated.data as Json)) {
        if (dead.includes(key) || same(merged[key], value)) continue
        copy[key] = named(value)
      }
      if (canonical(copy) !== before) writes.push(restoreEntryCopy(label, entry.id, locale, copy))
    }
  }

  return { version: Number(latest.version), problems, writes }
}

function restoreCopy(what: string, blockId: string, locale: Locale, content: unknown): Restore['writes'][number] {
  return {
    what: `copy of ${what}`,
    sql: `insert into block_translations (block_id, locale, content, status)
          values ($1, $2, $3, 'ready')
          on conflict (block_id, locale) do update set content = excluded.content, status = 'ready'`,
    params: [blockId, locale, JSON.stringify(content)],
  }
}

function restoreEntryCopy(what: string, entryId: string, locale: Locale, data: unknown): Restore['writes'][number] {
  return {
    what: `copy of ${what} (${locale})`,
    sql: `insert into entry_translations (entry_id, locale, data, status)
          values ($1, $2, $3, 'ready')
          on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready'`,
    params: [entryId, locale, JSON.stringify(data)],
  }
}

/** Differences that 0027 and 0031 make on purpose, and that nothing on the site reads. */
const EXPECTED = [/^collections\.navigation\[\d+\]\.data\.anchor$/, /^settings\.site\.(grain|cursor|dynamicGrid)$/]

export interface Difference {
  locale: string
  path: string
  published: unknown
  next: unknown
  expected: boolean
}

/** Every value that differs between two publications, leaving out their version and timestamps. */
export function differences(published: PublicationPayload, next: PublicationPayload): Difference[] {
  const found: Difference[] = []
  const walk = (locale: string, a: unknown, b: unknown, path: string) => {
    const isObject = (value: unknown) => value !== null && typeof value === 'object'
    if (isObject(a) && isObject(b)) {
      const keys = new Set([...Object.keys(a as Json), ...Object.keys(b as Json)])
      for (const key of keys) {
        const child = Array.isArray(a) ? `${path}[${key}]` : path ? `${path}.${key}` : key
        walk(locale, (a as Json)[key], (b as Json)[key], child)
      }
      return
    }
    if (a !== b) {
      found.push({ locale, path, published: a, next: b, expected: EXPECTED.some((pattern) => pattern.test(path)) })
    }
  }
  for (const locale of LOCALES) {
    const strip = ({ settings, pages, collections }: Snapshot) => ({ settings, pages, collections })
    if (published.locales[locale] && next.locales[locale]) {
      walk(locale, strip(published.locales[locale]), strip(next.locales[locale]), '')
    }
  }
  return found
}
