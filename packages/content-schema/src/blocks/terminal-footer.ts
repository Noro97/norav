import { z } from 'zod'
import { defineBlock } from '../define-block'
import { TEXT_REVEAL_OPTIONS, textReveal } from './shared'

/**
 * The terminal's narrative — what it says when it opens, who it says you are,
 * what happens when someone tries to hire you with sudo.
 *
 * The per-command output (help, ls, cat, neofetch) stays in the code's i18n
 * namespace: each of those lines is bound one-to-one to a command implemented
 * in terminal-commands.ts, and they only make sense together with it.
 */
const content = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(60),
  subtitle: z.string().max(120),
  titleBar: z.string().min(1).max(60),
  prompt: z.string().min(1).max(40),
  placeholder: z.string().max(60),
  welcome: z.array(z.object({ text: z.string().min(1).max(160) })).min(1).max(6),
  whoami: z.object({
    visitor: z.string().min(1).max(120),
    exploring: z.string().min(1).max(160),
    welcome: z.string().min(1).max(160),
    hint: z.string().min(1).max(160),
  }),
  hire: z.object({
    message: z.string().min(1).max(200),
    openTo: z.string().min(1).max(160),
    location: z.string().min(1).max(120),
    burst: z.string().min(1).max(120),
    niceTry: z.string().min(1).max(160),
  }),
  commandNotFound: z.string().min(1).max(160),
})

const settings = z.object({
  /** Applies to each command's response as it's printed — never to what the visitor typed. */
  outputTextEffect: textReveal.default('none'),
})

export const terminalFooterBlock = defineBlock({
  type: 'terminal_footer',
  label: 'Terminal footer',
  tier: 2,
  singleton: true,
  description: 'Interactive terminal that closes the page. Command output stays in code.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Contact',
      title: 'The Terminal',
      subtitle: '$ interact with this portfolio',
      titleBar: 'visitor@portfolio ~ zsh',
      prompt: 'visitor@portfolio:~$',
      placeholder: 'type a command...',
      welcome: [{ text: 'Welcome.' }],
      whoami: { visitor: '—', exploring: '—', welcome: '—', hint: '—' },
      hire: { message: '—', openTo: '—', location: '—', burst: '—', niceTry: '—' },
      commandNotFound: 'command not found: {{cmd}}',
    },
    settings: { outputTextEffect: 'none' },
  },
  form: [
    { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
    {
      field: 'outputTextEffect',
      control: 'select',
      label: 'Command output reveal',
      help: 'Applies to what the terminal prints back, not to what the visitor types.',
      source: 'settings',
      localized: false,
      options: TEXT_REVEAL_OPTIONS,
    },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'subtitle', control: 'text', label: 'Subtitle' },
    { field: 'titleBar', control: 'text', label: 'Window title', localized: false },
    { field: 'prompt', control: 'text', label: 'Prompt', localized: false },
    { field: 'placeholder', control: 'text', label: 'Input placeholder' },
    {
      field: 'welcome',
      control: 'repeater',
      label: 'Welcome lines',
      itemLabel: 'text',
      min: 1,
      max: 6,
      fields: [{ field: 'text', control: 'text', label: 'Line' }],
    },
    {
      field: 'whoami',
      control: 'group',
      label: 'whoami',
      fields: [
        { field: 'visitor', control: 'text', label: 'Visitor' },
        { field: 'exploring', control: 'text', label: 'Exploring' },
        { field: 'welcome', control: 'text', label: 'Welcome' },
        { field: 'hint', control: 'text', label: 'Hint' },
      ],
    },
    {
      field: 'hire',
      control: 'group',
      label: 'sudo hire-me',
      fields: [
        { field: 'message', control: 'text', label: 'Message' },
        { field: 'openTo', control: 'text', label: 'Open to' },
        { field: 'location', control: 'text', label: 'Location' },
        { field: 'burst', control: 'text', label: 'Burst line' },
        { field: 'niceTry', control: 'text', label: 'Nice try' },
      ],
    },
    {
      field: 'commandNotFound',
      control: 'text',
      label: 'Unknown command',
      help: 'Use {{cmd}} for what was typed.',
    },
  ],
})

export type TerminalFooterContent = z.infer<typeof content>
export type TerminalFooterSettings = z.infer<typeof settings>
