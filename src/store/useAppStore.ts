import { create } from 'zustand'

interface MousePosition {
  x: number
  y: number
}

interface AppState {
  scrollProgress: number
  mousePosition: MousePosition
  activeSection: string
  isMobile: boolean
  particlesCollapsed: boolean
  particleBurst: boolean

  setScrollProgress: (v: number) => void
  setMousePosition: (pos: MousePosition) => void
  setActiveSection: (s: string) => void
  setIsMobile: (v: boolean) => void
  setParticlesCollapsed: (v: boolean) => void
  triggerParticleBurst: () => void
}

let burstTimer: ReturnType<typeof setTimeout> | null = null

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  mousePosition: { x: 0, y: 0 },
  activeSection: 'hero',
  isMobile: false,
  particlesCollapsed: false,
  particleBurst: false,

  setScrollProgress: (v) => set({ scrollProgress: v }),
  setMousePosition: (pos) => set({ mousePosition: pos }),
  setActiveSection: (s) => set({ activeSection: s }),
  setIsMobile: (v) => set({ isMobile: v }),
  setParticlesCollapsed: (v) => set({ particlesCollapsed: v }),
  triggerParticleBurst: () => {
    if (burstTimer) clearTimeout(burstTimer)
    set({ particleBurst: true })
    burstTimer = setTimeout(() => {
      set({ particleBurst: false })
      burstTimer = null
    }, 1500)
  },
}))
