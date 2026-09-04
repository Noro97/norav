/**
 * A section's content, with anything the editor left blank falling back.
 *
 * The sections keep their imported copy as `DEFAULTS` beside them, which is
 * what the CMS pre-fills a new block with. This is the other end of that: a
 * field cleared in the admin, or a block created before a field existed, gets
 * the default rather than a hole in the page — and a section rendered outside
 * the CMS entirely (a test, a story) needs no content at all.
 *
 * Shallow on purpose. A list the editor emptied means an empty list; merging
 * the default rows back in would make a row impossible to delete.
 */
export function withDefaults(defaults, content) {
  if (!content) return defaults;
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(content)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    merged[key] = value;
  }
  return merged;
}
