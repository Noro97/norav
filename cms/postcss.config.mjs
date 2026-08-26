/**
 * The CMS uses plain CSS. This file exists so Next stops looking for a PostCSS
 * config further up the tree and picks up the site's Tailwind pipeline, which
 * it cannot even parse (the repo root is ESM, this package is not).
 */
export default { plugins: {} }
