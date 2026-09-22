// =============================================================================
// Fills in the image fields the block registry just gained.
//
// The thirteen illustrations that used to be hardcoded in components are now
// content, addressed by the same stable keys as the words beside them. They are
// already in the media library — this points each field at the right one, by
// the original path kept in the library entry's alt text.
//
// Idempotent: a field that already holds a URL is left alone.
// =============================================================================
import { assertIntendedDatabase, closeDb, query, queryOne } from '../src/lib/db'

/** Which original file belongs to which key, taken from the code it replaces. */
const BENTO_PROJECTS: Record<string, string> = {
  nexusroute: '/assets/img/bento-nexusroute.png',
  merchforge: '/assets/img/bento-merchforge.png',
  filtergraph: '/assets/img/bento-filtergraph.png',
  omnigrid: '/assets/img/bento-omnigrid.png',
}
const BENTO_TILES: Record<number, string> = {
  0: '/assets/img/bento-perf-audit.png',
  1: '/assets/img/bento-typesafe.png',
  2: '/assets/img/bento-ux.png',
}
const BENTO_ILLUSTRATIONS: Record<string, string> = {
  omnigrid: '/assets/img/bento-omnigrid.png',
  gamification: '/assets/img/bento-gamification.png',
}
const BADGES: Record<string, string> = {
  common: '/assets/icons/badge-common.svg',
  rare: '/assets/icons/badge-rare.svg',
  epic: '/assets/icons/badge-epic.svg',
  legendary: '/assets/icons/badge-legendary.svg',
}
const MAP_FALLBACK = '/assets/img/world-map.webp'

async function urlFor(source: string): Promise<string> {
  const row = await queryOne<{ url: string }>(
    `select url from media where alt->>'source' = $1 and deleted_at is null`,
    [source],
  )
  if (!row) throw new Error(`${source} is not in the media library — run import:media first.`)
  return row.url
}

interface Row {
  block_id: string
  locale: string
  content: Record<string, unknown>
}

async function main() {
  const toProduction = assertIntendedDatabase('link:images')

  let filled = 0
  const already: string[] = []

  // The bento grid: every illustration in one block, across both locales.
  const bento = await query<Row>(
    `select bt.block_id, bt.locale, bt.content
       from block_translations bt
       join blocks b on b.id = bt.block_id
      where b.type = 'bento_grid' and b.deleted_at is null`,
  )

  for (const row of bento) {
    const content = row.content as {
      projects?: { project: string; image?: string }[]
      tiles?: { slot: number; image?: string }[]
      illustrations?: Record<string, string>
      badges?: { rarity: string; image?: string }[]
    }

    for (const project of content.projects ?? []) {
      const source = BENTO_PROJECTS[project.project]
      if (!source) continue
      if (project.image) { already.push(`project ${project.project}`); continue }
      project.image = await urlFor(source)
      filled++
    }

    for (const tile of content.tiles ?? []) {
      const source = BENTO_TILES[tile.slot]
      if (!source) continue
      if (tile.image) { already.push(`tile ${tile.slot}`); continue }
      tile.image = await urlFor(source)
      filled++
    }

    content.illustrations ??= { omnigrid: '', gamification: '' }
    for (const [key, source] of Object.entries(BENTO_ILLUSTRATIONS)) {
      if (content.illustrations[key]) { already.push(`illustration ${key}`); continue }
      content.illustrations[key] = await urlFor(source)
      filled++
    }

    // The four tiers are always written in order, so the grid keeps its shape
    // even if a locale was saved before this field existed.
    content.badges ??= []
    for (const [rarity, source] of Object.entries(BADGES)) {
      const existing = content.badges.find((badge) => badge.rarity === rarity)
      if (existing?.image) { already.push(`badge ${rarity}`); continue }
      const image = await urlFor(source)
      if (existing) existing.image = image
      else content.badges.push({ rarity, image })
      filled++
    }

    await query(`update block_translations set content = $1 where block_id = $2 and locale = $3`, [
      JSON.stringify(content),
      row.block_id,
      row.locale,
    ])
  }

  // The logistics map's fallback.
  const logistics = await query<Row>(
    `select bt.block_id, bt.locale, bt.content
       from block_translations bt
       join blocks b on b.id = bt.block_id
      where b.type = 'logistics' and b.deleted_at is null`,
  )
  for (const row of logistics) {
    const content = row.content as { mapFallback?: string }
    if (content.mapFallback) { already.push('map fallback'); continue }
    content.mapFallback = await urlFor(MAP_FALLBACK)
    filled++
    await query(`update block_translations set content = $1 where block_id = $2 and locale = $3`, [
      JSON.stringify(content),
      row.block_id,
      row.locale,
    ])
  }

  console.log(`[images] filled ${filled}, already set ${already.length}`)
  if (filled) console.log('[images] Publish in the CMS to put them on the site.')
}

main()
  .catch((error) => {
    console.error(String(error instanceof Error ? error.message : error))
    process.exitCode = 1
  })
  .finally(closeDb)
