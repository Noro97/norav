import type { Locale, Snapshot } from '@norav/content-schema'
import { BAKED_SNAPSHOTS, findBlock } from './index'

/**
 * The published content, reachable from outside React.
 *
 * Almost everything reads content through `useBlock`. The terminal cannot: its
 * commands are plain functions in `terminal-commands.ts`, invoked from an event
 * handler, with no component to hang a hook on. This module keeps the current
 * snapshot in a module variable that ContentProvider updates whenever it swaps
 * one in, so the terminal sees the same content as the rest of the page —
 * including a version published after this bundle was built.
 */
let current: Record<Locale, Snapshot> = BAKED_SNAPSHOTS

export function setCurrentSnapshots(next: Record<Locale, Snapshot>): void {
  current = next
}

export function currentBlockContent<T>(type: string, language: string): T | undefined {
  const locale: Locale = language.startsWith('ru') ? 'ru' : 'en'
  const block = findBlock(current[locale], type)
  return block?.content as T | undefined
}
