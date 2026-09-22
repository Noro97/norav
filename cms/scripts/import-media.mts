// =============================================================================
// Moves the site's static files into the media library.
//
// It has already run: every image lived in `public/` and changing one meant a
// deploy, and now only the hero's logo does. Kept for the next batch of files
// that arrive that way, and because it documents how the first ones got in.
//
// It uploads through the same storage driver the admin uses, records a media
// row for each, and rewrites every reference in the content to the URL the
// store handed back — so what the site renders is what the library holds.
//
// Idempotent: a file already imported (matched by its original path in the alt
// text) is left alone, so re-running after adding assets does not duplicate.
// =============================================================================
import { randomUUID } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { assertExclusiveLocalDb, assertIntendedDatabase, closeDb, query, queryOne } from '../src/lib/db'
import { getStorage } from '../src/lib/storage'
import { repointReferences } from '../src/lib/content-references'

const PUBLIC_DIR = join(process.cwd(), '..', 'public')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

/** Everything the site can reasonably be asked to serve from the library. */
async function collect(dir: string, out: string[] = []): Promise<string[]> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      // static/ holds the stylesheet the document links; fonts/ holds a three.js
      // typeface. Neither is content, and neither belongs in a media library.
      if (entry.name === 'static' || entry.name === 'fonts') continue
      await collect(full, out)
    } else if (MIME[extname(entry.name).toLowerCase()]) {
      out.push(full)
    }
  }
  return out
}

async function main() {
  const toProduction = assertIntendedDatabase('import:media')

  // Local runs get local storage too. Guarding only the database left a gap I
  // walked straight into: the embedded database recorded rows while the files
  // went to the production blob store, because the token was still in .env.
  if (!toProduction) delete process.env.BLOB_READ_WRITE_TOKEN

  const storage = getStorage()

  // The failure this prevents: rows written to the shared database pointing at
  // bytes that only exist on the machine that ran the import. I did exactly
  // that once, and the only sign was an image that loaded for nobody else.
  if (toProduction && storage.kind !== 'blob') {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set, so files would be written to this\n' +
        'machine while the database recorded them as live. Connect a Blob store\n' +
        'to norav-cms and put its token in cms/.env before importing.',
    )
  }

  if (!toProduction) await assertExclusiveLocalDb()

  console.log(`[media] database: ${usingPostgres ? 'postgres' : 'embedded'}, storage: ${storage.kind}`)

  const files = (await collect(PUBLIC_DIR)).sort()
  let imported = 0
  let skipped = 0
  let rewritten = 0

  for (const file of files) {
    const publicPath = '/' + relative(PUBLIC_DIR, file).split('\\').join('/')
    const mime = MIME[extname(file).toLowerCase()]!

    const existing = await queryOne<{ url: string }>(
      `select url from media where alt->>'source' = $1 and deleted_at is null`,
      [publicPath],
    )
    if (existing) {
      console.log(`  = ${publicPath} (already imported)`)
      skipped++
      continue
    }

    const bytes = await readFile(file)
    const key = `${randomUUID()}${extname(file).toLowerCase()}`
    const stored = await storage.put(key, bytes, mime)

    await query(
      `insert into media (storage_key, url, mime, size_bytes, alt)
       values ($1, $2, $3, $4, $5)`,
      [
        stored.key,
        stored.url,
        mime,
        bytes.byteLength,
        // The original path is kept so a re-run recognises this file, and so a
        // human reading the row can tell where it came from.
        JSON.stringify({ en: describe(publicPath), source: publicPath }),
      ],
    )
    imported++

    rewritten += await repointReferences(publicPath, stored.url)

    console.log(`  + ${publicPath}  →  ${stored.url}`)
  }

  console.log(
    `\n[media] imported ${imported}, already there ${skipped}, content rows repointed ${rewritten}.`,
  )
  if (imported) console.log('[media] Publish in the CMS to put the new URLs on the site.')
}

/** A readable default alt: the file name, without extension or dashes. */
function describe(publicPath: string): string {
  const name = publicPath.split('/').pop() ?? publicPath
  return name.replace(extname(name), '').replace(/[-_]+/g, ' ')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(closeDb)
