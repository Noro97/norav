import type { SectionConfig } from '@/types'

export const SECTIONS: SectionConfig[] = [
  { id: 'hero', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'overview', labelKey: 'nav.overview' },
  { id: 'logistics', labelKey: 'nav.projects' },
  { id: 'education', labelKey: 'nav.education' },
  { id: 'terminal', labelKey: 'nav.contact' },
]

export const COLORS = {
  background: '#0a0a1a',
  foreground: '#e0e0e0',
  muted: '#888888',
  crimson: '#B51A2B',
  crimsonLight: '#d63040',
  crimsonDark: '#8c1523',
  card: '#0d0d1f',
  border: 'rgba(255, 255, 255, 0.08)',
} as const

export const PARTICLE_COUNT_DESKTOP = 1000
export const PARTICLE_COUNT_TABLET = 500
export const PARTICLE_COUNT_MOBILE = 300
