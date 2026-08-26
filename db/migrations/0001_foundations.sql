-- =============================================================================
-- norav CMS · 0001 · Foundations
-- Migration bookkeeping and the shared updated_at trigger.
--
-- Portability: PostgreSQL 16+ and PGlite (tests). No extensions — gen_random_uuid()
-- is core since PG13, and citext is replaced by a lower() unique index, so the
-- same files run unmodified on Neon and in the WASM test harness.
-- =============================================================================

create table if not exists schema_migrations (
  version     text primary key,
  applied_at  timestamptz not null default now()
);

-- Every table with an updated_at column attaches this; the API never sets the
-- column by hand, so a direct psql edit can't leave a stale timestamp behind.
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
