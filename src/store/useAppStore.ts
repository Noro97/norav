import { create } from 'zustand'

/**
 * What the chrome needs to know about the page: how far it has scrolled (the
 * progress bar). Which menu item is lit
 * is not here: it follows the address, not the scroll position. The scene that once read the mouse and
 * a hero explosion flag is gone, and so are those fields.
 */
interface AppState {
  scrollProgress: number

  setScrollProgress: (v: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,

  setScrollProgress: (v) => set({ scrollProgress: v }),
}))
