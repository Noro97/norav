-- =============================================================================
-- norav CMS · 0028 · Files outlive their last publication
--
-- Replacing or deleting a file removed its bytes at once. The drafts were
-- repointed, but the site does not read drafts: it reads the latest
-- publication, and first paints from the one baked into its bundle. Both still
-- named the old URL, so the image broke on the live site until the next
-- publish and deploy — the one place nobody was looking.
--
-- The bytes now stay while a recent publication names them, and are swept
-- after a publish that no longer does. `purged_at` is what the sweep reads:
-- a soft-deleted row whose bytes are still in storage has it null. Rows
-- deleted before this migration already lost their bytes, so they are marked.
-- =============================================================================

alter table media add column purged_at timestamptz;

update media set purged_at = deleted_at where deleted_at is not null;

create index media_awaiting_purge_idx on media (deleted_at)
  where deleted_at is not null and purged_at is null;
