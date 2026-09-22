import { create } from 'zustand'

/**
 * What the chrome needs to know about the page: how far it has scrolled (the
 * progress bar), which section is under the viewport's centre line (the nav),
 * and whether the viewport is a phone. The scene that once read the mouse and
 * a hero explosion flag is gone, and so are those fields.
 */
interface AppState {
  scrollProgress: number
  activeSection: string
  isMobile: boolean

  setScrollProgress: (v: number) => void
  setActiveSection: (s: string) => void
  setIsMobile: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  activeSection: 'hero',
  isMobile: false,

  setScrollProgress: (v) => set({ scrollProgress: v }),
  setActiveSection: (s) => set({ activeSection: s }),
  setIsMobile: (v) => set({ isMobile: v }),
}))
