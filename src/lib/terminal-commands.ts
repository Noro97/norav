import type { TerminalLine } from '@/types'
import i18n from '@/i18n'

type CommandHandler = (args: string[]) => string[]

const t = (key: string) => i18n.t(key, { ns: 'terminal' })

const COMMANDS: Record<string, CommandHandler> = {
  help: () => [
    '',
    t('help.title'),
    '',
    t('help.help'),
    t('help.ls'),
    t('help.cat'),
    t('help.whoami'),
    t('help.date'),
    t('help.echo'),
    t('help.neofetch'),
    t('help.sudo'),
    t('help.clear'),
    '',
    t('help.hint'),
    '',
  ],

  ls: (args) => {
    if (args[0] === 'projects' || args.length === 0) {
      return [
        '',
        t('ls.total'),
        t('ls.nexusroute'),
        t('ls.merchforge'),
        t('ls.filtergraph'),
        '',
        t('ls.stacktxt'),
        t('ls.abouttxt'),
        t('ls.experiencetxt'),
        '',
      ]
    }
    if (args[0] === '-la' || args[0] === '-a') {
      return [
        '',
        'total 6',
        'drwxr-xr-x  .               .',
        'drwxr-xr-x  ..              ..',
        '-rw-------  .env            [HIDDEN]',
        t('ls.nexusroute'),
        t('ls.merchforge'),
        t('ls.filtergraph'),
        t('ls.stacktxt'),
        t('ls.abouttxt'),
        t('ls.experiencetxt'),
        '',
      ]
    }
    return [`ls: cannot access '${args[0]}': No such file or directory`]
  },

  cat: (args) => {
    const file = args[0]

    if (file === 'stack.txt') {
      return [
        '',
        '╭──────────────────────────────────────────╮',
        '│' + t('cat.stack.title') + '                     │',
        '╰──────────────────────────────────────────╯',
        '',
        t('cat.stack.languages'),
        t('cat.stack.frameworks'),
        t('cat.stack.animation'),
        t('cat.stack.3d'),
        t('cat.stack.state'),
        t('cat.stack.styling'),
        t('cat.stack.build'),
        t('cat.stack.maps'),
        t('cat.stack.testing'),
        t('cat.stack.cicd'),
        t('cat.stack.databases'),
        '',
      ]
    }

    if (file === 'about.txt') {
      return [
        '',
        t('cat.about.name'),
        t('cat.about.role'),
        '',
        t('cat.about.bio1'),
        t('cat.about.bio2'),
        t('cat.about.bio3'),
        '',
        t('cat.about.bio4'),
        t('cat.about.bio5'),
        t('cat.about.bio6'),
        t('cat.about.bio7'),
        '',
        t('cat.about.bio8'),
        t('cat.about.bio9'),
        '',
      ]
    }

    if (file === 'experience.txt') {
      return [
        '',
        t('cat.experience.title'),
        '  ──────────────────────────────────',
        '',
        t('cat.experience.entry0.title'),
        t('cat.experience.entry0.line1'),
        t('cat.experience.entry0.line2'),
        t('cat.experience.entry0.line3'),
        '',
        t('cat.experience.entry1.title'),
        t('cat.experience.entry1.line1'),
        t('cat.experience.entry1.line2'),
        t('cat.experience.entry1.line3'),
        '',
        t('cat.experience.entry2.title'),
        t('cat.experience.entry2.line1'),
        t('cat.experience.entry2.line2'),
        '',
      ]
    }

    if (!file) {
      return [t('cat.missingFile'), t('cat.missingFileHint')]
    }

    return [`cat: ${file}: No such file or directory`]
  },

  whoami: () => [
    '',
    t('whoami.visitor'),
    '',
    t('whoami.exploring'),
    t('whoami.welcome'),
    '',
    t('whoami.hint'),
    '',
  ],

  date: () => [
    '',
    `  ${new Date().toLocaleString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`,
    '',
  ],

  echo: (args) => [args.join(' ')],

  neofetch: () => [
    '',
    '                    visitor@portfolio',
    '    ╱╲              ─────────────────',
    '   ╱  ╲             ' + t('neofetch.os'),
    '  ╱    ╲            ' + t('neofetch.host'),
    ' ╱  AM  ╲           ' + t('neofetch.kernel'),
    ' ╲      ╱           ' + t('neofetch.shell'),
    '  ╲    ╱            ' + t('neofetch.de'),
    '   ╲  ╱             ' + t('neofetch.wm'),
    '    ╲╱              ' + t('neofetch.gpu'),
    '                    ' + t('neofetch.memory'),
    '                    ' + t('neofetch.uptime'),
    '                    ' + t('neofetch.packages'),
    '',
    '    ██ ██ ██ ██ ██',
    '',
  ],

  pwd: () => ['/home/visitor/portfolio'],

  cd: (args) => {
    if (!args[0]) return ['']
    return [`cd: no such directory: ${args[0]}`]
  },

  sudo: (args) => {
    if (args[0] === 'hire') {
      return [
        '',
        '  ┌─────────────────────────────────────┐',
        '  │                                     │',
        '  │   ' + t('sudo.hire.message') + '       │',
        '  │                                     │',
        '  │   ✉  alex@mercer.dev                │',
        '  │   ◆  github.com/alexmercer          │',
        '  │   ●  linkedin.com/in/alexmercer     │',
        '  │                                     │',
        '  │   ' + t('sudo.hire.openTo') + '     │',
        '  │   ' + t('sudo.hire.location') + '       │',
        '  │                                     │',
        '  └─────────────────────────────────────┘',
        '',
        '  ' + t('sudo.hire.burst'),
        '',
      ]
    }
    if (args[0] === 'rm' || args[0] === 'su') {
      return [t('sudo.niceTry')]
    }
    return [`sudo: ${args.join(' ')}: command not found`]
  },

  // 'clear' is handled as a special case in executeCommand
}

export function executeCommand(input: string): TerminalLine[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  const parts = trimmed.split(/\s+/)
  const cmd = parts[0]!.toLowerCase()
  const args = parts.slice(1)

  if (cmd === 'clear') {
    return [{ type: 'input', content: 'CLEAR' }]
  }

  const result: TerminalLine[] = [{ type: 'input', content: trimmed }]

  const handler = COMMANDS[cmd]
  if (handler) {
    const output = handler(args)
    output.forEach((line) => {
      result.push({ type: 'output', content: line })
    })
  } else {
    result.push({
      type: 'output',
      content: i18n.t('terminal:commandNotFound', { cmd }),
    })
  }

  return result
}

export function shouldTriggerBurst(input: string): boolean {
  return input.trim().toLowerCase() === 'sudo hire'
}
