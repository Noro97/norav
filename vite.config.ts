import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { apiDevPlugin } from './vite-api-plugin'
import { profilePlugin } from './vite-profile-plugin'
import { previewLikeVercelPlugin } from './vite-preview-plugin'

/**
 * Preloads the baked snapshot beside the entry script. The snapshot is a chunk of its
 * own (src/content/baked.ts), and without this the browser would only ask for it once
 * the entry had run, a round trip later, and hydration would wait for it.
 */
function preloadSnapshotPlugin(): Plugin {
  return {
    name: 'norav:preload-snapshot',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        const chunk = Object.values(bundle ?? {}).find(
          (output) => output.type === 'chunk' && output.facadeModuleId?.endsWith('/src/content/snapshot.en.json'),
        )
        if (!chunk) throw new Error('[preload-snapshot] the build has no chunk for src/content/snapshot.en.json')
        return [{ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: true, href: `/${chunk.fileName}` }, injectTo: 'head' }]
      },
    },
  }
}

export default defineConfig(({ mode, isPreview }) => {
  // Load .env so ANTHROPIC_API_KEY is available in process.env for the dev plugin
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
  // No SPA fallback in `vite preview`. See vite-preview-plugin.ts.
  appType: isPreview ? 'mpa' : 'spa',
  plugins: [react(), apiDevPlugin(), profilePlugin(), previewLikeVercelPlugin(), preloadSnapshotPlugin()],
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
