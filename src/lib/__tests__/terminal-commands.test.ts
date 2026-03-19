import { describe, it, expect, beforeAll } from 'vitest'
import { executeCommand, shouldTriggerBurst } from '../terminal-commands'

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
    expect(contents).toContain('Frontend + AI Engineer')
  })

  it('returns experience for cat experience.txt', () => {
    const result = executeCommand('cat experience.txt')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('2022')
    expect(contents).toContain('NexusLogistics')
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

  it('handles ask command without arguments', () => {
    const result = executeCommand('ask')
    const contents = result.map((l) => l.content).join('\n')
    expect(contents).toContain('Usage')
  })

  it('returns ask marker for ask with question', () => {
    const result = executeCommand('ask What skills does he have?')
    const outputs = result.filter((l) => l.type === 'output')
    expect(outputs.some((l) => l.content.startsWith('__ASK__'))).toBe(true)
  })

  it('is case-insensitive for commands', () => {
    const result = executeCommand('HELP')
    const outputs = result.filter((l) => l.type === 'output')
    expect(outputs.length).toBeGreaterThan(0)
  })
})

describe('shouldTriggerBurst', () => {
  it('returns true for sudo hire', () => {
    expect(shouldTriggerBurst('sudo hire')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(shouldTriggerBurst('SUDO HIRE')).toBe(true)
    expect(shouldTriggerBurst('Sudo Hire')).toBe(true)
  })

  it('handles whitespace', () => {
    expect(shouldTriggerBurst('  sudo hire  ')).toBe(true)
  })

  it('returns false for other commands', () => {
    expect(shouldTriggerBurst('help')).toBe(false)
    expect(shouldTriggerBurst('sudo rm')).toBe(false)
  })
})
