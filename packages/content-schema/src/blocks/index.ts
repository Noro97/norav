import type { z } from 'zod'
import type { BlockDefinition, SerializedBlockDefinition } from '../define-block'
import { serializeBlockDefinition } from '../define-block'
import { heroBlock } from './hero'

/**
 * Every block the CMS can create. The database stores `blocks.type` as free
 * text and validates it against this map, so shipping a new block type is a
 * code change, never a migration.
 */
export const BLOCK_REGISTRY = {
  hero: heroBlock,
} satisfies Record<string, BlockDefinition<z.ZodType, z.ZodType>>

export type BlockType = keyof typeof BLOCK_REGISTRY

export function isBlockType(value: unknown): value is BlockType {
  return typeof value === 'string' && value in BLOCK_REGISTRY
}

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return isBlockType(type) ? (BLOCK_REGISTRY[type] as BlockDefinition) : undefined
}

export function listBlockDefinitions(): SerializedBlockDefinition[] {
  return Object.values(BLOCK_REGISTRY).map((definition) =>
    serializeBlockDefinition(definition as BlockDefinition),
  )
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: { path: string; message: string }[] }

function toIssues(error: z.ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}

function validate(schema: z.ZodType, value: unknown): ValidationResult<unknown> {
  const result = schema.safeParse(value)
  return result.success ? { ok: true, data: result.data } : { ok: false, issues: toIssues(result.error) }
}

/** Guards every write: invalid JSONB can never reach the database. */
export function validateBlockContent(type: string, value: unknown): ValidationResult<unknown> {
  const definition = getBlockDefinition(type)
  if (!definition) return { ok: false, issues: [{ path: 'type', message: `Unknown block type "${type}"` }] }
  return validate(definition.content, value)
}

export function validateBlockSettings(type: string, value: unknown): ValidationResult<unknown> {
  const definition = getBlockDefinition(type)
  if (!definition) return { ok: false, issues: [{ path: 'type', message: `Unknown block type "${type}"` }] }
  return validate(definition.settings, value)
}

export { heroBlock }
export type { HeroContent, HeroSettings } from './hero'
