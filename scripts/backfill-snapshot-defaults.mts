#!/usr/bin/env -S npx tsx
// =============================================================================
// One-off: re-runs the committed snapshot JSON through the current block
// schemas so newly added, defaulted fields (e.g. `settings.cardEffect`,
// `content.screenshots`) are actually present in the checked-in snapshots —
// the ones the site falls back to whenever CMS_URL isn't set (see
// fetch-content.mjs). Without this, a schema change with a `.default(...)`
// is a TypeScript promise the *committed* JSON doesn't keep, and a component
// that trusts the type (as every block component does) can crash on data
// that predates the field.
//
// Mirrors exactly what `buildPublication()` does server-side per block:
// `validateBlockContent`/`validateBlockSettings`, which fill in Zod defaults
// for anything missing. Never removes or renames a field — only ever adds
// what a fresh publish would already have added.
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateBlockContent, validateBlockSettings } from '@norav/content-schema'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content')
const LOCALES = ['en', 'ru']

for (const locale of LOCALES) {
  const path = join(OUT_DIR, `snapshot.${locale}.json`)
  const snapshot = JSON.parse(readFileSync(path, 'utf-8'))

  for (const page of snapshot.pages) {
    for (const block of page.blocks) {
      const content = validateBlockContent(block.type, block.content)
      if (!content.ok) {
        console.error(`${locale} ${page.slug} ${block.type}: content invalid`, content.issues)
        process.exitCode = 1
        continue
      }
      block.content = content.data

      const settings = validateBlockSettings(block.type, block.settings)
      if (!settings.ok) {
        console.error(`${locale} ${page.slug} ${block.type}: settings invalid`, settings.issues)
        process.exitCode = 1
        continue
      }
      block.settings = settings.data
    }
  }

  writeFileSync(path, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`[backfill] ${locale}: defaults applied.`)
}
