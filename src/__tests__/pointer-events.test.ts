import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A stylesheet assertion, not a DOM one, and deliberately so: the rule this
 * guards is the reason a section is clickable at all, and jsdom does not
 * cascade `pointer-events` from a stylesheet — the tests run with `css: false`,
 * so nothing rendered here can see it.
 *
 * `main` turns pointer events off so the canvas behind the content can be
 * reached, and each block turns them back on. When that second rule named
 * `section` specifically, a block whose root was a `div` — the imported kit's
 * wrapper — inherited `none`, and every button inside it went dead with nothing
 * on the page to explain why.
 */
// Resolved from the repo root, which is where vitest runs: under jsdom
// `import.meta.url` is not a file: URL and cannot be read from.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

describe('the pointer-events contract between main and its blocks', () => {
  it('turns events off on main so the scene behind it can be reached', () => {
    expect(css).toMatch(/main\s*\{\s*pointer-events:\s*none/)
  })

  it('turns them back on for every block, whatever element it renders', () => {
    expect(css).toMatch(/main\s*>\s*\*\s*\{\s*pointer-events:\s*auto/)
    expect(css).not.toMatch(/main\s*>\s*section\s*\{\s*pointer-events:\s*auto/)
  })

  it('leaves the system cursor alone', () => {
    // The crosshair that replaced it is gone; nothing should be hiding the
    // pointer, least of all with `!important` across every element.
    expect(css).not.toMatch(/cursor:\s*none/)
  })
})
