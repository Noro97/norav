export interface VideoSource {
  webm: string
  mp4: string
}

export type BentoVariant = 'logistics' | 'merch' | 'ecommerce' | 'proof' | 'omnigrid'

export interface BentoProject {
  id: string
  /** The section whose page the tile opens — the case study's anchor in the CMS. */
  targetSectionId: string
  techStack: string[]
  videoSrc?: VideoSource
  imageSrc?: string
  variant: BentoVariant
}

export const BENTO_PROJECTS: BentoProject[] = [
  {
    id: 'nexusroute',
    targetSectionId: 'logistics',
    techStack: ['Google Maps API', 'WebSocket', 'GeoJSON', 'Advanced Markers', 'Zustand'],
    variant: 'logistics',
  },
  {
    id: 'merchforge',
    targetSectionId: 'merch',
    techStack: ['React State', 'JSON Sync', 'Derived Data', 'GSAP'],
    variant: 'merch',
  },
  {
    id: 'filtergraph',
    targetSectionId: 'ecommerce',
    techStack: ['URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo'],
    variant: 'ecommerce',
  },
]

export const OMNIGRID_PROJECT: BentoProject = {
  id: 'omnigrid',
  targetSectionId: 'omnigrid',
  techStack: ['TanStack Query', 'TanStack Table', 'Zod', 'Virtual Scroll'],
  variant: 'omnigrid',
}

export const PROOF_PROJECT: BentoProject = {
  id: 'proof',
  targetSectionId: 'overview',
  techStack: ['React', 'Supabase Edge Functions', 'Google Gemini API', 'TWA SDK'],
  variant: 'proof',
}

export const MICRO_TILES = [
  { index: 0, icon: 'zap' },    // Performance Audit
  { index: 1, icon: 'shield' }, // Type-Safe Architecture
  { index: 2, icon: 'user' },   // User Experience
  { index: 3, icon: 'brain' },     // AI Liveness
  { index: 4, icon: 'database' },  // Cache Hit-Rate
]
