import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * The design system, enforced.
 *
 * Tailwind's own palette and type scale are switched off in `src/index.css`,
 * so a class like `text-emerald-400` or `text-xs` already compiles to nothing
 * — but nothing is a silent failure. These rules make it a loud one, and add
 * the two things the stylesheet cannot catch: a hex literal in a `style`
 * object, and an arbitrary value (`text-[11px]`, `bg-[#ff5f57]`) that would
 * have compiled fine. What is allowed is in docs/DESIGN_SYSTEM.md.
 */
const COLOUR_PREFIX = '(?:bg|text|border|from|via|to|ring|shadow|fill|stroke|outline|decoration|accent|caret|divide|placeholder)'
const OFF_SYSTEM_COLOUR =
  '(?:white|black|crimson|cyan|gold|emerald|green|blue|sky|amber|yellow|red|rose|violet|purple|indigo|orange|pink|teal|lime|zinc|gray|slate|neutral|stone|fuchsia|background|card|foreground|muted|accent|input)(?:-\\d+)?(?![\\w-])'
const OFF_SYSTEM_TYPE = '(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|font-(?:serif|thin|extralight|light|bold|extrabold)|text-\\[|font-\\[)(?![\\w-])'

const designSystemRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector: `JSXAttribute[name.name="className"] Literal[value=/(^|\\s|:)${COLOUR_PREFIX}-${OFF_SYSTEM_COLOUR}/]`,
      message:
        'Off-system colour. Use the three roles — primary-*, secondary-*, tertiary-{bg,card,raised,fg,muted,line,line-soft,ink,shade} — or status-* for state (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/(^|\\s|:)${COLOUR_PREFIX}-${OFF_SYSTEM_COLOUR}/]`,
      message:
        'Off-system colour. Use the three roles — primary-*, secondary-*, tertiary-{bg,card,raised,fg,muted,line,line-soft,ink,shade} — or status-* for state (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector: `JSXAttribute[name.name="className"] Literal[value=/(^|\\s|:)${OFF_SYSTEM_TYPE}/]`,
      message:
        'Off-system type. Sizes are text-display-{2xl..sm}, text-body-{lg..xs}, text-label; weights normal, medium, semibold, black (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/(^|\\s|:)${OFF_SYSTEM_TYPE}/]`,
      message:
        'Off-system type. Sizes are text-display-{2xl..sm}, text-body-{lg..xs}, text-label; weights normal, medium, semibold, black (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector: `JSXAttribute[name.name="className"] Literal[value=/(^|\\s|:)${COLOUR_PREFIX}-\\[#/]`,
      message: 'A hex colour in a class. Name the role instead (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector:
        'Property[key.name=/^(color|backgroundColor|background|borderColor|fill|stroke|stopColor|outlineColor|strokeColor|fillColor)$/] > Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
      message: 'A hex colour in a style. Read the token — readToken(\'--color-…\') or var(--color-…) (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector: 'JSXAttribute[name.name=/^(fill|stroke|color|stopColor)$/] > Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
      message: 'A hex colour on an SVG attribute. Use var(--color-…) (docs/DESIGN_SYSTEM.md).',
    },
    {
      selector: 'JSXAttribute[name.name="fontFamily"] > Literal[value!=/^var\\(--font-/], Property[key.name="fontFamily"] > Literal[value!=/^var\\(--font-/]',
      message: 'A font family by name. Use the font-sans / font-display / font-mono utilities, or var(--font-…) where a class cannot reach (docs/DESIGN_SYSTEM.md).',
    },
  ],
}

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      ...designSystemRules,
    },
  },
  {
    // Tests pass colours as fixtures and assert on what came out; they are
    // not components and do not paint anything.
    files: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    // Imported wholesale from the portfolio project and kept verbatim so a
    // re-sync stays a copy rather than a merge. Linted for the mistakes that
    // would break it — an undeclared name, a hook called conditionally — but
    // not held to this repo's conventions: rewriting it to taste would turn
    // every future sync into a conflict.
    files: ['src/components/portfolio-kit/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      // The browser globals these sections reach for. Spelled out rather than
      // pulled from `globals`, which is not a dependency of this repo.
      globals: Object.fromEntries(
        [
          'document',
          'window',
          'navigator',
          'performance',
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
          'requestAnimationFrame',
          'cancelAnimationFrame',
          'IntersectionObserver',
          'ResizeObserver',
        ].map((name) => [name, 'readonly']),
      ),
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
)
