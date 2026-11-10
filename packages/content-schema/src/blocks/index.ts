import type { z } from 'zod'
import type { BlockDefinition, SerializedBlockDefinition } from '../define-block'
import { serializeBlockDefinition } from '../define-block'
import { heroBlock } from './hero'
import { aboutBlock } from './about'
import { impactStripBlock } from './impact-strip'
import { capabilitiesBlock } from './capabilities'
import { experienceBlock } from './experience'
import { contactCtaBlock } from './contact-cta'
import { terminalFooterBlock } from './terminal-footer'
import { siteFooterBlock } from './site-footer'
import { workIndexBlock } from './work-index'
import { stackBlock } from './stack'
import {
  ecommerceBlock,
  logisticsBlock,
  merchBlock,
  omniGridBlock,
  proofBlock,
} from './case-study'
import {
  ecommerceDetailBlock,
  logisticsDetailBlock,
  merchDetailBlock,
  omnigridDetailBlock,
  proofDetailBlock,
} from './case-study-detail'
import { caseStudyBlock } from './case-study-story'
import { testimonialsBlock } from './testimonials'
import {
  kitProcessBlock,
  kitFaqBlock,
  kitCtaBannerBlock,
} from './kit/extra'
import {
  kitCompareTableBlock,
  kitToolStackBlock,
  kitWritingBlock,
} from './kit/more'

/**
 * Every block the CMS can create. The database stores `blocks.type` as free
 * text and validates it against this map, so shipping a new block type is a
 * code change, never a migration.
 */
export const BLOCK_REGISTRY = {
  hero: heroBlock,
  about: aboutBlock,
  impact_strip: impactStripBlock,
  capabilities: capabilitiesBlock,
  experience: experienceBlock,
  stack: stackBlock,
  work_index: workIndexBlock,
  logistics: logisticsBlock,
  logistics_detail: logisticsDetailBlock,
  merch: merchBlock,
  merch_detail: merchDetailBlock,
  ecommerce: ecommerceBlock,
  ecommerce_detail: ecommerceDetailBlock,
  omnigrid: omniGridBlock,
  omnigrid_detail: omnigridDetailBlock,
  proof: proofBlock,
  proof_detail: proofDetailBlock,
  case_study: caseStudyBlock,
  contact_cta: contactCtaBlock,
  terminal_footer: terminalFooterBlock,
  site_footer: siteFooterBlock,

  // Not a singleton: usable on any page, more than once.
  testimonials: testimonialsBlock,

  // The six sections kept from the imported kit, each with its copy in a schema
  // an editor can reach.
  kit_process: kitProcessBlock,
  kit_faq: kitFaqBlock,
  kit_cta_banner: kitCtaBannerBlock,
  kit_compare_table: kitCompareTableBlock,
  kit_tool_stack: kitToolStackBlock,
  kit_writing: kitWritingBlock,
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

export function toIssues(error: z.ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}

export function validateWith(schema: z.ZodType, value: unknown): ValidationResult<unknown> {
  const result = schema.safeParse(value)
  return result.success ? { ok: true, data: result.data } : { ok: false, issues: toIssues(result.error) }
}

const unknownType = (type: string): ValidationResult<unknown> => ({
  ok: false,
  issues: [{ path: 'type', message: `Unknown block type "${type}"` }],
})

/** Guards every write: invalid JSONB can never reach the database. */
export function validateBlockContent(type: string, value: unknown): ValidationResult<unknown> {
  const definition = getBlockDefinition(type)
  return definition ? validateWith(definition.content, value) : unknownType(type)
}

export function validateBlockSettings(type: string, value: unknown): ValidationResult<unknown> {
  const definition = getBlockDefinition(type)
  return definition ? validateWith(definition.settings, value) : unknownType(type)
}

export {
  ecommerceBlock,
  ecommerceDetailBlock,
  logisticsDetailBlock,
  merchDetailBlock,
  omnigridDetailBlock,
  proofDetailBlock,
  logisticsBlock,
  merchBlock,
  omniGridBlock,
  proofBlock,
  terminalFooterBlock,
  heroBlock,
  aboutBlock,
  impactStripBlock,
  capabilitiesBlock,
  experienceBlock,
  contactCtaBlock,
  workIndexBlock,
  stackBlock,
}
export {
  kitProcessBlock,
  kitFaqBlock,
  kitCtaBannerBlock,
} from './kit/extra'
export {
  kitCompareTableBlock,
  kitToolStackBlock,
  kitWritingBlock,
} from './kit/more'
export type { HeroContent, HeroSettings } from './hero'
export type { AboutContent, AboutSettings } from './about'
export type { ImpactStripContent, ImpactStripSettings } from './impact-strip'
export type { CapabilitiesContent, CapabilitiesSettings } from './capabilities'
export type { ExperienceBlockContent, ExperienceSettings } from './experience'
export type { ContactCtaContent, ContactCtaSettings } from './contact-cta'
export type { SiteFooterContent, SiteFooterSettings } from './site-footer'
export type { WorkIndexContent, WorkIndexSettings } from './work-index'
export type { StackContent, StackSettings } from './stack'
export type { CaseStudyContent, CaseStudySettings } from './case-study'
export type { CaseStudyDetailContent } from './case-study-detail'
export type { CaseStudyStoryContent } from './case-study-story'
export type { TerminalFooterContent, TerminalFooterSettings } from './terminal-footer'
export type { TestimonialsContent, TestimonialsSettings } from './testimonials'
export { KIT_GROUP } from './kit/shared'
export type {
  KitProcessContent,
  KitFaqContent,
  KitCtaBannerContent,
} from './kit/extra'
export type {
  KitCompareTableContent,
  KitToolStackContent,
  KitWritingContent,
} from './kit/more'
