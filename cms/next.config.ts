import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The shared schema is consumed as TypeScript source, like app code.
  transpilePackages: ['@norav/content-schema'],
  // Native/WASM database drivers must not be bundled.
  serverExternalPackages: ['pg', '@electric-sql/pglite'],
  // The repo root, so file tracing keeps ../db/migrations and ../packages.
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  poweredByHeader: false,
  // Same reason as the tsconfig `zod` path: webpack resolves from the linked
  // package's real location, which sits outside this app's node_modules.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      zod: path.join(process.cwd(), 'node_modules', 'zod'),
    }
    return config
  },
}

export default nextConfig
