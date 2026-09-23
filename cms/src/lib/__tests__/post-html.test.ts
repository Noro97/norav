import { describe, expect, it } from 'vitest'
import {
  htmlMediaIds,
  readingMinutes,
  resolveHtmlMedia,
  slugify,
  toEditorHtml,
  toStoredHtml,
} from '../post-html'
import { sanitizePostHtml } from '../sanitize-post'

const ID = '3a4985e1-f895-419c-8025-9d8bd9ad5095'
const GONE = '00000000-0000-4000-8000-000000000000'

describe('post body images', () => {
  const stored = `<p>Intro</p><img src="media:${ID}" alt="Crown">`

  it('round-trips between what is stored and what the editor draws', () => {
    const editing = toEditorHtml(stored)
    expect(editing).toContain(`src="/api/admin/media/${ID}/file"`)
    expect(toStoredHtml(editing)).toBe(stored)
  })

  it('takes back an image whose src the editor made absolute', () => {
    const absolute = `<img alt="Crown" src="http://localhost:3300/api/admin/media/${ID}/file">`
    expect(toStoredHtml(absolute)).toBe(`<img alt="Crown" src="media:${ID}">`)
  })

  it('publishes the URL, and reports an image whose file is gone', () => {
    const urls = new Map([[ID, 'https://blob.example/crown.svg']])
    expect(resolveHtmlMedia(stored, urls)).toEqual({
      html: '<p>Intro</p><img src="https://blob.example/crown.svg" alt="Crown">',
      missing: [],
    })
    expect(resolveHtmlMedia(`<img src="media:${GONE}">`, urls).missing).toEqual([GONE])
  })

  it('lists the files a body uses', () => {
    expect(htmlMediaIds(stored)).toEqual([ID])
  })
})

describe('sanitizePostHtml', () => {
  it('keeps what the toolbar makes', () => {
    const html =
      '<h2>Why</h2><p><strong>Bold</strong> and <em>quiet</em> and <code>code</code>.</p>' +
      '<pre class="language-ts"><code>const a = 1</code></pre>' +
      '<blockquote><p>Quote</p></blockquote><ul><li>One</li></ul>' +
      '<p><a href="https://norav.dev">link</a></p>' +
      `<p><img src="/api/admin/media/${ID}/file" alt="Crown"></p>`
    const clean = sanitizePostHtml(html)
    expect(clean).toContain('<h2>Why</h2>')
    expect(clean).toContain('<pre class="language-ts"><code>const a = 1</code></pre>')
    expect(clean).toContain('<a href="https://norav.dev">link</a>')
    expect(clean).toContain(`<img src="media:${ID}" alt="Crown" />`)
  })

  it('strips what could run, and the styling a paste brings with it', () => {
    const clean = sanitizePostHtml(
      '<p style="color:red" class="x" onclick="alert(1)">Hi<script>alert(1)</script></p>' +
        '<a href="javascript:alert(1)">bad</a><img src="data:image/svg+xml;base64,AA" onerror="x">' +
        '<iframe src="https://evil.example"></iframe><span style="font-size:40px">big</span>',
    )
    expect(clean).not.toMatch(/script|onclick|onerror|style=|class=|javascript:|data:|iframe/i)
    expect(clean).toContain('<p>Hi</p>')
    expect(clean).toContain('big')
  })

  it('turns a pasted title into a section heading, and drops empty paragraphs', () => {
    expect(sanitizePostHtml('<h1>Title</h1><p> </p><p>Body</p>')).toBe('<h2>Title</h2><p>Body</p>')
  })
})

describe('slugify and reading time', () => {
  it('makes an address from a title', () => {
    expect(slugify('Content pipelines, without a CMS framework!')).toBe(
      'content-pipelines-without-a-cms-framework',
    )
    expect(slugify('Café résumé')).toBe('cafe-resume')
  })

  it('counts minutes, never zero', () => {
    expect(readingMinutes('<p>short</p>')).toBe(1)
    expect(readingMinutes(`<p>${'word '.repeat(1100)}</p>`)).toBe(5)
  })
})
