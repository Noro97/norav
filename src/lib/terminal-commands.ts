import type { TerminalLine } from '@/types'
import i18n from '@/i18n'
import { currentBlockContent, currentSettings } from '@/content/current'
import { bareUrl, profileOf, wrapWords } from '@/lib/profile'
import type { TerminalFooterContent } from '@norav/content-schema'

type CommandHandler = (args: string[]) => string[]

const t = (key: string) => i18n.t(key, { ns: 'terminal' })

/**
 * The terminal's narrative comes from the CMS; its per-command output stays in
 * the i18n namespace beside the commands themselves. Reached without a hook —
 * these are plain functions called from an event handler.
 */
const copy = () => currentBlockContent<TerminalFooterContent>('terminal_footer', i18n.language)

const profile = () => profileOf(currentSettings())

/**
 * Whether the terminal offers `ask`.
 *
 * Off while the Anthropic account behind it has no credit. The endpoint, its
 * rate limit and its error messages are all deployed and working — the only
 * thing between them and an answer is billing — but a command that can only
 * fail is worse than one that is not offered, so it is neither listed in help
 * nor left to reach the network.
 *
 * Turn it back on by flipping this to true. Nothing else needs changing.
 */
const ASK_ENABLED = false

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
    ...(ASK_ENABLED ? [t('help.ask')] : []),
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
        t('ls.omnigrid'),
        t('ls.proof'),
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
        'total 8',
        'drwxr-xr-x  .               .',
        'drwxr-xr-x  ..              ..',
        '-rw-------  .env            [HIDDEN]',
        t('ls.nexusroute'),
        t('ls.merchforge'),
        t('ls.filtergraph'),
        t('ls.omnigrid'),
        t('ls.proof'),
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

    // Both read the profile, the facts the site's pages read, so the terminal
    // can't keep an older list than About shows.
    if (file === 'stack.txt') {
      return [
        '',
        (() => {
          const title = t('cat.stack.title')
          const w = title.length + 4
          return '╭' + '─'.repeat(w) + '╮\n│  ' + title + '  │\n╰' + '─'.repeat(w) + '╯'
        })(),
        ...profile().skills.flatMap(({ group, items }) => ['', `  ${group}`, ...wrapWords(items, 40).map((line) => `    ${line}`)]),
        '',
      ]
    }

    if (file === 'about.txt') {
      const { name, headline, thesis, location, experience, availability } = profile()
      const open = `Currently ${availability.charAt(0).toLowerCase()}${availability.slice(1)}.`
      return [
        '',
        `  ${name}`,
        `  ${headline}`,
        '',
        ...wrapWords(thesis, 40).map((line) => `  ${line}`),
        '',
        `  ${experience.summary}.`,
        ...wrapWords(`${location.city}, ${location.country} (${location.timezone}). ${location.workMode}.`, 40).map(
          (line) => `  ${line}`,
        ),
        '',
        ...wrapWords(open, 40).map((line) => `  ${line}`),
        '',
      ]
    }

    if (file === 'experience.txt') {
      return [
        '',
        t('cat.experience.title'),
        '  ──────────────────────────────────',
        '',
        ...profile().roles.flatMap(({ role, company, dates, highlights }) => [
          `  ${dates}`,
          ...wrapWords(`${role} @ ${company}`, 48).map((line) => `  ${line}`),
          ...highlights.flatMap(({ text }) =>
            wrapWords(text, 44).map((line, i) => `${i === 0 ? '    - ' : '      '}${line}`),
          ),
          '',
        ]),
      ]
    }

    if (!file) {
      return [t('cat.missingFile'), t('cat.missingFileHint')]
    }

    return [`cat: ${file}: No such file or directory`]
  },

  whoami: () => [
    '',
    copy()?.whoami.visitor ?? '',
    '',
    copy()?.whoami.exploring ?? '',
    copy()?.whoami.welcome ?? '',
    '',
    copy()?.whoami.hint ?? '',
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
      const { email, links } = profile()
      const rows = [
        '',
        '   ' + (copy()?.hire.message ?? ''),
        '',
        `   ✉  ${email}`,
        `   ◆  ${bareUrl(links.github)}`,
        `   ●  ${bareUrl(links.linkedin)}`,
        ...(links.telegram ? [`   ✈  ${bareUrl(links.telegram)}`] : []),
        '',
        '   ' + (copy()?.hire.openTo ?? ''),
        '   ' + (copy()?.hire.location ?? ''),
        '',
      ]
      const w = Math.max(...rows.map((r) => r.length)) + 2
      const top = '  ┌' + '─'.repeat(w) + '┐'
      const bot = '  └' + '─'.repeat(w) + '┘'
      const boxed = rows.map((r) => '  │' + r + ' '.repeat(w - r.length) + '│')

      return ['', top, ...boxed, bot, '']
    }
    if (args[0] === 'rm' || args[0] === 'su') {
      return [copy()?.hire.niceTry ?? '']
    }
    return [`sudo: ${args.join(' ')}: command not found`]
  },

  ask: (args) => {
    if (!ASK_ENABLED) {
      return ['', '  ask is switched off on this deployment.', '']
    }
    if (args.length === 0) {
      return ['', '  Usage: ask <question>', '  Example: ask What projects demonstrate real-time data?', '']
    }
    // Return a special marker — async handling is done in useTerminal
    return ['__ASK__' + args.join(' ')]
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
      content: (copy()?.commandNotFound ?? 'command not found: {{cmd}}').replace('{{cmd}}', cmd),
    })
  }

  return result
}
