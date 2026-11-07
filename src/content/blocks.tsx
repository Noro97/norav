import { lazy, Suspense, useSyncExternalStore, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { useWritingPosts } from '@/components/sections/kit/useWritingPosts'
import { defineKitSection } from '@/components/sections/kit/defineKitSection'
import { WidgetPlaceholder } from '@/components/sections/WidgetPlaceholder'
import { SectionLoader } from './SectionLoader'
import type {
  KitProcessContent,
  KitFaqContent,
  KitCtaBannerContent,
  KitCompareTableContent,
  KitToolStackContent,
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

/**
 * A section built on framer-motion. The library arrives with the section rather
 * than with the site, and so does the switch that makes it answer to reduced motion:
 * under `user`, Framer keeps the opacity and drops the transforms.
 */
const animated = <T extends string>(loader: () => Promise<Record<T, ComponentType<BlockComponentProps>>>, name: T) =>
  lazy(async () => {
    const [{ MotionConfig }, module] = await Promise.all([import('framer-motion'), loader()])
    const Section = module[name] as ComponentType<BlockComponentProps>
    return {
      default: (props: BlockComponentProps) => (
        <MotionConfig reducedMotion="user">
          <Section {...props} />
        </MotionConfig>
      ),
    }
  })

const neverChanges = () => () => {}

/**
 * A section that only exists in a browser: a live demo needs the DOM, a clock and
 * random numbers, so it has no HTML that would match on hydration. The prerendered
 * page and the first render in the browser both show the placeholder, and the
 * section mounts straight after.
 */
const inBrowserOnly = (Section: BlockComponent, placeholder: ReactNode): BlockComponent =>
  function InBrowserOnly(props: BlockComponentProps) {
    const inBrowser = useSyncExternalStore(
      neverChanges,
      () => true,
      () => false,
    )
    return inBrowser ? (
      <Suspense fallback={placeholder}>
        <Section {...props} />
      </Suspense>
    ) : (
      placeholder
    )
  }

export const BLOCK_COMPONENTS: Record<string, BlockComponent> = {
 // The hero is the LCP element: it stays in the entry chunk.
 hero: HeroSection,

 about: named(() => import('@/components/sections/AboutHero'), 'AboutHero'),
  impact_strip: named(() => import('@/components/sections/ImpactStrip'), 'ImpactStrip'),
 capabilities: named(() => import('@/components/sections/Capabilities'), 'Capabilities'),
 experience: named(() => import('@/components/sections/ExperienceTimeline'), 'ExperienceTimeline'),
  tech_marquee: named(() => import('@/components/sections/TechMarquee'), 'TechMarquee'),
  bento_grid: inBrowserOnly(animated(() => import('@/components/sections/BentoGrid/BentoGrid'), 'BentoGrid'), <SectionLoader tall />),
  projects_intro: named(() => import('@/components/sections/ProjectsIntro'), 'ProjectsIntro'),
 logistics: inBrowserOnly(named(() => import('@/components/sections/LogisticsWidget'), 'LogisticsWidget'), <WidgetPlaceholder type="logistics" />),
 merch: inBrowserOnly(named(() => import('@/components/sections/AIMerchWidget'), 'AIMerchWidget'), <WidgetPlaceholder type="merch" />),
 ecommerce: inBrowserOnly(animated(() => import('@/components/sections/EcommerceWidget'), 'EcommerceWidget'), <WidgetPlaceholder type="ecommerce" />),
 omnigrid: inBrowserOnly(animated(() => import('@/components/sections/OmniGrid/OmniGridWidget'), 'OmniGridWidget'), <WidgetPlaceholder type="omnigrid" />),
 proof: inBrowserOnly(named(() => import('@/components/sections/ProofWidget'), 'ProofWidget'), <WidgetPlaceholder type="proof" />),

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
  contact_cta: named(() => import('@/components/sections/ContactCTA'), 'ContactCTA'),
  terminal_footer: inBrowserOnly(named(() => import('@/components/sections/TerminalFooter'), 'TerminalFooter'), <SectionLoader />),
  site_footer: named(() => import('@/components/sections/SiteFooter'), 'SiteFooter'),

 // Usable on any page, as many times as it needs them.
 testimonials: named(() => import('@/components/sections/Testimonials'), 'Testimonials'),

 // The six kit sections that stayed, reading their copy from the CMS. `defineKitSection` supplies the wrapper, the stylesheet and the accent
 // every one of them needs, so a section is one line here.
  kit_process: defineKitSection<KitProcessContent>('kit_process', () => import('@/components/portfolio-kit/sections/extra-sections/process'), 'Process'),
  kit_faq: defineKitSection<KitFaqContent>('kit_faq', () => import('@/components/portfolio-kit/sections/extra-sections/faq'), 'FAQ'),
  kit_cta_banner: defineKitSection<KitCtaBannerContent>('kit_cta_banner', () => import('@/components/portfolio-kit/sections/extra-sections/cta-banner'), 'CTABanner'),
  kit_compare_table: defineKitSection<KitCompareTableContent>('kit_compare_table', () => import('@/components/portfolio-kit/sections/more-sections/compare-table'), 'CompareTable'),
  kit_tool_stack: defineKitSection<KitToolStackContent>('kit_tool_stack', () => import('@/components/portfolio-kit/sections/more-sections/tool-stack'), 'ToolStack'),
  // Its cards come from published posts once there are any.
  kit_writing: defineKitSection<KitWritingContent>('kit_writing', () => import('@/components/portfolio-kit/sections/more-sections/writing'), 'Writing', useWritingPosts),
}
