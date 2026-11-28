import { create } from 'zustand'

/** The terminal's element, named by the footer button's aria-controls. */
export const TERMINAL_ID = 'terminal'

/**
 * What the chrome needs to know about the page: whether the reader opened the
 * terminal from the footer. Which menu item is lit is not here: it follows the
 * address. How far the page has scrolled isn't either: the progress bar reads
 * the scroll position itself, so scrolling renders nothing.
 */
interface AppState {
  /** The terminal is an easter egg: closed until the footer's button opens it. */
  terminalOpen: boolean

  setTerminalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  terminalOpen: false,

  setTerminalOpen: (open) => set({ terminalOpen: open }),
}))
