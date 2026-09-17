import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@norav/content-schema': resolve(__dirname, './packages/content-schema/src'),
      '@norav/design-tokens': resolve(__dirname, './packages/design-tokens/src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    css: false,
    include: ['src/**/*.test.{ts,tsx}', 'packages/*/src/**/*.test.ts'],
  },
})
