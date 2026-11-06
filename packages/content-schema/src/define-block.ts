import type { z } from 'zod'
import { getAtPath, setAtPath } from './paths'

/**
 * How much of a section the CMS actually owns.
 *
 * 1 — content block: every prop comes from the CMS.
 * 2 — app widget: the CMS owns order, visibility, copy and media; the
 *     interactive internals stay in code (a map, a data grid, a faceted search).
 * 3 — chrome: not a block at all. Lives in `settings` (theme, nav indicator
 *     style, SEO).
 */
export type BlockTier = 1 | 2 | 3

export type FormControl =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'media'
  | 'repeater'
  | 'group'
  | 'collection'
  /** A page in this site, chosen from the ones that exist. */
  | 'page'

/**
 * Declarative description of one editor control. The admin renders forms from
 * these descriptors, so a new block type ships without hand-written UI.
 */
export interface FormField {
  /** Dot path inside `content` (or `settings`, see `source`). */
  field: string
  label: string
  control: FormControl
  source?: 'content' | 'settings' | 'data'
  /**
   * Whether this value differs per language. Defaults to true.
   *
   * A number, a URL, a proficiency level or a product name is the same in every
   * locale, and duplicating it into each translation means it drifts. Fields
   * marked `localized: false` are edited only in the source locale; other
   * locales inherit them through the merge, so changing one updates all.
   */
  localized?: boolean
  help?: string
  placeholder?: string
  /** `select` only. */
  options?: { value: string; label: string }[]
  /** `group` and `repeater` children. */
  fields?: FormField[]
  /** `repeater` only — path within a row used as its collapsed title. */
  itemLabel?: string
  /** `repeater` only. */
  min?: number
  max?: number
  /** `media` only — a field that holds a video. Every other media field lists the rest of the library. */
  accept?: 'video'
  /** `collection` only — which collection this block pulls its rows from. */
  collection?: string
}

export interface BlockDefinition<
  ContentSchema extends z.ZodType = z.ZodType,
  SettingsSchema extends z.ZodType = z.ZodType,
> {
  type: string
  label: string
  tier: BlockTier
  description: string
  /**
   * Which heading this sits under in the admin's section picker.
   *
   * One flat list was right for the site's own two dozen sections. It stops
   * being right at eighty, which is where the imported kit takes it — a picker
   * you have to read end to end is a picker nobody reads.
   */
  group?: string
  /** A singleton block may appear at most once per page (hero, footer). */
  singleton: boolean
  /** Localized copy — one row per locale in `block_translations`. */
  content: ContentSchema
  /** Non-localized configuration — a single JSONB column on `blocks`. */
  settings: SettingsSchema
  defaults: {
    content: z.infer<ContentSchema>
    settings: z.infer<SettingsSchema>
  }
  form: FormField[]
}

export type BlockDefinitionInput<
  ContentSchema extends z.ZodType,
  SettingsSchema extends z.ZodType,
> = Omit<BlockDefinition<ContentSchema, SettingsSchema>, 'singleton' | 'description'> &
  Partial<Pick<BlockDefinition<ContentSchema, SettingsSchema>, 'singleton' | 'description'>>

/** Sections that come from this site's own design, not from an import. */
export const HOUSE_GROUP = 'This site'

export function defineBlock<ContentSchema extends z.ZodType, SettingsSchema extends z.ZodType>(
  definition: BlockDefinitionInput<ContentSchema, SettingsSchema>,
): BlockDefinition<ContentSchema, SettingsSchema> {
  return { singleton: false, description: '', ...definition }
}

/**
 * The JSON-safe half of a definition, served by `GET /api/admin/schema`.
 *
 * Zod schemas stay on the server — the admin needs the form descriptor and the
 * defaults, and validation happens where it can be trusted.
 */
export interface SerializedBlockDefinition {
  type: string
  label: string
  tier: BlockTier
  description: string
  group: string
  singleton: boolean
  form: FormField[]
  defaults: { content: unknown; settings: unknown }
}

/**
 * Every leaf path a translator owns, expanded over the actual content so that
 * repeater rows are addressed individually.
 */
function localizedLeafPaths(fields: FormField[], content: unknown, prefix = ''): string[] {
  const paths: string[] = []

  for (const field of fields) {
    if ((field.source ?? 'content') !== 'content') continue
    if (field.localized === false) continue

    const path = prefix ? `${prefix}.${field.field}` : field.field

    if (field.control === 'group') {
      paths.push(...localizedLeafPaths(field.fields ?? [], content, path))
      continue
    }

    if (field.control === 'repeater') {
      const rows = getAtPath(content, path)
      if (!Array.isArray(rows)) continue
      rows.forEach((_row, index) => {
        paths.push(...localizedLeafPaths(field.fields ?? [], content, `${path}.${index}`))
      })
      continue
    }

    paths.push(path)
  }

  return paths
}

/**
 * The part of `content` a translator owns: everything except the fields marked
 * `localized: false`. Storing only this keeps a number, a URL or a product name
 * in one place — the source locale — instead of copying it into every language,
 * where it would quietly drift.
 */
export function pickLocalized(fields: FormField[], content: unknown): unknown {
  let result: unknown = {}
  for (const path of localizedLeafPaths(fields, content)) {
    const value = getAtPath(content, path)
    if (value !== undefined) result = setAtPath(result, path, value)
  }
  return result
}

export function serializeBlockDefinition(definition: BlockDefinition): SerializedBlockDefinition {
  const { type, label, tier, description, group, singleton, form, defaults } = definition
  return { type, label, tier, description, group: group ?? HOUSE_GROUP, singleton, form, defaults }
}
