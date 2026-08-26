-- =============================================================================
-- norav CMS · 0005 · Media library
-- Rows are metadata only; bytes live in blob storage. Dimensions and blurhash
-- are captured at upload so the site can reserve layout space and avoid CLS.
-- =============================================================================

create table media (
  id           uuid primary key default gen_random_uuid(),
  storage_key  text not null unique,                  -- path in the blob store
  url          text not null,
  mime         text not null,
  width        integer,
  height       integer,
  size_bytes   bigint,
  blurhash     text,
  alt          jsonb not null default '{}'::jsonb,    -- { en, ru }
  -- Derived renditions: [{ width, url, mime }]. Written by the upload pipeline.
  variants     jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index media_recent_idx on media (created_at desc) where deleted_at is null;
create trigger media_updated_at before update on media
  for each row execute function set_updated_at();
