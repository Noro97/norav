import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { profileOf } from './src/lib/profile'
import { renderShell } from './src/lib/shell-metadata'

/**
 * Fills index.html from the profile in the snapshot `prebuild` just baked.
 *
 * Read on every transform rather than imported, so it can't hold a copy older than
 * the file `scripts/fetch-content.mjs` wrote. It runs before Vite's own `%VAR%` step.
 */
export function profilePlugin(): Plugin {
  return {
    name: 'profile-shell',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const path = join(process.cwd(), 'src', 'content', 'snapshot.en.json')
        const snapshot = JSON.parse(readFileSync(path, 'utf8')) as { settings: Record<string, unknown> }
        return renderShell(html, profileOf(snapshot.settings))
      },
    },
  }
}
