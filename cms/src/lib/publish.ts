import { createHash } from 'node:crypto'
import {
  DEFAULT_THEME,
  deriveThemeTokens,
  getBlockDefinition,
  LOCALES,
  mergeLocale,
  SOURCE_LOCALE,
  validateBlockContent,
  type Locale,
  type Snapshot,
  type SnapshotBlock,
  type SnapshotEntry,
  themeSchema,
  type SnapshotPage,
} from '@norav/content-schema'
import { query } from './db'

/**
 * Turns the working tables into one immutable document per locale.
 *
 * Everything the site would otherwise have to do at runtime happens here once:
 * ordering, visibility filtering, locale fallback, and a full schema check. A
 * publication that passes this function cannot render a broken page.
 */

export interface PublicationPayload {
  locales: Record<Locale, Snapshot>
}

export interface PublishProblem {
  page: string
  block: string
  locale: Locale
  path: string
  message: string
}

export type PublishResult =
  | { ok: true; payload: PublicationPayload; checksum: string }
  | { ok: false; problems: PublishProblem[] }

interface BlockRow {
  id: string
  type: string
  anchor_id: string | null
  settings: Record<string, unknown>
  page_slug: string
  translations: Record<string, Record<string, unknown>>
}

interface EntryRow {
  id: string
  collection: string
  slug: string
  data: Record<string, unknown>
  translations: Record<string, Record<string, unknown>>
}

/** Stable key order, so an unchanged site always hashes to the same checksum. */
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`
}

export async function buildPublication(): Promise<PublishResult> {
  const pages = await query<{ id: string; slug: string; seo: Record<string, unknown> }>(
    `select id, slug, seo from pages where status = 'published' order by slug`,
  )

  const blocks = await query<BlockRow>(
    `select b.id, b.type, b.anchor_id, b.settings, p.slug as page_slug,
            coalesce(jsonb_object_agg(t.locale, t.content) filter (where t.locale is not null), '{}'::jsonb) as translations
       from blocks b
       join pages p on p.id = b.page_id
       left join block_translations t on t.block_id = b.id
      where b.deleted_at is null and b.is_visible and p.status = 'published'
      group by b.id, p.slug, b.position
      order by p.slug, b.position`,
  )

  const entries = await query<EntryRow>(
    `select e.id, e.collection, e.slug, e.data,
            coalesce(jsonb_object_agg(t.locale, t.data) filter (where t.locale is not null), '{}'::jsonb) as translations
       from entries e
       left join entry_translations t on t.entry_id = e.id
      where e.deleted_at is null and e.is_visible
      group by e.id
      order by e.collection, e.position`,
  )

  const settingsRows = await query<{ key: string; value: unknown }>(`select key, value from settings`)
  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]))

  // The palette is two decisions in the database and a full set of CSS
  // variables on the page. Deriving here means the site writes what it is told
  // and never computes a colour — and a malformed theme falls back to the
  // shipped one rather than publishing a page nobody can read.
  const parsedTheme = themeSchema.safeParse(settings.theme)
  const theme = parsedTheme.success ? parsedTheme.data : DEFAULT_THEME
  settings.theme = { ...theme, tokens: deriveThemeTokens(theme) }

  const problems: PublishProblem[] = []
  const publishedAt = new Date().toISOString()

  const locales = {} as Record<Locale, Snapshot>

  for (const locale of LOCALES) {
    const pageDocs: SnapshotPage[] = pages.map((page) => {
      const pageBlocks: SnapshotBlock[] = []

      for (const block of blocks.filter((b) => b.page_slug === page.slug)) {
        const definition = getBlockDefinition(block.type)
        if (!definition) {
          problems.push({
            page: page.slug,
            block: block.type,
            locale,
            path: 'type',
            message: `Unknown block type "${block.type}" — it is in the database but not in the registry.`,
          })
          continue
        }

        // The source locale owns structure; other locales only overlay leaves.
        //
        // The defaults are a starting point for a *new* block, never a merge
        // base: merging onto them would clamp every array to the length the
        // default happens to have, quietly dropping rows the editor added.
        const source = block.translations[SOURCE_LOCALE] ?? definition.defaults.content
        const content =
          locale === SOURCE_LOCALE ? source : mergeLocale(source, block.translations[locale])

        const result = validateBlockContent(block.type, content)
        if (!result.ok) {
          for (const issue of result.issues) {
            problems.push({ page: page.slug, block: block.type, locale, ...issue })
          }
          continue
        }

        pageBlocks.push({
          id: block.id,
          type: block.type,
          anchorId: block.anchor_id,
          content: result.data as Record<string, unknown>,
          settings: block.settings,
        })
      }

      return { slug: page.slug, seo: page.seo, blocks: pageBlocks }
    })

    const collections: Record<string, SnapshotEntry[]> = {}
    for (const entry of entries) {
      // `entry.data` and the translations hold disjoint keys — the
      // non-localized columns and the translated ones — so they compose rather
      // than merge. Only the translations overlay each other.
      const source = entry.translations[SOURCE_LOCALE] ?? {}
      const localized =
        locale === SOURCE_LOCALE ? source : mergeLocale(source, entry.translations[locale])
      ;(collections[entry.collection] ??= []).push({
        id: entry.id,
        slug: entry.slug,
        data: { ...entry.data, ...localized },
      })
    }

    locales[locale] = {
      version: 0, // replaced with the row id once the publication is inserted
      publishedAt,
      checksum: '',
      locale,
      settings,
      pages: pageDocs,
      collections,
    }
  }

  if (problems.length > 0) return { ok: false, problems }

  const payload: PublicationPayload = { locales }
  // Hash the content only. Version, checksum and publish time are metadata:
  // including them would make every publish look like a change.
  const checksum = createHash('sha256')
    .update(
      canonical(
        LOCALES.map((locale) => {
          const snapshot = locales[locale]
          return snapshot
            ? {
                locale,
                settings: snapshot.settings,
                pages: snapshot.pages,
                collections: snapshot.collections,
              }
            : null
        }),
      ),
    )
    .digest('hex')
  for (const locale of LOCALES) {
    const snapshot = locales[locale]
    if (snapshot) snapshot.checksum = checksum
  }

  return { ok: true, payload, checksum }
}

/** Stamps the assigned version into each locale document. */
export function stampVersion(payload: PublicationPayload, version: number): PublicationPayload {
  for (const locale of LOCALES) {
    const snapshot = payload.locales[locale]
    if (snapshot) snapshot.version = version
  }
  return payload
}
