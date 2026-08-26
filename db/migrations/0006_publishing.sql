-- =============================================================================
-- norav CMS · 0006 · Publishing, history and configuration
-- The site never reads the working tables above. It reads a publication: one
-- immutable, fully-resolved JSON snapshot per publish, which is what makes
-- rollback a pointer move rather than a data migration.
-- =============================================================================

create table revisions (
  id           bigserial primary key,
  entity_type  text not null check (entity_type in ('block', 'entry', 'page', 'settings')),
  entity_id    uuid,
  entity_key   text,                                  -- settings rows are keyed by text
  locale       text,                                  -- null for non-localized payloads
  data         jsonb not null,
  author_id    uuid references admin_users(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index revisions_entity_idx on revisions (entity_type, entity_id, created_at desc);

create table publications (
  version       bigserial primary key,
  payload       jsonb not null,                       -- { settings, pages, collections } per locale
  locales       text[] not null,
  checksum      text not null,                        -- sha256 of payload; lets the site skip no-op swaps
  note          text,
  author_id     uuid references admin_users(id) on delete set null,
  published_at  timestamptz not null default now()
);
create index publications_recent_idx on publications (published_at desc);

create table settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
create trigger settings_updated_at before update on settings
  for each row execute function set_updated_at();

create table audit_log (
  id           bigserial primary key,
  actor_id     uuid references admin_users(id) on delete set null,
  action       text not null,                         -- 'block.update', 'publish', 'auth.login.failed'
  entity_type  text,
  entity_id    uuid,
  diff         jsonb,
  ip           inet,
  created_at   timestamptz not null default now()
);
create index audit_log_recent_idx on audit_log (created_at desc);
