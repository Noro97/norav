import type { SectionConfig } from '@/types'

export const SECTIONS: SectionConfig[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'logistics', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'terminal', label: 'Contact' },
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
