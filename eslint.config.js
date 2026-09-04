import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

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
    },
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
