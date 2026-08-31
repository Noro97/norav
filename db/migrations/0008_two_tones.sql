-- =============================================================================
-- norav CMS · 0008 · Two tones for accented text
--
-- Inline runs of copy carried one of three emphases — none, crimson, bright.
-- Two of them differed only in how bright a grey they were, so a sentence could
-- hold three tones and read as an oversight. The schema now offers `main` and
-- `highlight`, and nothing else.
--
-- The reader is protected by the schema, which accepts the retired strings and
-- normalises them. This migration is for the editor: a select whose stored value
-- is not among its options shows empty, and the next save would silently pick
-- for them.
--
-- Only drafts are rewritten. A publication is an immutable record of what was
-- shipped, and editing one to suit a later enum would make it a record of
-- nothing.
-- =============================================================================

-- A targeted walk rather than a text replace: `accent` is nested inside arrays
-- of runs, and a body of copy is free to contain the word "crimson".
create or replace function pg_temp.two_tones(node jsonb) returns jsonb language plpgsql immutable as $$
declare
  result jsonb := '{}'::jsonb;
  item   record;
begin
  -- `node`, not `value`: jsonb_each returns a column of that name, and plpgsql
  -- cannot tell a parameter from a column when both are in scope.
  case jsonb_typeof(node)
    when 'object' then
      for item in select key, value as child from jsonb_each(node) loop
        if item.key = 'accent' and jsonb_typeof(item.child) = 'string' then
          result := result || jsonb_build_object(
            item.key,
            case item.child #>> '{}'
              when 'none' then 'main'
              when 'bright' then 'main'
              when 'crimson' then 'highlight'
              else item.child #>> '{}'
            end
          );
        else
          result := result || jsonb_build_object(item.key, pg_temp.two_tones(item.child));
        end if;
      end loop;
      return result;
    when 'array' then
      return coalesce(
        (select jsonb_agg(pg_temp.two_tones(element)) from jsonb_array_elements(node) element),
        '[]'::jsonb
      );
    else
      return node;
  end case;
end;
$$;

update block_translations
   set content = pg_temp.two_tones(content)
 where content::text like '%"accent"%';
