import { defineConfig } from 'vitest/config'

/**
 * The CMS is its own package with its own lockfile, so it needs its own test
 * config — without one, vitest walks up and finds the site's, which expects a
 * setup file that does not exist here.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
