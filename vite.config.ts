import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { apiDevPlugin } from './vite-api-plugin'

export default defineConfig(({ mode }) => {
  // Load .env so ANTHROPIC_API_KEY is available in process.env for the dev plugin
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
  plugins: [react(), apiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Workspace package consumed as source: Vite transpiles it like app code,
      // so the shared schema needs no build step of its own.
      '@norav/content-schema': path.resolve(__dirname, './packages/content-schema/src'),
    },
  },
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
          gmaps: ['@googlemaps/js-api-loader'],
          spline: ['@splinetool/react-spline', '@splinetool/runtime'],
          motion: ['framer-motion'],
        },
      },
    },
  },
}
})
