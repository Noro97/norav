import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname, '../..')
const STATIC_IMPORT = /^(?:import|export)\s+(?!type\b)(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/gm

function resolveLocal(from: string, specifier: string): string | undefined {
  const base = specifier.startsWith('@/') ? join(SRC, specifier.slice(2)) : resolve(dirname(from), specifier)
  return ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].map((end) => base + end).find((path) => existsSync(path) && statSync(path).isFile())
}

/**
 * Everything the first page loads before any lazy chunk: what main.tsx reaches by static
 * imports. `packages` maps each package to a file that imports it; `files` holds every
 * local file reached, JSON included.
 */
function entryGraph() {
  const packages = new Map<string, string>()
  const seen = new Set<string>()
  const queue = [join(SRC, 'main.tsx')]
  while (queue.length > 0) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    if (!/\.tsx?$/.test(file)) continue
    for (const [, specifier] of readFileSync(file, 'utf8').matchAll(STATIC_IMPORT)) {
      if (!specifier) continue
      if (specifier.startsWith('.') || specifier.startsWith('@/')) {
        const path = resolveLocal(file, specifier)
        if (path) queue.push(path)
      } else {
        packages.set(specifier, file.replace(SRC, 'src'))
      }
    }
  }
  return { packages, files: [...seen].map((file) => file.replace(SRC, 'src')) }
}

const entryImports = () => entryGraph().packages

describe('the first page', () => {
  it('reaches a real part of the site', () => {
    expect([...entryImports().keys()]).toContain('react-router')
  })

  it.each(['framer-motion', 'gsap', 'gsap/ScrollTrigger', '@gsap/react', 'leaflet'])('loads no %s', (name) => {
    // D11: these stay inside the widgets that need them, reached through `lazy()`.
    expect(entryImports().get(name)).toBeUndefined()
  })

  it('reaches no baked snapshot', () => {
    // The copy is its own chunk, loaded by src/content/baked.ts and preloaded beside the
    // entry, so that content and code each keep their own budget.
    expect(entryGraph().files.filter((file) => /snapshot\.\w+\.json$/.test(file))).toEqual([])
  })
})
