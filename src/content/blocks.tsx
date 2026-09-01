import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'

/**
 * Which component renders which block type.
 *
 * Deliberately separate from the CMS registry: that one describes the *content*
 * of a block and is shared with the admin, while this one is the site's own
 * rendering concern. A type the site does not know is skipped rather than
 * crashing the page, which is what lets the CMS ship a new block type before
 * the site that renders it.
 */
export interface BlockComponentProps {
  anchorId?: string | null
}

type BlockComponent = ComponentType<BlockComponentProps> | LazyExoticComponent<ComponentType<BlockComponentProps>>

const named = <T extends string>(loader: () => Promise<Record<T, ComponentType<BlockComponentProps>>>, name: T) =>
  lazy(() => loader().then((module) => ({ default: module[name] })))

export const BLOCK_COMPONENTS: Record<string, BlockComponent> = {
  // The hero is the LCP element: it stays in the entry chunk.
  hero: HeroSection,

  about: named(() => import('@/components/sections/AboutHero'), 'AboutHero'),
  impact_strip: named(() => import('@/components/sections/ImpactStrip'), 'ImpactStrip'),
  capabilities: named(() => import('@/components/sections/Capabilities'), 'Capabilities'),
  experience: named(() => import('@/components/sections/ExperienceTimeline'), 'ExperienceTimeline'),
  skills: named(() => import('@/components/sections/SkillsMatrix'), 'SkillsMatrix'),
  tech_marquee: named(() => import('@/components/sections/TechMarquee'), 'TechMarquee'),
  bento_grid: named(() => import('@/components/sections/BentoGrid/BentoGrid'), 'BentoGrid'),
  vibecoding: named(() => import('@/components/sections/VibeCoding/VibeCoding'), 'VibeCoding'),
  projects_intro: named(() => import('@/components/sections/ProjectsIntro'), 'ProjectsIntro'),
  logistics: named(() => import('@/components/sections/LogisticsWidget'), 'LogisticsWidget'),
  merch: named(() => import('@/components/sections/AIMerchWidget'), 'AIMerchWidget'),
  ecommerce: named(() => import('@/components/sections/EcommerceWidget'), 'EcommerceWidget'),
  omnigrid: named(() => import('@/components/sections/OmniGrid/OmniGridWidget'), 'OmniGridWidget'),
  proof: named(() => import('@/components/sections/ProofWidget'), 'ProofWidget'),

  // The reasoning under each demo. One component, five types — a type names
  // exactly one block, so each study needs its own.
  logistics_detail: named(() => import('@/components/sections/CaseStudyDetail'), 'LogisticsDetail'),
  merch_detail: named(() => import('@/components/sections/CaseStudyDetail'), 'MerchDetail'),
  ecommerce_detail: named(() => import('@/components/sections/CaseStudyDetail'), 'EcommerceDetail'),
  omnigrid_detail: named(() => import('@/components/sections/CaseStudyDetail'), 'OmniGridDetail'),
  proof_detail: named(() => import('@/components/sections/CaseStudyDetail'), 'ProofDetail'),
  workflow: named(
    () => import('@/components/sections/WorkflowAutomation/WorkflowAutomation'),
    'WorkflowAutomation',
  ),
  contact_cta: named(() => import('@/components/sections/ContactCTA'), 'ContactCTA'),
  terminal_footer: named(() => import('@/components/sections/TerminalFooter'), 'TerminalFooter'),
}
