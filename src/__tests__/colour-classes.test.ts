import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Scanner } from '@tailwindcss/oxide'
import { beforeAll, expect, it } from 'vitest'
import { hasRuleFor, loadUtilities, root } from './stylesheet'

/**
 * Every colour class in the site's source compiles.
 *
 * The lint rejects the colour names it knows (`eslint.config.js`). This asks
 * Tailwind about everything else, so a typo in a role or a step that doesn't
 * exist fails too. It reads the source with Tailwind's own scanner, so a class
 * in a data map, a default prop or a comment counts the same as one in a
 * `className`. The kit and the tests are left out, as the lint leaves them.
 */
const COLOUR_UTILITY =
  /^(?:[^:\s]+:)*!?(?:bg|text|border(?:-[trblxyse])?|from|via|to|ring(?:-offset)?|inset-ring|shadow|inset-shadow|drop-shadow|text-shadow|fill|stroke|outline|decoration|accent|caret|divide|placeholder)-/

/** Words the scanner reads as candidates that are not classes. Say where each one is. */
const NOT_CLASSES = new Set([
  'stroke-dashoffset', // an SVG `attributeName` in OmniGrid's cache diagram
])

const isSource = (file: string) =>
  !file.includes('/portfolio-kit/') && !file.includes('/__tests__/') && !/\.test\.tsx?$/.test(file)

const found = new Map<string, string[]>()

beforeAll(async () => {
  const scanner = new Scanner({ sources: [{ base: path.join(root, 'src'), pattern: '**/*.{ts,tsx}', negated: false }] })
  for (const file of scanner.files.filter(isSource)) {
    const content = await readFile(file, 'utf8')
    for (const { candidate, position } of scanner.getCandidatesWithPositions({ content, extension: path.extname(file).slice(1) })) {
      if (!COLOUR_UTILITY.test(candidate) || NOT_CLASSES.has(candidate)) continue
      const line = content.slice(0, position).split('\n').length
      found.set(candidate, [...(found.get(candidate) ?? []), `${path.relative(root, file)}:${line}`])
    }
  }
})

it('reads the source', () => {
  expect(found.size).toBeGreaterThan(100)
})

it('compiles every colour class it finds', async () => {
  const utilities = await loadUtilities()
  const css = utilities([...found.keys()])
  const dead = [...found]
    .filter(([cls]) => !hasRuleFor(css, cls))
    .map(([cls, where]) => `${cls}  ${where.join(', ')}`)
  expect(dead, 'These compile to nothing. Name a role (docs/DESIGN_SYSTEM.md), or add a word that is not a class to NOT_CLASSES').toEqual([])
})
