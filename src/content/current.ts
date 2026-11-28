import type { Locale, Snapshot } from '@norav/content-schema'
import { findBlock } from './index'

/**
 * The published content, reachable from outside React.
 *
 * Almost everything reads content through `useBlock`. The terminal cannot: its
 * commands are plain functions in `terminal-commands.ts`, invoked from an event
 * handler, with no component to hang a hook on. This module keeps the current
 * snapshot in a module variable. Each entry sets it to the baked snapshot before the
 * first render, and ContentProvider updates it whenever it swaps one in, so the
 * terminal sees the same content as the rest of the page — including a version
 * published after this bundle was built.
 */
let current: Record<Locale, Snapshot> | undefined

export function setCurrentSnapshots(next: Record<Locale, Snapshot>): void {
  current = next
}

function snapshots(): Record<Locale, Snapshot> {
  if (!current) throw new Error('No content yet: set it with setCurrentSnapshots before the first render.')
  return current
}

/** Site-wide settings, which are the same in every language. */
export function currentSettings(): Snapshot['settings'] {
  return snapshots().en.settings
}

export function currentBlockContent<T>(type: string, language: string): T | undefined {
  const locale: Locale = language.startsWith('ru') ? 'ru' : 'en'
  const block = findBlock(snapshots()[locale], type)
  return block?.content as T | undefined
}
