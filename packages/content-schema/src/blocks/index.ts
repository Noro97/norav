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
import { recruiterCtaBlock } from './recruiter-cta'
import { projectsIntroBlock } from './projects-intro'
import { bentoGridBlock } from './bento-grid'
import { terminalFooterBlock } from './terminal-footer'
import { siteFooterBlock } from './site-footer'
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
import { vibeCodingBlock } from './vibecoding'
import { workflowBlock } from './workflow'
import { galleryBlock } from './gallery'
import { ctaBannerBlock } from './cta-banner'
import { testimonialsBlock } from './testimonials'
import { metricsBlock } from './metrics'
import { portfolioSectionBlock } from './portfolio-section'
import {
  kitStatsMarqueeBlock,
  kitServicesBlock,
  kitProcessBlock,
  kitPricingBlock,
  kitPressBlock,
  kitFaqBlock,
  kitCtaBannerBlock,
} from './kit/extra'
import {
  kitAwardsBlock,
  kitBigMarqueeBlock,
  kitCompareTableBlock,
  kitShowReelBlock,
  kitTimelineBlock,
  kitToolStackBlock,
  kitVisualFeedBlock,
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
  skills: skillsBlock,
  tech_marquee: techMarqueeBlock,
  bento_grid: bentoGridBlock,
  vibecoding: vibeCodingBlock,
  projects_intro: projectsIntroBlock,
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
  workflow: workflowBlock,
  contact_cta: contactCtaBlock,
  recruiter_cta: recruiterCtaBlock,
  terminal_footer: terminalFooterBlock,
  site_footer: siteFooterBlock,

  // Built out of the shared effects rather than around a bespoke widget, and
  // none of them singletons: the point of each is to be usable on any page,
  // more than once.
  gallery: galleryBlock,
  cta_banner: ctaBannerBlock,
  testimonials: testimonialsBlock,
  metrics: metricsBlock,

  // Any one of the sections imported from the portfolio project. One type
  // rather than fifty-three: the section is a setting, not a schema.
  portfolio_section: portfolioSectionBlock,

  // The same sections, promoted: one block type each, with their copy lifted
  // out of the component and into a schema an editor can reach.
  kit_stats_marquee: kitStatsMarqueeBlock,
  kit_services: kitServicesBlock,
  kit_process: kitProcessBlock,
  kit_pricing: kitPricingBlock,
  kit_press: kitPressBlock,
  kit_faq: kitFaqBlock,
  kit_cta_banner: kitCtaBannerBlock,
  kit_awards: kitAwardsBlock,
  kit_big_marquee: kitBigMarqueeBlock,
  kit_compare_table: kitCompareTableBlock,
  kit_show_reel: kitShowReelBlock,
  kit_timeline: kitTimelineBlock,
  kit_tool_stack: kitToolStackBlock,
  kit_visual_feed: kitVisualFeedBlock,
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
  bentoGridBlock,
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
export {
  kitStatsMarqueeBlock,
  kitServicesBlock,
  kitProcessBlock,
  kitPricingBlock,
  kitPressBlock,
  kitFaqBlock,
  kitCtaBannerBlock,
} from './kit/extra'
export {
  kitAwardsBlock,
  kitBigMarqueeBlock,
  kitCompareTableBlock,
  kitShowReelBlock,
  kitTimelineBlock,
  kitToolStackBlock,
  kitVisualFeedBlock,
  kitWritingBlock,
} from './kit/more'
export type { HeroContent, HeroSettings } from './hero'
export type { AboutContent, AboutSettings } from './about'
export type { ImpactStripContent, ImpactStripSettings } from './impact-strip'
export type { CapabilitiesContent, CapabilitiesSettings } from './capabilities'
export type { ExperienceBlockContent, ExperienceSettings } from './experience'
export type { SkillsContent, SkillsSettings } from './skills'
export type { TechMarqueeContent, TechMarqueeSettings } from './tech-marquee'
export type { ContactCtaContent, ContactCtaSettings } from './contact-cta'
export type { SiteFooterContent, SiteFooterSettings } from './site-footer'
export type { RecruiterCtaContent, RecruiterCtaSettings } from './recruiter-cta'
export type { ProjectsIntroContent, ProjectsIntroSettings } from './projects-intro'
export type { WorkflowContent, WorkflowSettings } from './workflow'
export type { VibeCodingContent, VibeCodingSettings } from './vibecoding'
export type { CaseStudyContent, CaseStudySettings } from './case-study'
export type { CaseStudyDetailContent } from './case-study-detail'
export type { BentoGridContent, BentoGridSettings } from './bento-grid'
export type { TerminalFooterContent, TerminalFooterSettings } from './terminal-footer'
export type { GalleryContent, GallerySettings } from './gallery'
export type { CtaBannerContent, CtaBannerSettings } from './cta-banner'
export type { TestimonialsContent, TestimonialsSettings } from './testimonials'
export type { MetricsContent, MetricsSettings } from './metrics'
export type { PortfolioSectionContent, PortfolioSectionSettings } from './portfolio-section'
export { PORTFOLIO_SECTION_OPTIONS, portfolioSectionVariant } from './portfolio-section'
export { KIT_GROUP } from './kit/shared'
export type {
  KitStatsMarqueeContent,
  KitServicesContent,
  KitProcessContent,
  KitPricingContent,
  KitPressContent,
  KitFaqContent,
  KitCtaBannerContent,
} from './kit/extra'
export type {
  KitAwardsContent,
  KitBigMarqueeContent,
  KitCompareTableContent,
  KitShowReelContent,
  KitTimelineContent,
  KitToolStackContent,
  KitVisualFeedContent,
  KitWritingContent,
} from './kit/more'
