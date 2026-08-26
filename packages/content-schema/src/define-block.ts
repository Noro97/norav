import type { z } from 'zod'

/**
 * How much of a section the CMS actually owns.
 *
 * 1 — content block: every prop comes from the CMS.
 * 2 — app widget: the CMS owns order, visibility, copy and media; the
 *     interactive internals stay in code (a map, a data grid, a 3D scene).
 * 3 — chrome: not a block at all. Lives in `settings` (cursor, grain, SEO).
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

/**
 * Declarative description of one editor control. The admin renders forms from
 * these descriptors, so a new block type ships without hand-written UI.
 */
export interface FormField {
  /** Dot path inside `content` (or `settings`, see `source`). */
  field: string
  label: string
  control: FormControl
  source?: 'content' | 'settings'
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
  singleton: boolean
  form: FormField[]
  defaults: { content: unknown; settings: unknown }
}

export function serializeBlockDefinition(definition: BlockDefinition): SerializedBlockDefinition {
  const { type, label, tier, description, singleton, form, defaults } = definition
  return { type, label, tier, description, singleton, form, defaults }
}
