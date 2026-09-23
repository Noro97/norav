import { create } from 'zustand'

/**
 * What the chrome needs to know about the page: how far it has scrolled (the
 * progress bar) and whether the viewport is a phone. Which menu item is lit
 * is not here: it follows the address, not the scroll position. The scene that once read the mouse and
 * a hero explosion flag is gone, and so are those fields.
 */
interface AppState {
  scrollProgress: number
  isMobile: boolean

  setScrollProgress: (v: number) => void
  setIsMobile: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  isMobile: false,

  setScrollProgress: (v) => set({ scrollProgress: v }),
  setIsMobile: (v) => set({ isMobile: v }),
}))
