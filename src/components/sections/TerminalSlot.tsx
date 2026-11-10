import { lazy, Suspense } from 'react'
import { TERMINAL_ID, useAppStore } from '@/store/useAppStore'
import type { BlockComponentProps } from '@/content/blocks'

const TerminalFooter = lazy(() => import('./TerminalFooter').then((module) => ({ default: module.TerminalFooter })))

/**
 * Where the terminal opens, under the footer. Empty, and its code not fetched,
 * until the footer's button asks for it: it's an easter egg, and nobody who
 * doesn't open it should pay for it.
 */
export function TerminalSlot({ blockId }: BlockComponentProps) {
  const open = useAppStore((state) => state.terminalOpen)
  return (
    <div id={TERMINAL_ID}>
      {open && (
        <Suspense fallback={null}>
          <TerminalFooter blockId={blockId} />
        </Suspense>
      )}
    </div>
  )
}
