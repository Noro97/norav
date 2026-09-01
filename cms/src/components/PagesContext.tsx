'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { PageSummary } from './ViewSwitcher'

interface Pages {
  pages: PageSummary[]
  /** Re-reads the list after one is created, renamed or deleted. */
  reload: () => Promise<void>
}

const Context = createContext<Pages>({ pages: [], reload: async () => {} })

/**
 * The page list, available to every view.
 *
 * The switcher that lists the pages is rendered by four different editors, and
 * a list threaded through all four as a prop would be four signatures changed
 * every time it grows. It belongs to the workspace, not to any one editor.
 */
export function PagesProvider({ value, children }: { value: Pages; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function usePages(): Pages {
  return useContext(Context)
}
