import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { apiDevPlugin } from './vite-api-plugin'
import { profilePlugin } from './vite-profile-plugin'
import { previewLikeVercelPlugin } from './vite-preview-plugin'

export default defineConfig(({ mode, isPreview }) => {
  // Load .env so ANTHROPIC_API_KEY is available in process.env for the dev plugin
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
  // No SPA fallback in `vite preview`. See vite-preview-plugin.ts.
  appType: isPreview ? 'mpa' : 'spa',
  plugins: [react(), apiDevPlugin(), profilePlugin(), previewLikeVercelPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Workspace package consumed as source: Vite transpiles it like app code,
      // so the shared schema needs no build step of its own.
      '@norav/content-schema': path.resolve(__dirname, './packages/content-schema/src'),
      '@norav/design-tokens': path.resolve(__dirname, './packages/design-tokens/src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
}
})
