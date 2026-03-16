import type { TerminalLine } from '@/types'

type CommandHandler = (args: string[]) => string[]

const COMMANDS: Record<string, CommandHandler> = {
  help: () => [
    '',
    'Available commands:',
    '',
    '  help              Show this help message',
    '  ls [projects]     List portfolio projects',
    '  cat <file>        Read a file (stack.txt, about.txt, experience.txt)',
    '  whoami            Who are you?',
    '  date              Current date',
    '  echo <text>       Print text',
    '  neofetch          System info',
    '  sudo hire         Contact me',
    '  clear             Clear terminal',
    '',
    'Try: ls, cat stack.txt, neofetch',
    '',
  ],

  ls: (args) => {
    if (args[0] === 'projects' || args.length === 0) {
      return [
        '',
        'total 3',
        'drwxr-xr-x  nexusroute/     Real-time logistics platform      [Mapbox, WebSocket, Canvas]',
        'drwxr-xr-x  merchforge/     AI merch design configurator      [React, GSAP, JSON Sync]',
        'drwxr-xr-x  filtergraph/    Faceted search + URL state        [Filters, SVG, useMemo]',
        '',
        '-rw-r--r--  stack.txt       Tech stack overview',
        '-rw-r--r--  about.txt       Bio & background',
        '-rw-r--r--  experience.txt  Work history',
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
        'drwxr-xr-x  nexusroute/     Real-time logistics platform',
        'drwxr-xr-x  merchforge/     AI merch design configurator',
        'drwxr-xr-x  filtergraph/    Faceted search + URL state',
        '-rw-r--r--  stack.txt       Tech stack overview',
        '-rw-r--r--  about.txt       Bio & background',
        '-rw-r--r--  experience.txt  Work history',
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
        '│            TECH STACK                     │',
        '╰──────────────────────────────────────────╯',
        '',
        '  Languages      TypeScript, JavaScript, GLSL, Python',
        '  Frameworks     React, Next.js, Vue 3, Nuxt',
        '  Animation      GSAP, Framer Motion, Lenis, Three.js',
        '  3D / WebGL     React Three Fiber, Custom Shaders',
        '  State          Zustand, Redux Toolkit, Pinia',
        '  Styling        Tailwind CSS, CSS Modules, Styled Components',
        '  Build          Vite, Turbopack, Webpack, esbuild',
        '  Maps           Mapbox GL, Leaflet, Deck.gl',
        '  Testing        Vitest, Playwright, Cypress, Jest',
        '  CI/CD          GitHub Actions, Vercel, Docker',
        '  Databases      PostgreSQL, Redis, Firebase',
        '',
      ]
    }

    if (file === 'about.txt') {
      return [
        '',
        '  Alex Mercer',
        '  Senior Frontend Engineer',
        '',
        '  Building high-performance web applications with',
        '  focus on real-time systems, data visualization,',
        '  and interactive 3D experiences.',
        '',
        '  6+ years shipping production code at scale.',
        '  Previously at fintech startups and logistics',
        '  platforms. Passionate about WebGL, animation',
        '  systems, and developer experience.',
        '',
        '  Currently open to senior / staff opportunities',
        '  at companies pushing frontend boundaries.',
        '',
      ]
    }

    if (file === 'experience.txt') {
      return [
        '',
        '  EXPERIENCE',
        '  ──────────────────────────────────',
        '',
        '  2022-present  Senior Frontend Engineer @ NexusLogistics',
        '                - Led real-time dashboard (50K+ events/sec)',
        '                - Built Mapbox-based fleet visualization',
        '                - Reduced bundle size by 42%',
        '',
        '  2020-2022     Frontend Engineer @ MerchStack',
        '                - Built AI-powered product configurator',
        '                - React + Zustand + GSAP animation system',
        '                - Served 2M+ monthly active users',
        '',
        '  2019-2020     Junior Developer @ DataViz Co.',
        '                - D3.js dashboards and chart components',
        '                - First exposure to WebGL & shaders',
        '',
      ]
    }

    if (!file) {
      return ['cat: missing file operand', "Try 'cat stack.txt' or 'cat about.txt'"]
    }

    return [`cat: ${file}: No such file or directory`]
  },

  whoami: () => [
    '',
    '  visitor',
    '',
    '  You\'re exploring Alex Mercer\'s portfolio.',
    '  Curious minds are always welcome here.',
    '',
    '  Try: cat about.txt, neofetch, sudo hire',
    '',
  ],

  date: () => [
    '',
    `  ${new Date().toLocaleString('en-US', {
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
    '   ╱  ╲             OS: Portfolio OS 2.0',
    '  ╱    ╲            Host: React 19 + Vite 6',
    ' ╱  AM  ╲           Kernel: TypeScript 5.9 (strict)',
    ' ╲      ╱           Shell: zsh 5.9',
    '  ╲    ╱            DE: Tailwind CSS 4.1',
    '   ╲  ╱             WM: GSAP ScrollTrigger',
    '    ╲╱              GPU: Three.js + R3F + GLSL',
    '                    Memory: Zustand (lightweight)',
    '                    Uptime: since 2019',
    '                    Packages: 216 (npm)',
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
        '  │   Let\'s build something great.       │',
        '  │                                     │',
        '  │   ✉  alex@mercer.dev                │',
        '  │   ◆  github.com/alexmercer          │',
        '  │   ●  linkedin.com/in/alexmercer     │',
        '  │                                     │',
        '  │   Open to: Senior / Staff roles     │',
        '  │   Location: Remote / SF / NYC       │',
        '  │                                     │',
        '  └─────────────────────────────────────┘',
        '',
        '  ✦ PARTICLE BURST ACTIVATED ✦',
        '',
      ]
    }
    if (args[0] === 'rm' || args[0] === 'su') {
      return ['Nice try. ;)']
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
      content: `command not found: ${cmd}. Type 'help' for available commands.`,
    })
  }

  return result
}

export function shouldTriggerBurst(input: string): boolean {
  return input.trim().toLowerCase() === 'sudo hire'
}
