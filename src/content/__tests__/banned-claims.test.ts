import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Nothing from "Do not use" in docs/plan/facts.md comes back.
 *
 * Validation checks shape, not truth, and these have come back before: the pending
 * migrations rewrote every one of them on a copy of production, and publish passed
 * it. This covers the files a session can edit. What's in the database is the
 * runbook's job.
 *
 * Left out on purpose: `docs/`, which lists the claims in order to ban them, and
 * migrations through 0031, which can't be edited once shipped. The catch-up undoes
 * what they write.
 */
const ROOT = resolve(__dirname, '../../..')
const THIS_FILE = 'src/content/__tests__/banned-claims.test.ts'

/** One entry per row of the table, under the claim's exact words there. */
const BANNED: Record<string, RegExp[]> = {
  '98.4% verification confidence': [/98\.4/, /984 *\/ *10/],
  '92% test coverage, 27 migrations (Proof App)': [/92% *(test )?coverage/i, /\b27 migrations/i],
  '"In production" or "Shipped" for Proof App': [
    /\bproof\b[^\n]{0,80}\b(in production|shipped)\b/i,
    /\b(in production|shipped)\b[^\n]{0,80}\bproof\b/i,
  ],
  'TON payments, Web3 (TON), blockchain-integrated unlocks': [/\bTON payments/i, /\bweb3\b/i, /\bblockchain\b/i, /блокчейн/i],
  'Feb 2026 – Present for Proof App': [/Feb 2026\s*[–—-]\s*Present/i],
  'Staff, in any title or target': [/\bstaff\b/i],
  'Frontend-focused fullstack engineer, Senior Frontend Engineer / UI Architect': [
    /frontend[- ]focused/i,
    /Senior Frontend Engineer \/ UI Architect/i,
  ],
  BlazeIT: [/blazeit/i],
  'Production-ready n8n, Make, Zapier, LangChain, "Vibe Coding"': [
    /\bn8n\b/i,
    /production-ready[^\n]{0,40}\bmake\b/i,
    /\bzapier\b/i,
    /\blangchain\b/i,
    /\bvibe coding\b/i,
  ],
  '6+ years, 7+ years, six companies': [/\b[67]\+ years/i, /seven-plus/i, /\bsix companies/i],
  '42 KB bundle, sub-millisecond': [/\b42 ?KB\b/i, /sub-millisecond/i],
}

/**
 * Still there because the `workflow` and `vibecoding` blocks are, and S4 deletes
 * those. An entry that stops matching fails below, so this list only gets shorter.
 */
const UNTIL_S4: { file: string; pattern: RegExp }[] = [
  { file: 'src/components/sections/WorkflowAutomation/WorkflowAutomation.tsx', pattern: /\bn8n\b/i },
  { file: 'cms/scripts/import-content.mts', pattern: /\bn8n\b/i },
  { file: 'cms/scripts/legacy-i18n/en/workflow.json', pattern: /\bn8n\b/i },
  { file: 'cms/scripts/legacy-i18n/ru/workflow.json', pattern: /\bn8n\b/i },
  { file: 'cms/scripts/legacy-i18n/en/vibecoding.json', pattern: /\bvibe coding\b/i },
  { file: 'cms/scripts/legacy-i18n/ru/vibecoding.json', pattern: /\bvibe coding\b/i },
  { file: 'packages/content-schema/src/blocks/vibecoding.ts', pattern: /\bvibe coding\b/i },
  { file: 'packages/content-schema/src/blocks/workflow.ts', pattern: /\bn8n\b/i },
]

const TEXT = /\.(ts|tsx|js|jsx|mjs|mts|json|css|html|md|sql|svg)$/

function filesUnder(path: string): string[] {
  const full = join(ROOT, path)
  if (statSync(full).isFile()) return [path]
  return readdirSync(full, { recursive: true, encoding: 'utf8' })
    .map((name) => join(path, name))
    .filter((name) => TEXT.test(name) && statSync(join(ROOT, name)).isFile())
}

const scanned = () => [
  'index.html',
  ...filesUnder('src'),
  ...filesUnder('packages/content-schema/src'),
  'cms/scripts/seed.mts',
  'cms/scripts/import-content.mts',
  ...filesUnder('cms/scripts/legacy-i18n'),
  ...readdirSync(join(ROOT, 'db/migrations'))
    .filter((name) => name.slice(0, 4) > '0031')
    .map((name) => `db/migrations/${name}`),
]

describe('claims from "Do not use" in docs/plan/facts.md', () => {
  it('has a pattern for every row of the table', () => {
    const table = readFileSync(join(ROOT, 'docs/plan/facts.md'), 'utf8').split('## Do not use')[1]!.split('\n## ')[0]!
    const claims = table
      .split('\n')
      .filter((row) => row.startsWith('| ') && !row.startsWith('| Claim') && !row.startsWith('| ---'))
      .map((row) => row.split('|')[1]!.trim())
    expect(claims.sort()).toEqual(Object.keys(BANNED).sort())
  })

  it('appear in none of the source, the shell or the seed data', () => {
    const hits: string[] = []
    for (const file of scanned()) {
      if (file === THIS_FILE) continue
      const text = readFileSync(join(ROOT, file), 'utf8')
      for (const [claim, patterns] of Object.entries(BANNED)) {
        for (const pattern of patterns) {
          const allowed = UNTIL_S4.some((entry) => entry.file === file && entry.pattern.source === pattern.source)
          if (!allowed && pattern.test(text)) hits.push(`${relative('.', file)}: ${claim}`)
        }
      }
    }
    expect(hits).toEqual([])
  })

  it('stay on the S4 list only while they are still there', () => {
    const gone = UNTIL_S4.filter(({ file, pattern }) => !pattern.test(readFileSync(join(ROOT, file), 'utf8')))
    expect(gone).toEqual([])
  })
})
