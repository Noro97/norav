import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { useWritingPosts } from '@/components/sections/kit/useWritingPosts'
import { defineKitSection } from '@/components/sections/kit/defineKitSection'
import type {
  KitStatsMarqueeContent,
  KitServicesContent,
  KitProcessContent,
  KitPricingContent,
  KitPressContent,
  KitFaqContent,
  KitCtaBannerContent,
  KitAwardsContent,
  KitBigMarqueeContent,
  KitCompareTableContent,
  KitShowReelContent,
  KitTimelineContent,
  KitToolStackContent,
  KitVisualFeedContent,
  KitWritingContent,
} from '@norav/content-schema'

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
  /**
   * Which row on the page this is. A section that may appear more than once
   * passes it to `useBlock` so it reads its own settings instead of the first
   * block of its type; the ones that appear once can ignore it.
   */
  blockId?: string
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

 // A full case study, with or without a demo above it. Repeatable: the one type
 // is placed once per study, so it reads its own row.
 case_study: named(() => import('@/components/sections/CaseStudy'), 'CaseStudy'),
 workflow: named(
    () => import('@/components/sections/WorkflowAutomation/WorkflowAutomation'),
    'WorkflowAutomation',
  ),
  contact_cta: named(() => import('@/components/sections/ContactCTA'), 'ContactCTA'),
  recruiter_cta: named(() => import('@/components/sections/RecruiterCTA'), 'RecruiterCTA'),
  terminal_footer: named(() => import('@/components/sections/TerminalFooter'), 'TerminalFooter'),
  site_footer: named(() => import('@/components/sections/SiteFooter'), 'SiteFooter'),

 // Assembled from the shared effects rather than built around a widget of
 // their own, and usable on any page as many times as it needs them.
 gallery: named(() => import('@/components/sections/GallerySection'), 'GallerySection'),
  cta_banner: named(() => import('@/components/sections/CtaBanner'), 'CtaBanner'),
 testimonials: named(() => import('@/components/sections/Testimonials'), 'Testimonials'),
 metrics: named(() => import('@/components/sections/MetricsSection'), 'MetricsSection'),

 // Any one of the 53 sections imported from the portfolio project, picked in
 // the CMS. One type, because the choice is a setting rather than a schema.
  portfolio_section: named(() => import('@/components/sections/PortfolioSection'), 'PortfolioSection'),

 // The promoted kit sections: same components, now reading their copy from the
 // CMS. `defineKitSection` supplies the wrapper, the stylesheet and the accent
 // every one of them needs, so a section is one line here.
  kit_stats_marquee: defineKitSection<KitStatsMarqueeContent>('kit_stats_marquee', () => import('@/components/portfolio-kit/sections/extra-sections/stats-marquee'), 'StatsMarquee'),
  kit_services: defineKitSection<KitServicesContent>('kit_services', () => import('@/components/portfolio-kit/sections/extra-sections/services'), 'Services'),
  kit_process: defineKitSection<KitProcessContent>('kit_process', () => import('@/components/portfolio-kit/sections/extra-sections/process'), 'Process'),
  kit_pricing: defineKitSection<KitPricingContent>('kit_pricing', () => import('@/components/portfolio-kit/sections/extra-sections/pricing'), 'Pricing'),
  kit_press: defineKitSection<KitPressContent>('kit_press', () => import('@/components/portfolio-kit/sections/extra-sections/press'), 'Press'),
  kit_faq: defineKitSection<KitFaqContent>('kit_faq', () => import('@/components/portfolio-kit/sections/extra-sections/faq'), 'FAQ'),
  kit_cta_banner: defineKitSection<KitCtaBannerContent>('kit_cta_banner', () => import('@/components/portfolio-kit/sections/extra-sections/cta-banner'), 'CTABanner'),
  kit_awards: defineKitSection<KitAwardsContent>('kit_awards', () => import('@/components/portfolio-kit/sections/more-sections/awards'), 'Awards'),
  kit_big_marquee: defineKitSection<KitBigMarqueeContent>('kit_big_marquee', () => import('@/components/portfolio-kit/sections/more-sections/big-marquee'), 'BigMarquee'),
  kit_compare_table: defineKitSection<KitCompareTableContent>('kit_compare_table', () => import('@/components/portfolio-kit/sections/more-sections/compare-table'), 'CompareTable'),
  kit_show_reel: defineKitSection<KitShowReelContent>('kit_show_reel', () => import('@/components/portfolio-kit/sections/more-sections/show-reel'), 'ShowReel'),
  kit_timeline: defineKitSection<KitTimelineContent>('kit_timeline', () => import('@/components/portfolio-kit/sections/more-sections/timeline'), 'Timeline'),
  kit_tool_stack: defineKitSection<KitToolStackContent>('kit_tool_stack', () => import('@/components/portfolio-kit/sections/more-sections/tool-stack'), 'ToolStack'),
  kit_visual_feed: defineKitSection<KitVisualFeedContent>('kit_visual_feed', () => import('@/components/portfolio-kit/sections/more-sections/visual-feed'), 'VisualFeed'),
  // Its cards come from published posts once there are any.
  kit_writing: defineKitSection<KitWritingContent>('kit_writing', () => import('@/components/portfolio-kit/sections/more-sections/writing'), 'Writing', useWritingPosts),
}
