-- =============================================================================
-- norav CMS · 0039 · A restore names the version it copied
--
-- Restoring an older version doesn't move anything back. It writes a new
-- publication with that version's content, so the history stays as it
-- happened and the restore itself can be undone the same way. This column
-- says which version a publication was copied from. It's null for an ordinary
-- publish, which is every row before this migration.
-- =============================================================================

alter table publications
  add column restored_from bigint references publications (version);
