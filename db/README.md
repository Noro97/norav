# @norav/db

PostgreSQL schema for the norav CMS. Plain numbered SQL files, no ORM — the same
approach as `drivshield-db`.

## Layout

```
migrations/   0001…NNNN, applied in filename order, never edited after they ship
scripts/      migrate.mjs — idempotent runner, one transaction per file
tests/        schema.test.mjs — applies every migration to PGlite and asserts the invariants
```

## Running migrations

```bash
cp .env.example .env      # fill in the Neon connection string
npm install
npm run migrate:status    # what is applied / pending
npm run migrate           # apply pending
npm run migrate -- --through=0031   # apply pending, stopping after that number
```

Each file runs in its own transaction alongside its `schema_migrations` row, so a
failure leaves the database on the last fully-applied version. Migrations are
append-only: to change something, add a new file.

## Tests

```bash
npm test
```

Applies the whole migration set to an ephemeral PGlite instance (real Postgres
compiled to WASM) and asserts the invariants the API depends on — anchor
uniqueness, fractional ordering, cascade behaviour, `updated_at` triggers,
publication versioning. No Docker and no local cluster required.

## Conventions

- No extensions. `gen_random_uuid()` is core since PG13; case-insensitive email
  uses a `lower()` unique index instead of `citext`, so the files run unmodified
  on Neon and in PGlite.
- Soft delete via `deleted_at`, with partial indexes scoped to live rows.
- `position numeric` is a fractional index: reordering writes one row.
- `version integer` on editable rows is an optimistic lock — the API returns 409
  when the version it was handed is stale.
- Block *types* are validated against the code-side registry in
  `@norav/content-schema`, never a database enum: adding a block type must not
  require a migration.
