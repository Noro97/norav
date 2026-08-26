-- =============================================================================
-- norav CMS · 0004 · Collections
-- Repeatable entities referenced from more than one block (an experience row,
-- a case study, a skill, a metric). Kept generic on purpose: one CRUD surface
-- serves every collection, and a new collection is a schema in code, not a
-- table here.
-- =============================================================================

create table entries (
  id          uuid primary key default gen_random_uuid(),
  collection  text not null,                          -- 'experience' | 'project' | 'skill' | 'metric' | 'capability'
  slug        text not null,
  position    numeric not null,
  is_visible  boolean not null default true,
  data        jsonb not null default '{}'::jsonb,     -- non-localized: dates, stack, links, media ids
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create unique index entries_slug_key on entries (collection, slug) where deleted_at is null;
create index entries_order_idx on entries (collection, position) where deleted_at is null;
create trigger entries_updated_at before update on entries
  for each row execute function set_updated_at();

create table entry_translations (
  entry_id    uuid not null references entries(id) on delete cascade,
  locale      text not null check (locale in ('en', 'ru')),
  data        jsonb not null default '{}'::jsonb,     -- role, company, description, achievements[]
  status      text not null default 'draft' check (status in ('draft', 'ready', 'stale')),
  updated_at  timestamptz not null default now(),
  primary key (entry_id, locale)
);
create trigger entry_translations_updated_at before update on entry_translations
  for each row execute function set_updated_at();
