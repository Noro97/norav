-- =============================================================================
-- norav CMS · 0029 · Content names files by id
--
-- An image field held the file's URL. That URL is where the bytes happen to be
-- today: a replaced file gets a new one, a laptop's uploads have localhost in
-- theirs, and a copy of it in the content goes stale without anything
-- noticing. From here the admin stores `media:<id>` and publishing turns it
-- into whatever URL the entry has at that moment — refusing when the entry is
-- gone. The site still receives URLs; nothing changes on its side.
--
-- This converts what is already there. Every JSON string that is exactly the
-- URL of a live library file becomes a reference to it, in the four places
-- content can name a file (lib/content-references REFERENCE_SITES). Matching
-- the quoted value, not a substring, so a URL inside a longer string — a query
-- string, a sentence — is left alone. Anything that matches no file (paths into
-- the site's public folder, links elsewhere) stays as written, and publishes as
-- it always did.
-- =============================================================================

do $$
declare
  file record;
  needle text;
  replacement text;
begin
  for file in select id, url from media where deleted_at is null loop
    needle      := to_jsonb(file.url)::text;
    replacement := to_jsonb('media:' || file.id::text)::text;

    update blocks
       set settings = replace(settings::text, needle, replacement)::jsonb
     where strpos(settings::text, needle) > 0;

    update block_translations
       set content = replace(content::text, needle, replacement)::jsonb
     where strpos(content::text, needle) > 0;

    update entries
       set data = replace(data::text, needle, replacement)::jsonb
     where strpos(data::text, needle) > 0;

    update entry_translations
       set data = replace(data::text, needle, replacement)::jsonb
     where strpos(data::text, needle) > 0;
  end loop;
end
$$;
