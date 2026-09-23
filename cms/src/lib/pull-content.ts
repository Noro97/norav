/**
 * Copies the content of one database into another — what `pull:production`
 * does to put the live site's content on a laptop.
 *
 * Content only. The tables below are everything an editor can see in the
 * admin; what is left out is everything about *who*: `admin_users` and their
 * `sessions`, `login_attempts`, `preview_tokens`. The laptop keeps its own
 * login, and production's password hashes never leave production. The rows
 * that point at a user — a revision's author, a publication's — keep the row
 * and lose the pointer, the same thing the schema does when a user is deleted.
 *
 * The audit log comes along for content actions and stays behind for
 * `auth.*`: a failed sign-in and the address it came from is telemetry about
 * the live deployment, not history of the content.
 */
export interface Queryable {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
}

/** Parents before children, so every foreign key finds its target on insert. */
const CONTENT_TABLES = [
  'pages',
  'blocks',
  'block_translations',
  'entries',
  'entry_translations',
  'media',
  'posts',
  'post_translations',
  'settings',
  'revisions',
  'publications',
  'audit_log',
] as const

type ContentTable = (typeof CONTENT_TABLES)[number]

/** Columns that reference `admin_users`, which is not copied. */
const AUTHOR_COLUMNS: Partial<Record<ContentTable, string>> = {
  revisions: 'author_id',
  publications: 'author_id',
  audit_log: 'actor_id',
}

/** `bigserial` keys: the sequence has to catch up with the ids just written. */
const SERIAL_COLUMNS: Partial<Record<ContentTable, string>> = {
  revisions: 'id',
  publications: 'version',
  audit_log: 'id',
}

const ROW_FILTER: Partial<Record<ContentTable, string>> = {
  audit_log: `where action not like 'auth.%'`,
}

export type PullReport = Record<ContentTable, number>

async function migrations(db: Queryable): Promise<string[]> {
  const rows = await db.query<{ version: string }>('select version from schema_migrations order by version')
  return rows.map((r) => r.version)
}

/**
 * Wipes the content tables of `target` and fills them from `source`, in one
 * transaction on the target, so a failure halfway leaves the laptop exactly as
 * it was rather than half-live. Returns how many rows each table received.
 */
export async function pullContent(source: Queryable, target: Queryable): Promise<PullReport> {
  // Same schema on both sides, or the rows will not fit — and a laptop that is
  // *ahead* of production would silently be told its new column is empty.
  const [ours, theirs] = await Promise.all([migrations(target), migrations(source)])
  if (ours.join('\n') !== theirs.join('\n')) {
    const missingHere = theirs.filter((m) => !ours.includes(m))
    const missingThere = ours.filter((m) => !theirs.includes(m))
    throw new Error(
      'The two databases are on different migrations, so the rows would not fit.\n' +
        (missingHere.length ? `  Applied live, not here: ${missingHere.join(', ')}\n` : '') +
        (missingThere.length ? `  Applied here, not live: ${missingThere.join(', ')}\n` : '') +
        'Migrate whichever side is behind, then pull again.',
    )
  }

  const report = Object.fromEntries(CONTENT_TABLES.map((t) => [t, 0])) as PullReport

  await target.query('begin')
  try {
    // Children first — `cascade` would take them anyway, but naming them keeps
    // the statement honest about what it clears.
    await target.query(`truncate ${[...CONTENT_TABLES].reverse().join(', ')} cascade`)

    for (const table of CONTENT_TABLES) {
      const [rows, jsonColumns] = await Promise.all([
        source.query<Record<string, unknown>>(`select * from ${table} ${ROW_FILTER[table] ?? ''}`),
        jsonbColumns(source, table),
      ])
      const author = AUTHOR_COLUMNS[table]
      for (const row of rows) {
        if (author) row[author] = null
        const columns = Object.keys(row)
        const placeholders = columns.map((_, i) => `$${i + 1}`)
        await target.query(
          `insert into ${table} (${columns.join(', ')}) values (${placeholders.join(', ')})`,
          columns.map((c) => (jsonColumns.has(c) && row[c] !== null ? JSON.stringify(row[c]) : row[c])),
        )
      }
      report[table] = rows.length

      const serial = SERIAL_COLUMNS[table]
      if (serial) {
        // Next id = max + 1, or 1 on an empty table (`false` = not yet called).
        await target.query(
          `select setval(pg_get_serial_sequence('${table}', '${serial}'),
                         coalesce((select max(${serial}) from ${table}), 1),
                         (select count(*) > 0 from ${table}))`,
        )
      }
    }
    await target.query('commit')
  } catch (error) {
    await target.query('rollback')
    throw error
  }

  return report
}

/**
 * Both drivers hand jsonb back parsed, and both take a JSON string for it on
 * the way in. What neither can be trusted with is a jsonb *array* handed
 * back as a JS array: sent as a parameter it becomes a Postgres array, which
 * is `text[]` shaped, not JSON. So the columns are asked for their type, and
 * jsonb is always stringified — `text[]` (`publications.locales`) stays an
 * array and the driver does the right thing with that.
 */
async function jsonbColumns(db: Queryable, table: string): Promise<Set<string>> {
  const rows = await db.query<{ column_name: string }>(
    `select column_name from information_schema.columns
      where table_schema = 'public' and table_name = $1 and data_type = 'jsonb'`,
    [table],
  )
  return new Set(rows.map((r) => r.column_name))
}
