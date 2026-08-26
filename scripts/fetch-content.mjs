#!/usr/bin/env node
// =============================================================================
// Bakes the published snapshot into the bundle before `vite build`.
//
// Runs automatically as npm's `prebuild`. Without CMS_URL — or when the CMS is
// unreachable — it keeps the snapshots already committed under src/content and
// exits successfully: a content service being down must never break a deploy.
// =============================================================================
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCALES = ['en', 'ru']
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content')
const base = process.env.CMS_URL?.replace(/\/$/, '')

if (!base) {
  console.log('[content] CMS_URL not set — building with the committed snapshots.')
  process.exit(0)
}

try {
  const documents = await Promise.all(
    LOCALES.map(async (locale) => {
      const response = await fetch(`${base}/api/public/content?locale=${locale}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) throw new Error(`${locale}: HTTP ${response.status}`)
      const snapshot = await response.json()
      if (!Array.isArray(snapshot?.pages)) throw new Error(`${locale}: unexpected payload`)
      return [locale, snapshot]
    }),
  )

  for (const [locale, snapshot] of documents) {
    writeFileSync(join(OUT_DIR, `snapshot.${locale}.json`), `${JSON.stringify(snapshot, null, 2)}\n`)
  }

  const version = documents[0]?.[1]?.version
  console.log(`[content] baked version ${version} for ${LOCALES.join(', ')}.`)
} catch (error) {
  console.warn(`[content] could not reach ${base} (${error.message}) — keeping the committed snapshots.`)
}
