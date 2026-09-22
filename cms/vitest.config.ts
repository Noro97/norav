import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * The CMS is its own package with its own lockfile, so it needs its own test
 * config — without one, vitest walks up and finds the site's, which expects a
 * setup file that does not exist here.
 */
export default defineConfig({
  resolve: {
    // The same `@/` the app uses, so a route can be tested as it is written.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
