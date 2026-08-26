-- =============================================================================
-- norav CMS · 0003 · Page structure
-- Pages own an ordered list of blocks; localized copy lives in
-- block_translations, one row per locale. Everything that is NOT copy
-- (variants, toggles, media ids) stays on blocks.settings so a translation can
-- never diverge structurally from its source.
-- =============================================================================

create table pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo         jsonb not null default '{}'::jsonb,   -- { en: {title, description, ogImage}, ru: {...} }
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger pages_updated_at before update on pages
  for each row execute function set_updated_at();

create table blocks (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references pages(id) on delete cascade,
  -- Validated against the code-side block registry, not a DB enum: adding a
  -- block type must not require a migration.
  type        text not null,
  -- Fractional index. Reordering writes one row (midpoint between neighbours)
  -- instead of renumbering the whole page.
  position    numeric not null,
  anchor_id   text,                                  -- '#experience' target + nav id
  is_visible  boolean not null default true,
  settings    jsonb not null default '{}'::jsonb,
  -- Optimistic lock: PATCH carries the version it read, a stale one gets 409.
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index blocks_page_order_idx on blocks (page_id, position) where deleted_at is null;
create unique index blocks_anchor_key on blocks (page_id, anchor_id)
  where anchor_id is not null and deleted_at is null;
create trigger blocks_updated_at before update on blocks
  for each row execute function set_updated_at();

create table block_translations (
  block_id    uuid not null references blocks(id) on delete cascade,
  locale      text not null check (locale in ('en', 'ru')),
  content     jsonb not null default '{}'::jsonb,
  -- 'stale' is set when the source locale changes after this one was saved.
  status      text not null default 'draft' check (status in ('draft', 'ready', 'stale')),
  updated_at  timestamptz not null default now(),
  primary key (block_id, locale)
);
create trigger block_translations_updated_at before update on block_translations
  for each row execute function set_updated_at();
