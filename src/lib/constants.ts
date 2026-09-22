import type { SectionConfig } from '@/types'

export const SECTIONS: SectionConfig[] = [
  { id: 'hero', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'overview', labelKey: 'nav.overview' },
  { id: 'logistics', labelKey: 'nav.projects' },
  { id: 'workflows', labelKey: 'nav.workflows' },
  { id: 'terminal', labelKey: 'nav.contact' },
]

// Magnetic buttons
export const MAGNETIC_RADIUS = 50
export const MAGNETIC_STRENGTH = 0.3

// Tilt/glare cards
export const TILT_MAX_DEG = 16
export const TILT_GLARE_OPACITY = 0.15
