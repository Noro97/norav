// Copies TinyMCE into public/ so the admin serves the editor itself.
//
// Self-hosted under its GPL licence rather than loaded from Tiny's cloud: the
// cloud needs an account and an API key, and makes the one screen for writing
// posts depend on a third party being up. The editor loads its skins, icons
// and plugins by URL at runtime, which is why the whole package is copied
// rather than bundled. Runs after install and before every build, and is
// cheap enough to repeat; the copy is ignored by git.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'node_modules', 'tinymce')
const target = join(root, 'public', 'tinymce')

if (!existsSync(source)) {
  console.warn('[tinymce] not installed yet; skipping the copy')
  process.exit(0)
}

rmSync(target, { recursive: true, force: true })
cpSync(source, target, {
  recursive: true,
  // The editor needs its runtime, not its sources or docs.
  filter: (path) => !/\.(md|d\.ts|json)$/.test(path) || path === source,
})
console.log('[tinymce] copied to public/tinymce')
