import type { z } from 'zod'
import type { FormField } from './define-block'

/**
 * A repeatable entity — a job, a case study, an award. Collections exist for
 * rows that outlive the block rendering them: the same experience list can feed
 * a timeline, a CV export and a structured-data payload.
 *
 * The split mirrors blocks: `data` is non-localized (dates, stack, media),
 * `content` is what a translator edits.
 */
export interface CollectionDefinition<
  DataSchema extends z.ZodType = z.ZodType,
  ContentSchema extends z.ZodType = z.ZodType,
> {
  key: string
  label: string
  description: string
  data: DataSchema
  content: ContentSchema
  defaults: { data: z.infer<DataSchema>; content: z.infer<ContentSchema> }
  /** Path within `content` used as the row title in listings. */
  titleField: string
  form: FormField[]
}

export type CollectionDefinitionInput<
  DataSchema extends z.ZodType,
  ContentSchema extends z.ZodType,
> = Omit<CollectionDefinition<DataSchema, ContentSchema>, 'description'> &
  Partial<Pick<CollectionDefinition<DataSchema, ContentSchema>, 'description'>>

export function defineCollection<DataSchema extends z.ZodType, ContentSchema extends z.ZodType>(
  definition: CollectionDefinitionInput<DataSchema, ContentSchema>,
): CollectionDefinition<DataSchema, ContentSchema> {
  return { description: '', ...definition }
}

export interface SerializedCollectionDefinition {
  key: string
  label: string
  description: string
  titleField: string
  form: FormField[]
  defaults: { data: unknown; content: unknown }
}

export function serializeCollectionDefinition(
  definition: CollectionDefinition,
): SerializedCollectionDefinition {
  const { key, label, description, titleField, form, defaults } = definition
  return { key, label, description, titleField, form, defaults }
}
