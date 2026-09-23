import { mediaDisplaySrc, toMediaRef } from './media-refs'

/**
 * A post body's images, in the three forms they take.
 *
 * Stored:    <img src="media:<id>">          — the library entry, like any image field
 * Editing:   <img src="/api/admin/media/<id>/file"> — something the editor can draw
 * Published: <img src="https://…/crown.svg">  — the URL the entry has at publish
 *
 * No DOM here, so the same functions run in the editor and on the server.
 */
const ID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const STORED_SRC = new RegExp(`(<img\\b[^>]*?\\ssrc=)(["'])media:(${ID})\\2`, 'gi')
// The editor may have made the redirect absolute (http://localhost:3300/…).
const EDITING_SRC = new RegExp(
  `(<img\\b[^>]*?\\ssrc=)(["'])(?:https?://[^"'/]+)?/api/admin/media/(${ID})/file\\2`,
  'gi',
)

/** Stored body → what the editor loads. */
export function toEditorHtml(html: string): string {
  return html.replace(STORED_SRC, (_, head: string, quote: string, id: string) =>
    `${head}${quote}${mediaDisplaySrc(toMediaRef(id))}${quote}`,
  )
}

/** What the editor produced → stored body. */
export function toStoredHtml(html: string): string {
  return html.replace(EDITING_SRC, (_, head: string, quote: string, id: string) =>
    `${head}${quote}${toMediaRef(id.toLowerCase())}${quote}`,
  )
}

/**
 * Stored body → published body. Images whose entry is gone are left as they
 * are and their ids returned, so a publish can refuse rather than ship a hole.
 */
export function resolveHtmlMedia(
  html: string,
  urls: ReadonlyMap<string, string>,
): { html: string; missing: string[] } {
  const missing: string[] = []
  const resolved = html.replace(STORED_SRC, (match, head: string, quote: string, id: string) => {
    const url = urls.get(id.toLowerCase())
    if (!url) {
      missing.push(id.toLowerCase())
      return match
    }
    return `${head}${quote}${url}${quote}`
  })
  return { html: resolved, missing }
}

/** Every library id a stored body names — for "used by". */
export function htmlMediaIds(html: string): string[] {
  return [...html.matchAll(STORED_SRC)].map((match) => match[3]!.toLowerCase())
}

/** A slug from a title: lowercase words joined by hyphens, Latin only. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Minutes to read, at a pace for technical prose. Never zero. */
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
