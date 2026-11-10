import { create } from 'zustand'

/** The terminal's element, named by the footer button's aria-controls. */
export const TERMINAL_ID = 'terminal'

/**
 * What the chrome needs to know about the page: how far it has scrolled (the
 * progress bar), and whether the reader opened the terminal from the footer.
 * Which menu item is lit is not here: it follows the address, not the scroll
 * position.
 */
interface AppState {
  scrollProgress: number
  /** The terminal is an easter egg: closed until the footer's button opens it. */
  terminalOpen: boolean

  setScrollProgress: (v: number) => void
  setTerminalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  terminalOpen: false,

  setScrollProgress: (v) => set({ scrollProgress: v }),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
}))
