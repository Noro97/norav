-- =============================================================================
-- norav CMS · 0002 · Identity
-- Admin accounts and server-side sessions. Single-tenant: one owner, optional
-- extra editors. No public sign-up — accounts are created by `npm run user:add`.
-- =============================================================================

create table admin_users (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  password_hash  text not null,              -- argon2id
  name           text,
  role           text not null default 'owner' check (role in ('owner', 'editor')),
  totp_secret    text,                       -- null until 2FA is enrolled
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  last_login_at  timestamptz
);
create unique index admin_users_email_key on admin_users (lower(email));
create trigger admin_users_updated_at before update on admin_users
  for each row execute function set_updated_at();

-- Only the SHA-256 of the session token is stored: a database dump can't be
-- replayed as a live session.
create table sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references admin_users(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index sessions_active_idx on sessions (user_id) where revoked_at is null;
create index sessions_expiry_idx on sessions (expires_at) where revoked_at is null;

-- Login throttling. One row per (identifier, ip) window; the API refuses after
-- N failures and clears the row on success.
create table login_attempts (
  identifier   text not null,
  ip           inet not null,
  failures     integer not null default 0,
  window_start timestamptz not null default now(),
  primary key (identifier, ip)
);
