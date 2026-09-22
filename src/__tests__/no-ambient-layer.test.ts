import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A source assertion rather than a DOM one, for the same reason the old
 * pointer-events test was: the layers this guards against were lazy imports
 * behind Suspense, which a jsdom render never resolves. Reading the file is
 * the honest check.
 */
const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8')
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

describe('the app shell has no ambient layer', () => {
  it('imports none of the background canvases or the scene', () => {
    for (const name of ['AnimatedGrain', 'DynamicGrid', 'FloatingArtifacts', 'SceneController']) {
      expect(app).not.toContain(name)
    }
  })

  it('no longer turns pointer events off on main — there is nothing behind it to reach', () => {
    expect(css).not.toMatch(/main\s*\{\s*pointer-events:\s*none/)
  })
})
