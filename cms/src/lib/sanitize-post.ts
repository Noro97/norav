import sanitizeHtml from 'sanitize-html'
import { toStoredHtml } from './post-html'

/**
 * What a post body may contain, which is what the editor's toolbar can make.
 *
 * The site renders the stored HTML as it is, so this is the only thing between
 * a paste from somewhere else and a script on norav.dev. The list matches the
 * toolbar on purpose: a tag the toolbar cannot produce only arrives by paste,
 * and pasted styling is exactly what the site's own typography should win
 * over. So no classes, no inline styles, no colours, no fonts — except the one
 * class the code sample plugin writes to name a language.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'h2', 'h3', 'strong', 'em', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'figure', 'figcaption',
  ],
  allowedAttributes: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height'],
    pre: ['class'],
    code: ['class'],
  },
  allowedClasses: {
    pre: [/^language-[\w-]+$/],
    code: [/^language-[\w-]+$/],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // `media:` is a library reference, resolved to a URL when publishing.
  allowedSchemesByTag: { img: ['https', 'http', 'media'] },
  allowProtocolRelative: false,
  // An h1 is the post's title, which is its own field. A pasted one becomes a
  // section heading rather than a second title.
  transformTags: {
    h1: 'h2',
    h4: 'h3',
    b: 'strong',
    i: 'em',
    a: sanitizeHtml.simpleTransform('a', {}, true),
  },
  exclusiveFilter: (frame) => frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren.length,
}

/** Editor output → the body stored in the database. */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(toStoredHtml(html), OPTIONS).trim()
}
