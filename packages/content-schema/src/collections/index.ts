import type { z } from 'zod'
import type { CollectionDefinition, SerializedCollectionDefinition } from '../define-collection'
import { serializeCollectionDefinition } from '../define-collection'
import { experienceCollection } from './experience'
import { validateWith, type ValidationResult } from '../blocks'

export const COLLECTION_REGISTRY = {
  experience: experienceCollection,
} satisfies Record<string, CollectionDefinition<z.ZodType, z.ZodType>>

export type CollectionKey = keyof typeof COLLECTION_REGISTRY

export function getCollectionDefinition(key: string): CollectionDefinition | undefined {
  return key in COLLECTION_REGISTRY
    ? (COLLECTION_REGISTRY[key as CollectionKey] as CollectionDefinition)
    : undefined
}

export function listCollectionDefinitions(): SerializedCollectionDefinition[] {
  return Object.values(COLLECTION_REGISTRY).map((definition) =>
    serializeCollectionDefinition(definition as CollectionDefinition),
  )
}

const unknownCollection = (key: string): ValidationResult<unknown> => ({
  ok: false,
  issues: [{ path: 'collection', message: `Unknown collection "${key}"` }],
})

export function validateEntryData(key: string, value: unknown): ValidationResult<unknown> {
  const definition = getCollectionDefinition(key)
  return definition ? validateWith(definition.data, value) : unknownCollection(key)
}

export function validateEntryContent(key: string, value: unknown): ValidationResult<unknown> {
  const definition = getCollectionDefinition(key)
  return definition ? validateWith(definition.content, value) : unknownCollection(key)
}

export { experienceCollection }
export type { ExperienceData, ExperienceContent } from './experience'
