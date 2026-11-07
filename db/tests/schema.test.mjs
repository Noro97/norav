// =============================================================================
// norav CMS · schema test harness
//
// Applies every migration to an ephemeral PostgreSQL (PGlite — real Postgres
// compiled to WASM), then asserts the invariants the API relies on. No Docker,
// no local cluster, no cleanup.
//
//   cd db && npm install && npm test
// =============================================================================
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const db = new PGlite()

let pass = 0
let fail = 0
const results = []

function check(name, ok, detail = '') {
  if (ok) {
    pass++
    results.push(['PASS', name, ''])
  } else {
    fail++
    results.push(['FAIL', name, detail])
  }
}

async function expectError(name, fn, matcher) {
  try {
    await fn()
    check(name, false, 'expected an error, statement succeeded')
  } catch (e) {
    const message = e.message || String(e)
    check(name, matcher ? matcher.test(message) : true, matcher ? `message was: ${message}` : '')
  }
}

// ---------------------------------------------------------------------------
// 1. Migrations apply cleanly, in order
// ---------------------------------------------------------------------------
const files = readdirSync(join(root, 'migrations')).filter((f) => f.endsWith('.sql')).sort()
for (const file of files) {
  try {
    await db.exec(readFileSync(join(root, 'migrations', file), 'utf8'))
    check(`migration ${file}`, true)
  } catch (e) {
    check(`migration ${file}`, false, e.message)
    console.error(`\n  ${file} failed:\n  ${e.message}\n`)
    break
  }
}

// ---------------------------------------------------------------------------
// 2. Fixtures
// ---------------------------------------------------------------------------
const {
  rows: [owner],
} = await db.query(
  `insert into admin_users (email, password_hash, role) values ('Owner@Norav.dev', 'x', 'owner') returning id`,
)
const {
  rows: [page],
} = await db.query(`insert into pages (slug, status) values ('home', 'published') returning id`)
const {
  rows: [hero],
} = await db.query(
  `insert into blocks (page_id, type, position, anchor_id) values ($1, 'hero', 1000, 'hero') returning id, version, updated_at`,
  [page.id],
)
await db.query(
  `insert into block_translations (block_id, locale, content) values ($1, 'en', '{"subtitle":"Engineer"}'::jsonb)`,
  [hero.id],
)

// ---------------------------------------------------------------------------
// 3. Identity
// ---------------------------------------------------------------------------
await expectError(
  'admin_users.email is unique case-insensitively',
  () => db.query(`insert into admin_users (email, password_hash) values ('owner@norav.dev', 'y')`),
  /admin_users_email_key|duplicate key/i,
)

await expectError(
  'admin_users.role is constrained',
  () => db.query(`insert into admin_users (email, password_hash, role) values ('a@b.c', 'y', 'root')`),
  /check constraint/i,
)

{
  const { rows } = await db.query(
    `insert into sessions (user_id, token_hash, expires_at) values ($1, 'sha256:abc', now() + interval '30 days') returning id`,
    [owner.id],
  )
  check('sessions insert', rows.length === 1)
  await expectError(
    'sessions.token_hash is unique',
    () =>
      db.query(
        `insert into sessions (user_id, token_hash, expires_at) values ($1, 'sha256:abc', now())`,
        [owner.id],
      ),
    /duplicate key/i,
  )
}

// ---------------------------------------------------------------------------
// 4. Blocks: ordering, anchors, optimistic lock, cascade
// ---------------------------------------------------------------------------
await db.query(
  `insert into blocks (page_id, type, position, anchor_id) values ($1, 'about', 2000, 'about'), ($1, 'skills', 3000, 'skills')`,
  [page.id],
)

// A fractional index means "insert between" writes one row, not the whole page.
await db.query(
  `insert into blocks (page_id, type, position, anchor_id) values ($1, 'capabilities', 1500, 'capabilities')`,
  [page.id],
)
{
  const { rows } = await db.query(
    `select type from blocks where page_id = $1 and deleted_at is null order by position`,
    [page.id],
  )
  check(
    'fractional position keeps order without renumbering',
    rows.map((r) => r.type).join(',') === 'hero,capabilities,about,skills',
    rows.map((r) => r.type).join(','),
  )
}

await expectError(
  'anchor_id is unique per page',
  () => db.query(`insert into blocks (page_id, type, position, anchor_id) values ($1, 'hero', 9000, 'hero')`, [page.id]),
  /blocks_anchor_key|duplicate key/i,
)

{
  // Soft-deleting frees the anchor — the partial index only covers live rows.
  await db.query(`update blocks set deleted_at = now() where page_id = $1 and anchor_id = 'skills'`, [page.id])
  const { rows } = await db.query(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'skills', 4000, 'skills') returning id`,
    [page.id],
  )
  check('soft delete releases the anchor', rows.length === 1)
}

{
  await db.query(`update blocks set settings = '{"showScrollHint":false}'::jsonb where id = $1`, [hero.id])
  const { rows } = await db.query(`select updated_at from blocks where id = $1`, [hero.id])
  check(
    'updated_at trigger fires on update',
    new Date(rows[0].updated_at).getTime() >= new Date(hero.updated_at).getTime(),
  )
}

await expectError(
  'block_translations rejects an unknown locale',
  () => db.query(`insert into block_translations (block_id, locale) values ($1, 'de')`, [hero.id]),
  /check constraint/i,
)

{
  const {
    rows: [temp],
  } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'tech_marquee', 5000) returning id`,
    [page.id],
  )
  await db.query(`insert into block_translations (block_id, locale) values ($1, 'en')`, [temp.id])
  await db.query(`delete from blocks where id = $1`, [temp.id])
  const { rows } = await db.query(`select 1 from block_translations where block_id = $1`, [temp.id])
  check('deleting a block cascades to its translations', rows.length === 0)
}

// ---------------------------------------------------------------------------
// 5. Collections
// ---------------------------------------------------------------------------
await db.query(
  `insert into entries (collection, slug, position, data) values ('experience', 'proof-app', 1000, '{"period":"Feb 2026 — Present"}'::jsonb)`,
)
await expectError(
  'entries.slug is unique per collection',
  () => db.query(`insert into entries (collection, slug, position) values ('experience', 'proof-app', 2000)`),
  /entries_slug_key|duplicate key/i,
)
{
  const { rows } = await db.query(
    `insert into entries (collection, slug, position) values ('project', 'proof-app', 1000) returning id`,
  )
  check('the same slug is free in another collection', rows.length === 1)
}

// ---------------------------------------------------------------------------
// 5b. 0022 rewrites the hero and the bio — only the copy that shipped
// ---------------------------------------------------------------------------
{
  const file = readFileSync(join(root, 'migrations', '0022_the_site_speaks_in_the_readme_voice.sql'), 'utf8')
  const {
    rows: [about],
  } = await db.query(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'about', 9500, 'about-copy') returning id`,
    [page.id],
  )
  const shipped = {
    bio: {
      lead: [{ text: 'I build interfaces that feel alive — and think.', accent: 'main' }],
      paragraphs: [{ text: 'With 7+ years of experience' }, { text: 'Currently seeking senior or staff-level roles' }],
    },
    role: 'Frontend-Focused Fullstack Engineer',
    facts: [{ label: 'Location', value: 'Yerevan, Armenia' }, { label: 'Status', value: 'Open to offers' }],
    socials: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Noro97' }],
  }
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'en', $2::jsonb)`,
    [about.id, JSON.stringify(shipped)],
  )
  await db.query(`update block_translations set content = '{"subtitle":"Fullstack Engineer","scrollHint":"Scroll"}'::jsonb where block_id = $1`, [hero.id])

  await db.exec(file)
  await db.exec(file)

  const contentOf = async (id) => {
    const { rows } = await db.query(`select content from block_translations where block_id = $1 and locale = 'en'`, [id])
    return rows[0].content
  }
  const heroCopy = await contentOf(hero.id)
  check('the hero subtitle is rewritten', heroCopy.subtitle === 'Fullstack Engineer, frontend-focused')
  check('with a number in the tagline', heroCopy.tagline?.some((run) => run.text.includes('50K')))
  check('and the scroll hint left alone', heroCopy.scrollHint === 'Scroll')

  const aboutCopy = await contentOf(about.id)
  check('the role line reads as the hero does', aboutCopy.role === 'Fullstack Engineer, frontend-focused')
  check('the bio lead is rewritten', aboutCopy.bio.lead[0].text.startsWith('I build interfaces that hold up'))
  check('the first paragraph is rewritten', aboutCopy.bio.paragraphs[0].text.includes('production incident'))
  check('the second paragraph is kept', aboutCopy.bio.paragraphs[1].text === 'Currently seeking senior or staff-level roles')
  check('the status fact is narrowed, found by value', aboutCopy.facts[1].value === 'Open to senior/staff roles')
  check('the other facts and the socials are untouched', aboutCopy.facts[0].value === 'Yerevan, Armenia' && aboutCopy.socials.length === 1)

  await db.query(`update block_translations set content = '{"subtitle":"Reworded by hand"}'::jsonb where block_id = $1`, [hero.id])
  await db.exec(file)
  check('copy reworded in the admin is left alone', (await contentOf(hero.id)).subtitle === 'Reworded by hand')
}

// ---------------------------------------------------------------------------
// 5c. 0024 repoints every product image at a drawn one — uploads only
// ---------------------------------------------------------------------------
{
  const file = readFileSync(join(root, 'migrations', '0024_illustrations_in_the_palette.sql'), 'utf8')
  await db.query(
    `update entries set data = data || '{"image":"https://blob.example/media/d1bf3316-x.png"}'::jsonb where collection = 'experience' and slug = 'proof-app'`,
  )
  const {
    rows: [bento],
  } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'bento_grid', 9600) returning id`,
    [page.id],
  )
  const before = {
    sectionLabel: 'Deep Dive',
    projects: [
      { project: 'nexusroute', title: 'NexusRoute', image: 'https://blob.example/media/65b68898-x.png' },
      { project: 'proof', title: 'Proof', image: '' },
    ],
    tiles: [
      { title: 'Performance Audit', image: 'https://blob.example/media/26394992-x.png' },
      { title: 'Hand-placed', image: '/assets/mine.png' },
    ],
    illustrations: { omnigrid: 'https://blob.example/media/e145c603-x.png', gamification: '/assets/mine.svg' },
    badges: [{ rarity: 'rare', image: 'https://blob.example/media/badge.svg' }],
  }
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'en', $2::jsonb)`,
    [bento.id, JSON.stringify(before)],
  )
  await db.exec(file)
  await db.exec(file)
  const { rows: entry } = await db.query(`select data from entries where collection = 'experience' and slug = 'proof-app'`)
  check('an uploaded experience image becomes the drawn one', entry[0].data.image === '/assets/illustrations/proof-mini-app.svg')
  check('the rest of the entry survives', entry[0].data.period === 'Feb 2026 — Present')
  const { rows: grid } = await db.query(`select content from block_translations where block_id = $1`, [bento.id])
  const after = grid[0].content
  check('a project card is matched by its key', after.projects[0].image === '/assets/illustrations/nexusroute-map.svg')
  check('a card with no image stays without one', after.projects[1].image === '')
  check('a tile is matched by the file it held', after.tiles[0].image === '/assets/illustrations/tile-performance.svg')
  check('a path set by hand is left alone', after.tiles[1].image === '/assets/mine.png' && after.illustrations.gamification === '/assets/mine.svg')
  check('the named illustration is repointed', after.illustrations.omnigrid === '/assets/illustrations/omnigrid-illustration.svg')
  check('the badges are not products and are not touched', after.badges[0].image === 'https://blob.example/media/badge.svg')
  check('the rest of the block survives', after.sectionLabel === 'Deep Dive')
}

// ---------------------------------------------------------------------------
// 6. Publishing
// ---------------------------------------------------------------------------
{
  const { rows } = await db.query(
    `insert into publications (payload, locales, checksum, author_id)
     values ('{"pages":[]}'::jsonb, array['en','ru'], 'sha256:1', $1) returning version`,
    [owner.id],
  )
  const first = Number(rows[0].version)
  const { rows: second } = await db.query(
    `insert into publications (payload, locales, checksum) values ('{"pages":[]}'::jsonb, array['en'], 'sha256:2') returning version`,
  )
  check('publications.version increments monotonically', Number(second[0].version) === first + 1)

  // The query the manifest and the publish route run, in the shape they run it.
  // `version::text` in the select list creates an output column of the same
  // name, and an unqualified `order by version` binds to *that* — sorting the
  // rows as strings, where '9' lands above '12'. The manifest served version 9
  // through three publishes before anyone noticed, because the site kept
  // rendering the copy baked into its bundle.
  while (Number((await db.query(`select max(version) as m from publications`)).rows[0].m) < 12) {
    await db.query(
      `insert into publications (payload, locales, checksum) values ('{"pages":[]}'::jsonb, array['en'], 'sha256:n')`,
    )
  }
  const { rows: latest } = await db.query(
    `select version::text, checksum from publications order by publications.version desc limit 1`,
  )
  const { rows: [{ m: actualMax }] } = await db.query(`select max(version) as m from publications`)
  // The same shape guards placement. A new block lands halfway between its
  // neighbours, and the neighbour is found with `select position::text … order
  // by position` — where an unqualified order binds to the cast output column
  // and sorts 2 above 10. Every page here has more than ten of something.
  {
    // A position where text order and number order disagree: as strings,
    // '3000' sorts above '10000'. Without one, the check passes either way.
    await db.query(
      `insert into blocks (page_id, type, position, anchor_id)
       values ($1, 'contact_cta', 10000, 'contact')`,
      [page.id],
    )
    const { rows: worst } = await db.query(
      `select position::text from blocks where deleted_at is null
        order by position desc limit 1`,
    )
    const { rows: right } = await db.query(
      `select position::text from blocks where deleted_at is null
        order by blocks.position desc limit 1`,
    )
    const { rows: [{ m }] } = await db.query(
      `select max(position)::text as m from blocks where deleted_at is null`,
    )
    check(
      'the last block is found by number, not by string order',
      Number(right[0].position) === Number(m),
      `qualified gave ${right[0].position}, unqualified gives ${worst[0].position}, newest is ${m}`,
    )
  }

  check(
    'latest publication is found by number, not by string order',
    Number(latest[0].version) === Number(actualMax),
    `got ${latest[0].version}, newest is ${actualMax}`,
  )
}

{
  // 0008 narrowed the accent enum. The walk has to reach values nested in arrays
  // of runs, and leave prose alone — a body of copy is free to say "crimson".
  const legacy = {
    tagline: [
      { text: 'Building interfaces', accent: 'none' },
      { text: 'engineering precision', accent: 'crimson' },
      { text: 'and visual storytelling', accent: 'bright' },
    ],
    body: 'The palette was crimson before it was green.',
  }
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'ru', $2::jsonb)`,
    [hero.id, JSON.stringify(legacy)],
  )
  await db.exec(readFileSync(join(root, 'migrations', '0008_two_tones.sql'), 'utf8'))

  const { rows } = await db.query(
    `select content from block_translations where block_id = $1 and locale = 'ru'`,
    [hero.id],
  )
  const after = rows[0].content
  check(
    'retired accents are rewritten wherever they are nested',
    after.tagline.map((run) => run.accent).join(',') === 'main,highlight,main',
    `got ${after.tagline.map((run) => run.accent).join(',')}`,
  )
  check(
    'prose that mentions a retired accent is left alone',
    after.body === legacy.body,
    `got ${after.body}`,
  )
  check(
    'the text of every run survives the walk',
    after.tagline.map((run) => run.text).join('|') === legacy.tagline.map((run) => run.text).join('|'),
  )
}

{
  // 0009 takes the number out of the eyebrow. The row it must not touch is a
  // section that is not a case study, and a label whose trailing digits are
  // part of the copy.
  const { rows: study } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'merch', 9000) returning id`,
    [page.id],
  )
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'en', $2::jsonb)`,
    [study[0].id, JSON.stringify({ sectionLabel: 'Case Study 02', title: 'MerchForge' })],
  )
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'ru', $2::jsonb)`,
    [study[0].id, JSON.stringify({ sectionLabel: 'Кейс 02', title: 'MerchForge' })],
  )
  const { rows: other } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'capabilities', 9100) returning id`,
    [page.id],
  )
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'en', $2::jsonb)`,
    [other[0].id, JSON.stringify({ sectionLabel: 'Selected Work 2026', title: 'Capabilities' })],
  )

  await db.exec(readFileSync(join(root, 'migrations', '0009_case_study_number_is_position.sql'), 'utf8'))

  const labelOf = async (id, locale) => {
    const { rows } = await db.query(
      `select content ->> 'sectionLabel' as label from block_translations where block_id = $1 and locale = $2`,
      [id, locale],
    )
    return rows[0].label
  }
  check('the number leaves the case study eyebrow', (await labelOf(study[0].id, 'en')) === 'Case Study')
  check('every locale, not just the one', (await labelOf(study[0].id, 'ru')) === 'Кейс')
  check(
    'a section that is not a case study keeps its digits',
    (await labelOf(other[0].id, 'en')) === 'Selected Work 2026',
  )
  // 0010 drops the seeded category colours without disturbing anything else in
  // the block — the skills sit in the same object.
  const { rows: skills } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'skills', 9200) returning id`,
    [page.id],
  )
  const before = {
    sectionLabel: 'Expertise',
    categories: [
      { name: 'Frontend Core', color: '#B51A2B', skills: [{ name: 'React.js', level: 95 }] },
      { name: 'Platform & AI', color: '#6C3AED', skills: [{ name: 'Docker', level: 70 }] },
    ],
  }
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'en', $2::jsonb)`,
    [skills[0].id, JSON.stringify(before)],
  )

  await db.exec(
    readFileSync(join(root, 'migrations', '0010_category_colours_follow_the_palette.sql'), 'utf8'),
  )

  const { rows } = await db.query(
    `select content from block_translations where block_id = $1 and locale = 'en'`,
    [skills[0].id],
  )
  const after = rows[0].content
  check(
    'every category colour is dropped',
    after.categories.every((category) => !('color' in category)),
    JSON.stringify(after.categories),
  )
  check(
    'the skills inside each category survive',
    after.categories[0].skills[0].name === 'React.js' && after.categories[1].skills[0].level === 70,
  )
  check('the rest of the block is untouched', after.sectionLabel === 'Expertise')
}

{
  // 0021 points each skill at the case study that shows it. The skills block
  // above was planted after the migration set ran, so the file is replayed;
  // then a proof typed by hand is planted and the file replayed again.
  const file = readFileSync(join(root, 'migrations', '0021_skills_say_where_they_were_used.sql'), 'utf8')
  await db.exec(file)
  const {
    rows: [skills],
  } = await db.query(
    `select b.id from blocks b join block_translations t on t.block_id = b.id
      where b.type = 'skills' and t.locale = 'en' and t.content ? 'categories'`,
  )
  const read = async () => {
    const { rows } = await db.query(`select content from block_translations where block_id = $1 and locale = 'en'`, [skills.id])
    return rows[0].content
  }
  let content = await read()
  const react = content.categories[0].skills[0]
  const docker = content.categories[1].skills[0]
  check('a skill a study shows gets its proof and a link', react.proof === 'NexusRoute' && react.proofHref === '/work/logistics', JSON.stringify(react))
  check('a skill nothing shows is left without one', !('proof' in docker), JSON.stringify(docker))
  check('levels and names survive the walk', react.level === 95 && docker.name === 'Docker')

  content.categories[0].skills[0].proof = 'Typed by hand'
  await db.query(`update block_translations set content = $2::jsonb where block_id = $1 and locale = 'en'`, [skills.id, JSON.stringify(content)])
  await db.exec(file)
  content = await read()
  check('a proof typed by hand outranks the seeded one', content.categories[0].skills[0].proof === 'Typed by hand')
}

{
  // 0013 seeds the menu. The assertion that matters is what it stores: a page
  // slug and a section, never an address — an address would look identical
  // until someone renamed the page, and then point at nothing.
  const { rows } = await db.query(
    `select slug, data from entries where collection = 'navigation' order by position`,
  )
  // Eight from 0013, and Writing from 0020 — slotted between Projects and
  // Automation without renumbering either.
  check('the menu is seeded', rows.length === 9, `got ${rows.length}`)
  const order = rows.map((row) => row.slug)
  check(
    'writing sits between the projects and the automation',
    order.indexOf('writing') === order.indexOf('projects') + 1 && order.indexOf('automation') === order.indexOf('writing') + 1,
    order.join(','),
  )
  check(
    'no item stores an address',
    rows.every((row) => !JSON.stringify(row.data).includes('/')),
    JSON.stringify(rows.map((r) => r.data)),
  )
  // 0013 pointed Contact at the chrome, where the terminal lived; 0023 moved
  // the terminal to a page of its own and the item followed it. (0031 then
  // drops the item's section: the page is the whole address.)
  check(
    'the contact item follows the terminal to its own page',
    rows.find((row) => row.slug === 'contact')?.data.page === 'contact',
    JSON.stringify(rows.find((row) => row.slug === 'contact')?.data),
  )

  const { rows: labels } = await db.query(
    `select t.locale, t.data from entry_translations t
       join entries e on e.id = t.entry_id
      where e.collection = 'navigation' and e.slug = 'about'`,
  )
  check('both languages are seeded', labels.length === 2, `got ${labels.length}`)
  check(
    'the Russian label is Russian',
    labels.find((row) => row.locale === 'ru')?.data.label === 'Обо мне',
  )
}

{
  // 0023 moves the terminal off the chrome page and onto contact, puts a call
  // to action above it and a footer on the chrome. No terminal existed when the
  // migration set ran, so one is planted on `site` and the file replayed.
  const {
    rows: [site],
  } = await db.query(`select id from pages where slug = 'site'`)
  const {
    rows: [terminal],
  } = await db.query(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'terminal_footer', 1000, 'terminal') returning id`,
    [site.id],
  )
  const file = readFileSync(join(root, 'migrations', '0023_a_footer_and_a_contact_page.sql'), 'utf8')
  await db.exec(file)
  await db.exec(file)
  const { rows: moved } = await db.query(
    `select p.slug, b.position from blocks b join pages p on p.id = b.page_id where b.id = $1`,
    [terminal.id],
  )
  check('the terminal is moved to the contact page, not recreated', moved[0].slug === 'contact' && Number(moved[0].position) === 2000)
  const { rows: contact } = await db.query(
    `select b.type, b.position from blocks b join pages p on p.id = b.page_id
      where p.slug = 'contact' and b.deleted_at is null order by b.position`,
  )
  check('a call to action sits above it, once', contact.map((row) => row.type).join(',') === 'kit_cta_banner,terminal_footer')
  const { rows: cta } = await db.query(
    `select t.locale, t.content from block_translations t join blocks b on b.id = t.block_id where b.type = 'kit_cta_banner' and b.anchor_id = 'contact'`,
  )
  check('with no About block to copy a CV from, the second button is dropped', cta.length === 2 && cta.every((row) => row.content.secondaryLabel === ''))
  const { rows: chrome } = await db.query(
    `select b.type from blocks b join pages p on p.id = b.page_id where p.slug = 'site' and b.deleted_at is null`,
  )
  check('the chrome page holds the footer and nothing else', chrome.map((row) => row.type).join(',') === 'site_footer')
}

{
  // 0016 places the recruiter card on the home page. The migration set runs
  // before the fixtures create that page, so it is replayed here against one
  // — which also proves the replay is safe.
  const file = readFileSync(join(root, 'migrations', '0016_a_recruiter_can_hire_from_the_first_screen.sql'), 'utf8')
  await db.exec(file)
  await db.exec(file)
  const { rows: cards } = await db.query(
    `select id, position, settings from blocks where page_id = $1 and type = 'recruiter_cta' and deleted_at is null`,
    [page.id],
  )
  check('the recruiter card is placed once, however often the file runs', cards.length === 1, `got ${cards.length}`)
  check('it sits between the numbers and the closing call', Number(cards[0]?.position) === 2500)
  check(
    'with no About block to copy from, the CV link is empty rather than invented',
    cards[0]?.settings.cvHref === '',
    JSON.stringify(cards[0]?.settings),
  )
  const { rows: copy } = await db.query(
    `select locale, content, status from block_translations where block_id = $1 order by locale`,
    [cards[0]?.id],
  )
  check('both languages are written', copy.length === 2, `got ${copy.length}`)
  check('as ready, not draft', copy.every((row) => row.status === 'ready'))
  check('three reasons, in Russian too', copy.find((row) => row.locale === 'ru')?.content.points.length === 3)
}

{
  // 0017 writes the five decisions sections, but only over an empty one: copy
  // written by hand in the admin outranks the seeded copy. The migration set
  // ran before any detail block existed, so it is replayed against two — one
  // untouched, one with an English heading already written.
  const { rows: details } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'proof_detail', 9300), ($1, 'merch_detail', 9400) returning id, type`,
    [page.id],
  )
  const merch = details.find((row) => row.type === 'merch_detail')
  const proof = details.find((row) => row.type === 'proof_detail')
  await db.query(
    `insert into block_translations (block_id, locale, content) values ($1, 'en', '{"title":"Hand-written"}'::jsonb)`,
    [merch.id],
  )
  await db.exec(readFileSync(join(root, 'migrations', '0017_case_studies_say_why.sql'), 'utf8'))

  const copyOf = async (id, locale) => {
    const { rows } = await db.query(
      `select content, status from block_translations where block_id = $1 and locale = $2`,
      [id, locale],
    )
    return rows[0]
  }
  const proofEn = await copyOf(proof.id, 'en')
  const proofRu = await copyOf(proof.id, 'ru')
  check('an untouched study gets its decisions', proofEn?.content.decisions?.length === 4, JSON.stringify(proofEn))
  check('in both languages', proofRu?.content.title === 'Проверить тренировку, когда никто не смотрит')
  check('marked ready, so the admin does not flag it as a draft', proofEn?.status === 'ready' && proofRu?.status === 'ready')
  check('the numbers read the same in every language', proofRu?.content.metrics[0].value === proofEn?.content.metrics[0].value)
  check('a heading written by hand is left alone', (await copyOf(merch.id, 'en'))?.content.title === 'Hand-written')
  check('while the language nobody wrote is still seeded', (await copyOf(merch.id, 'ru'))?.content.decisions?.length === 2)
}

{
  // 0020 makes the writing page whole: a title for the tab, one block, and
  // three placeholder articles that name themselves as such.
  const { rows: pages } = await db.query(`select id, seo from pages where slug = 'writing'`)
  check('the writing page exists with a title in both languages', pages.length === 1 && pages[0].seo.en?.title && pages[0].seo.ru?.title)
  await db.exec(readFileSync(join(root, 'migrations', '0020_a_place_to_write.sql'), 'utf8'))
  const { rows: blocks } = await db.query(
    `select id from blocks where page_id = $1 and type = 'kit_writing' and deleted_at is null`,
    [pages[0]?.id],
  )
  check('one writing block, however often the file runs', blocks.length === 1)
  const { rows: copy } = await db.query(`select locale, status, content from block_translations where block_id = $1`, [blocks[0]?.id])
  check('three placeholder posts per language, saved as drafts', copy.length === 2 && copy.every((row) => row.status === 'draft' && row.content.posts.length === 3))
  check('no placeholder links anywhere', copy.every((row) => row.content.posts.every((post) => post.href === '')))
}

{
  // The page route merges seo with `||` rather than replacing it, so a request
  // carrying one locale must not drop the other. It is a shallow merge, which
  // is right for whole locales and wrong for half of one — asserted both ways
  // so the limit is written down rather than assumed.
  const { rows: seoPage } = await db.query(
    `insert into pages (slug, status, seo) values ('seo-merge', 'published', $1::jsonb) returning id`,
    [JSON.stringify({ en: { title: 'English' }, ru: { title: 'Русский' } })],
  )
  await db.query(
    `update pages set seo = seo || $2::jsonb where id = $1`,
    [seoPage[0].id, JSON.stringify({ en: { title: 'Changed' } })],
  )
  const { rows: merged } = await db.query(`select seo from pages where id = $1`, [seoPage[0].id])
  check('the other locale survives a one-locale write', merged[0].seo.ru?.title === 'Русский')
  check('the written locale is replaced', merged[0].seo.en?.title === 'Changed')
}

{
  // 0018 places the testimonials block on the work overview, which 0012 made,
  // so the migration set already placed it; replaying the file proves it is
  // placed once.
  const {
    rows: [work],
  } = await db.query(`select id from pages where slug = 'work'`)
  await db.exec(readFileSync(join(root, 'migrations', '0018_proof_next_to_the_work_it_proves.sql'), 'utf8'))
  const { rows: placed } = await db.query(
    `select id, position from blocks where page_id = $1 and type = 'testimonials' and deleted_at is null`,
    [work.id],
  )
  check('the references sit once under the grid, however often the file runs', placed.length === 1 && Number(placed[0].position) === 3000)
  const { rows: copy } = await db.query(
    `select locale, status, content from block_translations where block_id = $1 order by locale`,
    [placed[0]?.id],
  )
  check('three placeholder quotes in each language', copy.length === 2 && copy.every((row) => row.content.quotes.length === 3))
  check('saved as drafts, so the admin shows them as unfinished', copy.every((row) => row.status === 'draft'))
  check(
    'every placeholder says it is one',
    copy.every((row) => row.content.quotes.every((q) => /replace before launch|заменить до запуска/.test(q.quote))),
  )
}

{
  // History must survive the author's account being removed.
  await db.query(`insert into revisions (entity_type, entity_id, locale, data, author_id) values ('block', $1, 'en', '{}'::jsonb, $2)`, [hero.id, owner.id])
  await db.query(`delete from admin_users where id = $1`, [owner.id])
  const { rows } = await db.query(`select author_id from revisions where entity_id = $1`, [hero.id])
  check('revisions outlive their author', rows.length === 1 && rows[0].author_id === null)
  const { rows: sessionRows } = await db.query(`select 1 from sessions`)
  check('deleting a user cascades to their sessions', sessionRows.length === 0)
}

{
  // 0019 hides the Vibe Coding section on About and places a card under the
  // Experience timeline. No such section existed when the migration set ran,
  // so one is planted and the file replayed.
  const {
    rows: [about],
  } = await db.query(`select id from pages where slug = 'about'`)
  const {
    rows: [vibe],
  } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'vibecoding', 2000) returning id`,
    [about.id],
  )
  const file = readFileSync(join(root, 'migrations', '0019_the_founder_story_is_evidence.sql'), 'utf8')
  await db.exec(file)
  await db.exec(file)
  const { rows: hidden } = await db.query(`select is_visible, deleted_at from blocks where id = $1`, [vibe.id])
  check('the founder section is hidden, not deleted', hidden[0].is_visible === false && hidden[0].deleted_at === null)
  const { rows: cards } = await db.query(
    `select b.id, b.position, b.settings from blocks b join pages p on p.id = b.page_id
      where p.slug = 'experience' and b.type = 'cta_banner' and b.anchor_id = 'proof-app' and b.deleted_at is null`,
  )
  check('one card under the timeline, however often the file runs', cards.length === 1 && Number(cards[0].position) === 2000)
  check('it points at the case study', cards[0]?.settings.href === '/work/proof')
  const { rows: copy } = await db.query(`select locale from block_translations where block_id = $1`, [cards[0]?.id])
  check('in both languages', copy.length === 2)
}

{
  // 0025 places five sections on home and about and hides the logo marquee.
  // Home did not exist when the migration set ran, so the file is replayed.
  const {
    rows: [aboutPage],
  } = await db.query(`select id from pages where slug = 'about'`)
  await db.query(`insert into blocks (page_id, type, position) values ($1, 'tech_marquee', 3000)`, [aboutPage.id])
  const file = readFileSync(join(root, 'migrations', '0025_home_and_about_say_more.sql'), 'utf8')
  await db.exec(file)
  await db.exec(file)
  const placed = async (slug) => {
    const { rows } = await db.query(
      `select b.type from blocks b join pages p on p.id = b.page_id
        where p.slug = $1 and b.deleted_at is null and b.is_visible and b.type like 'kit_%' order by b.position`,
      [slug],
    )
    return rows.map((row) => row.type).join(',')
  }
  check('home gets the band and the services, once', (await placed('home')) === 'kit_big_marquee,kit_services')
  check('about gets process, tools and questions, once', (await placed('about')) === 'kit_process,kit_tool_stack,kit_faq')
  const { rows: marquee } = await db.query(
    `select is_visible, deleted_at from blocks where page_id = $1 and type = 'tech_marquee'`,
    [aboutPage.id],
  )
  check('the logo marquee is hidden, not deleted', marquee[0].is_visible === false && marquee[0].deleted_at === null)
  const { rows: copy } = await db.query(
    `select b.type, t.locale, t.status, t.content from block_translations t join blocks b on b.id = t.block_id
      where b.type in ('kit_big_marquee','kit_services','kit_process','kit_tool_stack','kit_faq')`,
  )
  check('every section is written in both languages', copy.length === 10)
  check('the questions are drafts — two answers are placeholders', copy.filter((row) => row.type === 'kit_faq').every((row) => row.status === 'draft'))
  check('everything else is ready', copy.filter((row) => row.type !== 'kit_faq').every((row) => row.status === 'ready'))
  check(
    'every placeholder says it is one',
    copy.filter((row) => row.type === 'kit_faq').every((row) => row.content.items.filter((item) => /Placeholder|Заглушка/.test(item.a)).length === 3),
  )
  check('sixteen tools, the schema ceiling', copy.find((row) => row.type === 'kit_tool_stack')?.content.tools.length === 16)
}

{
  // 0026 places the last seven promoted sections on work, skills and
  // experience. All three pages come from 0012, so the migration set already
  // placed them; the replay proves it is placed once.
  await db.exec(readFileSync(join(root, 'migrations', '0026_work_skills_and_experience_say_more.sql'), 'utf8'))
  const placed = async (slug) => {
    const { rows } = await db.query(
      `select b.type from blocks b join pages p on p.id = b.page_id
        where p.slug = $1 and b.deleted_at is null and b.type like 'kit_%' order by b.position`,
      [slug],
    )
    return rows.map((row) => row.type).join(',')
  }
  check('work gets the band, the feed, press, awards and the reel, in that order', (await placed('work')) === 'kit_stats_marquee,kit_visual_feed,kit_press,kit_awards,kit_show_reel')
  check('skills gets the comparison', (await placed('skills')) === 'kit_compare_table')
  check('experience gets the milestones', (await placed('experience')) === 'kit_timeline')
  const { rows: copy } = await db.query(
    `select b.type, t.locale, t.status, t.content from block_translations t join blocks b on b.id = t.block_id
      where b.type in ('kit_stats_marquee','kit_visual_feed','kit_press','kit_awards','kit_show_reel','kit_compare_table','kit_timeline')`,
  )
  check('seven sections, two languages each', copy.length === 14)
  const drafts = copy.filter((row) => ['kit_press', 'kit_awards', 'kit_show_reel'].includes(row.type))
  check('press, awards and the reel are drafts', drafts.every((row) => row.status === 'draft'))
  check('and say so in their own text', drafts.every((row) => /Placeholder|PLACEHOLDER|Заглушка|ЗАГЛУШКА/.test(JSON.stringify(row.content))))
  check('the rest are ready', copy.filter((row) => !drafts.includes(row)).every((row) => row.status === 'ready'))
  check('every feed tile is a drawn illustration', copy.filter((row) => row.type === 'kit_visual_feed').every((row) => row.content.tiles.every((tile) => tile.image.startsWith('/assets/illustrations/'))))
  check('the comparison never marks the other column as lacking what this profile lacks', copy.filter((row) => row.type === 'kit_compare_table').every((row) => row.content.rows.every((r) => r.a === true)))
}

{
  // 0027 strips three chrome switches from the site settings row. The row did
  // not exist when the migration set ran, so one is planted with all three
  // keys and the file replayed — twice, because a second run must be a no-op.
  await db.query(
    `insert into settings (key, value)
     values ('site', '{"grain":true,"dynamicGrid":false,"cursor":true,"navIndicator":"gooey"}'::jsonb)
     on conflict (key) do update set value = excluded.value`,
  )
  const file = readFileSync(join(root, 'migrations', '0027_the_ambient_layer_is_gone.sql'), 'utf8')
  await db.exec(file)
  await db.exec(file)
  const {
    rows: [site],
  } = await db.query(`select value from settings where key = 'site'`)
  check(
    'the ambient switches are gone from the site row',
    !('grain' in site.value) && !('dynamicGrid' in site.value) && !('cursor' in site.value),
    JSON.stringify(site.value),
  )
  check('the nav indicator survives', site.value.navIndicator === 'gooey')
}

{
  // 0028 lets a retired file keep its bytes until no recent publication names
  // it. `purged_at` is the only thing that tells a retired row with bytes from
  // one without, so a fresh delete must leave it null for the sweep to find.
  const {
    rows: [row],
  } = await db.query(
    `insert into media (storage_key, url, mime, deleted_at)
     values ('retired.png', 'https://store/retired.png', 'image/png', now())
     returning purged_at`,
  )
  check('a freshly retired file awaits the sweep', row.purged_at === null)
}

{
  // 0029 turns URLs of library files into `media:<id>`. Planted after the
  // migration set ran, then the file replayed — twice, since a second run must
  // find nothing left to convert.
  const {
    rows: [file],
  } = await db.query(
    `insert into media (storage_key, url, mime) values ('crown.svg', 'https://store/media/crown.svg', 'image/svg+xml') returning id`,
  )
  const {
    rows: [block],
  } = await db.query(
    `insert into blocks (page_id, type, position, settings) values ($1, 'bento_grid', 7000, $2) returning id`,
    [
      page.id,
      JSON.stringify({
        badge: 'https://store/media/crown.svg',
        note: 'see https://store/media/crown.svg?v=2',
        legacy: '/assets/illustrations/omnigrid.svg',
      }),
    ],
  )
  const sql = readFileSync(join(root, 'migrations', '0029_content_names_files_by_id.sql'), 'utf8')
  await db.exec(sql)
  await db.exec(sql)
  const {
    rows: [after],
  } = await db.query(`select settings from blocks where id = $1`, [block.id])
  check('a library URL becomes a reference to its file', after.settings.badge === `media:${file.id}`, JSON.stringify(after.settings))
  check('a URL inside a longer string is left alone', after.settings.note === 'see https://store/media/crown.svg?v=2')
  check('a path into the public folder is left alone', after.settings.legacy === '/assets/illustrations/omnigrid.svg')
}

{
  // 0031: menu items lose their section, and a link to a section becomes the
  // path of its page. Planted after the set ran, then replayed twice.
  const {
    rows: [contactPage],
  } = await db.query(`insert into pages (slug, status) values ('reach-me', 'published') returning id`)
  await db.query(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'contact_cta', 1000, 'reach-me-cta')`,
    [contactPage.id],
  )
  const {
    rows: [linking],
  } = await db.query(
    `insert into blocks (page_id, type, position, settings) values ($1, 'kit_cta_banner', 9500, $2) returning id`,
    [
      page.id,
      JSON.stringify({ primaryHref: '#reach-me-cta', accent: '#9AE316', note: 'see #reach-me-cta below' }),
    ],
  )
  const {
    rows: [item],
  } = await db.query(
    `insert into entries (collection, slug, position, data)
     values ('navigation', 'reach-me', 9500, '{"page":"reach-me","anchor":"reach-me-cta","external":""}') returning id`,
  )
  const sql = readFileSync(join(root, 'migrations', '0031_the_menu_links_pages_not_sections.sql'), 'utf8')
  await db.exec(sql)
  await db.exec(sql)
  const {
    rows: [after],
  } = await db.query(`select settings from blocks where id = $1`, [linking.id])
  const {
    rows: [menu],
  } = await db.query(`select data from entries where id = $1`, [item.id])
  check('a link to a section becomes the path of its page', after.settings.primaryHref === '/reach-me', JSON.stringify(after.settings))
  check('a colour and a hash inside a sentence are left alone', after.settings.accent === '#9AE316' && after.settings.note === 'see #reach-me-cta below')
  check('a menu item keeps its page and loses its section', menu.data.page === 'reach-me' && !('anchor' in menu.data), JSON.stringify(menu.data))
}

// ---------------------------------------------------------------------------
// 0032: the profile facts have one home
// ---------------------------------------------------------------------------
{
  const {
    rows: [seeded],
  } = await db.query(`select value from settings where key = 'profile'`)
  check('the profile is seeded', seeded?.value?.name === 'Norayr Avetisyan', JSON.stringify(seeded?.value?.name))
  check('the seed holds every role', seeded?.value?.roles?.length === 7, String(seeded?.value?.roles?.length))

  await db.query(`update settings set value = jsonb_set(value, '{availability}', '"Edited by hand"') where key = 'profile'`)
  await db.exec(readFileSync(join(root, 'migrations', '0032_the_profile_facts_have_one_home.sql'), 'utf8'))
  const {
    rows: [after],
  } = await db.query(`select value from settings where key = 'profile'`)
  check('running it again keeps a hand edit', after.value.availability === 'Edited by hand')
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const width = Math.max(...results.map(([, name]) => name.length))
for (const [status, name, detail] of results) {
  const line = `  ${status}  ${name.padEnd(width)}${detail ? `  — ${detail}` : ''}`
  console.log(status === 'PASS' ? line : `\x1b[31m${line}\x1b[0m`)
}
console.log(`\n  ${pass} passed, ${fail} failed\n`)
await db.close()
process.exit(fail === 0 ? 0 : 1)
