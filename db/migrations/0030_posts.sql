-- =============================================================================
-- norav CMS · 0030 · Posts
--
-- The Writing page has held three placeholder articles since 0020, waiting for
-- something real to link to. A post is not a block: it is one long document
-- with a date and a URL of its own, written in a rich-text editor, and a page
-- builder is the wrong tool for it. So posts get their own table, and publish
-- into the snapshot as a collection named `posts` — which means the site reads
-- them the way it already reads every other collection.
--
-- Copy lives per locale, as it does for blocks. English is written first; a
-- Russian translation is optional, and a post without one publishes its
-- English copy under /ru rather than disappearing there.
--
-- `published_at` is the date a reader sees, and the gate: a post whose date is
-- still ahead is left out of a publish until one runs after that moment.
-- =============================================================================

create table posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at  timestamptz,
  -- `media:<id>` like any other image field, resolved when publishing.
  cover         text not null default '',
  tags          text[] not null default '{}',
  version       integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  -- A published post needs the date it goes out under.
  constraint posts_published_has_date check (status <> 'published' or published_at is not null)
);
-- Unique among live posts only, so a deleted post frees its address.
create unique index posts_slug_key on posts (slug) where deleted_at is null;
create index posts_recent_idx on posts (published_at desc) where deleted_at is null;
create trigger posts_updated_at before update on posts
  for each row execute function set_updated_at();

create table post_translations (
  post_id     uuid not null references posts(id) on delete cascade,
  locale      text not null check (locale in ('en', 'ru')),
  title       text not null default '',
  excerpt     text not null default '',
  -- Sanitized on save. Inline images carry `media:<id>` in their src.
  body_html   text not null default '',
  -- { title, description } for the search listing; empty falls back to the
  -- post's own title and excerpt.
  seo         jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (post_id, locale)
);
create trigger post_translations_updated_at before update on post_translations
  for each row execute function set_updated_at();
