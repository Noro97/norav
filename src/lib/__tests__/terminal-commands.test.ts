import { describe, it, expect, beforeAll } from 'vitest'
import { executeCommand } from '../terminal-commands'
import { BAKED_SNAPSHOTS } from '@/content'
import { setCurrentSnapshots } from '@/content/current'
import { DEFAULT_PROFILE } from '../../../packages/content-schema/src/profile-defaults'

// Initialize i18n before tests
beforeAll(async () => {
  await import('@/i18n')
})

describe('executeCommand', () => {
  it('returns empty array for empty input', () => {
    expect(executeCommand('')).toEqual([])
    expect(executeCommand('   ')).toEqual([])
  })

  it('returns help output for help command', () => {
    const result = executeCommand('help')
    expect(result.length).toBeGreaterThan(5)
    expect(result[0]).toEqual({ type: 'input', content: 'help' })
    // Should contain output lines
    const outputs = result.filter((l) => l.type === 'output')
    expect(outputs.length).toBeGreaterThan(5)
  })

  it('returns file listing for ls', () => {
    const result = executeCommand('ls')
    expect(result[0]).toEqual({ type: 'input', content: 'ls' })
    const contents = result.map((l) => l.content)
    expect(contents.some((c) => c.includes('nexusroute'))).toBe(true)
    expect(contents.some((c) => c.includes('stack.txt'))).toBe(true)
  })

  it('returns stack info for cat stack.txt', () => {
    const result = executeCommand('cat stack.txt')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('TypeScript')
    expect(contents).toContain('React')
    expect(contents).toContain('AI')
  })

  it('returns about info for cat about.txt', () => {
    const result = executeCommand('cat about.txt')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('Norayr Avetisyan')
    expect(contents).toContain('Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js')
  })

  it('prints exactly what it did when these facts were interface strings', () => {
    const lines = executeCommand('cat about.txt').map((l) => l.content)
    expect(lines.slice(1, 4)).toEqual([
      '',
      '  Norayr Avetisyan',
      '  Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js',
    ])
    expect(lines).toContain('  8+ years in JavaScript and TypeScript.')
    expect(lines.slice(-3)).toEqual([
      '  Currently open to senior fullstack roles',
      '  at remote EU/US product companies.',
      '',
    ])

    const hire = executeCommand('sudo hire').map((l) => l.content).join('\n')
    for (const row of [
      '✉  noroavetisyan@gmail.com',
      '◆  github.com/Noro97',
      '●  linkedin.com/in/norayravetisyan',
      '✈  t.me/antarber',
    ]) {
      expect(hire).toContain(row)
    }
  })

  it('reads the facts from the published snapshot', () => {
    const published = {
      ...BAKED_SNAPSHOTS.en,
      settings: {
        ...BAKED_SNAPSHOTS.en.settings,
        profile: {
          ...DEFAULT_PROFILE,
          name: 'Someone Else',
          email: 'someone@example.com',
          availability: 'Not looking right now',
          links: { ...DEFAULT_PROFILE.links, telegram: '' },
        },
      },
    }
    setCurrentSnapshots({ en: published, ru: published })
    try {
      const about = executeCommand('cat about.txt').map((l) => l.content)
      expect(about).toContain('  Someone Else')
      expect(about).toContain('  Currently not looking right now.')

      const hire = executeCommand('sudo hire').map((l) => l.content).join('\n')
      expect(hire).toContain('someone@example.com')
      expect(hire).not.toContain('t.me')
    } finally {
      setCurrentSnapshots(BAKED_SNAPSHOTS)
    }
  })

  it('returns experience for cat experience.txt', () => {
    const result = executeCommand('cat experience.txt')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('2025')
    expect(contents).toContain('Vizogen')
  })

  it('handles missing file for cat', () => {
    const result = executeCommand('cat nonexistent.txt')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('No such file')
  })

  it('handles cat without arguments', () => {
    const result = executeCommand('cat')
    expect(result.length).toBeGreaterThan(1)
  })

  it('returns date for date command', () => {
    const result = executeCommand('date')
    expect(result.length).toBeGreaterThan(1)
  })

  it('echoes text back', () => {
    const result = executeCommand('echo hello world')
    expect(result.some((l) => l.content === 'hello world')).toBe(true)
  })

  it('returns visitor info for whoami', () => {
    const result = executeCommand('whoami')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('visitor')
  })

  it('returns system info for neofetch', () => {
    const result = executeCommand('neofetch')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('React')
    expect(contents).toContain('TypeScript')
  })

  it('returns CLEAR signal for clear', () => {
    const result = executeCommand('clear')
    expect(result).toEqual([{ type: 'input', content: 'CLEAR' }])
  })

  it('returns contact info for sudo hire', () => {
    const result = executeCommand('sudo hire')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('noroavetisyan@gmail.com')
  })

  it('returns not found for unknown commands', () => {
    const result = executeCommand('foobar')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents.toLowerCase()).toContain('not found')
  })

  // `ask` is switched off while the account behind it has no credit. These two
  // describe that state; when ASK_ENABLED goes back to true they are what has
  // to change with it, which is the point of testing the behaviour rather than
  // the constant.
  it('says ask is switched off rather than reaching the network', () => {
    const result = executeCommand('ask What skills does he have?')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('switched off')
    // The marker is what makes useTerminal call the endpoint. Its absence is
    // the difference between a command that is off and one that is broken.
    expect(result.some((l) => l.content.startsWith('__ASK__'))).toBe(false)
  })

  it('leaves ask out of help while it is off', () => {
    const contents = executeCommand('help')
      .map((l) => l.content)
      .join('\n')
    expect(contents).not.toContain('ask ')
  })

  it('is case-insensitive for commands', () => {
    const result = executeCommand('HELP')
    const outputs = result.filter((l) => l.type === 'output')
    expect(outputs.length).toBeGreaterThan(0)
  })
})
