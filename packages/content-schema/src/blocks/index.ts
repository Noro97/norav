import type { z } from 'zod'
import type { BlockDefinition, SerializedBlockDefinition } from '../define-block'
import { serializeBlockDefinition } from '../define-block'
import { heroBlock } from './hero'
import { aboutBlock } from './about'
import { impactStripBlock } from './impact-strip'
import { capabilitiesBlock } from './capabilities'
import { experienceBlock } from './experience'
import { skillsBlock } from './skills'
import { techMarqueeBlock } from './tech-marquee'
import { contactCtaBlock } from './contact-cta'
import { projectsIntroBlock } from './projects-intro'
import { terminalFooterBlock } from './widgets'
import { bentoGridBlock } from './bento-grid'
import {
  ecommerceBlock,
  logisticsBlock,
  merchBlock,
  omniGridBlock,
  proofBlock,
} from './case-study'
import { vibeCodingBlock } from './vibecoding'
import { workflowBlock } from './workflow'

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
  skills: skillsBlock,
  tech_marquee: techMarqueeBlock,
  bento_grid: bentoGridBlock,
  vibecoding: vibeCodingBlock,
  projects_intro: projectsIntroBlock,
  logistics: logisticsBlock,
  merch: merchBlock,
  ecommerce: ecommerceBlock,
  omnigrid: omniGridBlock,
  proof: proofBlock,
  workflow: workflowBlock,
  contact_cta: contactCtaBlock,
  terminal_footer: terminalFooterBlock,
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
  bentoGridBlock,
  ecommerceBlock,
  logisticsBlock,
  merchBlock,
  omniGridBlock,
  proofBlock,
  projectsIntroBlock,
  terminalFooterBlock,
  vibeCodingBlock,
  workflowBlock,
  heroBlock,
  aboutBlock,
  impactStripBlock,
  capabilitiesBlock,
  experienceBlock,
  skillsBlock,
  techMarqueeBlock,
  contactCtaBlock,
}
export type { HeroContent, HeroSettings } from './hero'
export type { AboutContent, AboutSettings } from './about'
export type { ImpactStripContent, ImpactStripSettings } from './impact-strip'
export type { CapabilitiesContent } from './capabilities'
export type { ExperienceBlockContent } from './experience'
export type { SkillsContent } from './skills'
export type { TechMarqueeContent } from './tech-marquee'
export type { ContactCtaContent, ContactCtaSettings } from './contact-cta'
export type { ProjectsIntroContent, ProjectsIntroSettings } from './projects-intro'
export type { WorkflowContent } from './workflow'
export type { VibeCodingContent } from './vibecoding'
export type { CaseStudyContent } from './case-study'
export type { BentoGridContent } from './bento-grid'
