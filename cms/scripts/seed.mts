/**
 * Seeds the home page with the content the site ships today.
 *
 * Idempotent: re-running updates the rows it created instead of duplicating
 * them, so it is safe to run after adding a block to the registry.
 *
 *   npm run seed
 */
import { heroBlock } from '@norav/content-schema'
import { assertExclusiveLocalDb, closeDb, query, queryOne } from '../src/lib/db'

/**
 * The Russian copy lifted from src/i18n/locales/ru/hero.json. It lives here
 * rather than being read from the site so the seed keeps working after the
 * i18n namespace is retired.
 */
const HERO_RU = {
  subtitle: 'Frontend-focused fullstack-инженер',
  name: {
    first: { highlight: 'Нор', rest: 'айр' },
    last: { highlight: 'Ав', rest: 'етисян' },
  },
  tagline: [
    { text: 'Создаю высокопроизводительные интерфейсы на стыке', accent: 'none' },
    { text: 'инженерной точности', accent: 'crimson' },
    { text: 'и', accent: 'none' },
    { text: 'визуального повествования', accent: 'bright' },
    { text: '.', accent: 'none' },
  ],
  scrollHint: 'Прокрутите для навигации',
}

await assertExclusiveLocalDb()

const page = await queryOne<{ id: string }>(
  `insert into pages (slug, status, seo)
   values ('home', 'published', $1)
   on conflict (slug) do update set status = 'published'
   returning id`,
  [
    JSON.stringify({
      en: {
        title: 'Norayr Avetisyan — Frontend-Focused Fullstack Engineer',
        description: 'Building high-performance interfaces at the intersection of engineering precision and visual storytelling.',
      },
      ru: {
        title: 'Норайр Аветисян — Frontend-focused fullstack-инженер',
        description: 'Создаю высокопроизводительные интерфейсы на стыке инженерной точности и визуального повествования.',
      },
    }),
  ],
)
if (!page) throw new Error('Could not upsert the home page.')

const hero = await queryOne<{ id: string }>(
  `select id from blocks where page_id = $1 and type = 'hero' and deleted_at is null`,
  [page.id],
)

const heroId =
  hero?.id ??
  (
    await queryOne<{ id: string }>(
      `insert into blocks (page_id, type, position, anchor_id, settings)
       values ($1, 'hero', 1000, 'hero', $2)
       returning id`,
      [page.id, JSON.stringify(heroBlock.defaults.settings)],
    )
  )?.id

if (!heroId) throw new Error('Could not create the hero block.')

for (const [locale, content] of [
  ['en', heroBlock.defaults.content],
  ['ru', HERO_RU],
] as const) {
  await query(
    `insert into block_translations (block_id, locale, content, status)
     values ($1, $2, $3, 'ready')
     on conflict (block_id, locale) do update set content = excluded.content, status = 'ready'`,
    [heroId, locale, JSON.stringify(content)],
  )
}

await query(
  `insert into settings (key, value) values ('site', $1)
   on conflict (key) do nothing`,
  [JSON.stringify({ cursor: true, grain: true, dynamicGrid: true })],
)

console.log('Seeded: page "home" with the hero block (en, ru).')
await closeDb()
