import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { compile } from 'tailwindcss'

/**
 * The site's stylesheet, compiled with Tailwind's own `compile` the way the
 * build compiles it. `tokens.css` resets Tailwind's palette, so a colour
 * outside the roles compiles to nothing and the build stays green; asking the
 * compiler is the only check that cannot drift from it.
 */
const require = createRequire(import.meta.url)
export const root = path.resolve(__dirname, '../..')
const stylesheets: Record<string, string> = {
  tailwindcss: require.resolve('tailwindcss/index.css'),
  '@norav/design-tokens/tokens.css': path.join(root, 'packages/design-tokens/src/tokens.css'),
}

/** Returns a function that gives the utilities layer the candidates produce, without the rest of the stylesheet. */
export async function loadUtilities(): Promise<(candidates: string[]) => string> {
  const entry = path.join(root, 'src/index.css')
  const compiler = await compile(await readFile(entry, 'utf8'), {
    base: path.dirname(entry),
    loadStylesheet: async (id) => {
      const file = stylesheets[id]
      if (!file) throw new Error(`src/index.css imports ${id}, which this test does not resolve`)
      return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') }
    },
  })
  return (candidates) => {
    const css = compiler.build(candidates)
    const start = css.indexOf('@layer utilities {')
    return start === -1 ? '' : css.slice(start, css.indexOf('\n}\n', start) + 2)
  }
}

/** The class as it appears in a selector, escaped the way Tailwind escapes it. */
export const selectorOf = (cls: string) => '.' + cls.replace(/[^\w-]/g, (c) => `\\${c}`)

/** Whether the CSS has a rule for the class, with or without a variant around it. */
export function hasRuleFor(css: string, cls: string): boolean {
  const selector = selectorOf(cls).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  return new RegExp(`${selector}(?![\\w\\\\-])`).test(css)
}
