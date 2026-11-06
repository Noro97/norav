#!/usr/bin/env node
// =============================================================================
// Bakes the published snapshot into the bundle before `vite build`.
//
// Runs automatically as npm's `prebuild`. Without CMS_URL — or when the CMS is
// unreachable — it keeps the snapshots already committed under src/content and
// exits successfully: a content service being down must never break a deploy.
//
// With --check it writes nothing and instead exits 1 when the published content
// differs from what is committed — the committed copy is the offline fallback
// and the one `npm run dev` and the tests render, so it should not lag by weeks.
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// English only until Russian is retranslated (docs/plan D13).
const LOCALES = ['en']
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content')
const base = process.env.CMS_URL?.replace(/\/$/, '')
const check = process.argv.includes('--check')

if (!base) {
  if (check) {
    console.error('[content] CMS_URL not set — nothing to check against.')
    process.exit(1)
  }
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

  const version = documents[0]?.[1]?.version

  if (check) {
    const stale = documents.filter(([locale, snapshot]) => {
      const committed = readFileSync(join(OUT_DIR, `snapshot.${locale}.json`), 'utf8')
      return committed !== `${JSON.stringify(snapshot, null, 2)}\n`
    })
    if (stale.length === 0) {
      console.log(`[content] committed snapshots match version ${version}.`)
      process.exit(0)
    }
    const committedVersion = JSON.parse(readFileSync(join(OUT_DIR, 'snapshot.en.json'), 'utf8')).version
    console.error(
      `[content] committed snapshots are version ${committedVersion}; ${base} publishes ${version} — run \`npm run content:pull\`.`,
    )
    process.exit(1)
  }

  for (const [locale, snapshot] of documents) {
    writeFileSync(join(OUT_DIR, `snapshot.${locale}.json`), `${JSON.stringify(snapshot, null, 2)}\n`)
  }

  console.log(`[content] baked version ${version} for ${LOCALES.join(', ')}.`)
} catch (error) {
  if (check) {
    console.error(`[content] could not reach ${base} (${error.message}).`)
    process.exit(1)
  }
  console.warn(`[content] could not reach ${base} (${error.message}) — keeping the committed snapshots.`)
}
