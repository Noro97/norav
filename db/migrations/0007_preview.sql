-- =============================================================================
-- norav CMS · 0007 · Preview tokens
--
-- A short-lived key that lets the site render unpublished content. Deliberately
-- not a session: the site is served from another origin, so the token travels
-- in a URL that can be pasted, forwarded or logged, and one that doubled as a
-- session cookie would hand over the admin along with the preview.
--
-- Only the digest is stored, on the same reasoning as sessions — a database
-- dump should not be replayable.
-- =============================================================================

create table preview_tokens (
  token_hash  text primary key,
  created_by  uuid references admin_users(id) on delete set null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- Expiry is checked on every use, so the index that matters is the sweep.
create index preview_tokens_expiry_idx on preview_tokens (expires_at);
